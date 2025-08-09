import { ActivityGenerationPayload, GeneratedActivity } from '../types/ActivityTypes';
import { generateActivityByType } from '../generationStrategies/generateActivityByType';

export const generateActivityAPI = async (payload: ActivityGenerationPayload): Promise<GeneratedActivity> => {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Determinar o tipo de atividade baseado no ID ou título
    let activityType = payload.activityType;

    if (!activityType) {
      if (payload.activityId.includes('prova') || payload.title.toLowerCase().includes('prova')) {
        activityType = 'prova';
      } else if (payload.activityId.includes('lista') || payload.title.toLowerCase().includes('lista')) {
        activityType = 'lista-exercicios';
      } else if (payload.activityId.includes('jogo') || payload.title.toLowerCase().includes('jogo')) {
        activityType = 'jogo';
      } else if (payload.activityId.includes('video') || payload.title.toLowerCase().includes('vídeo')) {
        activityType = 'video';
      } else {
        activityType = 'lista-exercicios'; // padrão
      }
    }

    // Gerar atividade usando estratégias específicas
    const result = generateActivityByType(activityType as any, payload);

    return result;
  } catch (error) {
    console.error('Erro ao gerar atividade:', error);
    throw new Error('Falha na geração da atividade');
  }
};

export const validateActivityData = (data: ActivityGenerationPayload): string[] => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Título é obrigatório');
  }

  if (!data.description?.trim()) {
    errors.push('Descrição é obrigatória');
  }

  if (!data.subject?.trim()) {
    errors.push('Disciplina deve ser selecionada');
  }

  if (!data.theme?.trim()) {
    errors.push('Tema é obrigatório');
  }

  if (!data.schoolYear?.trim()) {
    errors.push('Ano de Escolaridade é obrigatório');
  }

  return errors;
};

import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { API_KEYS } from '../../../../config/apiKeys';
import { GeminiClient } from '../../../../utils/api/geminiClient';

export const generateActivityData = async (
  activity: ActionPlanItem,
  contextualizationData?: any
): Promise<any> => {
  try {
    console.log('🤖 Gerando dados da atividade via IA:', activity.title);

    const prompt = buildActivityPrompt(activity, contextualizationData);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEYS.GEMINI}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;

    if (!generatedText) {
      throw new Error('Resposta vazia da IA');
    }

    // Processar resposta e extrair dados estruturados
    const parsedData = parseActivityResponse(generatedText, activity);

    console.log('✅ Dados da atividade gerados:', parsedData);
    return parsedData;

  } catch (error) {
    console.error('❌ Erro ao gerar dados da atividade:', error);
    return null;
  }
};

const buildActivityPrompt = (activity: ActionPlanItem, contextualizationData?: any): string => {
  const context = contextualizationData ? {
    materias: contextualizationData.materias || '',
    publicoAlvo: contextualizationData.publicoAlvo || '',
    restricoes: contextualizationData.restricoes || '',
    datasImportantes: contextualizationData.datasImportantes || '',
    observacoes: contextualizationData.observacoes || ''
  } : {};

  return `
# Geração de Atividade Educacional

## Contexto da Atividade:
- **Título**: ${activity.title}
- **Descrição**: ${activity.description}
- **Tipo**: ${activity.id}

## Contexto Educacional:
- **Matérias**: ${context.materias}
- **Público-alvo**: ${context.publicoAlvo}
- **Restrições**: ${context.restricoes}
- **Datas Importantes**: ${context.datasImportantes}
- **Observações**: ${context.observacoes}

## Instruções:
Gere uma atividade educacional completa e detalhada seguindo exatamente esta estrutura JSON:

\`\`\`json
{
  "titulo": "Título específico e atrativo para a atividade",
  "descricao": "Descrição detalhada do que será trabalhado",
  "disciplina": "Disciplina principal",
  "dificuldade": "Básica/Intermediária/Avançada",
  "formatoEntrega": "PDF/Word/Online/Manuscrito",
  "duracao": "Tempo estimado em minutos",
  "objetivos": "Objetivos de aprendizagem específicos",
  "materiais": "Lista de materiais necessários",
  "instrucoes": "Instruções detalhadas para realização",
  "conteudo": "Conteúdo principal da atividade",
  "observacoes": "Observações importantes ou dicas"
}
\`\`\`

**IMPORTANTE**:
- Responda APENAS com o JSON válido, sem texto adicional
- Adapte todos os campos ao contexto fornecido
- Seja específico e prático
- Garanta que a atividade seja adequada ao público-alvo
`;
};

const parseActivityResponse = (response: string, activity: ActionPlanItem): any => {
  try {
    // Extrair JSON da resposta
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
      response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonString = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonString);
    }

    // Fallback: tentar parsear a resposta inteira como JSON
    return JSON.parse(response);

  } catch (error) {
    console.warn('Erro ao parsear JSON, usando dados básicos:', error);

    // Fallback com dados básicos
    return {
      titulo: activity.title,
      descricao: activity.description,
      disciplina: "Não especificada",
      dificuldade: "Intermediária",
      formatoEntrega: "PDF",
      duracao: "45 minutos",
      objetivos: "Desenvolver conhecimentos sobre o tema proposto",
      materiais: "Material de escrita e pesquisa",
      instrucoes: "Seguir as orientações fornecidas",
      conteudo: response,
      observacoes: "Atividade gerada automaticamente"
    };
  }
};

export { buildActivityPrompt, parseActivityResponse };

// Função principal de geração de conteúdo que será usada pelo modal e construção automática
export const generateActivityContent = async (
  activityType: string,
  contextData: any
): Promise<any> => {
  try {
    console.log('🤖 Iniciando geração de conteúdo com Gemini para:', activityType);
    console.log('📋 Dados de contexto completos:', JSON.stringify(contextData, null, 2));

    const geminiClient = new GeminiClient();

    // Prompt específico para Lista de Exercícios
    let prompt = '';

    if (activityType === 'lista-exercicios') {
      // Importar o prompt específico
      const { buildListaExerciciosPrompt } = await import('../../prompts/listaExerciciosPrompt');
      prompt = buildListaExerciciosPrompt(contextData);
      console.log('📝 Prompt gerado para lista de exercícios:', prompt.substring(0, 500) + '...');
    } else if (activityType === 'plano-aula') {
      // Atualizar AI prompt to ensure development steps are generated
      const prompt = `
        Como especialista em educação, crie um plano de aula COMPLETO E DETALHADO com base nas seguintes informações:

        **Dados do Formulário:**
        - Disciplina: ${contextData.subject}
        - Tema: ${contextData.theme}
        - Ano/Série: ${contextData.schoolYear}
        - Tempo de aula: ${contextData.timeLimit}
        - Nível de dificuldade: ${contextData.difficultyLevel}
        - Descrição/Contexto: ${contextData.description}
        - Objetivos: ${contextData.objectives}
        - Materiais disponíveis: ${contextData.materials}
        - Competências BNCC: ${contextData.competencies}
        - Critérios de avaliação: ${contextData.evaluation}

        **FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):**
        {
          "titulo": "Título do plano de aula",
          "disciplina": "${contextData.subject}",
          "tema": "${contextData.theme}",
          "serie": "${contextData.schoolYear}",
          "tempo": "${contextData.timeLimit}",
          "visao_geral": {
            "disciplina": "${contextData.subject}",
            "tema": "${contextData.theme}",
            "serie": "${contextData.schoolYear}",
            "tempo": "${contextData.timeLimit}",
            "metodologia": "Metodologia pedagógica utilizada",
            "recursos": ["Lista", "de", "recursos"],
            "sugestoes_ia": ["Sugestões", "personalizadas"]
          },
          "objetivos": [
            {
              "descricao": "Objetivo específico de aprendizagem",
              "habilidade_bncc": "Código BNCC relacionado",
              "sugestao_reescrita": "Sugestão de melhoria",
              "atividade_relacionada": "Atividade que desenvolve este objetivo"
            }
          ],
          "metodologia": {
            "nome": "Nome da metodologia",
            "descricao": "Descrição detalhada da abordagem pedagógica",
            "alternativas": ["Método 1", "Método 2"],
            "simulacao_de_aula": "Descrição da simulação",
            "explicacao_em_video": "Descrição do vídeo explicativo"
          },
          "desenvolvimento": [
            {
              "etapa": 1,
              "titulo": "1. Introdução e Contextualização",
              "descricao": "Descrição detalhada e específica da etapa de introdução relacionada ao tema ${contextData.theme}",
              "tipo_interacao": "Apresentação + debate",
              "tempo_estimado": "15 minutos",
              "recurso_gerado": "Slides",
              "nota_privada_professor": "Orientação específica para o professor sobre esta etapa"
            },
            {
              "etapa": 2,
              "titulo": "2. Desenvolvimento Principal",
              "descricao": "Descrição detalhada e específica do desenvolvimento principal sobre ${contextData.theme}",
              "tipo_interacao": "Atividade prática",
              "tempo_estimado": "25 minutos",
              "recurso_gerado": "Material didático",
              "nota_privada_professor": "Orientação específica para o professor sobre esta etapa"
            },
            {
              "etapa": 3,
              "titulo": "3. Síntese e Avaliação",
              "descricao": "Descrição detalhada e específica da síntese e avaliação sobre ${contextData.theme}",
              "tipo_interacao": "Avaliação formativa",
              "tempo_estimado": "10 minutos",
              "recurso_gerado": "Questionário",
              "nota_privada_professor": "Orientação específica para o professor sobre esta etapa"
            }
          ],
          "atividades": [
            {
              "nome": "Nome da atividade",
              "tipo": "Tipo da atividade",
              "ref_objetivos": [1, 2],
              "visualizar_como_aluno": "Como o aluno verá esta atividade",
              "sugestoes_ia": ["Sugestão 1", "Sugestão 2"]
            }
          ],
          "avaliacao": {
            "criterios": "Critérios de avaliação",
            "instrumentos": ["Instrumento 1", "Instrumento 2"],
            "feedback": "Tipo de feedback"
          }
        }

        **INSTRUÇÕES ESPECÍFICAS PARA ETAPAS DE DESENVOLVIMENTO:**
        1. OBRIGATÓRIO: Crie pelo menos 3 etapas detalhadas no array "desenvolvimento"
        2. Cada etapa DEVE ter:
           - titulo: Nome claro da etapa (ex: "1. Introdução e Contextualização")
           - descricao: Explicação detalhada do que será feito nesta etapa (mínimo 100 caracteres)
           - tipo_interacao: Tipo específico (ex: "Apresentação + debate", "Atividade prática", "Discussão em grupo")
           - tempo_estimado: Tempo específico em minutos (ex: "15 minutos")
           - recurso_gerado: Recurso ou material utilizado (ex: "Slides", "Material impresso", "Vídeo")
           - nota_privada_professor: Orientação específica para o professor
        3. O conteúdo de cada etapa deve ser 100% personalizado para "${contextData.theme}"
        4. Use metodologias ativas e diversifique os tipos de interação
        5. O tempo total das etapas deve somar aproximadamente ${contextData.timeLimit}
        6. Responda APENAS em JSON válido, sem texto adicional

        IMPORTANTE: As etapas devem ser específicas para o tema "${contextData.theme}" e não genéricas!
      `;
      console.log('📝 Prompt gerado para plano de aula:', prompt.substring(0, 500) + '...');
    } else {
      // Prompt genérico para outros tipos de atividade
      prompt = `
Crie o conteúdo educacional para uma atividade do tipo "${activityType}" com base no seguinte contexto:

CONTEXTO:
${JSON.stringify(contextData, null, 2)}

FORMATO: Responda em JSON estruturado com todos os campos relevantes para o tipo de atividade solicitado.
REQUISITOS: Conteúdo educativo, bem estruturado e adequado ao contexto fornecido.

Responda APENAS com o JSON, sem texto adicional.`;
    }

    console.log('📤 Enviando prompt para Gemini...');

    const response = await geminiClient.generate({
      prompt,
      temperature: 0.7,
      maxTokens: 4000,
      topP: 0.9,
      topK: 40
    });

    if (response.success) {
      console.log('✅ Resposta recebida do Gemini');
      console.log('📊 Estimativa de tokens:', response.estimatedTokens);
      console.log('💰 Custo estimado:', response.estimatedPowerCost);
      console.log('⏱️ Tempo de execução:', response.executionTime + 'ms');

      // Limpar a resposta para garantir que seja JSON válido
      let cleanedResponse = response.result.trim();

      console.log('🔧 Resposta bruta da IA (primeiros 1000 chars):', cleanedResponse.substring(0, 1000));

      // Múltiplas tentativas de limpeza
      // 1. Remover markdown
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      cleanedResponse = cleanedResponse.replace(/```\s*/g, '');

      // 2. Remover possíveis textos antes e depois do JSON
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }

      // 3. Verificar se começa e termina com { }
      if (!cleanedResponse.trim().startsWith('{')) {
        const firstBrace = cleanedResponse.indexOf('{');
        if (firstBrace !== -1) {
          cleanedResponse = cleanedResponse.substring(firstBrace);
        }
      }

      if (!cleanedResponse.trim().endsWith('}')) {
        const lastBrace = cleanedResponse.lastIndexOf('}');
        if (lastBrace !== -1) {
          cleanedResponse = cleanedResponse.substring(0, lastBrace + 1);
        }
      }

      console.log('🔧 Resposta limpa para parsing (primeiros 500 chars):', cleanedResponse.substring(0, 500));

      let parsedResult;
      try {
        parsedResult = JSON.parse(cleanedResponse);
        console.log('✅ Resultado parseado com sucesso');
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('📄 Conteúdo que causou erro (primeiros 1000 chars):', cleanedResponse.substring(0, 1000));

        // Tentar extrair JSON de forma mais agressiva
        try {
          // Buscar por padrões JSON válidos
          const jsonPattern = /\{[\s\S]*\}/;
          const match = cleanedResponse.match(jsonPattern);

          if (match) {
            const extractedJson = match[0];
            console.log('🔄 Tentando JSON extraído:', extractedJson.substring(0, 200));
            parsedResult = JSON.parse(extractedJson);
            console.log('✅ Segunda tentativa de parse bem sucedida');
          } else {
            throw new Error('Nenhum padrão JSON encontrado');
          }
        } catch (secondError) {
          console.error('❌ Segunda tentativa de parse também falhou:', secondError);
          throw new Error(`Erro ao processar resposta da IA: Falha ao parsear JSON. ${secondError.message}`);
        }
      }

      console.log('📊 Estrutura do resultado:', {
        hasTitle: !!parsedResult.titulo,
        hasDisciplina: !!parsedResult.disciplina,
        hasTema: !!parsedResult.tema,
        hasQuestoes: !!parsedResult.questoes,
        questoesLength: parsedResult.questoes ? parsedResult.questoes.length : 0,
        keys: Object.keys(parsedResult)
      });

      // Validação rigorosa para lista de exercícios
      if (activityType === 'lista-exercicios') {
        // Verificar se tem questões
        if (!parsedResult.questoes || !Array.isArray(parsedResult.questoes)) {
          console.error('❌ Estrutura de questões inválida');
          throw new Error('Campo questoes não encontrado ou não é um array');
        }

        if (parsedResult.questoes.length === 0) {
          console.error('❌ Nenhuma questão gerada pela IA');
          throw new Error('Array de questões está vazio');
        }

        // Validar cada questão
        const questoesValidas = parsedResult.questoes.every((questao: any, index: number) => {
          const isValid = questao.id && questao.type && questao.enunciado;
          if (!isValid) {
            console.error(`❌ Questão ${index + 1} inválida:`, questao);
          }
          return isValid;
        });

        if (!questoesValidas) {
          throw new Error('Algumas questões geradas pela IA são inválidas');
        }

        console.log(`📝 ${parsedResult.questoes.length} questões válidas geradas pela IA`);
        console.log('📄 Primeira questão como exemplo:', parsedResult.questoes[0]);

        // Marcar como gerado pela IA
        parsedResult.isGeneratedByAI = true;
        parsedResult.generatedAt = new Date().toISOString();

        // Garantir que todos os campos necessários existem
        parsedResult.titulo = parsedResult.titulo || contextData.titulo || contextData.title || 'Lista de Exercícios';
        parsedResult.disciplina = parsedResult.disciplina || contextData.disciplina || contextData.subject || 'Disciplina';
        parsedResult.tema = parsedResult.tema || contextData.tema || contextData.theme || 'Tema';
        parsedResult.numeroQuestoes = parsedResult.questoes.length;
      }

      // Add logic to extract development steps from AI response
      const extractEtapasFromAIData = (aiResponse: any): any[] => {
        if (aiResponse && aiResponse.desenvolvimento && Array.isArray(aiResponse.desenvolvimento)) {
          // Mapear para o formato esperado, garantindo que todos os campos existam
          return aiResponse.desenvolvimento.map((etapa: any, index: number) => ({
            etapa: index + 1,
            titulo: etapa.titulo || `Etapa ${index + 1}`,
            descricao: etapa.descricao || 'Descrição da etapa',
            tipo_interacao: etapa.tipo_interacao || 'Atividade',
            tempo_estimado: etapa.tempo_estimado || '30 minutos',
            recurso_gerado: etapa.recurso_gerado || 'Material de apoio',
            nota_privada_professor: etapa.nota_privada_professor || 'Observação para o professor'
          }));
        }
        return [];
      };

      const etapasDesenvolvimento = extractEtapasFromAIData(parsedResult) || [
        {
          etapa: 1,
          titulo: '1. Introdução e Contextualização',
          descricao: 'Apresentação do conteúdo principal da aula com contextualização histórica e relevância atual',
          tipo_interacao: 'Apresentação + debate',
          tempo_estimado: '15 minutos',
          recurso_gerado: 'Slides',
          nota_privada_professor: 'Verificar conhecimento prévio dos alunos'
        },
        {
          etapa: 2,
          titulo: '2. Desenvolvimento Principal',
          descricao: 'Exploração detalhada do conteúdo com exemplos práticos e exercícios interativos',
          tipo_interacao: 'Atividade prática',
          tempo_estimado: '25 minutos',
          recurso_gerado: 'Material didático',
          nota_privada_professor: 'Acompanhar individualmente os alunos'
        },
        {
          etapa: 3,
          titulo: '3. Síntese e Avaliação',
          descricao: 'Consolidação do aprendizado e verificação da compreensão através de atividades avaliativas',
          tipo_interacao: 'Avaliação formativa',
          tempo_estimado: '10 minutos',
          recurso_gerado: 'Questionário',
          nota_privada_professor: 'Identificar dificuldades para próxima aula'
        }
      ];

      // Garantir que a estrutura de plano de aula inclua as etapas de desenvolvimento geradas
      if (activityType === 'plano-aula') {
        parsedResult.desenvolvimento = etapasDesenvolvimento;
      }

      return parsedResult;

    } else {
      console.error('❌ Erro na API Gemini:', response.error);
      throw new Error(response.error || 'Falha na geração de conteúdo');
    }

  } catch (error) {
    console.error('❌ Erro crítico ao gerar conteúdo da atividade:', error);
    throw error;
  }
};

export async function generateActivity(formData: any): Promise<{ success: boolean; content?: string; error?: string }> {
  console.log('🎯 generateActivity: Iniciando geração com formData:', formData);

  let generatedContent: any;

  // Lógica para determinar o tipo de atividade e gerar conteúdo específico
  switch (formData.typeId) {
    case 'lista-exercicios':
      // Lógica para gerar lista de exercícios
      generatedContent = {
        titulo: formData.title || 'Lista de Exercícios',
        descricao: formData.description || 'Exercícios para praticar o conteúdo.',
        disciplina: formData.subject || 'Matemática',
        tema: formData.theme || 'Tópico específico',
        numeroQuestoes: parseInt(formData.numberOfQuestions) || 5,
        nivelDificuldade: formData.difficultyLevel || 'Intermediário',
        questoes: formData.questions || [] // Assumindo que formData.questions é um array de questões
      };
      break;
    case 'prova':
      // Lógica para gerar prova
      generatedContent = {
        titulo: formData.title || 'Avaliação',
        descricao: formData.description || 'Avaliação de conhecimentos sobre o tema.',
        disciplina: formData.subject || 'Matemática',
        tema: formData.theme || 'Tópico específico',
        tempoLimite: formData.timeLimit || '60 minutos',
        pontuacaoTotal: parseInt(formData.totalScore) || 10,
        questoes: formData.questions || [] // Assumindo que formData.questions é um array de questões
      };
      break;
    case 'plano-aula':
      // Estrutura específica para plano de aula com formato completo
      const materiaisList = Array.isArray(formData.materials) ? formData.materials :
        (formData.materials ? [formData.materials] : ['Quadro branco ou projetor',
          'Marcadores ou canetas para quadro branco',
          'Material impresso com exercícios',
          'Calculadora (se necessário)',
          'Livro didático',
          'Notebook/tablet para apresentação']);

      const objetivosList = Array.isArray(formData.objectives) ? formData.objectives :
        (formData.objectives ? formData.objectives.split('.').filter(obj => obj.trim()) :
          ['Compreender o conceito do ' + (formData.theme || 'tema'),
          'Identificar os principais elementos do conteúdo',
          'Aplicar os conhecimentos em situações práticas',
          'Resolver problemas relacionados ao tema',
          'Desenvolver o raciocínio lógico e a capacidade de resolução de problemas']);

      // Add logic to extract development steps from AI response
      const extractEtapasFromAIData = (aiResponse: any): any[] => {
        if (aiResponse && aiResponse.desenvolvimento && Array.isArray(aiResponse.desenvolvimento)) {
          // Mapear para o formato esperado, garantindo que todos os campos existam
          return aiResponse.desenvolvimento.map((etapa: any, index: number) => ({
            etapa: index + 1,
            titulo: etapa.titulo || `Etapa ${index + 1}`,
            descricao: etapa.descricao || 'Descrição da etapa',
            tipo_interacao: etapa.tipo_interacao || 'Atividade',
            tempo_estimado: etapa.tempo_estimado || '30 minutos',
            recurso_gerado: etapa.recurso_gerado || 'Material de apoio',
            nota_privada_professor: etapa.nota_privada_professor || 'Observação para o professor'
          }));
        }
        return [];
      };

      const aiResponse = await generateActivityContent('plano-aula', formData); // Chama a função para gerar o conteúdo da IA
      const etapasDesenvolvimento = extractEtapasFromAIData(aiResponse) || [
        {
          etapa: 1,
          titulo: '1. Introdução ao Tema',
          descricao: 'Apresentação do conteúdo principal da aula com contextualização histórica e relevância atual',
          tipo_interacao: 'Apresentação + discussão',
          tempo_estimado: '15 minutos',
          recurso_gerado: 'Slides introdutórios',
          nota_privada_professor: 'Verificar conhecimento prévio dos alunos'
        },
        {
          etapa: 2,
          titulo: '2. Desenvolvimento Principal',
          descricao: 'Exploração detalhada do conteúdo com exemplos práticos e exercícios interativos',
          tipo_interacao: 'Atividade prática',
          tempo_estimado: '25 minutos',
          recurso_gerado: 'Material didático interativo',
          nota_privada_professor: 'Acompanhar individualmente os alunos'
        },
        {
          etapa: 3,
          titulo: '3. Síntese e Avaliação',
          descricao: 'Consolidação do aprendizado e verificação da compreensão através de atividades avaliativas',
          tipo_interacao: 'Avaliação formativa',
          tempo_estimado: '10 minutos',
          recurso_gerado: 'Questionário de verificação',
          nota_privada_professor: 'Identificar dificuldades para próxima aula'
        }
      ];

      console.log('📋 Dados processados para geração:', {
        materiaisList,
        objetivosList,
        etapasDesenvolvimento,
        formData
      });

      generatedContent = {
        titulo: formData.title || 'Plano de Aula',
        descricao: formData.description || 'Descrição do plano de aula',
        disciplina: formData.subject || 'Disciplina',
        tema: formData.theme || 'Tema da aula',
        anoEscolaridade: formData.schoolYear || 'Ano escolar',
        numeroQuestoes: parseInt(formData.numberOfQuestions) || 10,
        nivelDificuldade: formData.difficultyLevel || 'Médio',
        modeloQuestoes: formData.questionModel || 'Múltipla escolha',
        fontes: Array.isArray(formData.sources) ? formData.sources :
          formData.sources ? formData.sources.split(',').map(s => s.trim()) :
            ['Livro didático de ' + (formData.subject || 'Disciplina') + ' do ' + (formData.schoolYear || 'ano'),
            'Vídeos explicativos sobre ' + (formData.theme || 'o tema') + ' (Khan Academy, YouTube)',
            'Sites educativos sobre ' + (formData.subject?.toLowerCase() || 'a disciplina') + ' (Brasil Escola, Mundo Educação)'],
        objetivos: objetivosList.map((obj, index) => ({
          descricao: obj,
          habilidade_bncc: formData.competencies || 'Competência BNCC relacionada',
          sugestao_reescrita: 'Sugestão de melhoria disponível',
          atividade_relacionada: 'Atividade ' + (index + 1)
        })),
        metodologia: {
          nome: formData.difficultyLevel || 'Metodologia Ativa',
          descricao: formData.description || 'Metodologia baseada em participação ativa dos alunos',
          alternativas: ['Aula expositiva', 'Atividades práticas', 'Discussão em grupo'],
          simulacao_de_aula: 'Simulação interativa disponível',
          explicacao_em_video: 'Vídeo explicativo da metodologia'
        },
        // Ensure AI generates proper development steps data
        desenvolvimento: etapasDesenvolvimento,
        atividades: [
          {
            nome: 'Atividade de Fixação',
            tipo: 'Exercícios Práticos',
            ref_objetivos: [1, 2],
            visualizar_como_aluno: 'Exercícios interativos para consolidação',
            sugestoes_ia: ['Adapte a dificuldade conforme o desempenho', 'Inclua exemplos contextualizados']
          }
        ],
        avaliacao: {
          criterios: formData.evaluation || 'Participação, compreensão dos conceitos, resolução de exercícios',
          instrumentos: ['Observação direta', 'Exercícios práticos', 'Participação oral'],
          feedback: 'Feedback imediato durante as atividades'
        },
        recursos_extras: {
          materiais_complementares: ['Vídeos educativos', 'Jogos didáticos online', 'Simuladores'],
          tecnologias: ['Quadro interativo', 'Projetor', 'Computador/tablet'],
          referencias: ['Livro didático adotado', 'Artigos científicos', 'Sites educacionais']
        }
      };
      break;
    default:
      // Lógica padrão para outros tipos de atividade (ou se não especificado)
      generatedContent = {
        titulo: formData.title || 'Atividade Gerada',
        descricao: formData.description || 'Descrição padrão da atividade.',
        disciplina: formData.subject || 'Geral',
        tema: formData.theme || 'Tema geral',
        conteudo: formData.content || 'Conteúdo a ser definido.'
      };
      break;
  }

  // Simular geração da atividade usando uma função auxiliar
  // O conteúdo gerado aqui pode ser um JSON ou uma string formatada dependendo do tipo
  const formattedContent = await generateSimpleActivityContent(generatedContent);

  if (formattedContent) {
    console.log('✅ Atividade gerada com sucesso');
    return {
      success: true,
      content: formattedContent
    };
  } else {
    throw new Error('Falha na geração do conteúdo');
  }

}

// Função auxiliar para evitar conflito de nomes e formatar o conteúdo
async function generateSimpleActivityContent(activityData: any): Promise<string> {
  console.log('🔨 Gerando conteúdo da atividade:', activityData.titulo || activityData.title);

  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verificar se o conteúdo é um objeto JSON (como plano de aula, lista de exercícios etc.)
  if (typeof activityData === 'object' && activityData !== null && !Array.isArray(activityData)) {
    // Se for um objeto JSON, serializar para string
    try {
      // Remover campos não necessários para a visualização simples ou adaptar conforme necessário
      const displayData = { ...activityData };
      delete displayData.competencias;
      delete displayData.contextoAplicacao;
      delete displayData.recursos_extras;
      delete displayData.avaliacao;
      delete displayData.atividades;
      delete displayData.metodologia;
      delete displayData.visao_geral;

      // Ensure AI generates proper development steps data
      // Desenvolvimento array is now correctly populated from extracted data or default
      if (activityData.desenvolvimento && Array.isArray(activityData.desenvolvimento)) {
        // Ensure the development steps have the correct design
        displayData.desenvolvimento = activityData.desenvolvimento.map((etapa: any) => ({
          titulo: etapa.titulo,
          descricao: etapa.descricao,
          tipo_interacao: etapa.tipo_interacao,
          tempo_estimado: etapa.tempo_estimado,
          recurso_gerado: etapa.recurso_gerado,
          // nota_privada_professor is not meant for student view, so it can be omitted or handled differently if needed
        }));
      }


      return JSON.stringify(displayData, null, 2);
    } catch (error) {
      console.error("Erro ao serializar dados da atividade para JSON:", error);
      // Fallback para um template genérico se a serialização falhar
      return `
# ${activityData.titulo || activityData.title || 'Atividade'}

## Descrição
${activityData.descricao || activityData.description || 'Sem descrição'}

## Detalhes
- Disciplina: ${activityData.disciplina || 'Não especificada'}
- Tema: ${activityData.tema || activityData.theme || 'Não especificado'}
- Duração: ${activityData.tempoLimite || activityData.duracao || 'Não especificada'}

*Erro ao formatar dados detalhados.*
      `;
    }
  } else {
    // Se não for um objeto JSON (ex: string simples de conteúdo), retorna como está
    return activityData;
  }
}
import { ActivityGenerationPayload, GeneratedActivity } from '../types/ActivityTypes';
import { generateActivityByType } from '../generationStrategies/generateActivityByType';
import { sequenciaDidaticaGenerator, SequenciaDidaticaGeneratedContent } from '../activities/sequencia-didatica/SequenciaDidaticaGenerator';
import { SequenciaDidaticaPromptData } from '../prompts/sequenciaDidaticaPrompt';

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
      } else if (payload.activityId.includes('sequencia') || payload.title.toLowerCase().includes('sequência')) {
        activityType = 'sequencia-didatica';
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
    } else if (activityType === 'sequencia-didatica') {
      // Importar o prompt específico para Sequência Didática
      const { buildSequenciaDidaticaPrompt } = await import('../../prompts/sequenciaDidaticaPrompt');
      prompt = buildSequenciaDidaticaPrompt(contextData as SequenciaDidaticaPromptData);
      console.log('📝 Prompt gerado para sequência didática:', prompt.substring(0, 500) + '...');
    }
    else {
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

      try {
        const parsedResult = JSON.parse(cleanedResponse);
        console.log('✅ Resultado parseado com sucesso');
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
        } else if (activityType === 'sequencia-didatica') {
          // Validação específica para Sequência Didática
          if (!parsedResult.aulas || !Array.isArray(parsedResult.aulas)) {
            console.error('❌ Estrutura de aulas inválida para Sequência Didática');
            throw new Error('Campo aulas não encontrado ou não é um array');
          }

          const aulasValidas = parsedResult.aulas.every((aula: any, index: number) => {
            const isValid = aula.titulo && aula.tipo && aula.objetivo && aula.resumo;
            if (!isValid) {
              console.error(`❌ Aula ${index + 1} inválida na Sequência Didática:`, aula);
            }
            return isValid;
          });

          if (!aulasValidas) {
            throw new Error('Algumas aulas geradas pela IA para a Sequência Didática são inválidas');
          }

          console.log(`📚 ${parsedResult.aulas.length} aulas válidas geradas pela IA para Sequência Didática`);
          parsedResult.isGeneratedByAI = true;
          parsedResult.generatedAt = new Date().toISOString();
          parsedResult.titulo = parsedResult.titulo || contextData.titulo || contextData.title || 'Sequência Didática';
          parsedResult.disciplina = parsedResult.disciplina || contextData.disciplina || contextData.subject || 'Disciplina';
          parsedResult.tema = parsedResult.tema || contextData.tema || contextData.theme || 'Tema';
        }

        return parsedResult;
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
            const secondAttempt = JSON.parse(extractedJson);
            console.log('✅ Segunda tentativa de parse bem sucedida');

            // Aplicar mesmas validações
            if (activityType === 'lista-exercicios') {
              if (secondAttempt.questoes && Array.isArray(secondAttempt.questoes) && secondAttempt.questoes.length > 0) {
                secondAttempt.isGeneratedByAI = true;
                secondAttempt.generatedAt = new Date().toISOString();
                return secondAttempt;
              }
            } else if (activityType === 'sequencia-didatica') {
              if (secondAttempt.aulas && Array.isArray(secondAttempt.aulas) && secondAttempt.aulas.length > 0) {
                secondAttempt.isGeneratedByAI = true;
                secondAttempt.generatedAt = new Date().toISOString();
                return secondAttempt;
              }
            }

            return secondAttempt;
          }
        } catch (secondError) {
          console.error('❌ Segunda tentativa de parse também falhou:', secondError);
        }

        throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`);
      }

    } else {
      console.error('❌ Erro na API Gemini:', response.error);
      throw new Error(response.error || 'Falha na geração de conteúdo');
    }

  } catch (error) {
    console.error('❌ Erro crítico ao gerar conteúdo da atividade:', error);
    throw error;
  }
};

// Função auxiliar para gerar o conteúdo da atividade de Sequência Didática
async function generateSequenciaDidaticaContent(contextData: SequenciaDidaticaPromptData): Promise<SequenciaDidaticaGeneratedContent> {
  console.log('🧬 Iniciando geração de Sequência Didática com Gemini...');
  const geminiClient = new GeminiClient();

  const prompt = await sequenciaDidaticaGenerator.buildPrompt(contextData);

  console.log('📝 Prompt para Sequência Didática:', prompt.substring(0, 500) + '...');

  const response = await geminiClient.generate({
    prompt,
    temperature: 0.8,
    maxTokens: 4000,
    topP: 0.9,
    topK: 40
  });

  if (response.success) {
    console.log('✅ Resposta recebida do Gemini para Sequência Didática');
    let cleanedResponse = response.result.trim();

    // Limpeza específica para a resposta de Sequência Didática
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }

    try {
      const parsedData = JSON.parse(cleanedResponse) as SequenciaDidaticaGeneratedContent;

      // Validação básica
      if (!parsedData.aulas || !Array.isArray(parsedData.aulas) || parsedData.aulas.length === 0) {
        throw new Error('Estrutura de aulas inválida ou vazia na resposta da IA.');
      }

      parsedData.aulas.forEach((aula: any, index: number) => {
        if (!aula.titulo || !aula.tipo || !aula.objetivo || !aula.resumo) {
          console.warn(`Aula ${index + 1} na Sequência Didática está incompleta:`, aula);
        }
      });

      parsedData.isGeneratedByAI = true;
      parsedData.generatedAt = new Date().toISOString();

      console.log('✅ Sequência Didática gerada com sucesso!');
      return parsedData;

    } catch (parseError) {
      console.error('❌ Erro ao parsear a resposta da Sequência Didática:', parseError);
      console.error('Conteúdo para parse:', cleanedResponse);
      throw new Error('Falha ao processar a resposta da IA para Sequência Didática.');
    }

  } else {
    console.error('❌ Erro na API Gemini para Sequência Didática:', response.error);
    throw new Error(response.error || 'Falha na geração da Sequência Didática.');
  }
}


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
      const objetivosList = Array.isArray(formData.objectives) ? formData.objectives :
                           formData.objectives ? formData.objectives.split('.').filter(obj => obj.trim()) :
                           ['Compreender o conceito do ' + (formData.theme || 'tema'),
                            'Identificar os principais elementos do conteúdo',
                            'Aplicar os conhecimentos em situações práticas',
                            'Resolver problemas relacionados ao tema',
                            'Desenvolver o raciocínio lógico e a capacidade de resolução de problemas'];

      const materiaisList = Array.isArray(formData.materials) ? formData.materials :
                            formData.materials ? formData.materials.split(',').map(m => m.trim()) :
                            ['Quadro branco ou projetor',
                             'Marcadores ou canetas para quadro branco',
                             'Material impresso com exercícios',
                             'Calculadora (se necessário)',
                             'Livro didático',
                             'Notebook/tablet para apresentação'];

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
        objetivos: objetivosList,
        materiais: materiaisList,
        instrucoes: formData.instructions || 'Siga as etapas do plano de aula conforme apresentado.',
        tempoLimite: formData.timeLimit || '50 minutos',
        contextoAplicacao: formData.context || 'Sala de aula regular com alunos do ' + (formData.schoolYear || 'ano especificado'),
        competencias: formData.competencies || 'Competências gerais da BNCC aplicáveis ao ' + (formData.subject || 'componente curricular'),
        avaliacao: formData.evaluation || 'Avaliação formativa através de participação e exercícios práticos',

        // Estrutura completa do plano de aula para preview
        visao_geral: {
          disciplina: formData.subject || 'Disciplina',
          tema: formData.theme || 'Tema da aula',
          serie: formData.schoolYear || 'Ano escolar',
          tempo: formData.timeLimit || '50 minutos',
          metodologia: formData.difficultyLevel || 'Metodologia Ativa',
          recursos: materiaisList,
          sugestao_ia: ['Plano de aula personalizado', 'Adaptável ao perfil da turma']
        },
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
        desenvolvimento: [
          {
            etapa: 1,
            titulo: 'Introdução ao Tema',
            descricao: 'Apresentação do conteúdo e contextualização',
            tipo_interacao: 'Expositiva/Dialogada',
            tempo_estimado: '15 minutos',
            recurso_gerado: 'Slides introdutórios',
            nota_privada_professor: 'Verificar conhecimentos prévios dos alunos'
          },
          {
            etapa: 2,
            titulo: 'Desenvolvimento do Conteúdo',
            descricao: 'Explicação detalhada dos conceitos principais',
            tipo_interacao: 'Interativa',
            tempo_estimado: '25 minutos',
            recurso_gerado: 'Material didático e exemplos',
            nota_privada_professor: 'Pausar para esclarecer dúvidas'
          },
          {
            etapa: 3,
            titulo: 'Aplicação Prática',
            descricao: 'Exercícios e atividades de fixação',
            tipo_interacao: 'Prática',
            tempo_estimado: '10 minutos',
            recurso_gerado: 'Lista de exercícios',
            nota_privada_professor: 'Circular pela sala para auxiliar individualmente'
          }
        ],
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
    case 'sequencia-didatica':
      // Lógica para gerar sequência didática
      const sequenciaDidaticaContext: SequenciaDidaticaPromptData = {
        tituloTemaAssunto: formData.title || formData.theme || 'Assunto Geral',
        anoSerie: formData.schoolYear || 'Ensino Fundamental',
        disciplina: formData.subject || 'Matemática',
        bnccCompetencias: formData.competencies || 'Competências Gerais da BNCC',
        publicoAlvo: formData.targetAudience || 'Alunos do Ensino Fundamental',
        objetivosAprendizagem: Array.isArray(formData.learningObjectives) ? formData.learningObjectives.join('. ') : formData.learningObjectives || 'Compreender o tema abordado.',
        quantidadeAulas: formData.numberOfLessons || '3',
        quantidadeDiagnosticos: formData.numberOfDiagnosticLessons || '1',
        quantidadeAvaliacoes: formData.numberOfAssessmentLessons || '1',
        cronograma: formData.schedule || 'Semanal'
      };
      generatedContent = await generateSequenciaDidaticaContent(sequenciaDidaticaContext);
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
      delete displayData.desenvolvimento;
      delete displayData.visao_geral;
      delete displayData.isGeneratedByAI;
      delete displayData.generatedAt;

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
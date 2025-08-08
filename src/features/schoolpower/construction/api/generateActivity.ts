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
      console.log('📚 Processando dados específicos de Plano de Aula');
      console.log('🗂️ Custom fields consolidados para plano-aula:', consolidatedCustomFields);

      // Processar dados do Plano de Aula com mapeamento completo
      enrichedFormData = {
        title: consolidatedData.personalizedTitle || consolidatedData.title || activity.personalizedTitle || activity.title || '',
        description: consolidatedData.personalizedDescription || consolidatedData.description || activity.personalizedDescription || activity.description || '',
        subject: consolidatedCustomFields['Componente Curricular'] ||
                 consolidatedCustomFields['disciplina'] ||
                 consolidatedCustomFields['Disciplina'] ||
                 'Matemática',
        theme: consolidatedCustomFields['Tema ou Tópico Central'] ||
               consolidatedCustomFields['Tema Central'] ||
               consolidatedCustomFields['tema'] ||
               consolidatedCustomFields['Tema'] || '',
        schoolYear: consolidatedCustomFields['Ano/Série Escolar'] ||
                   consolidatedCustomFields['Público-Alvo'] ||
                   consolidatedCustomFields['anoEscolaridade'] ||
                   consolidatedCustomFields['Ano de Escolaridade'] || '',
        numberOfQuestions: consolidatedCustomFields['Número de Questões'] || '10',
        difficultyLevel: consolidatedCustomFields['Tipo de Aula'] ||
                        consolidatedCustomFields['Metodologia'] ||
                        consolidatedCustomFields['Nível de Dificuldade'] || 'Médio',
        questionModel: consolidatedCustomFields['Modelo de Questões'] || 'Múltipla escolha',
        sources: consolidatedCustomFields['Fontes'] ||
                consolidatedCustomFields['Referencias'] ||
                'Livro didático, sites educacionais',
        objectives: consolidatedCustomFields['Objetivo Geral'] ||
                   consolidatedCustomFields['Objetivos de Aprendizagem'] ||
                   consolidatedCustomFields['Objetivo Principal'] || '',
        materials: consolidatedCustomFields['Materiais/Recursos'] ||
                  consolidatedCustomFields['Recursos'] ||
                  consolidatedCustomFields['Materiais Necessários'] || '',
        instructions: consolidatedCustomFields['Instruções'] || '',
        evaluation: consolidatedCustomFields['Observações do Professor'] ||
                   consolidatedCustomFields['Observações'] ||
                   consolidatedCustomFields['Avaliação'] || '',
        timeLimit: consolidatedCustomFields['Carga Horária'] ||
                  consolidatedCustomFields['Tempo Estimado'] ||
                  consolidatedCustomFields['Duração'] || '50 minutos',
        context: consolidatedCustomFields['Perfil da Turma'] ||
                consolidatedCustomFields['Contexto'] ||
                'Turma heterogênea com diferentes níveis de aprendizado',
        competencies: consolidatedCustomFields['Habilidades BNCC'] ||
                     consolidatedCustomFields['Competências'] ||
                     'Competências gerais da BNCC',
        // Campos específicos mantidos
        textType: '',
        textGenre: '',
        textLength: '',
        associatedQuestions: '',
        readingStrategies: '',
        visualResources: '',
        practicalActivities: '',
        wordsIncluded: '',
        gridFormat: '',
        providedHints: '',
        vocabularyContext: '',
        language: 'Português',
        associatedExercises: '',
        knowledgeArea: '',
        complexityLevel: ''
      };

      console.log('✅ FormData enriquecido para plano-aula:', enrichedFormData);

      try {
        // Usar o PlanoAulaGenerator para gerar conteúdo com IA Gemini
        console.log('🤖 Chamando PlanoAulaGenerator com Gemini');
        const { PlanoAulaGenerator } = await import('../../activities/plano-aula/PlanoAulaGenerator');
        generatedContent = await PlanoAulaGenerator.generatePlanoAula(enrichedFormData);
        console.log('✅ Conteúdo gerado pelo PlanoAulaGenerator:', generatedContent);
      } catch (error) {
        console.error('❌ Erro no PlanoAulaGenerator:', error);

        // Fallback com dados estruturados básicos
        const objetivosList = Array.isArray(enrichedFormData.objectives) ? enrichedFormData.objectives :
                             enrichedFormData.objectives ? enrichedFormData.objectives.split(',').map(obj => obj.trim()) :
                             ['Desenvolver conhecimentos fundamentais sobre ' + (enrichedFormData.theme || 'o tema'),
                              'Aplicar conceitos aprendidos em situações práticas',
                              'Promover o pensamento crítico e reflexivo'];

        const materiaisList = Array.isArray(enrichedFormData.materials) ? enrichedFormData.materials :
                             enrichedFormData.materials ? enrichedFormData.materials.split(',').map(m => m.trim()) :
                             ['Quadro branco ou projetor',
                              'Marcadores ou canetas para quadro branco',
                              'Material impresso com atividades',
                              'Livro didático',
                              'Notebook/tablet para apresentação'];

        generatedContent = {
          titulo: enrichedFormData.title || 'Plano de Aula',
          descricao: enrichedFormData.description || 'Descrição do plano de aula',
          disciplina: enrichedFormData.subject || 'Disciplina',
          tema: enrichedFormData.theme || 'Tema da aula',
          anoEscolaridade: enrichedFormData.schoolYear || 'Ano escolar',
          numeroQuestoes: parseInt(enrichedFormData.numberOfQuestions) || 10,
          nivelDificuldade: enrichedFormData.difficultyLevel || 'Médio',
          modeloQuestoes: enrichedFormData.questionModel || 'Múltipla escolha',
          fontes: Array.isArray(enrichedFormData.sources) ? enrichedFormData.sources : 
                 enrichedFormData.sources ? enrichedFormData.sources.split(',').map(s => s.trim()) : 
                 ['Livro didático de ' + (enrichedFormData.subject || 'Disciplina') + ' do ' + (enrichedFormData.schoolYear || 'ano'),
                  'Vídeos explicativos sobre ' + (enrichedFormData.theme || 'o tema') + ' (Khan Academy, YouTube)',
                  'Sites educativos sobre ' + (enrichedFormData.subject?.toLowerCase() || 'a disciplina') + ' (Brasil Escola, Mundo Educação)'],
          objetivos: objetivosList,
          materiais: materiaisList,
          instrucoes: enrichedFormData.instructions || 'Siga as etapas do plano de aula conforme apresentado.',
          tempoLimite: enrichedFormData.timeLimit || '50 minutos',
          contextoAplicacao: enrichedFormData.context || 'Sala de aula tradicional com possibilidade de trabalho em grupos',
          competencias: enrichedFormData.competencies || 'Competências gerais da BNCC aplicáveis ao ' + (enrichedFormData.subject || 'componente curricular'),
          avaliacao: enrichedFormData.evaluation || 'Avaliação formativa através de participação e exercícios práticos',

          // Estrutura completa do plano de aula para preview
          visao_geral: {
            disciplina: enrichedFormData.subject || 'Disciplina',
            tema: enrichedFormData.theme || 'Tema da aula',
            serie: enrichedFormData.schoolYear || 'Ano escolar',
            tempo: enrichedFormData.timeLimit || '50 minutos',
            metodologia: enrichedFormData.difficultyLevel || 'Metodologia Ativa',
            recursos: materiaisList,
            sugestoes_ia: ['Plano de aula personalizado', 'Adaptável ao perfil da turma']
          },
          objetivos: objetivosList.map((obj, index) => ({
            descricao: obj,
            habilidade_bncc: enrichedFormData.competencies || 'Competência BNCC relacionada',
            sugestao_reescrita: 'Sugestão de melhoria disponível',
            atividade_relacionada: 'Atividade ' + (index + 1)
          })),
          metodologia: {
            nome: enrichedFormData.difficultyLevel || 'Metodologia Ativa',
            descricao: enrichedFormData.description || 'Metodologia baseada em participação ativa dos alunos',
            alternativas: ['Aula expositiva', 'Atividades práticas', 'Discussão em grupo'],
            simulacao_de_aula: 'Simulação interativa disponível',
            explicacao_em_video: 'Vídeo explicativo da metodologia'
          },
          desenvolvimento: [
            {
              etapa: 1,
              titulo: 'Introdução',
              descricao: 'Apresentação do tema e contextualização',
              tipo_interacao: 'Expositiva',
              tempo_estimado: '15 min',
              recurso_gerado: 'Slides introdutórios',
              nota_privada_professor: 'Verificar conhecimentos prévios dos alunos'
            },
            {
              etapa: 2,
              titulo: 'Desenvolvimento',
              descricao: 'Exploração do conteúdo principal com atividades práticas',
              tipo_interacao: 'Interativa',
              tempo_estimado: '25 min',
              recurso_gerado: 'Material didático interativo',
              nota_privada_professor: 'Acompanhar participação e compreensão'
            },
            {
              etapa: 3,
              titulo: 'Conclusão',
              descricao: 'Síntese dos conceitos e avaliação',
              tipo_interacao: 'Colaborativa',
              tempo_estimado: '10 min',
              recurso_gerado: 'Atividade de fechamento',
              nota_privada_professor: 'Aplicar avaliação formativa'
            }
          ],
          atividades: [
            {
              nome: 'Atividade Principal',
              tipo: 'Prática',
              ref_objetivos: [1, 2],
              visualizar_como_aluno: 'Atividade interativa e engajante relacionada ao tema',
              sugestoes_ia: ['Personalizar conforme o nível da turma', 'Adaptar recursos disponíveis']
            }
          ],
          avaliacao: {
            criterios: enrichedFormData.evaluation || 'Participação, compreensão e aplicação dos conceitos',
            instrumentos: ['Observação direta', 'Atividades práticas', 'Questionamentos'],
            feedback: 'Feedback contínuo e construtivo durante toda a aula'
          },
          recursos_extras: {
            materiais_complementares: ['Textos de apoio', 'Exercícios complementares'],
            tecnologias: ['Projetor', 'Computador', 'Internet'],
            referencias: ['Bibliografia do componente curricular', 'Sites educacionais confiáveis']
          }
        };
      }

      console.log('📋 Conteúdo estruturado final para plano-aula:', generatedContent);
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
import { ActivityGenerationPayload, GeneratedActivity } from '../types/ActivityTypes';
import { generateActivityByType } from '../generationStrategies/generateActivityByType';
import { sequenciaDidaticaGenerator } from '../../activities/sequencia-didatica/SequenciaDidaticaGenerator';
import { SequenciaDidaticaPromptData } from '../../prompts/sequenciaDidaticaPrompt';
import { API_KEYS } from '../../../../config/apiKeys';
import { GeminiClient } from '../../../../utils/api/geminiClient';

export const generateActivityAPI = async (payload: ActivityGenerationPayload): Promise<GeneratedActivity> => {
  console.log('🚀 generateActivityAPI: Iniciando geração de atividade', payload);

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
      } else if (payload.activityId.includes('quadro') || payload.title.toLowerCase().includes('quadro')) {
        activityType = 'quadro-interativo';
      } else {
        activityType = 'lista-exercicios'; // padrão
      }
    }

    console.log('🎯 Tipo de atividade determinado:', activityType);

    // Para Sequência Didática, usar o gerador específico com IA
    if (activityType === 'sequencia-didatica') {
      console.log('📚 Gerando Sequência Didática com IA do Gemini');

      // Mapear dados do payload para o formato da Sequência Didática
      const sequenciaData: SequenciaDidaticaPromptData = {
        tituloTemaAssunto: payload.title || payload.customFields?.tituloTemaAssunto || 'Tema da Sequência',
        anoSerie: payload.schoolYear || payload.customFields?.anoSerie || 'Ensino Fundamental',
        disciplina: payload.subject || payload.customFields?.disciplina || 'Português',
        bnccCompetencias: payload.customFields?.bnccCompetencias || 'Competências da BNCC',
        publicoAlvo: payload.customFields?.publicoAlvo || 'Alunos do ensino fundamental',
        objetivosAprendizagem: payload.description || payload.customFields?.objetivosAprendizagem || 'Objetivos de aprendizagem',
        quantidadeAulas: payload.customFields?.quantidadeAulas || '4',
        quantidadeDiagnosticos: payload.customFields?.quantidadeDiagnosticos || '1',
        quantidadeAvaliacoes: payload.customFields?.quantidadeAvaliacoes || '2',
        cronograma: payload.customFields?.cronograma || 'Cronograma semanal'
      };

      console.log('📋 Dados mapeados para Sequência Didática:', sequenciaData);

      try {
        const sequenciaGerada = await sequenciaDidaticaGenerator.generateSequenciaDidatica(sequenciaData);
        console.log('✅ Sequência Didática gerada pela IA:', sequenciaGerada);

        // Salvar no localStorage com chave específica
        const storageKey = `constructed_sequencia-didatica_${payload.activityId}`;
        localStorage.setItem(storageKey, JSON.stringify(sequenciaGerada));
        console.log('💾 Sequência Didática salva no localStorage:', storageKey);

        return {
          id: payload.activityId,
          title: payload.title,
          description: payload.description,
          content: sequenciaGerada,
          type: 'sequencia-didatica',
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true
        };

      } catch (error) {
        console.error('❌ Erro ao gerar Sequência Didática:', error);
        throw new Error(`Falha na geração da Sequência Didática: ${error.message}`);
      }
    }

    // Para outros tipos, usar estratégias existentes
    const result = generateActivityByType(activityType as any, payload);
    return result;

  } catch (error) {
    console.error('❌ Erro ao gerar atividade:', error);
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

  // Validações específicas para Sequência Didática
  if (data.activityType === 'sequencia-didatica') {
    if (!data.customFields?.quantidadeAulas?.trim()) {
      errors.push('Quantidade de aulas é obrigatória');
    }
    if (!data.customFields?.quantidadeDiagnosticos?.trim()) {
      errors.push('Quantidade de diagnósticos é obrigatória');
    }
    if (!data.customFields?.quantidadeAvaliacoes?.trim()) {
      errors.push('Quantidade de avaliações é obrigatória');
    }
  }

  return errors;
};

// Função principal de geração de conteúdo que será usada pelo modal e construção automática
export const generateActivityContent = async (
  activityType: string,
  contextData: any
): Promise<any> => {
  try {
    console.log('🤖 Iniciando geração de conteúdo com Gemini para:', activityType);
    console.log('📋 Dados de contexto completos:', JSON.stringify(contextData, null, 2));

    const geminiClient = new GeminiClient();

    // Para Sequência Didática, usar gerador específico
    if (activityType === 'sequencia-didatica') {
      console.log('📚 Processando Sequência Didática com IA');

      // Mapear dados do contexto para o formato correto
      const sequenciaData: SequenciaDidaticaPromptData = {
        tituloTemaAssunto: contextData.tituloTemaAssunto || contextData.title || 'Sequência Didática',
        anoSerie: contextData.anoSerie || contextData.schoolYear || 'Ensino Fundamental',
        disciplina: contextData.disciplina || contextData.subject || 'Português',
        bnccCompetencias: contextData.bnccCompetencias || contextData.competencies || 'Competências da BNCC',
        publicoAlvo: contextData.publicoAlvo || contextData.context || 'Alunos do ensino fundamental',
        objetivosAprendizagem: contextData.objetivosAprendizagem || contextData.objectives || contextData.description || 'Objetivos de aprendizagem',
        quantidadeAulas: contextData.quantidadeAulas || '4',
        quantidadeDiagnosticos: contextData.quantidadeDiagnosticos || '1',
        quantidadeAvaliacoes: contextData.quantidadeAvaliacoes || '2',
        cronograma: contextData.cronograma || 'Cronograma semanal'
      };

      console.log('📋 Dados mapeados para Sequência Didática:', sequenciaData);

      const sequenciaGerada = await sequenciaDidaticaGenerator.generateSequenciaDidatica(sequenciaData);
      console.log('✅ Sequência Didática gerada com sucesso:', sequenciaGerada);

      return sequenciaGerada;
    }

    // Para lista de exercícios, usar prompt específico
    if (activityType === 'lista-exercicios') {
      const { buildListaExerciciosPrompt } = await import('../../prompts/listaExerciciosPrompt');
      const prompt = buildListaExerciciosPrompt(contextData);
      console.log('📝 Prompt gerado para lista de exercícios');

      const response = await geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.9,
        topK: 40
      });

      if (response.success) {
        console.log('✅ Resposta recebida do Gemini para lista de exercícios');

        // Processar resposta
        let cleanedResponse = response.result.trim();
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }

        const parsedResult = JSON.parse(cleanedResponse);

        // Validação para lista de exercícios
        if (!parsedResult.questoes || !Array.isArray(parsedResult.questoes)) {
          throw new Error('Campo questoes não encontrado ou não é um array');
        }

        if (parsedResult.questoes.length === 0) {
          throw new Error('Array de questões está vazio');
        }

        parsedResult.isGeneratedByAI = true;
        parsedResult.generatedAt = new Date().toISOString();

        return parsedResult;
      } else {
        throw new Error(response.error || 'Falha na geração de conteúdo');
      }
    }

    // Para quadro-interativo, usar prompt específico
    if (activityType === 'quadro-interativo') {
      console.log('🎯 Gerando conteúdo para quadro-interativo com dados:', contextData);

      const prompt = `
Crie um conteúdo educacional completo para um Quadro Interativo baseado nos seguintes dados:

CONTEXTO DA ATIVIDADE:
${JSON.stringify(contextData, null, 2)}

INSTRUÇÕES:
- Crie um conteúdo visual e interativo sobre o tema especificado
- O conteúdo deve ser adequado ao ano/série mencionado
- Inclua explicações claras, exemplos práticos e elementos visuais
- Organize o conteúdo de forma didática e envolvente
- Inclua seções como: conceitos principais, exemplos, exercícios práticos

FORMATO DE RESPOSTA (JSON):
{
  "titulo": "Título principal do quadro",
  "subtitulo": "Subtítulo explicativo",
  "conteudo": {
    "introducao": "Introdução ao tema com contextualização",
    "conceitosPrincipais": [
      {
        "titulo": "Nome do conceito",
        "explicacao": "Explicação detalhada",
        "exemplo": "Exemplo prático"
      }
    ],
    "exemplosPraticos": [
      "Lista de exemplos aplicados"
    ],
    "atividadesPraticas": [
      {
        "titulo": "Nome da atividade",
        "instrucoes": "Como realizar",
        "objetivo": "O que se espera alcançar"
      }
    ],
    "resumo": "Resumo dos pontos principais",
    "proximosPassos": "Sugestões para aprofundamento"
  },
  "recursos": [
    "Lista de recursos visuais ou materiais necessários"
  ],
  "objetivosAprendizagem": [
    "Lista dos objetivos de aprendizagem"
  ]
}

Responda APENAS com o JSON, sem texto adicional.`;

      console.log('📤 Enviando prompt para Gemini...');

      const response = await geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.9,
        topK: 40
      });

      if (response.success) {
        console.log('✅ Resposta recebida do Gemini para quadro interativo');

        // Processamento específico para quadro interativo
        let cleanedResponse = response.result.trim();
        console.log('📥 Resposta bruta da IA:', cleanedResponse);

        // Remover marcadores de código se existirem
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s*/g, '');

        // Encontrar JSON válido na resposta
        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }

        console.log('🔄 Resposta limpa:', cleanedResponse);

        let parsedResult;
        try {
          parsedResult = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error('❌ Erro ao parsear JSON:', parseError);

          // Fallback: criar estrutura básica com o texto da resposta
          parsedResult = {
            titulo: contextData.theme || 'Quadro Interativo',
            subtitulo: contextData.objectives || 'Conteúdo educacional',
            content: cleanedResponse,
            text: cleanedResponse,
            conteudo: {
              introducao: cleanedResponse.substring(0, 200) + '...',
              conceitosPrincipais: [
                {
                  titulo: contextData.theme || 'Conceito Principal',
                  explicacao: 'Conteúdo será desenvolvido com base na resposta da IA.',
                  exemplo: 'Exemplos práticos serão apresentados.'
                }
              ],
              exemplosPraticos: [
                'Exemplo baseado no conteúdo gerado',
                'Aplicação prática dos conceitos'
              ],
              atividadesPraticas: [
                {
                  titulo: 'Atividade Interativa',
                  instrucoes: 'Instruções baseadas no conteúdo gerado',
                  objetivo: contextData.objectives || 'Fixar aprendizado'
                }
              ],
              resumo: 'Resumo dos conceitos principais abordados.',
              proximosPassos: 'Continue explorando o tema.'
            },
            recursos: ['Quadro interativo', 'Conteúdo da IA'],
            objetivosAprendizagem: [contextData.objectives || 'Compreender o tema']
          };
        }

        // Validação e enriquecimento dos dados
        if (!parsedResult.titulo) {
          parsedResult.titulo = contextData.theme || 'Quadro Interativo';
        }

        if (!parsedResult.subtitulo) {
          parsedResult.subtitulo = contextData.objectives || 'Conteúdo educacional';
        }

        // Adicionar metadados
        parsedResult.isGeneratedByAI = true;
        parsedResult.generatedAt = new Date().toISOString();
        parsedResult.type = 'quadro-interativo';
        parsedResult.customFields = {
          'Disciplina / Área de conhecimento': contextData.subject || 'Multidisciplinar',
          'Ano / Série': contextData.schoolYear || 'Ensino Fundamental',
          'Tema ou Assunto da aula': contextData.theme || 'Tema',
          'Objetivo de aprendizagem da aula': contextData.objectives || 'Objetivo',
          'Nível de Dificuldade': contextData.difficultyLevel || 'Médio',
          'Atividade mostrada': contextData.quadroInterativoCampoEspecifico || 'Atividade'
        };

        console.log('✅ Quadro Interativo processado com sucesso:', parsedResult);

        return parsedResult;
      } else {
        throw new Error(response.error || 'Falha na geração de conteúdo para quadro interativo');
      }
    }

    // Prompt genérico para outros tipos
    const prompt = `
Crie o conteúdo educacional para uma atividade do tipo "${activityType}" com base no seguinte contexto:

CONTEXTO:
${JSON.stringify(contextData, null, 2)}

FORMATO: Responda em JSON estruturado com todos os campos relevantes para o tipo de atividade solicitado.
REQUISITOS: Conteúdo educativo, bem estruturado e adequado ao contexto fornecido.

Responda APENAS com o JSON, sem texto adicional.`;

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

      let cleanedResponse = response.result.trim();
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }

      const parsedResult = JSON.parse(cleanedResponse);
      parsedResult.isGeneratedByAI = true;
      parsedResult.generatedAt = new Date().toISOString();

      return parsedResult;
    } else {
      throw new Error(response.error || 'Falha na geração de conteúdo');
    }

  } catch (error) {
    console.error('❌ Erro crítico ao gerar conteúdo da atividade:', error);
    throw error;
  }
};

// Função para gerar atividade (compatibilidade)
export async function generateActivity(formData: any): Promise<{ success: boolean; content?: string; error?: string }> {
  console.log('🎯 generateActivity: Iniciando geração com formData:', formData);

  try {
    // Para Sequência Didática, garantir validação específica
    if (formData.typeId === 'sequencia-didatica') {
      console.log('🎯 Detectada solicitação de Sequência Didática');

      const requiredFields = ['tituloTemaAssunto', 'anoSerie', 'disciplina', 'publicoAlvo', 'objetivosAprendizagem', 'quantidadeAulas'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        console.error('❌ Campos obrigatórios ausentes para Sequência Didática:', missingFields);
        return {
          success: false,
          error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
        };
      }

      // Gerar usando IA
      const generatedContent = await generateActivityContent('sequencia-didatica', formData);

      return {
        success: true,
        content: JSON.stringify(generatedContent)
      };
    }

    // Lógica para outros tipos de atividade
    let generatedContent;

    switch (formData.typeId) {
      case 'lista-exercicios':
        generatedContent = await generateActivityContent('lista-exercicios', formData);
        break;

      case 'prova':
        generatedContent = {
          titulo: formData.title || 'Avaliação',
          descricao: formData.description || 'Avaliação de conhecimentos sobre o tema.',
          disciplina: formData.subject || 'Matemática',
          tema: formData.theme || 'Tópico específico',
          tempoLimite: formData.timeLimit || '60 minutos',
          pontuacaoTotal: parseInt(formData.totalScore) || 10,
          questoes: formData.questions || [],
          isGeneratedByAI: true,
          generatedAt: new Date().toISOString()
        };
        break;

      case 'plano-aula':
        generatedContent = await generateActivityContent('plano-aula', formData);
        break;

      case 'quadro-interativo':
        generatedContent = await generateActivityContent('quadro-interativo', formData);
        break;

      default:
        generatedContent = {
          titulo: formData.title || 'Atividade Gerada',
          descricao: formData.description || 'Descrição padrão da atividade.',
          disciplina: formData.subject || 'Geral',
          tema: formData.theme || 'Tema geral',
          conteudo: formData.content || 'Conteúdo a ser definido.',
          isGeneratedByAI: true,
          generatedAt: new Date().toISOString()
        };
        break;
    }

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

  } catch (error) {
    console.error('❌ Erro na geração da atividade:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função auxiliar para formatar o conteúdo
async function generateSimpleActivityContent(activityData: any): Promise<string> {
  console.log('🔨 Gerando conteúdo da atividade:', activityData.titulo || activityData.title);

  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Se for um objeto JSON, serializar para string
  if (typeof activityData === 'object' && activityData !== null && !Array.isArray(activityData)) {
    try {
      return JSON.stringify(activityData, null, 2);
    } catch (error) {
      console.error("Erro ao serializar dados da atividade para JSON:", error);
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
    return activityData;
  }
}
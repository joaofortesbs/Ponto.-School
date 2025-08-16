
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

    // Para Quadro Interativo, usar gerador específico
    if (activityType === 'quadro-interativo') {
      try {
        const { generateQuadroInterativoContent } = await import('../../activities/quadro-interativo/quadroInterativoProcessor');

        console.log('🎯 Gerando conteúdo específico para Quadro Interativo');
        console.log('📋 Dados de contexto recebidos:', contextData);

        // Validar dados obrigatórios
        const requiredFields = ['subject', 'schoolYear', 'theme', 'objectives', 'difficultyLevel', 'quadroInterativoCampoEspecifico'];
        const missingFields = requiredFields.filter(field => !contextData[field] || contextData[field].trim() === '');

        if (missingFields.length > 0) {
          console.warn('⚠️ Campos obrigatórios ausentes para Quadro Interativo:', missingFields);
          // Preencher com valores padrão
          contextData.subject = contextData.subject || 'Matemática';
          contextData.schoolYear = contextData.schoolYear || '6º Ano';
          contextData.theme = contextData.theme || 'Tema da Aula';
          contextData.objectives = contextData.objectives || 'Objetivos de aprendizagem';
          contextData.difficultyLevel = contextData.difficultyLevel || 'Intermediário';
          contextData.quadroInterativoCampoEspecifico = contextData.quadroInterativoCampoEspecifico || 'Atividade interativa no quadro';
        }

        const quadroContent = await generateQuadroInterativoContent({
          subject: contextData.subject,
          schoolYear: contextData.schoolYear,
          theme: contextData.theme,
          objectives: contextData.objectives,
          difficultyLevel: contextData.difficultyLevel,
          quadroInterativoCampoEspecifico: contextData.quadroInterativoCampoEspecifico,
          materials: contextData.materials || '',
          instructions: contextData.instructions || '',
          evaluation: contextData.evaluation || '',
          timeLimit: contextData.timeLimit || '',
          context: contextData.context || ''
        });

        console.log('✅ Quadro Interativo gerado com sucesso:', quadroContent);
        return {
          ...quadroContent,
          isGeneratedByAI: true,
          generatedAt: new Date().toISOString(),
          activityType: 'quadro-interativo'
        };
      } catch (error) {
        console.error('❌ Erro na geração do Quadro Interativo:', error);
        // Retornar estrutura básica em caso de erro
        return {
          title: contextData.title || 'Quadro Interativo',
          description: contextData.description || 'Atividade de quadro interativo gerada automaticamente',
          personalizedTitle: `${contextData.theme || 'Tema'} - Quadro Interativo`,
          personalizedDescription: `Atividade interativa sobre ${contextData.theme || 'o tema proposto'} para ${contextData.schoolYear || '6º Ano'}`,
          subject: contextData.subject || 'Matemática',
          schoolYear: contextData.schoolYear || '6º Ano',
          theme: contextData.theme || 'Tema da Aula',
          objectives: contextData.objectives || 'Objetivos de aprendizagem',
          difficultyLevel: contextData.difficultyLevel || 'Intermediário',
          quadroInterativoCampoEspecifico: contextData.quadroInterativoCampoEspecifico || 'Atividade interativa no quadro',
          materials: contextData.materials || '',
          instructions: contextData.instructions || '',
          evaluation: contextData.evaluation || '',
          timeLimit: contextData.timeLimit || '',
          context: contextData.context || '',
          isGeneratedByAI: false,
          generatedAt: new Date().toISOString(),
          activityType: 'quadro-interativo',
          error: error.message
        };
      }
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

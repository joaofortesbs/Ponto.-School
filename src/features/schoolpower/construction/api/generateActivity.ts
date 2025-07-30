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

export const generateActivityContent = async (
  activityType: string,
  contextData: any
): Promise<any> => {
  try {
    console.log('🤖 Iniciando geração de conteúdo com Gemini para:', activityType);
    console.log('📋 Dados de contexto completos:', JSON.stringify(contextData, null, 2));

    // Validar dados essenciais antes de prosseguir
    if (!contextData || typeof contextData !== 'object') {
      throw new Error('Dados de contexto inválidos ou ausentes');
    }

    // Prompt específico para Lista de Exercícios
    let prompt = '';

    if (activityType === 'lista-exercicios') {
      // Usar exatamente o mesmo prompt que o modal usa
      const { buildListaExerciciosPrompt } = await import('../../prompts/listaExerciciosPrompt');
      
      // Preparar dados no formato correto para o prompt com validação
      const promptData = {
        titulo: String(contextData.titulo || contextData.title || 'Lista de Exercícios').trim(),
        disciplina: String(contextData.disciplina || contextData.subject || 'Português').trim(),
        tema: String(contextData.tema || contextData.theme || 'Conteúdo Geral').trim(),
        anoEscolaridade: String(contextData.anoEscolaridade || contextData.schoolYear || '6º ano').trim(),
        numeroQuestoes: Math.max(1, Math.min(20, parseInt(contextData.numeroQuestoes || contextData.numberOfQuestions || '10'))),
        nivelDificuldade: String(contextData.nivelDificuldade || contextData.difficultyLevel || 'Médio').trim(),
        modeloQuestoes: String(contextData.modeloQuestoes || contextData.questionModel || 'Múltipla escolha').trim(),
        fontes: String(contextData.fontes || contextData.sources || 'Livros didáticos e exercícios educacionais').trim(),
        objetivos: String(contextData.objetivos || contextData.objectives || '').trim(),
        materiais: String(contextData.materiais || contextData.materials || '').trim(),
        instrucoes: String(contextData.instrucoes || contextData.instructions || '').trim(),
        tempoLimite: String(contextData.tempoLimite || contextData.timeLimit || '').trim(),
        contextoAplicacao: String(contextData.contextoAplicacao || contextData.context || '').trim()
      };

      // Validar se os campos essenciais não estão vazios
      if (!promptData.titulo || !promptData.disciplina || !promptData.tema) {
        throw new Error('Campos essenciais estão ausentes: título, disciplina ou tema');
      }

      prompt = buildListaExerciciosPrompt(promptData);
      console.log('📝 Prompt gerado para lista de exercícios');
      console.log('🎯 Dados validados usados no prompt:', promptData);
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

    // Validar se o prompt não está vazio
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt vazio ou inválido');
    }

    // Usar exatamente a mesma chamada da API que o modal usa
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAOcWwuLjx8m1jN_-63a0aPLs7XFYztlKY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('❌ Erro na API Gemini:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        error: errorText
      });
      throw new Error(`Erro na API Gemini: ${geminiResponse.status} - ${errorText || geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('🤖 Resposta bruta do Gemini:', geminiData);

    let generatedText = '';
    if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
      generatedText = geminiData.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Resposta inválida da API Gemini');
    }

    console.log('📄 Texto gerado:', generatedText);

    // Limpar a resposta para garantir que seja JSON válido
    let cleanedResponse = generatedText.trim();

      // Processar e validar a resposta JSON exatamente como no modal
    let parsedResponse;
    try {
      // Limpar possíveis caracteres extras
      const cleanText = cleanedResponse
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');

      parsedResponse = JSON.parse(cleanText);
      console.log('✅ JSON parseado:', parsedResponse);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.log('🔍 Texto que falhou no parse:', generatedText);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    // Validar a estrutura da resposta para lista de exercícios
    if (activityType === 'lista-exercicios') {
      if (!parsedResponse.questoes || !Array.isArray(parsedResponse.questoes)) {
        throw new Error('Resposta da IA não contém questões válidas');
      }

      if (parsedResponse.questoes.length === 0) {
        throw new Error('Nenhuma questão foi gerada pela IA');
      }

      // Garantir que as questões estão no formato correto
      const processedQuestions = parsedResponse.questoes.map((questao: any, index: number) => ({
        id: questao.id || `questao-${index + 1}`,
        type: questao.type || 'multipla-escolha',
        enunciado: questao.enunciado || '',
        alternativas: questao.alternativas || [],
        respostaCorreta: questao.respostaCorreta,
        explicacao: questao.explicacao || '',
        dificuldade: questao.dificuldade || contextData.nivelDificuldade?.toLowerCase() || 'medio',
        tema: questao.tema || contextData.tema || 'Conteúdo'
      }));

      console.log(`📝 ${processedQuestions.length} questões processadas com sucesso`);
      console.log('📄 Primeira questão processada:', processedQuestions[0]);

      const result = {
        ...parsedResponse,
        questoes: processedQuestions,
        isGeneratedByAI: true,
        generatedAt: new Date().toISOString(),
        contextData: contextData
      };

      console.log('🎉 Atividade personalizada gerada com sucesso:', result);
      return result;
    }

    return parsedResponse;
      

  } catch (error) {
    console.error('❌ Erro crítico ao gerar conteúdo da atividade:', error);
    throw error;
  }
};

export const generateActivity = async (activityData: any): Promise<any> => {
  try {
    console.log('🚀 Gerando atividade com dados completos:', activityData);

    // Garantir que os dados essenciais estão presentes
    const contextualizedData = {
      ...activityData,
      numeroQuestoes: activityData.numeroQuestoes || activityData.numberOfQuestions || '10',
      disciplina: activityData.disciplina || activityData.subject || 'Português',
      tema: activityData.tema || activityData.theme || 'Conteúdo Geral',
      anoEscolar: activityData.anoEscolaridade || activityData.schoolYear || '6º ano',
      dificuldade: activityData.nivelDificuldade || activityData.difficultyLevel || 'Médio',
      modeloQuestoes: activityData.modeloQuestoes || activityData.questionModel || 'multipla-escolha',
      titulo: activityData.titulo || activityData.title || `Lista de Exercícios`,
      descricao: activityData.descricao || activityData.description || '',
      objetivos: activityData.objetivos || activityData.objectives || '',
      fontes: activityData.fontes || activityData.sources || ''
    };

    const prompt = buildListaExerciciosPrompt(contextualizedData);
    console.log('📝 Prompt personalizado gerado:', prompt);
    console.log('🎯 Dados contextualizados:', contextualizedData);

    // Chamar a API Gemini diretamente para personalização
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAOcWwuLjx8m1jN_-63a0aPLs7XFYztlKY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Erro na API Gemini: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('🤖 Resposta bruta do Gemini:', geminiData);

    let generatedText = '';
    if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
      generatedText = geminiData.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Resposta inválida da API Gemini');
    }

    console.log('📄 Texto gerado:', generatedText);

    // Processar e validar a resposta JSON
    let parsedResponse;
    try {
      // Limpar possíveis caracteres extras
      const cleanText = generatedText.trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');

      parsedResponse = JSON.parse(cleanText);
      console.log('✅ JSON parseado:', parsedResponse);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.log('🔍 Texto que falhou no parse:', generatedText);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    // Validar a estrutura da resposta
    if (!parsedResponse.questoes || !Array.isArray(parsedResponse.questoes)) {
      throw new Error('Resposta da IA não contém questões válidas');
    }

    // Garantir que as questões estão no formato correto
    const processedQuestions = parsedResponse.questoes.map((questao: any, index: number) => ({
      id: questao.id || `questao-${index + 1}`,
      type: questao.type || 'multipla-escolha',
      enunciado: questao.enunciado || '',
      alternativas: questao.alternativas || [],
      respostaCorreta: questao.respostaCorreta,
      explicacao: questao.explicacao || '',
      dificuldade: questao.dificuldade || contextualizedData.dificuldade.toLowerCase(),
      tema: questao.tema || contextualizedData.tema
    }));

    const result = {
      ...parsedResponse,
      questoes: processedQuestions,
      isGeneratedByAI: true,
      contextData: contextualizedData
    };

    console.log('🎉 Atividade personalizada gerada com sucesso:', result);
    return result;

  } catch (error) {
    console.error('❌ Erro ao gerar atividade personalizada:', error);
    throw error;
  }
};
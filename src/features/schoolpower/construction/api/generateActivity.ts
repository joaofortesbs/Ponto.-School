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
    console.log('📋 Dados de contexto:', contextData);

    const geminiClient = new GeminiClient();

    // Prompt específico para Lista de Exercícios
    let prompt = '';

    if (activityType === 'lista-exercicios') {
      // Importar o prompt específico
      const { buildListaExerciciosPrompt } = await import('../../prompts/listaExerciciosPrompt');
      prompt = buildListaExerciciosPrompt(contextData);
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
      maxTokens: 3000,
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

      console.log('🔧 Resposta bruta da IA:', cleanedResponse);

      // Remover markdown se presente
      cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');

      // Remover possíveis prefixos/sufixos que não sejam JSON
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }

      console.log('🔧 Resposta limpa para parsing:', cleanedResponse);

      try {
        const parsedResult = JSON.parse(cleanedResponse);
        console.log('✅ Resultado parseado com sucesso:', parsedResult);

        // Validar se contém questões
        if (activityType === 'lista-exercicios') {
          if (!parsedResult.questoes || !Array.isArray(parsedResult.questoes) || parsedResult.questoes.length === 0) {
            console.error('❌ IA não gerou questões válidas');
            throw new Error('Questões não encontradas na resposta da IA');
          }

          console.log(`📝 ${parsedResult.questoes.length} questões geradas pela IA`);

          // Marcar como gerado pela IA
          parsedResult.isGeneratedByAI = true;
          parsedResult.generatedAt = new Date().toISOString();
        }

        return parsedResult;
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('📄 Conteúdo que causou erro:', cleanedResponse);
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
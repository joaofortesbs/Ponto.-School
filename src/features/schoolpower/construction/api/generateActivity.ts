
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
import { GEMINI_API_KEY } from '../../activitiesManager';

export const generateActivityData = async (
  activity: ActionPlanItem, 
  contextualizationData?: any
): Promise<any> => {
  try {
    console.log('🤖 Gerando dados da atividade via IA:', activity.title);
    
    const prompt = buildActivityPrompt(activity, contextualizationData);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
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

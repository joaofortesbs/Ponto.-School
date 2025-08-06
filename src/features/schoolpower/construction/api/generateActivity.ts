
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

  try {
    // Validar dados obrigatórios
    if (!formData.title || !formData.description) {
      throw new Error('Título e descrição são obrigatórios');
    }

    // Preparar dados para a API
    const activityData = {
      title: formData.title,
      description: formData.description,
      type: formData.typeId || 'default',
      disciplina: formData.disciplina || 'Matemática',
      nivel: formData.nivel || 'Ensino Médio',
      duracao: formData.duracao || '50 minutos',
      objetivo: formData.objetivo || formData.description,
      conteudo: formData.conteudo || formData.description,
      metodologia: formData.metodologia || 'Prática',
      recursos: formData.recursos || 'Quadro, computador',
      avaliacao: formData.avaliacao || 'Participação e exercícios'
    };

    console.log('📝 Dados preparados para API:', activityData);

    // Simular geração da atividade usando uma função auxiliar
    const generatedContent = await generateSimpleActivityContent(activityData);

    if (generatedContent) {
      console.log('✅ Atividade gerada com sucesso');
      return {
        success: true,
        content: generatedContent
      };
    } else {
      throw new Error('Falha na geração do conteúdo');
    }

  } catch (error) {
    console.error('❌ Erro na geração da atividade:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função auxiliar para evitar conflito de nomes
async function generateSimpleActivityContent(activityData: any): Promise<string> {
  console.log('🔨 Gerando conteúdo da atividade:', activityData.title);

  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Template baseado no tipo de atividade
  const templates = {
    'lista-exercicios': `
# ${activityData.title}

## Informações Gerais
- **Disciplina:** ${activityData.disciplina}
- **Nível:** ${activityData.nivel}
- **Duração:** ${activityData.duracao}

## Objetivo
${activityData.objetivo}

## Conteúdo
${activityData.conteudo}

## Exercícios

### Exercício 1
Resolva a função f(x) = 2x + 3 para x = 5.

**Solução:**
f(5) = 2(5) + 3 = 10 + 3 = 13

### Exercício 2
Determine o zero da função f(x) = -3x + 9.

**Solução:**
-3x + 9 = 0
-3x = -9
x = 3

### Exercício 3
Construa o gráfico da função f(x) = x - 2.

**Solução:**
- Quando x = 0: f(0) = -2
- Quando x = 2: f(2) = 0
- Quando x = 4: f(4) = 2

## Metodologia
${activityData.metodologia}

## Recursos Necessários
${activityData.recursos}

## Avaliação
${activityData.avaliacao}
    `,
    'prova': `
# ${activityData.title}

## Informações da Prova
- **Disciplina:** ${activityData.disciplina}
- **Nível:** ${activityData.nivel}
- **Duração:** ${activityData.duracao}

## Instruções
1. Leia todas as questões antes de começar
2. Resolva as questões com calma e atenção
3. Mostre os cálculos quando necessário

## Questões

### Questão 1 (2,0 pontos)
Dada a função f(x) = 3x - 6, calcule:
a) f(2)
b) O zero da função

### Questão 2 (2,0 pontos)
Determine a lei de formação da função cujo gráfico passa pelos pontos (0, 4) e (2, 0).

### Questão 3 (3,0 pontos)
Resolva o sistema de equações:
2x + y = 7
x - y = 2

### Questão 4 (3,0 pontos)
Aplique o Teorema de Pitágoras para encontrar a hipotenusa de um triângulo retângulo com catetos de 3 cm e 4 cm.

## Gabarito
1. a) f(2) = 0  b) x = 2
2. f(x) = -2x + 4
3. x = 3, y = 1
4. h = 5 cm
    `,
    'default': `
# ${activityData.title}

## Descrição
${activityData.description}

## Objetivo
${activityData.objetivo}

## Conteúdo Desenvolvido
${activityData.conteudo}

## Metodologia
${activityData.metodologia}

## Recursos
${activityData.recursos}

## Avaliação
${activityData.avaliacao}

---
*Atividade gerada automaticamente pelo School Power*
    `
  };

  // Determinar template baseado no tipo ou usar default
  const activityType = activityData.type || 'default';
  const template = templates[activityType] || templates['default'];

  return template.trim();
}

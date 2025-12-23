/**
 * ====================================================================
 * AGENTE DE GERAÇÃO DE INPUTS PARA SCHOOL POWER
 * ====================================================================
 * 
 * Este agente gera PROMPTS estruturados para o School Power API
 * com base nas sugestões da Etapa 3 e conteúdo da Etapa 2.
 * 
 * RESPONSABILIDADES:
 * - Receber as sugestões de atividades da Etapa 3
 * - Analisar o conteúdo gerado na Etapa 2
 * - Gerar um PROMPT estruturado para cada sugestão com:
 *   • Mensagem inicial (Input)
 *   • 📚 Matérias e temas
 *   • 🎯 Público-alvo
 *   • ⚠️ Restrições ou preferências
 *   • 📅 Período de entrega
 *   • 📝 Observações importantes
 * - Retornar inputs prontos para School Power gerar as atividades
 * 
 * FLUXO:
 * Etapa 3 (Sugestões) → Etapa 4 (Inputs estruturados) → School Power API → Atividades geradas
 * 
 * VERSÃO: 2.0.0 - Reescrito para gerar inputs School Power
 * ÚLTIMA ATUALIZAÇÃO: 2025-12-23
 * ====================================================================
 */

import { log, LOG_PREFIXES, logActivityGeneration } from '../debugLogger.js';
import { generateWithCascade, GROQ_MODELS_CASCADE } from '../../groq.js';

/**
 * Prompt para gerar inputs estruturados para School Power
 */
const SCHOOL_POWER_INPUT_PROMPT = `Você é um especialista em design instrucional e pedagogia.
Analise a sugestão de atividade e o conteúdo educacional fornecido.
Gere um PROMPT estruturado com os campos necessários para o School Power gerar a atividade.

TIPO DE ATIVIDADE: {activityType}
NOME DA ATIVIDADE: {activityName}

CONTEÚDO DA SEÇÃO: {sectionContent}

CONTEXTO DO CURSO:
- Assunto Principal: {subject}
- Público-alvo: Estudantes
- Dificuldade sugerida: {difficulty}

Responda APENAS em JSON VÁLIDO com exatamente esta estrutura:
{
  "schoolPowerInput": {
    "initialMessage": "Mensagem clara explicando o que precisa ser gerado",
    "subjects": "Matérias e temas a serem trabalhados (ex: Matemática, Álgebra, Equações)",
    "targetAudience": "Descrição do público-alvo (ex: Alunos do 8º ano)",
    "restrictions": "Restrições e preferências (ex: Use linguagem simples, 5 questões)",
    "deliveryPeriod": "Período ou datas importantes (ex: Para semana de 20-24 de dezembro)",
    "observations": "Observações adicionais para personalizar a geração"
  }
}`;

function generateActivityId() {
  return `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Gera um input estruturado para School Power para uma sugestão de atividade
 */
async function generateSchoolPowerInput(requestId, suggestion, sectionContent, lesson) {
  const { activityId, activityName, parameters } = suggestion.suggestion || {};
  
  if (!activityId) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] activityId não encontrado na sugestão`);
    throw new Error('activityId não encontrado na sugestão');
  }
  
  logActivityGeneration(requestId, activityId, activityName);
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Gerando input para School Power: ${activityName}`);
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Modelos disponíveis: ${GROQ_MODELS_CASCADE.map(m => m.name).join(' → ')} → Gemini`);

  const prompt = SCHOOL_POWER_INPUT_PROMPT
    .replace('{activityType}', activityId)
    .replace('{activityName}', activityName)
    .replace('{sectionContent}', sectionContent?.substring(0, 1000) || 'Conteúdo não disponível')
    .replace('{subject}', lesson?.assunto || 'Tema não especificado')
    .replace('{difficulty}', parameters?.difficulty || 'médio');

  const startTime = Date.now();
  let responseText = '';
  let aiProvider = 'groq';
  let modelUsed = 'unknown';
  let attempts = 1;

  try {
    const messages = [
      { role: 'system', content: 'Você gera prompts estruturados para ferramentas educacionais. Responda APENAS em JSON válido.' },
      { role: 'user', content: prompt }
    ];
    
    const result = await generateWithCascade(messages, {
      temperature: 0.6,
      max_tokens: 1000,
      top_p: 0.9
    });

    responseText = result.choices[0]?.message?.content || '{}';
    
    const metadata = result._metadata || {};
    aiProvider = metadata.provider || 'groq';
    modelUsed = metadata.modelName || metadata.model || 'unknown';
    attempts = metadata.attempts || 1;
    
    log(LOG_PREFIXES.GENERATE, `[${requestId}] ✅ Input gerado via ${modelUsed} (${aiProvider})`);
    if (attempts > 1) {
      log(LOG_PREFIXES.GENERATE, `[${requestId}] 📊 Tentativas: ${attempts}, Modelos tentados: ${metadata.totalModelsTriad}`);
    }

  } catch (cascadeError) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] ❌ Todos os modelos falharam: ${cascadeError.message}`);
    log(LOG_PREFIXES.GENERATE, `[${requestId}] 📦 Usando input padrão (fallback local)`);
    
    // Fallback local
    return createFallbackSchoolPowerInput(requestId, suggestion, activityId, activityName, parameters, startTime);
  }

  const duration = Date.now() - startTime;

  let parsedInput;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    parsedInput = parsed.schoolPowerInput || parsed;
  } catch (parseError) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao parsear input, usando fallback`);
    return createFallbackSchoolPowerInput(requestId, suggestion, activityId, activityName, parameters, startTime);
  }

  const schoolPowerInput = {
    id: generateActivityId(),
    activityId,
    activityName,
    sectionId: suggestion.sectionId,
    sectionName: suggestion.sectionName,
    input: {
      initialMessage: parsedInput.initialMessage || `Gere uma atividade de ${activityName}`,
      subjects: parsedInput.subjects || suggestion.sectionName,
      targetAudience: parsedInput.targetAudience || 'Alunos',
      restrictions: parsedInput.restrictions || parameters?.description || 'Nenhuma restrição especificada',
      deliveryPeriod: parsedInput.deliveryPeriod || 'Sem data limite',
      observations: parsedInput.observations || 'Gere conteúdo educacional de qualidade'
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      duration,
      difficulty: parameters?.difficulty || 'médio',
      estimatedTime: parameters?.estimatedTime || '10',
      source: 'lesson-orchestrator',
      requestId,
      aiProvider,
      modelUsed,
      attempts
    }
  };

  log(LOG_PREFIXES.GENERATE, `[${requestId}] Input ${schoolPowerInput.id} gerado em ${duration}ms`);
  
  return schoolPowerInput;
}

/**
 * Cria um input padrão para School Power (fallback local)
 */
function createFallbackSchoolPowerInput(requestId, suggestion, activityId, activityName, parameters, startTime) {
  const duration = Date.now() - startTime;
  
  return {
    id: generateActivityId(),
    activityId,
    activityName,
    sectionId: suggestion.sectionId,
    sectionName: suggestion.sectionName,
    input: {
      initialMessage: `Gere uma atividade de ${activityName} sobre ${suggestion.sectionName}`,
      subjects: suggestion.sectionName,
      targetAudience: 'Estudantes de ensino médio',
      restrictions: parameters?.description || 'Crie uma atividade engajante e educativa',
      deliveryPeriod: 'Sem prazo específico',
      observations: 'Atividade gerada via fallback local - revise os parâmetros conforme necessário'
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      duration,
      difficulty: parameters?.difficulty || 'médio',
      estimatedTime: parameters?.estimatedTime || '10',
      source: 'lesson-orchestrator',
      requestId,
      aiProvider: 'local-fallback',
      modelUsed: 'fallback',
      attempts: 0,
      usedFallback: true
    }
  };
}

/**
 * Gera inputs para todas as sugestões de atividades
 */
async function generateAllActivities(requestId, suggestions, sectionsContent, lesson) {
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Gerando inputs para ${suggestions.length} atividades`);
  
  const activities = [];
  const errors = [];

  for (const suggestion of suggestions) {
    const sectionContent = sectionsContent.find(s => s.sectionId === suggestion.sectionId);
    
    try {
      const schoolPowerInput = await generateSchoolPowerInput(requestId, suggestion, sectionContent?.content, lesson);
      activities.push(schoolPowerInput);
    } catch (error) {
      log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao gerar input para ${suggestion.sectionId}: ${error.message}`);
      errors.push({ 
        sectionId: suggestion.sectionId, 
        activityId: suggestion.suggestion?.activityId,
        error: error.message 
      });
      
      // Tenta criar um fallback mesmo com erro
      try {
        const fallback = createFallbackSchoolPowerInput(
          requestId, 
          suggestion, 
          suggestion.suggestion?.activityId, 
          suggestion.suggestion?.activityName, 
          suggestion.suggestion?.parameters,
          Date.now()
        );
        activities.push(fallback);
      } catch (fallbackError) {
        log(LOG_PREFIXES.ERROR, `[${requestId}] Falha até no fallback para ${suggestion.sectionId}`);
      }
    }
  }

  log(LOG_PREFIXES.GENERATE, `[${requestId}] Geração de inputs concluída: ${activities.length} inputs, ${errors.length} erros`);

  return {
    activities,
    errors,
    totalGenerated: activities.length,
    totalFailed: errors.length
  };
}

export {
  generateSchoolPowerInput,
  generateAllActivities,
  generateActivityId,
  SCHOOL_POWER_INPUT_PROMPT
};

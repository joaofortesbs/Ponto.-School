/**
 * ====================================================================
 * AGENTE DE GERAÇÃO DE INPUTS PARA SCHOOL POWER
 * ====================================================================
 * 
 * Este agente gera UM ÚNICO PROMPT estruturado para o School Power API
 * que cobrirá TODAS as atividades sugeridas na Etapa 3.
 * 
 * RESPONSABILIDADES:
 * - Receber as sugestões de atividades da Etapa 3
 * - Consolidar todos os tipos de atividades sugeridos
 * - Gerar UM ÚNICO input estruturado para o School Power com:
 *   • Mensagem inicial (Input)
 *   • 📚 Matérias e temas
 *   • 🎯 Público-alvo
 *   • ⚠️ Restrições ou preferências
 *   • 📅 Período de entrega
 *   • 📝 Observações importantes
 * - Retornar input pronto para School Power gerar todas as atividades
 * 
 * FLUXO:
 * Etapa 3 (Sugestões para 6 seções) 
 * → Etapa 4 (Consolidar em 1 input universal)
 * → School Power API (gera todas as atividades)
 * → Etapa 5-7 (Organiza atividades nos blocos)
 * 
 * VERSÃO: 3.0.0 - Input único consolidado
 * ÚLTIMA ATUALIZAÇÃO: 2025-12-23
 * ====================================================================
 */

import { log, LOG_PREFIXES, logActivityGeneration } from '../debugLogger.js';
import { generateWithCascade, GROQ_MODELS_CASCADE } from '../../groq.js';

/**
 * Prompt para gerar um ÚNICO input estruturado para o School Power
 * que cobrirá TODAS as atividades sugeridas
 */
const CONSOLIDATED_SCHOOL_POWER_PROMPT = `Você é um especialista em design instrucional e pedagogia.
Seu objetivo é gerar UM ÚNICO PROMPT estruturado que será usado pelo School Power para gerar TODAS as atividades abaixo.

CONTEXTO DA AULA:
- Assunto: {subject}
- Template: {template}
- Nível: {level}

ATIVIDADES QUE SERÃO GERADAS (Consolidadas):
{activitiesList}

INSTRUÇÕES IMPORTANTES:
1. Gere UM ÚNICO input que funcione para gerar TODOS os tipos de atividades acima
2. O input deve ser UNIVERSAL - NÃO específico para uma atividade apenas
3. Os campos devem orientar o School Power para gerar atividades de qualidade educacional
4. Considere que essas atividades serão distribuídas em diferentes seções da aula

Responda APENAS em JSON VÁLIDO com exatamente esta estrutura:
{
  "schoolPowerInput": {
    "initialMessage": "Mensagem clara explicando o que precisa ser gerado - MENCIONAR QUE SÃO MÚLTIPLAS ATIVIDADES",
    "subjects": "Matérias e temas (ex: Matemática, Geometria, Formas 3D)",
    "targetAudience": "Público-alvo (ex: Alunos do ensino médio)",
    "restrictions": "Restrições e preferências para TODAS as atividades",
    "deliveryPeriod": "Período ou datas importantes",
    "observations": "Observações para personalizar a geração de TODAS as atividades"
  }
}`;

function generateActivityId() {
  return `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Consolida as sugestões em um resumo legível para o prompt
 */
function buildActivitiesSummary(suggestions) {
  const grouped = {};
  
  for (const suggestion of suggestions) {
    const actId = suggestion.suggestion?.activityId || 'unknown';
    const actName = suggestion.suggestion?.activityName || 'Atividade Desconhecida';
    const sectionName = suggestion.sectionName || suggestion.sectionId;
    
    if (!grouped[actId]) {
      grouped[actId] = {
        name: actName,
        sections: []
      };
    }
    grouped[actId].sections.push(sectionName);
  }
  
  let summary = 'Atividades a serem geradas:\n';
  let index = 1;
  
  for (const [actId, data] of Object.entries(grouped)) {
    summary += `${index}. ${data.name} (${actId})\n`;
    summary += `   - Para seções: ${data.sections.join(', ')}\n`;
    index++;
  }
  
  return summary;
}

/**
 * Gera UM ÚNICO input consolidado para School Power
 */
async function generateUnifiedSchoolPowerInput(requestId, suggestions, lesson) {
  if (!suggestions || suggestions.length === 0) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Nenhuma sugestão fornecida`);
    throw new Error('Nenhuma sugestão de atividade fornecida');
  }
  
  const activitiesSummary = buildActivitiesSummary(suggestions);
  
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Gerando input ÚNICO consolidado para ${suggestions.length} sugestões`);
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Atividades a gerar: ${Object.keys(new Set(suggestions.map(s => s.suggestion?.activityId))).join(', ')}`);
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Modelos disponíveis: ${GROQ_MODELS_CASCADE.map(m => m.name).join(' → ')} → Gemini`);

  const prompt = CONSOLIDATED_SCHOOL_POWER_PROMPT
    .replace('{subject}', lesson?.assunto || 'Tema não especificado')
    .replace('{template}', lesson?.templateName || 'Template desconhecido')
    .replace('{level}', 'Ensino Médio')
    .replace('{activitiesList}', activitiesSummary);

  const startTime = Date.now();
  let responseText = '';
  let aiProvider = 'groq';
  let modelUsed = 'unknown';
  let attempts = 1;

  try {
    const messages = [
      { 
        role: 'system', 
        content: 'Você gera um ÚNICO prompt consolidado para ferramentas educacionais que cobrirá TODAS as atividades. Responda APENAS em JSON válido.' 
      },
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
    
    log(LOG_PREFIXES.GENERATE, `[${requestId}] ✅ Input consolidado gerado via ${modelUsed} (${aiProvider})`);
    if (attempts > 1) {
      log(LOG_PREFIXES.GENERATE, `[${requestId}] 📊 Tentativas: ${attempts}`);
    }

  } catch (cascadeError) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] ❌ Todos os modelos falharam: ${cascadeError.message}`);
    log(LOG_PREFIXES.GENERATE, `[${requestId}] 📦 Usando input padrão consolidado (fallback local)`);
    
    // Fallback local
    return createFallbackUnifiedInput(requestId, suggestions, lesson);
  }

  const duration = Date.now() - startTime;

  let parsedInput;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    parsedInput = parsed.schoolPowerInput || parsed;
  } catch (parseError) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao parsear input consolidado, usando fallback`);
    return createFallbackUnifiedInput(requestId, suggestions, lesson);
  }

  const schoolPowerInput = {
    id: generateActivityId(),
    type: 'consolidated',
    applicableSections: suggestions.map(s => ({
      sectionId: s.sectionId,
      sectionName: s.sectionName,
      activityType: s.suggestion?.activityId,
      activityName: s.suggestion?.activityName
    })),
    input: {
      initialMessage: parsedInput.initialMessage || buildDefaultInitialMessage(suggestions),
      subjects: parsedInput.subjects || lesson?.assunto || 'Tema não especificado',
      targetAudience: parsedInput.targetAudience || 'Alunos de ensino médio',
      restrictions: parsedInput.restrictions || 'Crie atividades educacionais de qualidade',
      deliveryPeriod: parsedInput.deliveryPeriod || 'Sem data limite',
      observations: parsedInput.observations || 'Essas atividades serão usadas em diferentes seções da aula'
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      duration,
      totalActivitiesInInput: suggestions.length,
      source: 'lesson-orchestrator',
      requestId,
      aiProvider,
      modelUsed,
      attempts,
      isConsolidated: true
    }
  };

  log(LOG_PREFIXES.GENERATE, `[${requestId}] ✅ Input consolidado ${schoolPowerInput.id} gerado em ${duration}ms`);
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Este input será usado para gerar TODAS as ${suggestions.length} atividades`);
  
  return schoolPowerInput;
}

/**
 * Cria a mensagem inicial padrão
 */
function buildDefaultInitialMessage(suggestions) {
  const activityTypes = new Set(suggestions.map(s => s.suggestion?.activityName).filter(Boolean));
  const activities = Array.from(activityTypes).join(', ');
  
  return `Gere as seguintes atividades educacionais: ${activities}. 
Estas atividades serão distribuídas em diferentes seções de uma aula. 
Cada atividade deve ser de alta qualidade pedagógica e apropriada para o público-alvo.`;
}

/**
 * Cria um input padrão consolidado (fallback local)
 */
function createFallbackUnifiedInput(requestId, suggestions, lesson) {
  const duration = Date.now();
  
  return {
    id: generateActivityId(),
    type: 'consolidated',
    applicableSections: suggestions.map(s => ({
      sectionId: s.sectionId,
      sectionName: s.sectionName,
      activityType: s.suggestion?.activityId,
      activityName: s.suggestion?.activityName
    })),
    input: {
      initialMessage: buildDefaultInitialMessage(suggestions),
      subjects: lesson?.assunto || 'Tema educacional',
      targetAudience: 'Estudantes de ensino médio',
      restrictions: 'Crie atividades educacionais engajantes e bem estruturadas',
      deliveryPeriod: 'Sem prazo específico',
      observations: 'Input gerado com fallback local - revise conforme necessário. Essas atividades serão usadas em diferentes seções.'
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      duration: 0,
      totalActivitiesInInput: suggestions.length,
      source: 'lesson-orchestrator',
      requestId,
      aiProvider: 'local-fallback',
      modelUsed: 'fallback',
      attempts: 0,
      usedFallback: true,
      isConsolidated: true
    }
  };
}

/**
 * Gera UM ÚNICO input para todas as sugestões de atividades
 */
async function generateAllActivities(requestId, suggestions, sectionsContent, lesson) {
  log(LOG_PREFIXES.GENERATE, `[${requestId}] ETAPA 4: Gerando input ÚNICO para School Power`);
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Total de sugestões consolidadas: ${suggestions.length}`);
  
  const errors = [];

  try {
    const unifiedInput = await generateUnifiedSchoolPowerInput(requestId, suggestions, lesson);
    
    // Retorna um objeto com activities array contendo apenas UM input
    return {
      activities: [unifiedInput],
      errors,
      totalGenerated: 1,
      totalFailed: 0,
      isConsolidated: true,
      applicableToSections: suggestions.map(s => s.sectionId)
    };
    
  } catch (error) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao gerar input consolidado: ${error.message}`);
    errors.push({ 
      error: error.message,
      suggestions: suggestions.length
    });
    
    // Tenta criar um fallback mesmo com erro
    try {
      const fallback = createFallbackUnifiedInput(requestId, suggestions, lesson);
      return {
        activities: [fallback],
        errors,
        totalGenerated: 1,
        totalFailed: 0,
        isConsolidated: true,
        applicableToSections: suggestions.map(s => s.sectionId),
        usedFallback: true
      };
    } catch (fallbackError) {
      log(LOG_PREFIXES.ERROR, `[${requestId}] Falha total - nem fallback funcionou: ${fallbackError.message}`);
      throw new Error('Falha ao gerar input consolidado, nem fallback funcionou');
    }
  }
}

export {
  generateUnifiedSchoolPowerInput,
  generateAllActivities,
  generateActivityId,
  CONSOLIDATED_SCHOOL_POWER_PROMPT
};

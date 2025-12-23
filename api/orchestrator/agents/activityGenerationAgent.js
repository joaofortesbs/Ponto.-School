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
 * - Gerar UM ÚNICO input estruturado para o School Power
 * - LOGAR APENAS O INPUT GERADO (sem contexto desnecessário)
 * 
 * VERSÃO: 4.0.0 - Logs claros do input gerado
 * ÚLTIMA ATUALIZAÇÃO: 2025-12-23
 * ====================================================================
 */

import { log, LOG_PREFIXES } from '../debugLogger.js';
import { generateWithCascade, GROQ_MODELS_CASCADE } from '../../groq.js';

/**
 * Prompt para gerar um ÚNICO input estruturado para o School Power
 */
const CONSOLIDATED_SCHOOL_POWER_PROMPT = `Você é um especialista em design instrucional e pedagogia.
Analise o contexto abaixo e gere UM ÚNICO PROMPT estruturado para o School Power.

CONTEXTO DA AULA:
- Assunto: {subject}
- Template: {template}
- Público: Ensino Médio

TIPOS DE ATIVIDADES QUE SERÃO GERADAS:
{activitiesList}

GERE UM PROMPT ESTRUTURADO COM EXATAMENTE ESTES 5 CAMPOS:
1. Mensagem inicial (Input) - O que deve ser feito
2. 📚 Matérias e temas - Quais matérias e temas serão trabalhados?
3. 🎯 Público-alvo - Qual o público-alvo?
4. ⚠️ Restrições - Quais restrições ou preferências específicas?
5. 📅 Período de entrega - Datas importantes ou prazos
6. 📝 Observações - Outras observações importantes

Responda APENAS em JSON:
{
  "schoolPowerInput": {
    "initialMessage": "Texto direto da mensagem inicial",
    "subjects": "Texto dos temas",
    "targetAudience": "Texto do público-alvo",
    "restrictions": "Texto das restrições",
    "deliveryPeriod": "Texto do período",
    "observations": "Texto das observações"
  }
}`;

function generateActivityId() {
  return `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Consolida as sugestões em um resumo legível
 */
function buildActivitiesSummary(suggestions) {
  const grouped = {};
  
  for (const suggestion of suggestions) {
    const actId = suggestion.suggestion?.activityId || 'unknown';
    const actName = suggestion.suggestion?.activityName || 'Atividade Desconhecida';
    
    if (!grouped[actId]) {
      grouped[actId] = { name: actName, count: 0 };
    }
    grouped[actId].count++;
  }
  
  let summary = '';
  for (const [actId, data] of Object.entries(grouped)) {
    summary += `- ${data.name} (${actId})\n`;
  }
  
  return summary;
}

/**
 * Gera UM ÚNICO input consolidado para School Power
 */
async function generateUnifiedSchoolPowerInput(requestId, suggestions, lesson) {
  if (!suggestions || suggestions.length === 0) {
    throw new Error('Nenhuma sugestão de atividade fornecida');
  }
  
  const activitiesSummary = buildActivitiesSummary(suggestions);
  
  const prompt = CONSOLIDATED_SCHOOL_POWER_PROMPT
    .replace('{subject}', lesson?.assunto || 'Tema não especificado')
    .replace('{template}', lesson?.templateName || 'Template desconhecido')
    .replace('{activitiesList}', activitiesSummary);

  const startTime = Date.now();
  let responseText = '';
  let aiProvider = 'groq';
  let modelUsed = 'unknown';

  try {
    const messages = [
      { 
        role: 'system', 
        content: 'Gere um prompt estruturado para School Power. Responda APENAS em JSON válido.' 
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

  } catch (cascadeError) {
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
      initialMessage: parsedInput.initialMessage || `Gere atividades educacionais de qualidade`,
      subjects: parsedInput.subjects || lesson?.assunto || 'Tema não especificado',
      targetAudience: parsedInput.targetAudience || 'Alunos de ensino médio',
      restrictions: parsedInput.restrictions || 'Atividades educacionais de qualidade',
      deliveryPeriod: parsedInput.deliveryPeriod || 'Sem data limite',
      observations: parsedInput.observations || 'Atividades para diferentes seções da aula'
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      duration,
      totalActivitiesInInput: suggestions.length,
      source: 'lesson-orchestrator',
      requestId,
      aiProvider,
      modelUsed,
      isConsolidated: true
    }
  };
  
  return schoolPowerInput;
}

/**
 * Cria um input padrão consolidado (fallback local)
 */
function createFallbackUnifiedInput(requestId, suggestions, lesson) {
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
      initialMessage: `Gere atividades educacionais de qualidade para a aula sobre ${lesson?.assunto || 'o tema proposto'}`,
      subjects: lesson?.assunto || 'Tema educacional',
      targetAudience: 'Estudantes de ensino médio',
      restrictions: 'Crie atividades educacionais engajantes e bem estruturadas',
      deliveryPeriod: 'Sem prazo específico',
      observations: 'Essas atividades serão usadas em diferentes seções da aula'
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      duration: 0,
      totalActivitiesInInput: suggestions.length,
      source: 'lesson-orchestrator',
      requestId,
      aiProvider: 'local-fallback',
      modelUsed: 'fallback',
      usedFallback: true,
      isConsolidated: true
    }
  };
}

/**
 * Formata o input para exibição clara nos logs
 */
function formatInputForLogging(input) {
  const lines = [
    '',
    '═══════════════════════════════════════════════════════════════',
    '📋 ENTRADA ESTRUTURADA PARA SCHOOL POWER',
    '═══════════════════════════════════════════════════════════════',
    '',
    'Mensagem inicial (Input)',
    `${input.input.initialMessage}`,
    '',
    '📚 Quais matérias e temas serão trabalhados? *',
    `${input.input.subjects}`,
    '',
    '🎯 Qual o público-alvo? *',
    `${input.input.targetAudience}`,
    '',
    '⚠️ Quais restrições ou preferências específicas? *',
    `${input.input.restrictions}`,
    '',
    '📅 Período de entrega ou datas importantes',
    `${input.input.deliveryPeriod}`,
    '',
    '📝 Outras observações importantes',
    `${input.input.observations}`,
    '',
    '═══════════════════════════════════════════════════════════════',
    ''
  ];
  
  return lines.join('\n');
}

/**
 * Gera UM ÚNICO input para todas as sugestões de atividades
 */
async function generateAllActivities(requestId, suggestions, sectionsContent, lesson) {
  const errors = [];

  try {
    const unifiedInput = await generateUnifiedSchoolPowerInput(requestId, suggestions, lesson);
    
    // Log APENAS o input gerado
    console.log(formatInputForLogging(unifiedInput));
    
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
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao gerar input: ${error.message}`);
    errors.push({ 
      error: error.message,
      suggestions: suggestions.length
    });
    
    // Tenta criar um fallback mesmo com erro
    try {
      const fallback = createFallbackUnifiedInput(requestId, suggestions, lesson);
      console.log(formatInputForLogging(fallback));
      
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
      log(LOG_PREFIXES.ERROR, `[${requestId}] Falha total ao gerar input: ${fallbackError.message}`);
      throw new Error('Falha ao gerar input consolidado');
    }
  }
}

export {
  generateUnifiedSchoolPowerInput,
  generateAllActivities,
  generateActivityId,
  formatInputForLogging,
  CONSOLIDATED_SCHOOL_POWER_PROMPT
};

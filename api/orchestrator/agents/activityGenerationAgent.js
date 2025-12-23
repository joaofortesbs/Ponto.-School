/**
 * ====================================================================
 * AGENTE DE GERAÇÃO DE ATIVIDADES
 * ====================================================================
 * 
 * Este agente gera as atividades sugeridas usando a API Groq
 * e prepara os dados para salvamento no banco Neon.
 * 
 * RESPONSABILIDADES:
 * - Receber as sugestões de atividades
 * - Gerar conteúdo específico para cada tipo de atividade
 * - Preparar dados no formato correto para salvamento
 * - Retornar atividades prontas para persistência
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import { log, LOG_PREFIXES, logActivityGeneration } from '../debugLogger.js';
import { generateWithCascade, GROQ_MODELS_CASCADE } from '../../groq.js';

const ACTIVITY_PROMPTS = {
  'quiz-interativo': `Crie um quiz interativo educacional sobre o tema fornecido.
TEMA: {title}
CONTEXTO: {description}
DIFICULDADE: {difficulty}

Gere exatamente 5 perguntas de múltipla escolha com 4 alternativas cada.

Responda em JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Texto da pergunta",
      "options": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4"],
      "correctAnswer": 0,
      "explanation": "Explicação da resposta correta"
    }
  ]
}`,

  'flash-cards': `Crie flashcards educativos sobre o tema fornecido.
TEMA: {title}
CONTEXTO: {description}

Gere exatamente 8 flashcards com frente e verso.

Responda em JSON:
{
  "cards": [
    {
      "id": 1,
      "front": "Pergunta ou conceito",
      "back": "Resposta ou definição"
    }
  ]
}`,

  'lista-exercicios': `Crie uma lista de exercícios sobre o tema fornecido.
TEMA: {title}
CONTEXTO: {description}
DIFICULDADE: {difficulty}

Gere 5 exercícios variados (dissertativos e objetivos).

Responda em JSON:
{
  "exercises": [
    {
      "id": 1,
      "type": "dissertativo|objetiva|completar",
      "question": "Enunciado do exercício",
      "answer": "Resposta esperada ou gabarito",
      "points": 2
    }
  ]
}`,

  'sequencia-didatica': `Crie uma sequência didática sobre o tema fornecido.
TEMA: {title}
CONTEXTO: {description}

Gere uma sequência com 4 aulas progressivas.

Responda em JSON:
{
  "sequence": [
    {
      "lesson": 1,
      "title": "Título da aula",
      "objective": "Objetivo",
      "activities": ["Atividade 1", "Atividade 2"],
      "duration": "50 min"
    }
  ]
}`,

  'plano-aula': `Crie um plano de aula sobre o tema fornecido.
TEMA: {title}
CONTEXTO: {description}

Responda em JSON:
{
  "planTitle": "Título do plano",
  "objectives": ["Objetivo 1", "Objetivo 2"],
  "methodology": "Descrição da metodologia",
  "resources": ["Recurso 1", "Recurso 2"],
  "evaluation": "Forma de avaliação",
  "bnccSkills": ["EF01MA01", "EF02LP02"]
}`,

  'tese-redacao': `Crie exercícios de tese de redação sobre o tema fornecido.
TEMA: {title}
CONTEXTO: {description}

Gere 3 propostas de tema com teses modelo.

Responda em JSON:
{
  "proposals": [
    {
      "id": 1,
      "theme": "Tema da redação",
      "motivationalTexts": ["Texto motivador 1"],
      "thesisSuggestions": ["Tese 1", "Tese 2"],
      "arguments": ["Argumento 1", "Argumento 2"]
    }
  ]
}`
};

function generateActivityId() {
  return `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function generateActivity(requestId, suggestion, sectionContent) {
  const { activityId, activityName, parameters } = suggestion.suggestion || {};
  
  if (!activityId) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] activityId não encontrado na sugestão`);
    throw new Error('activityId não encontrado na sugestão');
  }
  
  logActivityGeneration(requestId, activityId, activityName);
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Modelos disponíveis: ${GROQ_MODELS_CASCADE.map(m => m.name).join(' → ')} → Gemini`);

  const promptTemplate = ACTIVITY_PROMPTS[activityId] || ACTIVITY_PROMPTS['quiz-interativo'];
  
  const prompt = promptTemplate
    .replace('{title}', parameters?.title || suggestion.sectionName)
    .replace('{description}', parameters?.description || sectionContent?.substring(0, 500) || '')
    .replace('{difficulty}', parameters?.difficulty || 'médio');

  const startTime = Date.now();
  let responseText = '';
  let aiProvider = 'groq';
  let modelUsed = 'unknown';
  let attempts = 1;

  try {
    const messages = [
      { role: 'system', content: 'Você gera conteúdo educacional. Responda APENAS em JSON válido.' },
      { role: 'user', content: prompt }
    ];
    
    const result = await generateWithCascade(messages, {
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9
    });

    responseText = result.choices[0]?.message?.content || '{}';
    
    const metadata = result._metadata || {};
    aiProvider = metadata.provider || 'groq';
    modelUsed = metadata.modelName || metadata.model || 'unknown';
    attempts = metadata.attempts || 1;
    
    log(LOG_PREFIXES.GENERATE, `[${requestId}] ✅ Atividade gerada via ${modelUsed} (${aiProvider})`);
    if (attempts > 1) {
      log(LOG_PREFIXES.GENERATE, `[${requestId}] 📊 Tentativas: ${attempts}, Modelos tentados: ${metadata.totalModelsTriad}`);
    }

  } catch (cascadeError) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] ❌ Todos os modelos falharam: ${cascadeError.message}`);
    log(LOG_PREFIXES.GENERATE, `[${requestId}] 📦 Usando atividade stub (fallback local)`);
    
    // Fallback local - retorna uma atividade stub
    return createFallbackActivity(requestId, suggestion, activityId, activityName, parameters, startTime);
  }

  const duration = Date.now() - startTime;

  let content;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    content = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (parseError) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao parsear atividade, usando fallback`);
    content = { error: 'Falha no parsing', raw: responseText.substring(0, 500) };
  }

  const generatedActivity = {
    id: generateActivityId(),
    templateId: activityId,
    type: activityId,
    title: parameters?.title || `${activityName} - ${suggestion.sectionName}`,
    description: parameters?.description || '',
    content,
    sectionId: suggestion.sectionId,
    sectionName: suggestion.sectionName,
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

  log(LOG_PREFIXES.GENERATE, `[${requestId}] Atividade ${generatedActivity.id} gerada em ${duration}ms`);
  
  return generatedActivity;
}

function createFallbackActivity(requestId, suggestion, activityId, activityName, parameters, startTime) {
  const duration = Date.now() - startTime;
  
  // Conteúdo stub para cada tipo de atividade
  const stubContent = {
    'quiz-interativo': {
      questions: [{
        id: 1,
        question: 'Questão de exemplo - edite para personalizar',
        options: ['A) Opção 1', 'B) Opção 2', 'C) Opção 3', 'D) Opção 4'],
        correctAnswer: 0,
        explanation: 'Explicação da resposta correta'
      }]
    },
    'flash-cards': {
      cards: [{
        id: 1,
        front: 'Conceito de exemplo',
        back: 'Definição de exemplo - edite para personalizar'
      }]
    },
    'lista-exercicios': {
      exercises: [{
        id: 1,
        type: 'dissertativo',
        question: 'Exercício de exemplo - edite para personalizar',
        answer: 'Resposta esperada',
        points: 2
      }]
    }
  };
  
  return {
    id: generateActivityId(),
    templateId: activityId,
    type: activityId,
    title: parameters?.title || `${activityName} - ${suggestion.sectionName}`,
    description: parameters?.description || 'Atividade gerada via fallback local',
    content: stubContent[activityId] || stubContent['quiz-interativo'],
    sectionId: suggestion.sectionId,
    sectionName: suggestion.sectionName,
    metadata: {
      generatedAt: new Date().toISOString(),
      duration,
      difficulty: parameters?.difficulty || 'médio',
      estimatedTime: parameters?.estimatedTime || '10',
      source: 'lesson-orchestrator',
      requestId,
      aiProvider: 'local-fallback',
      modelUsed: 'stub',
      attempts: 0,
      usedFallback: true
    }
  };
}

async function generateAllActivities(requestId, suggestions, sectionsContent) {
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Gerando ${suggestions.length} atividades`);
  
  const activities = [];
  const errors = [];

  for (const suggestion of suggestions) {
    const sectionContent = sectionsContent.find(s => s.sectionId === suggestion.sectionId);
    
    try {
      const activity = await generateActivity(requestId, suggestion, sectionContent?.content);
      activities.push(activity);
    } catch (error) {
      errors.push({ 
        sectionId: suggestion.sectionId, 
        activityId: suggestion.suggestion?.activityId,
        error: error.message 
      });
    }
  }

  log(LOG_PREFIXES.GENERATE, `[${requestId}] Geração concluída: ${activities.length} atividades, ${errors.length} erros`);

  return {
    activities,
    errors,
    totalGenerated: activities.length,
    totalFailed: errors.length
  };
}

export {
  generateActivity,
  generateAllActivities,
  generateActivityId,
  ACTIVITY_PROMPTS
};

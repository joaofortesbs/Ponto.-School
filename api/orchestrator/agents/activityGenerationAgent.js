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

import Groq from 'groq-sdk';
import { log, LOG_PREFIXES, logActivityGeneration } from '../debugLogger.js';

const API_KEY = process.env.GROQ_API_KEY?.trim();
const MODEL = 'llama-3.3-70b-versatile';

let groqClient = null;

function getGroqClient() {
  if (!groqClient && API_KEY) {
    groqClient = new Groq({ apiKey: API_KEY });
  }
  return groqClient;
}

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
  const { activityId, activityName, parameters } = suggestion.suggestion;
  
  logActivityGeneration(requestId, activityId, activityName);
  
  const client = getGroqClient();
  if (!client) {
    throw new Error('Cliente Groq não configurado');
  }

  const promptTemplate = ACTIVITY_PROMPTS[activityId] || ACTIVITY_PROMPTS['quiz-interativo'];
  
  const prompt = promptTemplate
    .replace('{title}', parameters?.title || suggestion.sectionName)
    .replace('{description}', parameters?.description || sectionContent?.substring(0, 500) || '')
    .replace('{difficulty}', parameters?.difficulty || 'médio');

  try {
    const startTime = Date.now();
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Você gera conteúdo educacional. Responda APENAS em JSON válido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const duration = Date.now() - startTime;
    const responseText = completion.choices[0]?.message?.content || '{}';

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
        requestId
      }
    };

    log(LOG_PREFIXES.GENERATE, `[${requestId}] Atividade ${generatedActivity.id} gerada em ${duration}ms`);
    
    return generatedActivity;

  } catch (error) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao gerar atividade ${activityId}:`, error.message);
    throw error;
  }
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

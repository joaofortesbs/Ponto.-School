/**
 * ====================================================================
 * AGENTE DE SUGESTÃO DE ATIVIDADES
 * ====================================================================
 * 
 * Este agente analisa o conteúdo textual de cada seção e sugere
 * atividades apropriadas do catálogo School Power.
 * 
 * RESPONSABILIDADES:
 * - Analisar o conteúdo de cada seção
 * - Consultar o catálogo de atividades disponíveis
 * - Sugerir 1 atividade por bloco (configurável)
 * - Retornar lista de atividades a serem geradas
 * 
 * VERSÃO: 2.0.0 - Com retry automático e fallback para Gemini
 * ÚLTIMA ATUALIZAÇÃO: 2025-12-23
 * ====================================================================
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log, LOG_PREFIXES, logActivitySuggestion } from '../debugLogger.js';
import { withRetryAndTimeout, getGroqClient } from '../../groq.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const MODEL = 'llama-3.3-70b-versatile';
const GEMINI_MODEL = 'gemini-2.0-flash';

let activitiesCatalog = null;

function loadActivitiesCatalog() {
  if (activitiesCatalog) return activitiesCatalog;
  
  try {
    const catalogPath = join(__dirname, '../../../src/features/schoolpower/data/schoolPowerActivities.json');
    const catalogContent = readFileSync(catalogPath, 'utf-8');
    activitiesCatalog = JSON.parse(catalogContent);
    log(LOG_PREFIXES.SUGGEST, `Catálogo carregado: ${activitiesCatalog.length} atividades disponíveis`);
    return activitiesCatalog;
  } catch (error) {
    log(LOG_PREFIXES.ERROR, `Erro ao carregar catálogo de atividades:`, error.message);
    activitiesCatalog = [
      { id: 'quiz-interativo', name: 'Quiz Interativo', description: 'Quiz gamificado para testar conhecimentos', tags: ['Quiz', 'Perguntas'], enabled: true },
      { id: 'flash-cards', name: 'Flash Cards', description: 'Cards de memorização', tags: ['Cards', 'Memorização'], enabled: true },
      { id: 'lista-exercicios', name: 'Lista de Exercícios', description: 'Exercícios práticos', tags: ['Exercícios', 'Prática'], enabled: true }
    ];
    return activitiesCatalog;
  }
}

const SUGGESTION_PROMPT = `Você é um especialista em pedagogia e design instrucional.
Analise o conteúdo educacional abaixo e sugira a atividade mais apropriada do catálogo.

CONTEÚDO DA SEÇÃO:
Título: {sectionName}
Conteúdo: {sectionContent}

CATÁLOGO DE ATIVIDADES DISPONÍVEIS:
{activitiesCatalog}

INSTRUÇÕES:
1. Analise o conteúdo e identifique o tipo de aprendizagem envolvido
2. Escolha UMA atividade do catálogo que melhor complementa este conteúdo
3. Justifique brevemente sua escolha
4. Sugira parâmetros específicos para a atividade

Responda em JSON com o formato:
{
  "activityId": "id-da-atividade",
  "activityName": "Nome da Atividade",
  "justification": "Por que esta atividade é apropriada",
  "parameters": {
    "title": "Título sugerido para a atividade",
    "description": "Descrição específica",
    "difficulty": "fácil|médio|difícil",
    "estimatedTime": "tempo estimado em minutos"
  }
}`;

function isRateLimitError(error) {
  return error?.status === 429 || 
         error?.message?.includes('rate limit') ||
         error?.message?.includes('429') ||
         error?.error?.code === 'rate_limit_exceeded';
}

async function generateWithGemini(systemPrompt, userPrompt, requestId) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini não disponível como fallback - GEMINI_API_KEY não configurada');
  }
  
  log(LOG_PREFIXES.SUGGEST, `[${requestId}] 🔄 Usando Gemini (${GEMINI_MODEL}) como fallback via REST...`);
  
  try {
    const fullPrompt = `${systemPrompt}\n\n---\n\nSolicitação do usuário:\n${userPrompt}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 500,
          topP: 0.9
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorData}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('Gemini não retornou conteúdo válido');
    }
    
    log(LOG_PREFIXES.SUGGEST, `[${requestId}] ✅ Gemini fallback retornou resposta`);
    return content;
    
  } catch (error) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] ❌ Erro no Gemini fallback:`, error.message);
    throw error;
  }
}

async function suggestActivityForSection(requestId, section, activitiesLimit = 1) {
  log(LOG_PREFIXES.SUGGEST, `[${requestId}] Analisando seção ${section.sectionId} para sugestões`);
  
  const catalog = loadActivitiesCatalog();
  const enabledActivities = catalog.filter(a => a.enabled !== false);
  
  const catalogStr = enabledActivities.map(a => 
    `- ID: ${a.id}, Nome: ${a.name}, Descrição: ${a.description}, Tags: ${a.tags?.join(', ') || 'N/A'}`
  ).join('\n');

  const prompt = SUGGESTION_PROMPT
    .replace('{sectionName}', section.sectionName)
    .replace('{sectionContent}', section.content.substring(0, 1000))
    .replace('{activitiesCatalog}', catalogStr);

  const systemPrompt = 'Você sugere atividades educacionais. Responda APENAS em JSON válido.';
  
  const startTime = Date.now();
  let responseText = '';
  let usedFallback = false;

  try {
    const completion = await withRetryAndTimeout(async () => {
      const client = getGroqClient();
      return await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 500
      });
    }, 3);

    responseText = completion.choices[0]?.message?.content || '{}';
    log(LOG_PREFIXES.SUGGEST, `[${requestId}] ✅ Groq retornou sugestão para ${section.sectionId}`);

  } catch (groqError) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] ⚠️ Groq falhou: ${groqError.message}`);
    
    if (isRateLimitError(groqError)) {
      log(LOG_PREFIXES.SUGGEST, `[${requestId}] 🔄 Tentando fallback para Gemini...`);
      
      try {
        responseText = await generateWithGemini(systemPrompt, prompt, requestId);
        usedFallback = true;
        log(LOG_PREFIXES.SUGGEST, `[${requestId}] ✅ Fallback Gemini bem-sucedido para ${section.sectionId}`);
      } catch (geminiError) {
        log(LOG_PREFIXES.ERROR, `[${requestId}] ❌ Fallback Gemini também falhou: ${geminiError.message}`);
        
        log(LOG_PREFIXES.SUGGEST, `[${requestId}] 📦 Usando atividade padrão (fallback local)`);
        return createFallbackResult(section, enabledActivities, startTime, 'Fallback local (API indisponível)');
      }
    } else {
      throw groqError;
    }
  }

  const duration = Date.now() - startTime;

  let suggestion;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    suggestion = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (parseError) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao parsear resposta, usando fallback`);
    return createFallbackResult(section, enabledActivities, startTime, 'Fallback devido a erro de parsing');
  }

  const validActivity = enabledActivities.find(a => a.id === suggestion.activityId);
  if (!validActivity) {
    log(LOG_PREFIXES.DEBUG, `[${requestId}] Atividade ${suggestion.activityId} não encontrada, usando primeira disponível`);
    suggestion.activityId = enabledActivities[0]?.id || 'quiz-interativo';
    suggestion.activityName = enabledActivities[0]?.name || 'Quiz Interativo';
  }

  const result = {
    sectionId: section.sectionId,
    sectionName: section.sectionName,
    suggestion,
    generatedAt: new Date().toISOString(),
    duration,
    usedFallback,
    aiProvider: usedFallback ? 'gemini' : 'groq'
  };

  logActivitySuggestion(requestId, section.sectionId, [suggestion.activityId]);
  return result;
}

function createFallbackResult(section, enabledActivities, startTime, justification) {
  const fallbackActivity = enabledActivities[0] || { id: 'quiz-interativo', name: 'Quiz Interativo' };
  
  const suggestion = {
    activityId: fallbackActivity.id,
    activityName: fallbackActivity.name,
    justification: justification,
    parameters: {
      title: `Quiz sobre ${section.sectionName}`,
      description: 'Atividade gerada automaticamente',
      difficulty: 'médio',
      estimatedTime: '10'
    }
  };

  return {
    sectionId: section.sectionId,
    sectionName: section.sectionName,
    suggestion,
    generatedAt: new Date().toISOString(),
    duration: Date.now() - startTime,
    usedFallback: true,
    aiProvider: 'fallback-local'
  };
}

async function suggestActivitiesForAllSections(requestId, sections, config = {}) {
  const { activitiesPerSection = 1, skipSections = ['objective', 'materiais', 'observacoes', 'bncc'] } = config;
  
  log(LOG_PREFIXES.SUGGEST, `[${requestId}] Sugerindo atividades para ${sections.length} seções`);
  log(LOG_PREFIXES.DEBUG, `[${requestId}] Seções ignoradas: ${skipSections.join(', ')}`);

  const suggestions = [];
  const errors = [];

  for (const section of sections) {
    if (skipSections.includes(section.sectionId)) {
      log(LOG_PREFIXES.DEBUG, `[${requestId}] Pulando seção ${section.sectionId} (na lista de ignorados)`);
      continue;
    }

    try {
      const result = await suggestActivityForSection(requestId, section, activitiesPerSection);
      suggestions.push(result);
    } catch (error) {
      log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao sugerir para ${section.sectionId}: ${error.message}`);
      
      const catalog = loadActivitiesCatalog();
      const enabledActivities = catalog.filter(a => a.enabled !== false);
      const fallbackResult = createFallbackResult(section, enabledActivities, Date.now(), `Fallback após erro: ${error.message}`);
      suggestions.push(fallbackResult);
      errors.push({ sectionId: section.sectionId, error: error.message, recoveredWithFallback: true });
    }
  }

  log(LOG_PREFIXES.SUGGEST, `[${requestId}] Sugestões concluídas: ${suggestions.length} sucesso, ${errors.length} erros recuperados`);

  return {
    suggestions,
    errors,
    totalSuggested: suggestions.length,
    totalFailed: errors.filter(e => !e.recoveredWithFallback).length
  };
}

export {
  suggestActivityForSection,
  suggestActivitiesForAllSections,
  loadActivitiesCatalog
};

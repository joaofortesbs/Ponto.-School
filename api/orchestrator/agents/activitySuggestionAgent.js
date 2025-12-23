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
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import Groq from 'groq-sdk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { log, LOG_PREFIXES, logActivitySuggestion } from '../debugLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_KEY = process.env.GROQ_API_KEY?.trim();
const MODEL = 'llama-3.3-70b-versatile';

let groqClient = null;
let activitiesCatalog = null;

function getGroqClient() {
  if (!groqClient && API_KEY) {
    groqClient = new Groq({ apiKey: API_KEY });
  }
  return groqClient;
}

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

async function suggestActivityForSection(requestId, section, activitiesLimit = 1) {
  log(LOG_PREFIXES.SUGGEST, `[${requestId}] Analisando seção ${section.sectionId} para sugestões`);
  
  const client = getGroqClient();
  if (!client) {
    throw new Error('Cliente Groq não configurado');
  }

  const catalog = loadActivitiesCatalog();
  const enabledActivities = catalog.filter(a => a.enabled !== false);
  
  const catalogStr = enabledActivities.map(a => 
    `- ID: ${a.id}, Nome: ${a.name}, Descrição: ${a.description}, Tags: ${a.tags?.join(', ') || 'N/A'}`
  ).join('\n');

  const prompt = SUGGESTION_PROMPT
    .replace('{sectionName}', section.sectionName)
    .replace('{sectionContent}', section.content.substring(0, 1000))
    .replace('{activitiesCatalog}', catalogStr);

  try {
    const startTime = Date.now();
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Você sugere atividades educacionais. Responda APENAS em JSON válido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const duration = Date.now() - startTime;
    const responseText = completion.choices[0]?.message?.content || '{}';

    let suggestion;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      suggestion = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao parsear resposta, usando fallback`);
      suggestion = {
        activityId: 'quiz-interativo',
        activityName: 'Quiz Interativo',
        justification: 'Fallback devido a erro de parsing',
        parameters: {
          title: `Quiz sobre ${section.sectionName}`,
          description: 'Quiz gerado automaticamente',
          difficulty: 'médio',
          estimatedTime: '10'
        }
      };
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
      duration
    };

    logActivitySuggestion(requestId, section.sectionId, [suggestion.activityId]);
    return result;

  } catch (error) {
    log(LOG_PREFIXES.ERROR, `[${requestId}] Erro ao sugerir atividade para ${section.sectionId}:`, error.message);
    throw error;
  }
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
      errors.push({ sectionId: section.sectionId, error: error.message });
    }
  }

  log(LOG_PREFIXES.SUGGEST, `[${requestId}] Sugestões concluídas: ${suggestions.length} sucesso, ${errors.length} erros`);

  return {
    suggestions,
    errors,
    totalSuggested: suggestions.length,
    totalFailed: errors.length
  };
}

export {
  suggestActivityForSection,
  suggestActivitiesForAllSections,
  loadActivitiesCatalog
};

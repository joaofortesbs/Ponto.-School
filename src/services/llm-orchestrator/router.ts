/**
 * LLM ORCHESTRATOR - SMART ROUTER
 * 
 * Roteamento inteligente baseado em:
 * - Complexidade do prompt
 * - Tipo de atividade
 * - Estado dos circuit breakers
 * - Rate limits
 * 
 * @version 3.0.0
 */

import type { 
  LLMModel, 
  QueryComplexity, 
  RoutingDecision, 
  ActivityType 
} from './types';
import { getActiveModels, getBestModelsForActivity } from './config';
import { isCircuitOpen, isRateLimited } from './guards';

// ============================================================================
// COMPLEXITY CLASSIFICATION
// ============================================================================

export function classifyComplexity(prompt: string): QueryComplexity {
  const wordCount = prompt.split(/\s+/).length;
  const charCount = prompt.length;
  
  const hasCodeKeywords = /\b(código|code|implementar|algoritmo|função|class|script|programação|python|javascript)\b/i.test(prompt);
  const hasComplexKeywords = /\b(analise|análise|compare|avalie|profundo|detalhado|completo|extenso|explicação detalhada|dissertação|redação)\b/i.test(prompt);
  const hasExpertKeywords = /\b(pesquisa científica|artigo acadêmico|tese|dissertação|metodologia|referências bibliográficas)\b/i.test(prompt);
  const hasSimpleKeywords = /\b(o que é|defina|liste|enumere|quanto|quando|onde|quem|sim ou não|verdadeiro ou falso)\b/i.test(prompt);
  const hasEducationalKeywords = /\b(questões|exercícios|quiz|flash.?cards|atividade|avaliação|prova|teste)\b/i.test(prompt);

  if (hasExpertKeywords || (hasComplexKeywords && hasCodeKeywords) || wordCount > 500) {
    return 'expert';
  }

  if (hasComplexKeywords || hasCodeKeywords || wordCount > 200 || charCount > 2000) {
    return 'complex';
  }

  if (hasSimpleKeywords && wordCount < 50 && !hasComplexKeywords) {
    return 'simple';
  }

  if (hasEducationalKeywords || wordCount > 50) {
    return 'moderate';
  }

  return 'simple';
}

// ============================================================================
// ACTIVITY TYPE DETECTION
// ============================================================================

export function detectActivityType(prompt: string): ActivityType {
  const lowerPrompt = prompt.toLowerCase();

  if (/lista.?(de)?.?exerc[ií]cios|exerc[ií]cios|quest[oõ]es/i.test(lowerPrompt)) {
    return 'lista-exercicios';
  }
  if (/quiz|question[aá]rio.?interativo|perguntas.?e.?respostas/i.test(lowerPrompt)) {
    return 'quiz-interativo';
  }
  if (/flash.?cards?|cart[oõ]es.?de.?mem[oó]ria|fichas/i.test(lowerPrompt)) {
    return 'flash-cards';
  }
  if (/plano.?de.?aula|planejamento.?de.?aula|aula.?estruturada/i.test(lowerPrompt)) {
    return 'plano-aula';
  }
  if (/sequ[eê]ncia.?did[aá]tica|sequencia.?didatica/i.test(lowerPrompt)) {
    return 'sequencia-didatica';
  }
  if (/quadro.?interativo|mapa.?mental|diagrama/i.test(lowerPrompt)) {
    return 'quadro-interativo';
  }
  if (/tese|reda[çc][aã]o|argumenta[çc][aã]o|texto.?dissertativo/i.test(lowerPrompt)) {
    return 'tese-redacao';
  }
  if (/avalia[çc][aã]o.?diagn[oó]stica|diagn[oó]stico/i.test(lowerPrompt)) {
    return 'avaliacao-diagnostica';
  }

  return 'general';
}

// ============================================================================
// MODEL SELECTION
// ============================================================================

export function getOptimalModels(
  complexity: QueryComplexity,
  activityType: ActivityType
): LLMModel[] {
  const allModels = getActiveModels();
  
  const availableModels = allModels.filter(model => {
    if (isCircuitOpen(model.id)) {
      console.log(`⏭️ [Router] Pulando ${model.id} (circuit open)`);
      return false;
    }
    if (model.provider !== 'local' && isRateLimited(model.provider)) {
      console.log(`⏭️ [Router] Pulando ${model.id} (rate limited)`);
      return false;
    }
    return true;
  });

  if (availableModels.length === 0) {
    console.warn('⚠️ [Router] Todos os modelos indisponíveis, usando fallback local');
    return allModels.filter(m => m.provider === 'local');
  }

  const bestForActivity = getBestModelsForActivity(activityType)
    .filter(m => availableModels.some(am => am.id === m.id));

  let preferredModels: LLMModel[];

  switch (complexity) {
    case 'simple':
      preferredModels = availableModels.filter(m => 
        m.tier === 'ultra-fast' || m.tier === 'fast'
      );
      break;
    
    case 'moderate':
      preferredModels = availableModels.filter(m => 
        m.tier === 'fast' || m.tier === 'balanced'
      );
      break;
    
    case 'complex':
      preferredModels = availableModels.filter(m => 
        m.tier === 'balanced' || m.tier === 'powerful'
      );
      break;
    
    case 'expert':
      preferredModels = availableModels.filter(m => 
        m.tier === 'powerful' || m.tier === 'balanced'
      );
      break;
    
    default:
      preferredModels = availableModels;
  }

  if (preferredModels.length === 0) {
    preferredModels = availableModels;
  }

  const merged = [...new Set([
    ...bestForActivity.slice(0, 3),
    ...preferredModels,
  ])];

  const localFallback = allModels.find(m => m.provider === 'local');
  if (localFallback && !merged.some(m => m.provider === 'local')) {
    merged.push(localFallback);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

// ============================================================================
// ROUTING DECISION
// ============================================================================

export function makeRoutingDecision(prompt: string): RoutingDecision {
  const complexity = classifyComplexity(prompt);
  const activityType = detectActivityType(prompt);
  const models = getOptimalModels(complexity, activityType);

  const reason = `Complexidade: ${complexity}, Tipo: ${activityType}, Modelos: ${models.map(m => m.id).slice(0, 3).join(', ')}...`;
  
  console.log(`🎯 [Router] ${reason}`);

  return {
    complexity,
    recommendedModels: models.map(m => m.id),
    reason,
  };
}

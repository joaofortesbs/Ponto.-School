/**
 * CAPABILITY 3: decidir_atividades_criar
 * 
 * Responsabilidade: IA analisa contexto completo (dados de cap1, cap2, 
 * contexto do usuário) e decide estrategicamente quais atividades criar.
 * 
 * Inputs: Resultado de pesquisar_atividades_conta + pesquisar_atividades_disponiveis + contexto
 * 
 * Architecture: Multi-Layer Resilience System v2.0
 * ═══════════════════════════════════════════════════
 * Layer 1: Tolerant JSON Parser (4-strategy extraction)
 * Layer 2: System Prompt Separation + Retry Loop (2 retries with corrective prompting)
 * Layer 3: Soft Validation + Auto-Repair (fix minor issues, only reject invalid IDs)
 * Layer 4: Smart Context-Aware Fallback (keyword-matching, respects quantity)
 * Layer 5: Pipeline & Template Field Integrity (preserve downstream-critical fields)
 */

import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import { callGeminiWithFunctionCalling } from '../../../../../../services/llm-orchestrator/providers/gemini';
import { getModelById } from '../../../../../../services/llm-orchestrator/config';
import { isCircuitOpen } from '../../../../../../services/llm-orchestrator/guards';
import { 
  ActivityFromCatalog,
  AtividadeForAI,
  ChosenActivity,
  DecisionContext,
  DecisionResult,
  DecisionValidation,
  SearchAccountActivitiesResult,
  SearchAvailableActivitiesResult,
  validateAIChoices,
  CapabilityInput,
  CapabilityOutput,
  DebugEntry,
  createDataConfirmation,
  createDataCheck
} from '../../shared/types';
import { formatAccountActivitiesForPrompt } from '../../../capabilities/PESQUISAR/implementations/pesquisar-atividades-conta';
import { formatAvailableActivitiesForPrompt, validateActivitySelection } from '../../../capabilities/PESQUISAR/implementations/pesquisar-atividades-disponiveis';

interface DecidirAtividadesCriarParams {
  account_activities: SearchAccountActivitiesResult;
  available_activities: SearchAvailableActivitiesResult;
  user_objective: string;
  user_context?: {
    disciplina?: string;
    turma?: {
      nome: string;
      nivel: string;
      alunos_count?: number;
    };
    objetivo_pedagogico?: string;
  };
  constraints?: {
    max_activities?: number;
    preferred_types?: string[];
    avoid_types?: string[];
  };
}

const MAX_RETRIES_V2 = 2;
const MAX_RETRIES = 2;
const DEFAULT_MAX_ACTIVITIES = 50;

const WORD_TO_NUMBER: Record<string, number> = {
  'uma': 1, 'um': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
  'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
};

const KEYWORD_TO_ACTIVITY_MAP: Record<string, string[]> = {
  'prova': ['prova-personalizada', 'simulado', 'multipla-escolha'],
  'simulado': ['simulado', 'prova-personalizada'],
  'bingo': ['bingo-educativo'],
  'caça-palavras': ['caca-palavras'],
  'caca-palavras': ['caca-palavras'],
  'palavras cruzadas': ['palavras-cruzadas'],
  'quiz': ['quiz-interativo'],
  'flash': ['flash-cards'],
  'flash card': ['flash-cards'],
  'lista': ['lista-exercicios'],
  'exercício': ['lista-exercicios'],
  'exercicio': ['lista-exercicios'],
  'plano de aula': ['plano-aula'],
  'aula': ['plano-aula', 'sequencia-didatica'],
  'sequência': ['sequencia-didatica'],
  'sequencia': ['sequencia-didatica'],
  'rubrica': ['rubrica-avaliacao'],
  'mapa mental': ['mapa-mental'],
  'redação': ['atividade-redacao', 'tese-redacao', 'prompt-escrita'],
  'redacao': ['atividade-redacao', 'tese-redacao', 'prompt-escrita'],
  'jogo': ['bingo-educativo', 'caca-palavras', 'jogo-show-milhao', 'desafios-sala'],
  'avaliação': ['prova-personalizada', 'avaliacao-diagnostica', 'rubrica-avaliacao'],
  'avaliacao': ['prova-personalizada', 'avaliacao-diagnostica', 'rubrica-avaliacao'],
  'planejamento': ['plano-aula', 'planejamento-anual', 'plano-unidade'],
  'resumo': ['resumo-fichamento', 'guia-estudo-apostila'],
  'estudo de caso': ['estudo-de-caso'],
  'debate': ['debate-estruturado'],
  'seminário': ['seminario-socratico'],
  'seminario': ['seminario-socratico'],
  'projeto': ['roteiro-projeto-pbl', 'atividade-steam'],
  'steam': ['atividade-steam', 'roteiro-laboratorio'],
  'laboratório': ['roteiro-laboratorio'],
  'laboratorio': ['roteiro-laboratorio'],
  'inclusão': ['atividade-diferenciada-inclusao', 'material-adaptado-nivel', 'plano-apoio-individualizado'],
  'inclusao': ['atividade-diferenciada-inclusao', 'material-adaptado-nivel', 'plano-apoio-individualizado'],
  'adaptado': ['material-adaptado-nivel', 'atividade-diferenciada-inclusao'],
  'cronograma': ['cronograma-estudos'],
  'apresentação': ['roteiro-apresentacao'],
  'apresentacao': ['roteiro-apresentacao'],
  'infográfico': ['infografico-textual'],
  'infografico': ['infografico-textual'],
  'gabarito': ['gabarito-comentado'],
  'texto': ['interpretacao-texto', 'leitura-com-perguntas', 'texto-mentor'],
  'leitura': ['leitura-com-perguntas', 'interpretacao-texto'],
  'vocabulário': ['lista-vocabulario-definicoes'],
  'vocabulario': ['lista-vocabulario-definicoes'],
  'diário': ['diario-reflexivo'],
  'diario': ['diario-reflexivo'],
  'newsletter': ['newsletter-turma'],
  'boletim': ['boletim-comentado-individual', 'comentarios-boletim'],
  'comunicado': ['comunicado-institucional'],
  'convite': ['convite-evento'],
  'resenha': ['resenha-critica'],
  'apostila': ['guia-estudo-apostila'],
  'guia': ['guia-estudo-apostila'],
};

const DECISION_SYSTEM_PROMPT = `Você é um especialista pedagógico que seleciona atividades educacionais de um catálogo.

REGRAS ABSOLUTAS:
1. Responda APENAS com JSON válido — sem texto antes, sem texto depois, sem markdown
2. Use SOMENTE IDs que existem na lista de IDs válidos fornecida
3. NUNCA invente IDs — se não tem certeza, escolha o mais próximo do catálogo
4. Cada atividade DEVE ter: id, titulo, justificativa (>10 chars), ordem_sugerida
5. Respeite a quantidade solicitada pelo professor
6. VARIEDADE OBRIGATÓRIA: Nunca escolha a mesma atividade duas vezes. Use CATEGORIAS DIFERENTES para criar um pacote pedagógico completo e diversificado
7. EQUILÍBRIO INTERATIVO-TEXTUAL: Inclua tanto atividades interativas quanto textuais conforme o contexto exigir — NUNCA escolha apenas atividades do mesmo tipo
8. MÍNIMO DE ATIVIDADES: Para qualquer pedido que não seja ultra-específico (ex: "uma prova específica"), escolha pelo menos 2 atividades de tipos DIFERENTES. Para pedidos de planejamento de aulas ou semanas, escolha entre 4 e 8 atividades complementares`;

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 1: TOLERANT JSON PARSER
// ═══════════════════════════════════════════════════════════════════════════

function extractQuantityFromObjective(objective: string): number | null {
  // NOTE: "aula" is intentionally excluded — "6 aulas" means 6 class sessions,
  // not 6 activities. Multi-class requests fall into the complex-request path (4-8 activities).
  const numericMatch = objective.match(/(\d+)\s*(atividade|exerc|quest|prova|material|lista|quiz|flash|jogo|rubrica|plano|sequência|sequencia)/i);
  if (numericMatch) return parseInt(numericMatch[1]);

  const wordMatch = objective.match(/\b(uma?|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\s+(atividade|exerc|quest|prova|material|lista|quiz|flash|jogo|rubrica|plano|sequência|sequencia)/i);
  if (wordMatch) return WORD_TO_NUMBER[wordMatch[1].toLowerCase()] || null;

  return null;
}

function isComplexMultiClassRequest(objective: string): boolean {
  return /semana\s+letiva|planejamento.*(?:semana|m[eê]s|per[ií]odo|bimestre|trimestre|semestre)|(\d+)\s*aulas?|dossi[eê]|flow\s+completo|pacote\s+completo|materiais\s+completos|período\s+letivo/i.test(objective);
}

function normalizeDecisionKeys(data: any): any {
  if (data && data.atividades_selecionadas && !data.atividades_escolhidas) {
    data.atividades_escolhidas = data.atividades_selecionadas;
    delete data.atividades_selecionadas;
  }
  if (data && data.total_selecionado && !data.total_escolhidas) {
    data.total_escolhidas = data.total_selecionado;
    delete data.total_selecionado;
  }
  return data;
}

function tolerantJsonParse(rawText: string): { success: boolean; data: any; strategy: string } {
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Strategy 1: Direct parse
  try {
    let data = JSON.parse(cleaned);
    data = normalizeDecisionKeys(data);
    if (data && data.atividades_escolhidas) {
      return { success: true, data, strategy: 'direct_parse' };
    }
  } catch {}

  // Strategy 2: Regex extract JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      let data = JSON.parse(jsonMatch[0]);
      data = normalizeDecisionKeys(data);
      if (data && data.atividades_escolhidas) {
        return { success: true, data, strategy: 'regex_extract' };
      }
    } catch {}
  }

  // Strategy 3: Fix common JSON issues (trailing commas, single quotes, unescaped newlines)
  if (jsonMatch) {
    try {
      let fixed = jsonMatch[0]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
      let data = JSON.parse(fixed);
      data = normalizeDecisionKeys(data);
      if (data && data.atividades_escolhidas) {
        return { success: true, data, strategy: 'auto_repair' };
      }
    } catch {}
  }

  // Strategy 4: Extract array of activities even without wrapper object
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const arr = JSON.parse(arrayMatch[0]);
      if (Array.isArray(arr) && arr.length > 0 && arr[0].id) {
        return {
          success: true,
          data: {
            atividades_escolhidas: arr,
            estrategia_pedagogica: 'Extraído de array parcial',
            total_escolhidas: arr.length
          },
          strategy: 'array_extract'
        };
      }
    } catch {}
  }

  // Strategy 5: Line-by-line ID extraction as last resort
  const idMatches = cleaned.match(/"id"\s*:\s*"([^"]+)"/g);
  if (idMatches && idMatches.length > 0) {
    const extracted = idMatches.map((m, idx) => {
      const idVal = m.match(/"id"\s*:\s*"([^"]+)"/);
      const titleMatch = cleaned.match(new RegExp(`"titulo"\\s*:\\s*"([^"]*)"`, 'g'));
      return {
        id: idVal ? idVal[1] : '',
        titulo: titleMatch && titleMatch[idx] ? titleMatch[idx].match(/"titulo"\s*:\s*"([^"]*)"/)?.[1] || '' : '',
        justificativa: 'Extraído por recuperação de emergência',
        ordem_sugerida: idx + 1
      };
    }).filter(a => a.id);

    if (extracted.length > 0) {
      return {
        success: true,
        data: {
          atividades_escolhidas: extracted,
          estrategia_pedagogica: 'Recuperação de emergência por extração de IDs',
          total_escolhidas: extracted.length
        },
        strategy: 'emergency_id_extraction'
      };
    }
  }

  return { success: false, data: null, strategy: 'all_failed' };
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 3: SOFT VALIDATION + AUTO-REPAIR
// ═══════════════════════════════════════════════════════════════════════════

function softValidateAndRepair(
  aiResponse: any,
  catalog: ActivityFromCatalog[],
  maxActivities: number
): { repaired: any; validation: DecisionValidation; repairs: string[] } {
  const repairs: string[] = [];
  const errors: string[] = [];

  if (!aiResponse || !aiResponse.atividades_escolhidas || !Array.isArray(aiResponse.atividades_escolhidas)) {
    return {
      repaired: aiResponse,
      validation: {
        all_ids_valid: false, count_within_limit: false, has_justification: false,
        no_duplicates: false, fields_complete: false,
        errors: ['Resposta da IA não contém atividades_escolhidas como array']
      },
      repairs: []
    };
  }

  const validIds = new Set(catalog.map(a => a.id));
  const catalogMap = new Map(catalog.map(a => [a.id, a]));

  const repairedActivities: any[] = [];
  const seenIds = new Set<string>();

  for (const choice of aiResponse.atividades_escolhidas) {
    if (!choice.id) continue;

    let id = choice.id;

    if (!validIds.has(id)) {
      const fuzzyMatch = catalog.find(a =>
        a.id.includes(id) || id.includes(a.id) ||
        a.titulo.toLowerCase().includes(id.toLowerCase()) ||
        id.toLowerCase().includes(a.titulo.toLowerCase())
      );
      if (fuzzyMatch) {
        repairs.push(`ID "${id}" corrigido para "${fuzzyMatch.id}" por fuzzy match`);
        id = fuzzyMatch.id;
      } else {
        errors.push(`ID "${id}" não existe no catálogo e não foi possível corrigir`);
        continue;
      }
    }

    if (seenIds.has(id)) {
      repairs.push(`ID duplicado "${id}" removido`);
      continue;
    }
    seenIds.add(id);

    const catalogEntry = catalogMap.get(id);
    const titulo = choice.titulo || catalogEntry?.titulo || id;
    const justificativa = (choice.justificativa && choice.justificativa.length > 5)
      ? choice.justificativa
      : `Atividade ${titulo} selecionada para atender ao objetivo pedagógico`;

    if (choice.justificativa !== justificativa) {
      repairs.push(`Justificativa de "${id}" auto-reparada (era "${choice.justificativa || 'vazia'}")`);
    }
    if (choice.titulo !== titulo) {
      repairs.push(`Título de "${id}" preenchido do catálogo`);
    }

    repairedActivities.push({
      ...choice,
      id,
      titulo,
      justificativa,
      ordem_sugerida: choice.ordem_sugerida || repairedActivities.length + 1
    });
  }

  const repairedResponse = {
    ...aiResponse,
    atividades_escolhidas: repairedActivities,
    total_escolhidas: repairedActivities.length
  };

  const all_ids_valid = repairedActivities.every(a => validIds.has(a.id));
  const count_within_limit = repairedActivities.length <= maxActivities;
  const has_justification = repairedActivities.every(a => a.justificativa && a.justificativa.length > 5);
  const no_duplicates = new Set(repairedActivities.map(a => a.id)).size === repairedActivities.length;
  const fields_complete = repairedActivities.every(a => a.id && a.titulo && a.ordem_sugerida !== undefined);

  if (repairedActivities.length === 0 && aiResponse.atividades_escolhidas.length > 0) {
    errors.push('Todos os IDs foram inválidos e não puderam ser reparados');
  }

  return {
    repaired: repairedResponse,
    validation: { all_ids_valid, count_within_limit, has_justification, no_duplicates, fields_complete, errors },
    repairs
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 4: SMART CONTEXT-AWARE FALLBACK
// ═══════════════════════════════════════════════════════════════════════════

function smartFallbackSelection(
  catalog: ActivityFromCatalog[],
  userObjective: string,
  requestedQuantity: number | null,
  maxActivities: number
): { activities: ActivityFromCatalog[]; strategy: string } {
  const objectiveLower = userObjective.toLowerCase();
  const matchedIds = new Set<string>();
  const matchReasons: string[] = [];

  const sortedKeywords = Object.entries(KEYWORD_TO_ACTIVITY_MAP)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [keyword, activityIds] of sortedKeywords) {
    if (objectiveLower.includes(keyword)) {
      for (const id of activityIds) {
        if (catalog.some(a => a.id === id)) {
          matchedIds.add(id);
          matchReasons.push(`"${keyword}" → ${id}`);
        }
      }
    }
  }

  const targetCount = requestedQuantity || Math.min(3, maxActivities);

  const PREFERRED_INTERACTIVE_IDS = ['lista-exercicios', 'quiz-interativo', 'flash-cards'];
  const interactiveKeywords = ['exerc', 'lista', 'quiz', 'flash', 'card', 'cartõ', 'question'];
  const mentionsInteractive = interactiveKeywords.some(kw => objectiveLower.includes(kw));

  if (matchedIds.size > 0) {
    let selected = catalog.filter(a => matchedIds.has(a.id));

    if (mentionsInteractive) {
      for (const prefId of PREFERRED_INTERACTIVE_IDS) {
        if (!matchedIds.has(prefId) && catalog.some(a => a.id === prefId) && selected.length < targetCount) {
          const interactiveActivity = catalog.find(a => a.id === prefId);
          if (interactiveActivity) {
            selected.push(interactiveActivity);
            matchedIds.add(prefId);
            matchReasons.push(`preferência interativa → ${prefId}`);
          }
        }
      }
    }

    if (selected.length < targetCount) {
      const remaining = catalog.filter(a => !matchedIds.has(a.id));
      const standard = remaining.filter(a => (a as any).pipeline === 'standard' || !(a as any).pipeline);
      const textual = remaining.filter(a => (a as any).pipeline === 'criar_arquivo_textual');
      const extras = [...standard, ...textual].slice(0, targetCount - selected.length);
      selected = [...selected, ...extras];
    }

    selected = selected.slice(0, targetCount);

    return {
      activities: selected,
      strategy: `Seleção inteligente por palavras-chave: ${matchReasons.slice(0, 3).join(', ')}`
    };
  }

  const standard = catalog.filter(a => (a as any).pipeline === 'standard' || !(a as any).pipeline);
  const textual = catalog.filter(a => (a as any).pipeline === 'criar_arquivo_textual');

  let diverseSelection: ActivityFromCatalog[] = [];
  const categories = new Set<string>();

  for (const a of [...standard, ...textual]) {
    if (diverseSelection.length >= targetCount) break;
    if (!categories.has(a.categoria)) {
      diverseSelection.push(a);
      categories.add(a.categoria);
    }
  }

  if (diverseSelection.length < targetCount) {
    const remaining = catalog.filter(a => !diverseSelection.some(s => s.id === a.id));
    diverseSelection = [...diverseSelection, ...remaining.slice(0, targetCount - diverseSelection.length)];
  }

  return {
    activities: diverseSelection.slice(0, targetCount),
    strategy: 'Seleção diversificada por categorias (fallback genérico)'
  };
}

function buildDecisionPrompt(context: DecisionContext): string {
  const accountContext = context.previous_activities.length > 0
    ? `
ATIVIDADES JÁ CRIADAS PELO PROFESSOR:
Total: ${context.previous_activities.length}
${context.previous_activities.map(a => `- ${a.titulo} (${a.tipo})`).join('\n')}
`
    : `
PROFESSOR NOVO: Nenhuma atividade anterior encontrada.
`;

  const standardActivities = context.available_activities.filter(a => (a as any).pipeline === 'standard' || !(a as any).pipeline);
  const textualActivities = context.available_activities.filter(a => (a as any).pipeline === 'criar_arquivo_textual');

  const groupedTextual = textualActivities.reduce((acc, a) => {
    const cat = a.categoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {} as Record<string, typeof textualActivities>);

  const standardSummary = standardActivities.map(a => `- ${a.titulo} (ID: ${a.id}) — ${a.descricao?.substring(0, 80)}`).join('\n');

  const textualSummary = Object.entries(groupedTextual).map(([cat, items]) => {
    const itemList = items.map(a => `  - ${a.titulo} (ID: ${a.id})`).join('\n');
    return `📁 ${cat.toUpperCase()}:\n${itemList}`;
  }).join('\n\n');

  const quantidadeExplicitaMatch = context.user_objective.match(/(\d+)\s*(atividade|exerc|quest|prova|material)/i);
  const quantidadeSolicitada = quantidadeExplicitaMatch ? parseInt(quantidadeExplicitaMatch[1]) : null;

  return `
# TAREFA: Decidir quais atividades criar

Você é um especialista pedagógico. Analise o pedido do professor e escolha as atividades MAIS ADEQUADAS do catálogo.

## OBJETIVO DO USUÁRIO
${context.user_objective}

## CONTEXTO DO PROFESSOR
- Disciplina: ${context.user_context.disciplina || 'Não especificada'}
- Turma: ${context.user_context.turma?.nome || 'Não especificada'}
- Nível: ${context.user_context.turma?.nivel || 'Não especificado'}
- Objetivo pedagógico: ${context.user_context.objetivo_pedagogico || context.user_objective}

${accountContext}

## 🔢 REGRA DE QUANTIDADE (OBRIGATÓRIA)
${quantidadeSolicitada
  ? `O professor pediu EXATAMENTE ${quantidadeSolicitada} atividade(s). Você DEVE escolher exatamente ${quantidadeSolicitada}. NÃO escolha mais nem menos.`
  : `O professor NÃO especificou quantidade. Analise o pedido com atenção ao contexto:
  - Se pediu UMA coisa MUITO específica (ex: "uma prova", "um bingo específico") → escolha 1 atividade
  - Se pediu atividades para uma aula ou tema (ex: "atividades sobre X") → escolha 2-3 atividades variadas
  - Se pediu planejamento de múltiplas aulas ou semanas (ex: "6 aulas", "semana letiva", "materiais para o semestre") → escolha 4-8 atividades variadas e complementares
  - Se pediu materiais completos ou pacote pedagógico (ex: "tudo sobre X", "plano completo") → escolha 5-8 atividades variadas`}

## CATÁLOGO COMPLETO — ATIVIDADES DISPONÍVEIS

### 🟢 ATIVIDADES INTERATIVAS (pipeline padrão — quiz, flash cards, lista)
${standardSummary}

### 🔵 ATIVIDADES TEXTUAIS (pipeline criar_arquivo — provas, jogos, rubricas, etc.)
${textualSummary}

IDs VÁLIDOS: ${context.available_activities.map(a => a.id).join(', ')}

## INSTRUÇÕES DE DECISÃO

1. LEIA o pedido do professor com atenção
2. RESPEITE a quantidade solicitada (regra acima)
3. ESCOLHA a atividade que MELHOR corresponde ao pedido:
   - Professor pediu "prova" → use prova-personalizada, NÃO lista-exercicios
   - Professor pediu "bingo" → use bingo-educativo, NÃO quiz-interativo
   - Professor pediu "rubrica" → use rubrica-avaliacao
   - Professor pediu "caça-palavras" → use caca-palavras
   - Professor pediu "plano de aula" → use plano-aula
4. VARIEDADE OBRIGATÓRIA: quando criar múltiplas atividades, use categorias DIFERENTES entre elas — nunca repita a mesma categoria
5. EQUILÍBRIO INTERATIVO-TEXTUAL: misture atividades interativas com textuais conforme o contexto:
   - "exercícios" / "lista" → inclua lista-exercicios (interativa) E complemente com textual variada
   - "quiz" → quiz-interativo (interativa) E complemente com outras atividades
   - "flash cards" → flash-cards (interativa) E complemente com outras atividades
   - NÃO escolha APENAS atividades interativas, NÃO escolha APENAS textuais — EQUILIBRE o pacote
6. CONTEXTO PEDAGÓGICO: Para pedidos de planejamento de aulas ou semanas letivas, SEMPRE escolha um conjunto diversificado:
   - plano de aula ou sequência didática + atividades de prática + avaliação/rubrica + material de engajamento

🎯 PRINCÍPIO DO PACOTE COMPLETO: Para pedidos complexos (semana letiva, planejamento de período, "Dossiê Ponto. Flow"), o pacote pedagógico ideal combina: planejamento estrutural + atividades de prática + avaliação + engajamento/gamificação.

⚠️ EXEMPLOS DE PADRÕES PEDAGÓGICOS — USE APENAS IDs DA LISTA ACIMA, NUNCA COPIE IDs DOS EXEMPLOS:
- "Crie exercícios de frações" → [atividade de exercícios do catálogo] + [atividade de plano ou avaliação do catálogo] (2 atividades)
- "Quiz sobre sistema solar" → [atividade tipo quiz do catálogo] + [plano ou sequência didática do catálogo] (2 atividades)
- "3 atividades sobre crônicas" → [atividade de prática] + [atividade de leitura/interpretação] + [atividade de produção/escrita] (exatamente 3 — tipos DIFERENTES entre si)
- "Flash cards de vocabulário" → [atividade de memorização do catálogo] + [atividade complementar de prática] (2 atividades)
- "Semana letiva / planejamento de múltiplas aulas" → [plano estrutural] + [sequência didática] + [atividade interativa de prática] + [lista ou exercícios] + [rubrica ou avaliação] + [atividade de engajamento] (4-8 atividades variadas por categorias)
- "Materiais completos sobre um tema" → [quiz] + [exercícios] + [estudo de caso ou projeto] + [plano] + [rubrica] (5 atividades de categorias diferentes)
- "Atividade inclusiva para alunos com necessidades especiais" → [atividade inclusiva ou adaptada do catálogo] (1 atividade específica — ÚNICA exceção para 1 atividade)
- "Crie uma prova de frações" → [prova ou avaliação do catálogo] (1 atividade — prova NÃO é exercício genérico)

## ⚠️ REGRA ANTI-ALUCINAÇÃO
- Use APENAS IDs da lista de IDs válidos acima
- NUNCA invente IDs

## FORMATO DE RESPOSTA (JSON VÁLIDO)

Retorne um objeto JSON com esta estrutura exata:

{
  "atividades_escolhidas": [
    {
      "id": "<ID_EXATO_DO_CATALOGO>",
      "titulo": "<Título da Atividade>",
      "justificativa": "<Explique por que esta atividade serve para o objetivo do professor>",
      "ordem_sugerida": 1
    },
    {
      "id": "<ID_EXATO_DO_CATALOGO>",
      "titulo": "<Título da Atividade>",
      "justificativa": "<Explique por que esta atividade complementa as demais>",
      "ordem_sugerida": 2
    }
  ],
  "estrategia_pedagogica": "<Descreva a estratégia pedagógica geral do conjunto escolhido>",
  "total_escolhidas": 2
}

⚠️ IMPORTANTE: Os campos <ID_EXATO_DO_CATALOGO> devem ser substituídos por IDs REAIS da lista de IDs válidos acima. NÃO use esses textos literalmente. NÃO copie IDs de exemplos. Escolha IDs que realmente atendam ao objetivo do professor.

Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações fora do JSON.
  `.trim();
}

function validateDecision(
  aiResponse: any,
  validCatalog: ActivityFromCatalog[],
  maxActivities: number
): DecisionValidation {
  const errors: string[] = [];
  
  if (!aiResponse || !aiResponse.atividades_escolhidas) {
    return {
      all_ids_valid: false,
      count_within_limit: false,
      has_justification: false,
      no_duplicates: false,
      fields_complete: false,
      errors: ['Resposta da IA não contém atividades_escolhidas']
    };
  }

  const chosenIds = aiResponse.atividades_escolhidas.map((a: any) => a.id);
  
  const validation = validateAIChoices(chosenIds, validCatalog);
  const all_ids_valid = validation.valid;
  if (!all_ids_valid) {
    errors.push(validation.error || 'IDs inválidos encontrados');
  }

  const count_within_limit = true;
  

  const has_justification = aiResponse.atividades_escolhidas.every(
    (a: any) => a.justificativa && a.justificativa.length > 10
  );
  if (!has_justification) {
    errors.push('Nem todas as atividades têm justificativa adequada');
  }

  const uniqueIds = new Set(chosenIds);
  const no_duplicates = uniqueIds.size === chosenIds.length;
  if (!no_duplicates) {
    errors.push('Existem IDs duplicados na seleção');
  }

  const fields_complete = aiResponse.atividades_escolhidas.every(
    (a: any) => a.id && a.titulo && a.ordem_sugerida !== undefined
  );
  if (!fields_complete) {
    errors.push('Campos obrigatórios ausentes em algumas atividades');
  }

  return {
    all_ids_valid,
    count_within_limit,
    has_justification,
    no_duplicates,
    fields_complete,
    errors
  };
}

function enrichChosenActivities(
  aiChoices: any[],
  catalog: ActivityFromCatalog[]
): ChosenActivity[] {
  return aiChoices.map((choice, index) => {
    const catalogActivity = catalog.find(a => a.id === choice.id);
    
    if (!catalogActivity) {
      console.warn(`⚠️ [DECIDIR] Atividade ${choice.id} não encontrada no catálogo`);
      return null;
    }

    return {
      id: catalogActivity.id,
      titulo: catalogActivity.titulo,
      tipo: catalogActivity.tipo,
      categoria: catalogActivity.categoria,
      materia: catalogActivity.materia,
      nivel_dificuldade: catalogActivity.nivel_dificuldade,
      tags: catalogActivity.tags,
      campos_obrigatorios: catalogActivity.campos_obrigatorios,
      campos_opcionais: catalogActivity.campos_opcionais || [],
      schema_campos: catalogActivity.schema_campos,
      campos_preenchidos: {},
      justificativa: choice.justificativa || 'Atividade selecionada estrategicamente',
      ordem_sugerida: choice.ordem_sugerida || (index + 1),
      status_construcao: 'aguardando' as const,
      progresso: 0,
      pipeline: catalogActivity.pipeline || 'standard',
      text_activity_template_id: catalogActivity.text_activity_template_id
    };
  }).filter(Boolean) as ChosenActivity[];
}

export async function decidirAtividadesCriar(
  params: DecidirAtividadesCriarParams
): Promise<DecisionResult> {
  console.log('🎯 [Capability:DECIDIR] Iniciando decisão de atividades');
  console.log('📊 [Capability:DECIDIR] Parâmetros recebidos:', {
    hasAvailableActivities: !!params.available_activities,
    availableCount: params.available_activities?.activities?.length || 0,
    hasAccountActivities: !!params.account_activities,
    accountCount: params.account_activities?.activities?.length || 0,
    userObjective: params.user_objective
  });
  
  const startTime = Date.now();
  const maxActivities = params.constraints?.max_activities || DEFAULT_MAX_ACTIVITIES;

  const requestedQuantity = extractQuantityFromObjective(params.user_objective || '');
  if (requestedQuantity) {
    console.log(`🔢 [Capability:DECIDIR] Quantidade explícita detectada: ${requestedQuantity}`);
  }

  // VALIDAR ENTRADAS
  const availableActivities = params.available_activities?.activities || [];
  const accountActivities = params.account_activities?.activities || [];
  
  if (availableActivities.length === 0) {
    console.error('❌ [Capability:DECIDIR] ERRO: Nenhuma atividade disponível recebida!');
    console.error('   Isso significa que pesquisar_atividades_disponiveis não foi executada corretamente.');
    
    // Retornar resultado vazio com erro
    return {
      success: false,
      validation: {
        all_ids_valid: false,
        count_within_limit: true,
        has_justification: false,
        no_duplicates: true,
        fields_complete: false,
        errors: ['Nenhuma atividade disponível para decisão - execute pesquisar_atividades_disponiveis primeiro']
      },
      chosen_activities: [],
      estrategia_pedagogica: 'Não foi possível decidir - catálogo vazio',
      total_escolhidas: 0,
      metadata: {
        decision_timestamp: new Date().toISOString(),
        attempt_number: 0,
        model_used: 'none'
      },
      // Dados de raciocínio para debug
      raciocinio: {
        catalogo_consultado: false,
        atividades_disponiveis: 0,
        atividades_anteriores: accountActivities.length,
        erro: 'Catálogo de atividades não foi carregado'
      }
    };
  }

  console.log(`✅ [Capability:DECIDIR] Catálogo recebido com ${availableActivities.length} atividades:`);
  console.log(`   IDs disponíveis: ${availableActivities.map(a => a.id).join(', ')}`);

  const context: DecisionContext = {
    user_objective: params.user_objective || 'Criar atividades educacionais',
    user_context: {
      disciplina: params.user_context?.disciplina,
      turma: params.user_context?.turma,
      objetivo_pedagogico: params.user_context?.objetivo_pedagogico || params.user_objective
    },
    available_activities: availableActivities,
    previous_activities: accountActivities,
    constraints: {
      max_activities: maxActivities,
      preferred_types: params.constraints?.preferred_types,
      avoid_types: params.constraints?.avoid_types
    }
  };

  let lastError: string | null = null;
  let attemptNumber = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    attemptNumber = attempt;
    console.log(`   Tentativa ${attempt}/${MAX_RETRIES}...`);

    try {
      const prompt = buildDecisionPrompt(context);
      
      if (attempt > 1 && lastError) {
        const reinforcedPrompt = `
${prompt}

⚠️ CORREÇÃO NECESSÁRIA (Tentativa ${attempt}):
Sua resposta anterior foi REJEITADA porque: ${lastError}

Por favor, corrija o erro e responda novamente com IDs VÁLIDOS do catálogo.
        `.trim();
        
        const result = await executeWithCascadeFallback(reinforcedPrompt);
        var aiResponse = result;
      } else {
        var aiResponse = await executeWithCascadeFallback(prompt);
      }

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Falha na chamada da API');
      }

      const cleanedText = aiResponse.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      const validation = validateDecision(
        parsedResponse,
        params.available_activities.activities,
        maxActivities
      );

      if (validation.errors.length === 0) {
        let chosenActivities = enrichChosenActivities(
          parsedResponse.atividades_escolhidas,
          availableActivities
        );

        if (requestedQuantity && chosenActivities.length > requestedQuantity) {
          console.log(`✂️ [Capability:DECIDIR] Trimming: AI retornou ${chosenActivities.length}, professor pediu ${requestedQuantity}`);
          chosenActivities = chosenActivities.slice(0, requestedQuantity);
        }

        console.log(`✅ [Capability:DECIDIR] Decisão aprovada: ${chosenActivities.length} atividades`);
        console.log(`   📋 Atividades escolhidas: ${chosenActivities.map(a => a.id).join(', ')}`);

        return {
          success: true,
          validation,
          chosen_activities: chosenActivities,
          estrategia_pedagogica: parsedResponse.estrategia_pedagogica || 'Estratégia baseada em diversidade e relevância',
          total_escolhidas: chosenActivities.length,
          metadata: {
            decision_timestamp: new Date().toISOString(),
            attempt_number: attemptNumber,
            model_used: aiResponse.modelUsed
          },
          // Dados de raciocínio para debug
          raciocinio: {
            catalogo_consultado: true,
            atividades_disponiveis: availableActivities.length,
            atividades_anteriores: accountActivities.length,
            ids_analisados: availableActivities.map(a => a.id),
            criterios_usados: ['objetivo_usuario', 'contexto_pedagogico', 'diversidade_tipos']
          }
        };
      }

      lastError = validation.errors.join('; ');
      console.warn(`⚠️ [Capability:DECIDIR] Validação falhou: ${lastError}`);

    } catch (error) {
      lastError = (error as Error).message;
      console.error(`❌ [Capability:DECIDIR] Erro na tentativa ${attempt}:`, error);
    }
  }

  console.error('❌ [Capability:DECIDIR] Todas as tentativas falharam, usando fallback');

  const fallbackCount = requestedQuantity || Math.min(3, maxActivities);
  const standardFallback = params.available_activities.activities
    .filter(a => (a as any).pipeline === 'standard' || !(a as any).pipeline)
    .slice(0, fallbackCount);
  const fallbackActivities = standardFallback.map((a, idx) => ({
      id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      categoria: a.categoria,
      materia: a.materia,
      nivel_dificuldade: a.nivel_dificuldade,
      tags: a.tags,
      campos_obrigatorios: a.campos_obrigatorios,
      campos_opcionais: a.campos_opcionais || [],
      schema_campos: a.schema_campos,
      campos_preenchidos: {},
      justificativa: 'Seleção automática (fallback)',
      ordem_sugerida: idx + 1,
      status_construcao: 'aguardando' as const,
      progresso: 0,
      pipeline: (a.pipeline || 'standard') as 'standard' | 'criar_arquivo_textual',
      text_activity_template_id: a.text_activity_template_id
    }));

  return {
    success: true,
    validation: {
      all_ids_valid: true,
      count_within_limit: true,
      has_justification: true,
      no_duplicates: true,
      fields_complete: true,
      errors: []
    },
    chosen_activities: fallbackActivities,
    estrategia_pedagogica: 'Seleção automática baseada no catálogo disponível (fallback após falha de IA)',
    total_escolhidas: fallbackActivities.length,
    metadata: {
      decision_timestamp: new Date().toISOString(),
      attempt_number: attemptNumber,
      model_used: 'fallback'
    },
    // Dados de raciocínio para debug (fallback)
    raciocinio: {
      catalogo_consultado: true,
      atividades_disponiveis: availableActivities.length,
      atividades_anteriores: accountActivities.length,
      ids_analisados: availableActivities.map(a => a.id),
      erro: lastError || 'Fallback acionado após falhas de IA'
    }
  };
}

export function formatDecisionForNextCapability(result: DecisionResult): string {
  return `
DECISÃO DE ATIVIDADES APROVADA:
═══════════════════════════════════════════════════════════

Total selecionado: ${result.total_escolhidas}
Estratégia: ${result.estrategia_pedagogica}

ATIVIDADES PARA CRIAR:
${result.chosen_activities.map((a, idx) => `
${idx + 1}. ${a.titulo} (ID: ${a.id})
   - Tipo: ${a.tipo}
   - Justificativa: ${a.justificativa}
   - Campos obrigatórios: ${a.campos_obrigatorios.join(', ')}
`).join('')}

Próximo passo: Capability 4 (criar_atividade) iniciará a construção.
  `.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSÃO V2 - API-FIRST CAPABILITY (Multi-Layer Resilience v2.0)
// ═══════════════════════════════════════════════════════════════════════════

export async function decidirAtividadesCriarV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugEntry[] = [];
  const startTime = Date.now();
  let retryCount = 0;

  try {
    // ═══ PHASE 1: DEPENDENCY VERIFICATION ═══
    console.error(`[decidirAtividadesCriarV2] Verificando dependências | previous_results: ${input.previous_results?.size || 0} | Chaves: ${input.previous_results ? Array.from(input.previous_results.keys()).join(', ') : 'NENHUMA'}`);
    
    const catalogResult = input.previous_results?.get('pesquisar_atividades_disponiveis');

    if (!catalogResult || !catalogResult.success || !catalogResult.data?.catalog) {
      const reason = !catalogResult ? 'não encontrada' : !catalogResult.success ? 'falhou' : 'catalog undefined';
      console.error(`❌ [decidirAtividadesCriarV2] Dependência ${reason}`);
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: `Dependência pesquisar_atividades_disponiveis ${reason}. Impossível decidir sem catálogo.`,
        technical_data: { reason, has_result: !!catalogResult, success: catalogResult?.success }
      });

      return buildCriticalFailureResponse(input, debug_log, startTime, `Dependência ${reason}: catálogo não disponível`);
    }

    const catalog = catalogResult.data.catalog as ActivityFromCatalog[];
    const validIds = catalogResult.data.valid_ids as string[];
    
    console.error(`✅ [decidirAtividadesCriarV2] Catálogo: ${catalog.length} atividades`);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'info',
      narrative: `Recebi catálogo com ${catalog.length} atividades da capability anterior. IDs válidos: ${validIds.length}`,
      technical_data: { catalog_count: catalog.length, valid_ids: validIds }
    });

    // ═══ PHASE 2: CONTEXT EXTRACTION ═══
    const userObjective = input.context.user_objective || input.context.objetivo || 'Criar atividades educacionais';
    const temaLimpo = input.context.tema_limpo || '';
    const disciplinaExtraida = input.context.disciplina_extraida || '';
    const turmaExtraida = input.context.turma_extraida || '';
    const maxActivities = input.context.max_activities || DEFAULT_MAX_ACTIVITIES;
    const userContext = input.context.user_context || {};

    const requestedQuantity = extractQuantityFromObjective(userObjective);
    if (requestedQuantity) {
      console.log(`🔢 [decidirAtividadesCriarV2] Quantidade explícita detectada: ${requestedQuantity}`);
    }

    if (temaLimpo) {
      console.log(`🎯 [decidirAtividadesCriarV2] Tema limpo: "${temaLimpo}" | Disciplina: "${disciplinaExtraida}"`);
    }

    // ═══ PHASE 2.5: WEB SEARCH ENRICHMENT ═══
    const webSearchResult = input.previous_results?.get('pesquisar_web');
    let webSearchContext = '';
    if (webSearchResult?.success && webSearchResult.data) {
      const wsData = webSearchResult.data;
      const wsResults = wsData.results || wsData.finalResults || [];
      const wsQuery = wsData.query || wsData.mainQuery || temaLimpo || '';

      if (wsResults.length > 0) {
        const officialSources = wsResults.filter((r: any) => r.domain_tier === 'official');
        const academicSources = wsResults.filter((r: any) => r.source_type === 'academic');
        const pedagogicalSources = wsResults.filter((r: any) => {
          const text = `${r.title || ''} ${r.snippet || ''}`.toLowerCase();
          return text.includes('plano de aula') || text.includes('atividade') || text.includes('sequência didática') || text.includes('sequencia didatica') || text.includes('recurso pedagóg');
        });

        const topicsFound = new Set<string>();
        for (const r of wsResults.slice(0, 8)) {
          const text = `${r.title || ''} ${r.snippet || ''}`.toLowerCase();
          if (text.includes('quiz') || text.includes('questionário')) topicsFound.add('questionários/quiz');
          if (text.includes('jogo') || text.includes('gamific') || text.includes('lúdic')) topicsFound.add('jogos/gamificação');
          if (text.includes('visual') || text.includes('mapa mental') || text.includes('infográfico')) topicsFound.add('recursos visuais');
          if (text.includes('exercício') || text.includes('exercicio') || text.includes('lista')) topicsFound.add('exercícios/listas');
          if (text.includes('prova') || text.includes('avaliação') || text.includes('avaliacao')) topicsFound.add('avaliações/provas');
          if (text.includes('flash') || text.includes('cartõ') || text.includes('memoriz')) topicsFound.add('flash cards/memorização');
          if (text.includes('projeto') || text.includes('steam') || text.includes('pbl')) topicsFound.add('projetos/STEAM');
          if (text.includes('debate') || text.includes('seminário') || text.includes('seminario')) topicsFound.add('debates/seminários');
          if (text.includes('redação') || text.includes('redacao') || text.includes('escrita')) topicsFound.add('produção textual');
          if (text.includes('laboratório') || text.includes('laboratorio') || text.includes('experiment')) topicsFound.add('atividades experimentais');
        }

        webSearchContext = `
## CONTEXTO DE PESQUISA WEB
O Jota pesquisou fontes educacionais e encontrou:
- Fontes oficiais: ${officialSources.length} (MEC, BNCC, etc.)
- Fontes acadêmicas: ${academicSources.length} (artigos, papers)
- Fontes pedagógicas: ${pedagogicalSources.length} (planos de aula, atividades)
- Total de fontes: ${wsResults.length}
- Tema pesquisado: "${wsQuery}"
${topicsFound.size > 0 ? `- Tipos de recursos encontrados: ${Array.from(topicsFound).join(', ')}` : ''}

Use estas informações para priorizar tipos de atividades que melhor se alinhem
com o conteúdo real disponível sobre o tema. Se a pesquisa encontrou muitos recursos
visuais, priorize atividades visuais (mapa mental, flash cards). Se encontrou
questões prontas, priorize lista de exercícios ou quiz. Se encontrou projetos e
gamificação, priorize atividades interativas e jogos educacionais.
`;

        console.log(`🌐 [decidirAtividadesCriarV2] Web search context injected: ${wsResults.length} results, ${topicsFound.size} topic types`);
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'info',
          narrative: `Contexto de pesquisa web injetado: ${wsResults.length} fontes encontradas. Tipos: ${Array.from(topicsFound).join(', ')}`,
          technical_data: {
            web_results_count: wsResults.length,
            official_count: officialSources.length,
            academic_count: academicSources.length,
            pedagogical_count: pedagogicalSources.length,
            topics_found: Array.from(topicsFound),
            query: wsQuery
          }
        });
      }
    }

    // ═══ PHASE 3: BUILD DECISION CONTEXT ═══
    const objectiveForDecision = temaLimpo 
      ? `${userObjective}\n\n🎯 TEMA PRINCIPAL EXTRAÍDO: ${temaLimpo}` 
      : userObjective;

    const decisionContext: DecisionContext = {
      user_objective: objectiveForDecision,
      user_context: {
        disciplina: userContext.disciplina || input.context.disciplina || disciplinaExtraida,
        turma: userContext.turma || (turmaExtraida ? { nome: turmaExtraida, nivel: '' } : undefined),
        objetivo_pedagogico: temaLimpo || userContext.objetivo_pedagogico || userObjective
      },
      available_activities: catalog,
      previous_activities: input.context.previous_activities || [],
      constraints: {
        max_activities: maxActivities,
        preferred_types: input.context.preferred_types,
        avoid_types: input.context.avoid_types
      }
    };

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `Contexto: objetivo="${userObjective.substring(0, 80)}..." | max=${maxActivities} | qty_solicitada=${requestedQuantity || 'auto'}`,
      technical_data: { objective: userObjective, max: maxActivities, requested_quantity: requestedQuantity }
    });

    // ═══ PHASE 4: LLM CALL WITH RETRY LOOP (Layer 2) ═══
    const basePrompt = buildDecisionPrompt(decisionContext);
    const prompt = webSearchContext ? `${basePrompt}\n\n${webSearchContext}` : basePrompt;
    let lastError: string | null = null;
    let lastRawResponse: string | null = null;

    // ═══ PHASE 4.0: TRY GEMINI FUNCTION CALLING FIRST (Layer 0) ═══
    const geminiModel = getModelById('gemini-2.5-flash');
    if (geminiModel && !isCircuitOpen('gemini-2.5-flash')) {
      try {
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'action',
          narrative: `Tentando Gemini Function Calling (structured output) antes do retry loop regular.`
        });

        const validIdsList = validIds.join(', ');
        const complexRequest = isComplexMultiClassRequest(userObjective);
        const targetQty = requestedQuantity 
          ? `EXATAMENTE ${requestedQuantity} atividade(s)` 
          : complexRequest
            ? 'entre 4 e 8 atividades variadas e complementares (é um planejamento de múltiplas aulas/período — DIVERSIFIQUE entre categorias: planejamento + prática + avaliação + engajamento)'
            : 'entre 2 e 4 atividades variadas e complementares (NUNCA apenas 1, a menos que seja um pedido extremamente específico de 1 atividade)';
        const fcPrompt = `Você é um especialista pedagógico. Analise o catálogo e selecione as atividades MAIS ADEQUADAS para o objetivo do professor.\n\nObjetivo do professor: ${userObjective}\n\nQuantidade OBRIGATÓRIA: ${targetQty}\n\nREGRA DE VARIEDADE: Escolha atividades de CATEGORIAS DIFERENTES. Combine interativas (quiz, lista, flash cards) com textuais (planos, provas, jogos). NUNCA escolha apenas 1 tipo. NUNCA copie IDs de exemplos — use apenas IDs do catálogo abaixo.\n\nCatálogo completo:\n${catalog.map(a => `- ${a.id}: ${a.titulo} (tipo: ${a.tipo}, categoria: ${a.categoria})`).join('\n')}\n\nIDs válidos: [${validIdsList}]${webSearchContext ? `\n\n${webSearchContext}` : ''}`;

        const fcResult = await callGeminiWithFunctionCalling(
          geminiModel,
          fcPrompt,
          [{
            name: 'selecionar_atividades',
            description: 'Seleciona múltiplas atividades educacionais do catálogo para o professor, com variedade entre categorias',
            parameters: {
              type: 'object',
              properties: {
                atividades_escolhidas: {
                  type: 'array',
                  description: 'Lista de atividades escolhidas. Deve ter pelo menos 2 atividades de categorias diferentes, exceto para pedidos ultra-específicos de 1 atividade.',
                  minItems: 2,
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', description: 'ID EXATO da atividade do catálogo (copie sem modificar)' },
                      titulo: { type: 'string', description: 'Título da atividade conforme catálogo' },
                      justificativa: { type: 'string', description: 'Por que esta atividade atende o objetivo do professor (mín. 20 chars)' },
                      ordem_sugerida: { type: 'number', description: 'Posição na sequência pedagógica (começar em 1)' },
                    },
                    required: ['id', 'titulo', 'justificativa', 'ordem_sugerida'],
                  },
                },
                estrategia_pedagogica: { type: 'string', description: 'Estratégia pedagógica geral que conecta todas as atividades escolhidas' },
              },
              required: ['atividades_escolhidas', 'estrategia_pedagogica'],
            },
          }],
          { systemPrompt: DECISION_SYSTEM_PROMPT, temperature: 0.3 }
        );

        if (fcResult.success && fcResult.data) {
          debug_log.push({
            timestamp: new Date().toISOString(),
            type: 'discovery',
            narrative: `Gemini Function Calling respondeu com sucesso. Processando resultado estruturado.`
          });

          const fcParsed = tolerantJsonParse(fcResult.data);
          if (fcParsed.success) {
            const { repaired, validation, repairs } = softValidateAndRepair(fcParsed.data, catalog, maxActivities);
            
            if (repaired.atividades_escolhidas.length > 0) {
              let chosenActivities = enrichChosenActivities(repaired.atividades_escolhidas, catalog);
              chosenActivities = chosenActivities.map(a => {
                const catalogEntry = catalog.find(c => c.id === a.id);
                return {
                  ...a,
                  pipeline: catalogEntry?.pipeline || a.pipeline || 'standard',
                  text_activity_template_id: catalogEntry?.text_activity_template_id || a.text_activity_template_id
                };
              });

              if (requestedQuantity && chosenActivities.length > requestedQuantity) {
                chosenActivities = chosenActivities.slice(0, requestedQuantity);
              }

              const elapsedTime = Date.now() - startTime;
              console.error(`✅ [decidirAtividadesCriarV2] SUCESSO via Gemini Function Calling | ${chosenActivities.length} atividades | ${elapsedTime}ms`);

              return {
                success: true,
                capability_id: 'decidir_atividades_criar',
                execution_id: input.execution_id,
                timestamp: new Date().toISOString(),
                data: {
                  chosen_activities: chosenActivities,
                  estrategia: repaired.estrategia_pedagogica || 'Estratégia via Gemini Function Calling',
                  count: chosenActivities.length,
                  validation
                },
                error: null,
                debug_log,
                data_confirmation: createDataConfirmation([
                  createDataCheck('gemini_fc', 'Gemini Function Calling utilizado', true, true, 'structured output'),
                  createDataCheck('activities_chosen', 'Atividades escolhidas', chosenActivities.length > 0, chosenActivities.length, '> 0'),
                ]),
                metadata: {
                  duration_ms: elapsedTime,
                  retry_count: 0,
                  data_source: 'gemini-function-calling',
                }
              };
            }
          }

          debug_log.push({
            timestamp: new Date().toISOString(),
            type: 'warning',
            narrative: `Gemini FC respondeu mas validação falhou. Caindo para retry loop regular.`
          });
        }
      } catch (fcError) {
        const fcMsg = fcError instanceof Error ? fcError.message : String(fcError);
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'warning',
          narrative: `Gemini Function Calling falhou: ${fcMsg}. Continuando com retry loop regular.`
        });
      }
    }

    // ═══ PHASE 4.1: REGULAR RETRY LOOP (Layer 2) ═══
    for (let attempt = 1; attempt <= MAX_RETRIES_V2 + 1; attempt++) {
      retryCount = attempt - 1;
      
      try {
        let currentPrompt = prompt;
        
        if (attempt > 1 && lastError) {
          currentPrompt = `${prompt}\n\n⚠️ CORREÇÃO (Tentativa ${attempt}): Sua resposta anterior foi REJEITADA: ${lastError}\n${lastRawResponse ? `Resposta anterior (primeiros 200 chars): ${lastRawResponse.substring(0, 200)}` : ''}\nCorrija e retorne JSON válido com IDs do catálogo.`;
        }

        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'action',
          narrative: `Tentativa ${attempt}/${MAX_RETRIES_V2 + 1}: Enviando para LLM com system prompt separado. Prompt: ${currentPrompt.length} chars.`,
          technical_data: { attempt, prompt_length: currentPrompt.length }
        });

        const aiResponse = await executeWithCascadeFallback(currentPrompt, {
          systemPrompt: DECISION_SYSTEM_PROMPT
        });

        if (!aiResponse.success || !aiResponse.data) {
          lastError = 'LLM não retornou resposta válida';
          lastRawResponse = null;
          continue;
        }

        lastRawResponse = aiResponse.data;

        const contaminationPatterns = [
          /^#\s+/m,
          /^\*\*Disciplina:\*\*/m,
          /^## Introdução/m,
          /^## Conceitos Principais/m,
          /Material gerado pelo Sistema Ponto School/,
          /^## Objetivo Geral/m,
          /^\*\*Série:\*\*/m,
        ];
        const isContaminated = contaminationPatterns.some(p => p.test(aiResponse.data));
        
        if (isContaminated) {
          lastError = 'Resposta contaminada: LLM retornou conteúdo educacional em Markdown ao invés de JSON de decisão (provavelmente fallback local interceptou)';
          debug_log.push({
            timestamp: new Date().toISOString(),
            type: 'warning',
            narrative: `Tentativa ${attempt}: CONTAMINAÇÃO DETECTADA — resposta é conteúdo educacional, não JSON de decisão. Pulando para próximo modelo. Preview: "${aiResponse.data.substring(0, 100)}..."`,
            technical_data: { contaminated: true, model: aiResponse.modelUsed, preview: aiResponse.data.substring(0, 200) }
          });
          continue;
        }

        // Layer 1: Tolerant JSON parsing
        const parseResult = tolerantJsonParse(aiResponse.data);

        if (!parseResult.success) {
          lastError = `JSON inválido (estratégias tentadas: ${parseResult.strategy})`;
          debug_log.push({
            timestamp: new Date().toISOString(),
            type: 'warning',
            narrative: `Tentativa ${attempt}: Parse falhou com todas as estratégias. Raw: "${aiResponse.data.substring(0, 150)}..."`,
            technical_data: { strategy: parseResult.strategy, raw_preview: aiResponse.data.substring(0, 300) }
          });
          continue;
        }

        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `JSON extraído via "${parseResult.strategy}": ${parseResult.data.atividades_escolhidas?.length || 0} atividades.`
        });

        // Layer 3: Soft validation + auto-repair
        const { repaired, validation, repairs } = softValidateAndRepair(parseResult.data, catalog, maxActivities);

        if (repairs.length > 0) {
          debug_log.push({
            timestamp: new Date().toISOString(),
            type: 'info',
            narrative: `Auto-reparos aplicados: ${repairs.join('; ')}`,
            technical_data: { repairs }
          });
        }

        if (validation.errors.length > 0 && repaired.atividades_escolhidas.length === 0) {
          lastError = validation.errors.join('; ');
          debug_log.push({
            timestamp: new Date().toISOString(),
            type: 'warning',
            narrative: `Tentativa ${attempt}: Validação falhou mesmo após auto-reparo: ${lastError}`,
            technical_data: { errors: validation.errors }
          });
          continue;
        }

        // ═══ SUCCESS PATH ═══
        let chosenActivities = enrichChosenActivities(repaired.atividades_escolhidas, catalog);

        // Layer 5: Pipeline & template field integrity
        chosenActivities = chosenActivities.map(a => {
          const catalogEntry = catalog.find(c => c.id === a.id);
          return {
            ...a,
            pipeline: catalogEntry?.pipeline || a.pipeline || 'standard',
            text_activity_template_id: catalogEntry?.text_activity_template_id || a.text_activity_template_id
          };
        });

        if (requestedQuantity && chosenActivities.length > requestedQuantity) {
          debug_log.push({
            timestamp: new Date().toISOString(),
            type: 'info',
            narrative: `Trimming: IA retornou ${chosenActivities.length}, professor pediu ${requestedQuantity}`
          });
          chosenActivities = chosenActivities.slice(0, requestedQuantity);
        }

        const elapsedTime = Date.now() - startTime;

        const dataConfirmation = createDataConfirmation([
          createDataCheck('catalog_received', 'Catálogo recebido da etapa anterior', catalog.length > 0, catalog.length, '> 0 atividades'),
          createDataCheck('ai_responded', 'IA respondeu com decisão', true, true, 'JSON válido'),
          createDataCheck('parse_strategy', 'Estratégia de parse', true, parseResult.strategy, 'qualquer'),
          createDataCheck('activities_chosen', 'Atividades foram escolhidas', chosenActivities.length > 0, chosenActivities.length, '> 0'),
          createDataCheck('all_ids_valid', 'Todos IDs existem no catálogo', validation.all_ids_valid, validation.all_ids_valid, 'true'),
          createDataCheck('no_duplicates', 'Sem duplicatas', validation.no_duplicates, validation.no_duplicates, 'true'),
          createDataCheck('repairs_applied', 'Auto-reparos aplicados', repairs.length > 0, repairs.length, '0 = perfeito'),
          createDataCheck('within_limit', 'Dentro do limite', validation.count_within_limit, chosenActivities.length, `<= ${maxActivities}`)
        ]);

        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'decision',
          narrative: `✅ Decisão validada (tentativa ${attempt}). Atividades: ${chosenActivities.map(a => `${a.titulo}[${a.pipeline || 'std'}]`).join(', ')}.`
        });

        console.error(`✅ [decidirAtividadesCriarV2] SUCESSO | ${chosenActivities.length} atividades | tentativa ${attempt} | ${elapsedTime}ms | parse: ${parseResult.strategy} | reparos: ${repairs.length}`);

        return {
          success: true,
          capability_id: 'decidir_atividades_criar',
          execution_id: input.execution_id,
          timestamp: new Date().toISOString(),
          data: {
            chosen_activities: chosenActivities,
            estrategia: repaired.estrategia_pedagogica || 'Estratégia pedagógica baseada em diversidade',
            count: chosenActivities.length,
            validation
          },
          error: null,
          debug_log,
          data_confirmation: dataConfirmation,
          metadata: {
            duration_ms: elapsedTime,
            retry_count: retryCount,
            data_source: aiResponse.modelUsed || 'llm_decision',
          }
        };

      } catch (attemptError) {
        lastError = attemptError instanceof Error ? attemptError.message : String(attemptError);
        console.error(`⚠️ [decidirAtividadesCriarV2] Tentativa ${attempt} falhou: ${lastError}`);
      }
    }

    // ═══ ALL RETRIES FAILED → SMART FALLBACK (Layer 4) ═══
    console.error(`⚠️ [decidirAtividadesCriarV2] Todas as tentativas LLM falharam. Ativando fallback inteligente.`);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'warning',
      narrative: `Todas as ${MAX_RETRIES_V2 + 1} tentativas LLM falharam (último erro: ${lastError}). Ativando seleção inteligente por palavras-chave.`
    });

    const fallback = smartFallbackSelection(catalog, userObjective, requestedQuantity, maxActivities);
    
    const fallbackActivities = fallback.activities.map((a, idx) => ({
      id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      categoria: a.categoria,
      materia: a.materia,
      nivel_dificuldade: a.nivel_dificuldade,
      tags: a.tags,
      campos_obrigatorios: a.campos_obrigatorios,
      campos_opcionais: a.campos_opcionais || [],
      schema_campos: a.schema_campos,
      campos_preenchidos: {},
      justificativa: `${fallback.strategy} — seleção automática após falha de IA`,
      ordem_sugerida: idx + 1,
      status_construcao: 'aguardando' as const,
      progresso: 0,
      pipeline: (a.pipeline || 'standard') as 'standard' | 'criar_arquivo_textual',
      text_activity_template_id: a.text_activity_template_id
    }));

    const elapsedTime = Date.now() - startTime;

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'info',
      narrative: `Fallback inteligente: ${fallbackActivities.length} atividades selecionadas. Estratégia: ${fallback.strategy}`
    });

    const fallbackConfirmation = createDataConfirmation([
      createDataCheck('fallback_used', 'Fallback acionado', true, 'sim', 'após falha LLM'),
      createDataCheck('smart_selection', 'Seleção inteligente', true, fallback.strategy.substring(0, 50), 'keyword-matching'),
      createDataCheck('fallback_count', 'Atividades selecionadas', fallbackActivities.length > 0, fallbackActivities.length, `>= 1`),
      createDataCheck('pipeline_preserved', 'Pipelines preservados', true, fallbackActivities.map(a => a.pipeline).join(','), 'standard|criar_arquivo_textual'),
      createDataCheck('catalog_available', 'Catálogo disponível', catalog.length > 0, catalog.length, '> 0')
    ]);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: fallbackConfirmation.summary,
      technical_data: { is_fallback: true, original_error: lastError, strategy: fallback.strategy }
    });

    return {
      success: true,
      capability_id: 'decidir_atividades_criar',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        chosen_activities: fallbackActivities,
        estrategia: fallback.strategy,
        count: fallbackActivities.length,
        is_fallback: true
      },
      error: null,
      debug_log,
      data_confirmation: fallbackConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: retryCount,
        data_source: 'smart_fallback'
      }
    };

  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`❌ [decidirAtividadesCriarV2] ERRO CRÍTICO: ${errorMessage}`);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `❌ ERRO CRÍTICO: ${errorMessage}`,
      technical_data: { 
        error: errorMessage, 
        stack: error instanceof Error ? error.stack : undefined,
        previous_results_size: input.previous_results?.size || 0,
        previous_results_keys: input.previous_results ? Array.from(input.previous_results.keys()) : []
      }
    });

    // Last-resort: try smart fallback even from catch block
    const catalogResult = input.previous_results?.get('pesquisar_atividades_disponiveis');
    const catalog = catalogResult?.data?.catalog || [];
    
    if (catalog.length === 0) {
      return buildCriticalFailureResponse(input, debug_log, startTime, errorMessage);
    }

    const userObjective = input.context.user_objective || input.context.objetivo || '';
    const requestedQuantity = extractQuantityFromObjective(userObjective);
    const maxActivities = input.context.max_activities || DEFAULT_MAX_ACTIVITIES;
    const fallback = smartFallbackSelection(catalog, userObjective, requestedQuantity, maxActivities);

    const emergencyActivities = fallback.activities.map((a: ActivityFromCatalog, idx: number) => ({
      id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      categoria: a.categoria,
      materia: a.materia,
      nivel_dificuldade: a.nivel_dificuldade,
      tags: a.tags,
      campos_obrigatorios: a.campos_obrigatorios,
      campos_opcionais: a.campos_opcionais || [],
      schema_campos: a.schema_campos,
      campos_preenchidos: {},
      justificativa: `Recuperação de emergência: ${fallback.strategy}`,
      ordem_sugerida: idx + 1,
      status_construcao: 'aguardando' as const,
      progresso: 0,
      pipeline: (a.pipeline || 'standard') as 'standard' | 'criar_arquivo_textual',
      text_activity_template_id: a.text_activity_template_id
    }));

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'warning',
      narrative: `Recuperação de emergência: ${emergencyActivities.length} atividades via ${fallback.strategy}`
    });

    const emergencyConfirmation = createDataConfirmation([
      createDataCheck('emergency_fallback', 'Recuperação de emergência', true, 'ativa', 'último recurso'),
      createDataCheck('activities_recovered', 'Atividades recuperadas', emergencyActivities.length > 0, emergencyActivities.length, '>= 1')
    ]);

    return {
      success: true,
      capability_id: 'decidir_atividades_criar',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        chosen_activities: emergencyActivities,
        estrategia: `Recuperação de emergência: ${fallback.strategy}`,
        count: emergencyActivities.length,
        is_fallback: true
      },
      error: null,
      debug_log,
      data_confirmation: emergencyConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: retryCount,
        data_source: 'emergency_fallback'
      }
    };
  }
}

function buildCriticalFailureResponse(
  input: CapabilityInput,
  debug_log: DebugEntry[],
  startTime: number,
  errorMessage: string
): CapabilityOutput {
  const elapsedTime = Date.now() - startTime;
  
  const failureConfirmation = createDataConfirmation([
    createDataCheck('catalog_available', 'Catálogo disponível', false, 0, '> 0'),
    createDataCheck('can_proceed', 'Pode continuar', false, 'não', 'sim')
  ]);

  return {
    success: false,
    capability_id: 'decidir_atividades_criar',
    execution_id: input.execution_id,
    timestamp: new Date().toISOString(),
    data: {
      chosen_activities: [],
      estrategia: '',
      count: 0,
      is_fallback: true
    },
    error: {
      code: 'CATALOG_NOT_AVAILABLE',
      message: `Não foi possível decidir atividades: ${errorMessage}. O catálogo de atividades não foi carregado corretamente.`,
      severity: 'critical',
      recoverable: false,
      recovery_suggestion: 'Verificar se pesquisar_atividades_disponiveis foi executado com sucesso antes desta capability.'
    },
    debug_log,
    data_confirmation: failureConfirmation,
    metadata: {
      duration_ms: elapsedTime,
      retry_count: 0,
      data_source: 'none'
    }
  };
}

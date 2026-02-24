import { detectResearchNeed, type NeedDetectionResult } from './need-detection';
import { formatResearchContextForConversation, extractSearchSummary } from './response-with-sources';
import { pesquisarWebV2 } from '../capabilities/PESQUISAR/implementations/pesquisar-web';
import { createDebugEntry, useDebugStore } from '../../interface-chat-producao/debug-system/DebugStore';
import type { DebugEntryType } from '../../interface-chat-producao/debug-system/types';
import type { CapabilityOutput } from '../capabilities/shared/types';

export interface ResearchEnrichmentResult {
  enriched: boolean;
  searchExecuted: boolean;
  searchData?: CapabilityOutput;
  formattedContext?: string;
  capabilityId?: string;
  debugInfo: {
    needDetection: { needsResearch: boolean; confidence: number; source: string; reasoning: string };
    searchDuration?: number;
    sourcesFound?: number;
  };
}

export type SearchDepthHint = 'basic' | 'advanced';

function determineSearchDepth(needResult: NeedDetectionResult): SearchDepthHint {
  if (needResult.confidence >= 0.90) {
    return 'advanced';
  }
  if (needResult.source === 'fast_rules' && needResult.confidence >= 0.85) {
    return 'advanced';
  }
  return 'basic';
}

function mapDebugLogType(type: string): DebugEntryType {
  const typeMap: Record<string, DebugEntryType> = {
    'info': 'info',
    'action': 'action',
    'decision': 'decision',
    'discovery': 'discovery',
    'error': 'error',
    'warning': 'warning',
    'reflection': 'reflection',
    'confirmation': 'confirmation',
    'success': 'discovery',
    'start': 'action',
    'end': 'action',
    'progress': 'info',
    'validation': 'confirmation',
  };
  return typeMap[type?.toLowerCase()] || 'info';
}

function formatPesquisarWebNarrative(searchOutput: CapabilityOutput, searchQuery: string): string {
  const data = searchOutput.data || {};
  const count = data.count || 0;
  const query = data.query_principal || searchQuery;
  const fonteCount = data.breakdown?.fontes_educacionais || 0;
  const bnccCount = data.breakdown?.habilidades_bncc || 0;
  return `Pesquisei em fontes educacionais brasileiras confiáveis sobre "${query}". Encontrei ${count} recurso(s): ${bnccCount} habilidade(s) BNCC e ${fonteCount} fonte(s) educacional(is) selecionada(s).`;
}

export async function executeResearchEnrichment(
  userPrompt: string,
  sessionId: string,
  userId: string
): Promise<ResearchEnrichmentResult> {
  console.log(`🔬 [REL] ═══════════════════════════════════════`);
  console.log(`🔬 [REL] Input: "${userPrompt.substring(0, 100)}"`);

  const needResult = await detectResearchNeed(userPrompt);

  const baseDebugInfo = {
    needDetection: {
      needsResearch: needResult.needsResearch,
      confidence: needResult.confidence,
      source: needResult.source,
      reasoning: needResult.reasoning,
    },
  };

  if (!needResult.needsResearch) {
    console.log(`🔬 [REL] Pesquisa NÃO necessária — fluxo normal`);
    console.log(`🔬 [REL] ═══════════════════════════════════════\n`);
    return {
      enriched: false,
      searchExecuted: false,
      debugInfo: baseDebugInfo,
    };
  }

  console.log(`🔬 [REL] Pesquisa NECESSÁRIA — executando pesquisarWebV2...`);

  const searchDepth = determineSearchDepth(needResult);
  const searchQuery = needResult.suggestedQuery || userPrompt;
  const capId = `rel_pesquisar_web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const capDisplayName = 'Pesquisar Fontes Educacionais';

  useDebugStore.getState().startCapability(capId, capDisplayName);

  createDebugEntry(
    capId,
    capDisplayName,
    'action',
    `Iniciando pesquisa educacional: "${searchQuery.substring(0, 80)}" (profundidade: ${searchDepth})`,
    'low',
    { query: searchQuery, search_depth: searchDepth, source: needResult.source, confidence: needResult.confidence }
  );

  const searchInput = {
    capability_id: 'pesquisar_web',
    execution_id: capId,
    context: {
      query: searchQuery,
      busca_texto: userPrompt,
      solicitacao: userPrompt,
      search_depth: searchDepth,
      search_mode: 'full' as const,
      max_resultados: 10,
      user_id: userId,
      professor_id: userId,
      session_id: sessionId,
    },
    previous_results: new Map(),
  };

  try {
    const searchStartTime = Date.now();
    const searchOutput = await pesquisarWebV2(searchInput);
    const searchDuration = Date.now() - searchStartTime;

    if (searchOutput.debug_log && Array.isArray(searchOutput.debug_log)) {
      console.log(`🔬 [REL] Processando ${searchOutput.debug_log.length} debug entries do pesquisarWebV2`);

      for (const entry of searchOutput.debug_log) {
        const entryType = mapDebugLogType(entry.type);
        createDebugEntry(
          capId,
          capDisplayName,
          entryType,
          entry.narrative || entry.message || 'Log entry',
          entry.severity || 'low',
          entry.technical_data || entry.data || undefined
        );
        console.log(`🔬 [REL] ${entry.narrative || entry.message || 'Log entry'}`);
      }
    }

    if (!searchOutput.success || !searchOutput.data) {
      console.warn(`⚠️ [REL] Pesquisa falhou — continuando sem enriquecimento`);

      createDebugEntry(capId, capDisplayName, 'error',
        `Pesquisa não retornou resultados válidos (success=${searchOutput.success})`,
        'medium'
      );
      useDebugStore.getState().endCapability(capId);

      console.log(`🔬 [REL] ═══════════════════════════════════════\n`);
      return {
        enriched: false,
        searchExecuted: true,
        searchData: searchOutput,
        capabilityId: capId,
        debugInfo: {
          ...baseDebugInfo,
          searchDuration,
          sourcesFound: 0,
        },
      };
    }

    const summary = extractSearchSummary(searchOutput);
    const formattedContext = formatResearchContextForConversation(searchOutput, searchQuery);

    const narrativeSummary = formatPesquisarWebNarrative(searchOutput, searchQuery);
    createDebugEntry(capId, capDisplayName, 'discovery', narrativeSummary, 'low', {
      count: summary.sourcesFound,
      query: summary.searchQuery,
      breakdown: searchOutput.data?.breakdown,
      top_source: summary.topSourceTitle,
      duration_ms: searchDuration,
    });

    useDebugStore.getState().endCapability(capId);

    console.log(`🔬 [REL] ✅ Pesquisa concluída: ${summary.sourcesFound} fontes em ${searchDuration}ms`);
    console.log(`🔬 [REL] Top fonte: ${summary.topSourceTitle}`);
    console.log(`🔬 [REL] Breakdown: ${JSON.stringify(searchOutput.data?.breakdown || {})}`);
    console.log(`🔬 [REL] Context formatado: ${formattedContext.length} chars para injeção no prompt`);
    console.log(`🔬 [REL] ═══════════════════════════════════════\n`);

    return {
      enriched: true,
      searchExecuted: true,
      searchData: searchOutput,
      formattedContext,
      capabilityId: capId,
      debugInfo: {
        ...baseDebugInfo,
        searchDuration,
        sourcesFound: summary.sourcesFound,
      },
    };
  } catch (error) {
    console.error(`❌ [REL] Erro na pesquisa:`, error);

    createDebugEntry(capId, capDisplayName, 'error',
      `Erro durante a pesquisa: ${error instanceof Error ? error.message : String(error)}`,
      'high'
    );
    useDebugStore.getState().endCapability(capId);

    console.log(`🔬 [REL] ═══════════════════════════════════════\n`);
    return {
      enriched: false,
      searchExecuted: true,
      capabilityId: capId,
      debugInfo: {
        ...baseDebugInfo,
        searchDuration: 0,
        sourcesFound: 0,
      },
    };
  }
}

export { detectResearchNeed } from './need-detection';
export { formatResearchContextForConversation, extractSearchSummary } from './response-with-sources';

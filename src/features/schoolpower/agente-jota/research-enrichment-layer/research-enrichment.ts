import { detectResearchNeed, type NeedDetectionResult } from './need-detection';
import { formatResearchContextForConversation, extractSearchSummary } from './response-with-sources';
import { pesquisarWebV2 } from '../capabilities/PESQUISAR/implementations/pesquisar-web';
import type { CapabilityOutput } from '../capabilities/shared/types';

export interface ResearchEnrichmentResult {
  enriched: boolean;
  searchExecuted: boolean;
  searchData?: CapabilityOutput;
  formattedContext?: string;
  debugInfo: {
    needDetection: { needsResearch: boolean; confidence: number; source: string; reasoning: string };
    searchDuration?: number;
    sourcesFound?: number;
  };
}

export type SearchDepthHint = 'basic' | 'advanced';

function determineSearchDepth(needResult: NeedDetectionResult): SearchDepthHint {
  if (needResult.source === 'fast_rules' && needResult.confidence >= 0.90) {
    return 'advanced';
  }
  return 'basic';
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

  const searchInput = {
    capability_id: 'pesquisar_web',
    execution_id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    context: {
      query: searchQuery,
      busca_texto: userPrompt,
      solicitacao: userPrompt,
      search_depth: searchDepth,
      search_mode: 'full' as const,
      max_resultados: 8,
    },
    previous_results: new Map(),
  };

  try {
    const searchStartTime = Date.now();
    const searchOutput = await pesquisarWebV2(searchInput);
    const searchDuration = Date.now() - searchStartTime;

    if (!searchOutput.success || !searchOutput.data) {
      console.warn(`⚠️ [REL] Pesquisa falhou — continuando sem enriquecimento`);
      console.log(`🔬 [REL] ═══════════════════════════════════════\n`);
      return {
        enriched: false,
        searchExecuted: true,
        searchData: searchOutput,
        debugInfo: {
          ...baseDebugInfo,
          searchDuration,
          sourcesFound: 0,
        },
      };
    }

    const summary = extractSearchSummary(searchOutput);
    const formattedContext = formatResearchContextForConversation(searchOutput, searchQuery);

    console.log(`🔬 [REL] ✅ Pesquisa concluída: ${summary.sourcesFound} fontes em ${searchDuration}ms`);
    console.log(`🔬 [REL] Top fonte: ${summary.topSourceTitle}`);
    console.log(`🔬 [REL] ═══════════════════════════════════════\n`);

    return {
      enriched: true,
      searchExecuted: true,
      searchData: searchOutput,
      formattedContext,
      debugInfo: {
        ...baseDebugInfo,
        searchDuration,
        sourcesFound: summary.sourcesFound,
      },
    };
  } catch (error) {
    console.error(`❌ [REL] Erro na pesquisa:`, error);
    console.log(`🔬 [REL] ═══════════════════════════════════════\n`);
    return {
      enriched: false,
      searchExecuted: true,
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

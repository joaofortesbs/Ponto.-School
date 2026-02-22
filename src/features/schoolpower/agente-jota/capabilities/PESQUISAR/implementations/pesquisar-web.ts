import type {
  CapabilityInput,
  CapabilityOutput,
  DebugEntry,
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';

interface PesquisarWebParams {
  query?: string;
  tema?: string;
  disciplina?: string;
  ano_serie?: string;
  busca_texto?: string;
  componente?: string;
  disciplina_extraida?: string;
  turma_extraida?: string;
  tema_limpo?: string;
  max_resultados?: number;
  search_depth?: 'basic' | 'advanced';
}

interface WebResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  domain_tier: string;
  source_label: string;
  content_extracted?: boolean;
}

function buildSearchQueries(params: PesquisarWebParams): string[] {
  const queries: string[] = [];
  const tema = params.tema || params.busca_texto || params.query || params.tema_limpo || '';
  const disciplina = params.disciplina || params.componente || params.disciplina_extraida || '';
  const ano = params.ano_serie || params.turma_extraida || '';

  if (tema) {
    if (disciplina && ano) {
      queries.push(`${tema} ${disciplina} ${ano} BNCC habilidades`);
      queries.push(`plano de aula ${tema} ${ano} ensino fundamental Brasil`);
      queries.push(`${tema} ${disciplina} atividades práticas professor site:novaescola.org.br OR site:mec.gov.br`);
    } else if (disciplina) {
      queries.push(`${tema} ${disciplina} BNCC habilidades educação brasileira`);
      queries.push(`plano de aula ${tema} ${disciplina} ensino fundamental Brasil`);
    } else if (ano) {
      queries.push(`${tema} ${ano} BNCC currículo nacional habilidades`);
      queries.push(`${tema} ${ano} atividades pedagógicas professores Brasil`);
    } else {
      queries.push(`${tema} BNCC habilidades educação básica`);
      queries.push(`${tema} plano de aula recursos pedagógicos site:novaescola.org.br`);
    }
  } else {
    queries.push('BNCC habilidades educação básica Brasil currículo nacional');
  }

  return queries.slice(0, 3);
}

function formatResultsForPrompt(results: WebResult[], query: string, queriesUsed: string[]): string {
  if (results.length === 0) {
    return 'Nenhum resultado encontrado para a pesquisa web educacional realizada.';
  }

  const parts: string[] = [
    '══════════════════════════════════════════════════════',
    '🌐 RESULTADOS DA PESQUISA WEB EDUCACIONAL',
    `Query principal: "${query}"`,
    `Consultas realizadas: ${queriesUsed.length} | Recursos selecionados: ${results.length}`,
    '══════════════════════════════════════════════════════',
    '',
  ];

  results.forEach((r, idx) => {
    const relevancia = r.score >= 0.80 ? '⭐ ALTA RELEVÂNCIA' :
                       r.score >= 0.55 ? '✓ BOA RELEVÂNCIA' : '◦ RELEVÂNCIA MODERADA';
    const tierLabel = r.domain_tier === 'alta' ? '🏛️ Fonte Oficial/Especializada' :
                      r.domain_tier === 'media' ? '📚 Fonte Educacional' : '🌐 Recurso Web';
    parts.push(`[${idx + 1}] ${relevancia} — ${tierLabel}`);
    parts.push(`Título: ${r.title}`);
    parts.push(`Fonte: ${r.source_label}`);
    parts.push(`URL: ${r.url}`);
    parts.push(`Conteúdo: ${r.snippet.slice(0, 350)}`);
    parts.push('');
  });

  parts.push('══════════════════════════════════════════════════════');
  parts.push('INSTRUÇÃO: Use as fontes acima para embasar e enriquecer o conteúdo gerado. Cite as fontes relevantes no resultado final quando pertinente.');
  parts.push('══════════════════════════════════════════════════════');

  return parts.join('\n');
}

export async function pesquisarWebV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugEntry[] = [];
  const startTime = Date.now();
  const params = (input.context || {}) as PesquisarWebParams;

  if (!params.componente && params.disciplina_extraida) params.componente = params.disciplina_extraida;
  if (!params.disciplina && params.disciplina_extraida) params.disciplina = params.disciplina_extraida;
  if (!params.ano_serie && params.turma_extraida) params.ano_serie = params.turma_extraida;
  if (!params.tema && params.tema_limpo) params.tema = params.tema_limpo;
  if (!params.busca_texto && params.tema_limpo) params.busca_texto = params.tema_limpo;

  const mainQuery = params.query || params.tema || params.busca_texto || 'BNCC educação básica Brasil';
  const searchDepth = params.search_depth || 'basic';

  try {
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🌐 ETAPA 1: Iniciando pesquisa web educacional — "${mainQuery}"`,
      technical_data: {
        query: mainQuery,
        disciplina: params.disciplina || params.componente || 'todas',
        ano_serie: params.ano_serie || 'todos',
        tema: params.tema || 'geral',
        search_depth: searchDepth,
      },
    });

    const queries = buildSearchQueries(params);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🔍 ETAPA 2: Formulando ${queries.length} consultas educacionais paralelas...`,
      technical_data: {
        queries,
        fontes_prioritarias: ['mec.gov.br', 'novaescola.org.br', 'basenacionalcomum.mec.gov.br', 'scielo.br'],
      },
    });

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🔎 ETAPA 3: Buscando em fontes educacionais brasileiras confiáveis...`,
      technical_data: {
        queries_em_execucao: queries,
        endpoint: '/api/search/web',
        modo: 'backend_server_side',
      },
    });

    const response = await fetch('/api/search/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mainQuery,
        queries: queries.slice(1),
        max_results: params.max_resultados || 8,
        search_depth: searchDepth,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend search failed: ${response.status} ${response.statusText}`);
    }

    const searchData = await response.json() as {
      results: WebResult[];
      query: string;
      queries_used: string[];
      total_found: number;
      provider: string;
      has_real_results: boolean;
    };

    const finalResults = searchData.results || [];
    const provider = searchData.provider || 'unknown';
    const hasRealResults = searchData.has_real_results || false;

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `📊 ETAPA 4: Encontrados ${finalResults.length} recursos — avaliando relevância pedagógica...`,
      technical_data: {
        total_resultados: finalResults.length,
        provider,
        has_real_results: hasRealResults,
        queries_used: searchData.queries_used,
      },
    });

    const highTierCount = finalResults.filter(r => r.domain_tier === 'alta').length;
    const medTierCount = finalResults.filter(r => r.domain_tier === 'media').length;

    const elapsedTime = Date.now() - startTime;
    const promptContext = formatResultsForPrompt(finalResults, mainQuery, queries);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `✅ ETAPA 5: Pesquisa concluída em ${elapsedTime}ms — ${finalResults.length} recursos educacionais selecionados`,
      technical_data: {
        duracao_ms: elapsedTime,
        total_resultados: finalResults.length,
        provider,
        breakdown: {
          fontes_oficiais: highTierCount,
          fontes_educacionais: medTierCount,
          outros: finalResults.length - highTierCount - medTierCount,
        },
      },
    });

    const dataConfirmation = createDataConfirmation([
      createDataCheck('results_found', 'Resultados encontrados', finalResults.length > 0, finalResults.length, '> 0'),
      createDataCheck('edu_sources', 'Fontes educacionais de alta qualidade', highTierCount > 0, highTierCount, '>= 1'),
      createDataCheck('real_web_results', 'Resultados reais da web', hasRealResults, hasRealResults ? 1 : 0, '= 1'),
    ]);

    return {
      success: true,
      capability_id: 'pesquisar_web',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        results: finalResults,
        count: finalResults.length,
        queries_used: queries,
        query_principal: mainQuery,
        prompt_context: promptContext,
        summary: `Pesquisa web concluída: ${finalResults.length} recursos educacionais encontrados${params.disciplina ? ` para ${params.disciplina}` : ''}${params.ano_serie ? ` — ${params.ano_serie}` : ''}`,
        breakdown: {
          fontes_oficiais: highTierCount,
          fontes_educacionais: medTierCount,
          has_real_results: hasRealResults,
          provider,
        },
      },
      error: null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: `Pesquisa Web Educacional BR (${provider})`,
      },
    };
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `❌ ERRO na pesquisa web: ${errorMessage}`,
      technical_data: { error: errorMessage, duration_ms: elapsedTime },
    });

    console.error('❌ [Capability:PESQUISAR_WEB] ERRO:', errorMessage);

    return {
      success: false,
      capability_id: 'pesquisar_web',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'WEB_SEARCH_FAILED',
        message: errorMessage,
        severity: 'medium',
        recoverable: true,
        recovery_suggestion: 'A pesquisa web falhou mas o sistema continuará com os dados disponíveis.',
      },
      debug_log,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'Pesquisa Web Educacional',
      },
    };
  }
}

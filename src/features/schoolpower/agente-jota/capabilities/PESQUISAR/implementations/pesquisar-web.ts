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
  solicitacao?: string;
  componente?: string;
  disciplina_extraida?: string;
  turma_extraida?: string;
  tema_limpo?: string;
  temas_extraidos?: string[];
  max_resultados?: number;
  search_depth?: 'basic' | 'advanced';
  search_mode?: 'full' | 'quick' | 'academic';
}

interface WebResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  domain_tier: string;
  source_label: string;
  source_type?: string;
  provider?: string;
  year?: number | null;
  authors?: string;
  content_extracted?: boolean;
}

const STOP_WORDS = new Set([
  'jota', 'assuma', 'preciso', 'quero', 'crie', 'planeje', 'organize',
  'controle', 'minha', 'meu', 'meus', 'minhas', 'você', 'vou', 'vamos',
  'flow', 'completo', 'complete', 'favor', 'por', 'que', 'seja', 'faça',
  'gostaria', 'poderia', 'pode', 'professor', 'professora', 'turma',
  'aluno', 'alunos', 'aula', 'aulas', 'semana', 'letiva', 'dia',
]);

function extractCleanThemeFromPrompt(rawText: string): string {
  if (!rawText || rawText.length < 5) return '';

  const text = rawText.toLowerCase();

  const patterns = [
    /sobre os temas?\s+(.+?)(?:\s+no dia|\s+connect|\s+usando|\s+com\s|\s+ao final|[,.]|$)/i,
    /sobre\s+(.+?)\s+(?:para|no|na|usando|com|ao|e\s+)/i,
    /(?:temas?|conteúdos?|assunto[s]?):\s*(.+?)(?:[,.]|$)/i,
    /(?:planejar?\s+aulas?\s+(?:sobre|de|para)\s+)(.+?)(?:\s+no|\s+usando|\s+com|[,.]|$)/i,
    /(?:criar?\s+(?:atividade|plano|sequência)\s+(?:sobre|de)\s+)(.+?)(?:\s+para|\s+no|[,.]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const captured = match[1].trim().slice(0, 80);
      if (captured.length > 3) return captured;
    }
  }

  const anoMatch = rawText.match(/(\d+[ºª°]?\s*(?:ano|série)[^,.\s]*)/i);
  const anoStr = anoMatch ? anoMatch[1].trim() : '';

  const words = rawText.split(/\s+/).filter(w => {
    const lower = w.toLowerCase().replace(/[^a-záéíóúàâêôãõç\s]/g, '');
    return lower.length > 3 && !STOP_WORDS.has(lower);
  });

  const meaningfulWords = words.slice(0, 6).join(' ');

  if (anoStr && meaningfulWords) {
    return `${meaningfulWords}, ${anoStr}`.slice(0, 100);
  }
  return meaningfulWords.slice(0, 100);
}

function buildSearchQueries(params: PesquisarWebParams, cleanTheme: string): string[] {
  const queries: string[] = [];
  const tema = params.tema_limpo || params.tema || cleanTheme || '';
  const disciplina = params.disciplina || params.componente || params.disciplina_extraida || '';
  const ano = params.ano_serie || params.turma_extraida || '';

  if (!tema) {
    return ['BNCC habilidades educação básica Brasil currículo nacional'];
  }

  if (disciplina && ano) {
    queries.push(`${tema} ${disciplina} ${ano} BNCC habilidades ensino fundamental`);
    queries.push(`plano de aula ${tema} ${ano} pedagogia ativa Brasil`);
    queries.push(`${tema} ${disciplina} atividades práticas professor site:novaescola.org.br OR site:mec.gov.br`);
  } else if (disciplina) {
    queries.push(`${tema} ${disciplina} BNCC habilidades ensino fundamental Brasil`);
    queries.push(`plano de aula ${tema} ${disciplina} recursos pedagógicos`);
  } else if (ano) {
    queries.push(`${tema} ${ano} BNCC currículo nacional habilidades ensino fundamental`);
    queries.push(`${tema} ${ano} atividades pedagógicas professores Brasil`);
  } else {
    queries.push(`${tema} BNCC habilidades ensino fundamental Brasil`);
    queries.push(`${tema} plano de aula recursos pedagógicos novaescola mec`);
  }

  return queries.slice(0, 3);
}

function formatResultsForPrompt(results: WebResult[], query: string, queriesUsed: string[], breakdown: Record<string, unknown>): string {
  if (results.length === 0) {
    return 'Nenhum resultado encontrado para a pesquisa web educacional realizada.';
  }

  const parts: string[] = [
    '══════════════════════════════════════════════════════',
    '🌐 PESQUISA WEB EDUCACIONAL — Jota Ponto.School',
    `Tema pesquisado: "${query}"`,
    `Consultas realizadas: ${queriesUsed.length} | Recursos selecionados: ${results.length}`,
    `Cobertura: ${breakdown.official || 0} fontes oficiais | ${breakdown.academic || 0} artigos acadêmicos | ${breakdown.web || 0} web`,
    '══════════════════════════════════════════════════════',
    '',
  ];

  results.forEach((r, idx) => {
    const relevancia = r.score >= 0.75 ? '⭐ ALTA RELEVÂNCIA' :
                       r.score >= 0.50 ? '✓ BOA RELEVÂNCIA' : '◦ RELEVÂNCIA MODERADA';

    const tierLabel = r.domain_tier === 'official' ? '🏛️ Fonte Oficial Governamental' :
                      r.domain_tier === 'alta' ? '📚 Fonte Educacional Especializada' :
                      r.source_type === 'academic' ? '🔬 Artigo Acadêmico Peer-Reviewed' :
                      r.source_type === 'news' ? '📰 Notícia Educacional Recente' :
                      '🌐 Recurso Web Educacional';

    parts.push(`[${idx + 1}] ${relevancia} — ${tierLabel}`);
    parts.push(`Título: ${r.title}`);
    parts.push(`Fonte: ${r.source_label || r.provider || 'Web'}${r.year ? ` (${r.year})` : ''}${r.authors ? ` | Autores: ${r.authors}` : ''}`);
    parts.push(`URL: ${r.url}`);
    if (r.snippet) {
      parts.push(`Conteúdo: ${r.snippet.slice(0, 400)}`);
    }
    parts.push('');
  });

  parts.push('══════════════════════════════════════════════════════');
  parts.push('INSTRUÇÃO: Use as fontes acima para embasar e enriquecer o conteúdo gerado. Quando pertinente, cite as fontes no resultado final para dar credibilidade pedagógica ao material.');
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

  const rawPrompt = params.busca_texto || params.solicitacao || '';
  const cleanTheme = extractCleanThemeFromPrompt(rawPrompt);

  const mainQuery =
    params.query ||
    params.tema_limpo ||
    (params.temas_extraidos?.length ? params.temas_extraidos.join(', ') : '') ||
    params.tema ||
    cleanTheme ||
    'BNCC educação básica Brasil';

  const searchDepth = params.search_depth || 'basic';
  const searchMode = params.search_mode || 'full';

  try {
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🌐 ETAPA 1: Iniciando pesquisa web educacional — "${mainQuery}"`,
      technical_data: {
        query_final: mainQuery,
        query_extraida: cleanTheme || '(não extraída)',
        query_raw: rawPrompt.slice(0, 60) + (rawPrompt.length > 60 ? '...' : ''),
        disciplina: params.disciplina || params.componente || 'não especificada',
        ano_serie: params.ano_serie || 'não especificado',
        search_depth: searchDepth,
        search_mode: searchMode,
      },
    });

    const queries = buildSearchQueries(params, cleanTheme);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🔍 ETAPA 2: Formulando ${queries.length} consultas educacionais especializadas...`,
      technical_data: {
        queries,
        provedores_ativos: ['Serper (Google Web)', 'Serper (Scholar)', 'OpenAlex', 'DOAJ'],
        fontes_prioritarias: ['novaescola.org.br', 'mec.gov.br', 'scielo.br', 'basenacionalcomum.mec.gov.br'],
      },
    });

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🔎 ETAPA 3: Buscando em múltiplas fontes educacionais em paralelo...`,
      technical_data: {
        queries_em_execucao: queries,
        endpoint: '/api/search/web',
        modo: 'multicanal_paralelo',
        canais: ['Google Web (PT-BR)', 'Google Scholar', 'OpenAlex', 'DOAJ'],
      },
    });

    const response = await fetch('/api/search/web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mainQuery,
        queries: queries.slice(1),
        max_results: params.max_resultados || 10,
        search_depth: searchDepth,
        search_mode: searchMode,
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
      raw_count?: number;
      provider: string;
      active_providers?: string[];
      has_real_results: boolean;
      breakdown?: Record<string, unknown>;
      duration_ms?: number;
    };

    const finalResults = searchData.results || [];
    const provider = searchData.provider || 'unknown';
    const activeProviders = searchData.active_providers || [provider];
    const hasRealResults = searchData.has_real_results || false;
    const breakdown = searchData.breakdown || {};

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `📊 ETAPA 4: ${finalResults.length} recursos encontrados — classificando por relevância pedagógica...`,
      technical_data: {
        total_resultados: finalResults.length,
        total_bruto: searchData.raw_count || finalResults.length,
        provedores_ativos: activeProviders,
        has_real_results: hasRealResults,
        cobertura: breakdown,
        queries_usadas: searchData.queries_used,
      },
    });

    const officialCount = finalResults.filter(r => r.domain_tier === 'official').length;
    const highTierCount = finalResults.filter(r => r.domain_tier === 'alta').length;
    const academicCount = finalResults.filter(r => r.source_type === 'academic').length;

    const elapsedTime = Date.now() - startTime;
    const promptContext = formatResultsForPrompt(finalResults, mainQuery, queries, breakdown);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `✅ ETAPA 5: Pesquisa concluída em ${elapsedTime}ms — ${finalResults.length} recursos selecionados de ${searchData.raw_count || finalResults.length} encontrados`,
      technical_data: {
        duracao_ms: elapsedTime,
        total_resultados: finalResults.length,
        provedores_usados: activeProviders.join(', '),
        breakdown: {
          fontes_oficiais: officialCount,
          fontes_educacionais: highTierCount,
          artigos_academicos: academicCount,
          resultados_reais: hasRealResults,
        },
      },
    });

    const dataConfirmation = createDataConfirmation([
      createDataCheck('results_found', 'Resultados encontrados', finalResults.length > 0, finalResults.length, '> 0'),
      createDataCheck('edu_sources', 'Fontes educacionais de qualidade', officialCount + highTierCount > 0, officialCount + highTierCount, '>= 1'),
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
        query_extraida: cleanTheme,
        prompt_context: promptContext,
        summary: `Pesquisa web concluída: ${finalResults.length} recursos de ${activeProviders.length} provedores${params.disciplina ? ` para ${params.disciplina}` : ''}${params.ano_serie ? ` — ${params.ano_serie}` : ''}. Fontes: ${officialCount} oficiais, ${academicCount} acadêmicos.`,
        breakdown: {
          fontes_oficiais: officialCount,
          fontes_educacionais: highTierCount,
          artigos_academicos: academicCount,
          has_real_results: hasRealResults,
          active_providers: activeProviders,
          provider,
        },
      },
      error: null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: `Search API Orchestrator (${activeProviders.join(', ')})`,
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
        data_source: 'Search API Orchestrator',
      },
    };
  }
}

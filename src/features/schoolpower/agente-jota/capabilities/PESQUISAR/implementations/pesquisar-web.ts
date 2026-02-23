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
  content_full?: string;
  content_relevance?: string;
  groq_relevance_score?: number;
  semantic_score?: number;
  passed_semantic_gate?: boolean;
  keywords?: string;
}

interface GapAnalysis {
  has_curricular: boolean;
  has_pedagogical: boolean;
  has_academic: boolean;
  has_official: boolean;
  coverage_score: number;
  gaps: string[];
}

interface SearchApiResponse {
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
  query_plan?: { planning_used: boolean; queries: string[]; original_query: string };
  content_extracted_count?: number;
  content_extracted_urls?: string[];
  llm_reranking_used?: boolean;
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

function buildPreliminaryQueries(params: PesquisarWebParams, cleanTheme: string): string[] {
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
  } else if (disciplina) {
    queries.push(`${tema} ${disciplina} BNCC habilidades ensino fundamental Brasil`);
    queries.push(`plano de aula ${tema} ${disciplina} recursos pedagógicos`);
  } else if (ano) {
    queries.push(`${tema} ${ano} BNCC currículo nacional habilidades`);
    queries.push(`${tema} ${ano} atividades pedagógicas professores Brasil`);
  } else {
    queries.push(`${tema} BNCC habilidades ensino fundamental Brasil`);
    queries.push(`${tema} plano de aula recursos pedagógicos novaescola mec`);
  }

  return queries.slice(0, 2);
}

function analyzeSearchGaps(results: WebResult[]): GapAnalysis {
  const text = (r: WebResult) => `${r.title} ${r.snippet || ''} ${r.url}`.toLowerCase();

  const has_curricular = results.some(r => {
    const t = text(r);
    return (
      t.includes('bncc') ||
      t.includes('base nacional') ||
      t.includes('currículo') ||
      t.includes('curriculo') ||
      t.includes('habilidade ef') ||
      t.includes('habilidade em') ||
      t.includes('competência') ||
      t.includes('competencia') ||
      t.includes('objetivo de aprendizagem') ||
      r.url?.includes('mec.gov')
    );
  });
  const has_pedagogical = results.some(r => {
    const t = text(r);
    return (
      t.includes('plano de aula') ||
      t.includes('planos de aula') ||
      t.includes('plano aula') ||
      t.includes('planos aula') ||
      t.includes('sequência didática') ||
      t.includes('sequencia didatica') ||
      t.includes('sequências didáticas') ||
      t.includes('atividade pedagóg') ||
      t.includes('atividades pedagóg') ||
      t.includes('recurso pedagóg') ||
      t.includes('material didático') ||
      t.includes('material didatico') ||
      t.includes('proposta pedagógica') ||
      t.includes('recurso didático')
    );
  });
  const has_academic = results.some(r =>
    r.source_type === 'academic' && (r.score || 0) > 0.40
  );
  const has_official = results.some(r =>
    r.domain_tier === 'official'
  );

  const coverage_score = ([has_curricular, has_pedagogical, has_academic, has_official]
    .filter(Boolean).length) / 4;

  const gaps: string[] = [];
  if (!has_curricular) gaps.push('alinhamento curricular (BNCC)');
  if (!has_pedagogical) gaps.push('recursos pedagógicos práticos');
  if (!has_academic) gaps.push('embasamento acadêmico');
  if (!has_official) gaps.push('fontes oficiais');

  return { has_curricular, has_pedagogical, has_academic, has_official, coverage_score, gaps };
}

function buildGapQuery(mainQuery: string, gaps: string[]): string {
  if (gaps.includes('recursos pedagógicos práticos')) {
    return `${mainQuery} plano de aula atividade prática material professor`;
  }
  if (gaps.includes('embasamento acadêmico')) {
    return `${mainQuery} pesquisa científica artigo revisão aprendizagem`;
  }
  if (gaps.includes('alinhamento curricular (BNCC)')) {
    return `${mainQuery} BNCC habilidades competências currículo nacional`;
  }
  return `${mainQuery} ensino fundamental atividade pedagógica recursos`;
}

function deduplicateByUrl(results: WebResult[]): WebResult[] {
  const seen = new Set<string>();
  return results.filter(r => {
    const key = r.url.toLowerCase().replace(/\/$/, '').replace(/https?:\/\//, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const MAX_PROMPT_CONTEXT_CHARS = 8000;

function extractSimpleTerms(query: string): string[] {
  const stopWords = new Set([
    'de','da','do','das','dos','em','no','na','nos','nas','para','por','com',
    'sem','sobre','entre','que','um','uma','uns','umas','o','a','os','as',
    'e','ou','ao','à','se','me','te','lhe','ano','série','turma',
  ]);
  return query.toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));
}

function resultHasQueryTermInTitle(result: WebResult, queryTerms: string[]): boolean {
  if (!queryTerms || queryTerms.length === 0) return true;
  if (result.domain_tier === 'official') return true;
  if ((result.score || 0) >= 0.70) return true;
  const titleLower = (result.title || '').toLowerCase();
  const snippetLower = (result.snippet || '').toLowerCase();
  return queryTerms.some(term => titleLower.includes(term) || snippetLower.includes(term));
}

function formatResultsForPrompt(
  results: WebResult[],
  query: string,
  queriesUsed: string[],
  breakdown: Record<string, unknown>,
  rounds: number
): string {
  if (results.length === 0) {
    return 'Nenhum resultado encontrado para a pesquisa web educacional realizada.';
  }

  const queryTerms = extractSimpleTerms(query);

  const relevantResults = results.filter(r => resultHasQueryTermInTitle(r, queryTerms));
  const displayResults = relevantResults.length >= 3 ? relevantResults : results;

  const sorted = [...displayResults].sort((a, b) => (b.score || 0) - (a.score || 0));
  const principal = sorted[0] || null;
  const others = sorted.slice(1);

  const parts: string[] = [
    '══════════════════════════════════════════════════════',
    '🌐 PESQUISA WEB EDUCACIONAL — Jota Ponto.School',
    `Tema pesquisado: "${query}"`,
    `Consultas: ${queriesUsed.length} | Rodadas: ${rounds} | Recursos: ${displayResults.length} (${results.length - displayResults.length} filtrados por irrelevância)`,
    `Cobertura: ${breakdown.official || 0} oficiais | ${breakdown.academic || 0} acadêmicos | ${breakdown.web || 0} web`,
    '══════════════════════════════════════════════════════',
    '',
  ];

  if (principal) {
    const principalContent = principal.content_full && principal.content_relevance !== 'invalido'
      ? principal.content_full.slice(0, 900)
      : (principal.snippet || '').slice(0, 500);
    parts.push('⭐ FONTE PRINCIPAL (mais relevante para o tema):');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push(`Título: ${principal.title}`);
    parts.push(`Fonte: ${principal.source_label || principal.provider || 'Web'}${principal.year ? ` (${principal.year})` : ''}`);
    parts.push(`URL: ${principal.url}`);
    if (principalContent) {
      parts.push(`Conteúdo: ${principalContent}`);
    }
    parts.push('PRIORIDADE: Utilize dados, exemplos e metodologias desta fonte acima das demais.');
    parts.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parts.push('');
  }

  others.slice(0, 7).forEach((r, idx) => {
    const relevancia = r.score >= 0.70 ? '⭐ ALTA RELEVÂNCIA' :
                       r.score >= 0.50 ? '✓ BOA RELEVÂNCIA' : '◦ RELEVÂNCIA MODERADA';

    const tierLabel = r.domain_tier === 'official' ? '🏛️ Fonte Oficial' :
                      r.domain_tier === 'alta' ? '📚 Fonte Especializada' :
                      r.source_type === 'academic' ? '🔬 Artigo Acadêmico' :
                      r.source_type === 'book' ? '📖 Livro Didático' :
                      r.source_type === 'news' ? '📰 Notícia Educacional' :
                      '🌐 Recurso Web';

    parts.push(`[${idx + 2}] ${relevancia} — ${tierLabel}`);
    parts.push(`Título: ${r.title}`);
    parts.push(`Fonte: ${r.source_label || r.provider || 'Web'}${r.year ? ` (${r.year})` : ''}`);
    parts.push(`URL: ${r.url}`);
    if (r.snippet) {
      parts.push(`Resumo: ${r.snippet.slice(0, 300)}`);
    }
    parts.push('');
  });

  const withValidContent = displayResults.filter(r =>
    r.content_full && r.content_relevance !== 'invalido'
  );
  if (withValidContent.length > 0) {
    parts.push('══════════════════════════════════════════════════════');
    parts.push('📄 CONTEÚDO COMPLETO EXTRAÍDO — Extratos reais das páginas:');
    parts.push('══════════════════════════════════════════════════════');
    withValidContent.slice(0, 3).forEach((r, idx) => {
      parts.push(`[${idx + 1}] ${r.source_label || r.provider} — ${r.title}`);
      parts.push(r.content_full!.slice(0, 800));
      parts.push('---');
    });
    parts.push('');
    parts.push('INSTRUÇÃO: Os conteúdos acima são extratos REAIS das páginas. Incorpore exemplos, atividades e metodologias reais no material gerado. Cite os autores e fontes explicitamente.');
    parts.push('');
  }

  parts.push('══════════════════════════════════════════════════════');
  parts.push('📚 FONTES CONSULTADAS (inclua ao final do documento gerado):');
  displayResults.slice(0, 5).forEach((r, idx) => {
    parts.push(`[${idx + 1}] ${r.title} — ${r.url} (${r.source_label || r.provider || 'Web'}${r.year ? `, ${r.year}` : ''})`);
  });
  parts.push('');
  parts.push('INSTRUÇÃO OBRIGATÓRIA: Inclua uma seção "Fontes Consultadas" ao final de qualquer documento, plano de aula ou atividade gerada. Use exatamente esses URLs.');
  parts.push('══════════════════════════════════════════════════════');

  const fullText = parts.join('\n');
  if (fullText.length > MAX_PROMPT_CONTEXT_CHARS) {
    return fullText.slice(0, MAX_PROMPT_CONTEXT_CHARS) + '\n[...contexto truncado para otimização de tokens]';
  }
  return fullText;
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

  const searchDepth = params.search_depth || 'advanced';
  const searchMode = params.search_mode || 'full';

  try {
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🌐 ETAPA 1: Analisando pedido e identificando intenção pedagógica...`,
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

    const preliminaryQueries = buildPreliminaryQueries(params, cleanTheme);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🔍 ETAPA 2: Formulando consultas preliminares (${preliminaryQueries.length} queries iniciais)...`,
      technical_data: {
        consultas_preliminares: preliminaryQueries,
        provedores_estimados: '9 providers educacionais (Serper, OpenAlex, DOAJ, CORE, Semantic Scholar, EuropePMC, PubMed, OpenLibrary, ArXiv)',
        fontes_prioritarias: ['novaescola.org.br', 'mec.gov.br', 'scielo.br', 'basenacionalcomum.mec.gov.br', 'core.ac.uk'],
        nota: 'Plano de busca inteligente será gerado via LLM antes do disparo',
      },
    });

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🔎 ETAPA 3: Disparando busca em 9 providers educacionais em paralelo...`,
      technical_data: {
        endpoint: '/api/search/web',
        modo: 'multicanal_paralelo_9_providers',
        search_depth: searchDepth,
        llm_planning: 'ativo (Groq llama-3.1-8b-instant)',
      },
    });

    const response = await fetch('/api/search/web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mainQuery,
        max_results: params.max_resultados || 10,
        search_depth: searchDepth,
        search_mode: searchMode,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend search failed: ${response.status} ${response.statusText}`);
    }

    const searchData = await response.json() as SearchApiResponse;

    const round1Results = searchData.results || [];
    const activeProviders = searchData.active_providers || [searchData.provider];
    const hasRealResults = searchData.has_real_results || false;
    const breakdown = searchData.breakdown || {};
    const queryPlan = searchData.query_plan;
    const contentExtractedCount = searchData.content_extracted_count || 0;
    const contentExtractedUrls = searchData.content_extracted_urls || [];

    if (queryPlan?.planning_used) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'decision',
        narrative: `🧠 PLANO DE BUSCA INTELIGENTE GERADO: ${queryPlan.queries.length} consultas educacionais otimizadas`,
        technical_data: {
          queries_llm: queryPlan.queries,
          planning_model: 'groq/llama-3.1-8b-instant',
          planning_used: true,
        },
      });
    }

    const providerBreakdown = activeProviders.reduce((acc: Record<string, number>, p: string) => {
      acc[p] = round1Results.filter(r => r.provider === p).length;
      return acc;
    }, {});

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `📊 ETAPA 4: ${searchData.raw_count || round1Results.length} brutos → ${round1Results.length} selecionados — classificando por relevância pedagógica...`,
      technical_data: {
        total_resultados: round1Results.length,
        total_bruto: searchData.raw_count || round1Results.length,
        provedores_ativos: activeProviders,
        breakdown_por_provider: providerBreakdown,
        has_real_results: hasRealResults,
        cobertura: breakdown,
        queries_usadas: queryPlan?.queries || searchData.queries_used,
        top_resultados: round1Results.slice(0, 5).map(r => ({
          titulo: r.title.slice(0, 70),
          fonte: r.source_label || r.provider,
          score: r.score,
          tipo: r.source_type,
          url: r.url,
        })),
      },
    });

    if (contentExtractedCount > 0) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `📄 Conteúdo completo extraído de ${contentExtractedCount} fonte(s) via Jina Reader`,
        technical_data: {
          fontes_extraidas: contentExtractedUrls,
          metodo: 'Jina Reader (r.jina.ai) — gratuito, sem API key',
          chars_por_fonte: '~2500 caracteres de Markdown limpo',
        },
      });
    }

    let allResults = round1Results;
    let rounds = 1;

    const gapAnalysis = analyzeSearchGaps(round1Results);

    if ((gapAnalysis.coverage_score < 0.25 || round1Results.length < 5) && round1Results.length > 0) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'warning',
        narrative: `⚠ LACUNA IDENTIFICADA: ${gapAnalysis.gaps.join(', ')}. Jota vai refinar a pesquisa...`,
        technical_data: {
          coverage_score: gapAnalysis.coverage_score,
          gaps_detectadas: gapAnalysis.gaps,
          has_curricular: gapAnalysis.has_curricular,
          has_pedagogical: gapAnalysis.has_pedagogical,
          has_academic: gapAnalysis.has_academic,
          has_official: gapAnalysis.has_official,
        },
      });

      const gapQuery = buildGapQuery(mainQuery, gapAnalysis.gaps);

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔎 RODADA 2: Refinando pesquisa — foco em ${gapAnalysis.gaps.slice(0, 2).join(' e ')}...`,
        technical_data: {
          gap_query: gapQuery,
          foco: gapAnalysis.gaps,
          search_depth: 'advanced',
        },
      });

      try {
        const round2Response = await fetch('/api/search/web', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: gapQuery,
            max_results: 6,
            search_depth: 'advanced',
            search_mode: searchMode,
          }),
        });

        if (round2Response.ok) {
          const round2Data = await round2Response.json() as SearchApiResponse;
          const round2Results = round2Data.results || [];

          const merged = deduplicateByUrl([...round1Results, ...round2Results]);
          merged.sort((a, b) => (b.score || 0) - (a.score || 0));
          allResults = merged;
          rounds = 2;

          const round2ProviderBreakdown = (round2Data.active_providers || []).reduce(
            (acc: Record<string, number>, p: string) => {
              acc[p] = round2Results.filter(r => r.provider === p).length;
              return acc;
            }, {}
          );

          debug_log.push({
            timestamp: new Date().toISOString(),
            type: 'discovery',
            narrative: `📊 RODADA 2: ${round2Results.length} recursos adicionais encontrados — cobertura melhorada`,
            technical_data: {
              resultados_rodada2: round2Results.length,
              total_combinado: allResults.length,
              providers_rodada2: round2Data.active_providers,
              breakdown_rodada2: round2ProviderBreakdown,
            },
          });
        }
      } catch {
        // Round 2 failure is non-critical
      }
    }

    const finalResults = allResults.slice(0, Math.max(params.max_resultados || 10, 5));

    const officialCount = finalResults.filter(r => r.domain_tier === 'official').length;
    const highTierCount = finalResults.filter(r => r.domain_tier === 'alta').length;
    const academicCount = finalResults.filter(r => r.source_type === 'academic').length;
    const elapsedTime = Date.now() - startTime;

    const queriesUsedDisplay = queryPlan?.queries || searchData.queries_used || [mainQuery];
    const promptContext = formatResultsForPrompt(finalResults, mainQuery, queriesUsedDisplay, breakdown, rounds);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `✅ PESQUISA CONCLUÍDA: ${finalResults.length} recursos | ${rounds} rodada(s) | ${contentExtractedCount} conteúdo(s) extraído(s) | ${elapsedTime}ms`,
      technical_data: {
        duracao_ms: elapsedTime,
        total_resultados: finalResults.length,
        rodadas: rounds,
        conteudos_extraidos: contentExtractedCount,
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
        queries_used: queriesUsedDisplay,
        query_principal: mainQuery,
        query_extraida: cleanTheme,
        prompt_context: promptContext,
        summary: `Pesquisa web concluída: ${finalResults.length} recursos de ${activeProviders.length} provedores${params.disciplina ? ` para ${params.disciplina}` : ''}${params.ano_serie ? ` — ${params.ano_serie}` : ''}. Fontes: ${officialCount} oficiais, ${academicCount} acadêmicos. Rodadas: ${rounds}. Conteúdo extraído: ${contentExtractedCount} fontes.`,
        breakdown: {
          fontes_oficiais: officialCount,
          fontes_educacionais: highTierCount,
          artigos_academicos: academicCount,
          has_real_results: hasRealResults,
          active_providers: activeProviders,
          provider: searchData.provider,
          rounds,
          content_extracted_count: contentExtractedCount,
        },
      },
      error: null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: `Search API Orchestrator v2 (${activeProviders.join(', ')}) + Jina Reader`,
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

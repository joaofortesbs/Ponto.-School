import express from 'express';
import { searchSerperWeb, searchSerperScholar, searchSerperNews } from './search-providers/serper.js';
import { searchOpenAlex } from './search-providers/openalex.js';
import { searchDOAJ } from './search-providers/doaj.js';
import { searchArXiv } from './search-providers/arxiv.js';
import { scoreResult, deduplicateResults } from './search-providers/scorer.js';
import { buildEducationalFallback } from './search-providers/fallback.js';

const router = express.Router();

function getProviderConfig() {
  return {
    serper: process.env.SERPER_API_KEY || null,
    openAlexKey: process.env.OPEN_ALEX_API_KEY || null,
    openCitationsKey: process.env.OPEN_CITATIONS_API_KEY || null,
    coreKey: process.env.CORE_API_KEY || null,
  };
}

function extractQueryTerms(query) {
  const stopWords = new Set([
    'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas',
    'para', 'por', 'com', 'sem', 'sobre', 'entre', 'que', 'um', 'uma',
    'uns', 'umas', 'o', 'a', 'os', 'as', 'e', 'ou', 'ao', 'à', 'aos',
    'às', 'se', 'me', 'te', 'lhe', 'nos', 'vos', 'the', 'and', 'for',
  ]);
  return query.toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));
}

function buildAcademicQuery(mainQuery) {
  const educationalTerms = ['educação', 'ensino', 'aprendizagem', 'pedagogia', 'didática'];
  const hasEducationTerm = educationalTerms.some(t => mainQuery.toLowerCase().includes(t));
  if (hasEducationTerm) return mainQuery;
  return `${mainQuery} educação ensino Brasil`;
}

async function runSerperSearch(query, apiKey, mode, options = {}) {
  if (!apiKey) return { results: [], provider: 'serper', mode, error: 'no_key' };
  try {
    let results;
    if (mode === 'web') results = await searchSerperWeb(query, apiKey, options);
    else if (mode === 'scholar') results = await searchSerperScholar(query, apiKey, options);
    else if (mode === 'news') results = await searchSerperNews(query, apiKey, options);
    else results = [];
    return { results, provider: 'serper', mode, error: null };
  } catch (err) {
    console.warn(`[SearchOrchestrator] Serper ${mode} falhou:`, err.message);
    return { results: [], provider: 'serper', mode, error: err.message };
  }
}

async function runOpenAlexSearch(query, apiKey) {
  try {
    const results = await searchOpenAlex(buildAcademicQuery(query), {
      perPage: 4,
      filterLang: true,
      apiKey,
    });
    if (results.length === 0) {
      const broader = await searchOpenAlex(query, { perPage: 3, filterLang: false, apiKey });
      return { results: broader, provider: 'openalex', error: null };
    }
    return { results, provider: 'openalex', error: null };
  } catch (err) {
    console.warn('[SearchOrchestrator] OpenAlex falhou:', err.message);
    return { results: [], provider: 'openalex', error: err.message };
  }
}

async function runDOAJSearch(query) {
  try {
    const results = await searchDOAJ(buildAcademicQuery(query), { pageSize: 4 });
    return { results, provider: 'doaj', error: null };
  } catch (err) {
    console.warn('[SearchOrchestrator] DOAJ falhou:', err.message);
    return { results: [], provider: 'doaj', error: err.message };
  }
}

async function runArXivSearch(query) {
  try {
    const stem = query.split(' ').slice(0, 4).join(' ');
    const results = await searchArXiv(stem, { maxResults: 2 });
    return { results, provider: 'arxiv', error: null };
  } catch (err) {
    console.warn('[SearchOrchestrator] ArXiv falhou:', err.message);
    return { results: [], provider: 'arxiv', error: err.message };
  }
}

router.post('/web', async (req, res) => {
  const {
    query,
    queries: extraQueries,
    max_results = 10,
    search_depth = 'basic',
    search_mode = 'full',
  } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query é obrigatório' });
  }

  const startTime = Date.now();
  const config = getProviderConfig();
  const queryTerms = extractQueryTerms(query);
  const allInputQueries = [query, ...(extraQueries || [])].slice(0, 3);

  console.log(`[SearchOrchestrator] Iniciando busca multicanal: "${query}" | depth=${search_depth} | mode=${search_mode}`);

  const providerStatus = {
    serper_web: false,
    serper_scholar: false,
    serper_news: false,
    openalex: false,
    doaj: false,
    arxiv: false,
  };

  const allRawResults = [];
  const errors = [];

  const searchTasks = [];

  if (config.serper) {
    searchTasks.push(runSerperSearch(allInputQueries[0], config.serper, 'web', { num: 8 }));

    if (search_depth !== 'quick') {
      searchTasks.push(runSerperSearch(
        `${allInputQueries[0]} site:novaescola.org.br OR site:mec.gov.br OR site:scielo.br`,
        config.serper, 'web', { num: 5 }
      ));
      searchTasks.push(runSerperSearch(allInputQueries[0], config.serper, 'scholar', { num: 5 }));
    }

    if (allInputQueries.length > 1) {
      searchTasks.push(runSerperSearch(allInputQueries[1], config.serper, 'web', { num: 5 }));
    }
  }

  if (search_mode === 'full' || search_mode === 'academic') {
    searchTasks.push(runOpenAlexSearch(query, config.openAlexKey));
    searchTasks.push(runDOAJSearch(query));
    if (search_depth === 'advanced') {
      searchTasks.push(runArXivSearch(query));
    }
  }

  const results = await Promise.allSettled(searchTasks);

  for (const r of results) {
    if (r.status === 'fulfilled') {
      const { results: items, provider, mode, error } = r.value;
      if (error) errors.push({ provider, mode, error });
      if (items && items.length > 0) {
        allRawResults.push(...items);
        const key = mode ? `${provider}_${mode}` : provider;
        if (providerStatus.hasOwnProperty(key)) providerStatus[key] = true;
        else providerStatus[provider] = true;
      }
    }
  }

  const dedupedResults = deduplicateResults(allRawResults);
  const scoredResults = dedupedResults
    .map(r => scoreResult(r, queryTerms))
    .sort((a, b) => b.score - a.score);

  let finalResults = scoredResults.slice(0, Math.max(max_results, 5));

  const hasGoodResults = finalResults.some(r => r.score >= 0.40);
  const hasRealResults = finalResults.some(r => r.provider !== 'educational_fallback');

  if (!hasGoodResults || finalResults.length < 3) {
    const fallbacks = buildEducationalFallback(query);
    const existingUrls = new Set(finalResults.map(r => r.url));
    const newFallbacks = fallbacks.filter(f => !existingUrls.has(f.url));
    finalResults = [...finalResults, ...newFallbacks].slice(0, max_results);
  }

  const activeProviders = Object.entries(providerStatus)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const breakdown = {
    official: finalResults.filter(r => r.domain_tier === 'official').length,
    alta: finalResults.filter(r => r.domain_tier === 'alta').length,
    academic: finalResults.filter(r => r.source_type === 'academic').length,
    news: finalResults.filter(r => r.source_type === 'news').length,
    web: finalResults.filter(r => r.source_type === 'web').length,
    has_real_results: hasRealResults,
    active_providers: activeProviders,
    errors_count: errors.length,
  };

  const duration = Date.now() - startTime;
  console.log(`[SearchOrchestrator] Concluído em ${duration}ms | ${finalResults.length} resultados | Providers: ${activeProviders.join(', ')} | Raw: ${allRawResults.length}`);

  res.json({
    results: finalResults,
    query,
    queries_used: allInputQueries,
    total_found: finalResults.length,
    raw_count: allRawResults.length,
    provider: activeProviders.length > 0 ? activeProviders[0] : 'educational_fallback',
    active_providers: activeProviders,
    has_real_results: hasRealResults,
    duration_ms: duration,
    breakdown,
    errors: errors.length > 0 ? errors : undefined,
  });
});

router.get('/health', (req, res) => {
  const config = getProviderConfig();
  res.json({
    status: 'ok',
    providers: {
      serper: !!config.serper,
      openalex: !!config.openAlexKey,
      opencitations: !!config.openCitationsKey,
      core: !!config.coreKey,
      doaj: true,
      arxiv: true,
    },
  });
});

export default router;

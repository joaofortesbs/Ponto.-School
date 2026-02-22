import express from 'express';
import { searchSerperWeb, searchSerperScholar, searchSerperNews } from './search-providers/serper.js';
import { searchOpenAlex } from './search-providers/openalex.js';
import { searchDOAJ } from './search-providers/doaj.js';
import { searchArXiv } from './search-providers/arxiv.js';
import { searchCORE } from './search-providers/core.js';
import { searchSemanticScholar } from './search-providers/semantic-scholar.js';
import { searchEuropePMC } from './search-providers/europepmc.js';
import { searchOpenLibrary } from './search-providers/openlibrary.js';
import { searchPubMed } from './search-providers/pubmed.js';
import { scoreResult, deduplicateResults } from './search-providers/scorer.js';
import { buildEducationalFallback } from './search-providers/fallback.js';
import { planSearchQueries } from './search-providers/query-planner.js';
import { isProviderHealthy, recordSuccess, recordFailure, getCircuitState, getAllCircuitStates } from './search-providers/circuit-breaker.js';
import { extractContentFromUrls } from './search-providers/content-extractor.js';

const router = express.Router();

function getProviderConfig() {
  return {
    serper: process.env.SERPER_API_KEY || null,
    openAlexKey: process.env.OPEN_ALEX_API_KEY || null,
    openCitationsKey: process.env.OPEN_CITATIONS_API_KEY || null,
    coreKey: process.env.CORE_API_KEY || null,
    groqKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || null,
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

function buildDOAJQuery(mainQuery) {
  const stopWords = new Set(['de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'para', 'por',
    'com', 'que', 'um', 'uma', 'e', 'o', 'a', 'os', 'as', 'ao', 'aos', 'se', 'em',
    'nos', 'nas', 'às', 'à', 'ano', 'série', 'para']);
  const words = mainQuery.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w) && !/^\d/.test(w))
    .slice(0, 3);
  return words.join(' ') || mainQuery.split(' ').slice(0, 2).join(' ');
}

const PT_EN_MAP = {
  'frações': 'fractions', 'fração': 'fraction',
  'porcentagem': 'percentage', 'porcentagens': 'percentages',
  'matemática': 'mathematics', 'matematica': 'mathematics',
  'matemático': 'mathematical', 'matematico': 'mathematical',
  'ensino': 'teaching', 'educação': 'education', 'educacao': 'education',
  'aprendizagem': 'learning', 'escola': 'school', 'escolas': 'schools',
  'professor': 'teacher', 'professores': 'teachers',
  'aluno': 'student', 'alunos': 'students',
  'fundamental': 'elementary', 'médio': 'secondary',
  'ano': 'grade', 'anos': 'grades', 'série': 'grade', 'séries': 'grades',
  'atividade': 'activity', 'atividades': 'activities',
  'aula': 'lesson', 'aulas': 'lessons', 'plano': 'plan',
  'gamificação': 'gamification', 'gamificacao': 'gamification',
  'jogo': 'game', 'jogos': 'games',
  'geometria': 'geometry', 'álgebra': 'algebra', 'algebra': 'algebra',
  'números': 'numbers', 'numero': 'number', 'equação': 'equation',
  'probabilidade': 'probability', 'estatística': 'statistics',
  'leitura': 'reading', 'escrita': 'writing',
  'ciências': 'science', 'ciencia': 'science', 'história': 'history',
  'português': 'portuguese language', 'letramento': 'literacy',
  'bncc': 'curriculum', 'currículo': 'curriculum', 'curriculo': 'curriculum',
  'pedagogia': 'pedagogy', 'didática': 'didactics', 'didatica': 'didactics',
  'inclusão': 'inclusion', 'inclusao': 'inclusion', 'especial': 'special needs',
  'aplicação': 'application', 'aplicacao': 'application', 'aplicacoes': 'applications',
  'resolução': 'problem solving', 'resolucao': 'problem solving',
  'avaliação': 'assessment', 'avaliacao': 'assessment',
  'metodologia': 'methodology', 'metodologias': 'methodologies',
  'estratégia': 'strategy', 'estrategias': 'strategies', 'estrategia': 'strategy',
  'vida': 'everyday', 'real': 'real', 'cotidiano': 'everyday',
  'representação': 'representation', 'representacao': 'representation',
  'operações': 'operations', 'operacao': 'operation',
};

const PT_STOP_WORDS = new Set([
  'para', 'com', 'que', 'uma', 'dos', 'das', 'nos', 'nas', 'por',
  'sobre', 'entre', 'como', 'mais', 'aos', 'sua', 'seu', 'mas',
  'ele', 'ela', 'eles', 'elas', 'esse', 'esta', 'isto', 'isso',
  'nao', 'muito', 'bem', 'ser', 'ter', 'foi', 'tem', 'sao',
  'aplicao', 'resolucao', 'avaliaca', 'bncc', 'ver',
]);

const ASCII_ONLY = /^[a-z0-9]+$/;
const LEVEL_WORDS = new Set(['grade', 'grades', 'elementary', 'secondary', 'primary', 'year']);

function buildInternationalQuery(mainQuery, maxWords = 5, excludeLevel = false) {
  let translated = mainQuery.toLowerCase();
  for (const [pt, en] of Object.entries(PT_EN_MAP)) {
    translated = translated.split(pt).join(en);
  }
  const words = translated
    .split(/[\s,;.ºª°]+/)
    .map(w => w.replace(/[^a-z0-9]/gi, ''))
    .filter(w => {
      if (!w || w.length < 3 || !ASCII_ONLY.test(w) || PT_STOP_WORDS.has(w) || /^\d+$/.test(w)) return false;
      if (excludeLevel && LEVEL_WORDS.has(w)) return false;
      return true;
    })
    .slice(0, maxWords);
  const hasEducation = words.some(w => ['education', 'teaching', 'learning', 'school'].includes(w));
  if (!hasEducation) words.push('education');
  return words.join(' ') + ' brazil';
}

async function safeRun(providerName, fn) {
  if (!isProviderHealthy(providerName)) {
    console.log(`[SearchOrchestrator] SKIPPED: ${providerName} (circuit ${getCircuitState(providerName)})`);
    return { results: [], provider: providerName, skipped: true };
  }

  try {
    const results = await fn();
    const count = results?.length || 0;
    if (count > 0) {
      recordSuccess(providerName);
      console.log(`[SearchOrchestrator] ${providerName}: ${count} resultados`);
    } else {
      console.log(`[SearchOrchestrator] ${providerName}: 0 resultados`);
    }
    return { results: results || [], provider: providerName, error: null };
  } catch (err) {
    recordFailure(providerName);
    console.warn(`[SearchOrchestrator] ${providerName} falhou:`, err.message);
    return { results: [], provider: providerName, error: err.message };
  }
}

router.post('/web', async (req, res) => {
  const {
    query,
    queries: extraQueries,
    max_results = 10,
    search_depth = 'basic',
    search_mode = 'full',
    groq_api_key: clientGroqKey = null,
  } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query é obrigatório' });
  }

  const startTime = Date.now();
  const config = getProviderConfig();
  const groqKey = clientGroqKey || config.groqKey;

  console.log(`[SearchOrchestrator] Iniciando busca multicanal: "${query}" | depth=${search_depth} | mode=${search_mode}`);

  let allInputQueries = [query, ...(extraQueries || [])].slice(0, 3);
  let queryPlanningUsed = false;

  if (groqKey && allInputQueries.length === 1 && search_mode === 'full') {
    try {
      const planned = await planSearchQueries(query, { groqApiKey: groqKey });
      if (planned.length > 1 || (planned.length === 1 && planned[0] !== query)) {
        allInputQueries = planned.slice(0, 3);
        queryPlanningUsed = true;
      }
    } catch (planErr) {
      console.warn('[SearchOrchestrator] Query planning falhou, usando query original:', planErr.message);
    }
  }

  const queryTerms = extractQueryTerms(allInputQueries[0]);

  const providerStatus = {
    serper_web: false,
    serper_scholar: false,
    serper_news: false,
    openalex: false,
    doaj: false,
    core: false,
    semantic_scholar: false,
    europepmc: false,
    pubmed: false,
    openlibrary: false,
    arxiv: false,
  };

  const allRawResults = [];
  const errors = [];
  const searchTasks = [];

  if (config.serper) {
    searchTasks.push(safeRun('serper_web', () =>
      searchSerperWeb(allInputQueries[0], config.serper, { num: 8 })
    ));

    if (search_depth !== 'quick') {
      searchTasks.push(safeRun('serper_web_official', () =>
        searchSerperWeb(
          `${allInputQueries[0]} site:novaescola.org.br OR site:mec.gov.br OR site:scielo.br`,
          config.serper, { num: 5 }
        )
      ));
      searchTasks.push(safeRun('serper_scholar', () =>
        searchSerperScholar(allInputQueries[0], config.serper, { num: 5 })
      ));
    }

    if (allInputQueries.length > 1) {
      searchTasks.push(safeRun('serper_web', () =>
        searchSerperWeb(allInputQueries[1], config.serper, { num: 5 })
      ));
    }

    if (allInputQueries.length > 2 && search_depth === 'advanced') {
      searchTasks.push(safeRun('serper_scholar', () =>
        searchSerperScholar(allInputQueries[2], config.serper, { num: 4 })
      ));
    }
  }

  if (search_mode === 'full' || search_mode === 'academic') {
    const intlQuery = buildInternationalQuery(allInputQueries[0]);
    const shortIntlQuery = buildInternationalQuery(allInputQueries[0], 3);
    const europePMCQuery = buildInternationalQuery(allInputQueries[0], 4, true);
    console.log(`[SearchOrchestrator] intlQuery="${intlQuery}" | short="${shortIntlQuery}" | epmc="${europePMCQuery}"`);

    searchTasks.push(safeRun('openalex', () =>
      searchOpenAlex(intlQuery, { perPage: 4, filterLang: false, apiKey: config.openAlexKey })
    ));

    searchTasks.push(safeRun('doaj', () =>
      searchDOAJ(buildDOAJQuery(allInputQueries[0]), { pageSize: 4 })
    ));

    if (config.coreKey) {
      searchTasks.push(safeRun('core', () =>
        searchCORE(intlQuery, config.coreKey, { limit: 4 })
      ));
    }

    searchTasks.push(safeRun('semantic_scholar', () =>
      searchSemanticScholar(intlQuery, { limit: 4 })
    ));

    searchTasks.push(safeRun('europepmc', () =>
      searchEuropePMC(europePMCQuery, { pageSize: 4 })
    ));

    if (search_depth !== 'quick') {
      searchTasks.push(safeRun('pubmed', () =>
        searchPubMed(shortIntlQuery, { retmax: 4 })
      ));
    }
  }

  if (search_depth === 'advanced') {
    searchTasks.push(safeRun('openlibrary', () =>
      searchOpenLibrary(buildAcademicQuery(allInputQueries[0]), { limit: 3 })
    ));

    searchTasks.push(safeRun('arxiv', () =>
      searchArXiv(allInputQueries[0].split(' ').slice(0, 4).join(' '), { maxResults: 2 })
    ));
  }

  const settled = await Promise.allSettled(searchTasks);

  for (const r of settled) {
    if (r.status === 'fulfilled') {
      const { results: items, provider, skipped, error } = r.value;
      if (error) errors.push({ provider, error });
      if (skipped) continue;
      if (items && items.length > 0) {
        const tagged = items.map(item => ({ ...item, provider: item.provider || provider }));
        allRawResults.push(...tagged);
        const provKey = provider.replace('_official', '');
        if (provKey in providerStatus) providerStatus[provKey] = true;
        else if (provider in providerStatus) providerStatus[provider] = true;
      }
    } else {
      errors.push({ provider: 'unknown', error: r.reason?.message || 'rejected' });
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
    const fallbacks = buildEducationalFallback(allInputQueries[0]);
    const existingUrls = new Set(finalResults.map(r => r.url));
    const newFallbacks = fallbacks.filter(f => !existingUrls.has(f.url));
    finalResults = [...finalResults, ...newFallbacks].slice(0, max_results);
  }

  if (search_depth === 'advanced') {
    finalResults = await extractContentFromUrls(finalResults);
  }

  const activeProviders = Object.entries(providerStatus)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const contentExtractedCount = finalResults.filter(r => r.content_extracted).length;
  const contentExtractedUrls = finalResults.filter(r => r.content_extracted).map(r => r.url);

  const breakdown = {
    official: finalResults.filter(r => r.domain_tier === 'official').length,
    alta: finalResults.filter(r => r.domain_tier === 'alta').length,
    academic: finalResults.filter(r => r.source_type === 'academic').length,
    book: finalResults.filter(r => r.source_type === 'book').length,
    news: finalResults.filter(r => r.source_type === 'news').length,
    web: finalResults.filter(r => r.source_type === 'web').length,
    has_real_results: hasRealResults,
    active_providers: activeProviders,
    errors_count: errors.length,
  };

  const duration = Date.now() - startTime;
  console.log(`[SearchOrchestrator] Concluído em ${duration}ms | ${finalResults.length} resultados | Providers: ${activeProviders.join(', ')} | Raw: ${allRawResults.length}${contentExtractedCount > 0 ? ` | Jina: ${contentExtractedCount} extraídos` : ''}`);

  res.json({
    results: finalResults,
    query: allInputQueries[0],
    queries_used: allInputQueries,
    total_found: finalResults.length,
    raw_count: allRawResults.length,
    provider: activeProviders.length > 0 ? activeProviders[0] : 'educational_fallback',
    active_providers: activeProviders,
    has_real_results: hasRealResults,
    duration_ms: duration,
    breakdown,
    query_plan: {
      planning_used: queryPlanningUsed,
      original_query: query,
      queries: allInputQueries,
    },
    content_extracted_count: contentExtractedCount,
    content_extracted_urls: contentExtractedUrls.length > 0 ? contentExtractedUrls : undefined,
    errors: errors.length > 0 ? errors : undefined,
  });
});

router.get('/health', (req, res) => {
  const config = getProviderConfig();
  const circuitStates = getAllCircuitStates();

  const providers = {
    serper: {
      available: true,
      has_key: !!config.serper,
      circuit: getCircuitState('serper_web'),
      description: 'Google Web + Scholar + News (PT-BR)',
    },
    openalex: {
      available: true,
      has_key: !!config.openAlexKey,
      circuit: getCircuitState('openalex'),
      description: '250M+ artigos acadêmicos',
    },
    core: {
      available: true,
      has_key: !!config.coreKey,
      circuit: getCircuitState('core'),
      description: '200M+ artigos com PDFs diretos',
    },
    semantic_scholar: {
      available: true,
      has_key: false,
      circuit: getCircuitState('semantic_scholar'),
      description: '46M+ papers com OA PDF links',
    },
    europepmc: {
      available: true,
      has_key: false,
      circuit: getCircuitState('europepmc'),
      description: '40M+ artigos biomédicos/educação',
    },
    pubmed: {
      available: true,
      has_key: false,
      circuit: getCircuitState('pubmed'),
      description: 'NCBI PubMed artigos médico/educação',
    },
    openlibrary: {
      available: true,
      has_key: false,
      circuit: getCircuitState('openlibrary'),
      description: 'Livros didáticos em PT (advanced only)',
    },
    doaj: {
      available: true,
      has_key: false,
      circuit: getCircuitState('doaj'),
      description: 'Periódicos acesso aberto',
    },
    arxiv: {
      available: true,
      has_key: false,
      circuit: getCircuitState('arxiv'),
      description: 'Preprints STEM (advanced only)',
    },
  };

  const activeCount = Object.values(providers).filter(p => p.available && (p.has_key || !p.has_key)).length;

  res.json({
    status: 'ok',
    providers,
    active_provider_count: activeCount,
    llm_query_planning: !!config.groqKey,
    circuit_breakers: circuitStates,
    timestamp: new Date().toISOString(),
  });
});

export default router;

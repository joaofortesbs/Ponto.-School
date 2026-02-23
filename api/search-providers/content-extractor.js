import axios from 'axios';

const JINA_BASE = 'https://r.jina.ai/';
const MAX_CONTENT_LENGTH = 2500;
const JINA_TIMEOUT = 8000;
const MAX_EXTRACT = 3;

function isExtractableUrl(url) {
  if (!url || !url.startsWith('http')) return false;
  if (url.endsWith('.pdf') || url.includes('.pdf?')) return false;
  if (url.includes('format=pdf')) return false;
  if (url.includes('?f=')) return false;
  if (url.includes('/pdf/')) return false;
  if (url.includes('arxiv.org/pdf')) return false;
  if (url.includes('download=true')) return false;
  if (url.includes('doi.org')) return false;
  return true;
}

function validateContentRelevance(content, queryTerms) {
  if (!content || !queryTerms || queryTerms.length === 0) {
    return { relevant: true, score: 1.0, matchCount: 0, label: 'sem_validacao' };
  }
  const contentLower = content.toLowerCase();
  const matchCount = queryTerms.filter(term =>
    term && term.length > 2 && contentLower.includes(term.toLowerCase())
  ).length;
  const relevanceRatio = matchCount / queryTerms.length;
  const label = matchCount === 0 ? 'invalido'
    : relevanceRatio < 0.25 ? 'baixa'
    : relevanceRatio < 0.55 ? 'media'
    : 'alta';
  return {
    relevant: matchCount >= 1,
    score: relevanceRatio,
    matchCount,
    label,
  };
}

async function extractSingleUrl(url) {
  try {
    const jinaUrl = `${JINA_BASE}${url}`;
    const response = await axios.get(jinaUrl, {
      timeout: JINA_TIMEOUT,
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'markdown',
        'X-Timeout': '7',
        'User-Agent': 'PontoSchool-Jota/1.0 (jota@pontoschool.com)',
      },
      maxRedirects: 3,
    });

    const content = typeof response.data === 'string'
      ? response.data
      : JSON.stringify(response.data);

    if (!content || content.length < 100) return null;

    const cleaned = content
      .replace(/\[.*?\]\(.*?\)/g, match => match)
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return cleaned.slice(0, MAX_CONTENT_LENGTH);
  } catch {
    return null;
  }
}

export async function extractContentFromUrls(results, options = {}) {
  if (!results || results.length === 0) return results;
  if (options.extractContent === false) return results;

  const queryTerms = options.queryTerms || [];

  const candidates = results
    .filter(r => isExtractableUrl(r.url) && (r.score || 0) >= 0.40)
    .slice(0, MAX_EXTRACT);

  if (candidates.length === 0) return results;

  const extractionTasks = candidates.map(async (result) => {
    const content = await extractSingleUrl(result.url);
    return { url: result.url, content };
  });

  const settled = await Promise.allSettled(extractionTasks);

  const contentMap = new Map();
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value?.content) {
      const { url, content } = s.value;
      const relevance = validateContentRelevance(content, queryTerms);
      if (!relevance.relevant) {
        console.log(`[ContentExtractor] ❌ Conteúdo descartado por irrelevância (0 query terms): ${url}`);
        contentMap.set(url, { content: null, relevance });
      } else {
        contentMap.set(url, { content, relevance });
      }
    }
  }

  let extractedCount = 0;
  let discardedCount = 0;
  const enriched = results.map(r => {
    const entry = contentMap.get(r.url);
    if (!entry) return r;
    if (!entry.content) {
      discardedCount++;
      return { ...r, content_extracted: false, content_relevance: 'invalido' };
    }
    extractedCount++;
    return {
      ...r,
      content_full: entry.content,
      content_extracted: true,
      content_relevance: entry.relevance.label,
    };
  });

  const attempted = candidates.length;
  console.log(`[ContentExtractor] Extraído: ${extractedCount}/${attempted} | Descartado: ${discardedCount}/${attempted} via Jina Reader`);
  return enriched;
}

export { validateContentRelevance };

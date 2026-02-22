import axios from 'axios';

const JINA_BASE = 'https://r.jina.ai/';
const MAX_CONTENT_LENGTH = 2500;
const JINA_TIMEOUT = 8000;
const MAX_EXTRACT = 3;

function isExtractableUrl(url) {
  if (!url || !url.startsWith('http')) return false;
  if (url.endsWith('.pdf') || url.includes('.pdf?')) return false;
  if (url.includes('doi.org')) return false;
  return true;
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
      contentMap.set(s.value.url, s.value.content);
    }
  }

  let extractedCount = 0;
  const enriched = results.map(r => {
    const content = contentMap.get(r.url);
    if (content) {
      extractedCount++;
      return { ...r, content_full: content, content_extracted: true };
    }
    return r;
  });

  console.log(`[ContentExtractor] Extraído conteúdo de ${extractedCount}/${candidates.length} fontes via Jina Reader`);
  return enriched;
}

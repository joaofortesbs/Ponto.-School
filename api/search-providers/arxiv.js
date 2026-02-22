import axios from 'axios';

const ARXIV_BASE = 'https://export.arxiv.org/api/query';

export async function searchArXiv(query, options = {}) {
  const { maxResults = 3 } = options;

  const params = new URLSearchParams({
    search_query: `all:${query}`,
    start: '0',
    max_results: String(maxResults),
    sortBy: 'relevance',
    sortOrder: 'descending',
  });

  const response = await axios.get(`${ARXIV_BASE}?${params.toString()}`, {
    timeout: 10000,
    headers: { 'Accept': 'application/xml' },
  });

  const xml = String(response.data);
  const entries = extractArXivEntries(xml);

  return entries.map(e => ({
    title: e.title || '',
    url: e.link || '',
    snippet: e.summary || '',
    authors: e.authors || '',
    year: e.year || null,
    source_type: 'academic',
    provider: 'arxiv',
  })).filter(e => e.title && e.url);
}

function extractArXivEntries(xml) {
  const entries = [];
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryPattern.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const summaryMatch = block.match(/<summary>([\s\S]*?)<\/summary>/);
    const publishedMatch = block.match(/<published>([\s\S]*?)<\/published>/);
    const authorMatches = [...block.matchAll(/<name>([\s\S]*?)<\/name>/g)];

    const linkMatch = block.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/);
    const altLink = linkMatch ? linkMatch[1] : null;
    const idMatch = block.match(/<id>([\s\S]*?)<\/id>/);
    const link = altLink || (idMatch ? idMatch[1].trim() : null);

    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
    const summary = summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ').slice(0, 500) : '';
    const published = publishedMatch ? publishedMatch[1].trim() : '';
    const year = published ? new Date(published).getFullYear() : null;
    const authors = authorMatches.slice(0, 3).map(m => m[1].trim()).join(', ');

    if (title && link) {
      entries.push({ title, url: link, summary, authors, year });
    }
  }

  return entries;
}

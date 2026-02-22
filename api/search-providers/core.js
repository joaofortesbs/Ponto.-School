import axios from 'axios';

const CORE_BASE = 'https://api.core.ac.uk/v3';

export async function searchCORE(query, apiKey, options = {}) {
  const { limit = 5 } = options;

  if (!apiKey) return [];

  const response = await axios.get(`${CORE_BASE}/search/works/`, {
    params: { q: query, limit },
    timeout: 12000,
    maxRedirects: 5,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'User-Agent': 'PontoSchool-Jota/1.0 (jota@pontoschool.com)',
    },
  });

  const results = response.data?.results || [];

  return results.map(r => {
    const doi = r.doi ? r.doi.replace('https://doi.org/', '') : null;
    const url = r.downloadUrl ||
                (doi ? `https://doi.org/${doi}` : null) ||
                (r.id ? `https://core.ac.uk/works/${r.id}` : null);

    const authors = (r.authors || [])
      .slice(0, 3)
      .map(a => a.name || a.displayName || '')
      .filter(Boolean)
      .join(', ');

    const journal = (r.journals || []).map(j => j.title).filter(Boolean)[0] || '';

    return {
      title: r.title || '',
      url: url || '',
      snippet: (r.abstract || '').slice(0, 500),
      year: r.yearPublished || null,
      authors,
      journal,
      doi: doi || '',
      citation_count: r.citationCount || 0,
      has_fulltext: !!(r.downloadUrl || r.fullText),
      source_type: 'academic',
      provider: 'core',
    };
  }).filter(r => r.title && r.url);
}

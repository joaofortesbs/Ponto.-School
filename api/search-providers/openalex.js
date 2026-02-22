import axios from 'axios';

const OPENALEX_BASE = 'https://api.openalex.org';

export async function searchOpenAlex(query, options = {}) {
  const {
    perPage = 5,
    filterLang = true,
    apiKey = null,
  } = options;

  const params = new URLSearchParams({
    search: query,
    per_page: String(perPage),
    mailto: 'jota@pontoschool.com',
    select: 'id,title,doi,publication_year,open_access,primary_location,abstract_inverted_index,authorships,keywords,concepts',
    sort: 'relevance_score:desc',
  });

  if (filterLang) {
    params.set('filter', 'language:pt');
  }

  if (apiKey) {
    params.set('api_key', apiKey);
  }

  const response = await axios.get(`${OPENALEX_BASE}/works?${params.toString()}`, {
    timeout: 12000,
    headers: { 'Accept': 'application/json' },
  });

  const results = response.data?.results || [];

  return results.map(r => {
    const location = r.primary_location?.source || {};
    const oaUrl = r.open_access?.oa_url || r.primary_location?.landing_page_url || null;
    const doi = r.doi || null;
    const url = oaUrl || (doi ? `https://doi.org/${doi.replace('https://doi.org/', '')}` : null);
    const abstract = reconstructAbstract(r.abstract_inverted_index);
    const keywords = (r.keywords || []).map(k => k.display_name).slice(0, 5).join(', ');
    const authors = (r.authorships || []).slice(0, 3).map(a => a.author?.display_name).filter(Boolean).join(', ');

    return {
      title: r.title || '',
      url: url || '',
      snippet: abstract || keywords || '',
      year: r.publication_year || null,
      authors,
      keywords,
      journal: location.display_name || '',
      doi: doi || '',
      is_open_access: r.open_access?.is_oa || false,
      source_type: 'academic',
      provider: 'openalex',
    };
  }).filter(r => r.url);
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== 'object') return '';
  try {
    const wordPositions = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) {
        wordPositions.push({ word, pos });
      }
    }
    wordPositions.sort((a, b) => a.pos - b.pos);
    return wordPositions.map(wp => wp.word).join(' ').slice(0, 500);
  } catch {
    return '';
  }
}

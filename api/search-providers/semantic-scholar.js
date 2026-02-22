import axios from 'axios';

const SS_BASE = 'https://api.semanticscholar.org/graph/v1';

export async function searchSemanticScholar(query, options = {}) {
  const { limit = 5 } = options;

  try {
    const params = new URLSearchParams({
      query,
      limit: String(limit),
      fields: 'title,year,authors,abstract,openAccessPdf,externalIds,publicationTypes',
    });

    const response = await axios.get(`${SS_BASE}/paper/search?${params.toString()}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'PontoSchool-Jota/1.0 (jota@pontoschool.com)',
        'Accept': 'application/json',
      },
    });

    const data = response.data?.data || [];

    return data.map(r => {
      const doi = r.externalIds?.DOI || null;
      const oaPdfUrl = r.openAccessPdf?.url || null;
      const url = oaPdfUrl || (doi ? `https://doi.org/${doi}` : null);

      const authors = (r.authors || [])
        .slice(0, 3)
        .map(a => a.name)
        .filter(Boolean)
        .join(', ');

      return {
        title: r.title || '',
        url: url || '',
        snippet: (r.abstract || '').slice(0, 500),
        year: r.year || null,
        authors,
        doi: doi || '',
        source_type: 'academic',
        provider: 'semantic_scholar',
      };
    }).filter(r => r.title && r.url);

  } catch (err) {
    if (err.response?.status === 429) {
      console.warn('[SearchOrchestrator] Semantic Scholar: rate limited (429) — skipping gracefully');
      return [];
    }
    throw err;
  }
}

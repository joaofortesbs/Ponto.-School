import axios from 'axios';

const DOAJ_BASE = 'https://doaj.org/api';

export async function searchDOAJ(query, options = {}) {
  const { pageSize = 4 } = options;

  const encoded = encodeURIComponent(query);
  const response = await axios.get(
    `${DOAJ_BASE}/search/articles/${encoded}?pageSize=${pageSize}&page=1&ref=pontoschool`,
    {
      timeout: 12000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PontoSchool-Jota/1.0 (jota@pontoschool.com)',
      },
    }
  );

  const results = response.data?.results || [];

  return results.map(r => {
    const bib = r.bibjson || {};
    const links = bib.link || [];
    const url = links.find(l => l.type === 'fulltext')?.url ||
                links.find(l => l.url)?.url ||
                (bib.identifier || []).find(i => i.type === 'doi')?.id
                  ? `https://doi.org/${(bib.identifier || []).find(i => i.type === 'doi')?.id}` : null;

    const journal = bib.journal?.title || '';
    const authors = (bib.author || []).slice(0, 3).map(a => a.name).filter(Boolean).join(', ');
    const abstract = (bib.abstract || '').slice(0, 500);
    const year = bib.year || null;
    const keywords = (bib.keywords || []).slice(0, 5).join(', ');

    return {
      title: bib.title || '',
      url: url || `https://doaj.org/article/${r.id}`,
      snippet: abstract || keywords || '',
      year,
      authors,
      keywords,
      journal,
      source_type: 'academic',
      provider: 'doaj',
    };
  }).filter(r => r.title);
}

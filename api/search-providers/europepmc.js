import axios from 'axios';

const EUROPEPMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

export async function searchEuropePMC(query, options = {}) {
  const { pageSize = 5 } = options;

  const url = `${EUROPEPMC_BASE}/search?query=${encodeURIComponent(query)}&format=json&pageSize=${pageSize}&sort=RELEVANCE`;

  const response = await axios.get(url, {
    timeout: 12000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'PontoSchool-Jota/1.0 (jota@pontoschool.com)',
    },
  });

  const results = response.data?.resultList?.result || [];

  return results.map(r => {
    const isOA = r.isOpenAccess === 'Y';
    const doi = r.doi || null;

    const url = isOA
      ? `https://europepmc.org/article/${r.source || 'MED'}/${r.id}`
      : (doi ? `https://doi.org/${doi}` : `https://europepmc.org/article/${r.source || 'MED'}/${r.id}`);

    const journal = r.journalTitle || r.bookOrReportDetails?.publisher || '';
    const pubYear = r.pubYear ? parseInt(r.pubYear) : null;

    const snippet = [
      journal ? `Publicado em ${journal}` : '',
      pubYear ? `(${pubYear})` : '',
      r.authorString ? `Autores: ${r.authorString}` : '',
    ].filter(Boolean).join('. ').slice(0, 400);

    return {
      title: r.title || '',
      url,
      snippet,
      year: pubYear,
      authors: r.authorString || '',
      journal,
      doi: doi || '',
      is_open_access: isOA,
      cited_by: r.citedByCount || 0,
      source_type: 'academic',
      provider: 'europepmc',
    };
  }).filter(r => r.title);
}

import axios from 'axios';

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const EMAIL = 'jota@pontoschool.com';

export async function searchPubMed(query, options = {}) {
  const { retmax = 4 } = options;

  const searchTerm = query.toLowerCase().includes('education')
    ? query
    : `${query} education`;

  const searchUrl = `${NCBI_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmax=${retmax}&retmode=json&email=${EMAIL}`;

  const searchResponse = await axios.get(searchUrl, {
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'PontoSchool-Jota/1.0 (jota@pontoschool.com)',
    },
  });

  const ids = searchResponse.data?.esearchresult?.idlist || [];

  if (ids.length === 0) return [];

  const summaryUrl = `${NCBI_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&email=${EMAIL}`;

  const summaryResponse = await axios.get(summaryUrl, {
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'PontoSchool-Jota/1.0 (jota@pontoschool.com)',
    },
  });

  const result = summaryResponse.data?.result || {};
  const uids = result.uids || ids;

  return uids.map(uid => {
    const r = result[String(uid)];
    if (!r || !r.title) return null;

    const url = r.availablefromurl || `https://pubmed.ncbi.nlm.nih.gov/${uid}/`;
    const pubYear = r.pubdate ? r.pubdate.split(' ')[0] : null;
    const year = pubYear ? parseInt(pubYear) : null;

    const authors = (r.authors || [])
      .slice(0, 3)
      .map(a => a.name)
      .filter(Boolean)
      .join(', ');

    const snippet = [
      r.source ? `Publicado em ${r.source}` : '',
      pubYear ? `(${pubYear})` : '',
      authors ? `Autores: ${authors}` : '',
    ].filter(Boolean).join('. ').slice(0, 400);

    return {
      title: r.title || '',
      url,
      snippet,
      year,
      authors,
      journal: r.source || '',
      source_type: 'academic',
      provider: 'pubmed',
    };
  }).filter(Boolean).filter(r => r.title && r.url);
}

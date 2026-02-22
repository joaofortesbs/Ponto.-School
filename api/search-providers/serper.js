import axios from 'axios';

const SERPER_BASE = 'https://google.serper.dev';

export async function searchSerperWeb(query, apiKey, options = {}) {
  const { num = 8, gl = 'br', hl = 'pt-br' } = options;
  const response = await axios.post(`${SERPER_BASE}/search`, {
    q: query,
    gl,
    hl,
    num,
  }, {
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  const organic = response.data?.organic || [];
  return organic.map(r => ({
    title: r.title || '',
    url: r.link || '',
    snippet: r.snippet || r.sitelinks?.[0]?.snippet || '',
    source_type: 'web',
    provider: 'serper_web',
  }));
}

export async function searchSerperScholar(query, apiKey, options = {}) {
  const { num = 6, gl = 'br', hl = 'pt-br' } = options;
  const response = await axios.post(`${SERPER_BASE}/scholar`, {
    q: query,
    gl,
    hl,
    num,
  }, {
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  const organic = response.data?.organic || [];
  return organic.map(r => {
    const pub = typeof r.publicationInfo === 'object' ? r.publicationInfo : {};
    return {
      title: r.title || '',
      url: r.link || '',
      snippet: r.snippet || '',
      publication_info: pub.summary || '',
      cited_by: r.citedBy || 0,
      year: r.year || null,
      source_type: 'academic',
      provider: 'serper_scholar',
    };
  });
}

export async function searchSerperNews(query, apiKey, options = {}) {
  const { num = 5, gl = 'br', hl = 'pt-br' } = options;
  const response = await axios.post(`${SERPER_BASE}/news`, {
    q: query,
    gl,
    hl,
    num,
  }, {
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  const news = response.data?.news || [];
  return news.map(r => ({
    title: r.title || '',
    url: r.link || '',
    snippet: r.snippet || '',
    source: r.source || '',
    date: r.date || '',
    source_type: 'news',
    provider: 'serper_news',
  }));
}

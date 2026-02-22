import express from 'express';
import axios from 'axios';

const router = express.Router();

const EDUCATIONAL_DOMAINS = [
  { domain: 'basenacionalcomum.mec.gov.br', label: 'BNCC Oficial', tier: 'alta', score: 1.0 },
  { domain: 'mec.gov.br', label: 'Ministério da Educação', tier: 'alta', score: 0.98 },
  { domain: 'novaescola.org.br', label: 'Nova Escola', tier: 'alta', score: 0.95 },
  { domain: 'inep.gov.br', label: 'INEP', tier: 'alta', score: 0.93 },
  { domain: 'bncc.mec.gov.br', label: 'BNCC MEC', tier: 'alta', score: 0.93 },
  { domain: 'educapes.capes.gov.br', label: 'EducaCAPES', tier: 'alta', score: 0.90 },
  { domain: 'portaldoprofessor.mec.gov.br', label: 'Portal do Professor MEC', tier: 'alta', score: 0.90 },
  { domain: 'scielo.br', label: 'SciELO Brasil', tier: 'media', score: 0.88 },
  { domain: 'periodicos.capes.gov.br', label: 'Periódicos CAPES', tier: 'media', score: 0.85 },
  { domain: 'porvir.org', label: 'Porvir', tier: 'media', score: 0.80 },
  { domain: 'cenpec.org.br', label: 'CENPEC', tier: 'media', score: 0.78 },
  { domain: 'fnde.gov.br', label: 'FNDE', tier: 'media', score: 0.78 },
  { domain: 'usp.br', label: 'USP', tier: 'media', score: 0.75 },
  { domain: 'unicamp.br', label: 'UNICAMP', tier: 'media', score: 0.75 },
  { domain: 'ufrj.br', label: 'UFRJ', tier: 'media', score: 0.73 },
];

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function getEducationalDomainInfo(url) {
  for (const ed of EDUCATIONAL_DOMAINS) {
    if (url.includes(ed.domain)) return ed;
  }
  if (url.includes('.edu.br') || url.includes('.gov.br')) {
    return { label: extractDomain(url), tier: 'media', score: 0.65 };
  }
  return null;
}

function scoreResult(result, queryTerms) {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  const semanticScore = queryTerms.filter(t => text.includes(t)).length / Math.max(queryTerms.length, 1);
  
  const eduInfo = getEducationalDomainInfo(result.url);
  const domainScore = eduInfo ? eduInfo.score : 0.15;
  const eduBoost = eduInfo ? (eduInfo.tier === 'alta' ? 0.40 : 0.20) : 0;
  
  const finalScore = Math.min(1.0,
    domainScore * 0.40 +
    semanticScore * 0.35 +
    eduBoost * 0.25
  );

  return {
    ...result,
    score: finalScore,
    domain_tier: eduInfo ? eduInfo.tier : 'baixa',
    source_label: eduInfo ? eduInfo.label : extractDomain(result.url),
  };
}

async function searchDuckDuckGoInstant(query) {
  const results = [];
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1&no_redirect=1`;
    
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PontoSchool-Jota/1.0)',
        'Accept': 'application/json',
      },
    });

    const data = response.data;

    if (data.AbstractURL && data.AbstractText) {
      results.push({
        title: data.Heading || data.AbstractText.slice(0, 80),
        url: data.AbstractURL,
        snippet: data.AbstractText.slice(0, 400),
      });
    }

    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 10)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.slice(0, 120),
            url: topic.FirstURL,
            snippet: topic.Text.slice(0, 300),
          });
        }
        if (topic.Topics && Array.isArray(topic.Topics)) {
          for (const sub of topic.Topics.slice(0, 3)) {
            if (sub.FirstURL && sub.Text) {
              results.push({
                title: sub.Text.slice(0, 120),
                url: sub.FirstURL,
                snippet: sub.Text.slice(0, 300),
              });
            }
          }
        }
      }
    }

    if (data.Results && Array.isArray(data.Results)) {
      for (const r of data.Results.slice(0, 5)) {
        if (r.FirstURL && r.Text) {
          results.push({
            title: r.Text.slice(0, 120),
            url: r.FirstURL,
            snippet: r.Text.slice(0, 300),
          });
        }
      }
    }
  } catch (err) {
    console.warn('[SearchWeb] DuckDuckGo Instant API error:', err.message);
  }
  return results;
}

async function searchDuckDuckGoHTML(query) {
  const results = [];
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encoded}`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });

    const html = response.data;

    const resultBlocks = html.match(/<div class="result__body">[\s\S]*?<\/div>\s*<\/div>/g) || [];
    
    for (const block of resultBlocks.slice(0, 10)) {
      const titleMatch = block.match(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      
      if (titleMatch && titleMatch[1] && titleMatch[2]) {
        let rawUrl = titleMatch[1];
        if (rawUrl.includes('uddg=')) {
          try {
            const urlParams = new URLSearchParams(rawUrl.split('?')[1]);
            rawUrl = urlParams.get('uddg') || rawUrl;
          } catch {}
        }
        
        const cleanTitle = titleMatch[2].replace(/<[^>]+>/g, '').trim().slice(0, 150);
        const cleanSnippet = snippetMatch 
          ? snippetMatch[1].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').trim().slice(0, 400)
          : cleanTitle;

        if (cleanTitle && rawUrl) {
          results.push({
            title: cleanTitle,
            url: rawUrl,
            snippet: cleanSnippet,
          });
        }
      }
    }

    if (results.length === 0) {
      const linkPattern = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
      let match;
      while ((match = linkPattern.exec(html)) !== null && results.length < 8) {
        const url = match[1];
        const text = match[2].replace(/<[^>]+>/g, '').trim();
        if (text && url && !url.includes('duckduckgo.com')) {
          results.push({ title: text.slice(0, 120), url, snippet: text.slice(0, 300) });
        }
      }
    }

  } catch (err) {
    console.warn('[SearchWeb] DuckDuckGo HTML scraping error:', err.message);
  }
  return results;
}

async function fetchJinaReader(url) {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await axios.get(jinaUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'text',
      },
    });
    return String(response.data).slice(0, 1500);
  } catch {
    return '';
  }
}

function buildEducationalFallbackResults(query, queries) {
  const tema = query.toLowerCase();
  const fallbacks = [];

  fallbacks.push({
    title: `Habilidades BNCC — ${query}`,
    url: 'https://basenacionalcomum.mec.gov.br/abase/',
    snippet: `Consulte as habilidades e competências da Base Nacional Comum Curricular relacionadas a "${query}". A BNCC define os aprendizados essenciais para educação básica brasileira.`,
    score: 0.88,
    domain_tier: 'alta',
    source_label: 'BNCC Oficial',
  });

  fallbacks.push({
    title: `Planos de Aula — Nova Escola: ${query}`,
    url: `https://novaescola.org.br/busca#_q=${encodeURIComponent(query)}&_page=1`,
    snippet: `Planos de aula, sequências didáticas e materiais pedagógicos sobre "${query}" elaborados por especialistas e alinhados com a BNCC. Recursos gratuitos para professores brasileiros.`,
    score: 0.85,
    domain_tier: 'alta',
    source_label: 'Nova Escola',
  });

  fallbacks.push({
    title: `Portal do Professor MEC — Recursos: ${query}`,
    url: `https://portaldoprofessor.mec.gov.br/busca.html?q=${encodeURIComponent(query)}`,
    snippet: `Recursos pedagógicos e aulas digitais do MEC sobre "${query}". O Portal do Professor oferece sugestões de atividades, planos de aula e objetos de aprendizagem gratuitos.`,
    score: 0.82,
    domain_tier: 'alta',
    source_label: 'Portal do Professor MEC',
  });

  fallbacks.push({
    title: `Materiais Didáticos CAPES — ${query}`,
    url: `https://educapes.capes.gov.br/search?lang=pt_BR&fq=type%3A%22Recurso+Educacional+Aberto%22&q=${encodeURIComponent(query)}`,
    snippet: `Recursos Educacionais Abertos sobre "${query}" disponíveis no EducaCAPES. Materiais produzidos por universidades brasileiras e disponíveis gratuitamente para professores.`,
    score: 0.75,
    domain_tier: 'alta',
    source_label: 'EducaCAPES',
  });

  return fallbacks;
}

router.post('/web', async (req, res) => {
  const { query, queries: extraQueries, max_results = 8, search_depth = 'basic' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query é obrigatório' });
  }

  console.log(`[SearchWeb] Iniciando busca: "${query}" | depth=${search_depth}`);

  const allQueries = [query, ...(extraQueries || [])].slice(0, 3);
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  try {
    const searchPromises = allQueries.map(q => 
      Promise.allSettled([
        searchDuckDuckGoInstant(q),
        searchDuckDuckGoHTML(q),
      ])
    );

    const allRawResults = [];
    const searchResults = await Promise.allSettled(searchPromises);
    
    for (const searchResult of searchResults) {
      if (searchResult.status === 'fulfilled') {
        for (const provider of searchResult.value) {
          if (provider.status === 'fulfilled') {
            allRawResults.push(...provider.value);
          }
        }
      }
    }

    const seenUrls = new Set();
    const dedupedResults = allRawResults.filter(r => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });

    let scoredResults = dedupedResults.map(r => scoreResult(r, queryTerms));
    scoredResults.sort((a, b) => b.score - a.score);

    const topResults = scoredResults.slice(0, Math.max(max_results, 5));

    let finalResults = topResults;
    const hasGoodResults = finalResults.some(r => r.score >= 0.6);
    
    if (!hasGoodResults || finalResults.length < 3) {
      const fallbacks = buildEducationalFallbackResults(query, allQueries);
      const existingUrls = new Set(finalResults.map(r => r.url));
      const newFallbacks = fallbacks.filter(f => !existingUrls.has(f.url));
      finalResults = [...finalResults, ...newFallbacks].slice(0, max_results);
    }

    if (search_depth === 'advanced' && finalResults.length > 0) {
      const eduResults = finalResults.filter(r => r.domain_tier === 'alta').slice(0, 2);
      const jinaPromises = eduResults.map(r => fetchJinaReader(r.url));
      const jinaResults = await Promise.allSettled(jinaPromises);
      
      jinaResults.forEach((jr, idx) => {
        if (jr.status === 'fulfilled' && jr.value && jr.value.length > 100) {
          finalResults[idx] = {
            ...finalResults[idx],
            snippet: jr.value.slice(0, 800),
            content_extracted: true,
          };
        }
      });
    }

    const response = {
      results: finalResults,
      query,
      queries_used: allQueries,
      total_found: finalResults.length,
      provider: dedupedResults.length > 0 ? 'duckduckgo' : 'educational_fallback',
      has_real_results: dedupedResults.length > 0,
    };

    console.log(`[SearchWeb] Retornando ${finalResults.length} resultados para "${query}" (${response.provider})`);
    res.json(response);

  } catch (err) {
    console.error('[SearchWeb] Erro crítico:', err.message);
    const fallbacks = buildEducationalFallbackResults(query, allQueries);
    res.json({
      results: fallbacks,
      query,
      queries_used: allQueries,
      total_found: fallbacks.length,
      provider: 'educational_fallback',
      has_real_results: false,
      error_fallback: true,
    });
  }
});

export default router;

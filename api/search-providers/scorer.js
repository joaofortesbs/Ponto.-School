const EDUCATIONAL_DOMAINS = [
  { domain: 'basenacionalcomum.mec.gov.br', label: 'BNCC Oficial', tier: 'official', score: 1.00 },
  { domain: 'mec.gov.br', label: 'Ministério da Educação', tier: 'official', score: 0.98 },
  { domain: 'inep.gov.br', label: 'INEP', tier: 'official', score: 0.96 },
  { domain: 'fnde.gov.br', label: 'FNDE', tier: 'official', score: 0.94 },
  { domain: 'educapes.capes.gov.br', label: 'EducaCAPES', tier: 'official', score: 0.93 },
  { domain: 'portaldoprofessor.mec.gov.br', label: 'Portal do Professor MEC', tier: 'official', score: 0.93 },
  { domain: 'novaescola.org.br', label: 'Nova Escola', tier: 'alta', score: 0.92 },
  { domain: 'scielo.br', label: 'SciELO Brasil', tier: 'alta', score: 0.90 },
  { domain: 'periodicos.capes.gov.br', label: 'Periódicos CAPES', tier: 'alta', score: 0.88 },
  { domain: 'porvir.org', label: 'Porvir', tier: 'alta', score: 0.84 },
  { domain: 'cenpec.org.br', label: 'CENPEC', tier: 'alta', score: 0.82 },
  { domain: 'undime.org.br', label: 'UNDIME', tier: 'alta', score: 0.82 },
  { domain: 'institutopensi.org.br', label: 'Instituto Pensi', tier: 'alta', score: 0.80 },
  { domain: 'usp.br', label: 'USP', tier: 'alta', score: 0.80 },
  { domain: 'unicamp.br', label: 'UNICAMP', tier: 'alta', score: 0.80 },
  { domain: 'ufrj.br', label: 'UFRJ', tier: 'alta', score: 0.78 },
  { domain: 'unb.br', label: 'UnB', tier: 'alta', score: 0.78 },
  { domain: 'unesp.br', label: 'UNESP', tier: 'alta', score: 0.78 },
  { domain: 'ufmg.br', label: 'UFMG', tier: 'alta', score: 0.77 },
  { domain: 'ufpe.br', label: 'UFPE', tier: 'alta', score: 0.77 },
  { domain: 'projetocalibri.com.br', label: 'Projeto Calibri', tier: 'media', score: 0.72 },
  { domain: 'copacabanaclub.com.br', label: 'Copacabana Club', tier: 'media', score: 0.68 },
  { domain: 'escolainterativa.com.br', label: 'Escola Interativa', tier: 'media', score: 0.68 },
  { domain: 'todospelaeducacao.org.br', label: 'Todos Pela Educação', tier: 'media', score: 0.75 },
  { domain: 'gestaoescolar.diaadia.pr.gov.br', label: 'Gestão Escolar PR', tier: 'media', score: 0.73 },
  { domain: 'educacao.sp.gov.br', label: 'SEE-SP', tier: 'media', score: 0.73 },
  { domain: 'rededosaber.sp.gov.br', label: 'Rede do Saber SP', tier: 'media', score: 0.73 },
  { domain: 'sedf.df.gov.br', label: 'SEDF', tier: 'media', score: 0.72 },
  { domain: 'sed.sc.gov.br', label: 'SED-SC', tier: 'media', score: 0.72 },
];

export function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function getEducationalDomainInfo(url) {
  const hostname = extractDomain(url || '').toLowerCase();
  for (const ed of EDUCATIONAL_DOMAINS) {
    if (hostname.includes(ed.domain)) return ed;
  }
  if (hostname.includes('.edu.br')) {
    return { label: hostname, tier: 'media', score: 0.65 };
  }
  if (hostname.includes('.gov.br')) {
    return { label: hostname, tier: 'oficial', score: 0.72 };
  }
  if (hostname.includes('.org.br')) {
    return { label: hostname, tier: 'media', score: 0.55 };
  }
  return null;
}

export function scoreResult(result, queryTerms) {
  const text = `${result.title} ${result.snippet || ''} ${result.keywords || ''}`.toLowerCase();
  const queryText = queryTerms.join(' ').toLowerCase();

  const termMatches = queryTerms.filter(t => t.length > 2 && text.includes(t)).length;
  const semanticScore = queryTerms.length > 0 ? termMatches / queryTerms.length : 0;

  const eduInfo = getEducationalDomainInfo(result.url || '');
  const domainScore = eduInfo ? eduInfo.score : 0.15;
  const eduBoost = eduInfo ? (
    eduInfo.tier === 'official' ? 0.50 :
    eduInfo.tier === 'alta' ? 0.35 :
    eduInfo.tier === 'media' ? 0.20 : 0
  ) : 0;

  let typeMultiplier = 1.0;
  if (result.source_type === 'academic') typeMultiplier = 1.25;
  else if (result.source_type === 'news') typeMultiplier = 0.80;

  const bnccBoost = text.includes('bncc') ? 0.10 : 0;
  const brasilBoost = (text.includes('brasil') || text.includes('brasileir') || text.includes('ensino fundamental')) ? 0.08 : 0;
  const pedagogicoBoost = (text.includes('plano de aula') || text.includes('sequência didática') || text.includes('atividade pedagógic')) ? 0.10 : 0;

  const rawScore =
    domainScore * 0.35 +
    semanticScore * 0.30 +
    eduBoost * 0.20 +
    bnccBoost +
    brasilBoost +
    pedagogicoBoost;

  const finalScore = Math.min(1.0, rawScore * typeMultiplier);

  return {
    ...result,
    score: Math.round(finalScore * 1000) / 1000,
    domain_tier: eduInfo ? eduInfo.tier : 'baixa',
    source_label: eduInfo ? eduInfo.label : extractDomain(result.url || ''),
  };
}

export function deduplicateResults(results) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  return results.filter(r => {
    if (!r.url || !r.title) return false;
    const normalUrl = r.url.toLowerCase().replace(/\/$/, '').replace(/https?:\/\//, '');
    const normalTitle = r.title.toLowerCase().slice(0, 60);
    if (seenUrls.has(normalUrl) || seenTitles.has(normalTitle)) return false;
    seenUrls.add(normalUrl);
    seenTitles.add(normalTitle);
    return true;
  });
}

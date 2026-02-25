import type { CapabilityOutput } from '../capabilities/shared/types';

interface WebResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  domain_tier: string;
  source_label: string;
  source_type?: string;
  provider?: string;
  year?: number | null;
  content_full?: string;
  content_relevance?: string;
}

export function formatResearchContextForConversation(
  searchOutput: CapabilityOutput,
  originalQuery: string
): string {
  if (!searchOutput.success || !searchOutput.data) {
    return '';
  }

  const data = searchOutput.data;
  const results: WebResult[] = data.results || [];
  const sourcesCount = results.length;

  if (sourcesCount === 0) {
    return '';
  }

  const tema = data.query_principal || originalQuery;

  const crossVerification = data.cross_verification;
  const consensusScore = crossVerification?.consensus_score ?? null;
  const lowConfidenceWarnings: string[] = crossVerification?.low_confidence_warnings || [];

  const parts: string[] = [
    '## FONTES EDUCACIONAIS PESQUISADAS PELO JOTA',
    `O Jota pesquisou ${sourcesCount} fontes educacionais brasileiras sobre "${tema}".`,
    consensusScore !== null ? `Score de consenso entre fontes: ${(consensusScore * 100).toFixed(0)}%` : '',
    '',
    '⚠️ REGRAS ANTI-ALUCINAÇÃO (OBRIGATÓRIAS):',
    '1. Use APENAS informações que aparecem EXPLICITAMENTE nas fontes abaixo — NUNCA invente, extrapole ou "chute" dados',
    '2. Para FATOS ESPECÍFICOS (datas, nomes, números, resultados): use SOMENTE se confirmado por 2+ fontes OU por 1 fonte oficial (.gov.br, .edu.br)',
    '3. Para dados de apenas 1 fonte não-oficial: diga "segundo [nome da fonte], ..." com ressalva explícita',
    '4. Se NENHUMA fonte responde à pergunta com dados confirmados, diga: "Não encontrei confirmação suficiente nas fontes consultadas sobre [tema]. Recomendo verificar em [sugestão]."',
    '5. NUNCA apresente informações não-confirmadas como se fossem fatos — prefira omitir a inventar',
    '6. Cite as fontes quando usar informações específicas (ex: "Segundo o MEC...", "De acordo com a Nova Escola...")',
    '7. Inclua ao final uma seção "Fontes consultadas" com nomes e URLs das fontes REALMENTE usadas na resposta',
    '',
  ];

  if (lowConfidenceWarnings.length > 0) {
    parts.push('⚠️ DADOS COM BAIXA CONFIANÇA (NÃO use como fatos confirmados):');
    for (const warning of lowConfidenceWarnings.slice(0, 5)) {
      parts.push(`  - ${warning}`);
    }
    parts.push('');
  }

  const sorted = [...results].sort((a, b) => (b.score || 0) - (a.score || 0));

  sorted.slice(0, 8).forEach((r, idx) => {
    const tierLabel = r.domain_tier === 'official' ? '🏛️ Fonte Oficial' :
                      r.domain_tier === 'alta' ? '📚 Fonte Especializada' :
                      r.source_type === 'academic' ? '🔬 Artigo Acadêmico' :
                      '🌐 Recurso Web';

    parts.push(`[${idx + 1}] ${tierLabel}`);
    parts.push(`Título: ${r.title}`);
    parts.push(`Fonte: ${r.source_label || r.provider || 'Web'}${r.year ? ` (${r.year})` : ''}`);
    parts.push(`URL: ${r.url}`);

    if (r.content_full && r.content_relevance !== 'invalido') {
      parts.push(`Conteúdo: ${r.content_full.slice(0, 600)}`);
    } else if (r.snippet) {
      parts.push(`Resumo: ${r.snippet.slice(0, 300)}`);
    }
    parts.push('');
  });

  const MAX_CONTEXT_CHARS = 6000;
  const fullText = parts.join('\n');
  if (fullText.length > MAX_CONTEXT_CHARS) {
    return fullText.slice(0, MAX_CONTEXT_CHARS) + '\n[...contexto truncado para otimização]';
  }

  return fullText;
}

export function extractSearchSummary(searchOutput: CapabilityOutput): {
  sourcesFound: number;
  searchQuery: string;
  searchDuration: number;
  themes: string[];
  topSourceTitle: string;
  topSourceUrl: string;
} {
  if (!searchOutput.success || !searchOutput.data) {
    return {
      sourcesFound: 0,
      searchQuery: '',
      searchDuration: searchOutput.metadata?.duration_ms || 0,
      themes: [],
      topSourceTitle: '',
      topSourceUrl: '',
    };
  }

  const data = searchOutput.data;
  const results: WebResult[] = data.results || [];
  const sorted = [...results].sort((a, b) => (b.score || 0) - (a.score || 0));
  const topResult = sorted[0];

  const themes: string[] = [];
  const seenThemes = new Set<string>();
  for (const r of results.slice(0, 5)) {
    const titleWords = (r.title || '').split(/\s+/).filter(w => w.length > 4).slice(0, 3);
    for (const w of titleWords) {
      const lower = w.toLowerCase();
      if (!seenThemes.has(lower)) {
        seenThemes.add(lower);
        themes.push(w);
      }
    }
    if (themes.length >= 6) break;
  }

  return {
    sourcesFound: results.length,
    searchQuery: data.query_principal || '',
    searchDuration: searchOutput.metadata?.duration_ms || 0,
    themes,
    topSourceTitle: topResult?.title || '',
    topSourceUrl: topResult?.url || '',
  };
}

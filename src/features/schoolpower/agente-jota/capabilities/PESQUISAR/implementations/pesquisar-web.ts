import type {
  CapabilityInput,
  CapabilityOutput,
  DebugEntry,
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';
import {
  BNCC_HABILIDADES,
  type BNCCHabilidade,
} from '../../../prompts/bncc-reference';

interface PesquisarWebParams {
  query?: string;
  tema?: string;
  disciplina?: string;
  ano_serie?: string;
  busca_texto?: string;
  componente?: string;
  disciplina_extraida?: string;
  turma_extraida?: string;
  tema_limpo?: string;
  max_resultados?: number;
}

interface WebSearchResult {
  titulo: string;
  url: string;
  snippet: string;
  fonte: string;
  tipo: string;
  score: number;
}

const EDUCATIONAL_DOMAINS = [
  { domain: 'basenacionalcomum.mec.gov.br', label: 'BNCC Oficial', score: 1.0 },
  { domain: 'mec.gov.br', label: 'Ministério da Educação', score: 0.98 },
  { domain: 'novaescola.org.br', label: 'Nova Escola', score: 0.95 },
  { domain: 'inep.gov.br', label: 'INEP', score: 0.93 },
  { domain: 'educapes.capes.gov.br', label: 'EducaCAPES', score: 0.90 },
  { domain: 'portaldoprofessor.mec.gov.br', label: 'Portal do Professor MEC', score: 0.90 },
  { domain: 'scielo.br', label: 'SciELO Brasil', score: 0.88 },
  { domain: 'periodicos.capes.gov.br', label: 'Periódicos CAPES', score: 0.85 },
  { domain: 'porvir.org', label: 'Porvir', score: 0.80 },
];

function buildSearchQueries(params: PesquisarWebParams): string[] {
  const queries: string[] = [];
  const tema = params.tema || params.busca_texto || params.query || params.tema_limpo || '';
  const disciplina = params.disciplina || params.componente || params.disciplina_extraida || '';
  const ano = params.ano_serie || params.turma_extraida || '';

  if (tema) {
    if (disciplina && ano) {
      queries.push(`${tema} ${disciplina} ${ano} BNCC habilidades site:basenacionalcomum.mec.gov.br OR site:novaescola.org.br`);
      queries.push(`${tema} ${disciplina} ${ano} plano de aula Brasil ensino fundamental`);
    } else if (disciplina) {
      queries.push(`${tema} ${disciplina} BNCC habilidades educação`);
      queries.push(`${tema} ${disciplina} atividades pedagógicas site:novaescola.org.br OR site:mec.gov.br`);
    } else if (ano) {
      queries.push(`${tema} ${ano} BNCC currículo nacional`);
      queries.push(`${tema} ${ano} ensino fundamental recursos pedagógicos`);
    } else {
      queries.push(`${tema} BNCC habilidades educação brasileira`);
      queries.push(`${tema} recursos pedagógicos professores site:novaescola.org.br`);
    }
  } else {
    queries.push('BNCC habilidades educação básica Brasil currículo nacional');
  }

  return queries.slice(0, 3);
}

async function fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function searchDuckDuckGo(query: string): Promise<WebSearchResult[]> {
  const results: WebSearchResult[] = [];
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetchWithTimeout(url, 6000);
    if (!response.ok) return results;

    const data = await response.json() as any;

    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 8)) {
        if (topic.FirstURL && topic.Text) {
          const domain = extractDomain(topic.FirstURL);
          const eduDomain = EDUCATIONAL_DOMAINS.find(d => topic.FirstURL.includes(d.domain));
          results.push({
            titulo: topic.Text.slice(0, 120),
            url: topic.FirstURL,
            snippet: topic.Text,
            fonte: eduDomain?.label || domain,
            tipo: eduDomain ? 'fonte_educacional' : 'web',
            score: eduDomain?.score || 0.3,
          });
        }
      }
    }

    if (data.AbstractURL && data.AbstractText) {
      const eduDomain = EDUCATIONAL_DOMAINS.find(d => data.AbstractURL.includes(d.domain));
      results.push({
        titulo: data.Heading || data.AbstractText.slice(0, 80),
        url: data.AbstractURL,
        snippet: data.AbstractText,
        fonte: eduDomain?.label || extractDomain(data.AbstractURL),
        tipo: eduDomain ? 'fonte_educacional' : 'web',
        score: eduDomain?.score || 0.5,
      });
    }
  } catch {
    // silently handle fetch errors
  }
  return results;
}

async function fetchJinaContent(url: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetchWithTimeout(jinaUrl, 8000);
    if (!response.ok) return '';
    const text = await response.text();
    return text.slice(0, 2000);
  } catch {
    return '';
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function getBnccResultsAsWebFormat(params: PesquisarWebParams): WebSearchResult[] {
  const results: WebSearchResult[] = [];
  const disciplina = params.disciplina || params.componente || params.disciplina_extraida || '';
  const ano = params.ano_serie || params.turma_extraida || '';
  const busca = params.tema || params.busca_texto || params.query || params.tema_limpo || '';

  const componentes = disciplina ? [disciplina] : Object.keys(BNCC_HABILIDADES);

  for (const comp of componentes) {
    const resolvedComp = findComponentByAlias(comp);
    if (!resolvedComp) continue;

    const compData = BNCC_HABILIDADES[resolvedComp];
    if (!compData) continue;

    const anos = ano ? [ano] : Object.keys(compData.habilidades).slice(0, 3);

    for (const anoKey of anos) {
      const habs = compData.habilidades[anoKey] || [];
      const filtradas = busca
        ? habs.filter(h => {
            const texto = `${h.descricao} ${h.objetoConhecimento} ${h.codigo}`.toLowerCase();
            return busca.toLowerCase().split(/\s+/).some(t => t.length > 2 && texto.includes(t));
          })
        : habs.slice(0, 3);

      for (const hab of filtradas.slice(0, 5)) {
        results.push({
          titulo: `${hab.codigo}: ${hab.objetoConhecimento}`,
          url: `https://basenacionalcomum.mec.gov.br/abase/#${resolvedComp.toLowerCase().replace(/\s/g, '-')}`,
          snippet: hab.descricao,
          fonte: 'BNCC Oficial (Base Nacional Comum Curricular)',
          tipo: 'habilidade_bncc',
          score: 1.0,
        });
      }
    }
  }

  return results;
}

function findComponentByAlias(input: string): string | null {
  if (!input) return null;
  const lower = input.toLowerCase().trim();
  const aliases: Record<string, string> = {
    'matematica': 'Matemática', 'matemática': 'Matemática', 'mat': 'Matemática',
    'lingua portuguesa': 'Língua Portuguesa', 'portugues': 'Língua Portuguesa',
    'língua portuguesa': 'Língua Portuguesa', 'lp': 'Língua Portuguesa',
    'ciencias': 'Ciências', 'ciências': 'Ciências',
    'historia': 'História', 'história': 'História',
    'geografia': 'Geografia',
    'arte': 'Arte', 'artes': 'Arte',
    'educacao fisica': 'Educação Física', 'educação física': 'Educação Física',
    'ensino religioso': 'Ensino Religioso',
    'lingua inglesa': 'Língua Inglesa', 'inglês': 'Língua Inglesa', 'ingles': 'Língua Inglesa',
  };
  if (aliases[lower]) return aliases[lower];
  for (const comp of Object.keys(BNCC_HABILIDADES)) {
    if (comp.toLowerCase().includes(lower) || lower.includes(comp.toLowerCase())) return comp;
  }
  return null;
}

function rankResults(results: WebSearchResult[], query: string): WebSearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  return results
    .map(r => {
      const texto = `${r.titulo} ${r.snippet}`.toLowerCase();
      const semanticBoost = queryTerms.filter(t => texto.includes(t)).length / Math.max(queryTerms.length, 1);
      const finalScore = r.score * 0.70 + semanticBoost * 0.30;
      return { ...r, score: finalScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

function formatResultsForPrompt(results: WebSearchResult[], query: string, queries: string[]): string {
  if (results.length === 0) {
    return 'Nenhum resultado encontrado para a pesquisa web educacional realizada.';
  }

  const parts: string[] = [
    '══════════════════════════════════════════════════════',
    '🌐 PESQUISA WEB EDUCACIONAL — Jota Ponto.School',
    `Query: "${query}"`,
    `Consultas realizadas: ${queries.length} | Resultados selecionados: ${results.length}`,
    '══════════════════════════════════════════════════════',
    '',
  ];

  results.forEach((r, idx) => {
    const relevancia = r.score >= 0.85 ? '⭐ ALTA RELEVÂNCIA' : r.score >= 0.60 ? '✓ BOA RELEVÂNCIA' : '◦ RELEVÂNCIA MODERADA';
    const tipoLabel = r.tipo === 'habilidade_bncc' ? '📋 Habilidade BNCC' :
                      r.tipo === 'fonte_educacional' ? '🏛️ Fonte Educacional' : '🌐 Recurso Web';
    parts.push(`[${idx + 1}] ${relevancia} — ${tipoLabel}`);
    parts.push(`Título: ${r.titulo}`);
    parts.push(`Fonte: ${r.fonte}`);
    parts.push(`URL: ${r.url}`);
    parts.push(`Conteúdo: ${r.snippet.slice(0, 300)}`);
    parts.push('');
  });

  parts.push('══════════════════════════════════════════════════════');
  parts.push('INSTRUÇÃO: Use as fontes acima para embasar o conteúdo gerado. Cite as fontes relevantes no resultado final.');
  parts.push('══════════════════════════════════════════════════════');

  return parts.join('\n');
}

export async function pesquisarWebV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugEntry[] = [];
  const startTime = Date.now();
  const params = (input.context || {}) as PesquisarWebParams;

  if (!params.componente && params.disciplina_extraida) params.componente = params.disciplina_extraida;
  if (!params.disciplina && params.disciplina_extraida) params.disciplina = params.disciplina_extraida;
  if (!params.ano_serie && params.turma_extraida) params.ano_serie = params.turma_extraida;
  if (!params.tema && params.tema_limpo) params.tema = params.tema_limpo;
  if (!params.busca_texto && params.tema_limpo) params.busca_texto = params.tema_limpo;

  const mainQuery = params.query || params.tema || params.busca_texto || 'BNCC habilidades educação básica';

  try {
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🌐 ETAPA 1: Iniciando pesquisa web educacional — "${mainQuery}"`,
      technical_data: {
        query: mainQuery,
        disciplina: params.disciplina || params.componente || 'todas',
        ano_serie: params.ano_serie || 'todos',
        tema: params.tema || 'geral',
      },
    });

    const queries = buildSearchQueries(params);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🔍 ETAPA 2: Formulando ${queries.length} consultas educacionais paralelas...`,
      technical_data: {
        queries,
        fontes_prioritarias: EDUCATIONAL_DOMAINS.slice(0, 5).map(d => d.domain),
      },
    });

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `🔎 RODADA 1: Buscando em fontes educacionais brasileiras confiáveis...`,
      technical_data: {
        queries_em_execucao: queries,
        modo: 'busca_web_paralela + BNCC_local_enrichment',
      },
    });

    const [webResults1, webResults2] = await Promise.allSettled([
      searchDuckDuckGo(queries[0]),
      queries[1] ? searchDuckDuckGo(queries[1]) : Promise.resolve([]),
    ]);

    let allWebResults: WebSearchResult[] = [];
    if (webResults1.status === 'fulfilled') allWebResults.push(...webResults1.value);
    if (webResults2.status === 'fulfilled') allWebResults.push(...(webResults2.value as WebSearchResult[]));

    const bnccResults = getBnccResultsAsWebFormat(params);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `📊 ETAPA 3: Avaliando relevância pedagógica dos resultados...`,
      technical_data: {
        resultados_web_brutos: allWebResults.length,
        habilidades_bncc_locais: bnccResults.length,
        total_candidatos: allWebResults.length + bnccResults.length,
      },
    });

    const combined = [...bnccResults, ...allWebResults];
    const ranked = rankResults(combined, mainQuery);

    const hasCurricular = ranked.some(r => r.tipo === 'habilidade_bncc');
    const hasPedagogical = ranked.some(r => r.tipo === 'fonte_educacional');
    const coverageScore = (hasCurricular ? 0.5 : 0) + (hasPedagogical ? 0.4 : 0) + (ranked.length > 5 ? 0.1 : 0);

    if (coverageScore < 0.5 && queries[2]) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔎 RODADA 2: Refinando pesquisa para cobrir lacunas identificadas...`,
        technical_data: {
          lacunas: {
            sem_curricular: !hasCurricular,
            sem_pedagogical: !hasPedagogical,
          },
          query_adicional: queries[2],
        },
      });

      const extraResults = await searchDuckDuckGo(queries[2]).catch(() => []);
      ranked.push(...extraResults);
    }

    const finalResults = rankResults(ranked, mainQuery).slice(0, 10);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `📋 ETAPA 4: Encontrados ${finalResults.length} recursos selecionados de ${combined.length} candidatos`,
      technical_data: {
        total_selecionados: finalResults.length,
        total_candidatos: combined.length,
        breakdown: {
          habilidades_bncc: finalResults.filter(r => r.tipo === 'habilidade_bncc').length,
          fontes_educacionais: finalResults.filter(r => r.tipo === 'fonte_educacional').length,
          recursos_web: finalResults.filter(r => r.tipo === 'web').length,
        },
        cobertura: {
          curricular: hasCurricular,
          pedagogico: hasPedagogical,
          score: coverageScore.toFixed(2),
        },
      },
    });

    const elapsedTime = Date.now() - startTime;
    const promptContext = formatResultsForPrompt(finalResults, mainQuery, queries);

    const dataConfirmation = createDataConfirmation([
      createDataCheck('results_found', 'Resultados encontrados', finalResults.length > 0, finalResults.length, '> 0'),
      createDataCheck('bncc_covered', 'Cobertura BNCC', hasCurricular, finalResults.filter(r => r.tipo === 'habilidade_bncc').length, '>= 1 habilidade'),
      createDataCheck('edu_sources', 'Fontes educacionais', finalResults.length > 0, finalResults.filter(r => r.score > 0.5).length, '> 0'),
    ]);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `✅ ETAPA 5: Pesquisa web concluída em ${elapsedTime}ms — ${finalResults.length} recursos educacionais selecionados`,
      technical_data: {
        duracao_ms: elapsedTime,
        total_resultados: finalResults.length,
        queries_usadas: queries,
        resumo: dataConfirmation.summary,
      },
    });

    return {
      success: true,
      capability_id: 'pesquisar_web',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        results: finalResults,
        count: finalResults.length,
        queries_used: queries,
        query_principal: mainQuery,
        prompt_context: promptContext,
        summary: `Pesquisa web concluída: ${finalResults.length} recursos educacionais encontrados${params.disciplina ? ` para ${params.disciplina}` : ''}${params.ano_serie ? ` — ${params.ano_serie}` : ''}`,
        breakdown: {
          habilidades_bncc: finalResults.filter(r => r.tipo === 'habilidade_bncc').length,
          fontes_educacionais: finalResults.filter(r => r.tipo === 'fonte_educacional').length,
        },
      },
      error: null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'DuckDuckGo API + BNCC Local Database + Fontes Educacionais BR',
      },
    };
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `❌ ERRO na pesquisa web: ${errorMessage}`,
      technical_data: { error: errorMessage, duration_ms: elapsedTime },
    });

    console.error('❌ [Capability:PESQUISAR_WEB] ERRO:', errorMessage);

    return {
      success: false,
      capability_id: 'pesquisar_web',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'WEB_SEARCH_FAILED',
        message: errorMessage,
        severity: 'medium',
        recoverable: true,
        recovery_suggestion: 'A pesquisa web falhou mas o sistema continuará com os dados locais disponíveis',
      },
      debug_log,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'Pesquisa Web Educacional',
      },
    };
  }
}

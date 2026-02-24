import axios from 'axios';

export async function factCheckExtractedContent(query, extractedResults, options = {}) {
  const {
    groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || null,
    timeoutMs = 6000,
  } = options;

  if (!groqApiKey || !extractedResults || extractedResults.length === 0) {
    return { verified: false, verifications: [], consensus_answer: null };
  }

  const resultsWithContent = extractedResults.filter(
    r => (r.content_full && r.content_full.length > 50) || (r.snippet && r.snippet.length > 30)
  );

  if (resultsWithContent.length === 0) {
    return { verified: false, verifications: [], consensus_answer: null };
  }

  const candidatesList = resultsWithContent.slice(0, 6).map((r, i) => {
    const content = r.content_full
      ? r.content_full.slice(0, 400)
      : r.snippet?.slice(0, 200) || '';
    return `[${i + 1}] "${(r.title || '').slice(0, 80)}" (${r.source_label || r.provider || 'Web'})\n${content}`;
  }).join('\n\n');

  const prompt = `Você é um verificador de fatos especializado em educação brasileira.

Pergunta do professor: "${query.slice(0, 300)}"

Conteúdos extraídos de fontes web:
${candidatesList}

TAREFA: Para cada conteúdo, verifique se ele REALMENTE responde à pergunta do professor.
ATENÇÃO ESPECIAL: Se a pergunta menciona um ANO ESPECÍFICO (ex: "ENEM 2025"), verifique se o conteúdo se refere a ESSE ANO e não a outro.

Responda APENAS com JSON válido:
{
  "verifications": [
    { "index": 1, "answers_question": true, "confidence": 0.9, "year_match": true, "extracted_answer": "resposta extraída do conteúdo" }
  ],
  "consensus_answer": "resposta mais apoiada pelas fontes, ou null se não há consenso",
  "year_warnings": ["avisos sobre discrepâncias de ano encontradas"]
}`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
        max_tokens: 600,
      },
      {
        timeout: timeoutMs,
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const rawContent = response.data?.choices?.[0]?.message?.content || '';
    const jsonMatch = rawContent.match(/\{[\s\S]*"verifications"[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[FactChecker] LLM não retornou JSON válido');
      return { verified: false, verifications: [], consensus_answer: null };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const verifications = (parsed.verifications || []).map(v => ({
      index: v.index,
      answers_question: !!v.answers_question,
      confidence: typeof v.confidence === 'number' ? v.confidence : 0.5,
      year_match: v.year_match !== false,
      extracted_answer: v.extracted_answer || null,
    }));

    const highConfidence = verifications.filter(v => v.answers_question && v.confidence >= 0.7);
    const hasConsensus = highConfidence.length >= 1;

    console.log(`[FactChecker] Verificados: ${verifications.length} | Alta confiança: ${highConfidence.length} | Consenso: ${hasConsensus}`);
    if (parsed.year_warnings && parsed.year_warnings.length > 0) {
      console.warn(`[FactChecker] ⚠️ Avisos de ano: ${parsed.year_warnings.join('; ')}`);
    }

    return {
      verified: true,
      verifications,
      consensus_answer: parsed.consensus_answer || null,
      year_warnings: parsed.year_warnings || [],
      low_confidence_results: !hasConsensus,
    };
  } catch (err) {
    console.warn('[FactChecker] Falha silenciosa:', err.message);
    return { verified: false, verifications: [], consensus_answer: null };
  }
}

export function detectTemporalQuery(query) {
  const queryLower = query.toLowerCase();

  const yearMatch = query.match(/\b(20[2-3]\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;

  const temporalWords = [
    'atual', 'atualmente', 'recente', 'recentes', 'último', 'última',
    'últimos', 'últimas', 'deste ano', 'este ano', 'novo', 'nova',
    'novos', 'novas', 'agora', 'hoje'
  ];
  const hasTemporalWord = temporalWords.some(w => queryLower.includes(w));

  const eventPatterns = [
    /\b(enem|vestibular|encceja|saeb|sisu|prouni|concurso)\s+\d{4}\b/i,
    /\b\d{4}\s+(enem|vestibular|encceja|saeb|sisu|prouni|concurso)\b/i,
    /\btema\s+d[aeo]\s+reda[cç][aã]o\b/i,
    /\b(resultado|nota|m[eé]dia|desempenho|ranking)\s+(d[oa]s?\s+)?(enem|saeb|ideb|pisa)\b/i,
    /\b(novo\s+ensino\s+m[eé]dio|reforma|mudan[cç]as?\s+(n[ao]s?\s+)?(bncc|curr[ií]culo))\b/i,
  ];
  const hasEventPattern = eventPatterns.some(p => p.test(query));

  const isTemporal = !!(year || hasTemporalWord || hasEventPattern);

  const temporalTerms = [];
  if (year) temporalTerms.push(String(year));
  if (hasTemporalWord) temporalTerms.push(...temporalWords.filter(w => queryLower.includes(w)));

  return { isTemporal, year, temporalTerms, hasEventPattern };
}

import axios from 'axios';

const STOP_WORDS = new Set([
  'jota', 'assuma', 'controle', 'preciso', 'quero', 'crie', 'planeje',
  'organize', 'faça', 'para', 'mim', 'você', 'pode', 'gostaria', 'ajuda',
  'favor', 'obrigado', 'please', 'help', 'make', 'create', 'need', 'want',
  'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas',
  'com', 'sem', 'sobre', 'que', 'uma', 'uns', 'umas', 'the', 'and', 'for',
  'um', 'uma', 'os', 'as', 'e', 'ou', 'ao', 'se', 'me', 'te', 'lhe',
]);

export function extractCleanThemeFromPrompt(rawText) {
  if (!rawText || rawText.length < 3) return '';

  const text = rawText.toLowerCase();

  const themePatterns = [
    /sobre (?:os |as )?temas? (.+?)(?:,| no dia| usando| com | ao final|\.|$)/i,
    /sobre (.+?) (?:para|no |na |usando|com |ao )/i,
    /atividade(?:s)? (?:sobre|de) (.+?)(?:,|\.|para|no |na |$)/i,
    /ensino de (.+?)(?:,|\.|para|no |na |$)/i,
    /aulas? (?:sobre|de) (.+?)(?:,|\.|para|no |na |$)/i,
    /trabalhar (.+?)(?:,|\.|com|no |na |$)/i,
    /tema[s:]? (.+?)(?:,|\.|para|no |$)/i,
  ];

  let extractedTheme = '';
  for (const pattern of themePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      extractedTheme = match[1].trim().replace(/\s+/g, ' ').slice(0, 60);
      break;
    }
  }

  const gradePattern = /(\d+[ºª°]?\s*ano|\d+[ªa]\s*série)/i;
  const gradeMatch = rawText.match(gradePattern);
  const grade = gradeMatch ? gradeMatch[1].trim() : '';

  if (extractedTheme && grade) {
    return `${extractedTheme}, ${grade}`.trim();
  }

  if (extractedTheme) return extractedTheme;

  const words = rawText
    .replace(/[^\w\sáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 5);

  const fallback = words.join(' ').trim();
  return grade ? `${fallback}, ${grade}` : fallback;
}

export async function planSearchQueries(teacherPrompt, options = {}) {
  const {
    groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || null,
  } = options;

  if (!groqApiKey) {
    const theme = extractCleanThemeFromPrompt(teacherPrompt);
    return theme ? [theme] : [teacherPrompt.slice(0, 100)];
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em busca acadêmica educacional brasileira.
Dado um pedido de professor, gere exatamente 3 queries de busca otimizadas.
Regras:
- Foque no TEMA central, faixa etária/série e metodologia pedagógica
- Use termos em português para melhor resultado
- Cada query: máximo 8 palavras
- Inclua "BNCC" em pelo menos 1 query quando relevante
Responda APENAS com JSON válido: {"queries": ["query1", "query2", "query3"]}`,
          },
          {
            role: 'user',
            content: `Pedido do professor: "${teacherPrompt.slice(0, 300)}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      },
      {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\{[\s\S]*"queries"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const queries = (parsed.queries || [])
        .filter(q => typeof q === 'string' && q.trim().length > 2)
        .slice(0, 3);
      if (queries.length > 0) {
        console.log(`[QueryPlanner] LLM gerou ${queries.length} queries: ${queries.join(' | ')}`);
        return queries;
      }
    }

    throw new Error('Invalid JSON from Groq');

  } catch (err) {
    console.warn('[QueryPlanner] Groq falhou, usando extração regex:', err.message);
    const theme = extractCleanThemeFromPrompt(teacherPrompt);
    return theme ? [theme] : [teacherPrompt.slice(0, 100)];
  }
}

export async function rerankWithLLM(query, results, options = {}) {
  const {
    groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || null,
    topN = 10,
    timeoutMs = 5000,
  } = options;

  if (!groqApiKey || !results || results.length === 0) return results;
  if (results.length <= 3) return results;

  const candidates = results.slice(0, 15);

  const candidatesList = candidates.map((r, i) =>
    `[${i}] "${(r.title || '').slice(0, 80)}" — ${r.source_label || r.provider || 'Web'}\n` +
    `    ${(r.snippet || '').slice(0, 120)}`
  ).join('\n\n');

  const prompt = `Você é especialista em educação brasileira K-12.
Query do professor: "${query.slice(0, 200)}"

Avalie a RELEVÂNCIA EDUCACIONAL de cada resultado para esta query específica.
Responda APENAS com JSON válido (sem markdown, sem explicações):
{"scores":[{"idx":0,"score":8},{"idx":1,"score":2},...]}

Critérios de score (0-10):
- 10: Diretamente sobre o tema, contexto educacional BR
- 7-9: Relacionado ao tema, educacional, útil para o professor
- 4-6: Parcialmente relevante ou periférico
- 1-3: Pouco relacionado ao tema
- 0: Completamente irrelevante para "${query.slice(0, 80)}"

Resultados:
${candidatesList}`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
        max_tokens: 500,
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
    const jsonMatch = rawContent.match(/\{[\s\S]*"scores"[\s\S]*\}/);
    if (!jsonMatch) return results;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.scores || !Array.isArray(parsed.scores)) return results;

    const scoreMap = {};
    for (const s of parsed.scores) {
      if (typeof s.idx === 'number' && typeof s.score === 'number') {
        scoreMap[s.idx] = Math.max(0, Math.min(10, s.score));
      }
    }

    const reranked = candidates.map((r, i) => {
      const gs = scoreMap[i] !== undefined ? scoreMap[i] : 5;
      let multiplier = 1.0;
      if (gs < 3) multiplier = 0.35;
      else if (gs >= 7) multiplier = 1.15;
      return {
        ...r,
        score: Math.min(1.0, Math.round((r.score || 0) * multiplier * 1000) / 1000),
        groq_relevance_score: gs,
      };
    });

    const rerankedSorted = reranked.sort((a, b) => b.score - a.score);
    const remaining = results.slice(15);

    console.log(`[LLMReranker] Reclassificou ${candidates.length} candidatos para "${query.slice(0, 50)}"`);
    return [...rerankedSorted, ...remaining];

  } catch (err) {
    console.warn('[LLMReranker] Falha silenciosa, mantendo ranking original:', err.message);
    return results;
  }
}

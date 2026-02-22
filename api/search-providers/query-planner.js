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

import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';

export interface NeedDetectionResult {
  needsResearch: boolean;
  confidence: number;
  suggestedQuery: string;
  reasoning: string;
  source: 'fast_rules' | 'llm';
}

const GREETING_BLOCKS = [
  /^(oi|ol[aá]|bom\s+dia|boa\s+tarde|boa\s+noite|e\s+a[ií]|fala|hey|hello|hi|opa|tudo\s+bem|como\s+vai)[\s!?.]*$/i,
  /^(obrigad[oa]|valeu|perfeito|[oó]timo|otimo|legal|bacana|top|show|massa|excelente|maravilh|muito\s+bom|adorei|gostei|ficou\s+[oó]timo)[\s!?.]*$/i,
  /^(ok|sim|n[aã]o|entendi|certo|t[aá]|claro|pode\s+ser|beleza|bora|vamos)[\s!?.]*$/i,
  /o\s+que\s+voc[eê]\s+(pode|sabe|faz|consegue)/i,
];

const CREATION_PATTERN = /\b(cri[ae]|mont[ae]|ger[ae]|fa[cçz]a|prepar[ae]|elabor[ae]|produz|planej[ae]|estrutur[ae])\b.*\b(atividade|plano\s+de\s+aula|prova|quiz|exerc[ií]cio|avalia[cç][aã]o|apostila|cruzadinha|ca[cç]a[\s-]palavras|sequ[eê]ncia\s+did[aá]tica|aula|material|arquivo)/i;

const TEMPORAL_FACTUAL_SIGNALS = [
  /\b20(2[0-9]|3[0-9])\b/,
  /\b(enem|vestibular|encceja|saeb|sisu|prouni|fies|concurso|olimp[ií]ada)\b/i,
  /\btema\s+d[aeo]\s+reda[cç][aã]o\b/i,
  /\b(resultado|nota|m[eé]dia|desempenho|ranking|gabarito)\s+(d[oa]s?\s+)?(enem|saeb|ideb|pisa|prova)\b/i,
  /\b(novo\s+ensino\s+m[eé]dio|reforma|mudan[cç]as?\s+(n[ao]s?\s+)?(bncc|curr[ií]culo|educa[cç][aã]o))\b/i,
  /\b(atual|recente|[uú]ltim[oa]|deste\s+ano|este\s+ano|neste\s+ano)\b/i,
  /\b(portaria|resolu[cç][aã]o|decreto|normativa)\s+(d[oa]\s+)?(mec|inep|cne|fnde)\b/i,
];

function hasTemporalOrFactualSignal(prompt: string): boolean {
  return TEMPORAL_FACTUAL_SIGNALS.some(pattern => pattern.test(prompt));
}

const EXPLICIT_TRIGGERS: Array<{ pattern: RegExp; confidence: number }> = [
  { pattern: /\b(pesquis[ae]|busc[ae]|encontr[ae]|procur[ae]|investig[ae]|descubr[ae])\b/i, confidence: 0.90 },
  { pattern: /\b(com\s+fontes|segundo\s+pesquisas|de\s+acordo\s+com|me\s+mostr[ae]\s+dados|baseado\s+em\s+evid[eê]ncias)\b/i, confidence: 0.92 },
  { pattern: /\b(o\s+que\s+(existe|h[aá])\s+de\s+novo|[uú]ltimas\s+(pesquisas|not[ií]cias|mudan[cç]as|atualiza[cç][oõ]es)|recentemente|atualizado|atual(mente)?)\b/i, confidence: 0.90 },
  { pattern: /\b(em\s+20(2[4-9]|3[0-9])|este\s+ano|este\s+m[eê]s|essa\s+semana|hoje)\b/i, confidence: 0.90 },
  { pattern: /\btema\s+d[aeo]\s+reda[cç][aã]o\b/i, confidence: 0.92 },
  { pattern: /\b(resultado|desempenho|dados|nota|m[eé]dia)\s+(d[oa]s?\s+)?(enem|saeb|ideb|pisa)\b/i, confidence: 0.90 },
];

const EDUCATION_EXAM_PATTERN = /\b(enem|vestibular|encceja|saeb|sisu|concurso|olimp[ií]ada)\b/i;

const IMPLICIT_TRIGGERS: Array<{ pattern: RegExp; confidence: number }> = [
  { pattern: /\b(lei|decreto|portaria|resolu[cç][aã]o|normativa|regulamenta)\b/i, confidence: 0.70 },
  { pattern: /\b(quantos|percentual|[ií]ndice|taxa|estat[ií]stica|dados\s+sobre|n[uú]meros)\b/i, confidence: 0.70 },
  { pattern: /\b(metodologia|abordagem|t[eé]cnica|estrat[eé]gia)\s+(de|para|sobre)/i, confidence: 0.65 },
];

const BNCC_TEMPORAL_PATTERN = /\b(bncc|base\s+nacional|curr[ií]culo)\b/i;
const TEMPORAL_WORDS = /\b(recente|atual|novo|mudan[cç]a|atualiza[cç]|reform|revis)/i;

function extractQueryFromPrompt(prompt: string): string {
  const cleanPatterns = [
    /(?:pesquis[ae]|busc[ae]|encontr[ae]|procur[ae])\s+(?:sobre|por|para\s+mim)?\s*/i,
    /(?:me\s+mostr[ae]|me\s+(?:diga|fale))\s+(?:sobre)?\s*/i,
    /(?:quais\s+(?:são|sao)|o\s+que\s+(?:existe|há|ha))\s+(?:sobre|de)?\s*/i,
    /(?:cri[ae]|mont[ae]|ger[ae]|fa[cçz]a|prepar[ae]|elabor[ae])\s+(?:um[a]?\s+)?(?:arquivo|atividade|material|plano)?\s*(?:sobre|com|para)?\s*/i,
  ];

  let query = prompt;
  for (const p of cleanPatterns) {
    query = query.replace(p, '');
  }

  query = query
    .replace(/[?!.]+$/g, '')
    .replace(/^\s+|\s+$/g, '')
    .slice(0, 120);

  return query || prompt.slice(0, 120);
}

function fastRulesDetect(prompt: string): NeedDetectionResult | null {
  const trimmed = prompt.trim();

  for (const blockPattern of GREETING_BLOCKS) {
    if (blockPattern.test(trimmed)) {
      return {
        needsResearch: false,
        confidence: 0.95,
        suggestedQuery: '',
        reasoning: 'Bloqueado: saudação, agradecimento, confirmação ou meta-pergunta',
        source: 'fast_rules',
      };
    }
  }

  if (CREATION_PATTERN.test(trimmed)) {
    if (hasTemporalOrFactualSignal(trimmed)) {
      console.log(`🔬 [REL:NeedDetection] Criação detectada MAS com sinal temporal/factual — NÃO bloqueando`);
    } else {
      return {
        needsResearch: false,
        confidence: 0.95,
        suggestedQuery: '',
        reasoning: 'Bloqueado: pedido de criação de material pedagógico sem dados temporais',
        source: 'fast_rules',
      };
    }
  }

  for (const trigger of EXPLICIT_TRIGGERS) {
    if (trigger.pattern.test(trimmed)) {
      return {
        needsResearch: true,
        confidence: trigger.confidence,
        suggestedQuery: extractQueryFromPrompt(trimmed),
        reasoning: `Trigger explícito detectado (confiança ${trigger.confidence})`,
        source: 'fast_rules',
      };
    }
  }

  if (BNCC_TEMPORAL_PATTERN.test(trimmed) && TEMPORAL_WORDS.test(trimmed)) {
    return {
      needsResearch: true,
      confidence: 0.85,
      suggestedQuery: extractQueryFromPrompt(trimmed),
      reasoning: 'Combinação BNCC/currículo + sinal temporal detectado',
      source: 'fast_rules',
    };
  }

  if (EDUCATION_EXAM_PATTERN.test(trimmed) && TEMPORAL_WORDS.test(trimmed)) {
    return {
      needsResearch: true,
      confidence: 0.85,
      suggestedQuery: extractQueryFromPrompt(trimmed),
      reasoning: 'Combinação exame/avaliação educacional + sinal temporal detectado',
      source: 'fast_rules',
    };
  }

  let bestImplicit: { confidence: number; pattern: RegExp } | null = null;
  for (const trigger of IMPLICIT_TRIGGERS) {
    if (trigger.pattern.test(trimmed)) {
      if (!bestImplicit || trigger.confidence > bestImplicit.confidence) {
        bestImplicit = trigger;
      }
    }
  }

  if (bestImplicit) {
    return {
      needsResearch: true,
      confidence: bestImplicit.confidence,
      suggestedQuery: extractQueryFromPrompt(trimmed),
      reasoning: `Trigger implícito detectado (confiança ${bestImplicit.confidence}) — delegando ao LLM para confirmação`,
      source: 'fast_rules',
    };
  }

  return null;
}

const LLM_NEED_DETECTION_PROMPT = `
Você é um detector de necessidade de pesquisa web para um assistente educacional brasileiro (Agente Jota).
Analise a pergunta do professor e determine se ela requer dados externos atualizados para ser respondida com precisão.

RETORNE pesquisa necessária (needs_research: true) quando:
- A pergunta pede informações factuais que podem ter mudado recentemente
- Pede dados específicos, estatísticas ou números
- Menciona legislação, normas ou regulamentações
- Pede "últimas pesquisas", "novidades", "atualizações"
- A resposta precisa de fontes confiáveis para não ser inventada
- Menciona exames nacionais com contexto temporal (ENEM 2025, vestibular, SAEB)
- Pede informações sobre resultados, temas ou conteúdos de provas/avaliações de anos específicos

RETORNE pesquisa NÃO necessária (needs_research: false) quando:
- É uma pergunta conceitual que pode ser respondida com conhecimento geral
- É uma saudação, agradecimento ou conversa casual
- É uma pergunta sobre as capacidades do assistente
- É uma explicação pedagógica geral que não depende de dados recentes
- É um pedido de criação de material sobre temas conceituais atemporais (frações, fotossíntese, gramática)

EXCEÇÃO IMPORTANTE: Mesmo que seja um pedido de criação de material, se o pedido referencia:
- Eventos com data específica (ENEM 2025, vestibular 2024, provas de um ano específico)
- Dados que mudam anualmente (tema da redação, resultado do SAEB, nota de corte do SISU)
- Informações legislativas ou curriculares recentes (nova BNCC, reforma do ensino médio)
→ RETORNE needs_research: true (o conteúdo precisa de dados reais para não ser inventado)

EXEMPLOS:
- "Crie um arquivo sobre o tema da redação do ENEM de 2025" → needs_research: true (precisa saber o tema real)
- "Monte uma atividade sobre as últimas mudanças na BNCC" → needs_research: true (dados recentes)
- "Elabore um plano sobre o resultado do SAEB 2024" → needs_research: true (dados de avaliação)
- "Crie 5 atividades de matemática sobre frações" → needs_research: false (tema conceitual atemporal)
- "Monte um quiz sobre fotossíntese para o 7º ano" → needs_research: false (tema conceitual atemporal)

Responda APENAS JSON:
{
  "needs_research": true/false,
  "confidence": 0.0 a 1.0,
  "query_suggestion": "query otimizada para busca educacional",
  "reasoning": "explicação curta"
}
`.trim();

async function llmFallbackDetect(prompt: string): Promise<NeedDetectionResult> {
  try {
    const userMessage = `PERGUNTA DO PROFESSOR: "${prompt}"\n\nResponda APENAS JSON.`;

    const result = await executeWithCascadeFallback(userMessage, {
      systemPrompt: LLM_NEED_DETECTION_PROMPT,
    });

    if (result.success && result.data) {
      let cleaned = result.data.trim();
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          needsResearch: !!parsed.needs_research,
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
          suggestedQuery: parsed.query_suggestion || extractQueryFromPrompt(prompt),
          reasoning: parsed.reasoning || 'LLM avaliou necessidade de pesquisa',
          source: 'llm',
        };
      }
    }
  } catch (error) {
    console.warn('⚠️ [REL:NeedDetection] LLM fallback falhou:', error);
  }

  return {
    needsResearch: false,
    confidence: 0.3,
    suggestedQuery: '',
    reasoning: 'LLM fallback falhou — padrão: sem pesquisa',
    source: 'llm',
  };
}

export async function detectResearchNeed(prompt: string): Promise<NeedDetectionResult> {
  console.log(`🔬 [REL:NeedDetection] Analisando: "${prompt.substring(0, 80)}..."`);

  const fastResult = fastRulesDetect(prompt);

  if (fastResult && !fastResult.needsResearch && fastResult.confidence >= 0.85) {
    console.log(`🔬 [REL:NeedDetection] FastRules BLOQUEOU pesquisa (${(fastResult.confidence * 100).toFixed(0)}%): ${fastResult.reasoning}`);
    return fastResult;
  }

  if (fastResult && fastResult.needsResearch && fastResult.confidence >= 0.85) {
    console.log(`🔬 [REL:NeedDetection] FastRules ATIVOU pesquisa (${(fastResult.confidence * 100).toFixed(0)}%): ${fastResult.reasoning}`);
    return fastResult;
  }

  if (fastResult && fastResult.needsResearch && fastResult.confidence < 0.85) {
    console.log(`🔬 [REL:NeedDetection] FastRules confiança média (${(fastResult.confidence * 100).toFixed(0)}%) — delegando ao LLM...`);
    const llmResult = await llmFallbackDetect(prompt);

    if (llmResult.needsResearch && llmResult.confidence > 0.6) {
      console.log(`🔬 [REL:NeedDetection] LLM CONFIRMOU pesquisa (${(llmResult.confidence * 100).toFixed(0)}%): ${llmResult.reasoning}`);
      return llmResult;
    }

    console.log(`🔬 [REL:NeedDetection] LLM NEGOU pesquisa (${(llmResult.confidence * 100).toFixed(0)}%): ${llmResult.reasoning}`);
    return llmResult;
  }

  console.log(`🔬 [REL:NeedDetection] FastRules inconclusivo — delegando ao LLM...`);
  const llmResult = await llmFallbackDetect(prompt);
  console.log(`🔬 [REL:NeedDetection] LLM resultado: needsResearch=${llmResult.needsResearch} (${(llmResult.confidence * 100).toFixed(0)}%)`);
  return llmResult;
}

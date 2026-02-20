import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { getSession } from './session-store';

export type SmartRouteType = 'CONVERSAR' | 'EXECUTAR' | 'CAPABILITY_DIRETA';

export interface SmartRouteResult {
  route: SmartRouteType;
  confidence: number;
  reasoning: string;
  capability?: string;
  capability_params?: Record<string, any>;
  resposta_direta?: string;
  source: 'fast_rules' | 'llm' | 'fallback';
}

const VALID_DIRECT_CAPABILITIES = [
  'gerenciar_calendario',
  'pesquisar_atividades_conta',
  'pesquisar_atividades_disponiveis',
];

const SMART_ROUTER_PROMPT = `
Você é o roteador do Jota, assistente de IA para professores brasileiros.
Analise a mensagem e decida o caminho CORRETO.

MENSAGEM: "{user_prompt}"

CONTEXTO: {session_context}

ROTAS:

1. "CONVERSAR" — Conversa, pergunta, saudação, agradecimento, dúvida conceitual.
   Exemplos: "oi", "obrigado", "o que é SAAS?", "como funciona a BNCC?", "me explica melhor"

2. "EXECUTAR" — Criar materiais pedagógicos: atividades, planos de aula, provas, quiz, documentos escolares.
   Exemplos: "crie 5 atividades de matemática", "monte um plano de aula sobre fotossíntese"
   INCLUI pedidos compostos que envolvem criação + calendário (ex: "planeje aulas e organize no calendário")

3. "CAPABILITY_DIRETA" — Ação ISOLADA sobre dados do professor (sem criação de material):
   - "gerenciar_calendario": APENAS quando o professor quer consultar, criar, editar ou excluir compromissos SEM criar material pedagógico
   - "pesquisar_atividades_conta": consultar atividades já criadas
   - "pesquisar_atividades_disponiveis": ver catálogo de atividades

REGRA DE OURO:
- Se menciona "crie/faça/monte/planeje/elabore/prepare" + tema escolar → EXECUTAR (mesmo que mencione calendário)
- Se APENAS gerencia calendário/agenda sem criar material → CAPABILITY_DIRETA (gerenciar_calendario)
- Se é pergunta, saudação, agradecimento ou conversa → CONVERSAR
- Pedidos COMPOSTOS (criar + agendar, planejar + calendário) → EXECUTAR (o planner decompõe internamente)

Responda APENAS JSON:
{
  "route": "CONVERSAR" | "EXECUTAR" | "CAPABILITY_DIRETA",
  "confidence": 0.0 a 1.0,
  "reasoning": "explicação curta",
  "capability": "nome (só para CAPABILITY_DIRETA)",
  "capability_params": {} 
}
`.trim();

function buildSessionContextSummary(sessionId: string, userId: string): string {
  const session = getSession(sessionId);
  if (!session) return 'Primeira interação.';

  const parts: string[] = [];

  if (session.currentPlan) {
    parts.push(`Plano ativo: "${session.currentPlan.objetivo}" (${session.currentPlan.etapasCompletas}/${session.currentPlan.totalEtapas} etapas)`);
  }

  if (session.activitiesCreated && session.activitiesCreated.length > 0) {
    parts.push(`Atividades criadas: ${session.activitiesCreated.length}`);
  }

  const recentTurns = (session.conversationHistory || []).slice(-3);
  if (recentTurns.length > 0) {
    const summary = recentTurns.map(t => `${t.role === 'user' ? 'Prof' : 'Jota'}: "${t.content.substring(0, 60)}"`).join(' | ');
    parts.push(`Recente: ${summary}`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Sem contexto.';
}

const CREATION_VERBS = /\b(cri[ae]|mont[ae]|ger[ae]|fa[cçz]a|prepar[ae]|elabor[ae]|produz|planej[ae]|estrutur[ae]|organiz[ae]|assum[ae])/i;
const PEDAGOGICAL_CONTENT = /\b(atividade|plano\s+de\s+aula|prova|quiz|exerc[ií]cio|avalia[cç][aã]o|apostila|roteiro|dossi[eê]|cruzadinha|ca[cç]a[\s-]palavras|sequ[eê]ncia\s+did[aá]tica|aula|aulas|li[cç][aã]o|material|conte[uú]do)/i;
const SCHOOL_SUBJECT = /\b(matem[aá]tica|portugu[eê]s|ci[eê]ncias|hist[oó]ria|geografia|ingl[eê]s|educa[cç][aã]o\s+f[ií]sica|artes?|biologia|qu[ií]mica|f[ií]sica|sociologia|filosofia|BNCC|fun[cç][oõ]es|fra[cç][oõ]es|equa[cç][oõ]es|geometria|[aá]lgebra|gram[aá]tica|reda[cç][aã]o|literatura|ecossistema|fotoss[ií]ntese|segundo\s+grau)/i;
const GRADE_LEVEL = /\b(\d+[ºªo]?\s*ano|turma|s[eé]rie|fundamental|m[eé]dio|infantil|EJA)\b/i;

const CALENDAR_KEYWORDS = [
  'calendario', 'compromisso', 'compromissos', 'agenda', 'agendar', 'agende',
  'evento', 'eventos', 'reuniao', 'reuniões', 'reunioes',
  'dias livres', 'dia livre', 'disponibilidade', 'disponivel',
  'meus eventos', 'meu calendario', 'minha agenda',
  'cancele o evento', 'cancele o compromisso', 'exclua o evento',
  'edite o evento', 'altere o compromisso', 'mude o horario',
  'quais compromissos', 'quais eventos', 'o que tenho agendado',
  'marque uma reuniao', 'marcar reuniao',
];

const CALENDAR_ONLY_PATTERNS = [
  /^(agende|agendar|marque|marcar|crie?\s+(um\s+)?compromisso|crie?\s+(um\s+)?evento)/i,
  /^(cancele|exclua|edite|altere|mude)\s+(o\s+)?(compromisso|evento|hor[aá]rio)/i,
  /^(quais|mostre?|ver|listar?)\s+(meus\s+)?(compromissos|eventos|agenda)/i,
  /^(minha\s+agenda|meu\s+calend[aá]rio|o\s+que\s+tenho\s+agendado)/i,
];

function detectSignals(userPrompt: string) {
  const trimmed = userPrompt.trim().toLowerCase();
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const hasCreationVerb = CREATION_VERBS.test(trimmed);
  const hasPedagogicalContent = PEDAGOGICAL_CONTENT.test(trimmed);
  const hasSchoolSubject = SCHOOL_SUBJECT.test(trimmed);
  const hasGradeLevel = GRADE_LEVEL.test(trimmed);
  const hasCalendarKeyword = CALENDAR_KEYWORDS.some(kw => normalized.includes(kw));
  const isCalendarOnly = CALENDAR_ONLY_PATTERNS.some(p => p.test(trimmed));
  const isLongMessage = trimmed.length > 80;

  const executarScore =
    (hasCreationVerb ? 2 : 0) +
    (hasPedagogicalContent ? 2 : 0) +
    (hasSchoolSubject ? 1 : 0) +
    (hasGradeLevel ? 1 : 0);

  return {
    trimmed,
    normalized,
    hasCreationVerb,
    hasPedagogicalContent,
    hasSchoolSubject,
    hasGradeLevel,
    hasCalendarKeyword,
    isCalendarOnly,
    isLongMessage,
    executarScore,
  };
}

function fastRulesClassify(userPrompt: string): SmartRouteResult | null {
  const s = detectSignals(userPrompt);

  const pureGreetings = /^(oi|ol[aá]|bom\s+dia|boa\s+tarde|boa\s+noite|e\s+a[ií]|fala|hey|hello|hi|opa|tudo\s+bem|como\s+vai)[\s!?.]*$/i;
  if (pureGreetings.test(s.trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.95,
      reasoning: 'Regra rápida: saudação pura',
      source: 'fast_rules',
    };
  }

  const pureThanks = /^(obrigad[oa]|valeu|perfeito|[oó]timo|otimo|legal|bacana|top|show|massa|excelente|maravilh|muito\s+bom|adorei|gostei|ficou\s+[oó]timo)[\s!?.]*$/i;
  if (pureThanks.test(s.trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.95,
      reasoning: 'Regra rápida: agradecimento/feedback',
      source: 'fast_rules',
    };
  }

  const simpleConfirmation = /^(ok|sim|n[aã]o|entendi|certo|t[aá]|claro|pode\s+ser|beleza|bora|vamos)[\s!?.]*$/i;
  if (simpleConfirmation.test(s.trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.90,
      reasoning: 'Regra rápida: confirmação simples',
      source: 'fast_rules',
    };
  }

  const followUpConversation = /^(me\s+explic|explica\s+melhor|pode\s+explicar|o\s+que\s+[eé]|como\s+funciona|me\s+fala\s+(mais\s+)?sobre|conta\s+mais|detalh|aprofund)/i;
  if (followUpConversation.test(s.trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.90,
      reasoning: 'Regra rápida: pedido de explicação/aprofundamento',
      source: 'fast_rules',
    };
  }

  const aboutJota = /o\s+que\s+voc[eê]\s+(pode|sabe|faz|consegue)/i;
  if (aboutJota.test(s.trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.90,
      reasoning: 'Regra rápida: pergunta sobre capacidades do Jota',
      source: 'fast_rules',
    };
  }

  if (s.executarScore >= 3 && s.hasCalendarKeyword) {
    console.log(`⚡ [SmartRouter:FastRules] Pedido COMPOSTO detectado (EXECUTAR + calendário): "${userPrompt.substring(0, 80)}"`);
    console.log(`   → executarScore=${s.executarScore}, calendário presente mas NÃO é intent principal`);
    return {
      route: 'EXECUTAR',
      confidence: 0.95,
      reasoning: 'Regra rápida: pedido composto — criação pedagógica + calendário → EXECUTAR (planner decompõe)',
      source: 'fast_rules',
    };
  }

  if (s.hasCreationVerb && s.hasPedagogicalContent) {
    return {
      route: 'EXECUTAR',
      confidence: 0.92,
      reasoning: 'Regra rápida: verbo de criação + tipo de material pedagógico',
      source: 'fast_rules',
    };
  }

  if (s.hasCreationVerb && s.hasSchoolSubject && s.hasGradeLevel) {
    return {
      route: 'EXECUTAR',
      confidence: 0.90,
      reasoning: 'Regra rápida: verbo de criação + disciplina + ano/série',
      source: 'fast_rules',
    };
  }

  if (s.hasPedagogicalContent && s.hasSchoolSubject && (s.hasGradeLevel || s.hasCreationVerb)) {
    return {
      route: 'EXECUTAR',
      confidence: 0.85,
      reasoning: 'Regra rápida: material pedagógico + disciplina + contexto escolar',
      source: 'fast_rules',
    };
  }

  if (s.isLongMessage && s.executarScore >= 2 && s.hasCalendarKeyword) {
    console.log(`⚡ [SmartRouter:FastRules] Mensagem longa com sinais de EXECUTAR + calendário: "${userPrompt.substring(0, 80)}"`);
    return {
      route: 'EXECUTAR',
      confidence: 0.88,
      reasoning: 'Regra rápida: mensagem longa com sinais de criação + calendário → EXECUTAR',
      source: 'fast_rules',
    };
  }

  if (s.hasCalendarKeyword) {
    if (s.isCalendarOnly || s.trimmed.length < 80) {
      console.log(`⚡ [SmartRouter:FastRules] Calendário ISOLADO detectado: "${userPrompt.substring(0, 60)}"`);
      return {
        route: 'CAPABILITY_DIRETA',
        confidence: 0.95,
        reasoning: 'Regra rápida: pedido isolado de calendário',
        capability: 'gerenciar_calendario',
        capability_params: { user_prompt: userPrompt, user_objective: userPrompt },
        source: 'fast_rules',
      };
    }

    if (!s.hasCreationVerb && !s.hasPedagogicalContent && !s.hasSchoolSubject) {
      console.log(`⚡ [SmartRouter:FastRules] Calendário sem sinais pedagógicos: "${userPrompt.substring(0, 60)}"`);
      return {
        route: 'CAPABILITY_DIRETA',
        confidence: 0.90,
        reasoning: 'Regra rápida: calendário sem sinais de criação pedagógica',
        capability: 'gerenciar_calendario',
        capability_params: { user_prompt: userPrompt, user_objective: userPrompt },
        source: 'fast_rules',
      };
    }

    console.log(`⚡ [SmartRouter:FastRules] Calendário detectado mas com sinais pedagógicos — delegando ao LLM`);
    return {
      route: 'EXECUTAR',
      confidence: 0.70,
      reasoning: 'Regra rápida: calendário + sinais pedagógicos — confiança baixa, delegar ao LLM',
      source: 'fast_rules',
    };
  }

  const myActivitiesPatterns = [
    /quais\s+atividades\s+(eu\s+)?j[aá]\s+cri/i,
    /minhas\s+atividades/i,
    /o\s+que\s+(eu\s+)?j[aá]\s+(fiz|criei)/i,
    /me\s+mostr[ae]\s+minhas/i,
    /atividades\s+que\s+eu\s+criei/i,
    /meus\s+materiais/i,
    /o\s+que\s+eu\s+tenho\s+salvo/i,
  ];
  if (myActivitiesPatterns.some(p => p.test(s.trimmed))) {
    console.log(`⚡ [SmartRouter:FastRules] Pesquisa de atividades: "${userPrompt.substring(0, 60)}"`);
    return {
      route: 'CAPABILITY_DIRETA',
      confidence: 0.90,
      reasoning: 'Regra rápida: consulta de atividades próprias',
      capability: 'pesquisar_atividades_conta',
      source: 'fast_rules',
    };
  }

  const catalogPatterns = [
    /quais\s+tipos?\s+de\s+atividades?\s+existem/i,
    /o\s+que\s+(eu\s+)?posso\s+criar/i,
    /quais\s+atividades?\s+est[aã]o\s+dispon[ií]veis/i,
    /catalogo\s+de\s+atividades/i,
  ];
  if (catalogPatterns.some(p => p.test(s.trimmed))) {
    return {
      route: 'CAPABILITY_DIRETA',
      confidence: 0.90,
      reasoning: 'Regra rápida: consulta de catálogo',
      capability: 'pesquisar_atividades_disponiveis',
      source: 'fast_rules',
    };
  }

  if (s.trimmed.endsWith('?') && !s.hasCreationVerb && !s.hasPedagogicalContent) {
    return {
      route: 'CONVERSAR',
      confidence: 0.80,
      reasoning: 'Regra rápida: pergunta sem verbo de criação',
      source: 'fast_rules',
    };
  }

  return null;
}

export async function smartRoute(
  userPrompt: string,
  sessionId: string,
  userId: string
): Promise<SmartRouteResult> {
  console.log(`\n🧭 [SmartRouter] ═══════════════════════════════════════`);
  console.log(`🧭 [SmartRouter] Input: "${userPrompt.substring(0, 100)}"`);

  const fastResult = fastRulesClassify(userPrompt);
  if (fastResult && fastResult.confidence >= 0.85) {
    console.log(`🧭 [SmartRouter] ✅ FastRules: ${fastResult.route} (${(fastResult.confidence * 100).toFixed(0)}%) — ${fastResult.reasoning}`);
    console.log(`🧭 [SmartRouter] ═══════════════════════════════════════\n`);
    return fastResult;
  }

  if (fastResult) {
    console.log(`🧭 [SmartRouter] 🔶 FastRules sugeriu ${fastResult.route} (${(fastResult.confidence * 100).toFixed(0)}%) mas confiança baixa — consultando LLM...`);
  } else {
    console.log(`🧭 [SmartRouter] 🔶 FastRules inconclusivo — consultando LLM...`);
  }

  const sessionContext = buildSessionContextSummary(sessionId, userId);
  const routingUserPrompt = `MENSAGEM: "${userPrompt}"\n\nCONTEXTO: ${sessionContext}\n\nResponda APENAS JSON com: route, confidence, reasoning, capability (se CAPABILITY_DIRETA), capability_params.`;
  const routingSystemPrompt = SMART_ROUTER_PROMPT
    .replace('{user_prompt}', userPrompt)
    .replace('{session_context}', sessionContext);

  try {
    const result = await executeWithCascadeFallback(routingUserPrompt, {
      onProgress: (status) => console.log(`🧭 [SmartRouter:LLM] ${status}`),
      systemPrompt: routingSystemPrompt,
    });

    if (!result.success || !result.data) {
      console.warn('⚠️ [SmartRouter] LLM falhou — usando FastRules ou fallback');
      const finalResult = fastResult || emergencyFallback(userPrompt);
      console.log(`🧭 [SmartRouter] Fallback: ${finalResult.route} (${(finalResult.confidence * 100).toFixed(0)}%)`);
      console.log(`🧭 [SmartRouter] ═══════════════════════════════════════\n`);
      return finalResult;
    }

    const parsed = parseRouterResponse(result.data);

    if (parsed.route === 'CAPABILITY_DIRETA') {
      if (!parsed.capability) {
        console.warn(`⚠️ [SmartRouter] CAPABILITY_DIRETA sem capability — verificando FastRules...`);
        if (fastResult?.capability) {
          parsed.capability = fastResult.capability;
          parsed.capability_params = fastResult.capability_params;
        } else {
          console.warn(`⚠️ [SmartRouter] Sem capability detectada — redirecionando para CONVERSAR`);
          return {
            route: 'CONVERSAR',
            confidence: 0.60,
            reasoning: 'LLM retornou CAPABILITY_DIRETA mas sem capability — fallback para CONVERSAR',
            source: 'fallback',
          };
        }
      }
      if (!VALID_DIRECT_CAPABILITIES.includes(parsed.capability)) {
        console.warn(`⚠️ [SmartRouter] Capability "${parsed.capability}" inválida — redirecionando para EXECUTAR`);
        return {
          route: 'EXECUTAR',
          confidence: parsed.confidence,
          reasoning: `Capability "${parsed.capability}" não é direta — redirecionado para EXECUTAR`,
          source: 'llm',
        };
      }

      const signals = detectSignals(userPrompt);
      if (signals.executarScore >= 3) {
        console.log(`🧭 [SmartRouter] ⚠️ LLM disse CAPABILITY_DIRETA mas mensagem tem sinais fortes de EXECUTAR (score=${signals.executarScore}) — corrigindo para EXECUTAR`);
        return {
          route: 'EXECUTAR',
          confidence: 0.90,
          reasoning: `LLM sugeriu CAPABILITY_DIRETA mas sinais pedagógicos fortes (score=${signals.executarScore}) → EXECUTAR`,
          source: 'llm',
        };
      }
    }

    if (fastResult && fastResult.confidence >= 0.80 && fastResult.route !== parsed.route) {
      console.log(`🧭 [SmartRouter] ⚠️ Conflito! FastRules=${fastResult.route} vs LLM=${parsed.route}`);

      if (fastResult.route === 'EXECUTAR' && parsed.route === 'CAPABILITY_DIRETA') {
        console.log(`🧭 [SmartRouter] → Priorizando FastRules EXECUTAR sobre LLM CAPABILITY_DIRETA (pedido composto)`);
        console.log(`🧭 [SmartRouter] ═══════════════════════════════════════\n`);
        return { ...fastResult, reasoning: `FastRules priorizou EXECUTAR sobre LLM CAPABILITY_DIRETA: ${fastResult.reasoning}` };
      }

      if (fastResult.route === 'CAPABILITY_DIRETA' && parsed.route === 'EXECUTAR') {
        const signals = detectSignals(userPrompt);
        if (signals.executarScore >= 2) {
          console.log(`🧭 [SmartRouter] → LLM EXECUTAR prevalece sobre FastRules CAPABILITY_DIRETA (sinais pedagógicos encontrados)`);
          console.log(`🧭 [SmartRouter] ═══════════════════════════════════════\n`);
          return { ...parsed, source: 'llm', reasoning: `LLM EXECUTAR prevaleceu: sinais pedagógicos (score=${signals.executarScore})` };
        }
        console.log(`🧭 [SmartRouter] → Priorizando FastRules (CAPABILITY_DIRETA > EXECUTAR, sem sinais pedagógicos fortes)`);
        console.log(`🧭 [SmartRouter] ═══════════════════════════════════════\n`);
        return { ...fastResult, reasoning: `FastRules priorizou CAPABILITY_DIRETA sobre LLM EXECUTAR: ${fastResult.reasoning}` };
      }

      if (fastResult.route === 'CONVERSAR' && parsed.route === 'EXECUTAR') {
        console.log(`🧭 [SmartRouter] → Priorizando FastRules (CONVERSAR > EXECUTAR para conversas simples)`);
        console.log(`🧭 [SmartRouter] ═══════════════════════════════════════\n`);
        return { ...fastResult, reasoning: `FastRules priorizou CONVERSAR sobre LLM EXECUTAR: ${fastResult.reasoning}` };
      }
    }

    parsed.source = 'llm';
    console.log(`🧭 [SmartRouter] ✅ LLM: ${parsed.route} (${(parsed.confidence * 100).toFixed(0)}%) — ${parsed.reasoning}`);
    console.log(`🧭 [SmartRouter] ═══════════════════════════════════════\n`);
    return parsed;

  } catch (error) {
    console.error('❌ [SmartRouter] Erro na classificação LLM:', error);
    const finalResult = fastResult || emergencyFallback(userPrompt);
    finalResult.source = 'fallback';
    console.log(`🧭 [SmartRouter] Emergency fallback: ${finalResult.route}`);
    console.log(`🧭 [SmartRouter] ═══════════════════════════════════════\n`);
    return finalResult;
  }
}

function parseRouterResponse(responseText: string): SmartRouteResult {
  let cleaned = responseText.trim();
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON não encontrado na resposta do SmartRouter');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const validRoutes: SmartRouteType[] = ['CONVERSAR', 'EXECUTAR', 'CAPABILITY_DIRETA'];
  if (!validRoutes.includes(parsed.route)) {
    throw new Error(`Rota inválida: ${parsed.route}`);
  }

  return {
    route: parsed.route,
    confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
    reasoning: parsed.reasoning || 'Sem justificativa',
    capability: parsed.capability || undefined,
    capability_params: parsed.capability_params || undefined,
    source: 'llm',
  };
}

function emergencyFallback(userPrompt: string): SmartRouteResult {
  const trimmed = userPrompt.trim().toLowerCase();

  if (trimmed.length < 15 || trimmed.endsWith('?')) {
    return { route: 'CONVERSAR', confidence: 0.55, reasoning: 'Emergency fallback: mensagem curta ou pergunta → conversar', source: 'fallback' };
  }

  const hasCreation = /\b(cri[ae]|mont[ae]|ger[ae]|fa[cçz]a|prepar|elabor|produz|planej)/i.test(trimmed);
  const hasSchool = /\b(atividade|plano|prova|quiz|exerc|aula|apost|dossi)/i.test(trimmed);

  if (hasCreation && hasSchool) {
    return { route: 'EXECUTAR', confidence: 0.60, reasoning: 'Emergency fallback: criação + material escolar', source: 'fallback' };
  }

  return { route: 'CONVERSAR', confidence: 0.50, reasoning: 'Emergency fallback: sem padrão forte → conversar é mais seguro', source: 'fallback' };
}

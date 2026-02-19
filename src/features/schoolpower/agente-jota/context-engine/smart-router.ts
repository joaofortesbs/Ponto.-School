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
   IMPORTANTE: "compromisso", "evento", "agenda", "calendário" NÃO são materiais pedagógicos!

3. "CAPABILITY_DIRETA" — Ação específica sobre DADOS DO PROFESSOR (não criação de material):
   - "gerenciar_calendario": calendário, compromissos, eventos, agenda, reuniões, disponibilidade
   - "pesquisar_atividades_conta": consultar atividades já criadas
   - "pesquisar_atividades_disponiveis": ver catálogo de atividades

REGRA DE OURO:
- Se menciona "compromisso", "calendário", "agenda", "evento", "reunião", "agendar" → CAPABILITY_DIRETA (gerenciar_calendario)
- Se menciona "crie/faça/monte" + tema escolar (matemática, ciências, etc.) → EXECUTAR
- Se é pergunta, saudação, agradecimento ou conversa → CONVERSAR
- "Crie um compromisso" = CAPABILITY_DIRETA (gerenciar_calendario), NÃO é EXECUTAR!

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

function fastRulesClassify(userPrompt: string): SmartRouteResult | null {
  const trimmed = userPrompt.trim().toLowerCase();
  const normalized = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const calendarKeywords = [
    'calendario', 'compromisso', 'compromissos', 'agenda', 'agendar', 'agende',
    'evento', 'eventos', 'reuniao', 'reuniões', 'reunioes',
    'dias livres', 'dia livre', 'disponibilidade', 'disponivel',
    'meus eventos', 'meu calendario', 'minha agenda',
    'cancele o evento', 'cancele o compromisso', 'exclua o evento',
    'edite o evento', 'altere o compromisso', 'mude o horario',
    'quais compromissos', 'quais eventos', 'o que tenho agendado',
    'marque uma reuniao', 'marcar reuniao',
  ];

  const hasCalendarKeyword = calendarKeywords.some(kw => normalized.includes(kw));

  if (hasCalendarKeyword) {
    console.log(`⚡ [SmartRouter:FastRules] Calendário detectado: "${userPrompt.substring(0, 60)}"`);
    return {
      route: 'CAPABILITY_DIRETA',
      confidence: 0.95,
      reasoning: 'Regra rápida: palavra-chave de calendário detectada',
      capability: 'gerenciar_calendario',
      capability_params: { user_prompt: userPrompt, user_objective: userPrompt },
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
  if (myActivitiesPatterns.some(p => p.test(trimmed))) {
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
  if (catalogPatterns.some(p => p.test(trimmed))) {
    return {
      route: 'CAPABILITY_DIRETA',
      confidence: 0.90,
      reasoning: 'Regra rápida: consulta de catálogo',
      capability: 'pesquisar_atividades_disponiveis',
      source: 'fast_rules',
    };
  }

  const pureGreetings = /^(oi|ol[aá]|bom\s+dia|boa\s+tarde|boa\s+noite|e\s+a[ií]|fala|hey|hello|hi|opa|tudo\s+bem|como\s+vai)[\s!?.]*$/i;
  if (pureGreetings.test(trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.95,
      reasoning: 'Regra rápida: saudação pura',
      source: 'fast_rules',
    };
  }

  const pureThanks = /^(obrigad[oa]|valeu|perfeito|[oó]timo|otimo|legal|bacana|top|show|massa|excelente|maravilh|muito\s+bom|adorei|gostei|ficou\s+[oó]timo)[\s!?.]*$/i;
  if (pureThanks.test(trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.95,
      reasoning: 'Regra rápida: agradecimento/feedback',
      source: 'fast_rules',
    };
  }

  const simpleConfirmation = /^(ok|sim|n[aã]o|entendi|certo|t[aá]|claro|pode\s+ser|beleza|bora|vamos)[\s!?.]*$/i;
  if (simpleConfirmation.test(trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.90,
      reasoning: 'Regra rápida: confirmação simples',
      source: 'fast_rules',
    };
  }

  const followUpConversation = /^(me\s+explic|explica\s+melhor|pode\s+explicar|o\s+que\s+[eé]|como\s+funciona|me\s+fala\s+(mais\s+)?sobre|conta\s+mais|detalh|aprofund)/i;
  if (followUpConversation.test(trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.90,
      reasoning: 'Regra rápida: pedido de explicação/aprofundamento',
      source: 'fast_rules',
    };
  }

  const aboutJota = /o\s+que\s+voc[eê]\s+(pode|sabe|faz|consegue)/i;
  if (aboutJota.test(trimmed)) {
    return {
      route: 'CONVERSAR',
      confidence: 0.90,
      reasoning: 'Regra rápida: pergunta sobre capacidades do Jota',
      source: 'fast_rules',
    };
  }

  const creationVerbs = /\b(cri[ae]|mont[ae]|ger[ae]|fa[cçz]a|prepar[ae]|elabor[ae]|produz)/i;
  const pedagogicalContent = /\b(atividade|plano\s+de\s+aula|prova|quiz|exerc[ií]cio|avalia[cç][aã]o|apostila|roteiro|dossi[eê]|cruzadinha|ca[cç]a[\s-]palavras|sequ[eê]ncia\s+did[aá]tica)/i;
  const schoolSubject = /\b(matem[aá]tica|portugu[eê]s|ci[eê]ncias|hist[oó]ria|geografia|ingl[eê]s|educa[cç][aã]o\s+f[ií]sica|artes?|biologia|qu[ií]mica|f[ií]sica|sociologia|filosofia|BNCC)/i;
  const gradeLevel = /\b(\d+[ºªo]?\s*ano|turma|s[eé]rie|fundamental|m[eé]dio|infantil|EJA)\b/i;

  const hasCreationVerb = creationVerbs.test(trimmed);
  const hasPedagogicalContent = pedagogicalContent.test(trimmed);
  const hasSchoolSubject = schoolSubject.test(trimmed);
  const hasGradeLevel = gradeLevel.test(trimmed);

  if (hasCreationVerb && hasPedagogicalContent) {
    return {
      route: 'EXECUTAR',
      confidence: 0.92,
      reasoning: 'Regra rápida: verbo de criação + tipo de material pedagógico',
      source: 'fast_rules',
    };
  }

  if (hasCreationVerb && hasSchoolSubject && hasGradeLevel) {
    return {
      route: 'EXECUTAR',
      confidence: 0.90,
      reasoning: 'Regra rápida: verbo de criação + disciplina + ano/série',
      source: 'fast_rules',
    };
  }

  if (hasPedagogicalContent && hasSchoolSubject && (hasGradeLevel || hasCreationVerb)) {
    return {
      route: 'EXECUTAR',
      confidence: 0.85,
      reasoning: 'Regra rápida: material pedagógico + disciplina + contexto escolar',
      source: 'fast_rules',
    };
  }

  if (trimmed.endsWith('?') && !hasCreationVerb && !hasPedagogicalContent) {
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
  const prompt = SMART_ROUTER_PROMPT
    .replace('{user_prompt}', userPrompt)
    .replace('{session_context}', sessionContext);

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`🧭 [SmartRouter:LLM] ${status}`),
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
    }

    if (fastResult && fastResult.confidence >= 0.80 && fastResult.route !== parsed.route) {
      console.log(`🧭 [SmartRouter] ⚠️ Conflito! FastRules=${fastResult.route} vs LLM=${parsed.route}`);

      if (fastResult.route === 'CAPABILITY_DIRETA' && parsed.route === 'EXECUTAR') {
        console.log(`🧭 [SmartRouter] → Priorizando FastRules (CAPABILITY_DIRETA > EXECUTAR para dados do professor)`);
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

  const hasCreation = /\b(cri[ae]|mont[ae]|ger[ae]|fa[cçz]a|prepar|elabor|produz)/i.test(trimmed);
  const hasSchool = /\b(atividade|plano|prova|quiz|exerc|aula|apost)/i.test(trimmed);

  if (hasCreation && hasSchool) {
    return { route: 'EXECUTAR', confidence: 0.60, reasoning: 'Emergency fallback: criação + material escolar', source: 'fallback' };
  }

  return { route: 'CONVERSAR', confidence: 0.50, reasoning: 'Emergency fallback: sem padrão forte → conversar é mais seguro', source: 'fallback' };
}

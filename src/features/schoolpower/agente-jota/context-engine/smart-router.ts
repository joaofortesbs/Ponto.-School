import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { getSession } from './session-store';
import { buildContextForFollowUp } from './context-gateway';

export type SmartRouteType = 'CONVERSAR' | 'EXECUTAR' | 'CAPABILITY_DIRETA';

export interface SmartRouteResult {
  route: SmartRouteType;
  confidence: number;
  reasoning: string;
  capability?: string;
  capability_params?: Record<string, any>;
  resposta_direta?: string;
}

const VALID_DIRECT_CAPABILITIES = [
  'gerenciar_calendario',
  'pesquisar_atividades_conta',
  'pesquisar_atividades_disponiveis',
];

const SMART_ROUTER_PROMPT = `
Você é o roteador inteligente do Jota (assistente de IA para professores brasileiros).
Sua ÚNICA tarefa é analisar a mensagem do professor e decidir qual caminho seguir.

MENSAGEM DO PROFESSOR:
"{user_prompt}"

CONTEXTO DA SESSÃO:
{session_context}

═══════════════════════════════════════════════════════════════
ROTAS DISPONÍVEIS (escolha EXATAMENTE uma):
═══════════════════════════════════════════════════════════════

1. "CONVERSAR" — O professor quer CONVERSAR, fazer uma pergunta, agradecer, cumprimentar ou obter informação.
   Use quando:
   - Saudações: "oi", "bom dia", "olá"
   - Agradecimentos: "obrigado", "valeu", "perfeito"
   - Perguntas conceituais: "o que é metodologia ativa?", "como funciona a BNCC?"
   - Perguntas sobre o Jota: "o que você pode fazer?", "me ajuda"
   - Feedback: "ficou ótimo", "gostei", "legal"
   - Confirmações simples: "ok", "sim", "entendi"
   - Desabafos ou relatos: "meus alunos estão com dificuldade", "tive um dia difícil"
   - Qualquer mensagem que NÃO pede criação de material nem consulta de dados

2. "EXECUTAR" — O professor quer CRIAR materiais, atividades, planos ou documentos.
   Use quando:
   - Pedidos de criação: "crie 5 atividades de matemática", "monte um plano de aula"
   - Pedidos de geração: "faça uma prova de ciências", "gere um quiz"
   - Pedidos com contexto escolar + tema: "preciso trabalhar frações com o 7º ano" (quer materiais prontos)
   - Pedidos de documentos: "faça um roteiro", "crie um dossiê", "monte uma apostila"
   - Pedidos de semana/cronograma com atividades: "salve minha semana de matemática"
   - QUALQUER pedido que implique gerar, construir ou produzir material pedagógico

3. "CAPABILITY_DIRETA" — O professor quer UMA AÇÃO ESPECÍFICA que não precisa de plano completo.
   Use APENAS para estas capabilities:
   - "gerenciar_calendario": ver/criar/editar/excluir compromissos do calendário
     Exemplos: "quais são meus compromissos?", "agende uma reunião dia 15", "cancele o evento de terça", "quais dias estou livre?"
   - "pesquisar_atividades_conta": ver atividades já criadas pelo professor
     Exemplos: "quais atividades eu já criei?", "me mostra minhas atividades", "o que eu tenho salvo?"
   - "pesquisar_atividades_disponiveis": ver catálogo de atividades da plataforma
     Exemplos: "quais tipos de atividades existem?", "o que posso criar?"

═══════════════════════════════════════════════════════════════
REGRAS CRÍTICAS:
═══════════════════════════════════════════════════════════════

- Professores que mencionam TEMA + TURMA/SÉRIE + verbos de ação → EXECUTAR (querem materiais prontos!)
- "Meus alunos estão com dificuldade em frações" SEM pedido de criação → CONVERSAR
- "Crie atividades sobre frações para meus alunos do 7º ano" → EXECUTAR
- Perguntas sobre calendário, compromissos, agenda → CAPABILITY_DIRETA (gerenciar_calendario)
- Perguntas sobre atividades já criadas → CAPABILITY_DIRETA (pesquisar_atividades_conta)
- NA DÚVIDA entre CONVERSAR e EXECUTAR → prefira CONVERSAR (é melhor conversar primeiro do que executar errado)
- NUNCA retorne uma capability que não está na lista de CAPABILITY_DIRETA

═══════════════════════════════════════════════════════════════
FORMATO DE RESPOSTA (JSON estrito):
═══════════════════════════════════════════════════════════════

{
  "route": "CONVERSAR" | "EXECUTAR" | "CAPABILITY_DIRETA",
  "confidence": 0.0 a 1.0,
  "reasoning": "explicação curta de por que escolheu esta rota",
  "capability": "nome_da_capability (APENAS se route=CAPABILITY_DIRETA)",
  "capability_params": { "chave": "valor" } (APENAS se route=CAPABILITY_DIRETA, parâmetros extraídos da mensagem)
}

Retorne APENAS o JSON, sem texto adicional.
`.trim();

function buildSessionContextSummary(sessionId: string, userId: string): string {
  const session = getSession(sessionId);
  if (!session) return 'Primeira interação — sem contexto anterior.';

  const parts: string[] = [];

  if (session.currentPlan) {
    parts.push(`Plano ativo: "${session.currentPlan.objetivo}" (${session.currentPlan.etapasCompletas}/${session.currentPlan.totalEtapas} etapas concluídas)`);
  }

  if (session.activitiesCreated && session.activitiesCreated.length > 0) {
    parts.push(`Atividades criadas nesta sessão: ${session.activitiesCreated.length}`);
  }

  const recentTurns = (session.conversationHistory || []).slice(-4);
  if (recentTurns.length > 0) {
    const summary = recentTurns.map(t => `${t.role === 'user' ? 'Professor' : 'Jota'}: "${t.content.substring(0, 80)}..."`).join('\n');
    parts.push(`Últimas mensagens:\n${summary}`);
  }

  if (session.interactionLedger && session.interactionLedger.length > 0) {
    const recentFacts = session.interactionLedger.slice(-3);
    parts.push(`Fatos relevantes: ${recentFacts.map(f => f.fact).join('; ')}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'Sem contexto significativo na sessão.';
}

export async function smartRoute(
  userPrompt: string,
  sessionId: string,
  userId: string
): Promise<SmartRouteResult> {
  console.log(`🧭 [SmartRouter] Analisando: "${userPrompt.substring(0, 80)}..."`);

  const sessionContext = buildSessionContextSummary(sessionId, userId);

  const prompt = SMART_ROUTER_PROMPT
    .replace('{user_prompt}', userPrompt)
    .replace('{session_context}', sessionContext);

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`🧭 [SmartRouter] ${status}`),
    });

    if (!result.success || !result.data) {
      console.warn('⚠️ [SmartRouter] LLM falhou, usando fallback regex');
      return fallbackClassify(userPrompt);
    }

    const parsed = parseRouterResponse(result.data);

    if (parsed.route === 'CAPABILITY_DIRETA') {
      if (!parsed.capability) {
        console.warn(`⚠️ [SmartRouter] CAPABILITY_DIRETA sem capability — redirecionando para EXECUTAR`);
        return {
          route: 'EXECUTAR',
          confidence: parsed.confidence * 0.8,
          reasoning: `CAPABILITY_DIRETA sem capability especificada — redirecionado para EXECUTAR`,
        };
      }
      if (!VALID_DIRECT_CAPABILITIES.includes(parsed.capability)) {
        console.warn(`⚠️ [SmartRouter] Capability "${parsed.capability}" não é válida para rota direta — redirecionando para EXECUTAR`);
        return {
          route: 'EXECUTAR',
          confidence: parsed.confidence,
          reasoning: `Capability "${parsed.capability}" requer plano completo — redirecionado de CAPABILITY_DIRETA para EXECUTAR`,
        };
      }
    }

    console.log(`🧭 [SmartRouter] Rota: ${parsed.route} (${(parsed.confidence * 100).toFixed(0)}%) — ${parsed.reasoning}`);
    return parsed;

  } catch (error) {
    console.error('❌ [SmartRouter] Erro na classificação LLM:', error);
    return fallbackClassify(userPrompt);
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
  };
}

function fallbackClassify(userPrompt: string): SmartRouteResult {
  const trimmed = userPrompt.trim().toLowerCase();

  const chatStarters = [
    /^(oi|olá|ola|bom dia|boa tarde|boa noite|obrigad|valeu|legal|ok|entendi|perfeito|ótimo|otimo|bacana|top|sim|não|haha|kk)/i,
  ];
  for (const p of chatStarters) {
    if (p.test(trimmed)) {
      return { route: 'CONVERSAR', confidence: 0.85, reasoning: 'Fallback: saudação ou feedback detectado' };
    }
  }

  const calendarPatterns = [
    /calend[áa]rio/i, /compromisso/i, /agenda/i, /agendar/i, /agende/i,
    /dias?\s+livres?/i, /disponibilidade/i, /meus?\s+eventos?/i,
  ];
  for (const p of calendarPatterns) {
    if (p.test(trimmed)) {
      return {
        route: 'CAPABILITY_DIRETA',
        confidence: 0.80,
        reasoning: 'Fallback: padrão de calendário detectado',
        capability: 'gerenciar_calendario',
        capability_params: { user_prompt: userPrompt, user_objective: userPrompt },
      };
    }
  }

  const queryPatterns = [
    /quais\s+atividades\s+(eu\s+)?j[áa]\s+cri/i,
    /minhas\s+atividades/i,
    /o\s+que\s+(eu\s+)?j[áa]\s+(fiz|criei)/i,
    /me\s+mostr[ae]\s+minhas/i,
  ];
  for (const p of queryPatterns) {
    if (p.test(trimmed)) {
      return {
        route: 'CAPABILITY_DIRETA',
        confidence: 0.80,
        reasoning: 'Fallback: consulta de atividades próprias detectada',
        capability: 'pesquisar_atividades_conta',
      };
    }
  }

  const executePatterns = [
    /\bcri[ae]\b/i, /\bmont[ae]\b/i, /\bger[ae]\b/i, /\bfaz(?:er|a)\b/i,
    /\bprepara/i, /\belabor/i, /\bproduz/i,
  ];
  let executeScore = 0;
  for (const p of executePatterns) {
    if (p.test(trimmed)) executeScore++;
  }

  const schoolContext = [
    /\d+[ºªo]?\s*ano/i, /turma/i, /alunos?/i, /s[ée]rie/i,
  ];
  let schoolScore = 0;
  for (const p of schoolContext) {
    if (p.test(trimmed)) schoolScore++;
  }

  if (executeScore >= 1 && schoolScore >= 1) {
    return { route: 'EXECUTAR', confidence: 0.75, reasoning: 'Fallback: verbo de criação + contexto escolar' };
  }

  if (executeScore >= 2) {
    return { route: 'EXECUTAR', confidence: 0.65, reasoning: 'Fallback: múltiplos verbos de criação' };
  }

  if (trimmed.endsWith('?') && executeScore === 0) {
    return { route: 'CONVERSAR', confidence: 0.70, reasoning: 'Fallback: pergunta sem verbo de criação' };
  }

  return { route: 'CONVERSAR', confidence: 0.55, reasoning: 'Fallback: sem padrão forte detectado — padrão é conversar' };
}

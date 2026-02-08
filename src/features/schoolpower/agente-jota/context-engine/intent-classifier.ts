/**
 * INTENT CLASSIFIER - Classificador de Intenções do Professor
 * 
 * Classifica mensagens ANTES do pipeline para decidir o caminho:
 * - 'execute': Criar atividade, gerar conteúdo, fazer plano → pipeline completo
 * - 'chat': Conversa, pergunta, agradecimento → resposta direta sem plano
 * - 'modify': Alterar algo existente → re-executar com modificações
 * - 'query': Pergunta sobre o que foi feito → consultar SessionStore
 * 
 * Inspirado no Manus AI e ChatGPT: nem toda mensagem precisa gerar
 * um plano de execução. O professor deve poder conversar naturalmente.
 */

export type IntentType = 'execute' | 'chat' | 'modify' | 'query';

export interface ClassifiedIntent {
  type: IntentType;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}

const EXECUTE_PATTERNS = [
  /\bcri[ae]/i,
  /\bfaz(?:er|a)\b/i,
  /\bger[ae]/i,
  /\belabor[ae]/i,
  /\bprepara?r?\b/i,
  /\bmont[ae]/i,
  /\bconstru/i,
  /\bplanejar?\b/i,
  /\bativ(?:idade|idades)\b/i,
  /\bprova\b/i,
  /\bexerc[ií]cio/i,
  /\bquest(?:ão|ões|ionário)/i,
  /\baula\b/i,
  /\bslide/i,
  /\bplano de aula\b/i,
  /\broteiro\b/i,
  /\bavalia[çc]/i,
  /\bsequên?cia\s+did[áa]tica/i,
  /\bproduz/i,
  /\bdesenvolver?\b/i,
];

const CHAT_PATTERNS = [
  /^obrigad/i,
  /^valeu/i,
  /^legal/i,
  /^ok\b/i,
  /^entendi/i,
  /^perfeito/i,
  /^ótimo/i,
  /^bacana/i,
  /^top/i,
  /^sim\b/i,
  /^não\b/i,
  /^bom dia/i,
  /^boa (?:tarde|noite)/i,
  /^ol[áa]\b/i,
  /^oi\b/i,
  /^(?:muito )?bem/i,
  /^haha/i,
  /^kk/i,
  /\?$/,
  /o que (?:é|são|significa)/i,
  /como funciona/i,
  /me explica/i,
  /pode me ajudar/i,
  /quem (?:é|são)\b/i,
  /qual (?:é|são|a diferença)/i,
];

const MODIFY_PATTERNS = [
  /\balt(?:er[ae]|erar)/i,
  /\bmud[ae]/i,
  /\btroc[ae]/i,
  /\bsubstitu/i,
  /\bajust[ae]/i,
  /\bcorrigi/i,
  /\bmodific/i,
  /\breforma/i,
  /\bmelhora/i,
  /\badicion[ae]/i,
  /\bremov[ae]/i,
  /\btir[ae]\b/i,
  /\bcoloc[ae]/i,
  /\bacrescenta/i,
  /em vez de/i,
  /no lugar de/i,
  /ao invés de/i,
  /mas com/i,
  /só que/i,
  /diferente/i,
  /pode (?:mudar|trocar|alterar)/i,
];

const QUERY_PATTERNS = [
  /o que (?:foi|você) (?:feito|fez|criou)/i,
  /quais atividades/i,
  /me mostr[ae]/i,
  /cadê/i,
  /onde (?:está|ficou)/i,
  /quantas?\b/i,
  /lista[re]?\b/i,
  /resumo\b/i,
  /status\b/i,
  /progresso\b/i,
  /já (?:fez|criou|terminou)/i,
  /falta algo/i,
];

export function classifyIntent(message: string): ClassifiedIntent {
  const trimmed = message.trim();
  
  if (trimmed.length < 3) {
    return {
      type: 'chat',
      confidence: 0.9,
      reasoning: 'Mensagem muito curta',
      suggestedAction: 'respond_directly',
    };
  }

  const scores: Record<IntentType, number> = {
    execute: 0,
    chat: 0,
    modify: 0,
    query: 0,
  };

  for (const pattern of EXECUTE_PATTERNS) {
    if (pattern.test(trimmed)) scores.execute += 2;
  }

  for (const pattern of CHAT_PATTERNS) {
    if (pattern.test(trimmed)) scores.chat += 2;
  }

  for (const pattern of MODIFY_PATTERNS) {
    if (pattern.test(trimmed)) scores.modify += 2;
  }

  for (const pattern of QUERY_PATTERNS) {
    if (pattern.test(trimmed)) scores.query += 2;
  }

  if (trimmed.length < 20 && scores.execute === 0) {
    scores.chat += 3;
  }

  if (trimmed.length > 50 && scores.chat < 4) {
    scores.execute += 1;
  }

  if (trimmed.endsWith('?') && scores.execute < 4) {
    scores.chat += 2;
    scores.query += 1;
  }

  if (scores.modify > 0 && scores.execute > 0) {
    scores.modify += 1;
  }

  const entries = Object.entries(scores) as [IntentType, number][];
  entries.sort((a, b) => b[1] - a[1]);
  
  const [topType, topScore] = entries[0];
  const [, secondScore] = entries[1];
  
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 
    ? Math.min(0.95, (topScore / totalScore) + (topScore > secondScore * 2 ? 0.15 : 0))
    : 0.5;

  const suggestedActions: Record<IntentType, string> = {
    execute: 'create_execution_plan',
    chat: 'respond_directly',
    modify: 'modify_existing',
    query: 'query_session_context',
  };

  return {
    type: topType,
    confidence,
    reasoning: `Score: execute=${scores.execute}, chat=${scores.chat}, modify=${scores.modify}, query=${scores.query}`,
    suggestedAction: suggestedActions[topType],
  };
}

export function shouldCreatePlan(intent: ClassifiedIntent): boolean {
  return intent.type === 'execute' && intent.confidence > 0.4;
}

export function shouldRespondDirectly(intent: ClassifiedIntent): boolean {
  return intent.type === 'chat' || 
         (intent.type === 'query' && intent.confidence > 0.5);
}

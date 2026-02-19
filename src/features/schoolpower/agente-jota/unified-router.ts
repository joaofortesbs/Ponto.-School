/**
 * UNIFIED ROUTER v1.0 — Roteador Inteligente Unificado
 * 
 * Substitui a arquitetura de 3 chamadas separadas:
 *   IntentClassifier (regex) → Planner (LLM) → InitialResponse (LLM)
 * 
 * Por UMA ÚNICA chamada LLM que faz tudo:
 *   1. Classifica a intenção (conversa? execução? pergunta?)
 *   2. Se conversa → retorna resposta direta (sem plano)
 *   3. Se execução → retorna plano + resposta inicial embutida
 *   4. Se ambíguo → responde conversacionalmente e oferece executar
 * 
 * Inspirado em:
 *   - Manus AI: O Planner É o classificador (não existe separação)
 *   - Genspark: Agente decide tudo em 1 chamada (conversa OU ferramentas)
 *   - ChatGPT: Resposta natural com tool-calling quando necessário
 */

import { executeWithCascadeFallback } from '../services/controle-APIs-gerais-school-power';
import { getAllCapabilities } from './capabilities';
import { formatCapabilitiesForPrompt } from './prompts/planning-prompt';
import { getCapabilityWhitelist, validatePlanCapabilities, validateCapabilityName } from './validation/capability-validator';
import { buildContextForPlanner } from './context-engine/context-gateway';
import { getSession } from './context-engine/session-store';
import type { ExecutionPlan, ExecutionStep, CapabilityCall } from '../interface-chat-producao/types';
import { UNIFIED_ROUTER_PROMPT } from './prompts/unified-router-prompt';

export type RouterMode = 'chat' | 'execute' | 'quick_action';

export interface UnifiedRouterResult {
  mode: RouterMode;
  confidence: number;
  reasoning: string;
  response: string;
  plan: ExecutionPlan | null;
  initialMessage: string;
}

interface ParsedRouterResponse {
  mode: RouterMode;
  confidence: number;
  reasoning: string;
  response?: string;
  plan?: {
    objetivo: string;
    etapas: ParsedEtapa[];
  };
  intencao_desconstruida?: {
    quem: string;
    o_que: string;
    temas: string[];
    quando: string;
    quanto: string;
  };
}

interface ParsedCapability {
  nome: string;
  displayName: string;
  categoria: string;
  parametros?: Record<string, any>;
}

interface ParsedEtapa {
  titulo: string;
  descricao: string;
  capabilities: ParsedCapability[];
}

export async function routeUserMessage(
  userPrompt: string,
  sessionId: string,
  userId: string,
): Promise<UnifiedRouterResult> {
  console.log('🧠 [UnifiedRouter] Roteando mensagem:', userPrompt.substring(0, 80));

  const capabilities = getAllCapabilities();
  const capabilitiesText = formatCapabilitiesForPrompt(capabilities);
  const whitelist = getCapabilityWhitelist();
  const contextForPlanner = buildContextForPlanner(sessionId, userPrompt);

  const session = getSession(sessionId);
  const hasActivePlan = !!session?.currentPlan;
  const conversationLength = session?.conversationHistory?.length || 0;

  let sessionSummary = 'Primeira mensagem da sessão.';
  if (session) {
    const parts: string[] = [];
    if (hasActivePlan) {
      parts.push(`Plano ativo: "${session.currentPlan!.objetivo}" (${session.currentPlan!.etapasCompletas}/${session.currentPlan!.totalEtapas} etapas concluídas)`);
    }
    if (session.activitiesCreated?.length > 0) {
      parts.push(`${session.activitiesCreated.length} atividades já criadas nesta sessão`);
    }
    if (conversationLength > 0) {
      const lastTurns = session.conversationHistory.slice(-4)
        .map(t => `${t.role}: "${t.content.substring(0, 100)}"`)
        .join('\n');
      parts.push(`Últimas mensagens:\n${lastTurns}`);
    }
    if (parts.length > 0) {
      sessionSummary = parts.join('\n');
    }
  }

  const prompt = UNIFIED_ROUTER_PROMPT
    .replace('{user_prompt}', userPrompt)
    .replace('{context}', contextForPlanner)
    .replace('{capabilities}', capabilitiesText + '\n\n' + whitelist.prompt)
    .replace('{session_summary}', sessionSummary);

  console.log('🧠 [UnifiedRouter] Chamando LLM com prompt unificado...');

  const result = await executeWithCascadeFallback(prompt, {
    onProgress: (status) => console.log(`🧠 [UnifiedRouter] ${status}`),
  });

  if (!result.success || !result.data) {
    console.error('❌ [UnifiedRouter] Falha na chamada LLM:', result.errors);
    return buildFallbackResult(userPrompt);
  }

  try {
    const parsed = parseRouterResponse(result.data);
    console.log(`🧠 [UnifiedRouter] Mode: ${parsed.mode} (${(parsed.confidence * 100).toFixed(0)}%) — ${parsed.reasoning}`);

    if (parsed.mode === 'chat' || parsed.mode === 'quick_action') {
      return {
        mode: parsed.mode,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        response: parsed.response || 'Estou aqui para ajudar! O que precisa?',
        plan: null,
        initialMessage: parsed.response || 'Estou aqui para ajudar! O que precisa?',
      };
    }

    if (parsed.mode === 'execute' && parsed.plan) {
      const plan = buildExecutionPlan(parsed, userPrompt);
      const initialMessage = parsed.response || generatePlanMessageFromPlan(plan);

      return {
        mode: 'execute',
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        response: initialMessage,
        plan,
        initialMessage,
      };
    }

    return {
      mode: 'chat',
      confidence: parsed.confidence,
      reasoning: parsed.reasoning + ' (fallback: plan missing)',
      response: parsed.response || 'Entendi! O que precisa que eu faça?',
      plan: null,
      initialMessage: parsed.response || 'Entendi! O que precisa que eu faça?',
    };

  } catch (error) {
    console.error('❌ [UnifiedRouter] Erro ao parsear resposta:', error);
    return buildFallbackResult(userPrompt);
  }
}

function parseRouterResponse(raw: string): ParsedRouterResponse {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    if (cleaned.length > 10 && cleaned.length < 1000) {
      return {
        mode: 'chat',
        confidence: 0.7,
        reasoning: 'Resposta direta sem JSON — interpretada como conversa',
        response: cleaned,
      };
    }
    throw new Error('JSON não encontrado na resposta do router');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.mode) {
    throw new Error('Campo "mode" ausente na resposta do router');
  }

  const validModes: RouterMode[] = ['chat', 'execute', 'quick_action'];
  if (!validModes.includes(parsed.mode)) {
    parsed.mode = 'chat';
  }

  return {
    mode: parsed.mode,
    confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
    reasoning: parsed.reasoning || '',
    response: parsed.response || undefined,
    plan: parsed.plan || undefined,
    intencao_desconstruida: parsed.intencao_desconstruida || undefined,
  };
}

function buildExecutionPlan(parsed: ParsedRouterResponse, userPrompt: string): ExecutionPlan {
  const rawPlan = parsed.plan!;

  const validation = validatePlanCapabilities({ objetivo: rawPlan.objetivo, etapas: rawPlan.etapas });
  const validatedPlan = validation.correctedPlan;

  if (!validation.valid) {
    console.warn('⚠️ [UnifiedRouter] Capabilities inválidas detectadas:', validation.errors);
  }

  const allCapabilityNames = validatedPlan.etapas.flatMap(
    (etapa: any) => (etapa.capabilities || []).map((cap: any) => {
      const v = validateCapabilityName(cap.nome);
      return v.normalizedName || cap.nome;
    })
  );
  const planAlreadyHasSalvarBd = allCapabilityNames.includes('salvar_atividades_bd');

  const plan: ExecutionPlan = {
    planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    objetivo: validatedPlan.objetivo,
    etapas: validatedPlan.etapas.map((etapa: any, idx: number) => {
      const validatedCapabilities = (etapa.capabilities || []).map((cap: any, capIdx: number) => {
        const capValidation = validateCapabilityName(cap.nome);
        const finalName = capValidation.normalizedName || cap.nome;

        return {
          id: `cap-${idx}-${capIdx}-${Date.now()}`,
          nome: finalName,
          displayName: cap.displayName || cap.nome,
          categoria: cap.categoria as CapabilityCall['categoria'],
          parametros: cap.parametros || {},
          status: 'pending' as const,
          ordem: capIdx + 1,
        };
      }).filter((cap: CapabilityCall) => {
        const isValid = validateCapabilityName(cap.nome).valid ||
                       validateCapabilityName(cap.nome).normalizedName;
        return isValid;
      });

      const hasCriarAtividade = validatedCapabilities.some(
        (cap: CapabilityCall) => cap.nome === 'criar_atividade'
      );
      const hasSalvarBdInEtapa = validatedCapabilities.some(
        (cap: CapabilityCall) => cap.nome === 'salvar_atividades_bd'
      );

      if (hasCriarAtividade && !hasSalvarBdInEtapa && !planAlreadyHasSalvarBd) {
        const timestamp = Date.now();
        console.log('🔧 [UnifiedRouter] Segurança: Adicionando salvar_atividades_bd após criar_atividade');
        validatedCapabilities.push({
          id: `cap-${idx}-${validatedCapabilities.length}-${timestamp}`,
          nome: 'salvar_atividades_bd',
          displayName: 'Vou salvar suas atividades no banco de dados',
          categoria: 'SALVAR_BD' as CapabilityCall['categoria'],
          parametros: {},
          status: 'pending' as const,
          ordem: validatedCapabilities.length + 1,
        });
      }

      return {
        ordem: idx + 1,
        titulo: etapa.titulo || etapa.descricao,
        descricao: etapa.descricao || etapa.titulo,
        funcao: validatedCapabilities[0]?.nome || 'executar_generico',
        parametros: validatedCapabilities[0]?.parametros || {},
        justificativa: etapa.descricao,
        status: 'pendente' as const,
        capabilities: validatedCapabilities,
      };
    }),
    status: 'em_execucao',
    createdAt: Date.now(),
  };

  applyPostValidations(plan, userPrompt);

  console.log('✅ [UnifiedRouter] Plano criado:', {
    planId: plan.planId,
    objetivo: plan.objetivo,
    totalEtapas: plan.etapas.length,
    capabilities: plan.etapas.flatMap(e => e.capabilities?.map(c => c.nome) || []),
  });

  return plan;
}

function applyPostValidations(plan: ExecutionPlan, userPrompt: string): void {
  const allCapNames = plan.etapas.flatMap(e => e.capabilities?.map(c => c.nome) || []);

  const hasGerarConteudo = allCapNames.includes('gerar_conteudo_atividades');
  const hasCriarAtividade = allCapNames.includes('criar_atividade');
  if (hasGerarConteudo && !hasCriarAtividade) {
    console.log('🔧 [UnifiedRouter] Pós-validação: gerar_conteudo sem criar_atividade — injetando');
    const timestamp = Date.now();
    const hasSalvar = allCapNames.includes('salvar_atividades_bd');

    const criarCaps: CapabilityCall[] = [{
      id: `cap-fix-criar-${timestamp}`,
      nome: 'criar_atividade',
      displayName: 'Vou construir as atividades com o conteúdo gerado',
      categoria: 'CRIAR' as CapabilityCall['categoria'],
      parametros: {},
      status: 'pending' as const,
      ordem: 1,
    }];
    if (!hasSalvar) {
      criarCaps.push({
        id: `cap-fix-salvar-${timestamp}`,
        nome: 'salvar_atividades_bd',
        displayName: 'Vou salvar suas atividades no banco de dados',
        categoria: 'SALVAR_BD' as CapabilityCall['categoria'],
        parametros: {},
        status: 'pending' as const,
        ordem: 2,
      });
    }

    plan.etapas.push({
      ordem: plan.etapas.length + 1,
      titulo: 'Construir e salvar suas atividades',
      descricao: 'Vou montar as atividades com o conteúdo gerado e salvar no banco de dados',
      funcao: 'criar_atividade',
      parametros: {},
      justificativa: 'gerar_conteudo precisa de criar_atividade para completar',
      status: 'pendente' as const,
      capabilities: criarCaps,
    });
  }

  const calendarKeywords = [
    'calendário', 'calendario', 'agendar', 'agende', 'agenda',
    'marcar', 'marque', 'organizar no calendário',
    'coloca no calendário', 'coloque no calendário',
    'compromisso', 'compromissos', 'no meu calendário',
    'dias livres', 'disponibilidade', 'meus compromissos',
    'cancelar evento', 'excluir evento', 'editar evento',
    'remarcar',
  ];

  const normalized = userPrompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const calendarDetected = calendarKeywords.some(kw => {
    const normalizedKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.includes(normalizedKw);
  });

  const planHasCalendar = allCapNames.includes('gerenciar_calendario') ||
    allCapNames.includes('criar_compromisso_calendario');

  if (calendarDetected && !planHasCalendar) {
    console.log('📅 [UnifiedRouter] Pós-validação: Calendário detectado mas não incluído — injetando');
    const ts = Date.now();
    plan.etapas.push({
      ordem: plan.etapas.length + 1,
      titulo: 'Gerenciar seu calendário',
      descricao: 'Vou gerenciar seus compromissos no calendário',
      funcao: 'gerenciar_calendario',
      parametros: { user_prompt: userPrompt, user_objective: userPrompt },
      justificativa: 'Professor mencionou calendário — injeção automática',
      status: 'pendente' as const,
      capabilities: [{
        id: `cap-cal-${ts}`,
        nome: 'gerenciar_calendario',
        displayName: 'Gerenciando seu calendário',
        categoria: 'CRIAR' as CapabilityCall['categoria'],
        parametros: { user_prompt: userPrompt, user_objective: userPrompt },
        status: 'pending' as const,
        ordem: 1,
      }],
    });
  }
}

function generatePlanMessageFromPlan(plan: ExecutionPlan): string {
  const etapasText = plan.etapas
    .map(e => e.titulo || e.descricao)
    .join(', ');
  return `Entendido! Vou trabalhar nisso agora: ${plan.objetivo}. ${plan.etapas.length > 1 ? `Planejei ${plan.etapas.length} etapas: ${etapasText}.` : ''} Já estou começando!`;
}

function buildFallbackResult(userPrompt: string): UnifiedRouterResult {
  const isLikelyExecution = /\b(cri[ae]|faz|mont|prepar|elabor|ger[ae])\w*\b/i.test(userPrompt) &&
    userPrompt.length > 30;

  if (isLikelyExecution) {
    return {
      mode: 'execute',
      confidence: 0.5,
      reasoning: 'Fallback: LLM falhou, usando detecção básica de execução',
      response: 'Entendido! Vou processar seu pedido agora.',
      plan: null,
      initialMessage: 'Entendido! Vou processar seu pedido agora.',
    };
  }

  return {
    mode: 'chat',
    confidence: 0.5,
    reasoning: 'Fallback: LLM falhou, respondendo como conversa',
    response: 'Desculpe, tive um problema ao processar sua mensagem. Pode reformular seu pedido?',
    plan: null,
    initialMessage: 'Desculpe, tive um problema ao processar sua mensagem. Pode reformular seu pedido?',
  };
}

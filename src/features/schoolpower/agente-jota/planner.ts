/**
 * PLANNER - Criador de Planos de Ação
 * 
 * Recebe o prompt do usuário e gera um plano estruturado
 * com etapas claras para execução
 */

import { executeWithCascadeFallback } from '../services/controle-APIs-gerais-school-power';
import { PLANNING_PROMPT, formatCapabilitiesForPrompt } from './prompts/planning-prompt';
import { getAllCapabilities } from './capabilities';
import type { ExecutionPlan, ExecutionStep } from '../interface-chat-producao/types';

export interface PlannerContext {
  workingMemory: string;
  userId: string;
  sessionId: string;
}

export async function createExecutionPlan(
  userPrompt: string,
  context: PlannerContext
): Promise<ExecutionPlan> {
  console.log('📋 [Planner] Criando plano de execução para:', userPrompt);

  const capabilities = getAllCapabilities();
  const capabilitiesText = formatCapabilitiesForPrompt(capabilities);

  const planningPrompt = PLANNING_PROMPT
    .replace('{user_prompt}', userPrompt)
    .replace('{context}', context.workingMemory || 'Sem contexto anterior')
    .replace('{capabilities}', capabilitiesText);

  console.log('🤖 [Planner] Enviando para IA...');

  const result = await executeWithCascadeFallback(planningPrompt, {
    onProgress: (status) => {
      console.log(`📊 [Planner] ${status}`);
    }
  });

  if (!result.success || !result.data) {
    console.error('❌ [Planner] Falha ao gerar plano');
    return createFallbackPlan(userPrompt);
  }

  try {
    const parsed = parseAIPlanResponse(result.data);
    
    const plan: ExecutionPlan = {
      planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      objetivo: parsed.objetivo,
      etapas: parsed.etapas.map((etapa, idx) => ({
        ordem: idx + 1,
        descricao: etapa.descricao,
        funcao: etapa.funcao,
        parametros: etapa.parametros || {},
        justificativa: etapa.justificativa,
        status: 'pendente' as const,
      })),
      status: 'aguardando_aprovacao',
      createdAt: Date.now(),
    };

    console.log('✅ [Planner] Plano criado:', plan);
    return plan;
  } catch (error) {
    console.error('❌ [Planner] Erro ao parsear resposta:', error);
    return createFallbackPlan(userPrompt);
  }
}

interface ParsedPlan {
  objetivo: string;
  etapas: Array<{
    descricao: string;
    funcao: string;
    parametros?: Record<string, any>;
    justificativa?: string;
  }>;
}

function parseAIPlanResponse(responseText: string): ParsedPlan {
  let cleanedText = responseText.trim();
  cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON não encontrado na resposta');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.objetivo || !Array.isArray(parsed.etapas)) {
    throw new Error('Estrutura do plano inválida');
  }

  return parsed;
}

function createFallbackPlan(userPrompt: string): ExecutionPlan {
  console.log('🔄 [Planner] Usando plano fallback');

  return {
    planId: `plan-fallback-${Date.now()}`,
    objetivo: `Processar solicitação: "${userPrompt.substring(0, 100)}..."`,
    etapas: [
      {
        ordem: 1,
        descricao: 'Analisar a solicitação do usuário',
        funcao: 'analisar_solicitacao',
        parametros: { prompt: userPrompt },
        status: 'pendente',
      },
      {
        ordem: 2,
        descricao: 'Identificar atividades relevantes',
        funcao: 'pesquisar_tipos_atividades',
        parametros: {},
        status: 'pendente',
      },
      {
        ordem: 3,
        descricao: 'Criar atividades solicitadas',
        funcao: 'criar_atividade',
        parametros: { tipo: 'generico', contexto: userPrompt },
        status: 'pendente',
      },
    ],
    status: 'aguardando_aprovacao',
    createdAt: Date.now(),
  };
}

export function generatePlanMessage(plan: ExecutionPlan): string {
  return `Ótimo! Entendi o que você precisa. Montei um plano de ação com ${plan.etapas.length} etapas para: ${plan.objetivo}

Dá uma olhada no plano e, se estiver tudo certo, é só clicar em "Executar Plano"!`;
}

export default {
  createExecutionPlan,
  generatePlanMessage,
};

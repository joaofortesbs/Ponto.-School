/**
 * PLANNER - Criador de Planos de Ação
 * 
 * Recebe o prompt do usuário e gera um plano estruturado
 * com etapas e capabilities para execução inteligente
 */

import { executeWithCascadeFallback } from '../services/controle-APIs-gerais-school-power';
import { PLANNING_PROMPT, formatCapabilitiesForPrompt } from './prompts/planning-prompt';
import { getAllCapabilities } from './capabilities';
import type { ExecutionPlan, ExecutionStep, CapabilityCall } from '../interface-chat-producao/types';

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
        titulo: etapa.titulo,
        descricao: etapa.descricao,
        funcao: etapa.capabilities?.[0]?.nome || 'executar_generico',
        parametros: etapa.capabilities?.[0]?.parametros || {},
        justificativa: etapa.descricao,
        status: 'pendente' as const,
        capabilities: (etapa.capabilities || []).map((cap, capIdx) => ({
          id: `cap-${idx}-${capIdx}-${Date.now()}`,
          nome: cap.nome,
          displayName: cap.displayName,
          categoria: cap.categoria as CapabilityCall['categoria'],
          parametros: cap.parametros || {},
          status: 'pending' as const,
          ordem: capIdx + 1,
        })),
      })),
      status: 'aguardando_aprovacao',
      createdAt: Date.now(),
    };

    console.log('✅ [Planner] Plano criado com capabilities:', plan);
    return plan;
  } catch (error) {
    console.error('❌ [Planner] Erro ao parsear resposta:', error);
    return createFallbackPlan(userPrompt);
  }
}

interface ParsedCapability {
  nome: string;
  displayName: string;
  categoria: string;
  parametros?: Record<string, any>;
  justificativa?: string;
}

interface ParsedEtapa {
  titulo?: string;
  descricao: string;
  funcao?: string;
  parametros?: Record<string, any>;
  justificativa?: string;
  capabilities?: ParsedCapability[];
}

interface ParsedPlan {
  objetivo: string;
  etapas: ParsedEtapa[];
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
  console.log('🔄 [Planner] Usando plano fallback inteligente');

  const promptLower = userPrompt.toLowerCase();
  const isPlanoAula = promptLower.includes('plano de aula') || promptLower.includes('aula');
  const isAtividade = promptLower.includes('atividade') || promptLower.includes('exercício');
  const isAvaliacao = promptLower.includes('avaliação') || promptLower.includes('prova') || promptLower.includes('diagnóstico');

  const etapas: ExecutionStep[] = [];

  if (isPlanoAula) {
    etapas.push({
      ordem: 1,
      titulo: 'Escolher as melhores atividades para sua turma',
      descricao: 'Vou analisar sua turma e escolher as atividades ideais',
      funcao: 'pesquisar_tipos_atividades',
      parametros: {},
      status: 'pendente',
      capabilities: [
        {
          id: `cap-0-0-${Date.now()}`,
          nome: 'pesquisar_tipos_atividades',
          displayName: 'Vou pesquisar os tipos de atividades disponíveis',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 1,
        },
        {
          id: `cap-0-1-${Date.now()}`,
          nome: 'pesquisar_atividades_conta',
          displayName: 'Vou verificar quais atividades posso criar',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 2,
        },
      ],
    });
    etapas.push({
      ordem: 2,
      titulo: 'Criar o plano de aula',
      descricao: 'Vou criar um plano de aula personalizado',
      funcao: 'criar_plano_aula',
      parametros: { tema: userPrompt, contexto: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-1-0-${Date.now()}`,
          nome: 'criar_plano_aula',
          displayName: 'Vou criar o plano de aula completo',
          categoria: 'CRIAR',
          parametros: { tema: userPrompt },
          status: 'pending',
          ordem: 1,
        },
      ],
    });
  } else if (isAvaliacao) {
    etapas.push({
      ordem: 1,
      titulo: 'Analisar requisitos da avaliação',
      descricao: 'Vou entender o que precisa ser avaliado',
      funcao: 'analisar_gaps_aprendizado',
      parametros: {},
      status: 'pendente',
      capabilities: [
        {
          id: `cap-0-0-${Date.now()}`,
          nome: 'analisar_gaps_aprendizado',
          displayName: 'Vou analisar as necessidades de avaliação',
          categoria: 'ANALISAR',
          parametros: {},
          status: 'pending',
          ordem: 1,
        },
      ],
    });
    etapas.push({
      ordem: 2,
      titulo: 'Criar avaliação diagnóstica',
      descricao: 'Vou criar a avaliação personalizada',
      funcao: 'criar_avaliacao_diagnostica',
      parametros: { tema: userPrompt, contexto: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-1-0-${Date.now()}`,
          nome: 'criar_avaliacao_diagnostica',
          displayName: 'Vou criar a avaliação diagnóstica',
          categoria: 'CRIAR',
          parametros: { tema: userPrompt },
          status: 'pending',
          ordem: 1,
        },
      ],
    });
  } else {
    etapas.push({
      ordem: 1,
      titulo: 'Escolher as melhores atividades para sua turma',
      descricao: 'Vou analisar e escolher as atividades ideais',
      funcao: 'pesquisar_tipos_atividades',
      parametros: {},
      status: 'pendente',
      capabilities: [
        {
          id: `cap-0-0-${Date.now()}`,
          nome: 'pesquisar_tipos_atividades',
          displayName: 'Vou pesquisar os tipos de atividades',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 1,
        },
        {
          id: `cap-0-1-${Date.now()}`,
          nome: 'pesquisar_atividades_conta',
          displayName: 'Vou pesquisar quais atividades posso criar',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 2,
        },
      ],
    });
    etapas.push({
      ordem: 2,
      titulo: 'Criar todas as atividades',
      descricao: 'Vou criar cada atividade personalizada',
      funcao: 'criar_atividade',
      parametros: { tipo: 'personalizada', contexto: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-1-0-${Date.now()}`,
          nome: 'criar_atividade',
          displayName: 'Vou criar a atividade educacional',
          categoria: 'CRIAR',
          parametros: { contexto: userPrompt },
          status: 'pending',
          ordem: 1,
        },
      ],
    });
  }

  return {
    planId: `plan-fallback-${Date.now()}`,
    objetivo: `Criar material educacional conforme solicitado`,
    etapas,
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

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
  const timestamp = Date.now();

  if (isPlanoAula) {
    etapas.push({
      ordem: 1,
      titulo: 'Escolher as melhores atividades para sua turma',
      descricao: 'Vou analisar sua turma e selecionar as atividades que mais combinam',
      funcao: 'pesquisar_tipos_atividades',
      parametros: {},
      status: 'pendente',
      capabilities: [
        {
          id: `cap-0-0-${timestamp}`,
          nome: 'pesquisar_tipos_atividades',
          displayName: 'Vou verificar quais tipos de atividades funcionam melhor',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 1,
        },
        {
          id: `cap-0-1-${timestamp}`,
          nome: 'pesquisar_atividades_conta',
          displayName: 'Vou ver quais atividades já estão disponíveis',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 2,
        },
      ],
    });
    etapas.push({
      ordem: 2,
      titulo: 'Criar as atividades personalizadas',
      descricao: 'Vou criar atividades sob medida para sua turma',
      funcao: 'criar_atividade',
      parametros: { contexto: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-1-0-${timestamp}`,
          nome: 'criar_atividade',
          displayName: 'Vou criar atividades engajantes para seus alunos',
          categoria: 'CRIAR',
          parametros: { contexto: userPrompt },
          status: 'pending',
          ordem: 1,
        },
      ],
    });
    etapas.push({
      ordem: 3,
      titulo: 'Transformar tudo em uma aula pronta',
      descricao: 'Vou organizar as atividades em um plano de aula completo',
      funcao: 'criar_plano_aula',
      parametros: { tema: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-2-0-${timestamp}`,
          nome: 'criar_plano_aula',
          displayName: 'Vou montar a aula completa para você usar',
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
      titulo: 'Entender o que sua turma precisa',
      descricao: 'Vou analisar as necessidades de avaliação da sua turma',
      funcao: 'analisar_gaps_aprendizado',
      parametros: {},
      status: 'pendente',
      capabilities: [
        {
          id: `cap-0-0-${timestamp}`,
          nome: 'analisar_gaps_aprendizado',
          displayName: 'Vou identificar os pontos que precisam ser avaliados',
          categoria: 'ANALISAR',
          parametros: {},
          status: 'pending',
          ordem: 1,
        },
      ],
    });
    etapas.push({
      ordem: 2,
      titulo: 'Criar a avaliação ideal para sua turma',
      descricao: 'Vou criar uma avaliação personalizada e eficaz',
      funcao: 'criar_avaliacao_diagnostica',
      parametros: { tema: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-1-0-${timestamp}`,
          nome: 'criar_avaliacao_diagnostica',
          displayName: 'Vou criar uma avaliação que realmente funciona',
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
      titulo: 'Escolher as melhores opções para você',
      descricao: 'Vou analisar e selecionar as melhores opções disponíveis',
      funcao: 'pesquisar_tipos_atividades',
      parametros: {},
      status: 'pendente',
      capabilities: [
        {
          id: `cap-0-0-${timestamp}`,
          nome: 'pesquisar_tipos_atividades',
          displayName: 'Vou verificar quais opções funcionam melhor',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 1,
        },
        {
          id: `cap-0-1-${timestamp}`,
          nome: 'pesquisar_atividades_conta',
          displayName: 'Vou ver o que já está disponível',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 2,
        },
      ],
    });
    etapas.push({
      ordem: 2,
      titulo: 'Criar o conteúdo personalizado',
      descricao: 'Vou criar conteúdo sob medida para você',
      funcao: 'criar_atividade',
      parametros: { contexto: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-1-0-${timestamp}`,
          nome: 'criar_atividade',
          displayName: 'Vou criar conteúdo engajante',
          categoria: 'CRIAR',
          parametros: { contexto: userPrompt },
          status: 'pending',
          ordem: 1,
        },
      ],
    });
    etapas.push({
      ordem: 3,
      titulo: 'Entregar tudo pronto para você usar',
      descricao: 'Vou organizar e entregar o material finalizado',
      funcao: 'gerar_relatorio_personalizado',
      parametros: { contexto: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-2-0-${timestamp}`,
          nome: 'gerar_relatorio_personalizado',
          displayName: 'Vou preparar tudo para você usar',
          categoria: 'ANALISAR',
          parametros: { contexto: userPrompt },
          status: 'pending',
          ordem: 1,
        },
      ],
    });
  }

  return {
    planId: `plan-fallback-${timestamp}`,
    objetivo: `Criar material educacional personalizado para você`,
    etapas,
    status: 'aguardando_aprovacao',
    createdAt: timestamp,
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

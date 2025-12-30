/**
 * PLANNER - Criador de Planos de Ação
 * 
 * Recebe o prompt do usuário e gera um plano estruturado
 * com etapas e capabilities para execução inteligente
 */

import { executeWithCascadeFallback } from '../services/controle-APIs-gerais-school-power';
import { PLANNING_PROMPT, formatCapabilitiesForPrompt } from './prompts/planning-prompt';
import { getAllCapabilities } from './capabilities';
import { validatePlanCapabilities, getCapabilityWhitelist, validateCapabilityName } from './validation/capability-validator';
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
  
  // Adicionar whitelist de capabilities para prevenir alucinação
  const whitelist = getCapabilityWhitelist();

  const planningPrompt = PLANNING_PROMPT
    .replace('{user_prompt}', userPrompt)
    .replace('{context}', context.workingMemory || 'Sem contexto anterior')
    .replace('{capabilities}', capabilitiesText + '\n\n' + whitelist.prompt);

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
    
    // VALIDAÇÃO ANTI-ALUCINAÇÃO: Verificar e corrigir nomes de capabilities
    console.log('🔍 [Planner] Validando capabilities do plano...');
    const validation = validatePlanCapabilities(parsed);
    
    if (!validation.valid) {
      console.warn('⚠️ [Planner] Capabilities inválidas detectadas:', validation.errors);
      // Usar plano corrigido automaticamente
    }
    
    const validatedPlan = validation.correctedPlan;
    
    const plan: ExecutionPlan = {
      planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      objetivo: validatedPlan.objetivo,
      etapas: validatedPlan.etapas.map((etapa: ParsedEtapa, idx: number) => {
        // Validar e normalizar cada capability
        const validatedCapabilities = (etapa.capabilities || []).map((cap: ParsedCapability, capIdx: number) => {
          const capValidation = validateCapabilityName(cap.nome);
          const finalName = capValidation.normalizedName || cap.nome;
          
          if (!capValidation.valid && !capValidation.normalizedName) {
            console.error(`❌ [Planner] Capability inválida ignorada: ${cap.nome}`);
          }
          
          return {
            id: `cap-${idx}-${capIdx}-${Date.now()}`,
            nome: finalName,
            displayName: cap.displayName,
            categoria: cap.categoria as CapabilityCall['categoria'],
            parametros: cap.parametros || {},
            status: 'pending' as const,
            ordem: capIdx + 1,
          };
        }).filter((cap: CapabilityCall) => {
          // Remover capabilities que não existem após validação
          const isValid = validateCapabilityName(cap.nome).valid || 
                         validateCapabilityName(cap.nome).normalizedName;
          return isValid;
        });
        
        return {
          ordem: idx + 1,
          titulo: etapa.titulo,
          descricao: etapa.descricao,
          funcao: validatedCapabilities[0]?.nome || 'executar_generico',
          parametros: validatedCapabilities[0]?.parametros || {},
          justificativa: etapa.descricao,
          status: 'pendente' as const,
          capabilities: validatedCapabilities,
        };
      }),
      status: 'aguardando_aprovacao',
      createdAt: Date.now(),
    };

    console.log('✅ [Planner] Plano criado e validado com capabilities:', plan);
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
  console.log('🔄 [Planner] Usando plano fallback inteligente com capabilities válidas');

  const timestamp = Date.now();

  // PIPELINE OBRIGATÓRIO: BUSCAR → DECIDIR → CRIAR
  // Usando APENAS capabilities válidas do registro
  const etapas: ExecutionStep[] = [
    {
      ordem: 1,
      titulo: 'Pesquisar as melhores opções para você',
      descricao: 'Vou analisar as atividades disponíveis e suas atividades anteriores',
      funcao: 'pesquisar_atividades_disponiveis',
      parametros: {},
      status: 'pendente',
      capabilities: [
        {
          id: `cap-0-0-${timestamp}`,
          nome: 'pesquisar_atividades_disponiveis',
          displayName: 'Vou pesquisar quais atividades eu posso criar',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 1,
        },
        {
          id: `cap-0-1-${timestamp}`,
          nome: 'pesquisar_atividades_conta',
          displayName: 'Vou buscar suas atividades anteriores',
          categoria: 'PESQUISAR',
          parametros: {},
          status: 'pending',
          ordem: 2,
        },
      ],
    },
    {
      ordem: 2,
      titulo: 'Decidir quais atividades criar',
      descricao: 'Vou escolher as melhores atividades para seu objetivo',
      funcao: 'decidir_atividades_criar',
      parametros: { contexto: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-1-0-${timestamp}`,
          nome: 'decidir_atividades_criar',
          displayName: 'Vou decidir estrategicamente quais atividades criar',
          categoria: 'ANALISAR',
          parametros: { contexto: userPrompt },
          status: 'pending',
          ordem: 1,
        },
      ],
    },
    {
      ordem: 3,
      titulo: 'Criar as atividades personalizadas',
      descricao: 'Vou criar as atividades sob medida para você',
      funcao: 'criar_atividade',
      parametros: { contexto: userPrompt },
      status: 'pendente',
      capabilities: [
        {
          id: `cap-2-0-${timestamp}`,
          nome: 'criar_atividade',
          displayName: 'Vou criar atividades engajantes',
          categoria: 'CRIAR',
          parametros: { contexto: userPrompt },
          status: 'pending',
          ordem: 1,
        },
      ],
    },
  ];

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

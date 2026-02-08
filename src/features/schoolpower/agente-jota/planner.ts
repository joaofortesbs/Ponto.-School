/**
 * PLANNER - Mente Orquestradora do Agente Jota
 * 
 * Recebe o prompt do usuário e gera um plano estruturado
 * com capabilities escolhidas AUTONOMAMENTE pela IA.
 * 
 * NÃO existe pipeline fixo — a IA decide o melhor caminho.
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
  console.log('📋 [Planner] Mente Orquestradora analisando:', userPrompt);

  const capabilities = getAllCapabilities();
  const capabilitiesText = formatCapabilitiesForPrompt(capabilities);
  
  const whitelist = getCapabilityWhitelist();

  const planningPrompt = PLANNING_PROMPT
    .replace('{user_prompt}', userPrompt)
    .replace('{context}', context.workingMemory || 'Sem contexto anterior')
    .replace('{capabilities}', capabilitiesText + '\n\n' + whitelist.prompt);

  console.log('🧠 [Planner] Mente Orquestradora decidindo capabilities...');

  const result = await executeWithCascadeFallback(planningPrompt, {
    onProgress: (status) => {
      console.log(`📊 [Planner] ${status}`);
    }
  });

  if (!result.success || !result.data) {
    console.error('❌ [Planner] Falha ao gerar plano:', {
      success: result.success,
      hasData: !!result.data,
      modelUsed: result.modelUsed,
      providerUsed: result.providerUsed,
      attemptsMade: result.attemptsMade,
      errors: result.errors,
    });
    return createFallbackPlan(userPrompt);
  }

  try {
    const parsed = parseAIPlanResponse(result.data);
    
    console.log('🔍 [Planner] Validando capabilities do plano...');
    const validation = validatePlanCapabilities(parsed);
    
    if (!validation.valid) {
      console.warn('⚠️ [Planner] Capabilities inválidas detectadas:', validation.errors);
    }
    
    const validatedPlan = validation.correctedPlan;
    
    const plan: ExecutionPlan = {
      planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      objetivo: validatedPlan.objetivo,
      etapas: validatedPlan.etapas.map((etapa: ParsedEtapa, idx: number) => {
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
          const isValid = validateCapabilityName(cap.nome).valid || 
                         validateCapabilityName(cap.nome).normalizedName;
          return isValid;
        });

        // VALIDAÇÃO DE SEGURANÇA: Se criar_atividade está presente sem salvar_atividades_bd na mesma etapa,
        // garantir que salvar_atividades_bd exista em ALGUMA etapa posterior (o planner já deve incluir)
        const hasCriarAtividade = validatedCapabilities.some(
          cap => cap.nome === 'criar_atividade'
        );
        const hasSalvarBd = validatedCapabilities.some(
          cap => cap.nome === 'salvar_atividades_bd'
        );
        
        if (hasCriarAtividade && !hasSalvarBd) {
          const timestamp = Date.now();
          console.log('🔧 [Planner] Segurança: Adicionando salvar_atividades_bd após criar_atividade');
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
          titulo: etapa.titulo,
          descricao: etapa.descricao,
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

    console.log('✅ [Planner] Plano criado pela Mente Orquestradora:', {
      planId: plan.planId,
      objetivo: plan.objetivo,
      totalEtapas: plan.etapas.length,
      capabilities: plan.etapas.flatMap(e => e.capabilities?.map(c => c.nome) || []),
    });
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

/**
 * Analisa o pedido do usuário para determinar o tipo de fallback.
 * Se parece ser sobre criação de atividades, usa pipeline completo.
 * Caso contrário, usa apenas criar_arquivo.
 */
function detectIntentForFallback(userPrompt: string): 'criar_atividades' | 'texto_livre' {
  const promptLower = userPrompt.toLowerCase();
  
  const activityKeywords = [
    'atividade', 'atividades', 'exercício', 'exercícios', 'quiz', 'prova',
    'avaliação', 'avaliacao', 'criar atividade', 'crie atividade', 'monte atividade',
    'flash card', 'flashcard', 'caça-palavra', 'caca-palavra', 'cruzadinha',
    'jogo educativo', 'game educativo', 'dinâmica', 'interativ'
  ];
  
  const isActivityRequest = activityKeywords.some(kw => promptLower.includes(kw));
  
  return isActivityRequest ? 'criar_atividades' : 'texto_livre';
}

function createFallbackPlan(userPrompt: string): ExecutionPlan {
  const intent = detectIntentForFallback(userPrompt);
  const timestamp = Date.now();
  
  console.log(`🔄 [Planner] Fallback inteligente - Intenção detectada: ${intent}`);

  if (intent === 'texto_livre') {
    return {
      planId: `plan-fallback-${timestamp}`,
      objetivo: `Criar conteúdo personalizado conforme solicitado`,
      etapas: [
        {
          ordem: 1,
          titulo: 'Criar conteúdo para você',
          descricao: 'Vou elaborar o conteúdo solicitado',
          funcao: 'criar_arquivo',
          parametros: { contexto: userPrompt },
          status: 'pendente',
          capabilities: [
            {
              id: `cap-0-0-${timestamp}`,
              nome: 'criar_arquivo',
              displayName: 'Vou criar o conteúdo que você precisa',
              categoria: 'CRIAR',
              parametros: { contexto: userPrompt },
              status: 'pending',
              ordem: 1,
            },
          ],
        },
      ],
      status: 'em_execucao',
      createdAt: timestamp,
    };
  }

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
      titulo: 'Decidir e gerar conteúdo',
      descricao: 'Vou escolher as melhores atividades e gerar conteúdo pedagógico',
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
        {
          id: `cap-1-1-${timestamp}`,
          nome: 'gerar_conteudo_atividades',
          displayName: 'Gerando conteúdo para as atividades',
          categoria: 'GERAR_CONTEUDO',
          parametros: { contexto: userPrompt },
          status: 'pending',
          ordem: 2,
        },
      ],
    },
    {
      ordem: 3,
      titulo: 'Criar e salvar as atividades',
      descricao: 'Vou criar e salvar as atividades sob medida para você',
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
        {
          id: `cap-2-1-${timestamp}`,
          nome: 'salvar_atividades_bd',
          displayName: 'Vou salvar suas atividades no banco de dados',
          categoria: 'SALVAR_BD',
          parametros: {},
          status: 'pending',
          ordem: 2,
        },
      ],
    },
  ];

  return {
    planId: `plan-fallback-${timestamp}`,
    objetivo: `Criar material educacional personalizado para você`,
    etapas,
    status: 'em_execucao',
    createdAt: timestamp,
  };
}

export function generatePlanMessage(plan: ExecutionPlan): string {
  const capabilityNames = plan.etapas.flatMap(e => e.capabilities?.map(c => c.nome) || []);
  const isSimplePlan = capabilityNames.length <= 2;
  
  if (isSimplePlan) {
    return `Entendi o que você precisa! Vou trabalhar nisso agora: ${plan.objetivo}`;
  }
  
  return `Ótimo! Entendi o que você precisa. Montei um plano com ${plan.etapas.length} etapas para: ${plan.objetivo}

Já estou começando a trabalhar!`;
}

export default {
  createExecutionPlan,
  generatePlanMessage,
};

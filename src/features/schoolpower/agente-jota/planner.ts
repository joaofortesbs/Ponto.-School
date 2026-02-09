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
    
    const allCapabilityNames = validatedPlan.etapas.flatMap(
      (etapa: ParsedEtapa) => (etapa.capabilities || []).map((cap: ParsedCapability) => {
        const v = validateCapabilityName(cap.nome);
        return v.normalizedName || cap.nome;
      })
    );
    const planAlreadyHasSalvarBd = allCapabilityNames.includes('salvar_atividades_bd');

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

        const hasCriarAtividade = validatedCapabilities.some(
          cap => cap.nome === 'criar_atividade'
        );
        const hasSalvarBdInEtapa = validatedCapabilities.some(
          cap => cap.nome === 'salvar_atividades_bd'
        );
        
        if (hasCriarAtividade && !hasSalvarBdInEtapa && !planAlreadyHasSalvarBd) {
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

    const allCapNames = plan.etapas.flatMap(e => e.capabilities?.map(c => c.nome) || []);

    const isActivityRequest = detectIntentForFallback(userPrompt) === 'criar_atividades';
    const planOnlyHasCriarArquivo = allCapNames.length > 0 && 
      allCapNames.every(name => name === 'criar_arquivo');
    
    if (isActivityRequest && planOnlyHasCriarArquivo) {
      console.log('🔴 [Planner] Pós-validação CRÍTICA: Professor pediu ATIVIDADE mas AI usou apenas criar_arquivo — substituindo por pipeline de atividades!');
      return createFallbackPlan(userPrompt);
    }

    const hasGerarConteudo = allCapNames.includes('gerar_conteudo_atividades');
    const hasCriarAtividadeGlobal = allCapNames.includes('criar_atividade');
    if (hasGerarConteudo && !hasCriarAtividadeGlobal) {
      console.log('🔧 [Planner] Pós-validação: gerar_conteudo_atividades sem criar_atividade — injetando criar_atividade + salvar_atividades_bd');
      const timestamp = Date.now();
      const hasSalvar = allCapNames.includes('salvar_atividades_bd');
      
      const criarCaps: CapabilityCall[] = [
        {
          id: `cap-${plan.etapas.length}-0-${timestamp}`,
          nome: 'criar_atividade',
          displayName: 'Vou construir as atividades com o conteúdo gerado',
          categoria: 'CRIAR' as CapabilityCall['categoria'],
          parametros: {},
          status: 'pending' as const,
          ordem: 1,
        },
      ];
      if (!hasSalvar) {
        criarCaps.push({
          id: `cap-${plan.etapas.length}-1-${timestamp}`,
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
        justificativa: 'gerar_conteudo_atividades precisa de criar_atividade para completar o fluxo',
        status: 'pendente' as const,
        capabilities: criarCaps,
      });
    }

    const isFileRequest = detectsFileRequest(userPrompt);
    const hasCriarArquivo = allCapNames.includes('criar_arquivo');

    if (isFileRequest && !isActivityRequest && hasGerarConteudo && !hasCriarArquivo) {
      console.log('🔴 [Planner] Pós-validação CRÍTICA: Professor pediu ARQUIVO mas AI usou gerar_conteudo_atividades — substituindo por criar_arquivo!');
      plan.etapas = plan.etapas.filter(e => {
        const capNames = e.capabilities?.map(c => c.nome) || [];
        return !capNames.includes('gerar_conteudo_atividades') && 
               !capNames.includes('criar_atividade') && 
               !capNames.includes('salvar_atividades_bd');
      });
      const timestamp = Date.now();
      plan.etapas.push({
        ordem: plan.etapas.length + 1,
        titulo: 'Preparar seu documento',
        descricao: 'Vou gerar o documento solicitado com todo o conteúdo organizado',
        funcao: 'criar_arquivo',
        parametros: { tipo_artefato: 'documento_livre', solicitacao: userPrompt },
        justificativa: 'Professor pediu arquivo/documento — usar criar_arquivo com documento_livre',
        status: 'pendente' as const,
        capabilities: [{
          id: `cap-fix-0-${timestamp}`,
          nome: 'criar_arquivo',
          displayName: 'Vou criar o documento solicitado',
          categoria: 'CRIAR' as CapabilityCall['categoria'],
          parametros: { tipo_artefato: 'documento_livre', solicitacao: userPrompt },
          status: 'pending' as const,
          ordem: 1,
        }],
      });
    }

    const updatedCapNames = plan.etapas.flatMap(e => e.capabilities?.map(c => c.nome) || []);
    if (!updatedCapNames.includes('criar_arquivo') && isFileRequest) {
      console.log('🔧 [Planner] Pós-validação: Professor pediu arquivo/documento — injetando criar_arquivo com documento_livre');
      const timestamp = Date.now();
      plan.etapas.push({
        ordem: plan.etapas.length + 1,
        titulo: 'Preparar seu documento',
        descricao: 'Vou gerar o documento solicitado com todo o conteúdo organizado e pronto para uso',
        funcao: 'criar_arquivo',
        parametros: { tipo_artefato: 'documento_livre', solicitacao: userPrompt },
        justificativa: 'Professor pediu explicitamente um arquivo/documento',
        status: 'pendente' as const,
        capabilities: [{
          id: `cap-${plan.etapas.length}-0-${timestamp}`,
          nome: 'criar_arquivo',
          displayName: 'Vou criar o documento solicitado',
          categoria: 'CRIAR' as CapabilityCall['categoria'],
          parametros: { tipo_artefato: 'documento_livre', solicitacao: userPrompt },
          status: 'pending' as const,
          ordem: 1,
        }],
      });
    }

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

const FILE_REQUEST_STRONG_KEYWORDS = [
  'roteiro', 'arquivo', 'documento', 'dossiê', 'dossie',
  'relatório', 'relatorio', 'resumo executivo',
  'apostila', 'formato de arquivo', 'em formato de',
  'gere um documento', 'gere um texto',
  'plano de aula', 'explicação detalhada',
];

const FILE_REQUEST_CONTEXTUAL_PATTERNS = [
  /(?:me\s+)?entregu(?:e|ar)\s+(?:um|o|em)\s+\w+/i,
  /(?:me\s+)?envi(?:e|ar)\s+(?:um|o|em)\s+\w+/i,
  /(?:em\s+)?formato\s+de\s+(?:arquivo|documento|texto|pdf)/i,
  /(?:crie|faça|monte|prepare)\s+(?:um|o)\s+(?:roteiro|guia|documento|relatório|texto)/i,
];

function detectsFileRequest(userPrompt: string): boolean {
  const normalized = userPrompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const hasStrongKeyword = FILE_REQUEST_STRONG_KEYWORDS.some(keyword => {
    const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.includes(normalizedKeyword);
  });
  if (hasStrongKeyword) return true;

  return FILE_REQUEST_CONTEXTUAL_PATTERNS.some(pattern => pattern.test(userPrompt));
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
function detectIntentForFallback(userPrompt: string): 'criar_atividades' | 'atividade_textual' | 'texto_livre' {
  const normalized = userPrompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const interactiveKeywords = [
    'quiz', 'flash card', 'flashcard', 'lista de exercicio',
    'lista de atividade', 'crie um quiz', 'exercicio interativo',
  ];
  
  const isInteractiveRequest = interactiveKeywords.some(kw => normalized.includes(kw));
  if (isInteractiveRequest) return 'criar_atividades';
  
  const textActivityKeywords = [
    'prova', 'simulado', 'avaliacao', 'caca-palavra', 'caca palavras',
    'cruzadinha', 'palavras cruzadas', 'bingo', 'rubrica',
    'mapa mental', 'mapa conceitual', 'infografico',
    'apostila', 'guia de estudo', 'gabarito',
    'redacao', 'interpretacao de texto', 'resenha',
    'plano de unidade', 'planejamento anual', 'pbl', 'roteiro de projeto',
    'newsletter', 'boletim comentado', 'relatorio individual',
    'material adaptado', 'choice board', 'plano individualizado',
    'exit ticket', 'icebreaker', 'acolhimento', 'estudo de caso',
    'debate estruturado', 'vocabulario', 'glossario',
    'verdadeiro ou falso', 'v ou f', 'preencher lacunas',
    'exercicio de associacao', 'exercicio de ordenacao',
    'questoes dissertativas', 'teste cloze',
    'show do milhao', 'jogo de perguntas', 'gincana',
    'convite', 'comunicado', 'cronograma de estudos',
    'organizador grafico', 'quadro comparativo',
    'diario reflexivo', 'prompt de escrita',
    'crie uma prova', 'faca uma prova', 'monte uma prova',
    'crie um simulado', 'faca um simulado',
    'multipla escolha', 'crie exercicio',
  ];
  
  const isTextActivityRequest = textActivityKeywords.some(kw => normalized.includes(kw));
  if (isTextActivityRequest) return 'atividade_textual';

  const generalActivityKeywords = [
    'atividade', 'atividades', 'exercicio', 'exercicios',
    'criar atividade', 'crie atividade', 'monte atividade',
    'jogo educativo', 'game educativo', 'dinamica', 'interativ',
  ];
  
  const isGeneralActivityRequest = generalActivityKeywords.some(kw => normalized.includes(kw));
  if (isGeneralActivityRequest) return 'criar_atividades';
  
  return 'texto_livre';
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
          parametros: { tipo_artefato: 'documento_livre', solicitacao: userPrompt, contexto: userPrompt },
          status: 'pendente',
          capabilities: [
            {
              id: `cap-0-0-${timestamp}`,
              nome: 'criar_arquivo',
              displayName: 'Vou criar o conteúdo que você precisa',
              categoria: 'CRIAR',
              parametros: { tipo_artefato: 'documento_livre', solicitacao: userPrompt, contexto: userPrompt },
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

  if (intent === 'atividade_textual') {
    return {
      planId: `plan-fallback-${timestamp}`,
      objetivo: `Criar atividade pedagógica personalizada`,
      etapas: [
        {
          ordem: 1,
          titulo: 'Criar atividade pedagógica',
          descricao: 'Vou elaborar a atividade usando um template especializado',
          funcao: 'criar_arquivo',
          parametros: { tipo_artefato: 'atividade_textual', solicitacao: userPrompt, contexto: userPrompt },
          status: 'pendente',
          capabilities: [
            {
              id: `cap-0-0-${timestamp}`,
              nome: 'criar_arquivo',
              displayName: 'Vou criar a atividade que você precisa',
              categoria: 'CRIAR',
              parametros: { tipo_artefato: 'atividade_textual', solicitacao: userPrompt, contexto: userPrompt },
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

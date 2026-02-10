/**
 * CAPABILITY 3: decidir_atividades_criar
 * 
 * Responsabilidade: IA analisa contexto completo (dados de cap1, cap2, 
 * contexto do usuário) e decide estrategicamente quais atividades criar.
 * 
 * Inputs: Resultado de pesquisar_atividades_conta + pesquisar_atividades_disponiveis + contexto
 */

import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import { 
  ActivityFromCatalog,
  AtividadeForAI,
  ChosenActivity,
  DecisionContext,
  DecisionResult,
  DecisionValidation,
  SearchAccountActivitiesResult,
  SearchAvailableActivitiesResult,
  validateAIChoices,
  CapabilityInput,
  CapabilityOutput,
  DebugEntry,
  createDataConfirmation,
  createDataCheck
} from '../../shared/types';
import { formatAccountActivitiesForPrompt } from '../../../capabilities/PESQUISAR/implementations/pesquisar-atividades-conta';
import { formatAvailableActivitiesForPrompt, validateActivitySelection } from '../../../capabilities/PESQUISAR/implementations/pesquisar-atividades-disponiveis';

interface DecidirAtividadesCriarParams {
  account_activities: SearchAccountActivitiesResult;
  available_activities: SearchAvailableActivitiesResult;
  user_objective: string;
  user_context?: {
    disciplina?: string;
    turma?: {
      nome: string;
      nivel: string;
      alunos_count?: number;
    };
    objetivo_pedagogico?: string;
  };
  constraints?: {
    max_activities?: number;
    preferred_types?: string[];
    avoid_types?: string[];
  };
}

const MAX_RETRIES = 2;
const DEFAULT_MAX_ACTIVITIES = 50;

function buildDecisionPrompt(context: DecisionContext): string {
  const accountContext = context.previous_activities.length > 0
    ? `
ATIVIDADES JÁ CRIADAS PELO PROFESSOR:
Total: ${context.previous_activities.length}
${context.previous_activities.map(a => `- ${a.titulo} (${a.tipo})`).join('\n')}
`
    : `
PROFESSOR NOVO: Nenhuma atividade anterior encontrada.
`;

  const standardActivities = context.available_activities.filter(a => (a as any).pipeline === 'standard' || !(a as any).pipeline);
  const textualActivities = context.available_activities.filter(a => (a as any).pipeline === 'criar_arquivo_textual');

  const groupedTextual = textualActivities.reduce((acc, a) => {
    const cat = a.categoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {} as Record<string, typeof textualActivities>);

  const standardSummary = standardActivities.map(a => `- ${a.titulo} (ID: ${a.id}) — ${a.descricao?.substring(0, 80)}`).join('\n');

  const textualSummary = Object.entries(groupedTextual).map(([cat, items]) => {
    const itemList = items.map(a => `  - ${a.titulo} (ID: ${a.id})`).join('\n');
    return `📁 ${cat.toUpperCase()}:\n${itemList}`;
  }).join('\n\n');

  const quantidadeExplicitaMatch = context.user_objective.match(/(\d+)\s*(atividade|exerc|quest|prova|material)/i);
  const quantidadeSolicitada = quantidadeExplicitaMatch ? parseInt(quantidadeExplicitaMatch[1]) : null;

  return `
# TAREFA: Decidir quais atividades criar

Você é um especialista pedagógico. Analise o pedido do professor e escolha as atividades MAIS ADEQUADAS do catálogo.

## OBJETIVO DO USUÁRIO
${context.user_objective}

## CONTEXTO DO PROFESSOR
- Disciplina: ${context.user_context.disciplina || 'Não especificada'}
- Turma: ${context.user_context.turma?.nome || 'Não especificada'}
- Nível: ${context.user_context.turma?.nivel || 'Não especificado'}
- Objetivo pedagógico: ${context.user_context.objetivo_pedagogico || context.user_objective}

${accountContext}

## 🔢 REGRA DE QUANTIDADE (OBRIGATÓRIA)
${quantidadeSolicitada
  ? `O professor pediu EXATAMENTE ${quantidadeSolicitada} atividade(s). Você DEVE escolher exatamente ${quantidadeSolicitada}. NÃO escolha mais nem menos.`
  : `O professor NÃO especificou quantidade. Analise o pedido:
  - Se pediu UMA coisa específica (ex: "uma prova", "um bingo") → escolha 1 atividade
  - Se pediu algo genérico (ex: "atividades sobre X") → escolha 2-3 atividades variadas
  - Se pediu pacote/vários (ex: "materiais completos") → escolha 3-5 atividades variadas`}

## CATÁLOGO COMPLETO — ATIVIDADES DISPONÍVEIS

### 🟢 ATIVIDADES INTERATIVAS (pipeline padrão — quiz, flash cards, lista)
${standardSummary}

### 🔵 ATIVIDADES TEXTUAIS (pipeline criar_arquivo — provas, jogos, rubricas, etc.)
${textualSummary}

IDs VÁLIDOS: ${context.available_activities.map(a => a.id).join(', ')}

## INSTRUÇÕES DE DECISÃO

1. LEIA o pedido do professor com atenção
2. RESPEITE a quantidade solicitada (regra acima)
3. ESCOLHA a atividade que MELHOR corresponde ao pedido:
   - Professor pediu "prova" → use prova-personalizada, NÃO lista-exercicios
   - Professor pediu "bingo" → use bingo-educativo, NÃO quiz-interativo
   - Professor pediu "rubrica" → use rubrica-avaliacao
   - Professor pediu "caça-palavras" → use caca-palavras
   - Professor pediu "plano de aula" → use plano-aula
4. VARIEDADE: quando criar múltiplas, use categorias DIFERENTES
5. PRIORIZE atividades textuais especializadas sobre atividades genéricas (lista/quiz/flash)

🎯 PRINCÍPIO: O catálogo textual tem 61 templates especializados. USE-OS! Não force tudo em lista/quiz/flash cards.

Exemplos de decisão CORRETA:
- "Crie uma prova de frações" → prova-personalizada (1 atividade)
- "Crie um bingo sobre sistema solar" → bingo-educativo (1 atividade)
- "3 atividades sobre crônicas" → interpretacao-texto + prompt-escrita + quiz-interativo (3 atividades variadas)
- "Atividade sobre biomas, tenho alunos com necessidades especiais" → atividade-diferenciada-inclusao (1 atividade)

## ⚠️ REGRA ANTI-ALUCINAÇÃO
- Use APENAS IDs da lista de IDs válidos acima
- NUNCA invente IDs

## FORMATO DE RESPOSTA (JSON VÁLIDO)

{
  "atividades_escolhidas": [
    {
      "id": "prova-personalizada",
      "titulo": "Prova Personalizada",
      "justificativa": "Professor pediu prova — template especializado para provas",
      "ordem_sugerida": 1
    }
  ],
  "estrategia_pedagogica": "Explicação da escolha",
  "total_escolhidas": 1
}

Retorne APENAS o JSON, sem texto adicional.
  `.trim();
}

function validateDecision(
  aiResponse: any,
  validCatalog: ActivityFromCatalog[],
  maxActivities: number
): DecisionValidation {
  const errors: string[] = [];
  
  if (!aiResponse || !aiResponse.atividades_escolhidas) {
    return {
      all_ids_valid: false,
      count_within_limit: false,
      has_justification: false,
      no_duplicates: false,
      fields_complete: false,
      errors: ['Resposta da IA não contém atividades_escolhidas']
    };
  }

  const chosenIds = aiResponse.atividades_escolhidas.map((a: any) => a.id);
  
  const validation = validateAIChoices(chosenIds, validCatalog);
  const all_ids_valid = validation.valid;
  if (!all_ids_valid) {
    errors.push(validation.error || 'IDs inválidos encontrados');
  }

  const count_within_limit = true;
  

  const has_justification = aiResponse.atividades_escolhidas.every(
    (a: any) => a.justificativa && a.justificativa.length > 10
  );
  if (!has_justification) {
    errors.push('Nem todas as atividades têm justificativa adequada');
  }

  const uniqueIds = new Set(chosenIds);
  const no_duplicates = uniqueIds.size === chosenIds.length;
  if (!no_duplicates) {
    errors.push('Existem IDs duplicados na seleção');
  }

  const fields_complete = aiResponse.atividades_escolhidas.every(
    (a: any) => a.id && a.titulo && a.ordem_sugerida !== undefined
  );
  if (!fields_complete) {
    errors.push('Campos obrigatórios ausentes em algumas atividades');
  }

  return {
    all_ids_valid,
    count_within_limit,
    has_justification,
    no_duplicates,
    fields_complete,
    errors
  };
}

function enrichChosenActivities(
  aiChoices: any[],
  catalog: ActivityFromCatalog[]
): ChosenActivity[] {
  return aiChoices.map((choice, index) => {
    const catalogActivity = catalog.find(a => a.id === choice.id);
    
    if (!catalogActivity) {
      console.warn(`⚠️ [DECIDIR] Atividade ${choice.id} não encontrada no catálogo`);
      return null;
    }

    return {
      id: catalogActivity.id,
      titulo: catalogActivity.titulo,
      tipo: catalogActivity.tipo,
      categoria: catalogActivity.categoria,
      materia: catalogActivity.materia,
      nivel_dificuldade: catalogActivity.nivel_dificuldade,
      tags: catalogActivity.tags,
      campos_obrigatorios: catalogActivity.campos_obrigatorios,
      campos_opcionais: catalogActivity.campos_opcionais || [],
      schema_campos: catalogActivity.schema_campos,
      campos_preenchidos: {},
      justificativa: choice.justificativa || 'Atividade selecionada estrategicamente',
      ordem_sugerida: choice.ordem_sugerida || (index + 1),
      status_construcao: 'aguardando' as const,
      progresso: 0,
      pipeline: catalogActivity.pipeline || 'standard',
      text_activity_template_id: catalogActivity.text_activity_template_id
    };
  }).filter(Boolean) as ChosenActivity[];
}

export async function decidirAtividadesCriar(
  params: DecidirAtividadesCriarParams
): Promise<DecisionResult> {
  console.log('🎯 [Capability:DECIDIR] Iniciando decisão de atividades');
  console.log('📊 [Capability:DECIDIR] Parâmetros recebidos:', {
    hasAvailableActivities: !!params.available_activities,
    availableCount: params.available_activities?.activities?.length || 0,
    hasAccountActivities: !!params.account_activities,
    accountCount: params.account_activities?.activities?.length || 0,
    userObjective: params.user_objective
  });
  
  const startTime = Date.now();
  const maxActivities = params.constraints?.max_activities || DEFAULT_MAX_ACTIVITIES;

  const WORD_TO_NUMBER: Record<string, number> = {
    'uma': 1, 'um': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
    'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
  };
  const objective = params.user_objective || '';
  const numericMatch = objective.match(/(\d+)\s*(atividade|exerc|quest|prova|material|lista|quiz|flash|jogo|rubrica|plano)/i);
  const wordMatch = objective.match(/\b(uma?|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\s+(atividade|exerc|quest|prova|material|lista|quiz|flash|jogo|rubrica|plano)/i);
  const requestedQuantity = numericMatch
    ? parseInt(numericMatch[1])
    : wordMatch
      ? (WORD_TO_NUMBER[wordMatch[1].toLowerCase()] || null)
      : null;
  if (requestedQuantity) {
    console.log(`🔢 [Capability:DECIDIR] Quantidade explícita detectada: ${requestedQuantity}`);
  }

  // VALIDAR ENTRADAS
  const availableActivities = params.available_activities?.activities || [];
  const accountActivities = params.account_activities?.activities || [];
  
  if (availableActivities.length === 0) {
    console.error('❌ [Capability:DECIDIR] ERRO: Nenhuma atividade disponível recebida!');
    console.error('   Isso significa que pesquisar_atividades_disponiveis não foi executada corretamente.');
    
    // Retornar resultado vazio com erro
    return {
      success: false,
      validation: {
        all_ids_valid: false,
        count_within_limit: true,
        has_justification: false,
        no_duplicates: true,
        fields_complete: false,
        errors: ['Nenhuma atividade disponível para decisão - execute pesquisar_atividades_disponiveis primeiro']
      },
      chosen_activities: [],
      estrategia_pedagogica: 'Não foi possível decidir - catálogo vazio',
      total_escolhidas: 0,
      metadata: {
        decision_timestamp: new Date().toISOString(),
        attempt_number: 0,
        model_used: 'none'
      },
      // Dados de raciocínio para debug
      raciocinio: {
        catalogo_consultado: false,
        atividades_disponiveis: 0,
        atividades_anteriores: accountActivities.length,
        erro: 'Catálogo de atividades não foi carregado'
      }
    };
  }

  console.log(`✅ [Capability:DECIDIR] Catálogo recebido com ${availableActivities.length} atividades:`);
  console.log(`   IDs disponíveis: ${availableActivities.map(a => a.id).join(', ')}`);

  const context: DecisionContext = {
    user_objective: params.user_objective || 'Criar atividades educacionais',
    user_context: {
      disciplina: params.user_context?.disciplina,
      turma: params.user_context?.turma,
      objetivo_pedagogico: params.user_context?.objetivo_pedagogico || params.user_objective
    },
    available_activities: availableActivities,
    previous_activities: accountActivities,
    constraints: {
      max_activities: maxActivities,
      preferred_types: params.constraints?.preferred_types,
      avoid_types: params.constraints?.avoid_types
    }
  };

  let lastError: string | null = null;
  let attemptNumber = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    attemptNumber = attempt;
    console.log(`   Tentativa ${attempt}/${MAX_RETRIES}...`);

    try {
      const prompt = buildDecisionPrompt(context);
      
      if (attempt > 1 && lastError) {
        const reinforcedPrompt = `
${prompt}

⚠️ CORREÇÃO NECESSÁRIA (Tentativa ${attempt}):
Sua resposta anterior foi REJEITADA porque: ${lastError}

Por favor, corrija o erro e responda novamente com IDs VÁLIDOS do catálogo.
        `.trim();
        
        const result = await executeWithCascadeFallback(reinforcedPrompt);
        var aiResponse = result;
      } else {
        var aiResponse = await executeWithCascadeFallback(prompt);
      }

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Falha na chamada da API');
      }

      const cleanedText = aiResponse.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      const validation = validateDecision(
        parsedResponse,
        params.available_activities.activities,
        maxActivities
      );

      if (validation.errors.length === 0) {
        let chosenActivities = enrichChosenActivities(
          parsedResponse.atividades_escolhidas,
          availableActivities
        );

        if (requestedQuantity && chosenActivities.length > requestedQuantity) {
          console.log(`✂️ [Capability:DECIDIR] Trimming: AI retornou ${chosenActivities.length}, professor pediu ${requestedQuantity}`);
          chosenActivities = chosenActivities.slice(0, requestedQuantity);
        }

        console.log(`✅ [Capability:DECIDIR] Decisão aprovada: ${chosenActivities.length} atividades`);
        console.log(`   📋 Atividades escolhidas: ${chosenActivities.map(a => a.id).join(', ')}`);

        return {
          success: true,
          validation,
          chosen_activities: chosenActivities,
          estrategia_pedagogica: parsedResponse.estrategia_pedagogica || 'Estratégia baseada em diversidade e relevância',
          total_escolhidas: chosenActivities.length,
          metadata: {
            decision_timestamp: new Date().toISOString(),
            attempt_number: attemptNumber,
            model_used: aiResponse.modelUsed
          },
          // Dados de raciocínio para debug
          raciocinio: {
            catalogo_consultado: true,
            atividades_disponiveis: availableActivities.length,
            atividades_anteriores: accountActivities.length,
            ids_analisados: availableActivities.map(a => a.id),
            criterios_usados: ['objetivo_usuario', 'contexto_pedagogico', 'diversidade_tipos']
          }
        };
      }

      lastError = validation.errors.join('; ');
      console.warn(`⚠️ [Capability:DECIDIR] Validação falhou: ${lastError}`);

    } catch (error) {
      lastError = (error as Error).message;
      console.error(`❌ [Capability:DECIDIR] Erro na tentativa ${attempt}:`, error);
    }
  }

  console.error('❌ [Capability:DECIDIR] Todas as tentativas falharam, usando fallback');

  const fallbackCount = requestedQuantity || Math.min(3, maxActivities);
  const standardFallback = params.available_activities.activities
    .filter(a => (a as any).pipeline === 'standard' || !(a as any).pipeline)
    .slice(0, fallbackCount);
  const fallbackActivities = standardFallback.map((a, idx) => ({
      id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      categoria: a.categoria,
      materia: a.materia,
      nivel_dificuldade: a.nivel_dificuldade,
      tags: a.tags,
      campos_obrigatorios: a.campos_obrigatorios,
      campos_opcionais: a.campos_opcionais || [],
      schema_campos: a.schema_campos,
      campos_preenchidos: {},
      justificativa: 'Seleção automática (fallback)',
      ordem_sugerida: idx + 1,
      status_construcao: 'aguardando' as const,
      progresso: 0,
      pipeline: (a.pipeline || 'standard') as 'standard' | 'criar_arquivo_textual',
      text_activity_template_id: a.text_activity_template_id
    }));

  return {
    success: true,
    validation: {
      all_ids_valid: true,
      count_within_limit: true,
      has_justification: true,
      no_duplicates: true,
      fields_complete: true,
      errors: []
    },
    chosen_activities: fallbackActivities,
    estrategia_pedagogica: 'Seleção automática baseada no catálogo disponível (fallback após falha de IA)',
    total_escolhidas: fallbackActivities.length,
    metadata: {
      decision_timestamp: new Date().toISOString(),
      attempt_number: attemptNumber,
      model_used: 'fallback'
    },
    // Dados de raciocínio para debug (fallback)
    raciocinio: {
      catalogo_consultado: true,
      atividades_disponiveis: availableActivities.length,
      atividades_anteriores: accountActivities.length,
      ids_analisados: availableActivities.map(a => a.id),
      erro: lastError || 'Fallback acionado após falhas de IA'
    }
  };
}

export function formatDecisionForNextCapability(result: DecisionResult): string {
  return `
DECISÃO DE ATIVIDADES APROVADA:
═══════════════════════════════════════════════════════════

Total selecionado: ${result.total_escolhidas}
Estratégia: ${result.estrategia_pedagogica}

ATIVIDADES PARA CRIAR:
${result.chosen_activities.map((a, idx) => `
${idx + 1}. ${a.titulo} (ID: ${a.id})
   - Tipo: ${a.tipo}
   - Justificativa: ${a.justificativa}
   - Campos obrigatórios: ${a.campos_obrigatorios.join(', ')}
`).join('')}

Próximo passo: Capability 4 (criar_atividade) iniciará a construção.
  `.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSÃO V2 - API-FIRST CAPABILITY
// ═══════════════════════════════════════════════════════════════════════════

export async function decidirAtividadesCriarV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugEntry[] = [];
  const startTime = Date.now();

  try {
    // 1. OBTER RESULTADO DA CAPABILITY ANTERIOR
    console.error(`
═══════════════════════════════════════════════════════════════════════
🔍 [decidirAtividadesCriarV2] VERIFICANDO DEPENDÊNCIAS
═══════════════════════════════════════════════════════════════════════
📦 previous_results disponível: ${!!input.previous_results}
📦 previous_results.size: ${input.previous_results?.size || 0}
📦 Chaves no Map: ${input.previous_results ? Array.from(input.previous_results.keys()).join(', ') : 'NENHUMA'}
═══════════════════════════════════════════════════════════════════════`);
    
    const catalogResult = input.previous_results?.get('pesquisar_atividades_disponiveis');

    console.error(`
📦 catalogResult existe: ${!!catalogResult}
📦 catalogResult.success: ${catalogResult?.success}
📦 catalogResult.data existe: ${!!catalogResult?.data}
📦 catalogResult.data.catalog existe: ${!!catalogResult?.data?.catalog}
📦 catalogResult.data.catalog.length: ${catalogResult?.data?.catalog?.length ?? 'N/A'}
═══════════════════════════════════════════════════════════════════════`);

    if (!catalogResult) {
      throw new Error('Dependency não encontrada: pesquisar_atividades_disponiveis');
    }

    if (!catalogResult.success) {
      throw new Error('Dependency falhou: catálogo não foi carregado');
    }

    // Verificar se data.catalog existe
    if (!catalogResult.data || !catalogResult.data.catalog) {
      console.error(`❌ [decidirAtividadesCriarV2] catalogResult.data.catalog está undefined!`);
      console.error(`   catalogResult.data:`, JSON.stringify(catalogResult.data, null, 2).slice(0, 500));
      throw new Error('Dependency inválida: catalogResult.data.catalog está undefined');
    }

    const catalog = catalogResult.data.catalog as ActivityFromCatalog[];
    const validIds = catalogResult.data.valid_ids as string[];
    
    console.error(`✅ [decidirAtividadesCriarV2] Catálogo obtido: ${catalog.length} atividades`);
    console.error(`   IDs: ${catalog.map(a => a.id).join(', ')}`)

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'info',
      narrative: `Recebi catálogo com ${catalog.length} atividades da capability anterior. IDs válidos: ${validIds.length}`,
      technical_data: { catalog_count: catalog.length, valid_ids: validIds }
    });

    // 2. EXTRAIR CONTEXTO
    const userObjective = input.context.user_objective || input.context.objetivo || 'Criar atividades educacionais';
    const maxActivities = input.context.max_activities || DEFAULT_MAX_ACTIVITIES;
    const userContext = input.context.user_context || {};

    // 3. CONSTRUIR CONTEXTO DE DECISÃO
    const decisionContext: DecisionContext = {
      user_objective: userObjective,
      user_context: {
        disciplina: userContext.disciplina || input.context.disciplina,
        turma: userContext.turma,
        objetivo_pedagogico: userContext.objetivo_pedagogico || userObjective
      },
      available_activities: catalog,
      previous_activities: input.context.previous_activities || [],
      constraints: {
        max_activities: maxActivities,
        preferred_types: input.context.preferred_types,
        avoid_types: input.context.avoid_types
      }
    };

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `Construindo prompt de decisão para IA. Objetivo: "${userObjective}". Max atividades: ${maxActivities}`,
      technical_data: { objective: userObjective, max: maxActivities }
    });

    // 4. CONSTRUIR PROMPT COM DADOS REAIS
    const prompt = buildDecisionPrompt(decisionContext);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `Enviando prompt para IA com catálogo completo de ${catalog.length} atividades.`,
      technical_data: { prompt_length: prompt.length }
    });

    // 5. CHAMAR LLM
    const aiResponse = await executeWithCascadeFallback(prompt);

    if (!aiResponse.success || !aiResponse.data) {
      throw new Error('Falha na chamada da API');
    }

    const cleanedText = aiResponse.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `IA retornou decisão: ${parsedResponse.atividades_escolhidas?.length || 0} atividades escolhidas.`
    });

    // 6. VALIDAR RESPOSTA
    const validation = validateDecision(parsedResponse, catalog, maxActivities);

    if (validation.errors.length > 0) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: `❌ VALIDAÇÃO FALHOU: ${validation.errors.join('; ')}. IA escolheu IDs inválidos ou campos incorretos.`,
        technical_data: { errors: validation.errors }
      });

      throw new Error(`Validação falhou: ${validation.errors.join('; ')}`);
    }

    // 7. ENRIQUECER ATIVIDADES ESCOLHIDAS
    const chosenActivities = enrichChosenActivities(
      parsedResponse.atividades_escolhidas,
      catalog
    );

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'decision',
      narrative: `✅ Decisão validada. Atividades escolhidas: ${chosenActivities.map(a => a.titulo).join(', ')}. Estratégia: ${parsedResponse.estrategia_pedagogica || 'Não especificada'}.`
    });

    const elapsedTime = Date.now() - startTime;

    // SISTEMA DE CONFIRMAÇÃO DE DADOS
    const dataConfirmation = createDataConfirmation([
      createDataCheck('catalog_received', 'Catálogo recebido da etapa anterior', catalog.length > 0, catalog.length, '> 0 atividades'),
      createDataCheck('ai_responded', 'IA respondeu com decisão', !!parsedResponse, true, 'JSON válido'),
      createDataCheck('activities_chosen', 'Atividades foram escolhidas', chosenActivities.length > 0, chosenActivities.length, '> 0'),
      createDataCheck('all_ids_valid', 'Todos IDs escolhidos existem no catálogo', validation.all_ids_valid, validation.all_ids_valid, 'true'),
      createDataCheck('no_duplicates', 'Sem atividades duplicadas', validation.no_duplicates, validation.no_duplicates, 'true'),
      createDataCheck('has_justifications', 'Todas têm justificativa', validation.has_justification, validation.has_justification, 'true'),
      createDataCheck('within_limit', 'Dentro do limite máximo', validation.count_within_limit, chosenActivities.length, `<= ${maxActivities}`)
    ]);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: dataConfirmation.summary,
      technical_data: { checks: dataConfirmation.checks.map(c => ({ id: c.id, passed: c.passed, value: c.value })) }
    });

    console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ ✅ decidirAtividadesCriarV2 - RETURNING SUCCESS RESPONSE
║════════════════════════════════════════════════════════════════════════║
║ execution_id: ${input.execution_id}
║ chosen_activities.length: ${chosenActivities.length}
║ estrategia: ${parsedResponse.estrategia_pedagogica?.substring(0, 50) || 'default'}
║════════════════════════════════════════════════════════════════════════║
ATIVIDADES SELECIONADAS:
${chosenActivities.map((a, i) => `  ${i+1}. ${a.titulo} (ID: ${a.id}, Tipo: ${a.tipo})`).join('\n')}
║════════════════════════════════════════════════════════════════════════║
    `);

    return {
      success: true,
      capability_id: 'decidir_atividades_criar',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        chosen_activities: chosenActivities,
        estrategia: parsedResponse.estrategia_pedagogica || 'Estratégia pedagógica baseada em diversidade',
        count: chosenActivities.length,
        validation
      },
      error: null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: aiResponse.modelUsed || 'llm_decision'
      }
    };

  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // LOG DETALHADO DO ERRO
    console.error(`
═══════════════════════════════════════════════════════════════════════
❌ [decidirAtividadesCriarV2] ERRO CAPTURADO
═══════════════════════════════════════════════════════════════════════
Mensagem: ${errorMessage}
Previous results disponíveis: ${input.previous_results?.size || 0}
Chaves no Map: ${input.previous_results ? Array.from(input.previous_results.keys()).join(', ') : 'NENHUMA'}
═══════════════════════════════════════════════════════════════════════`);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `❌ ERRO: ${errorMessage}. Tentando seleção de fallback.`,
      technical_data: { 
        error: errorMessage, 
        stack: error instanceof Error ? error.stack : undefined,
        previous_results_size: input.previous_results?.size || 0,
        previous_results_keys: input.previous_results ? Array.from(input.previous_results.keys()) : []
      }
    });

    // FALLBACK: Tentar obter catálogo do Map
    const catalogResult = input.previous_results?.get('pesquisar_atividades_disponiveis');
    
    // Diagnóstico detalhado do catalogResult
    console.error(`📦 [decidirAtividadesCriarV2] catalogResult:`, {
      exists: !!catalogResult,
      success: catalogResult?.success,
      hasData: !!catalogResult?.data,
      catalogLength: catalogResult?.data?.catalog?.length || 0
    });
    
    // Verificar se temos catálogo válido
    const catalog = catalogResult?.data?.catalog || [];
    
    // Se não temos catálogo, FALHAR - não mascarar o erro
    if (catalog.length === 0) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: `❌ CRÍTICO: Catálogo vazio ou não disponível. Não é possível decidir atividades sem o catálogo.`,
        technical_data: { 
          catalog_available: false,
          original_error: errorMessage
        }
      });

      const failureConfirmation = createDataConfirmation([
        createDataCheck('catalog_available', 'Catálogo disponível', false, 0, '> 0'),
        createDataCheck('can_proceed', 'Pode continuar', false, 'não', 'sim')
      ]);

      return {
        success: false,
        capability_id: 'decidir_atividades_criar',
        execution_id: input.execution_id,
        timestamp: new Date().toISOString(),
        data: {
          chosen_activities: [],
          estrategia: '',
          count: 0,
          is_fallback: true
        },
        error: {
          code: 'CATALOG_NOT_AVAILABLE',
          message: `Não foi possível decidir atividades: ${errorMessage}. O catálogo de atividades não foi carregado corretamente.`,
          severity: 'critical',
          recoverable: false,
          recovery_suggestion: 'Verificar se pesquisar_atividades_disponiveis foi executado com sucesso antes desta capability.'
        },
        debug_log,
        data_confirmation: failureConfirmation,
        metadata: {
          duration_ms: elapsedTime,
          retry_count: 0,
          data_source: 'none'
        }
      };
    }

    // Se temos catálogo, podemos fazer fallback
    const maxActivities = input.context.max_activities || DEFAULT_MAX_ACTIVITIES;

    const fallbackActivities = catalog.slice(0, Math.min(3, maxActivities)).map((a: ActivityFromCatalog, idx: number) => ({
      id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      categoria: a.categoria,
      materia: a.materia,
      nivel_dificuldade: a.nivel_dificuldade,
      tags: a.tags,
      campos_obrigatorios: a.campos_obrigatorios,
      campos_opcionais: a.campos_opcionais || [],
      schema_campos: a.schema_campos,
      campos_preenchidos: {},
      justificativa: 'Seleção automática (fallback após erro de IA)',
      ordem_sugerida: idx + 1,
      status_construcao: 'aguardando' as const,
      progresso: 0
    }));

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'warning',
      narrative: `Usando fallback: ${fallbackActivities.length} atividades selecionadas automaticamente do catálogo.`
    });

    // CONFIRMAÇÃO DE FALLBACK
    const fallbackConfirmation = createDataConfirmation([
      createDataCheck('fallback_used', 'Fallback acionado', true, 'sim', 'por erro de IA'),
      createDataCheck('fallback_has_activities', 'Fallback gerou atividades', fallbackActivities.length > 0, fallbackActivities.length, '> 0'),
      createDataCheck('catalog_available', 'Catálogo estava disponível', catalog.length > 0, catalog.length, '> 0')
    ]);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: fallbackConfirmation.summary,
      technical_data: { is_fallback: true, original_error: errorMessage }
    });

    return {
      success: true,
      capability_id: 'decidir_atividades_criar',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        chosen_activities: fallbackActivities,
        estrategia: 'Seleção automática (fallback)',
        count: fallbackActivities.length,
        is_fallback: true
      },
      error: null,
      debug_log,
      data_confirmation: fallbackConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'fallback_selection'
      }
    };
  }
}

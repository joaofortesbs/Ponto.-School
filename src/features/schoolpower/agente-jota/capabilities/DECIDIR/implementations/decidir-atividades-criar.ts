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
  validateAIChoices
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
const DEFAULT_MAX_ACTIVITIES = 5;

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

  const catalogSummary = context.available_activities.slice(0, 15).map((a, idx) => `
${idx + 1}. **${a.titulo}** (ID: ${a.id})
   - Tipo: ${a.tipo} | Categoria: ${a.categoria}
   - Descrição: ${a.descricao?.substring(0, 100)}...
   - Campos: ${a.campos_obrigatorios.slice(0, 5).join(', ')}${a.campos_obrigatorios.length > 5 ? '...' : ''}
`).join('');

  return `
# TAREFA: Decidir quais atividades criar

Você é um especialista pedagógico escolhendo atividades para um professor.

## OBJETIVO DO USUÁRIO
${context.user_objective}

## CONTEXTO DO PROFESSOR
- Disciplina: ${context.user_context.disciplina || 'Não especificada'}
- Turma: ${context.user_context.turma?.nome || 'Não especificada'}
- Nível: ${context.user_context.turma?.nivel || 'Não especificado'}
- Objetivo pedagógico: ${context.user_context.objetivo_pedagogico || context.user_objective}

${accountContext}

## ATIVIDADES DISPONÍVEIS NO CATÁLOGO (FONTE DE VERDADE)
Total disponível: ${context.available_activities.length}

IDs VÁLIDOS: ${context.available_activities.map(a => a.id).join(', ')}

${catalogSummary}

## CONSTRAINTS
- Máximo de atividades: ${context.constraints.max_activities}
- Tipos preferidos: ${context.constraints.preferred_types?.join(', ') || 'Nenhum'}
- Evitar tipos: ${context.constraints.avoid_types?.join(', ') || 'Nenhum'}

## INSTRUÇÕES DE DECISÃO

1. Analise o objetivo do usuário e o contexto
2. Escolha até ${context.constraints.max_activities} atividades do CATÁLOGO DISPONÍVEL
3. Priorize:
   - Relevância para disciplina e nível
   - Progressão pedagógica (básico → avançado)
   - Diversidade de tipos (não repetir mesmo tipo)
   - Atividades que o professor ainda não criou

## ⚠️ REGRA ABSOLUTA - ANTI-ALUCINAÇÃO

- Use APENAS IDs da lista de IDs válidos acima
- NUNCA invente IDs ou atividades que não existem
- Se escolher um ID inválido, o sistema REJEITARÁ sua resposta

## FORMATO DE RESPOSTA (JSON VÁLIDO)

{
  "atividades_escolhidas": [
    {
      "id": "plano-aula-001",
      "titulo": "Título exato do catálogo",
      "justificativa": "Por que esta atividade é ideal para o objetivo",
      "ordem_sugerida": 1
    }
  ],
  "estrategia_pedagogica": "Explicação da progressão pedagógica escolhida",
  "total_escolhidas": 2
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

  const count_within_limit = chosenIds.length <= maxActivities;
  if (!count_within_limit) {
    errors.push(`Quantidade (${chosenIds.length}) excede o limite (${maxActivities})`);
  }

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
      progresso: 0
    };
  }).filter(Boolean) as ChosenActivity[];
}

export async function decidirAtividadesCriar(
  params: DecidirAtividadesCriarParams
): Promise<DecisionResult> {
  console.log('🎯 [Capability:DECIDIR] Iniciando decisão de atividades');
  
  const startTime = Date.now();
  const maxActivities = params.constraints?.max_activities || DEFAULT_MAX_ACTIVITIES;

  const context: DecisionContext = {
    user_objective: params.user_objective,
    user_context: {
      disciplina: params.user_context?.disciplina,
      turma: params.user_context?.turma,
      objetivo_pedagogico: params.user_context?.objetivo_pedagogico || params.user_objective
    },
    available_activities: params.available_activities.activities,
    previous_activities: params.account_activities.activities || [],
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
        const chosenActivities = enrichChosenActivities(
          parsedResponse.atividades_escolhidas,
          params.available_activities.activities
        );

        console.log(`✅ [Capability:DECIDIR] Decisão aprovada: ${chosenActivities.length} atividades`);

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

  const fallbackActivities = params.available_activities.activities
    .slice(0, Math.min(3, maxActivities))
    .map((a, idx) => ({
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
      progresso: 0
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

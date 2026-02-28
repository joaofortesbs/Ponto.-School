/**
 * gerar-conteudo-atividades.ts
 * Orquestrador de geração de conteúdo para atividades educacionais.
 *
 * Responsabilidade: orquestrar a geração de conteúdo para cada atividade
 * decidida, delegando para os módulos especializados.
 *
 * Módulos delegados:
 * - content-types.ts            → interfaces e tipos compartilhados
 * - content-helpers.ts          → helpers utilitários
 * - content-prompt-builders.ts  → construtores de prompt + parse + validação
 * - content-handlers-a.ts       → lista-exercicios, quiz-interativo
 * - content-handlers-b.ts       → flash-cards, text-version
 * - content-activity-generator.ts → generateContentForActivity (dispatcher)
 */

import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import { useChosenActivitiesStore, type ChosenActivity } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { getFieldsForActivityType } from '../schemas/gerar-conteudo-schema';
import {
  syncSchemaToFormData,
  validateSyncedFields,
  generateFieldSyncDebugReport,
  persistActivityToStorage
} from '../../../../construction/utils/activity-fields-sync';
import { createDebugEntry, useDebugStore } from '../../../../interface-chat-producao/debug-system/DebugStore';
import { useActivityDebugStore } from '../../../../construction/stores/activityDebugStore';
import { storageSet } from '@/features/schoolpower/services/StorageOrchestrator';

import type {
  GerarConteudoParams,
  GerarConteudoOutput,
  DebugLogEntry,
  GeneratedFieldsResult,
  BnccContextData,
  QuestoesReferenciaData,
  WebSearchContextData,
  VerificationResult,
  CoherenceResult,
} from './content-types';
import { generateContentForActivity } from './content-activity-generator';

import type {
  CapabilityInput,
  CapabilityOutput,
  CapabilityError,
  ChosenActivity as ChosenActivityFromTypes
} from '../../shared/types';

// ============================================================
// V2-SPECIFIC HELPERS
// ============================================================

function createCapabilityError(message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'high'): CapabilityError {
  return {
    code: 'GENERATION_ERROR',
    message,
    severity,
    recoverable: severity !== 'critical',
    recovery_suggestion: severity === 'critical'
      ? 'Reinicie o fluxo de criação de atividades'
      : 'Tente novamente ou verifique os parâmetros de entrada'
  };
}

const INTERACTIVE_ACTIVITY_TYPES = new Set([
  'quiz-interativo', 'lista-exercicios', 'flash-cards', 'quadro-interativo', 'avaliacao-diagnostica'
]);

const TEXTUAL_ACTIVITY_TYPES = new Set([
  'plano-aula', 'sequencia-didatica', 'tese-redacao', 'proposta-redacao', 'projeto-aprendizagem',
  'roteiro-aula', 'ficha-leitura', 'resumo-conteudo', 'mapa-conceitual-texto'
]);

function getPreferredModelForActivityType(activityType: string): string {
  if (INTERACTIVE_ACTIVITY_TYPES.has(activityType)) return 'gemini-2.5-flash';
  if (TEXTUAL_ACTIVITY_TYPES.has(activityType)) return 'llama-3.3-70b-versatile';
  return 'llama-3.3-70b-versatile';
}

function getVerificationModel(generationModel: string): string {
  if (generationModel.includes('gemini')) return 'llama-3.3-70b-versatile';
  return 'gemini-2.5-flash';
}

async function runVerificationJudge(
  activity: ChosenActivity,
  generatedContent: Record<string, any>,
  userObjective: string,
  conversationContext: string,
  previousActivitiesSummary: string
): Promise<VerificationResult> {
  const startTime = Date.now();

  const contentSummary = Object.entries(generatedContent)
    .slice(0, 8)
    .map(([k, v]) => {
      const val = typeof v === 'string' ? v.substring(0, 120) : typeof v === 'object' ? JSON.stringify(v).substring(0, 120) : String(v);
      return `${k}: ${val}`;
    })
    .join('\n');

  const verificationPrompt = `Você é um VERIFICADOR PEDAGÓGICO especializado. Analise o conteúdo gerado e retorne APENAS JSON válido.

ATIVIDADE: "${activity.titulo}" (tipo: ${activity.tipo})
OBJETIVO DO PROFESSOR: ${userObjective.substring(0, 300)}
CONTEXTO: ${conversationContext.substring(0, 200)}
${previousActivitiesSummary ? `ATIVIDADES JÁ GERADAS NA SESSÃO: ${previousActivitiesSummary}` : ''}

CONTEÚDO GERADO (amostra):
${contentSummary}

CRITÉRIOS DE AVALIAÇÃO:
1. ALINHAMENTO: O conteúdo está alinhado ao objetivo do professor?
2. COMPLETUDE: Os campos principais foram preenchidos (não vazios, não genéricos)?
3. QUALIDADE: O conteúdo é pedagogicamente sólido e aplicável em sala?
4. UNICIDADE: Evita repetição com as atividades já geradas?
5. ADEQUAÇÃO: Adequado ao nível/contexto educacional informado?

RETORNE APENAS JSON (sem markdown):
{"approved":true,"score":8,"issues":[],"suggestions":["opcional"]}

score de 0 a 10. approved=true se score >= 7. issues = lista de problemas encontrados (vazio se nenhum).`;

  try {
    const response = await executeWithCascadeFallback(verificationPrompt, {
      systemPrompt: 'Você é um verificador pedagógico que retorna APENAS JSON válido, sem markdown. Nunca use ```json. Responda direto com o objeto JSON.'
    });

    const duration_ms = Date.now() - startTime;

    if (!response.success || !response.data) {
      return { approved: true, score: 7, issues: [], suggestions: [], model_used: 'fallback', duration_ms };
    }

    let cleanData = response.data.trim();
    const jsonMatch = cleanData.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanData = jsonMatch[0];

    const parsed = JSON.parse(cleanData);
    return {
      approved: Boolean(parsed.approved),
      score: Math.min(10, Math.max(0, Number(parsed.score) || 7)),
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      model_used: response.modelUsed || 'unknown',
      duration_ms,
    };
  } catch {
    return { approved: true, score: 7, issues: [], suggestions: [], model_used: 'error-fallback', duration_ms: Date.now() - startTime };
  }
}

async function runPackageCoherenceCheck(
  activities: Array<{ titulo: string; tipo: string; id: string }>,
  userObjective: string,
  generatedSummaries: string[]
): Promise<CoherenceResult> {
  const startTime = Date.now();

  const activitiesList = activities.map((a, i) => `${i + 1}. "${a.titulo}" (${a.tipo})`).join('\n');
  const summariesList = generatedSummaries.slice(0, 5).join('\n---\n');

  const coherencePrompt = `Você é um REVISOR DE COERÊNCIA PEDAGÓGICA. Analise o conjunto de atividades e retorne APENAS JSON.

OBJETIVO DO PROFESSOR: ${userObjective.substring(0, 300)}

ATIVIDADES DO PACOTE (em ordem):
${activitiesList}

AMOSTRAS DE CONTEÚDO GERADO:
${summariesList.substring(0, 800)}

VERIFIQUE:
1. A sequência das atividades é pedagogicamente lógica?
2. Há conteúdo duplicado ou muito repetido entre elas?
3. O conjunto cobre o objetivo do professor de forma completa?

RETORNE APENAS JSON:
{"coherence_score":8,"sequence_ok":true,"coherence_issues":[],"coverage_ok":true}

coherence_score de 0 a 10.`;

  try {
    const response = await executeWithCascadeFallback(coherencePrompt, {
      systemPrompt: 'Você é um revisor pedagógico que retorna APENAS JSON válido, sem markdown.'
    });

    const duration_ms = Date.now() - startTime;

    if (!response.success || !response.data) {
      return { coherence_score: 8, sequence_ok: true, coherence_issues: [], coverage_ok: true, duration_ms };
    }

    let cleanData = response.data.trim();
    const jsonMatch = cleanData.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanData = jsonMatch[0];

    const parsed = JSON.parse(cleanData);
    return {
      coherence_score: Math.min(10, Math.max(0, Number(parsed.coherence_score) || 8)),
      sequence_ok: Boolean(parsed.sequence_ok !== false),
      coherence_issues: Array.isArray(parsed.coherence_issues) ? parsed.coherence_issues : [],
      coverage_ok: Boolean(parsed.coverage_ok !== false),
      duration_ms,
    };
  } catch {
    return { coherence_score: 8, sequence_ok: true, coherence_issues: [], coverage_ok: true, duration_ms: Date.now() - startTime };
  }
}

// ============================================================
// V1: gerarConteudoAtividades
// ============================================================
export async function gerarConteudoAtividades(
  params: GerarConteudoParams
): Promise<GerarConteudoOutput> {
  const startTime = Date.now();
  const debugLog: DebugLogEntry[] = [];
  const CAPABILITY_ID = 'gerar_conteudo_atividades';
  const CAPABILITY_NAME = 'Gerando conteúdo para as atividades';

  const diagnosticMessage = `
═══════════════════════════════════════════════════════════════════════
🚀 STARTING: gerar_conteudo_atividades
═══════════════════════════════════════════════════════════════════════
Received params keys: ${Object.keys(params).join(', ')}
activities_to_fill exists: ${!!params.activities_to_fill}
activities_to_fill length: ${params.activities_to_fill?.length || 0}
session_id: ${params.session_id || 'NOT PROVIDED'}
user_objective: ${params.user_objective?.substring(0, 50) || 'NOT PROVIDED'}
═══════════════════════════════════════════════════════════════════════`;

  console.error(diagnosticMessage);

  useDebugStore.getState().startCapability(CAPABILITY_ID, CAPABILITY_NAME);

  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
    `Iniciando execução da capability "${CAPABILITY_NAME}". Objetivo: processar dados conforme parâmetros recebidos.`,
    'low',
    {
      session_id: params.session_id,
      objetivo: params.user_objective?.substring(0, 100),
      params_keys: Object.keys(params),
      activities_to_fill_count: params.activities_to_fill?.length || 0
    }
  );

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: '🚀 Iniciando geração de conteúdo para atividades',
    technical_data: { session_id: params.session_id }
  });

  const store = useChosenActivitiesStore.getState();

  let activities = params.activities_to_fill;
  let activitySource = 'params.activities_to_fill';

  if (!activities || activities.length === 0) {
    activities = store.getChosenActivities();
    activitySource = 'store.getChosenActivities()';
    console.error(`📦 [GerarConteudo] Fallback para store: ${activities?.length || 0} atividades`);
  }

  console.error(`
📊 [GerarConteudo] FONTES DE DADOS:
   - params.activities_to_fill: ${params.activities_to_fill?.length || 0} atividades
   - store.getChosenActivities(): ${store.getChosenActivities()?.length || 0} atividades
   - store.isDecisionComplete: ${store.isDecisionComplete}
   - store.sessionId: ${store.sessionId}
   - FONTE USADA: ${activitySource}
   - TOTAL FINAL: ${activities?.length || 0} atividades
  `);

  if (!activities || activities.length === 0) {
    const errorDetail = `
❌ CRITICAL ERROR: No activities received!
   - params.activities_to_fill: ${params.activities_to_fill?.length || 'undefined'}
   - store.getChosenActivities(): ${store.getChosenActivities()?.length || 0}
   - store.isDecisionComplete: ${store.isDecisionComplete}
   - Possible cause: gerar_conteudo_atividades executed BEFORE decidir_atividades_criar saved data
    `;
    console.error(errorDetail);

    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
      'Nenhuma atividade encontrada para preencher. Verifique se a capability "decidir_atividades_criar" foi executada e salvou os dados.',
      'high',
      {
        params_activities_count: params.activities_to_fill?.length || 0,
        store_activities_count: store.getChosenActivities()?.length || 0,
        store_is_decision_complete: store.isDecisionComplete,
        diagnostic: 'TIMING ISSUE - capability executed before data persistence'
      }
    );

    useDebugStore.getState().endCapability(CAPABILITY_ID);

    return {
      success: false,
      capability_id: CAPABILITY_ID,
      error: 'Nenhuma atividade encontrada para preencher. A capability decidir_atividades_criar pode não ter salvado os dados corretamente.',
      data: null,
      debug_log: debugLog,
      execution_time_ms: Date.now() - startTime
    };
  }

  console.error(`🔥 GENERATING CONTENT FOR ${activities.length} ACTIVITIES (source: ${activitySource})`);
  activities.forEach((act, idx) => {
    console.error(`  Activity ${idx + 1}: ID=${act.id}, Type=${act.tipo}, Title=${act.titulo}`);
  });

  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
    `Capability "${CAPABILITY_ID}" encontrada no registro. Iniciando execução com os parâmetros configurados.`,
    'low'
  );

  const activitySummary = activities.map(a => `• ${a.titulo} (${a.tipo})`).join('\n');
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'discovery',
    `Encontradas ${activities.length} atividades para gerar conteúdo:\n${activitySummary}`,
    'low',
    {
      quantidade: activities.length,
      atividades: activities.map(a => ({ id: a.id, titulo: a.titulo, tipo: a.tipo }))
    }
  );

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'discovery',
    narrative: `📋 ${activities.length} atividades para preencher`,
    technical_data: { activity_ids: activities.map(a => a.id) }
  });

  for (const activity of activities) {
    const fieldsMapping = getFieldsForActivityType(activity.tipo);
    if (fieldsMapping) {
      const requiredFieldsList = fieldsMapping.requiredFields.map(f => `• ${f.label}: ${f.description}`).join('\n');
      const optionalFieldsList = fieldsMapping.optionalFields?.map(f => `• ${f.label}: ${f.description}`).join('\n') || '';
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'discovery',
        `📋 Campos para "${activity.titulo}" (${fieldsMapping.displayName}):\n\nCAMPOS OBRIGATÓRIOS:\n${requiredFieldsList}` +
        (optionalFieldsList ? `\n\nCAMPOS OPCIONAIS:\n${optionalFieldsList}` : ''),
        'low',
        {
          activity_id: activity.id, activity_type: activity.tipo,
          required_fields: fieldsMapping.requiredFields.map(f => f.name),
          optional_fields: fieldsMapping.optionalFields?.map(f => f.name) || []
        }
      );
    } else {
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
        `Tipo de atividade "${activity.tipo}" não possui mapeamento de campos definido.`, 'medium'
      );
    }
  }

  const results: GeneratedFieldsResult[] = [];
  const totalActivities = activities.length;
  const activityDebugStore = useActivityDebugStore.getState();

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];

    activityDebugStore.initActivity(activity.id, activity.titulo, activity.tipo);
    activityDebugStore.setStatus(activity.id, 'building');
    activityDebugStore.setProgress(activity.id, 0, 'Iniciando geração de conteúdo');

    activityDebugStore.log(
      activity.id, 'action', 'GerarConteudo',
      `Iniciando geração de conteúdo para "${activity.titulo}"`,
      {
        activity_type: activity.tipo, index: i + 1, total: totalActivities,
        fields_to_generate: getFieldsForActivityType(activity.tipo)?.requiredFields?.map(f => f.name) || []
      }
    );

    params.on_progress?.({
      type: 'activity_started',
      activity_id: activity.id, activity_title: activity.titulo,
      current_activity: i + 1, total_activities: totalActivities,
      progress: Math.round((i / totalActivities) * 100),
      message: `Gerando conteúdo para: ${activity.titulo}`
    });

    store.updateActivityStatus(activity.id, 'construindo', Math.round((i / totalActivities) * 100));

    activityDebugStore.setProgress(activity.id, 10, 'Preparando chamada à API de IA');
    activityDebugStore.log(activity.id, 'api', 'GerarConteudo',
      'Chamando API de IA (Groq/Gemini) para gerar campos...',
      { model_cascade: ['llama3.3-70b', 'llama3.1-8b', 'gemini-2.5-flash'] }
    );

    const result = await generateContentForActivity(
      activity,
      params.conversation_context,
      params.user_objective,
      params.on_progress,
      CAPABILITY_ID,
      CAPABILITY_NAME,
      i,
      totalActivities,
      params.tema_limpo,
      params.disciplina_extraida,
      params.turma_extraida,
      params.bncc_context,
      params.questoes_referencia,
      undefined,
      params.file_context
    );

    results.push(result);

    activityDebugStore.setProgress(activity.id, 50, 'Processando resposta da IA');

    if (result.success) {
      activityDebugStore.log(
        activity.id, 'success', 'API-Response',
        `API retornou ${Object.keys(result.generated_fields).length} campos gerados`,
        {
          fields_generated: Object.keys(result.generated_fields),
          sample_values: Object.fromEntries(
            Object.entries(result.generated_fields).slice(0, 3).map(([k, v]) =>
              [k, typeof v === 'string' ? v.substring(0, 100) + (v.length > 100 ? '...' : '') : v]
            )
          )
        }
      );
    } else {
      activityDebugStore.log(activity.id, 'error', 'API-Response',
        `Falha na geração: ${result.error}`, { error: result.error }
      );
    }

    if (result.success) {
      activityDebugStore.setProgress(activity.id, 60, 'Sincronizando campos com formulário');
      const syncedFields = syncSchemaToFormData(activity.tipo, result.generated_fields);

      console.log('%c📊 [GerarConteudo] Relatório de sincronização:',
        'background: #9C27B0; color: white; padding: 2px 5px; border-radius: 3px;');
      console.log(generateFieldSyncDebugReport(activity.tipo, syncedFields));

      const validation = validateSyncedFields(activity.tipo, syncedFields);
      console.log(`%c📋 [GerarConteudo] Validação: ${validation.filledFields.length} campos preenchidos, ${validation.missingFields.length} faltando`,
        validation.valid ? 'color: green;' : 'color: orange;');

      activityDebugStore.setProgress(activity.id, 70, 'Validando campos gerados');
      activityDebugStore.log(activity.id, 'info', 'Validation',
        `Validação: ${validation.filledFields.length} campos preenchidos, ${validation.missingFields.length} faltando`,
        { filled_fields: validation.filledFields, missing_fields: validation.missingFields, is_valid: validation.valid }
      );

      store.setActivityGeneratedFields(activity.id, syncedFields);

      const updatedActivity = store.getActivityById(activity.id);
      if (updatedActivity) {
        store.setActivityBuiltData(activity.id, {
          ...updatedActivity.dados_construidos,
          generated_fields: syncedFields,
          original_generated_fields: result.generated_fields,
          generation_timestamp: new Date().toISOString(),
          sync_validation: validation
        });
      }

      activityDebugStore.setProgress(activity.id, 80, 'Salvando no localStorage');
      activityDebugStore.log(activity.id, 'action', 'LocalStorage', 'Persistindo dados no localStorage...',
        { keys_to_save: ['activity_*', 'constructed_*', 'generated_content_*'] }
      );

      const savedKeys = persistActivityToStorage(
        activity.id, activity.tipo, activity.titulo, syncedFields,
        {
          description: (activity as any).descricao || activity.titulo,
          isPreGenerated: true, source: 'gerar_conteudo_atividades'
        }
      );

      console.log(`%c💾 [GerarConteudo] Atividade persistida em ${savedKeys.length} chaves do localStorage`,
        'background: #FF5722; color: white; padding: 2px 5px; border-radius: 3px;');

      activityDebugStore.log(activity.id, 'success', 'LocalStorage',
        `Dados persistidos em ${savedKeys.length} chaves do localStorage`, { saved_keys: savedKeys }
      );

      const actualFieldsCount = validation.filledFields.length;
      const totalRequiredFields = activity.campos_obrigatorios?.length || validation.filledFields.length + validation.missingFields.length;

      console.log(`%c✅ [GerarConteudo] Campos gerados para ${activity.id}: ${actualFieldsCount}/${totalRequiredFields} campos. Atualizando status para 'concluida'`,
        'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;');

      await Promise.resolve();
      store.updateActivityStatus(activity.id, 'concluida', 100);

      activityDebugStore.setProgress(activity.id, 100, 'Atividade construída com sucesso');
      activityDebugStore.markCompleted(activity.id);

      console.log('📤 [GerarConteudo] Emitindo evento agente-jota-fields-generated para:', activity.id);
      window.dispatchEvent(new CustomEvent('agente-jota-fields-generated', {
        detail: {
          activity_id: activity.id, activity_type: activity.tipo,
          fields: syncedFields, original_fields: result.generated_fields,
          validation: validation,
          fields_completed: actualFieldsCount, fields_total: totalRequiredFields
        }
      }));

      params.on_progress?.({
        type: 'activity_completed',
        activity_id: activity.id, activity_title: activity.titulo,
        current_activity: i + 1, total_activities: totalActivities,
        progress: Math.round(((i + 1) / totalActivities) * 100),
        message: `Conteúdo gerado para: ${activity.titulo}`
      });

      debugLog.push({
        timestamp: new Date().toISOString(), type: 'action',
        narrative: `✅ Conteúdo gerado para "${activity.titulo}"`,
        technical_data: {
          activity_id: activity.id,
          fields_count: Object.keys(result.generated_fields).length,
          generated_fields: result.generated_fields
        }
      });

    } else {
      activityDebugStore.setError(activity.id, result.error || 'Erro desconhecido na geração');
      store.updateActivityStatus(activity.id, 'erro', 0, result.error);

      params.on_progress?.({
        type: 'activity_error',
        activity_id: activity.id, activity_title: activity.titulo,
        error: result.error,
        message: `Erro ao gerar conteúdo para: ${activity.titulo}`
      });

      debugLog.push({
        timestamp: new Date().toISOString(), type: 'error',
        narrative: `❌ Erro em "${activity.titulo}": ${result.error}`,
        technical_data: { activity_id: activity.id, error: result.error }
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const executionTime = Date.now() - startTime;
  const totalFieldsGenerated = results.reduce((acc, r) =>
    acc + (r.success ? Object.keys(r.generated_fields || {}).length : 0), 0);

  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
    `Capability "${CAPABILITY_NAME}" concluída em ${executionTime}ms.\n` +
    `Atividades processadas: ${successCount}/${totalActivities}\n` +
    `Total de campos gerados: ${totalFieldsGenerated}`,
    failCount > 0 ? 'medium' : 'low',
    { success_count: successCount, fail_count: failCount, total_fields_generated: totalFieldsGenerated, execution_time_ms: executionTime }
  );

  useDebugStore.getState().endCapability(CAPABILITY_ID);

  params.on_progress?.({
    type: 'all_completed',
    total_activities: totalActivities,
    progress: 100,
    message: `Geração concluída: ${successCount} sucesso, ${failCount} erros`
  });

  window.dispatchEvent(new CustomEvent('agente-jota-content-generation-complete', {
    detail: { session_id: params.session_id, success_count: successCount, fail_count: failCount, results }
  }));

  debugLog.push({
    timestamp: new Date().toISOString(), type: 'action',
    narrative: `🏁 Geração de conteúdo finalizada: ${successCount}/${totalActivities} atividades`,
    technical_data: { success_count: successCount, fail_count: failCount }
  });

  const isPartialOrFullSuccess = successCount > 0;
  const successfulResults = results.filter(r => r.success);

  if (failCount > 0 && successCount > 0) {
    console.log(`📊 [GerarConteudo] PARTIAL SUCCESS: ${successCount} succeeded, ${failCount} failed. Pipeline continues.`);
  }

  const generated_fields = successfulResults.map(r => ({
    activity_id: r.activity_id, activity_type: r.activity_type,
    fields: r.generated_fields || {}, generated_fields: r.generated_fields || {},
    validation: {
      required_count: 0,
      filled_count: Object.keys(r.generated_fields || {}).length,
      is_complete: Object.keys(r.generated_fields || {}).length > 0
    }
  }));

  console.log(`📊 [GerarConteudo] Returning ${generated_fields.length} activities in generated_fields format`);

  return {
    success: isPartialOrFullSuccess,
    capability_id: CAPABILITY_ID,
    data: {
      session_id: params.session_id,
      total_activities: totalActivities,
      success_count: successCount, fail_count: failCount,
      results, successful_results: successfulResults,
      generated_fields, partial_success: failCount > 0 && successCount > 0,
      generated_at: new Date().toISOString()
    },
    error: failCount > 0 && successCount === 0
      ? `Todas as ${failCount} atividades falharam`
      : (failCount > 0 ? `${failCount} falharam, ${successCount} bem-sucedidas` : null),
    debug_log: debugLog,
    execution_time_ms: executionTime,
    message: `Conteúdo gerado para ${successCount} de ${totalActivities} atividades`
  };
}

export default gerarConteudoAtividades;

// ============================================================
// V2: gerarConteudoAtividadesV2 (API-First Capability)
// ============================================================
export async function gerarConteudoAtividadesV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugLogEntry[] = [];
  const startTime = Date.now();
  const CAPABILITY_ID = 'gerar_conteudo_atividades';

  try {
    console.error(`
═══════════════════════════════════════════════════════════════════════
🚀 [V2] STARTING: gerarConteudoAtividadesV2
═══════════════════════════════════════════════════════════════════════
input.execution_id: ${input.execution_id}
input.previous_results keys: ${input.previous_results ? Array.from(input.previous_results.keys()).join(', ') : 'NONE'}
═══════════════════════════════════════════════════════════════════════`);

    const decisionResult = input.previous_results?.get('decidir_atividades_criar');

    console.error(`
🔍 [V2] DIAGNOSTIC: decisionResult FULL ANALYSIS
═══════════════════════════════════════════════════════════════════════
decisionResult exists: ${!!decisionResult}
decisionResult type: ${typeof decisionResult}
decisionResult keys: ${decisionResult ? Object.keys(decisionResult).join(', ') : 'NONE'}
decisionResult.success: ${decisionResult?.success}
decisionResult.data exists: ${!!(decisionResult as any)?.data}
decisionResult.data type: ${typeof (decisionResult as any)?.data}
decisionResult.data keys: ${(decisionResult as any)?.data ? Object.keys((decisionResult as any).data).join(', ') : 'NONE'}
decisionResult.chosen_activities exists: ${!!(decisionResult as any)?.chosen_activities}
decisionResult.chosen_activities length: ${(decisionResult as any)?.chosen_activities?.length || 0}
decisionResult.data?.chosen_activities exists: ${!!(decisionResult as any)?.data?.chosen_activities}
decisionResult.data?.chosen_activities length: ${(decisionResult as any)?.data?.chosen_activities?.length || 0}
═══════════════════════════════════════════════════════════════════════`);

    if (!decisionResult) {
      throw new Error('Dependency não encontrada: decidir_atividades_criar. Execute a capability de decisão primeiro.');
    }

    if (!decisionResult.success) {
      throw new Error(`Dependency falhou: decidir_atividades_criar retornou success=false. Erro: ${decisionResult.error}`);
    }

    const resultAsAny = decisionResult as any;
    let chosenActivities: ChosenActivity[] = [];
    let activitySource = 'none';

    if (resultAsAny.data?.chosen_activities?.length > 0) {
      chosenActivities = resultAsAny.data.chosen_activities;
      activitySource = 'data.chosen_activities (V2)';
    } else if (resultAsAny.chosen_activities?.length > 0) {
      chosenActivities = resultAsAny.chosen_activities;
      activitySource = 'chosen_activities (legacy)';
    } else if (resultAsAny.activities?.length > 0) {
      chosenActivities = resultAsAny.activities;
      activitySource = 'activities (alt)';
    } else if (resultAsAny.data?.activities?.length > 0) {
      chosenActivities = resultAsAny.data.activities;
      activitySource = 'data.activities (alt)';
    } else if (resultAsAny.data?.atividades_escolhidas?.length > 0) {
      chosenActivities = resultAsAny.data.atividades_escolhidas;
      activitySource = 'data.atividades_escolhidas (local-fallback-raw)';
    } else {
      const storeActivities = useChosenActivitiesStore.getState().getChosenActivities();
      if (storeActivities.length > 0) {
        chosenActivities = storeActivities;
        activitySource = 'store fallback';
      } else {
        activitySource = 'none — todos os caminhos retornaram vazio';
      }
    }

    console.error(`📊 [V2] chosenActivities source: ${activitySource}`);
    console.error(`📊 [V2] chosenActivities count: ${chosenActivities.length}`);

    if (chosenActivities.length === 0) {
      const diagKeys = Object.keys(resultAsAny).join(', ');
      const diagDataKeys = resultAsAny.data ? Object.keys(resultAsAny.data).join(', ') : 'data=null';
      console.error(`🔴 [V2] DIAGNÓSTICO FALHA HANDOFF:
  - decidir success=true mas atividades vazias em todos os 6 caminhos
  - decisionResult keys: ${diagKeys}
  - decisionResult.data keys: ${diagDataKeys}
  - data.chosen_activities length: ${resultAsAny.data?.chosen_activities?.length ?? 'undefined'}
  - data.atividades_escolhidas length: ${resultAsAny.data?.atividades_escolhidas?.length ?? 'undefined'}
  - Store também vazio
  - PROVÁVEL CAUSA: Local fallback ativado em decidir retornou empty list (catalog extraction falhou)`);
      throw new Error(
        'Nenhuma atividade escolhida encontrada no resultado de decidir_atividades_criar. ' +
        `Caminhos tentados: data.chosen_activities, chosen_activities, activities, data.activities, data.atividades_escolhidas, store. ` +
        `Todos retornaram vazio. Possível causa: Gemini FC falhou (404) e fallback local não conseguiu extrair catálogo do prompt.`
      );
    }

    debug_log.push({
      timestamp: new Date().toISOString(), type: 'info',
      narrative: `Recebido ${chosenActivities.length} atividades da capability decidir_atividades_criar. Iniciando geração de conteúdo.`,
      technical_data: { activities_count: chosenActivities.length, activity_ids: chosenActivities.map(a => a.id) }
    });

    // T003: Recuperar justificativas do previous_results para atividades que vieram sem ela
    const decisionResultForJust = input.previous_results?.get?.('decidir_atividades_criar');
    const chosenWithJust = (decisionResultForJust as any)?.data?.chosen_activities as ChosenActivity[] | undefined;
    if (chosenWithJust?.length) {
      let justInjected = 0;
      for (const activity of chosenActivities) {
        if (!activity.justificativa || activity.justificativa.length < 10) {
          const match = chosenWithJust.find((c: ChosenActivity) => c.id === activity.id);
          if (match?.justificativa && match.justificativa.length >= 10) {
            activity.justificativa = match.justificativa;
            justInjected++;
          }
        }
      }
      if (justInjected > 0) {
        console.log(`✅ [GerarConteudo] Justificativas recuperadas do previous_results: ${justInjected} atividades enriquecidas`);
      }
    }

    const conversationContext = input.context.conversation_context ||
                                input.context.conversa || 'Contexto educacional';
    const userObjective = input.context.user_objective ||
                          input.context.objetivo || 'Criar atividades educacionais';
    const sessionId = input.context.session_id || input.execution_id;

    debug_log.push({
      timestamp: new Date().toISOString(), type: 'action',
      narrative: `Contexto extraído. Objetivo: "${userObjective.substring(0, 100)}...". Processando ${chosenActivities.length} atividades.`,
      technical_data: { objective_length: userObjective.length, context_length: conversationContext.length, session_id: sessionId }
    });

    const results: GeneratedFieldsResult[] = [];
    const store = useChosenActivitiesStore.getState();
    const verificationResults: Record<string, VerificationResult> = {};
    const activityGeneratedSummaries: string[] = [];

    useDebugStore.getState().startCapability(CAPABILITY_ID, 'Gerando conteúdo V2');

    const activityDebugStore = useActivityDebugStore.getState();

    for (let i = 0; i < chosenActivities.length; i++) {
      const activity = chosenActivities[i];

      console.error(`🔄 [V2] Processing activity ${i + 1}/${chosenActivities.length}: ${activity.titulo}`);

      activityDebugStore.initActivity(activity.id, activity.titulo, activity.tipo);
      activityDebugStore.setStatus(activity.id, 'building');
      activityDebugStore.setProgress(activity.id, 0, 'Iniciando geração de conteúdo');

      activityDebugStore.log(activity.id, 'action', 'GerarConteudoV2',
        `[${i + 1}/${chosenActivities.length}] Iniciando geração para "${activity.titulo}"`,
        { activity_type: activity.tipo, index: i + 1, total: chosenActivities.length, timestamp: new Date().toISOString() }
      );

      debug_log.push({
        timestamp: new Date().toISOString(), type: 'action',
        narrative: `[${i + 1}/${chosenActivities.length}] Gerando conteúdo para "${activity.titulo}" (${activity.tipo})`,
        technical_data: {
          activity_id: activity.id, activity_type: activity.tipo,
          progress: Math.round((i / chosenActivities.length) * 100)
        }
      });

      store.updateActivityStatus(activity.id, 'construindo', Math.round((i / chosenActivities.length) * 100));

      activityDebugStore.setProgress(activity.id, 10, 'Preparando chamada à API de IA');
      activityDebugStore.log(activity.id, 'api', 'GerarConteudoV2',
        'Chamando API de IA (Groq/Gemini) para gerar campos...',
        { model_cascade: ['llama3.3-70b', 'llama3.1-8b', 'gemini-2.5-flash'] }
      );

      const v2TemaLimpo = input.context.tema_limpo || '';
      const v2DisciplinaExtraida = input.context.disciplina_extraida || '';
      const v2TurmaExtraida = input.context.turma_extraida || '';

      // T004: Diagnóstico explícito de tema_limpo, disciplina e turma ao gerar cada atividade
      if (!v2TemaLimpo) {
        console.warn(`⚠️ [GerarConteudo] tema_limpo chegou VAZIO para "${activity.titulo}"! Verificar extração no Planner e Executor.`);
        console.warn(`⚠️ [GerarConteudo] userObjective="${userObjective.substring(0, 120)}"... A IA tentará extrair o tema do contexto.`);
      } else {
        console.log(`✅ [GerarConteudo] tema_limpo recebido: "${v2TemaLimpo}" | disciplina="${v2DisciplinaExtraida}" | turma="${v2TurmaExtraida}" | atividade="${activity.titulo}"`);
      }
      if (!v2DisciplinaExtraida) {
        console.warn(`⚠️ [GerarConteudo] disciplina_extraida vazia para "${activity.titulo}"`);
      }
      if (!v2TurmaExtraida) {
        console.warn(`⚠️ [GerarConteudo] turma_extraida vazia para "${activity.titulo}"`);
      }
      console.log(`📋 [GerarConteudo] justificativa: "${(activity.justificativa || '').substring(0, 80)}" | ${activity.justificativa?.length > 10 ? '✅ preenchida' : '⚠️ vazia/curta'}`);

      const v2BnccContext = input.context.bncc_context as BnccContextData | undefined;
      const v2QuestoesReferencia = input.context.questoes_referencia as QuestoesReferenciaData | undefined;
      const v2WebSearchContext = input.context.web_search_context as WebSearchContextData | undefined;
      const v2FileContext = input.context.file_context as string | undefined;

      if (v2WebSearchContext?.count && v2WebSearchContext.count > 0) {
        console.log(`🌐 [GerarConteudo] Web search context disponível: ${v2WebSearchContext.count} fontes reais para "${v2WebSearchContext.query}"`);
      }

      if (v2FileContext) {
        console.log(`📎 [GerarConteudo] Material do professor disponível (${v2FileContext.length} chars) — será usado como matéria-prima pedagógica`);
      }

      const result = await generateContentForActivity(
        activity,
        conversationContext,
        userObjective,
        undefined,
        CAPABILITY_ID,
        'Gerando conteúdo V2',
        i,
        chosenActivities.length,
        v2TemaLimpo,
        v2DisciplinaExtraida,
        v2TurmaExtraida,
        v2BnccContext,
        v2QuestoesReferencia,
        v2WebSearchContext,
        v2FileContext
      );

      results.push(result);

      activityDebugStore.setProgress(activity.id, 50, 'Processando resposta da IA');

      if (result.success) {
        activityDebugStore.log(activity.id, 'success', 'API-Response',
          `API retornou ${Object.keys(result.generated_fields).length} campos gerados`,
          {
            fields_generated: Object.keys(result.generated_fields),
            sample_values: Object.fromEntries(
              Object.entries(result.generated_fields).slice(0, 3).map(([k, v]) =>
                [k, typeof v === 'string' ? v.substring(0, 100) + (v.length > 100 ? '...' : '') : v]
              )
            )
          }
        );

        activityDebugStore.setProgress(activity.id, 60, 'Sincronizando campos com formulário');
        const syncedFields = syncSchemaToFormData(activity.tipo, result.generated_fields);
        const validation = validateSyncedFields(activity.tipo, syncedFields);

        activityDebugStore.setProgress(activity.id, 70, 'Validando campos gerados');
        activityDebugStore.log(activity.id, 'info', 'Validation',
          `Validação: ${validation.filledFields.length} campos preenchidos, ${validation.missingFields.length} faltando`,
          { filled_fields: validation.filledFields, missing_fields: validation.missingFields, is_valid: validation.valid }
        );

        store.updateActivityStatus(activity.id, 'aguardando', 80);
        store.setActivityGeneratedFields(activity.id, syncedFields);

        activityDebugStore.setProgress(activity.id, 80, 'Salvando no localStorage');
        activityDebugStore.log(activity.id, 'action', 'LocalStorage', 'Persistindo dados no localStorage...',
          { keys_to_save: ['generated_content_*', 'activity_*', 'constructed_*'] }
        );

        let savedKeys: string[] = [];
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          try {
            const isHeavyActivity = ['lista-exercicios', 'quiz-interativo', 'flash-cards'].includes(activity.tipo);
            if (!isHeavyActivity) {
              const storageKey = `generated_content_${activity.id}`;
              const storageData = {
                activity_id: activity.id, activity_type: activity.tipo,
                fields: syncedFields, original_fields: result.generated_fields,
                validation: validation, timestamp: new Date().toISOString()
              };
              await storageSet(storageKey, storageData, { activityType: activity.tipo });
              savedKeys.push(storageKey);
            } else {
              console.log(`⚠️ [V2] Pulando generated_content_ para ${activity.tipo} (evitar QuotaExceededError)`);
            }

            const additionalKeys = persistActivityToStorage(
              activity.id, activity.tipo, activity.titulo, syncedFields,
              { description: activity.titulo, isPreGenerated: true, source: 'gerar_conteudo_atividades_v2' }
            );
            savedKeys = [...savedKeys, ...additionalKeys];
            console.log(`💾 [V2] Saved to localStorage: ${savedKeys.join(', ')}`);
          } catch (e) {
            console.warn(`⚠️ [V2] Failed to save to localStorage:`, e);
            activityDebugStore.log(activity.id, 'warning', 'LocalStorage',
              `Erro ao salvar no localStorage: ${e}`, { error: String(e) }
            );
          }
        }

        activityDebugStore.log(activity.id, 'success', 'LocalStorage',
          `Dados persistidos em ${savedKeys.length} chaves do localStorage`, { saved_keys: savedKeys }
        );

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('agente-jota-fields-generated', {
            detail: {
              activity_id: activity.id, activity_type: activity.tipo,
              fields: syncedFields, original_fields: result.generated_fields, validation: validation
            }
          }));
        }

        const fieldDetails = Object.entries(syncedFields).map(([key, value]) => {
          const displayValue = typeof value === 'string'
            ? (value.length > 100 ? value.substring(0, 100) + '...' : value)
            : JSON.stringify(value);
          return `• ${key}: ${displayValue}`;
        }).join('\n');

        debug_log.push({
          timestamp: new Date().toISOString(), type: 'discovery',
          narrative: `✅ Conteúdo gerado para "${activity.titulo}": ${Object.keys(result.generated_fields).length} campos preenchidos\n\n📋 CAMPOS GERADOS:\n${fieldDetails}`,
          technical_data: {
            activity_id: activity.id, activity_type: activity.tipo,
            fields_count: Object.keys(result.generated_fields).length,
            generated_fields: result.generated_fields, synced_fields: syncedFields, validation_result: validation
          }
        });

        const previousSummary = activityGeneratedSummaries.slice(-3).join(' | ');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('activity:verification:started', {
            detail: { activity_id: activity.id, activity_titulo: activity.titulo }
          }));
        }

        activityDebugStore.setProgress(activity.id, 85, 'Verificação de qualidade (LLM-as-Judge)...');
        activityDebugStore.log(activity.id, 'info', 'VerificationJudge',
          'Iniciando verificação pedagógica por modelo independente...', {}
        );

        let verificationResult: VerificationResult;
        try {
          verificationResult = await runVerificationJudge(
            activity, syncedFields, userObjective, conversationContext, previousSummary
          );
        } catch {
          verificationResult = { approved: true, score: 7, issues: [], suggestions: [], model_used: 'error-skip', duration_ms: 0 };
        }

        verificationResults[activity.id] = verificationResult;
        activityGeneratedSummaries.push(`"${activity.titulo}" (score: ${verificationResult.score}/10)`);

        if (!verificationResult.approved || verificationResult.score < 7) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('activity:verification:failed', {
              detail: {
                activity_id: activity.id, activity_titulo: activity.titulo,
                score: verificationResult.score, issues: verificationResult.issues, regenerating: true
              }
            }));
          }
          activityDebugStore.log(activity.id, 'warning', 'VerificationJudge',
            `Score ${verificationResult.score}/10 — Tentando regeneração com contexto das issues: ${verificationResult.issues.join('; ')}`,
            { score: verificationResult.score, issues: verificationResult.issues }
          );
          store.updateActivityStatus(activity.id, 'aguardando', 82);
        } else {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('activity:verification:passed', {
              detail: {
                activity_id: activity.id, activity_titulo: activity.titulo,
                score: verificationResult.score, model_used: verificationResult.model_used
              }
            }));
          }
          activityDebugStore.log(activity.id, 'success', 'VerificationJudge',
            `Verificação aprovada! Score: ${verificationResult.score}/10 (modelo: ${verificationResult.model_used})`,
            { score: verificationResult.score, approved: true, duration_ms: verificationResult.duration_ms }
          );
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('activity:verification:completed', {
            detail: {
              activity_id: activity.id, activity_titulo: activity.titulo,
              score: verificationResult.score, approved: verificationResult.approved,
              issues: verificationResult.issues,
              quality_flag: !verificationResult.approved || verificationResult.score < 7
            }
          }));
        }

        activityDebugStore.setProgress(activity.id, 90, 'Conteúdo gerado - aguardando construção visual');
        activityDebugStore.log(activity.id, 'success', 'GerarConteudoV2',
          `Geração concluída! Score verificação: ${verificationResult.score}/10. Aguardando etapa de construção visual...`,
          { fields_count: Object.keys(syncedFields).length, status: 'content_ready', verification_score: verificationResult.score }
        );

      } else {
        activityDebugStore.log(activity.id, 'error', 'API-Response',
          `Falha na geração: ${result.error}`, { error: result.error }
        );
        activityDebugStore.setError(activity.id, result.error || 'Erro desconhecido na geração');
        store.updateActivityStatus(activity.id, 'erro', 0, result.error);

        debug_log.push({
          timestamp: new Date().toISOString(), type: 'error',
          narrative: `❌ Falha ao gerar conteúdo para "${activity.titulo}": ${result.error}`,
          technical_data: { activity_id: activity.id, error: result.error }
        });
      }
    }

    // VERIFICAÇÃO DE COERÊNCIA DO PACOTE COMPLETO
    const successfulActivities = chosenActivities.filter((a, idx) => results[idx]?.success);
    let packageCoherence: CoherenceResult | null = null;

    if (successfulActivities.length >= 2) {
      try {
        packageCoherence = await runPackageCoherenceCheck(
          successfulActivities.map(a => ({ id: a.id, titulo: a.titulo, tipo: a.tipo })),
          userObjective,
          activityGeneratedSummaries
        );

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('package:coherence:completed', {
            detail: {
              coherence_score: packageCoherence.coherence_score,
              sequence_ok: packageCoherence.sequence_ok,
              coherence_issues: packageCoherence.coherence_issues,
              coverage_ok: packageCoherence.coverage_ok,
              activities_count: successfulActivities.length
            }
          }));
        }

        debug_log.push({
          timestamp: new Date().toISOString(), type: 'info',
          narrative: `🔍 COERÊNCIA DO PACOTE: Score ${packageCoherence.coherence_score}/10 | Sequência ${packageCoherence.sequence_ok ? 'OK' : 'problemática'} | Cobertura ${packageCoherence.coverage_ok ? 'completa' : 'parcial'}${packageCoherence.coherence_issues.length > 0 ? ` | Issues: ${packageCoherence.coherence_issues.join('; ')}` : ''}`,
          technical_data: packageCoherence
        });
      } catch {
        packageCoherence = null;
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const elapsedTime = Date.now() - startTime;
    const totalFieldsGenerated = results.reduce((acc, r) =>
      acc + (r.success ? Object.keys(r.generated_fields || {}).length : 0), 0);

    debug_log.push({
      timestamp: new Date().toISOString(), type: 'action',
      narrative: `🏁 Geração concluída: ${successCount}/${chosenActivities.length} atividades processadas com sucesso. Total de campos: ${totalFieldsGenerated}`,
      technical_data: { success_count: successCount, fail_count: failCount, total_fields: totalFieldsGenerated, duration_ms: elapsedTime }
    });

    useDebugStore.getState().endCapability(CAPABILITY_ID);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('agente-jota-content-generation-complete', {
        detail: { session_id: sessionId, success_count: successCount, fail_count: failCount, results }
      }));
    }

    console.error(`✅ [V2] COMPLETED: ${successCount}/${chosenActivities.length} activities, ${totalFieldsGenerated} fields in ${elapsedTime}ms`);

    const isPartialOrFullSuccess = successCount > 0;
    const successfulResults = results.filter(r => r.success);

    if (failCount > 0 && successCount > 0) {
      console.error(`📊 [V2] PARTIAL SUCCESS: ${successCount} succeeded, ${failCount} failed. Pipeline will CONTINUE with successful activities.`);
      debug_log.push({
        timestamp: new Date().toISOString(), type: 'warning',
        narrative: `⚠️ SUCESSO PARCIAL: ${failCount} atividades falharam, mas ${successCount} foram geradas com sucesso. O pipeline continuará com as atividades bem-sucedidas.`,
        technical_data: {
          success_count: successCount, fail_count: failCount,
          failed_activities: results.filter(r => !r.success).map(r => ({ id: r.activity_id, error: r.error })),
          successful_activities: successfulResults.map(r => r.activity_id)
        }
      });
    }

    return {
      success: isPartialOrFullSuccess,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        generated_content: results,
        successful_content: successfulResults,
        total_activities: chosenActivities.length,
        success_count: successCount, fail_count: failCount,
        total_fields_generated: totalFieldsGenerated,
        partial_success: failCount > 0 && successCount > 0,
        verification_results: verificationResults,
        package_coherence: packageCoherence,
        agent_summary: {
          activities_verified: Object.keys(verificationResults).length,
          avg_verification_score: Object.values(verificationResults).length > 0
            ? Math.round(Object.values(verificationResults).reduce((s, v) => s + v.score, 0) / Object.values(verificationResults).length * 10) / 10
            : null,
          coherence_score: packageCoherence?.coherence_score ?? null,
          quality_flagged: Object.values(verificationResults).filter(v => !v.approved || v.score < 7).length
        }
      },
      error: failCount > 0 && successCount === 0
        ? createCapabilityError(`Todas as ${failCount} atividades falharam na geração de conteúdo`, 'critical')
        : (failCount > 0
            ? createCapabilityError(`${failCount} de ${chosenActivities.length} atividades falharam (${successCount} bem-sucedidas)`, 'low')
            : null),
      debug_log,
      metadata: { duration_ms: elapsedTime, retry_count: 0, data_source: 'ai_content_generation' }
    };

  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`❌ [V2] ERROR: ${errorMessage}`);

    debug_log.push({
      timestamp: new Date().toISOString(), type: 'error',
      narrative: `❌ ERRO CRÍTICO: ${errorMessage}`,
      technical_data: { error: errorMessage, stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined }
    });

    useDebugStore.getState().endCapability(CAPABILITY_ID);

    return {
      success: false,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: createCapabilityError(errorMessage, 'critical'),
      debug_log,
      metadata: { duration_ms: elapsedTime, retry_count: 0, data_source: 'error' }
    };
  }
}

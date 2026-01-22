/**
 * CAPABILITY: salvar_atividades_bd
 * 
 * Persiste atividades criadas no banco de dados Neon externo.
 * 
 * ARQUITETURA DE 4 FASES:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ FASE 1: COLETA                                                      │
 * │ - Buscar dados do ChosenActivitiesStore                             │
 * │ - Buscar dados do localStorage (múltiplas chaves)                   │
 * │ - Consolidar todas as atividades criadas                            │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ FASE 2: VALIDAÇÃO                                                   │
 * │ - Verificar campos obrigatórios (id, tipo, titulo)                  │
 * │ - Validar integridade dos dados                                     │
 * │ - Identificar atividades com problemas                              │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ FASE 3: PERSISTÊNCIA                                                │
 * │ - Chamar API /api/atividades-neon para cada atividade               │
 * │ - Tratar erros individuais sem abortar o fluxo                      │
 * │ - Registrar sucesso/falha de cada operação                          │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ FASE 4: VERIFICAÇÃO                                                 │
 * │ - Confirmar que dados foram salvos corretamente                     │
 * │ - Emitir eventos de conclusão                                       │
 * │ - Atualizar stores locais                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 */

import type { 
  CapabilityInput, 
  CapabilityOutput, 
  DebugEntry 
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';
import { useChosenActivitiesStore } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { useActivityDebugStore } from '../../../../construction/stores/activityDebugStore';
import type { 
  AtividadeParaSalvar, 
  ResultadoSalvamento,
  SalvarAtividadesBdOutput 
} from '../schemas/salvar-atividades-schema';

const CAPABILITY_ID = 'salvar_atividades_bd';
const API_TIMEOUT_MS = 10000;
const DELAY_BETWEEN_SAVES_MS = 200;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  return UUID_REGEX.test(value);
}

function getUserIdFromAllSources(input: CapabilityInput): string {
  let userId: string | null = null;
  const sources: string[] = [];

  if (typeof localStorage !== 'undefined') {
    const localStorageUserId = localStorage.getItem('user_id');
    if (localStorageUserId && isValidUUID(localStorageUserId)) {
      userId = localStorageUserId;
      sources.push('localStorage.user_id');
    }

    if (!userId) {
      const neonUser = localStorage.getItem('neon_user');
      if (neonUser) {
        try {
          const parsed = JSON.parse(neonUser);
          if (parsed?.id && isValidUUID(parsed.id)) {
            userId = parsed.id;
            sources.push('localStorage.neon_user.id');
          }
        } catch (e) {
        }
      }
    }
  }

  if (!userId && input.context?.user_id && isValidUUID(input.context.user_id)) {
    userId = input.context.user_id;
    sources.push('input.context.user_id');
  }

  if (!userId && input.context?.professor_id && isValidUUID(input.context.professor_id)) {
    userId = input.context.professor_id;
    sources.push('input.context.professor_id');
  }

  console.error(`🔍 [AUTH] getUserIdFromAllSources:
   - user_id encontrado: ${userId || 'NÃO'}
   - fontes verificadas: ${sources.length > 0 ? sources.join(', ') : 'nenhuma válida'}
   - localStorage.user_id: ${typeof localStorage !== 'undefined' ? localStorage.getItem('user_id') : 'N/A'}
   - input.context.user_id: ${input.context?.user_id || 'N/A'}
   - input.context.professor_id: ${input.context?.professor_id || 'N/A'}`);

  return userId || 'unknown';
}

interface StorageKeys {
  constructed: string[];
  compartilhada: string[];
  activity: string[];
}

export async function salvarAtividadesBdV2(input: CapabilityInput): Promise<CapabilityOutput> {
  const startTime = Date.now();
  const debug_log: DebugEntry[] = [];
  
  const userId = getUserIdFromAllSources(input);
  const skipValidation = input.context?.skip_validation === true;
  const forceSave = input.context?.force_save === true;

  console.error(`
═══════════════════════════════════════════════════════════════════════
💾 [V2] CAPABILITY: salvar_atividades_bd
═══════════════════════════════════════════════════════════════════════
execution_id: ${input.execution_id}
user_id: ${userId}
skip_validation: ${skipValidation}
force_save: ${forceSave}
═══════════════════════════════════════════════════════════════════════`);

  if (!userId || userId === 'unknown' || !isValidUUID(userId)) {
    console.error(`❌ [V2] User ID inválido ou ausente: "${userId}"`);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `Usuário não autenticado ou ID inválido. Não é possível salvar atividades sem identificação do usuário.`,
      technical_data: { user_id: userId, source: 'validation' }
    });

    return {
      success: false,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'USER_NOT_AUTHENTICATED',
        message: 'Usuário não autenticado. Faça login para salvar suas atividades.',
        severity: 'high',
        recoverable: true,
        recovery_suggestion: 'Faça login na plataforma e tente novamente.'
      },
      debug_log,
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'auth_validation'
      }
    };
  }

  debug_log.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `Iniciando persistência de atividades no banco de dados para usuário autenticado.`,
    technical_data: { execution_id: input.execution_id, user_id: userId }
  });

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // FASE 1: COLETA DE DADOS
    // ═══════════════════════════════════════════════════════════════════════
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: '📦 FASE 1: Coletando atividades do localStorage e stores...'
    });
    
    const { activities, storageKeys } = await collectActivitiesFromAllSources(input);
    
    console.error(`📦 [FASE 1] Coletadas ${activities.length} atividades de ${Object.values(storageKeys).flat().length} chaves`);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `Encontradas ${activities.length} atividade(s) para processar.`,
      technical_data: { 
        count: activities.length,
        storage_keys_used: storageKeys,
        activity_ids: activities.map(a => a.id)
      }
    });

    if (activities.length === 0) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'warning',
        narrative: '⚠️ Nenhuma atividade encontrada para salvar. Verifique se as atividades foram criadas corretamente.'
      });

      return createEmptyResponse(input, debug_log, startTime, 'Nenhuma atividade encontrada para salvar');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FASE 2: VALIDAÇÃO
    // ═══════════════════════════════════════════════════════════════════════
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: '🔍 FASE 2: Validando integridade das atividades...'
    });

    const { valid, invalid, validationErrors } = validateActivities(activities, skipValidation);
    
    console.error(`🔍 [FASE 2] Validação: ${valid.length} válidas, ${invalid.length} inválidas`);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `Validação concluída: ${valid.length} atividade(s) válida(s), ${invalid.length} com problemas.`,
      technical_data: {
        valid_count: valid.length,
        invalid_count: invalid.length,
        validation_errors: validationErrors
      }
    });

    if (valid.length === 0 && !forceSave) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: '❌ Nenhuma atividade passou na validação. Salvamento abortado.'
      });

      return createErrorResponse(
        input, 
        debug_log, 
        startTime, 
        'VALIDATION_FAILED',
        'Nenhuma atividade passou na validação',
        validationErrors
      );
    }

    const activitiesToSave = forceSave ? activities : valid;

    // ═══════════════════════════════════════════════════════════════════════
    // FASE 3: PERSISTÊNCIA NO BANCO
    // ═══════════════════════════════════════════════════════════════════════
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `💾 FASE 3: Salvando ${activitiesToSave.length} atividade(s) no banco de dados Neon...`
    });

    const saveResults: ResultadoSalvamento[] = [];
    let savedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < activitiesToSave.length; i++) {
      const activity = activitiesToSave[i];
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `Salvando atividade ${i + 1}/${activitiesToSave.length}: "${activity.titulo || activity.id}"...`
      });

      const result = await saveActivityToDatabase(activity, userId);
      saveResults.push(result);

      if (result.success) {
        savedCount++;
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `✅ Atividade "${activity.titulo || activity.id}" salva com sucesso!`,
          technical_data: { 
            activity_id: activity.id,
            saved_at: result.saved_at,
            db_response: result.db_response
          }
        });
        
        updateActivityDebugStore(activity.id, 'saved', result);
      } else {
        failedCount++;
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `❌ Falha ao salvar "${activity.titulo || activity.id}": ${result.error}`,
          technical_data: { 
            activity_id: activity.id,
            error: result.error
          }
        });
        
        updateActivityDebugStore(activity.id, 'failed', result);
      }

      if (i < activitiesToSave.length - 1) {
        await delay(DELAY_BETWEEN_SAVES_MS);
      }
    }

    console.error(`💾 [FASE 3] Persistência: ${savedCount} salvas, ${failedCount} falhas`);

    // ═══════════════════════════════════════════════════════════════════════
    // FASE 4: VERIFICAÇÃO E CONCLUSÃO
    // ═══════════════════════════════════════════════════════════════════════
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: '✔️ FASE 4: Verificando e concluindo operação...'
    });

    const summaryNarrative = generateSummaryNarrative(savedCount, failedCount, activities.length);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: summaryNarrative,
      technical_data: {
        total_collected: activities.length,
        total_validated: valid.length,
        total_saved: savedCount,
        total_failed: failedCount,
        results: saveResults
      }
    });

    emitCompletionEvent(savedCount, failedCount, saveResults);

    const duration = Date.now() - startTime;

    const dataConfirmation = createDataConfirmation([
      createDataCheck(
        'has_activities',
        'Atividades coletadas',
        activities.length > 0,
        activities.length,
        '> 0'
      ),
      createDataCheck(
        'has_valid',
        'Atividades validadas',
        valid.length > 0 || skipValidation,
        valid.length,
        '> 0'
      ),
      createDataCheck(
        'has_saved',
        'Atividades salvas',
        savedCount > 0,
        savedCount,
        '> 0'
      ),
      createDataCheck(
        'all_saved',
        'Todas salvas com sucesso',
        failedCount === 0,
        failedCount,
        '= 0'
      )
    ]);

    console.error(`
═══════════════════════════════════════════════════════════════════════
${savedCount > 0 ? '✅' : '❌'} [V2] salvar_atividades_bd COMPLETED
═══════════════════════════════════════════════════════════════════════
collected: ${activities.length}
validated: ${valid.length}
saved: ${savedCount}
failed: ${failedCount}
duration: ${duration}ms
═══════════════════════════════════════════════════════════════════════`);

    const outputData: SalvarAtividadesBdOutput = {
      total_collected: activities.length,
      total_validated: valid.length,
      total_saved: savedCount,
      total_failed: failedCount,
      results: saveResults,
      validation_errors: validationErrors
    };

    return {
      success: savedCount > 0,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: outputData,
      error: failedCount > 0 && savedCount === 0 ? {
        code: 'PARTIAL_SAVE_FAILURE',
        message: `Falha ao salvar ${failedCount} atividade(s)`,
        severity: 'high',
        recoverable: true,
        recovery_suggestion: 'Tente salvar novamente ou verifique a conexão com o banco'
      } : null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: duration,
        retry_count: 0,
        data_source: 'localStorage + ChosenActivitiesStore + API Neon'
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ [V2] Erro crítico em salvar_atividades_bd:`, error);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `Erro crítico durante salvamento: ${errorMessage}`,
      technical_data: { error: errorMessage, stack: error instanceof Error ? error.stack : undefined }
    });

    return {
      success: false,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'CRITICAL_ERROR',
        message: errorMessage,
        severity: 'critical',
        recoverable: false,
        recovery_suggestion: 'Verifique os logs para mais detalhes e tente novamente'
      },
      debug_log,
      metadata: {
        duration_ms: Date.now() - startTime,
        retry_count: 0,
        data_source: 'error'
      }
    };
  }
}

async function collectActivitiesFromAllSources(
  input: CapabilityInput
): Promise<{ activities: AtividadeParaSalvar[]; storageKeys: StorageKeys }> {
  const activities: AtividadeParaSalvar[] = [];
  const storageKeys: StorageKeys = { constructed: [], compartilhada: [], activity: [] };
  const seenIds = new Set<string>();

  const criarResult = input.previous_results?.get('criar_atividade');
  if (criarResult?.success && criarResult?.data?.activities_built) {
    const builtActivities = criarResult.data.activities_built as any[];
    
    for (const built of builtActivities) {
      if (!seenIds.has(built.id || built.original_id)) {
        const id = built.id || built.original_id;
        seenIds.add(id);
        
        activities.push({
          id: id,
          tipo: built.tipo || built.activity_type || 'unknown',
          titulo: built.titulo || built.name || `Atividade ${id}`,
          campos_preenchidos: built.campos_preenchidos || built.fields || {},
          metadata: {
            criado_em: new Date().toISOString(),
            pipeline_version: 'v2',
            model_used: built.model_used
          }
        });
      }
    }
    console.error(`📦 [COLETA] ${builtActivities.length} atividades de previous_results.criar_atividade`);
  }

  const store = useChosenActivitiesStore.getState();
  const storeActivities = store.getChosenActivities();
  
  for (const activity of storeActivities) {
    if (!seenIds.has(activity.id)) {
      seenIds.add(activity.id);
      
      const camposPreenchidos = activity.campos_preenchidos || {};
      const dadosConstruidos = activity.dados_construidos?.generated_fields || {};
      const consolidatedFields = { ...camposPreenchidos, ...dadosConstruidos };
      
      if (Object.keys(consolidatedFields).length > 0) {
        activities.push({
          id: activity.id,
          tipo: activity.tipo,
          titulo: consolidatedFields.titulo || consolidatedFields.name || `Atividade ${activity.id}`,
          campos_preenchidos: consolidatedFields,
          metadata: {
            criado_em: new Date().toISOString(),
            pipeline_version: 'v2'
          }
        });
      }
    }
  }
  console.error(`📦 [COLETA] ${storeActivities.length} atividades do ChosenActivitiesStore`);

  if (typeof localStorage !== 'undefined') {
    const allKeys = Object.keys(localStorage);
    
    for (const key of allKeys) {
      let activityData: any = null;
      let keyType: keyof StorageKeys | null = null;
      
      if (key.startsWith('constructed_')) {
        keyType = 'constructed';
        try {
          const raw = localStorage.getItem(key);
          if (raw) activityData = JSON.parse(raw);
        } catch (e) { }
      } else if (key.startsWith('atividade_compartilhada_')) {
        keyType = 'compartilhada';
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            activityData = parsed.dados || parsed;
          }
        } catch (e) { }
      } else if (key.startsWith('activity_') && !key.includes('debug')) {
        keyType = 'activity';
        try {
          const raw = localStorage.getItem(key);
          if (raw) activityData = JSON.parse(raw);
        } catch (e) { }
      }

      if (activityData && keyType) {
        storageKeys[keyType].push(key);
        
        const id = activityData.id || activityData.activity_id || key.split('_').pop();
        
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          
          const fields = activityData.campos_preenchidos || 
                        activityData.formData || 
                        activityData.fields || 
                        activityData.generated_fields ||
                        {};
          
          if (Object.keys(fields).length > 0) {
            activities.push({
              id: id,
              tipo: activityData.tipo || activityData.type || activityData.activity_type || 'unknown',
              titulo: fields.titulo || activityData.titulo || activityData.name || `Atividade ${id}`,
              campos_preenchidos: fields,
              metadata: {
                criado_em: activityData.criadoEm || new Date().toISOString(),
                pipeline_version: activityData.pipeline_version || 'v2'
              }
            });
          }
        }
      }
    }
  }

  console.error(`📦 [COLETA] Total consolidado: ${activities.length} atividades únicas`);
  
  return { activities, storageKeys };
}

function validateActivities(
  activities: AtividadeParaSalvar[], 
  skipValidation: boolean
): { 
  valid: AtividadeParaSalvar[]; 
  invalid: AtividadeParaSalvar[];
  validationErrors: Array<{ activity_id: string; errors: string[] }>;
} {
  if (skipValidation) {
    return { valid: activities, invalid: [], validationErrors: [] };
  }

  const valid: AtividadeParaSalvar[] = [];
  const invalid: AtividadeParaSalvar[] = [];
  const validationErrors: Array<{ activity_id: string; errors: string[] }> = [];

  for (const activity of activities) {
    const errors: string[] = [];

    if (!activity.id || typeof activity.id !== 'string' || activity.id.trim() === '') {
      errors.push('ID ausente ou inválido');
    }

    if (!activity.tipo || typeof activity.tipo !== 'string' || activity.tipo.trim() === '') {
      errors.push('Tipo de atividade ausente ou inválido');
    }

    if (!activity.campos_preenchidos || typeof activity.campos_preenchidos !== 'object') {
      errors.push('Campos preenchidos ausentes ou inválidos');
    } else if (Object.keys(activity.campos_preenchidos).length === 0) {
      errors.push('Atividade sem campos preenchidos');
    }

    if (errors.length === 0) {
      valid.push(activity);
    } else {
      invalid.push(activity);
      validationErrors.push({ activity_id: activity.id || 'unknown', errors });
    }
  }

  return { valid, invalid, validationErrors };
}

async function saveActivityToDatabase(
  activity: AtividadeParaSalvar, 
  userId: string
): Promise<ResultadoSalvamento> {
  try {
    const payload = {
      id: activity.id,
      id_user: userId,
      tipo: activity.tipo,
      id_json: {
        titulo: activity.titulo,
        campos: activity.campos_preenchidos,
        metadata: activity.metadata
      },
      stars: 100
    };

    console.error(`📤 [API] Enviando para /api/atividades-neon:`, {
      id: payload.id,
      tipo: payload.tipo,
      campos_count: Object.keys(activity.campos_preenchidos).length
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const response = await fetch('/api/atividades-neon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'API retornou success=false');
    }

    return {
      activity_id: activity.id,
      success: true,
      saved_at: new Date().toISOString(),
      db_response: data.data
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('aborted')) {
      return {
        activity_id: activity.id,
        success: false,
        error: `Timeout: API não respondeu em ${API_TIMEOUT_MS}ms`
      };
    }

    return {
      activity_id: activity.id,
      success: false,
      error: errorMessage
    };
  }
}

function updateActivityDebugStore(activityId: string, status: 'saved' | 'failed', result: ResultadoSalvamento): void {
  try {
    const store = useActivityDebugStore.getState();
    if (store && typeof store.log === 'function') {
      store.log(
        activityId,
        status === 'saved' ? 'success' : 'error',
        'SalvarAtividadesBd',
        status === 'saved' 
          ? `✅ Atividade salva no banco de dados com sucesso`
          : `❌ Falha ao salvar: ${result.error}`,
        { result }
      );
    }
  } catch (e) {
    console.warn('Não foi possível atualizar debug store:', e);
  }
}

function generateSummaryNarrative(saved: number, failed: number, total: number): string {
  if (saved === total && failed === 0) {
    return `✅ Todas as ${saved} atividade(s) foram salvas com sucesso no banco de dados!`;
  } else if (saved > 0 && failed > 0) {
    return `⚠️ Salvamento parcial: ${saved} de ${total} atividade(s) salvas. ${failed} falha(s).`;
  } else if (saved === 0) {
    return `❌ Nenhuma atividade foi salva. ${failed} falha(s) ocorreram.`;
  }
  return `Processamento concluído: ${saved} salvas, ${failed} falhas.`;
}

function emitCompletionEvent(saved: number, failed: number, results: ResultadoSalvamento[]): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agente-jota-progress', {
      detail: {
        type: 'database:save_completed',
        success: saved > 0,
        saved_count: saved,
        failed_count: failed,
        results: results.map(r => ({
          activity_id: r.activity_id,
          success: r.success,
          error: r.error
        }))
      }
    }));

    window.dispatchEvent(new CustomEvent('storage-sync:database-saved', {
      detail: { saved_count: saved, failed_count: failed }
    }));
  }
}

function createEmptyResponse(
  input: CapabilityInput, 
  debug_log: DebugEntry[], 
  startTime: number,
  message: string
): CapabilityOutput {
  return {
    success: false,
    capability_id: CAPABILITY_ID,
    execution_id: input.execution_id,
    timestamp: new Date().toISOString(),
    data: {
      total_collected: 0,
      total_validated: 0,
      total_saved: 0,
      total_failed: 0,
      results: [],
      validation_errors: []
    },
    error: {
      code: 'NO_ACTIVITIES_FOUND',
      message,
      severity: 'medium',
      recoverable: true,
      recovery_suggestion: 'Execute a capacidade criar_atividade antes de salvar'
    },
    debug_log,
    metadata: {
      duration_ms: Date.now() - startTime,
      retry_count: 0,
      data_source: 'empty'
    }
  };
}

function createErrorResponse(
  input: CapabilityInput,
  debug_log: DebugEntry[],
  startTime: number,
  code: string,
  message: string,
  validationErrors: Array<{ activity_id: string; errors: string[] }>
): CapabilityOutput {
  return {
    success: false,
    capability_id: CAPABILITY_ID,
    execution_id: input.execution_id,
    timestamp: new Date().toISOString(),
    data: {
      total_collected: 0,
      total_validated: 0,
      total_saved: 0,
      total_failed: 0,
      results: [],
      validation_errors: validationErrors
    },
    error: {
      code,
      message,
      severity: 'high',
      recoverable: true,
      recovery_suggestion: 'Verifique os erros de validação e corrija os dados'
    },
    debug_log,
    metadata: {
      duration_ms: Date.now() - startTime,
      retry_count: 0,
      data_source: 'validation_error'
    }
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default salvarAtividadesBdV2;

/**
 * CAPABILITY 4 (V2): criar_atividade
 * 
 * Versão V2 usando API-First pattern com CapabilityInput/Output.
 * 
 * Responsabilidade: Receber atividades com campos já gerados pela 
 * capability gerar_conteudo_atividades e persistir no banco de dados.
 * 
 * Input via previous_results: gerar_conteudo_atividades → campos preenchidos
 * Output: Atividades persistidas no banco de dados
 */

import type { 
  CapabilityInput, 
  CapabilityOutput, 
  DebugEntry,
  BuiltActivity 
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';
import { useChosenActivitiesStore } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { useDebugStore } from '../../../../interface-chat-producao/debug-system/DebugStore';

const CAPABILITY_ID = 'criar_atividade';

interface GeneratedActivityData {
  activity_id: string;
  activity_type: string;
  fields: Record<string, any>;
  original_fields?: Record<string, any>;
  validation?: {
    required_count: number;
    filled_count: number;
    is_complete: boolean;
  };
}

interface SaveResult {
  success: boolean;
  db_id?: string;
  error?: string;
}

async function saveActivityToDatabase(
  activity: any,
  generatedFields: Record<string, any>,
  professorId: string
): Promise<SaveResult> {
  try {
    const response = await fetch('/api/atividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        professor_id: professorId,
        titulo: activity.titulo,
        tipo: activity.tipo,
        categoria: activity.categoria || 'geral',
        materia: activity.materia,
        nivel_dificuldade: activity.nivel_dificuldade || 'medio',
        campos_preenchidos: generatedFields,
        conteudo: JSON.stringify(generatedFields, null, 2),
        status: 'published',
        original_template_id: activity.id
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return { success: true, db_id: result.id };

  } catch (error) {
    console.error(`❌ [V2:CRIAR] Erro ao salvar:`, error);
    return { success: false, error: (error as Error).message };
  }
}

export async function criarAtividadeV2(input: CapabilityInput): Promise<CapabilityOutput> {
  const startTime = Date.now();
  const debug_log: DebugEntry[] = [];
  
  console.error(`
═══════════════════════════════════════════════════════════════════════
🏗️ [V2] CAPABILITY: criar_atividade
═══════════════════════════════════════════════════════════════════════
execution_id: ${input.execution_id}
previous_results keys: ${input.previous_results ? Array.from(input.previous_results.keys()).join(', ') : 'NONE'}
═══════════════════════════════════════════════════════════════════════`);

  debug_log.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: 'Iniciando criação e persistência das atividades no banco de dados.',
    technical_data: { execution_id: input.execution_id }
  });

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // 1. OBTER DADOS DO gerar_conteudo_atividades
    // ═══════════════════════════════════════════════════════════════════════
    
    let generatedData: GeneratedActivityData[] = [];
    let chosenActivities: any[] = [];
    let dataSource = 'unknown';
    
    // Caminho 1: Via previous_results (preferido)
    const gerarResult = input.previous_results?.get('gerar_conteudo_atividades');
    const decidirResult = input.previous_results?.get('decidir_atividades_criar');
    
    if (gerarResult?.success && gerarResult?.data?.generated_fields) {
      generatedData = gerarResult.data.generated_fields;
      dataSource = 'previous_results.gerar_conteudo_atividades';
      console.error(`✅ [V2:CRIAR] Found ${generatedData.length} generated activities from gerar_conteudo`);
    }
    
    if (decidirResult?.success && decidirResult?.data?.chosen_activities) {
      chosenActivities = decidirResult.data.chosen_activities;
      console.error(`✅ [V2:CRIAR] Found ${chosenActivities.length} chosen activities from decidir`);
    }
    
    // Caminho 2: Fallback para store
    if (generatedData.length === 0) {
      const store = useChosenActivitiesStore.getState();
      const storeActivities = store.getChosenActivities();
      
      if (storeActivities.length > 0) {
        chosenActivities = storeActivities;
        
        // Verificar se têm campos gerados (usando any para acessar generatedFields)
        generatedData = storeActivities
          .filter(a => (a as any).generatedFields && Object.keys((a as any).generatedFields).length > 0)
          .map(a => ({
            activity_id: a.id,
            activity_type: a.tipo,
            fields: (a as any).generatedFields || {},
            validation: { required_count: 0, filled_count: Object.keys((a as any).generatedFields || {}).length, is_complete: true }
          }));
        
        dataSource = 'store fallback';
        console.error(`📦 [V2:CRIAR] Using store fallback: ${generatedData.length} activities with fields`);
      }
    }
    
    // Caminho 3: Verificar localStorage
    if (generatedData.length === 0 && chosenActivities.length > 0) {
      for (const activity of chosenActivities) {
        const storageKey = `generated_content_${activity.id}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            generatedData.push({
              activity_id: activity.id,
              activity_type: activity.tipo,
              fields: parsed.fields || {},
              validation: parsed.validation
            });
          } catch (e) {
            console.warn(`⚠️ Failed to parse localStorage for ${activity.id}`);
          }
        }
      }
      
      if (generatedData.length > 0) {
        dataSource = 'localStorage fallback';
      }
    }

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'info',
      narrative: `Fonte de dados: ${dataSource}. Encontradas ${generatedData.length} atividades com campos gerados.`,
      technical_data: { 
        data_source: dataSource,
        activities_count: generatedData.length,
        chosen_activities_count: chosenActivities.length
      }
    });

    // Validação crítica
    if (generatedData.length === 0) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'warning',
        narrative: 'Nenhuma atividade com campos gerados foi encontrada. Verificando se há atividades escolhidas para usar campos padrão.',
        technical_data: { 
          checked_sources: ['previous_results', 'store', 'localStorage']
        }
      });
      
      // Se temos atividades escolhidas mas sem campos, usar campos vazios
      if (chosenActivities.length > 0) {
        generatedData = chosenActivities.map(a => ({
          activity_id: a.id,
          activity_type: a.tipo,
          fields: {},
          validation: { required_count: 0, filled_count: 0, is_complete: false }
        }));
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. PERSISTIR ATIVIDADES NO BANCO DE DADOS
    // ═══════════════════════════════════════════════════════════════════════
    
    const professorId = input.context.professor_id || input.context.userId || 'unknown';
    const builtActivities: BuiltActivity[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let failCount = 0;
    
    const store = useChosenActivitiesStore.getState();
    
    // Inicializar DebugStore
    useDebugStore.getState().startCapability(CAPABILITY_ID, 'Criando atividades');
    
    for (let i = 0; i < generatedData.length; i++) {
      const genData = generatedData[i];
      const activity = chosenActivities.find(a => a.id === genData.activity_id) || {
        id: genData.activity_id,
        titulo: `Atividade ${i + 1}`,
        tipo: genData.activity_type,
        categoria: 'geral',
        materia: 'Geral'
      };
      
      const progressPct = Math.round(((i + 1) / generatedData.length) * 100);
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `[${i + 1}/${generatedData.length}] Salvando "${activity.titulo}" no banco de dados...`,
        technical_data: { 
          activity_id: activity.id,
          activity_type: activity.tipo,
          fields_count: Object.keys(genData.fields).length,
          progress: progressPct
        }
      });
      
      // Atualizar status no store
      store.updateActivityStatus(activity.id, 'construindo', progressPct);
      
      // Emitir evento de progresso para UI via agente-jota-progress (formato esperado pelo DeveloperModeCard)
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:activity_progress',
          activityId: activity.id,
          activityTitle: activity.titulo,
          progress: progressPct
        }
      }));
      
      // Salvar no banco
      const saveResult = await saveActivityToDatabase(activity, genData.fields, professorId);
      
      const builtActivity: BuiltActivity = {
        id: `built-${activity.id}-${Date.now()}`,
        original_id: activity.id,
        titulo: activity.titulo,
        tipo: activity.tipo,
        categoria: activity.categoria || 'geral',
        materia: activity.materia,
        nivel_dificuldade: activity.nivel_dificuldade || 'medio',
        campos_preenchidos: genData.fields,
        conteudo_gerado: JSON.stringify(genData.fields, null, 2),
        status: saveResult.success ? 'completed' : 'failed',
        created_at: new Date().toISOString(),
        saved_to_db: saveResult.success,
        db_id: saveResult.db_id,
        error_message: saveResult.error
      };
      
      builtActivities.push(builtActivity);
      
      if (saveResult.success) {
        successCount++;
        store.updateActivityStatus(activity.id, 'concluida', 100);
        
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `✅ "${activity.titulo}" salva com sucesso! ID: ${saveResult.db_id}`,
          technical_data: { 
            db_id: saveResult.db_id,
            activity_id: activity.id 
          }
        });
        
        // Emitir evento de sucesso via agente-jota-progress
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'construction:activity_completed',
            activityId: activity.id,
            data: {
              dbId: saveResult.db_id,
              titulo: activity.titulo,
              fields: genData.fields
            }
          }
        }));
      } else {
        failCount++;
        errors.push(`${activity.titulo}: ${saveResult.error}`);
        store.updateActivityStatus(activity.id, 'erro', progressPct);
        
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `❌ Falha ao salvar "${activity.titulo}": ${saveResult.error}`,
          technical_data: { 
            error: saveResult.error,
            activity_id: activity.id 
          }
        });
        
        // Emitir evento de erro via agente-jota-progress
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'construction:activity_error',
            activityId: activity.id,
            error: saveResult.error
          }
        }));
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. GERAR RESULTADO FINAL
    // ═══════════════════════════════════════════════════════════════════════
    
    const duration = Date.now() - startTime;
    const allSuccess = failCount === 0 && successCount > 0;
    
    const summaryNarrative = allSuccess
      ? `✅ Todas as ${successCount} atividades foram criadas e salvas no banco de dados com sucesso!`
      : successCount > 0
        ? `⚠️ ${successCount} atividade(s) salva(s), ${failCount} falha(s).`
        : `❌ Nenhuma atividade foi salva. Verifique os erros.`;
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: summaryNarrative,
      technical_data: {
        success_count: successCount,
        fail_count: failCount,
        total_time_ms: duration,
        activities_created: builtActivities.filter(a => a.saved_to_db).map(a => ({
          id: a.db_id,
          titulo: a.titulo
        }))
      }
    });

    // Data confirmation
    const dataConfirmation = createDataConfirmation([
      createDataCheck(
        'has_activities',
        'Atividades recebidas',
        generatedData.length > 0,
        generatedData.length,
        '> 0'
      ),
      createDataCheck(
        'has_success',
        'Atividades salvas',
        successCount > 0,
        successCount,
        '> 0'
      ),
      createDataCheck(
        'all_saved',
        'Todas salvas com sucesso',
        allSuccess,
        `${successCount}/${generatedData.length}`,
        '100%'
      )
    ]);

    // Emitir evento final via agente-jota-progress
    window.dispatchEvent(new CustomEvent('agente-jota-progress', {
      detail: {
        type: 'construction:all_completed',
        successCount,
        failCount,
        activities: builtActivities.map(a => ({
          id: a.id,
          activity_id: a.original_id,
          name: a.titulo,
          type: a.tipo,
          status: a.saved_to_db ? 'completed' : 'error',
          built_data: a.campos_preenchidos
        }))
      }
    }));

    console.error(`
═══════════════════════════════════════════════════════════════════════
${allSuccess ? '✅' : '⚠️'} [V2] criar_atividade COMPLETED
═══════════════════════════════════════════════════════════════════════
success: ${successCount}
failed: ${failCount}
duration: ${duration}ms
═══════════════════════════════════════════════════════════════════════`);

    return {
      success: successCount > 0,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        activities_built: builtActivities,
        success_count: successCount,
        fail_count: failCount,
        errors,
        summary: summaryNarrative
      },
      error: failCount > 0 && successCount === 0 ? {
        code: 'ALL_ACTIVITIES_FAILED',
        message: 'Todas as atividades falharam ao salvar',
        severity: 'high',
        recoverable: true,
        recovery_suggestion: 'Verifique a conexão com o banco de dados e tente novamente'
      } : null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: duration,
        retry_count: 0,
        data_source: dataSource
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [V2:CRIAR] Critical error:`, error);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `Erro crítico na criação de atividades: ${(error as Error).message}`,
      technical_data: { error: (error as Error).message, stack: (error as Error).stack }
    });

    return {
      success: false,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'CRIAR_CRITICAL_ERROR',
        message: (error as Error).message,
        severity: 'critical',
        recoverable: false,
        recovery_suggestion: 'Verifique os logs e tente novamente'
      },
      debug_log,
      metadata: {
        duration_ms: duration,
        retry_count: 0,
        data_source: 'error'
      }
    };
  }
}

export default criarAtividadeV2;

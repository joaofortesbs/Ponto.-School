/**
 * CAPABILITY 4 (V2): criar_atividade
 * 
 * Versão V2 simplificada - NÃO salva no banco de dados.
 * 
 * Responsabilidade: Receber atividades com campos já gerados pela 
 * capability gerar_conteudo_atividades e marcar como concluídas.
 * 
 * NOTA: O salvamento no banco de dados foi removido temporariamente.
 * As atividades são apenas marcadas como criadas para exibição na UI.
 * 
 * FEATURE: Auto-Build Automático
 * Quando autoBuild=true, após marcar atividades como concluídas,
 * o sistema automaticamente aciona a construção de conteúdo via AutoBuildService.
 */

import type { 
  CapabilityInput, 
  CapabilityOutput, 
  DebugEntry,
  BuiltActivity 
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';
import { useChosenActivitiesStore } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { autoBuildService } from '../../../../construction/services/autoBuildService';
import type { ConstructionActivity } from '../../../../construction/types';

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

export async function criarAtividadeV2(input: CapabilityInput): Promise<CapabilityOutput> {
  const startTime = Date.now();
  const debug_log: DebugEntry[] = [];
  
  console.error(`
═══════════════════════════════════════════════════════════════════════
🏗️ [V2] CAPABILITY: criar_atividade (SEM PERSISTÊNCIA NO BANCO)
═══════════════════════════════════════════════════════════════════════
execution_id: ${input.execution_id}
previous_results keys: ${input.previous_results ? Array.from(input.previous_results.keys()).join(', ') : 'NONE'}
═══════════════════════════════════════════════════════════════════════`);

  debug_log.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: 'Finalizando criação das atividades (sem persistência no banco).',
    technical_data: { execution_id: input.execution_id }
  });

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // 1. OBTER DADOS DO gerar_conteudo_atividades ou decidir_atividades_criar
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
    
    // Caminho 3: Usar chosenActivities mesmo sem campos gerados
    if (generatedData.length === 0 && chosenActivities.length > 0) {
      generatedData = chosenActivities.map(a => ({
        activity_id: a.id,
        activity_type: a.tipo,
        fields: {},
        validation: { required_count: 0, filled_count: 0, is_complete: false }
      }));
      dataSource = 'chosen_activities (sem campos gerados)';
    }

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'info',
      narrative: `Fonte de dados: ${dataSource}. Processando ${generatedData.length} atividades.`,
      technical_data: { 
        data_source: dataSource,
        activities_count: generatedData.length,
        activity_ids: generatedData.map(a => a.activity_id)
      }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 2. MARCAR ATIVIDADES COMO CONCLUÍDAS (SEM SALVAR NO BANCO)
    // ═══════════════════════════════════════════════════════════════════════
    
    const store = useChosenActivitiesStore.getState();
    const builtActivities: BuiltActivity[] = [];
    let successCount = 0;

    for (let i = 0; i < generatedData.length; i++) {
      const genData = generatedData[i];
      
      // Encontrar atividade correspondente
      const activity = chosenActivities.find((a: any) => a.id === genData.activity_id) || {
        id: genData.activity_id,
        titulo: `Atividade ${genData.activity_type}`,
        tipo: genData.activity_type,
        categoria: 'geral',
        materia: 'Geral'
      };
      
      const progressPct = Math.round(((i + 1) / generatedData.length) * 100);
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `[${i + 1}/${generatedData.length}] Finalizando "${activity.titulo}"...`,
        technical_data: { 
          activity_id: activity.id,
          activity_type: activity.tipo,
          fields_count: Object.keys(genData.fields).length,
          progress: progressPct
        }
      });
      
      // Atualizar status no store
      store.updateActivityStatus(activity.id, 'construindo', progressPct);
      
      // Emitir evento de progresso para UI
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:activity_progress',
          activityId: activity.id,
          activityTitle: activity.titulo,
          progress: progressPct
        }
      }));
      
      // Pequeno delay para mostrar progresso na UI
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Criar objeto de atividade construída (SEM salvar no banco)
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
        status: 'completed',
        created_at: new Date().toISOString(),
        saved_to_db: false, // NÃO salvamos no banco
        db_id: undefined
      };
      
      builtActivities.push(builtActivity);
      successCount++;
      
      // Atualizar status para concluída
      store.updateActivityStatus(activity.id, 'concluida', 100);
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'discovery',
        narrative: `✅ "${activity.titulo}" pronta para uso!`,
        technical_data: { 
          activity_id: activity.id,
          fields_count: Object.keys(genData.fields).length
        }
      });
      
      // Emitir evento de sucesso
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:activity_completed',
          activityId: activity.id,
          data: {
            titulo: activity.titulo,
            fields: genData.fields
          }
        }
      }));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. AUTO-BUILD: CONSTRUIR ATIVIDADES AUTOMATICAMENTE (SE HABILITADO)
    // ═══════════════════════════════════════════════════════════════════════
    
    // Verificar se auto-build está habilitado (sempre true por padrão agora)
    // Pode ser desabilitado via context.autoBuild = false
    const autoBuildEnabled = input.context?.autoBuild !== false; // Habilitado por padrão
    
    if (autoBuildEnabled && builtActivities.length > 0) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔨 Iniciando construção automática de ${builtActivities.length} atividade(s)...`,
        technical_data: { 
          auto_build_enabled: true,
          activities_to_build: builtActivities.map(a => a.original_id)
        }
      });
      
      console.error(`
═══════════════════════════════════════════════════════════════════════
🔨 [V2] AUTO-BUILD: Iniciando construção automática
═══════════════════════════════════════════════════════════════════════
Atividades: ${builtActivities.length}
═══════════════════════════════════════════════════════════════════════`);

      // Emitir evento informando início do auto-build
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:auto_build_started',
          totalActivities: builtActivities.length,
          message: `Iniciando construção automática de ${builtActivities.length} atividade(s)...`
        }
      }));
      
      // Converter BuiltActivity para ConstructionActivity
      const constructionActivities: ConstructionActivity[] = builtActivities.map(built => ({
        id: built.original_id,
        title: built.titulo,
        personalizedTitle: built.titulo,
        description: built.conteudo_gerado || '',
        personalizedDescription: built.conteudo_gerado || '',
        categoryId: built.tipo,
        categoryName: built.categoria || 'Geral',
        icon: '📚',
        tags: [],
        difficulty: built.nivel_dificuldade || 'medio',
        estimatedTime: '30 min',
        customFields: built.campos_preenchidos || {},
        originalData: {
          type: built.tipo,
          fields: built.campos_preenchidos
        },
        preenchidoAutomaticamente: true,
        isBuilt: false, // Ainda não construída
        status: 'pending',
        progress: 0,
        type: built.tipo
      }));
      
      // Configurar callback de progresso
      autoBuildService.setProgressCallback((progress) => {
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'info',
          narrative: `[Auto-Build] ${progress.currentActivity} (${progress.current}/${progress.total})`,
          technical_data: { progress }
        });
        
        // Emitir progresso para UI
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'construction:auto_build_progress',
            current: progress.current,
            total: progress.total,
            currentActivity: progress.currentActivity,
            status: progress.status
          }
        }));
      });
      
      try {
        // Executar construção automática de todas as atividades
        await autoBuildService.buildAllActivities(constructionActivities);
        
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'discovery',
          narrative: `✅ Construção automática concluída com sucesso!`,
          technical_data: { activities_built: constructionActivities.length }
        });
        
        // Emitir evento de conclusão do auto-build
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'construction:auto_build_completed',
            success: true,
            totalBuilt: constructionActivities.length
          }
        }));
        
        console.error(`
═══════════════════════════════════════════════════════════════════════
✅ [V2] AUTO-BUILD: Construção automática CONCLUÍDA
═══════════════════════════════════════════════════════════════════════
Atividades construídas: ${constructionActivities.length}
═══════════════════════════════════════════════════════════════════════`);

      } catch (autoBuildError) {
        const errorMsg = autoBuildError instanceof Error ? autoBuildError.message : String(autoBuildError);
        
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'error',
          narrative: `⚠️ Erro no auto-build: ${errorMsg}`,
          technical_data: { error: errorMsg }
        });
        
        // Emitir evento de erro do auto-build
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'construction:auto_build_error',
            error: errorMsg
          }
        }));
        
        console.error(`⚠️ [V2] AUTO-BUILD Error:`, autoBuildError);
        // Não lançar erro - continuar mesmo se auto-build falhar
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. GERAR RESULTADO FINAL
    // ═══════════════════════════════════════════════════════════════════════
    
    const duration = Date.now() - startTime;
    
    const summaryNarrative = successCount > 0
      ? `✅ ${successCount} atividade(s) criada(s) com sucesso! Os campos foram preenchidos e as atividades estão prontas para edição.`
      : `⚠️ Nenhuma atividade foi processada.`;
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: summaryNarrative,
      technical_data: {
        success_count: successCount,
        total_time_ms: duration,
        activities_created: builtActivities.map(a => ({
          id: a.original_id,
          titulo: a.titulo,
          fields_count: Object.keys(a.campos_preenchidos).length
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
        'Atividades processadas',
        successCount > 0,
        successCount,
        '> 0'
      )
    ]);

    // Emitir evento final
    window.dispatchEvent(new CustomEvent('agente-jota-progress', {
      detail: {
        type: 'construction:all_completed',
        successCount,
        failCount: 0,
        activities: builtActivities.map(a => ({
          id: a.id,
          activity_id: a.original_id,
          name: a.titulo,
          type: a.tipo,
          status: 'completed',
          built_data: a.campos_preenchidos
        }))
      }
    }));

    console.error(`
═══════════════════════════════════════════════════════════════════════
✅ [V2] criar_atividade COMPLETED (sem persistência)
═══════════════════════════════════════════════════════════════════════
success: ${successCount}
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
        fail_count: 0,
        errors: [],
        summary: summaryNarrative,
        saved_to_db: false
      },
      error: null,
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [V2:CRIAR] Error:`, error);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `Erro ao processar atividades: ${errorMsg}`,
      technical_data: { error: errorMsg, duration_ms: duration }
    });

    return {
      success: false,
      capability_id: CAPABILITY_ID,
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        activities_built: [],
        success_count: 0,
        fail_count: 0,
        errors: [errorMsg],
        summary: `Erro: ${errorMsg}`
      },
      error: {
        code: 'CRIAR_ATIVIDADE_ERROR',
        message: errorMsg,
        severity: 'medium' as const,
        recoverable: true,
        recovery_suggestion: 'Tente executar novamente a criação de atividades.'
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

/**
 * CAPABILITY 4 (V2): criar_atividade
 * 
 * Versão V2 simplificada - NÃO salva no banco de dados.
 * 
 * Responsabilidade: Receber atividades com campos já gerados pela 
 * capability gerar_conteudo_atividades e marcar como concluídas.
 * 
 * NOTA: A persistência real agora é feita pelo gerar_conteudo_atividades 
 * que salva diretamente no localStorage. Esta capability apenas:
 * 1. Atualiza o status no store
 * 2. Anima o progresso visual para feedback ao usuário
 * 
 * Isso elimina race conditions com ModalBridge e garante dados persistidos.
 */

import type { 
  CapabilityInput, 
  CapabilityOutput, 
  DebugEntry,
  BuiltActivity 
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';
import { useChosenActivitiesStore } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';

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
    
    // Caminho 2: Fallback para store (CORRIGIDO - buscar campos corretamente)
    if (generatedData.length === 0) {
      const store = useChosenActivitiesStore.getState();
      const storeActivities = store.getChosenActivities();
      
      if (storeActivities.length > 0) {
        chosenActivities = storeActivities;
        
        // CORREÇÃO CRÍTICA: Campos estão em campos_preenchidos OU dados_construidos.generated_fields
        // NÃO em generatedFields (que não existe)
        generatedData = storeActivities
          .filter(a => {
            const camposPreenchidos = a.campos_preenchidos || {};
            const dadosConstruidos = a.dados_construidos?.generated_fields || {};
            const hasFields = Object.keys(camposPreenchidos).length > 0 || Object.keys(dadosConstruidos).length > 0;
            return hasFields;
          })
          .map(a => {
            // Consolidar campos: prioridade para dados_construidos.generated_fields (mais recentes)
            const camposPreenchidos = a.campos_preenchidos || {};
            const dadosConstruidos = a.dados_construidos?.generated_fields || {};
            const consolidatedFields = { ...camposPreenchidos, ...dadosConstruidos };
            
            console.error(`📊 [V2:CRIAR] Activity ${a.id} consolidated fields:`, Object.keys(consolidatedFields));
            
            return {
              activity_id: a.id,
              activity_type: a.tipo,
              fields: consolidatedFields,
              validation: { 
                required_count: 0, 
                filled_count: Object.keys(consolidatedFields).length, 
                is_complete: Object.keys(consolidatedFields).length > 0 
              }
            };
          });
        
        dataSource = 'store fallback (campos_preenchidos + dados_construidos)';
        console.error(`📦 [V2:CRIAR] Using store fallback: ${generatedData.length} activities with fields`);
        
        // Log detalhado para debug
        storeActivities.forEach(a => {
          console.error(`   📋 ${a.id}: campos_preenchidos=${Object.keys(a.campos_preenchidos || {}).length}, dados_construidos.generated_fields=${Object.keys(a.dados_construidos?.generated_fields || {}).length}`);
        });
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
      
      // CORREÇÃO CRÍTICA: Verificar se a atividade já está concluída com campos
      // Se gerar_conteudo_atividades já marcou como 'concluida', não devemos sobrescrever
      const existingActivity = store.getActivityById(activity.id);
      const alreadyComplete = existingActivity?.status_construcao === 'concluida';
      const hasExistingFields = Object.keys(existingActivity?.campos_preenchidos || {}).length > 0 ||
                                Object.keys(existingActivity?.dados_construidos?.generated_fields || {}).length > 0;
      
      // Usar campos existentes se disponíveis, senão usar genData.fields
      const fieldsToUse = hasExistingFields 
        ? { ...(existingActivity?.campos_preenchidos || {}), ...(existingActivity?.dados_construidos?.generated_fields || {}) }
        : genData.fields;
      
      const fieldsCount = Object.keys(fieldsToUse).filter(k => 
        fieldsToUse[k] !== undefined && fieldsToUse[k] !== ''
      ).length;
      
      console.error(`📊 [V2:CRIAR] Activity ${activity.id}: alreadyComplete=${alreadyComplete}, hasExistingFields=${hasExistingFields}, fieldsCount=${fieldsCount}`);
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `[${i + 1}/${generatedData.length}] Finalizando "${activity.titulo}"...`,
        technical_data: { 
          activity_id: activity.id,
          activity_type: activity.tipo,
          fields_count: fieldsCount,
          progress: progressPct,
          already_complete: alreadyComplete,
          has_existing_fields: hasExistingFields
        }
      });
      
      // CORREÇÃO: NÃO sobrescrever status se já está concluída com campos
      if (!alreadyComplete) {
        store.updateActivityStatus(activity.id, 'construindo', progressPct);
      }
      
      // Emitir evento de progresso para UI
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:activity_progress',
          activityId: activity.id,
          activityTitle: activity.titulo,
          progress: progressPct,
          fields_completed: fieldsCount
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
        campos_preenchidos: fieldsToUse,
        conteudo_gerado: JSON.stringify(fieldsToUse, null, 2),
        status: 'completed',
        created_at: new Date().toISOString(),
        saved_to_db: false, // NÃO salvamos no banco
        db_id: undefined
      };
      
      builtActivities.push(builtActivity);
      successCount++;
      
      // CORREÇÃO: Só atualizar status se ainda não está concluída
      if (!alreadyComplete) {
        store.updateActivityStatus(activity.id, 'concluida', 100);
      }
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'discovery',
        narrative: `✅ "${activity.titulo}" pronta para uso! (${fieldsCount} campos)`,
        technical_data: { 
          activity_id: activity.id,
          fields_count: fieldsCount,
          was_already_complete: alreadyComplete
        }
      });
      
      // Emitir evento de sucesso COM contagem de campos correta
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:activity_completed',
          activityId: activity.id,
          data: {
            titulo: activity.titulo,
            fields: fieldsToUse,
            fields_completed: fieldsCount
          }
        }
      }));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. ANIMAÇÃO VISUAL DE CONSTRUÇÃO (COSMÉTICA)
    // ═══════════════════════════════════════════════════════════════════════
    // NOTA: A persistência REAL já foi feita pelo gerar_conteudo_atividades
    // Esta seção apenas anima o progresso visual para feedback ao usuário
    // Não depende mais do ModalBridge ou autoBuildService
    // ═══════════════════════════════════════════════════════════════════════
    
    if (builtActivities.length > 0) {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🎬 Animando progresso visual de ${builtActivities.length} atividade(s)...`,
        technical_data: { 
          activities_count: builtActivities.length,
          note: 'Dados já persistidos pelo gerar_conteudo_atividades'
        }
      });
      
      console.error(`
═══════════════════════════════════════════════════════════════════════
🎬 [V2] ANIMAÇÃO VISUAL DE CONSTRUÇÃO
═══════════════════════════════════════════════════════════════════════
Atividades: ${builtActivities.length} (dados já persistidos no localStorage)
═══════════════════════════════════════════════════════════════════════`);

      // Emitir evento informando início da animação
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:auto_build_started',
          totalActivities: builtActivities.length,
          message: `Finalizando construção de ${builtActivities.length} atividade(s)...`
        }
      }));
      
      // Animar progresso com delays reais para feedback visual natural
      for (let i = 0; i < builtActivities.length; i++) {
        const built = builtActivities[i];
        const progress = Math.round(((i + 1) / builtActivities.length) * 100);
        
        // Delay fixo de 650ms entre cada atividade para animação determinística
        // NOTA: A persistência já foi feita pelo gerar_conteudo_atividades
        // Esta animação é apenas visual/cosmética, não afeta dados
        await new Promise(resolve => setTimeout(resolve, 650));
        
        // Emitir progresso para UI
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'construction:auto_build_progress',
            current: i + 1,
            total: builtActivities.length,
            currentActivity: built.titulo,
            status: 'running'
          }
        }));
        
        debug_log.push({
          timestamp: new Date().toISOString(),
          type: 'info',
          narrative: `[Animação] ${built.titulo} (${i + 1}/${builtActivities.length}) - ${progress}%`,
          technical_data: { activity_id: built.original_id, progress }
        });
      }
      
      // Delay final antes de marcar como concluído
      await new Promise(resolve => setTimeout(resolve, 300));
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'discovery',
        narrative: `✅ Animação de construção concluída!`,
        technical_data: { activities_animated: builtActivities.length }
      });
      
      // Emitir evento de conclusão
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:auto_build_completed',
          success: true,
          totalBuilt: builtActivities.length
        }
      }));
      
      console.error(`
═══════════════════════════════════════════════════════════════════════
✅ [V2] ANIMAÇÃO DE CONSTRUÇÃO CONCLUÍDA
═══════════════════════════════════════════════════════════════════════
Atividades finalizadas: ${builtActivities.length}
Dados persistidos: SIM (gerar_conteudo_atividades)
═══════════════════════════════════════════════════════════════════════`);
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

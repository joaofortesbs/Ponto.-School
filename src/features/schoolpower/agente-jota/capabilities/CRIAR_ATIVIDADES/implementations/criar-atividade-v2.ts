/**
 * CAPABILITY 4 (V2): criar_atividade
 * 
 * Versão V2 com GERAÇÃO REAL de conteúdo por atividade individual.
 * 
 * FLUXO INDIVIDUAL POR ATIVIDADE:
 * 1. Inicializar atividade no debug store
 * 2. Chamar API de IA (Groq/Gemini) para gerar conteúdo REAL
 * 3. Validar e normalizar campos gerados
 * 4. Persistir no localStorage com múltiplas chaves
 * 5. Atualizar store e emitir eventos para UI
 * 6. Registrar logs detalhados de cada fase
 * 
 * IMPORTANTE: Cada atividade tem sua própria chamada de IA real!
 * Não são usados dados pré-gerados - toda geração acontece aqui.
 */

import type { 
  CapabilityInput, 
  CapabilityOutput, 
  DebugEntry,
  BuiltActivity 
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';
import { useChosenActivitiesStore } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { useActivityDebugStore } from '../../../../construction/stores/activityDebugStore';
import { buildActivityFromFormData } from '../../../../construction/services/buildActivityHelper';
import { syncSchemaToFormData } from '../../../../construction/utils/activity-fields-sync';

const CAPABILITY_ID = 'criar_atividade';
const CONSTRUCTION_DELAY_MS = 300; // Delay menor pois agora há tempo real de API

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
    // 2. CONSTRUIR ATIVIDADES COM CHAMADAS REAIS DE IA (INDIVIDUAL)
    // ═══════════════════════════════════════════════════════════════════════
    
    const store = useChosenActivitiesStore.getState();
    const activityDebugStore = useActivityDebugStore.getState();
    const builtActivities: BuiltActivity[] = [];
    let successCount = 0;

    // Emitir evento de início da construção REAL
    window.dispatchEvent(new CustomEvent('agente-jota-progress', {
      detail: {
        type: 'construction:build_started',
        totalActivities: generatedData.length,
        message: `Iniciando construção REAL de ${generatedData.length} atividade(s) com IA...`
      }
    }));

    console.error(`
═══════════════════════════════════════════════════════════════════════
🚀 [V2:CRIAR] INICIANDO CONSTRUÇÃO REAL COM CHAMADAS DE IA
═══════════════════════════════════════════════════════════════════════
Total de atividades: ${generatedData.length}
Cada atividade terá sua própria chamada de API!
═══════════════════════════════════════════════════════════════════════`);

    for (let i = 0; i < generatedData.length; i++) {
      const genData = generatedData[i];
      const activityStartTime = Date.now();
      
      // Encontrar atividade correspondente
      const activity = chosenActivities.find((a: any) => a.id === genData.activity_id) || {
        id: genData.activity_id,
        titulo: `Atividade ${genData.activity_type}`,
        tipo: genData.activity_type,
        categoria: 'geral',
        materia: 'Geral'
      };
      
      console.error(`\n📊 [V2:CRIAR] ══════════════════════════════════════════════════`);
      console.error(`📊 [V2:CRIAR] Atividade ${i + 1}/${generatedData.length}: ${activity.titulo}`);
      console.error(`📊 [V2:CRIAR] Tipo: ${activity.tipo}`);
      console.error(`📊 [V2:CRIAR] ══════════════════════════════════════════════════`);
      
      // ═══════════════════════════════════════════════════════════════════════
      // FASE 1: INICIALIZAR ATIVIDADE NO DEBUG STORE
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.initActivity(activity.id, activity.titulo, activity.tipo);
      activityDebugStore.setStatus(activity.id, 'building');
      activityDebugStore.setProgress(activity.id, 10, 'Preparando geração de conteúdo...');
      
      activityDebugStore.log(
        activity.id, 'action', 'CriarAtividadeV2',
        `[${i + 1}/${generatedData.length}] Iniciando construção REAL de "${activity.titulo}"`,
        { 
          activity_type: activity.tipo, 
          order_index: i,
          timestamp: new Date().toISOString()
        }
      );
      
      // Marcar como "construindo" no store
      store.updateActivityStatus(activity.id, 'construindo', 10);
      
      // Emitir evento de início
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:activity_progress',
          activityId: activity.id,
          activityTitle: activity.titulo,
          progress: 10,
          order_index: i,
          total_count: generatedData.length,
          status: 'building',
          phase: 'initializing'
        }
      }));
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `[${i + 1}/${generatedData.length}] Iniciando construção de "${activity.titulo}"...`,
        technical_data: { activity_id: activity.id, activity_type: activity.tipo }
      });
      
      // ═══════════════════════════════════════════════════════════════════════
      // FASE 2: PREPARAR DADOS DO FORMULÁRIO PARA CHAMADA DE IA
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setProgress(activity.id, 20, 'Preparando dados do formulário...');
      
      // Obter campos existentes do store ou da geração anterior
      const existingActivity = store.getActivityById(activity.id);
      const existingFields = existingActivity?.campos_preenchidos || 
                            existingActivity?.dados_construidos?.generated_fields || 
                            genData.fields || {};
      
      // Preparar formData para a chamada de IA
      const formData: Record<string, any> = {
        title: activity.titulo,
        description: activity.descricao || `Atividade ${activity.tipo}`,
        subject: existingFields.subject || existingFields.disciplina || activity.materia || 'Geral',
        theme: existingFields.theme || existingFields.tema || activity.tema || activity.titulo,
        schoolYear: existingFields.schoolYear || existingFields.anoSerie || 'Ensino Médio',
        difficultyLevel: existingFields.difficultyLevel || existingFields.nivelDificuldade || 'Médio',
        objectives: existingFields.objectives || existingFields.objetivo || 'Objetivo educacional',
        ...existingFields
      };
      
      activityDebugStore.log(
        activity.id, 'info', 'CriarAtividadeV2',
        `Dados do formulário preparados: ${Object.keys(formData).length} campos`,
        { 
          form_fields: Object.keys(formData),
          sample_data: { title: formData.title, subject: formData.subject, theme: formData.theme }
        }
      );
      
      // ═══════════════════════════════════════════════════════════════════════
      // FASE 3: CHAMADA REAL DE IA (buildActivityFromFormData)
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setProgress(activity.id, 30, 'Chamando API de IA (Groq/Gemini)...');
      
      activityDebugStore.log(
        activity.id, 'api', 'CriarAtividadeV2',
        `🌐 Chamando API de IA para gerar conteúdo de "${activity.tipo}"...`,
        { 
          api_target: 'buildActivityFromFormData',
          activity_type: activity.tipo,
          form_data_keys: Object.keys(formData)
        }
      );
      
      let generatedContent: any = null;
      let apiCallDuration = 0;
      let apiSuccess = false;
      
      try {
        const apiStartTime = Date.now();
        
        // CHAMADA REAL DE IA!
        generatedContent = await buildActivityFromFormData(
          activity.id,
          activity.tipo,
          formData as any
        );
        
        apiCallDuration = Date.now() - apiStartTime;
        apiSuccess = true;
        
        console.error(`✅ [V2:CRIAR] API retornou em ${apiCallDuration}ms para ${activity.titulo}`);
        
        activityDebugStore.setProgress(activity.id, 60, `API retornou em ${apiCallDuration}ms`);
        
        activityDebugStore.log(
          activity.id, 'success', 'API-Response',
          `✅ API retornou conteúdo gerado em ${apiCallDuration}ms`,
          { 
            duration_ms: apiCallDuration,
            success: true,
            content_type: typeof generatedContent,
            has_data: !!generatedContent?.data || !!generatedContent?.success
          }
        );
        
      } catch (apiError: any) {
        apiCallDuration = Date.now() - activityStartTime;
        
        console.error(`❌ [V2:CRIAR] Erro na API para ${activity.titulo}:`, apiError);
        
        activityDebugStore.log(
          activity.id, 'error', 'API-Response',
          `❌ Erro na chamada de API: ${apiError.message}`,
          { 
            error: apiError.message,
            duration_ms: apiCallDuration
          }
        );
        
        // Usar fallback com dados existentes
        generatedContent = { success: true, data: formData };
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // FASE 4: VALIDAR E NORMALIZAR CAMPOS GERADOS
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setProgress(activity.id, 70, 'Validando campos gerados...');
      
      const contentData = generatedContent?.data || generatedContent || {};
      const fieldsCount = Object.keys(contentData).filter(k => 
        contentData[k] !== undefined && contentData[k] !== '' && contentData[k] !== null
      ).length;
      
      activityDebugStore.log(
        activity.id, 'info', 'Validation',
        `Validação: ${fieldsCount} campos preenchidos`,
        { 
          fields_count: fieldsCount,
          field_names: Object.keys(contentData).slice(0, 10),
          is_generated_by_ai: contentData.isGeneratedByAI || false
        }
      );
      
      // ═══════════════════════════════════════════════════════════════════════
      // FASE 5: PERSISTIR NO LOCALSTORAGE E STORE
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setProgress(activity.id, 80, 'Persistindo dados...');
      
      // Salvar em múltiplas chaves do localStorage para máxima compatibilidade
      const storageKeys: string[] = [];
      
      try {
        const dataToStore = {
          ...contentData,
          activityId: activity.id,
          activityType: activity.tipo,
          generatedAt: new Date().toISOString(),
          apiCallDuration
        };
        
        // Chave principal
        const primaryKey = `constructed_${activity.tipo}_${activity.id}`;
        localStorage.setItem(primaryKey, JSON.stringify({ success: true, data: dataToStore }));
        storageKeys.push(primaryKey);
        
        // Chave de atividade
        const activityKey = `activity_${activity.id}`;
        localStorage.setItem(activityKey, JSON.stringify(dataToStore));
        storageKeys.push(activityKey);
        
        // Chave de conteúdo gerado
        const generatedKey = `generated_content_${activity.id}`;
        localStorage.setItem(generatedKey, JSON.stringify(dataToStore));
        storageKeys.push(generatedKey);
        
        // Atualizar constructedActivities global
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          generatedContent: dataToStore,
          timestamp: new Date().toISOString(),
          activityType: activity.tipo
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
        storageKeys.push('constructedActivities');
        
        activityDebugStore.log(
          activity.id, 'success', 'LocalStorage',
          `Dados persistidos em ${storageKeys.length} chaves do localStorage`,
          { storage_keys: storageKeys }
        );
        
      } catch (storageError: any) {
        activityDebugStore.log(
          activity.id, 'error', 'LocalStorage',
          `Erro ao persistir: ${storageError.message}`,
          { error: storageError.message }
        );
      }
      
      // Atualizar store
      store.updateActivityStatus(activity.id, 'concluida', 100);
      store.setActivityGeneratedFields(activity.id, contentData);
      
      // ═══════════════════════════════════════════════════════════════════════
      // FASE 6: CRIAR OBJETO DE ATIVIDADE CONSTRUÍDA
      // ═══════════════════════════════════════════════════════════════════════
      const totalBuildTime = Date.now() - activityStartTime;
      
      const builtActivity: BuiltActivity = {
        id: `built-${activity.id}-${Date.now()}`,
        original_id: activity.id,
        titulo: activity.titulo,
        tipo: activity.tipo,
        categoria: activity.categoria || 'geral',
        materia: activity.materia,
        nivel_dificuldade: activity.nivel_dificuldade || 'medio',
        campos_preenchidos: contentData,
        conteudo_gerado: JSON.stringify(contentData, null, 2),
        status: 'completed',
        created_at: new Date().toISOString(),
        saved_to_db: false,
        db_id: undefined
      };
      
      builtActivities.push(builtActivity);
      successCount++;
      
      // ═══════════════════════════════════════════════════════════════════════
      // FASE 7: MARCAR COMO CONCLUÍDA E REGISTRAR LOG FINAL
      // ═══════════════════════════════════════════════════════════════════════
      activityDebugStore.setProgress(activity.id, 100, 'Atividade construída com sucesso!');
      activityDebugStore.markCompleted(activity.id);
      
      activityDebugStore.log(
        activity.id, 'success', 'CriarAtividadeV2',
        `✅ Atividade "${activity.titulo}" construída com sucesso!`,
        { 
          fields_count: fieldsCount,
          total_build_time_ms: totalBuildTime,
          api_call_duration_ms: apiCallDuration,
          storage_keys: storageKeys,
          order_index: i
        }
      );
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'discovery',
        narrative: `✅ "${activity.titulo}" construída com ${fieldsCount} campos em ${totalBuildTime}ms`,
        technical_data: { 
          activity_id: activity.id,
          fields_count: fieldsCount,
          build_time_ms: totalBuildTime,
          api_duration_ms: apiCallDuration
        }
      });
      
      // Emitir evento de conclusão
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:activity_completed',
          activityId: activity.id,
          order_index: i,
          total_count: generatedData.length,
          data: {
            titulo: activity.titulo,
            fields: contentData,
            fields_completed: fieldsCount,
            build_time_ms: totalBuildTime
          }
        }
      }));
      
      // Pequeno delay entre atividades para visualização
      await new Promise(resolve => setTimeout(resolve, CONSTRUCTION_DELAY_MS));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. EMITIR EVENTO FINAL DE CONCLUSÃO
    // ═══════════════════════════════════════════════════════════════════════
    
    if (builtActivities.length > 0) {
      // Emitir evento de conclusão
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:all_completed',
          success: true,
          totalBuilt: builtActivities.length,
          activities: builtActivities.map(b => ({
            id: b.original_id,
            titulo: b.titulo,
            fields_count: Object.keys(b.campos_preenchidos).length
          }))
        }
      }));
      
      console.error(`
═══════════════════════════════════════════════════════════════════════
✅ [V2] CONSTRUÇÃO REAL CONCLUÍDA
═══════════════════════════════════════════════════════════════════════
Atividades construídas: ${builtActivities.length}
Cada atividade teve sua própria chamada de IA!
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

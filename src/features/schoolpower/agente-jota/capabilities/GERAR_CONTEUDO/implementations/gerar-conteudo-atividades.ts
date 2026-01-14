/**
 * CAPABILITY: gerar_conteudo_atividades
 * 
 * Responsabilidade: Gerar conteúdo para preencher automaticamente os campos
 * de cada atividade decidida, mantendo contexto completo da conversa.
 * 
 * Fluxo:
 * 1. Consome atividades do ChosenActivitiesStore
 * 2. Para cada atividade, gera conteúdo baseado no tipo e contexto
 * 3. Atualiza o store com os campos preenchidos
 * 4. Emite eventos para sincronização com UI
 * 5. Registra debug entries detalhadas para visualização no DebugModal
 */

import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import { useChosenActivitiesStore, type ChosenActivity } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { 
  ACTIVITY_FIELDS_MAPPING, 
  getFieldsForActivityType,
  type ActivityFieldsMapping,
  type FieldDefinition 
} from '../schemas/gerar-conteudo-schema';
import { 
  syncSchemaToFormData, 
  validateSyncedFields,
  generateFieldSyncDebugReport 
} from '../../../../construction/utils/activity-fields-sync';
import { createDebugEntry, useDebugStore } from '../../../../interface-chat-producao/debug-system/DebugStore';

interface GerarConteudoParams {
  session_id: string;
  conversation_context: string;
  user_objective: string;
  activities_to_fill?: ChosenActivity[];
  on_progress?: (update: ProgressUpdate) => void;
}

interface ProgressUpdate {
  type: 'activity_started' | 'field_generated' | 'activity_completed' | 'activity_error' | 'all_completed';
  activity_id?: string;
  activity_title?: string;
  field_name?: string;
  field_value?: string;
  progress?: number;
  total_activities?: number;
  current_activity?: number;
  error?: string;
  message?: string;
}

interface GeneratedFieldsResult {
  activity_id: string;
  activity_type: string;
  generated_fields: Record<string, any>;
  success: boolean;
  error?: string;
}

interface DebugLogEntry {
  timestamp: string;
  type: 'action' | 'discovery' | 'decision' | 'error' | 'warning' | 'info';
  narrative: string;
  technical_data?: any;
}

interface GerarConteudoOutput {
  success: boolean;
  capability_id: string;
  data: any;
  error: string | null;
  debug_log: DebugLogEntry[];
  execution_time_ms: number;
  message?: string;
}

const MAX_RETRIES = 2;

function buildContentGenerationPrompt(
  activity: ChosenActivity,
  fieldsMapping: ActivityFieldsMapping,
  conversationContext: string,
  userObjective: string
): string {
  const fieldsDescription = fieldsMapping.requiredFields.map((field, idx) => `
${idx + 1}. "${field.name}" (${field.label})
   - Descrição: ${field.description}
   - Tipo: ${field.type}
   ${field.options ? `- Opções válidas: ${field.options.join(', ')}` : ''}
   ${field.placeholder ? `- Exemplo: ${field.placeholder}` : ''}
`).join('');

  const optionalFieldsDescription = fieldsMapping.optionalFields?.map((field, idx) => `
${idx + 1}. "${field.name}" (${field.label})
   - Descrição: ${field.description}
   - Tipo: ${field.type}
   ${field.options ? `- Opções válidas: ${field.options.join(', ')}` : ''}
`).join('') || '';

  return `
# TAREFA: Gerar Conteúdo para Atividade Educacional

Você é um especialista pedagógico gerando conteúdo detalhado para uma atividade educacional.

## CONTEXTO COMPLETO DA CONVERSA
${conversationContext}

## OBJETIVO ORIGINAL DO USUÁRIO
${userObjective}

## ATIVIDADE A PREENCHER
- **Tipo**: ${fieldsMapping.displayName} (${activity.tipo})
- **Título**: ${activity.titulo}
- **Justificativa da escolha**: ${activity.justificativa}
- **Categoria**: ${activity.categoria || 'Não especificada'}
- **Matéria**: ${activity.materia || 'Não especificada'}

## CAMPOS OBRIGATÓRIOS A GERAR
${fieldsDescription}

${optionalFieldsDescription ? `## CAMPOS OPCIONAIS (gere se relevante)
${optionalFieldsDescription}` : ''}

## INSTRUÇÕES CRÍTICAS

1. **MANTENHA COERÊNCIA**: Todo conteúdo deve estar alinhado com o objetivo original do usuário
2. **SEJA ESPECÍFICO**: Gere conteúdo detalhado e pronto para uso, não genérico
3. **RESPEITE O CONTEXTO**: Use informações da conversa (disciplina, série, tema) 
4. **QUALIDADE PEDAGÓGICA**: Conteúdo deve ser educacionalmente válido
5. **CAMPOS SELECT**: Use APENAS as opções listadas
6. **CAMPOS TEXTAREA**: Gere texto rico e detalhado (mínimo 50 caracteres)
7. **CAMPOS NUMBER**: Use valores numéricos apropriados

## FORMATO DE RESPOSTA (JSON VÁLIDO)

{
  "generated_fields": {
    "${fieldsMapping.requiredFields[0]?.name || 'campo1'}": "valor gerado...",
    "${fieldsMapping.requiredFields[1]?.name || 'campo2'}": "valor gerado..."
  },
  "reasoning": "Breve explicação de como o conteúdo foi pensado pedagogicamente"
}

⚠️ Retorne APENAS o JSON válido, sem texto adicional antes ou depois.
`.trim();
}

function validateGeneratedFields(
  fields: Record<string, any>,
  mapping: ActivityFieldsMapping
): { valid: boolean; errors: string[]; correctedFields: Record<string, any> } {
  const errors: string[] = [];
  const correctedFields = { ...fields };

  for (const fieldDef of mapping.requiredFields) {
    const value = fields[fieldDef.name];
    
    if (value === undefined || value === null || value === '') {
      errors.push(`Campo obrigatório "${fieldDef.label}" não foi preenchido`);
      continue;
    }

    if (fieldDef.type === 'select' && fieldDef.options) {
      const normalizedValue = String(value).toLowerCase();
      const validOption = fieldDef.options.find(opt => 
        opt.toLowerCase() === normalizedValue
      );
      if (!validOption) {
        const closestOption = fieldDef.options[0];
        correctedFields[fieldDef.name] = closestOption;
        errors.push(`Campo "${fieldDef.label}" corrigido de "${value}" para "${closestOption}"`);
      } else {
        correctedFields[fieldDef.name] = validOption;
      }
    }

    if (fieldDef.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        correctedFields[fieldDef.name] = 10;
        errors.push(`Campo "${fieldDef.label}" não é numérico, usando valor padrão`);
      } else {
        correctedFields[fieldDef.name] = numValue;
      }
    }

    if (fieldDef.type === 'textarea') {
      const textValue = String(value);
      if (textValue.length < 20) {
        errors.push(`Campo "${fieldDef.label}" tem conteúdo muito curto`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    correctedFields
  };
}

async function generateContentForActivity(
  activity: ChosenActivity,
  conversationContext: string,
  userObjective: string,
  onProgress?: (update: ProgressUpdate) => void
): Promise<GeneratedFieldsResult> {
  const fieldsMapping = getFieldsForActivityType(activity.tipo);
  
  if (!fieldsMapping) {
    console.warn(`⚠️ [GerarConteudo] Tipo de atividade não mapeado: ${activity.tipo}`);
    return {
      activity_id: activity.id,
      activity_type: activity.tipo,
      generated_fields: {},
      success: false,
      error: `Tipo de atividade "${activity.tipo}" não possui mapeamento de campos`
    };
  }

  const prompt = buildContentGenerationPrompt(
    activity,
    fieldsMapping,
    conversationContext,
    userObjective
  );

  let lastError: string = '';
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🎯 [GerarConteudo] Gerando conteúdo para "${activity.titulo}" (tentativa ${attempt + 1})`);
      
      const response = await executeWithCascadeFallback(prompt);

      if (!response.success || !response.data) {
        lastError = response.errors?.[0]?.error || 'Resposta vazia da IA';
        continue;
      }

      let parsed: any;
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          lastError = 'Resposta não contém JSON válido';
          continue;
        }
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        lastError = 'Erro ao parsear JSON da resposta';
        continue;
      }

      if (!parsed.generated_fields || typeof parsed.generated_fields !== 'object') {
        lastError = 'Resposta não contém generated_fields';
        continue;
      }

      const validation = validateGeneratedFields(parsed.generated_fields, fieldsMapping);
      
      if (validation.errors.length > 0) {
        console.log(`⚠️ [GerarConteudo] Correções aplicadas: ${validation.errors.join(', ')}`);
      }

      for (const [fieldName, fieldValue] of Object.entries(validation.correctedFields)) {
        onProgress?.({
          type: 'field_generated',
          activity_id: activity.id,
          activity_title: activity.titulo,
          field_name: fieldName,
          field_value: String(fieldValue).substring(0, 50) + '...'
        });
      }

      return {
        activity_id: activity.id,
        activity_type: activity.tipo,
        generated_fields: validation.correctedFields,
        success: true
      };

    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ [GerarConteudo] Erro na tentativa ${attempt + 1}:`, lastError);
    }
  }

  return {
    activity_id: activity.id,
    activity_type: activity.tipo,
    generated_fields: {},
    success: false,
    error: lastError
  };
}

export async function gerarConteudoAtividades(
  params: GerarConteudoParams
): Promise<GerarConteudoOutput> {
  const startTime = Date.now();
  const debugLog: DebugLogEntry[] = [];
  const CAPABILITY_ID = 'gerar_conteudo_atividades';
  const CAPABILITY_NAME = 'Gerando conteúdo para as atividades';
  
  // Inicializar DebugStore
  useDebugStore.getState().startCapability(CAPABILITY_ID, CAPABILITY_NAME);
  
  // Entry inicial
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action', 
    `Iniciando execução da capability "${CAPABILITY_NAME}". Objetivo: processar dados conforme parâmetros recebidos.`,
    'low',
    { session_id: params.session_id, objetivo: params.user_objective?.substring(0, 100) }
  );
  
  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: '🚀 Iniciando geração de conteúdo para atividades',
    technical_data: { session_id: params.session_id }
  });

  const store = useChosenActivitiesStore.getState();
  const activities = params.activities_to_fill || store.getChosenActivities();

  if (!activities || activities.length === 0) {
    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
      'Nenhuma atividade encontrada para preencher. Verifique se a capability "decidir_atividades_criar" foi executada.',
      'high'
    );
    
    return {
      success: false,
      capability_id: CAPABILITY_ID,
      error: 'Nenhuma atividade encontrada para preencher',
      data: null,
      debug_log: debugLog,
      execution_time_ms: Date.now() - startTime
    };
  }

  // Entry informativa sobre capabilities encontradas
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
    `Capability "${CAPABILITY_ID}" encontrada no registro. Iniciando execução com os parâmetros configurados.`,
    'low'
  );
  
  // Entry com descoberta das atividades
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
  
  // MOSTRAR CAMPOS QUE PRECISAM SER GERADOS PARA CADA ATIVIDADE
  for (const activity of activities) {
    const fieldsMapping = getFieldsForActivityType(activity.tipo);
    
    if (fieldsMapping) {
      const requiredFieldsList = fieldsMapping.requiredFields.map(f => `• ${f.label}: ${f.description}`).join('\n');
      const optionalFieldsList = fieldsMapping.optionalFields?.map(f => `• ${f.label}: ${f.description}`).join('\n') || '';
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'discovery',
        `📋 Campos para "${activity.titulo}" (${fieldsMapping.displayName}):\n\n` +
        `CAMPOS OBRIGATÓRIOS:\n${requiredFieldsList}` +
        (optionalFieldsList ? `\n\nCAMPOS OPCIONAIS:\n${optionalFieldsList}` : ''),
        'low',
        {
          activity_id: activity.id,
          activity_type: activity.tipo,
          required_fields: fieldsMapping.requiredFields.map(f => f.name),
          optional_fields: fieldsMapping.optionalFields?.map(f => f.name) || []
        }
      );
    } else {
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
        `Tipo de atividade "${activity.tipo}" não possui mapeamento de campos definido.`,
        'medium'
      );
    }
  }

  const results: GeneratedFieldsResult[] = [];
  const totalActivities = activities.length;

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    
    params.on_progress?.({
      type: 'activity_started',
      activity_id: activity.id,
      activity_title: activity.titulo,
      current_activity: i + 1,
      total_activities: totalActivities,
      progress: Math.round((i / totalActivities) * 100),
      message: `Gerando conteúdo para: ${activity.titulo}`
    });

    store.updateActivityStatus(activity.id, 'construindo', Math.round((i / totalActivities) * 100));

    const result = await generateContentForActivity(
      activity,
      params.conversation_context,
      params.user_objective,
      params.on_progress
    );

    results.push(result);

    if (result.success) {
      // Atualizar status para aguardando (campos preenchidos, pronto para construção)
      store.updateActivityStatus(activity.id, 'aguardando', 100);
      
      // CRÍTICO: Sincronizar campos gerados para formato do formData
      const syncedFields = syncSchemaToFormData(activity.tipo, result.generated_fields);
      
      // Debug: Mostrar relatório de sincronização
      console.log('%c📊 [GerarConteudo] Relatório de sincronização:', 
        'background: #9C27B0; color: white; padding: 2px 5px; border-radius: 3px;');
      console.log(generateFieldSyncDebugReport(activity.tipo, syncedFields));
      
      // Validar campos sincronizados
      const validation = validateSyncedFields(activity.tipo, syncedFields);
      console.log(`%c📋 [GerarConteudo] Validação: ${validation.filledFields.length} campos preenchidos, ${validation.missingFields.length} faltando`,
        validation.valid ? 'color: green;' : 'color: orange;');
      
      // CRIAR DEBUG ENTRY COM CONTEÚDO GERADO
      const generatedContentSummary = Object.entries(result.generated_fields)
        .map(([key, value]) => {
          const valueStr = String(value);
          const truncatedValue = valueStr.length > 100 ? valueStr.substring(0, 100) + '...' : valueStr;
          return `• ${key}: "${truncatedValue}"`;
        })
        .join('\n');
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
        `✅ Conteúdo gerado para "${activity.titulo}":\n\n${generatedContentSummary}`,
        'low',
        {
          activity_id: activity.id,
          activity_type: activity.tipo,
          generated_fields: result.generated_fields,
          synced_fields: syncedFields,
          validation: validation
        }
      );
      
      // CRÍTICO: Salvar os campos gerados no store (com formato sincronizado)
      store.setActivityGeneratedFields(activity.id, syncedFields);
      
      // Também atualizar dados construídos para compatibilidade
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

      // CRÍTICO: Emitir evento para atualizar UI (EditActivityModal)
      console.log('📤 [GerarConteudo] Emitindo evento agente-jota-fields-generated para:', activity.id);
      window.dispatchEvent(new CustomEvent('agente-jota-fields-generated', {
        detail: {
          activity_id: activity.id,
          activity_type: activity.tipo,
          fields: syncedFields,
          original_fields: result.generated_fields,
          validation: validation
        }
      }));

      params.on_progress?.({
        type: 'activity_completed',
        activity_id: activity.id,
        activity_title: activity.titulo,
        current_activity: i + 1,
        total_activities: totalActivities,
        progress: Math.round(((i + 1) / totalActivities) * 100),
        message: `Conteúdo gerado para: ${activity.titulo}`
      });

      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `✅ Conteúdo gerado para "${activity.titulo}"`,
        technical_data: { 
          activity_id: activity.id,
          fields_count: Object.keys(result.generated_fields).length,
          generated_fields: result.generated_fields
        }
      });

    } else {
      store.updateActivityStatus(activity.id, 'erro', 0, result.error);
      
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
        `❌ Erro ao gerar conteúdo para "${activity.titulo}": ${result.error}`,
        'high',
        { activity_id: activity.id, error: result.error }
      );
      
      params.on_progress?.({
        type: 'activity_error',
        activity_id: activity.id,
        activity_title: activity.titulo,
        error: result.error,
        message: `Erro ao gerar conteúdo para: ${activity.titulo}`
      });

      debugLog.push({
        timestamp: new Date().toISOString(),
        type: 'error',
        narrative: `❌ Erro em "${activity.titulo}": ${result.error}`,
        technical_data: { activity_id: activity.id, error: result.error }
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const executionTime = Date.now() - startTime;

  // Resumo final no debug
  const resultadoResumo = `Resultado com ${Object.keys(results[0]?.generated_fields || {}).length + 2} campos: success, capability_id, data...`;
  
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'discovery',
    `Processamento concluído. ${resultadoResumo}`,
    'low',
    { resultado_resumo: resultadoResumo }
  );
  
  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
    `Capability "${CAPABILITY_NAME}" concluída com sucesso em ${executionTime}ms. Todos os dados foram processados corretamente.`,
    'low',
    {
      success_count: successCount,
      fail_count: failCount,
      execution_time_ms: executionTime
    }
  );
  
  // Finalizar capability no DebugStore
  useDebugStore.getState().endCapability(CAPABILITY_ID);

  params.on_progress?.({
    type: 'all_completed',
    total_activities: totalActivities,
    progress: 100,
    message: `Geração concluída: ${successCount} sucesso, ${failCount} erros`
  });

  window.dispatchEvent(new CustomEvent('agente-jota-content-generation-complete', {
    detail: {
      session_id: params.session_id,
      success_count: successCount,
      fail_count: failCount,
      results
    }
  }));

  debugLog.push({
    timestamp: new Date().toISOString(),
    type: 'action',
    narrative: `🏁 Geração de conteúdo finalizada: ${successCount}/${totalActivities} atividades`,
    technical_data: { success_count: successCount, fail_count: failCount }
  });

  return {
    success: failCount === 0,
    capability_id: CAPABILITY_ID,
    data: {
      session_id: params.session_id,
      total_activities: totalActivities,
      success_count: successCount,
      fail_count: failCount,
      results,
      generated_at: new Date().toISOString()
    },
    error: failCount > 0 ? `${failCount} atividades falharam` : null,
    debug_log: debugLog,
    execution_time_ms: executionTime,
    message: `Conteúdo gerado para ${successCount} de ${totalActivities} atividades`
  };
}

export default gerarConteudoAtividades;

/**
 * content-activity-generator.ts
 * generateContentForActivity — despacha para handlers especializados ou loop genérico de IA.
 */

import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import type { ChosenActivity } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';
import { getFieldsForActivityType } from '../schemas/gerar-conteudo-schema';
import { createDebugEntry } from '../../../../interface-chat-producao/debug-system/DebugStore';
import { isTextVersionActivity } from '../../../../config/activityVersionConfig';
import type {
  BnccContextData, QuestoesReferenciaData, WebSearchContextData,
  GeneratedFieldsResult, ProgressUpdate, HandlerContext
} from './content-types';
import { MAX_RETRIES, EXPONENTIAL_BACKOFF_BASE_MS, truncateForDebug, generateCorrelationId, sleep } from './content-helpers';
import { buildContentGenerationPrompt, validateGeneratedFields, robustJsonParse } from './content-prompt-builders';
import { handleListaExercicios, handleQuizInterativo } from './content-handlers-a';
import { handleFlashCards, handleTextVersion } from './content-handlers-b';

export async function generateContentForActivity(
  activity: ChosenActivity,
  conversationContext: string,
  userObjective: string,
  onProgress?: (update: ProgressUpdate) => void,
  capabilityId?: string,
  capabilityName?: string,
  batchIndex?: number,
  batchTotal?: number,
  temaLimpo?: string,
  disciplinaExtraida?: string,
  turmaExtraida?: string,
  bnccContext?: BnccContextData,
  questoesReferencia?: QuestoesReferenciaData,
  webSearchContext?: WebSearchContextData,
  fileContext?: string
): Promise<GeneratedFieldsResult> {
  const correlationId = generateCorrelationId();
  const activityStartTime = Date.now();
  const CAPABILITY_ID = capabilityId || 'gerar_conteudo_atividades';
  const CAPABILITY_NAME = capabilityName || 'Gerando conteúdo para as atividades';

  const fieldsMapping = getFieldsForActivityType(activity.tipo);

  if (!fieldsMapping) {
    console.warn(`⚠️ [GerarConteudo] Tipo de atividade não mapeado: ${activity.tipo}`);
    createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
      `Tipo de atividade "${activity.tipo}" não possui mapeamento de campos definido.`,
      'high', { correlation_id: correlationId, activity_id: activity.id, activity_type: activity.tipo }
    );
    return {
      activity_id: activity.id, activity_type: activity.tipo,
      generated_fields: {}, success: false,
      error: `Tipo de atividade "${activity.tipo}" não possui mapeamento de campos`
    };
  }

  const ctx: HandlerContext = {
    correlationId, activityStartTime,
    capabilityId: CAPABILITY_ID, capabilityName: CAPABILITY_NAME,
    userObjective, temaLimpo: temaLimpo || '', disciplinaExtraida: disciplinaExtraida || '',
    turmaExtraida: turmaExtraida || '', onProgress
  };

  if (activity.tipo === 'lista-exercicios') {
    return handleListaExercicios(activity, ctx);
  }

  if (activity.tipo === 'quiz-interativo') {
    return handleQuizInterativo(activity, ctx);
  }

  if (activity.tipo === 'flash-cards') {
    return handleFlashCards(activity, ctx);
  }

  if (isTextVersionActivity(activity.tipo)) {
    return handleTextVersion(activity, ctx, conversationContext);
  }

  // ============================================================
  // LOOP GENÉRICO DE IA — para todos os outros tipos de atividade
  // ============================================================
  const requiredFieldNames = fieldsMapping.requiredFields.map(f => f.name);
  const optionalFieldNames = fieldsMapping.optionalFields?.map(f => f.name) || [];

  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
    `[PRE-GEN] Mapeando schema para "${activity.titulo}" (${fieldsMapping.displayName}):\n` +
    `- Campos obrigatórios: ${requiredFieldNames.join(', ')}\n` +
    `- Campos opcionais: ${optionalFieldNames.length > 0 ? optionalFieldNames.join(', ') : 'nenhum'}`,
    'low',
    { correlation_id: correlationId, stage: 'pre_generation', activity_id: activity.id, activity_type: activity.tipo,
      schema: { required_fields: requiredFieldNames, optional_fields: optionalFieldNames,
        total_fields: requiredFieldNames.length + optionalFieldNames.length } }
  );

  const prompt = buildContentGenerationPrompt(
    activity, fieldsMapping, conversationContext, userObjective,
    batchIndex, batchTotal, bnccContext, questoesReferencia, webSearchContext, fileContext
  );

  let lastError: string = '';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const attemptStartTime = Date.now();

    if (attempt > 0) {
      const backoffMs = EXPONENTIAL_BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
      console.log(`⏳ [GerarConteudo] Aguardando ${backoffMs}ms antes da tentativa ${attempt + 1}`);
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
        `[GEN] Retry ${attempt + 1}/${MAX_RETRIES + 1} após ${backoffMs}ms de backoff. Erro anterior: ${truncateForDebug(lastError, 100)}`,
        'medium', { correlation_id: correlationId, attempt, backoff_ms: backoffMs, previous_error: lastError }
      );
      await sleep(backoffMs);
    }

    try {
      console.log(`🎯 [GerarConteudo] Gerando conteúdo para "${activity.titulo}" (tentativa ${attempt + 1})`);
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
        `[GEN] Chamando API LLM para "${activity.titulo}" (tentativa ${attempt + 1}/${MAX_RETRIES + 1})`,
        'low', { correlation_id: correlationId, stage: 'generation', attempt: attempt + 1,
          prompt_length: prompt.length, prompt_preview: truncateForDebug(prompt, 200) }
      );

      const response = await executeWithCascadeFallback(prompt);
      const apiResponseTime = Date.now() - attemptStartTime;

      if (!response.success || !response.data) {
        lastError = response.errors?.[0]?.error || 'Resposta vazia da IA';
        createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
          `[GEN] API retornou erro: ${truncateForDebug(lastError, 100)}`,
          'medium', { correlation_id: correlationId, stage: 'generation', error: lastError,
            response_time_ms: apiResponseTime, model_used: response.modelUsed || 'unknown' }
        );
        continue;
      }

      const parseResult = robustJsonParse(response.data, activity.tipo, fieldsMapping);

      if (!parseResult.success) {
        lastError = parseResult.error || 'Falha ao parsear JSON com todas as estratégias';
        createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
          `[POST-GEN] Falha no parsing robusto: ${parseResult.method}`,
          'medium', { correlation_id: correlationId, stage: 'post_generation',
            parse_method: parseResult.method, error: parseResult.error,
            raw_response_preview: truncateForDebug(response.data, 300) }
        );
        continue;
      }

      const parsed = parseResult.data;

      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'info',
        `[POST-GEN] JSON parseado com sucesso via método: ${parseResult.method}`,
        'low', { correlation_id: correlationId, stage: 'post_generation',
          parse_method: parseResult.method, has_generated_fields: !!parsed.generated_fields }
      );

      if (!parsed.generated_fields || typeof parsed.generated_fields !== 'object') {
        lastError = 'Resposta não contém generated_fields';
        createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'warning',
          `[POST-GEN] JSON válido mas sem generated_fields. Keys: ${Object.keys(parsed).join(', ')}`,
          'medium', { correlation_id: correlationId, stage: 'post_generation', parsed_keys: Object.keys(parsed) }
        );
        continue;
      }

      const validation = validateGeneratedFields(parsed.generated_fields, fieldsMapping);

      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'discovery',
        `[POST-GEN] Validação de schema concluída:\n` +
        `- Campos validados: ${Object.keys(validation.correctedFields).length}\n` +
        `- Correções aplicadas: ${validation.errors.length}` +
        (validation.errors.length > 0 ? `\n- Detalhes: ${validation.errors.join('; ')}` : ''),
        validation.errors.length > 0 ? 'medium' : 'low',
        { correlation_id: correlationId, stage: 'post_generation',
          validation_passed: validation.valid, corrections_count: validation.errors.length,
          corrections: validation.errors }
      );

      if (validation.errors.length > 0) {
        console.log(`⚠️ [GerarConteudo] Correções aplicadas: ${validation.errors.join(', ')}`);
      }

      for (const [fieldName, fieldValue] of Object.entries(validation.correctedFields)) {
        onProgress?.({ type: 'field_generated', activity_id: activity.id, activity_title: activity.titulo,
          field_name: fieldName, field_value: String(fieldValue).substring(0, 50) + '...' });
      }

      const fieldsGeneratedSummary = Object.entries(validation.correctedFields)
        .map(([key, value]) => `• ${key}: "${truncateForDebug(value, 80)}"`)
        .join('\n');

      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'action',
        `[POST-GEN] Geração concluída para "${activity.titulo}":\n${fieldsGeneratedSummary}`,
        'low', { correlation_id: correlationId, stage: 'post_generation', activity_id: activity.id,
          total_execution_time_ms: Date.now() - activityStartTime, api_response_time_ms: apiResponseTime,
          fields_count: Object.keys(validation.correctedFields).length,
          generated_fields: validation.correctedFields }
      );

      return { activity_id: activity.id, activity_type: activity.tipo,
        generated_fields: validation.correctedFields, success: true };

    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ [GerarConteudo] Erro na tentativa ${attempt + 1}:`, lastError);
      createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
        `[GEN] Exceção na tentativa ${attempt + 1}: ${truncateForDebug(lastError, 150)}`,
        'high', { correlation_id: correlationId, stage: 'generation', attempt: attempt + 1,
          error: lastError, stack_trace: error instanceof Error ? error.stack?.substring(0, 500) : undefined }
      );
    }
  }

  createDebugEntry(CAPABILITY_ID, CAPABILITY_NAME, 'error',
    `Falha ao gerar conteúdo para "${activity.titulo}" após ${MAX_RETRIES + 1} tentativas. Último erro: ${truncateForDebug(lastError, 150)}`,
    'high', { correlation_id: correlationId, activity_id: activity.id,
      total_attempts: MAX_RETRIES + 1, final_error: lastError,
      total_time_ms: Date.now() - activityStartTime }
  );

  return { activity_id: activity.id, activity_type: activity.tipo, generated_fields: {}, success: false, error: lastError };
}

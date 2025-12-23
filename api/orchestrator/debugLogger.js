/**
 * ====================================================================
 * PONTO. SCHOOL - SISTEMA DE LOGGING MILIMÉTRICO DO ORQUESTRADOR
 * ====================================================================
 * 
 * Sistema de debug com etapas coloridas e timestamps precisos.
 * Cada etapa do fluxo tem seu próprio prefixo e cor.
 * 
 * ETAPAS DO FLUXO:
 * 1. [CONTEXT] - Envio de contexto inicial
 * 2. [CONTENT] - Criando conteúdo dos blocos
 * 3. [SUGGEST] - Sugerindo atividades para cada bloco
 * 4. [GENERATE] - Gerando atividades via School Power
 * 5. [SAVE] - Salvando atividades no banco
 * 6. [ATTACH] - Anexando atividades aos blocos
 * 7. [FINALIZE] - Finalizando aula
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

const LOG_PREFIXES = {
  ORCHESTRATOR: '🎭 [ORCHESTRATOR]',
  CONTEXT: '📋 [CONTEXT]',
  CONTENT: '✍️  [CONTENT]',
  SUGGEST: '💡 [SUGGEST]',
  GENERATE: '⚙️  [GENERATE]',
  SAVE: '💾 [SAVE]',
  ATTACH: '🔗 [ATTACH]',
  FINALIZE: '✅ [FINALIZE]',
  ERROR: '❌ [ERROR]',
  DEBUG: '🔍 [DEBUG]',
  TIMING: '⏱️  [TIMING]',
  API: '🌐 [API]',
  WORKFLOW: '📊 [WORKFLOW]'
};

const STEP_NAMES = {
  1: 'Envio de contexto',
  2: 'Criando conteúdo dos blocos',
  3: 'Sugerindo atividades',
  4: 'Gerando atividades',
  5: 'Salvando atividades',
  6: 'Anexando aos blocos',
  7: 'Finalizando aula'
};

function generateRequestId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `ORCH-${timestamp}-${random}`;
}

function log(prefix, message, data = null) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `${timestamp} ${prefix} ${message}`;
  
  if (data) {
    console.log(formattedMessage);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(formattedMessage);
  }
}

function logStepStart(stepNumber, requestId, additionalInfo = null) {
  const stepName = STEP_NAMES[stepNumber] || `Etapa ${stepNumber}`;
  log(LOG_PREFIXES.WORKFLOW, `========================================`);
  log(LOG_PREFIXES.WORKFLOW, `ETAPA ${stepNumber}/7: ${stepName}`);
  log(LOG_PREFIXES.WORKFLOW, `Request ID: ${requestId}`);
  if (additionalInfo) {
    log(LOG_PREFIXES.DEBUG, `Info adicional:`, additionalInfo);
  }
  log(LOG_PREFIXES.WORKFLOW, `========================================`);
}

function logStepEnd(stepNumber, requestId, success, duration, result = null) {
  const stepName = STEP_NAMES[stepNumber] || `Etapa ${stepNumber}`;
  log(LOG_PREFIXES.WORKFLOW, `----------------------------------------`);
  log(LOG_PREFIXES.WORKFLOW, `FIM ETAPA ${stepNumber}: ${stepName}`);
  log(LOG_PREFIXES.WORKFLOW, `Status: ${success ? '✅ SUCESSO' : '❌ FALHA'}`);
  log(LOG_PREFIXES.TIMING, `Duração: ${duration}ms`);
  if (result && !success) {
    log(LOG_PREFIXES.ERROR, `Erro:`, result);
  }
  log(LOG_PREFIXES.WORKFLOW, `----------------------------------------`);
}

function logOrchestratorStart(requestId, inputData) {
  console.log('\n');
  log(LOG_PREFIXES.ORCHESTRATOR, `╔════════════════════════════════════════════════════════════╗`);
  log(LOG_PREFIXES.ORCHESTRATOR, `║     INICIANDO ORQUESTRAÇÃO DE CRIAÇÃO DE AULA              ║`);
  log(LOG_PREFIXES.ORCHESTRATOR, `╠════════════════════════════════════════════════════════════╣`);
  log(LOG_PREFIXES.ORCHESTRATOR, `║  Request ID: ${requestId.padEnd(43)}║`);
  log(LOG_PREFIXES.ORCHESTRATOR, `║  Timestamp: ${new Date().toISOString().padEnd(44)}║`);
  log(LOG_PREFIXES.ORCHESTRATOR, `╚════════════════════════════════════════════════════════════╝`);
  log(LOG_PREFIXES.CONTEXT, `Dados de entrada:`, inputData);
}

function logOrchestratorEnd(requestId, success, totalDuration, summary) {
  console.log('\n');
  log(LOG_PREFIXES.ORCHESTRATOR, `╔════════════════════════════════════════════════════════════╗`);
  log(LOG_PREFIXES.ORCHESTRATOR, `║     FINALIZANDO ORQUESTRAÇÃO DE CRIAÇÃO DE AULA            ║`);
  log(LOG_PREFIXES.ORCHESTRATOR, `╠════════════════════════════════════════════════════════════╣`);
  log(LOG_PREFIXES.ORCHESTRATOR, `║  Request ID: ${requestId.padEnd(43)}║`);
  log(LOG_PREFIXES.ORCHESTRATOR, `║  Status: ${(success ? '✅ SUCESSO' : '❌ FALHA').padEnd(47)}║`);
  log(LOG_PREFIXES.ORCHESTRATOR, `║  Duração Total: ${(totalDuration + 'ms').padEnd(40)}║`);
  log(LOG_PREFIXES.ORCHESTRATOR, `╚════════════════════════════════════════════════════════════╝`);
  log(LOG_PREFIXES.ORCHESTRATOR, `Resumo:`, summary);
}

function logContentGeneration(requestId, sectionId, sectionName) {
  log(LOG_PREFIXES.CONTENT, `[${requestId}] Gerando conteúdo para seção: ${sectionName} (${sectionId})`);
}

function logActivitySuggestion(requestId, sectionId, suggestedActivities) {
  log(LOG_PREFIXES.SUGGEST, `[${requestId}] Atividades sugeridas para ${sectionId}:`, suggestedActivities);
}

function logActivityGeneration(requestId, activityId, activityType) {
  log(LOG_PREFIXES.GENERATE, `[${requestId}] Gerando atividade: ${activityId} (${activityType})`);
}

function logActivitySave(requestId, activityId, success) {
  const status = success ? '✅ Salva' : '❌ Erro';
  log(LOG_PREFIXES.SAVE, `[${requestId}] Atividade ${activityId}: ${status}`);
}

function logActivityAttach(requestId, activityId, sectionId) {
  log(LOG_PREFIXES.ATTACH, `[${requestId}] Anexando atividade ${activityId} à seção ${sectionId}`);
}

function logError(requestId, step, error) {
  log(LOG_PREFIXES.ERROR, `[${requestId}] Erro na etapa ${step}:`, {
    message: error.message || error,
    stack: error.stack || 'N/A'
  });
}

function logApiCall(requestId, endpoint, method, status) {
  log(LOG_PREFIXES.API, `[${requestId}] ${method} ${endpoint} -> ${status}`);
}

export {
  LOG_PREFIXES,
  STEP_NAMES,
  generateRequestId,
  log,
  logStepStart,
  logStepEnd,
  logOrchestratorStart,
  logOrchestratorEnd,
  logContentGeneration,
  logActivitySuggestion,
  logActivityGeneration,
  logActivitySave,
  logActivityAttach,
  logError,
  logApiCall
};

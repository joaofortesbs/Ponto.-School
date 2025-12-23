/**
 * ====================================================================
 * SISTEMA DE LOGS ESTRUTURADOS POR ETAPA
 * ====================================================================
 * 
 * Gerencia logs detalhados para cada etapa do workflow,
 * com eventos cronológicos, categorização e persistência.
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

const LOG_TYPES = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  RETRY: 'RETRY',
  DEBUG: 'DEBUG'
};

const SUB_PHASES = {
  COMMAND_SENT: 'COMMAND_SENT',
  BACKEND_RECEIVED: 'BACKEND_RECEIVED',
  AI_STARTED: 'AI_STARTED',
  AI_COMPLETED: 'AI_COMPLETED',
  DATA_SAVED: 'DATA_SAVED',
  BLOCK_ATTACHED: 'BLOCK_ATTACHED',
  VALIDATION_PASSED: 'VALIDATION_PASSED',
  VALIDATION_FAILED: 'VALIDATION_FAILED'
};

class StepLogger {
  constructor(requestId) {
    this.requestId = requestId;
    this.steps = new Map();
    this.createdAt = Date.now();
  }

  initStep(stepId, stepName) {
    if (!this.steps.has(stepId)) {
      this.steps.set(stepId, {
        stepId,
        stepName,
        status: 'pending',
        events: [],
        subPhases: {},
        retryCount: 0,
        lastError: null,
        startTime: null,
        endTime: null,
        validationChecks: []
      });
    }
    return this.steps.get(stepId);
  }

  logEvent(stepId, type, message, data = {}) {
    const step = this.steps.get(stepId);
    if (!step) {
      console.warn(`[StepLogger] Step ${stepId} not initialized`);
      return;
    }

    const event = {
      timestamp: Date.now(),
      type,
      message,
      data,
      relativeTime: Date.now() - (step.startTime || this.createdAt)
    };

    step.events.push(event);
    
    const prefix = `[STEP-${stepId}][${type}]`;
    const logFn = type === 'ERROR' ? console.error : type === 'WARNING' ? console.warn : console.log;
    logFn(`${prefix} [${this.requestId}] ${message}`, data);

    return event;
  }

  markSubPhase(stepId, phase, success, details = {}) {
    const step = this.steps.get(stepId);
    if (!step) return;

    step.subPhases[phase] = {
      completed: success,
      timestamp: Date.now(),
      details
    };

    this.logEvent(stepId, success ? LOG_TYPES.SUCCESS : LOG_TYPES.ERROR, 
      `Sub-fase ${phase}: ${success ? 'COMPLETA' : 'FALHOU'}`, details);
  }

  startStep(stepId) {
    const step = this.steps.get(stepId);
    if (!step) return;

    step.status = 'running';
    step.startTime = Date.now();
    
    this.logEvent(stepId, LOG_TYPES.INFO, `Etapa iniciada`);
  }

  completeStep(stepId, result = {}) {
    const step = this.steps.get(stepId);
    if (!step) return false;

    const validationResult = this.validateStepCompletion(stepId);
    
    if (!validationResult.valid) {
      this.logEvent(stepId, LOG_TYPES.ERROR, 
        `Tentativa de conclusão rejeitada: ${validationResult.reason}`, validationResult);
      return false;
    }

    step.status = 'completed';
    step.endTime = Date.now();
    step.result = result;

    this.logEvent(stepId, LOG_TYPES.SUCCESS, 
      `Etapa concluída com sucesso em ${step.endTime - step.startTime}ms`, result);
    
    return true;
  }

  failStep(stepId, error, canRetry = true) {
    const step = this.steps.get(stepId);
    if (!step) return;

    step.status = canRetry ? 'retrying' : 'error';
    step.lastError = {
      message: error.message || error,
      stack: error.stack,
      timestamp: Date.now()
    };
    step.retryCount++;

    this.logEvent(stepId, LOG_TYPES.ERROR, 
      `Falha na etapa: ${error.message || error}`, {
        retryCount: step.retryCount,
        canRetry
      });
  }

  addValidationCheck(stepId, checkName, passed, details = {}) {
    const step = this.steps.get(stepId);
    if (!step) return;

    const check = {
      name: checkName,
      passed,
      timestamp: Date.now(),
      details
    };

    step.validationChecks.push(check);

    this.logEvent(stepId, passed ? LOG_TYPES.SUCCESS : LOG_TYPES.WARNING,
      `Validação "${checkName}": ${passed ? 'OK' : 'FALHOU'}`, details);
  }

  validateStepCompletion(stepId) {
    const step = this.steps.get(stepId);
    if (!step) {
      return { valid: false, reason: 'Step não encontrado' };
    }

    const requiredPhases = this.getRequiredPhasesForStep(stepId);
    const missingPhases = requiredPhases.filter(phase => 
      !step.subPhases[phase] || !step.subPhases[phase].completed
    );

    if (missingPhases.length > 0) {
      return { 
        valid: false, 
        reason: `Sub-fases não completadas: ${missingPhases.join(', ')}`,
        missingPhases
      };
    }

    const failedChecks = step.validationChecks.filter(c => !c.passed);
    if (failedChecks.length > 0) {
      return {
        valid: false,
        reason: `Validações falharam: ${failedChecks.map(c => c.name).join(', ')}`,
        failedChecks
      };
    }

    return { valid: true };
  }

  getRequiredPhasesForStep(stepId) {
    const phaseMap = {
      1: [SUB_PHASES.VALIDATION_PASSED],
      2: [SUB_PHASES.COMMAND_SENT, SUB_PHASES.BACKEND_RECEIVED, SUB_PHASES.AI_COMPLETED],
      3: [SUB_PHASES.AI_STARTED, SUB_PHASES.AI_COMPLETED],
      4: [SUB_PHASES.AI_STARTED, SUB_PHASES.AI_COMPLETED],
      5: [SUB_PHASES.DATA_SAVED],
      6: [SUB_PHASES.BLOCK_ATTACHED],
      7: [SUB_PHASES.VALIDATION_PASSED]
    };
    return phaseMap[stepId] || [];
  }

  getStepLogs(stepId) {
    const step = this.steps.get(stepId);
    if (!step) return null;

    return {
      ...step,
      duration: step.endTime ? step.endTime - step.startTime : null
    };
  }

  getAllLogs() {
    const logs = {};
    this.steps.forEach((step, stepId) => {
      logs[stepId] = this.getStepLogs(stepId);
    });
    return {
      requestId: this.requestId,
      createdAt: this.createdAt,
      steps: logs,
      totalDuration: Date.now() - this.createdAt
    };
  }

  getStepStatus(stepId) {
    const step = this.steps.get(stepId);
    return step ? step.status : 'unknown';
  }

  isStepComplete(stepId) {
    return this.getStepStatus(stepId) === 'completed';
  }

  hasStepError(stepId) {
    const status = this.getStepStatus(stepId);
    return status === 'error' || status === 'retrying';
  }

  canFinalize() {
    const allSteps = Array.from(this.steps.values());
    const incompleteSteps = allSteps.filter(s => s.status !== 'completed');
    
    return {
      canFinalize: incompleteSteps.length === 0,
      incompleteSteps: incompleteSteps.map(s => s.stepId),
      reason: incompleteSteps.length > 0 
        ? `${incompleteSteps.length} etapas não completadas` 
        : null
    };
  }

  toJSON() {
    return this.getAllLogs();
  }
}

export { StepLogger, LOG_TYPES, SUB_PHASES };
export default StepLogger;

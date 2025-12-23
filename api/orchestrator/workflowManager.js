/**
 * ====================================================================
 * PONTO. SCHOOL - WORKFLOW MANAGER
 * ====================================================================
 * 
 * Gerencia o estado do workflow de criação de aula.
 * Mantém o status de cada etapa e emite eventos para o frontend.
 * 
 * ESTADOS POSSÍVEIS:
 * - pending: Aguardando início
 * - running: Em execução
 * - completed: Finalizado com sucesso
 * - error: Finalizado com erro
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import { log, LOG_PREFIXES } from './debugLogger.js';

class WorkflowManager {
  constructor(requestId) {
    this.requestId = requestId;
    this.startTime = Date.now();
    this.steps = {
      1: { name: 'Envio de contexto', status: 'pending', startTime: null, endTime: null, data: null, error: null },
      2: { name: 'Criando conteúdo dos blocos', status: 'pending', startTime: null, endTime: null, data: null, error: null },
      3: { name: 'Sugerindo atividades', status: 'pending', startTime: null, endTime: null, data: null, error: null },
      4: { name: 'Gerando atividades', status: 'pending', startTime: null, endTime: null, data: null, error: null },
      5: { name: 'Salvando atividades', status: 'pending', startTime: null, endTime: null, data: null, error: null },
      6: { name: 'Anexando aos blocos', status: 'pending', startTime: null, endTime: null, data: null, error: null },
      7: { name: 'Finalizando aula', status: 'pending', startTime: null, endTime: null, data: null, error: null }
    };
    this.currentStep = 0;
    this.listeners = [];
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        log(LOG_PREFIXES.ERROR, `Erro ao notificar listener:`, error);
      }
    });
  }

  startStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 7) {
      throw new Error(`Etapa inválida: ${stepNumber}`);
    }

    this.currentStep = stepNumber;
    this.steps[stepNumber].status = 'running';
    this.steps[stepNumber].startTime = Date.now();

    log(LOG_PREFIXES.WORKFLOW, `[${this.requestId}] Etapa ${stepNumber} iniciada: ${this.steps[stepNumber].name}`);
    this.notifyListeners();
  }

  completeStep(stepNumber, data = null) {
    if (stepNumber < 1 || stepNumber > 7) {
      throw new Error(`Etapa inválida: ${stepNumber}`);
    }

    this.steps[stepNumber].status = 'completed';
    this.steps[stepNumber].endTime = Date.now();
    this.steps[stepNumber].data = data;

    const duration = this.steps[stepNumber].endTime - this.steps[stepNumber].startTime;
    log(LOG_PREFIXES.WORKFLOW, `[${this.requestId}] Etapa ${stepNumber} concluída em ${duration}ms`);
    this.notifyListeners();
  }

  retryingStep(stepNumber, attempt, maxAttempts) {
    if (stepNumber < 1 || stepNumber > 7) {
      throw new Error(`Etapa inválida: ${stepNumber}`);
    }

    this.steps[stepNumber].status = 'retrying';
    this.steps[stepNumber].retryCount = attempt;
    this.steps[stepNumber].maxRetries = maxAttempts;

    log(LOG_PREFIXES.WORKFLOW, `[${this.requestId}] Etapa ${stepNumber} em retry: tentativa ${attempt}/${maxAttempts}`);
    this.notifyListeners();
  }

  failStep(stepNumber, error) {
    if (stepNumber < 1 || stepNumber > 7) {
      throw new Error(`Etapa inválida: ${stepNumber}`);
    }

    this.steps[stepNumber].status = 'error';
    this.steps[stepNumber].endTime = Date.now();
    this.steps[stepNumber].error = error instanceof Error ? error.message : error;

    const duration = this.steps[stepNumber].endTime - this.steps[stepNumber].startTime;
    log(LOG_PREFIXES.ERROR, `[${this.requestId}] Etapa ${stepNumber} falhou em ${duration}ms: ${error}`);
    this.notifyListeners();
  }

  setStepLogs(stepNumber, logs) {
    if (stepNumber >= 1 && stepNumber <= 7) {
      this.steps[stepNumber].logs = logs;
    }
  }

  getState() {
    const completedSteps = Object.values(this.steps).filter(s => s.status === 'completed').length;
    const totalDuration = Date.now() - this.startTime;
    
    return {
      requestId: this.requestId,
      currentStep: this.currentStep,
      steps: this.steps,
      progress: Math.round((completedSteps / 7) * 100),
      totalDuration,
      isComplete: completedSteps === 7,
      hasError: Object.values(this.steps).some(s => s.status === 'error')
    };
  }

  getStepDuration(stepNumber) {
    const step = this.steps[stepNumber];
    if (step.startTime && step.endTime) {
      return step.endTime - step.startTime;
    }
    if (step.startTime) {
      return Date.now() - step.startTime;
    }
    return 0;
  }

  getTotalDuration() {
    return Date.now() - this.startTime;
  }

  getSummary() {
    const state = this.getState();
    return {
      requestId: this.requestId,
      totalDuration: state.totalDuration,
      progress: state.progress,
      isComplete: state.isComplete,
      hasError: state.hasError,
      stepsSummary: Object.entries(this.steps).map(([num, step]) => ({
        step: parseInt(num),
        name: step.name,
        status: step.status,
        duration: this.getStepDuration(parseInt(num))
      }))
    };
  }
}

export default WorkflowManager;

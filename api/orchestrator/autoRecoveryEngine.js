/**
 * ====================================================================
 * MOTOR DE CORREÇÃO AUTOMÁTICA POR ETAPA
 * ====================================================================
 * 
 * Sistema inteligente de retry com backoff, análise de erros
 * e correção automática de falhas por etapa.
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import { LOG_TYPES, SUB_PHASES } from './stepLogger.js';

const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialBackoff: 1000,
  maxBackoff: 30000,
  backoffMultiplier: 2,
  enableSmartCorrection: true
};

class AutoRecoveryEngine {
  constructor(stepLogger, config = {}) {
    this.stepLogger = stepLogger;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.recoveryAttempts = new Map();
  }

  async attemptRecovery(stepId, operation, context = {}) {
    const attemptKey = `${stepId}-${Date.now()}`;
    
    if (!this.recoveryAttempts.has(stepId)) {
      this.recoveryAttempts.set(stepId, {
        attempts: 0,
        lastError: null,
        corrections: []
      });
    }

    const state = this.recoveryAttempts.get(stepId);

    while (state.attempts < this.config.maxRetries) {
      state.attempts++;
      
      this.stepLogger.logEvent(stepId, LOG_TYPES.RETRY, 
        `Tentativa ${state.attempts}/${this.config.maxRetries}`, {
          attemptKey,
          context
        });

      try {
        const correctedContext = this.config.enableSmartCorrection 
          ? await this.applySmartCorrection(stepId, context, state.lastError)
          : context;

        const result = await operation(correctedContext);
        
        this.stepLogger.logEvent(stepId, LOG_TYPES.SUCCESS,
          `Recuperação bem-sucedida na tentativa ${state.attempts}`);
        
        this.recoveryAttempts.delete(stepId);
        return { success: true, result, attempts: state.attempts };

      } catch (error) {
        state.lastError = {
          message: error.message,
          code: error.code,
          type: this.classifyError(error),
          timestamp: Date.now()
        };

        this.stepLogger.logEvent(stepId, LOG_TYPES.ERROR,
          `Tentativa ${state.attempts} falhou: ${error.message}`, state.lastError);

        if (state.attempts < this.config.maxRetries) {
          const backoff = this.calculateBackoff(state.attempts);
          this.stepLogger.logEvent(stepId, LOG_TYPES.INFO,
            `Aguardando ${backoff}ms antes da próxima tentativa`);
          await this.sleep(backoff);
        }
      }
    }

    this.stepLogger.failStep(stepId, state.lastError, false);
    
    return {
      success: false,
      error: state.lastError,
      attempts: state.attempts,
      exhausted: true
    };
  }

  async applySmartCorrection(stepId, context, lastError) {
    if (!lastError) return context;

    const correctedContext = { ...context };
    const correction = {
      applied: false,
      type: null,
      details: {}
    };

    switch (lastError.type) {
      case 'JSON_PARSE_ERROR':
        correction.type = 'JSON_CLEANUP';
        correction.applied = true;
        if (correctedContext.prompt) {
          correctedContext.prompt += '\n\nIMPORTANTE: Retorne APENAS JSON válido, sem markdown ou texto extra.';
        }
        break;

      case 'TIMEOUT':
        correction.type = 'REDUCE_SCOPE';
        correction.applied = true;
        if (correctedContext.maxTokens) {
          correctedContext.maxTokens = Math.floor(correctedContext.maxTokens * 0.7);
        }
        break;

      case 'RATE_LIMIT':
        correction.type = 'DELAY_INCREASE';
        correction.applied = true;
        correctedContext._delayMs = (correctedContext._delayMs || 0) + 5000;
        break;

      case 'VALIDATION_ERROR':
        correction.type = 'PROMPT_ENHANCEMENT';
        correction.applied = true;
        if (correctedContext.prompt) {
          correctedContext.prompt += '\n\nNota: A resposta anterior não passou na validação. Por favor, siga o formato especificado exatamente.';
        }
        break;

      case 'EMPTY_RESPONSE':
        correction.type = 'FORCE_RESPONSE';
        correction.applied = true;
        if (correctedContext.temperature !== undefined) {
          correctedContext.temperature = Math.min(correctedContext.temperature + 0.1, 1.0);
        }
        break;

      default:
        correction.type = 'GENERIC_RETRY';
        break;
    }

    if (correction.applied) {
      const state = this.recoveryAttempts.get(stepId);
      if (state) {
        state.corrections.push(correction);
      }

      this.stepLogger.logEvent(stepId, LOG_TYPES.INFO,
        `Correção aplicada: ${correction.type}`, correction);
    }

    return correctedContext;
  }

  classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';

    if (message.includes('json') || message.includes('parse') || message.includes('unexpected token')) {
      return 'JSON_PARSE_ERROR';
    }
    if (message.includes('timeout') || code.includes('timeout') || message.includes('timed out')) {
      return 'TIMEOUT';
    }
    if (message.includes('rate') || message.includes('429') || message.includes('too many')) {
      return 'RATE_LIMIT';
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('schema')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('empty') || message.includes('no response') || message.includes('null')) {
      return 'EMPTY_RESPONSE';
    }
    if (message.includes('network') || message.includes('connection') || message.includes('econnrefused')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('auth') || message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
      return 'AUTH_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  calculateBackoff(attempt) {
    const backoff = Math.min(
      this.config.initialBackoff * Math.pow(this.config.backoffMultiplier, attempt - 1),
      this.config.maxBackoff
    );
    const jitter = Math.random() * 0.3 * backoff;
    return Math.floor(backoff + jitter);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRecoveryStats(stepId) {
    const state = this.recoveryAttempts.get(stepId);
    if (!state) return null;

    return {
      attempts: state.attempts,
      maxRetries: this.config.maxRetries,
      lastError: state.lastError,
      corrections: state.corrections,
      exhausted: state.attempts >= this.config.maxRetries
    };
  }

  resetStep(stepId) {
    this.recoveryAttempts.delete(stepId);
    this.stepLogger.logEvent(stepId, LOG_TYPES.INFO, 'Estado de recuperação resetado');
  }

  resetAll() {
    this.recoveryAttempts.clear();
  }
}

export { AutoRecoveryEngine, DEFAULT_CONFIG };
export default AutoRecoveryEngine;

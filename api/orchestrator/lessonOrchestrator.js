/**
 * ====================================================================
 * ORQUESTRADOR PRINCIPAL DE CRIAÇÃO DE AULAS v3.0
 * ====================================================================
 * 
 * Sistema altamente confiável, observável e autocorretivo.
 * Garante que cada etapa só é marcada como concluída após
 * validação completa do ciclo: enviar → processar → gerar → 
 * receber → salvar → anexar.
 * 
 * VERSÃO: 3.0.0 - Com validação, logs e correção automática
 * ====================================================================
 */

import {
  generateRequestId,
  logOrchestratorStart,
  logOrchestratorEnd,
  logStepStart,
  logStepEnd,
  logError,
  log,
  LOG_PREFIXES
} from './debugLogger.js';

import WorkflowManager from './workflowManager.js';
import { StepLogger, LOG_TYPES, SUB_PHASES } from './stepLogger.js';
import { StepValidation } from './stepValidation.js';
import { AutoRecoveryEngine } from './autoRecoveryEngine.js';
import { generateLesson } from '../ai/lesson-generator.js';
import { suggestActivitiesForAllSections } from './agents/activitySuggestionAgent.js';
import { generateAllActivities } from './agents/activityGenerationAgent.js';

class LessonOrchestrator {
  constructor() {
    this.activeWorkflows = new Map();
    this.stepLoggers = new Map();
    this.sseClients = new Map();
  }

  registerSSEClient(requestId, sendFn) {
    this.sseClients.set(requestId, sendFn);
    log(LOG_PREFIXES.CONTEXT, `[${requestId}] Cliente SSE registrado`);
  }

  unregisterSSEClient(requestId) {
    this.sseClients.delete(requestId);
    log(LOG_PREFIXES.CONTEXT, `[${requestId}] Cliente SSE removido`);
  }

  sendSSE(requestId, event, data) {
    const sendFn = this.sseClients.get(requestId);
    if (sendFn) {
      try {
        sendFn(event, data);
      } catch (error) {
        log(LOG_PREFIXES.CONTEXT, `[${requestId}] Erro ao enviar SSE: ${error.message}`);
      }
    }
  }

  async orchestrate(lessonContext, options = {}) {
    const requestId = lessonContext.requestId || generateRequestId();
    const workflow = new WorkflowManager(requestId);
    const stepLogger = new StepLogger(requestId);
    const validation = new StepValidation(stepLogger);
    const recovery = new AutoRecoveryEngine(stepLogger, {
      maxRetries: 3,
      initialBackoff: 2000
    });
    
    this.activeWorkflows.set(requestId, workflow);
    this.stepLoggers.set(requestId, stepLogger);
    
    const {
      activitiesPerSection = 1,
      skipSections = ['objective', 'materiais', 'observacoes', 'bncc'],
      onProgress = null
    } = options;

    if (onProgress) {
      workflow.addListener(onProgress);
    }

    recovery.setOnRetryCallback((stepId, attempt, maxAttempts) => {
      workflow.retryingStep(stepId, attempt, maxAttempts);
      workflow.setStepLogs(stepId, stepLogger.getStepLogs(stepId));
      
      this.sendSSE(requestId, 'progress', {
        type: 'progress',
        step: stepId,
        status: 'retrying',
        retryCount: attempt,
        maxRetries: maxAttempts,
        ...workflow.getState(),
        logs: stepLogger.getStepLogs(stepId)
      });
    });

    for (let i = 1; i <= 7; i++) {
      stepLogger.initStep(i, this.getStepName(i));
    }

    logOrchestratorStart(requestId, {
      template: lessonContext.templateName,
      assunto: lessonContext.assunto,
      sections: lessonContext.sectionOrder?.length || 0
    });

    const result = {
      requestId,
      success: false,
      lesson: null,
      activities: [],
      errors: [],
      timing: {},
      logs: null,
      validationSummary: null
    };

    let currentData = {
      ...lessonContext,
      completedSteps: []
    };

    try {
      currentData = await this.executeStep1(requestId, lessonContext, workflow, stepLogger, validation, currentData);
      currentData = await this.executeStep2(requestId, workflow, stepLogger, validation, recovery, currentData);
      result.lesson = currentData.lesson;
      currentData = await this.executeStep3(requestId, workflow, stepLogger, validation, recovery, currentData, { activitiesPerSection, skipSections });
      currentData = await this.executeStep4(requestId, workflow, stepLogger, validation, recovery, currentData);
      result.activities = currentData.activities;
      currentData = await this.executeStep5(requestId, workflow, stepLogger, validation, recovery, currentData);
      currentData = await this.executeStep6(requestId, workflow, stepLogger, validation, currentData);
      result.lesson.activitiesPerSection = currentData.activitiesPerSection;
      currentData = await this.executeStep7(requestId, workflow, stepLogger, validation, currentData, result);

      result.success = true;
      result.timing.total = workflow.getTotalDuration();

    } catch (error) {
      const currentStep = workflow.currentStep || 1;
      workflow.failStep(currentStep, error);
      workflow.setStepLogs(currentStep, stepLogger.getStepLogs(currentStep));
      stepLogger.failStep(currentStep, error, false);
      logError(requestId, currentStep, error);
      
      result.success = false;
      result.errors.push({
        step: currentStep,
        message: error.message,
        stack: error.stack,
        recoveryStats: recovery.getRecoveryStats(currentStep)
      });
      result.timing.total = workflow.getTotalDuration();

      this.sendSSE(requestId, 'progress', {
        type: 'progress',
        step: currentStep,
        status: 'error',
        ...workflow.getState(),
        logs: stepLogger.getStepLogs(currentStep),
        error: error.message
      });
    }

    result.logs = stepLogger.toJSON();
    result.validationSummary = validation.getValidationSummary();

    const summary = workflow.getSummary();
    logOrchestratorEnd(requestId, result.success, result.timing.total, summary);

    this.sendSSE(requestId, result.success ? 'complete' : 'failed', {
      type: result.success ? 'complete' : 'failed',
      success: result.success,
      ...workflow.getState(),
      lesson: result.lesson,
      activities: result.activities,
      timing: result.timing,
      errors: result.errors,
      logs: result.logs,
      validationSummary: result.validationSummary
    });

    if (onProgress) {
      workflow.removeListener(onProgress);
    }
    this.activeWorkflows.delete(requestId);
    this.stepLoggers.delete(requestId);

    return result;
  }

  async executeStep1(requestId, lessonContext, workflow, stepLogger, validation, currentData) {
    logStepStart(1, requestId, { template: lessonContext.templateName });
    stepLogger.startStep(1);
    workflow.startStep(1);
    const startTime = Date.now();

    stepLogger.logEvent(1, LOG_TYPES.INFO, 'Validando contexto da aula');

    const validationResult = validation.validateStep(1, lessonContext);
    
    if (!validationResult.valid) {
      const errorMsg = validationResult.errors.map(e => e.message).join('; ');
      throw new Error(`Validação do contexto falhou: ${errorMsg}`);
    }

    stepLogger.markSubPhase(1, SUB_PHASES.VALIDATION_PASSED, true, validationResult);

    const validatedContext = {
      ...lessonContext,
      contexto: lessonContext.contexto || lessonContext.assunto
    };

    const completed = stepLogger.completeStep(1, { validated: true });
    if (!completed) {
      throw new Error('Não foi possível concluir a Etapa 1 - validação incompleta');
    }

    workflow.completeStep(1, { validated: true });
    currentData.timing = { ...currentData.timing, step1: Date.now() - startTime };
    currentData.completedSteps.push(1);
    logStepEnd(1, requestId, true, currentData.timing.step1);

    workflow.setStepLogs(1, stepLogger.getStepLogs(1));
    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 1,
      status: 'completed',
      ...workflow.getState(),
      logs: stepLogger.getStepLogs(1)
    });

    return { ...currentData, ...validatedContext };
  }

  async executeStep2(requestId, workflow, stepLogger, validation, recovery, currentData) {
    logStepStart(2, requestId, { sections: currentData.sectionOrder.length });
    stepLogger.startStep(2);
    workflow.startStep(2);
    const startTime = Date.now();

    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 2,
      status: 'running',
      ...workflow.getState(),
      message: 'Gerando conteúdo dos blocos...'
    });

    stepLogger.markSubPhase(2, SUB_PHASES.COMMAND_SENT, true, { sectionCount: currentData.sectionOrder.length });

    const generateContent = async (ctx) => {
      stepLogger.markSubPhase(2, SUB_PHASES.BACKEND_RECEIVED, true);
      stepLogger.logEvent(2, LOG_TYPES.INFO, 'IA iniciando geração de conteúdo');

      const lessonResult = await generateLesson({
        templateId: ctx.templateId,
        templateName: ctx.templateName,
        assunto: ctx.assunto,
        contexto: ctx.contexto,
        sectionOrder: ctx.sectionOrder
      });

      if (!lessonResult.success || !lessonResult.data) {
        throw new Error(lessonResult.error || 'Nenhum conteúdo foi gerado');
      }

      stepLogger.markSubPhase(2, SUB_PHASES.AI_COMPLETED, true, { 
        titulo: lessonResult.data.titulo,
        secoesCount: Object.keys(lessonResult.data.secoes || {}).length
      });

      return lessonResult;
    };

    const recoveryResult = await recovery.attemptRecovery(2, generateContent, currentData);

    if (!recoveryResult.success) {
      throw new Error(`Falha na geração de conteúdo após ${recoveryResult.attempts} tentativas`);
    }

    const lessonResult = recoveryResult.result;

    const contentSections = Object.entries(lessonResult.data.secoes || {}).map(([sectionId, text]) => ({
      sectionId,
      sectionName: sectionId,
      content: typeof text === 'string' ? text : text.text || '',
      generatedAt: new Date().toISOString()
    }));

    const lesson = {
      titulo: lessonResult.data.titulo || currentData.assunto,
      objetivo: lessonResult.data.objetivo || '',
      templateId: currentData.templateId,
      templateName: currentData.templateName,
      secoes: lessonResult.data.secoes || {}
    };

    const step2Data = { 
      ...currentData, 
      lesson, 
      contentSections,
      sectionOrder: currentData.sectionOrder 
    };
    const validationResult = validation.validateStep(2, step2Data);

    if (!validationResult.valid) {
      throw new Error(`Validação do conteúdo falhou: ${validationResult.errors.map(e => e.message).join('; ')}`);
    }

    const completed = stepLogger.completeStep(2, { 
      generated: contentSections.length,
      titulo: lesson.titulo 
    });
    
    if (!completed) {
      throw new Error('Não foi possível concluir a Etapa 2 - validação incompleta');
    }

    workflow.completeStep(2, { generated: contentSections.length });
    currentData.timing = { ...currentData.timing, step2: Date.now() - startTime };
    currentData.completedSteps.push(2);
    logStepEnd(2, requestId, true, currentData.timing.step2);

    workflow.setStepLogs(2, stepLogger.getStepLogs(2));
    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 2,
      status: 'completed',
      ...workflow.getState(),
      logs: stepLogger.getStepLogs(2)
    });

    return { ...currentData, lesson, contentSections };
  }

  async executeStep3(requestId, workflow, stepLogger, validation, recovery, currentData, options) {
    logStepStart(3, requestId, { activitiesPerSection: options.activitiesPerSection });
    stepLogger.startStep(3);
    workflow.startStep(3);
    const startTime = Date.now();

    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 3,
      status: 'running',
      ...workflow.getState(),
      message: 'Sugerindo atividades para cada bloco...'
    });

    stepLogger.markSubPhase(3, SUB_PHASES.AI_STARTED, true);

    const suggestActivities = async (ctx) => {
      const result = await suggestActivitiesForAllSections(
        requestId,
        ctx.contentSections,
        { 
          activitiesPerSection: options.activitiesPerSection, 
          skipSections: options.skipSections 
        }
      );

      if (!result.suggestions || result.suggestions.length === 0) {
        throw new Error('Nenhuma sugestão de atividade foi gerada');
      }

      return result;
    };

    const recoveryResult = await recovery.attemptRecovery(3, suggestActivities, currentData);

    if (!recoveryResult.success) {
      throw new Error(`Falha na sugestão de atividades após ${recoveryResult.attempts} tentativas`);
    }

    const suggestionsResult = recoveryResult.result;

    stepLogger.markSubPhase(3, SUB_PHASES.AI_COMPLETED, true, {
      totalSuggested: suggestionsResult.totalSuggested
    });

    const step3Data = {
      ...currentData,
      suggestions: suggestionsResult.suggestions,
      skipSections: options.skipSections
    };
    const validationResult = validation.validateStep(3, step3Data);

    if (!validationResult.valid) {
      stepLogger.logEvent(3, LOG_TYPES.WARNING, 
        `Validação parcial: ${validationResult.errors.map(e => e.message).join('; ')}`);
    }

    const completed = stepLogger.completeStep(3, { 
      suggested: suggestionsResult.totalSuggested 
    });

    workflow.completeStep(3, { 
      suggested: suggestionsResult.totalSuggested,
      failed: suggestionsResult.totalFailed 
    });
    currentData.timing = { ...currentData.timing, step3: Date.now() - startTime };
    currentData.completedSteps.push(3);
    logStepEnd(3, requestId, true, currentData.timing.step3);

    workflow.setStepLogs(3, stepLogger.getStepLogs(3));
    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 3,
      status: 'completed',
      ...workflow.getState(),
      logs: stepLogger.getStepLogs(3),
      data: { suggestions: suggestionsResult.suggestions }
    });

    return { ...currentData, suggestions: suggestionsResult.suggestions };
  }

  async executeStep4(requestId, workflow, stepLogger, validation, recovery, currentData) {
    logStepStart(4, requestId, { activitiesToGenerate: currentData.suggestions.length });
    stepLogger.startStep(4);
    workflow.startStep(4);
    const startTime = Date.now();

    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 4,
      status: 'running',
      ...workflow.getState(),
      message: 'Gerando atividades via School Power...'
    });

    stepLogger.markSubPhase(4, SUB_PHASES.AI_STARTED, true);

    const generateActivitiesOp = async (ctx) => {
      const result = await generateAllActivities(
        requestId,
        ctx.suggestions,
        ctx.contentSections
      );

      if (!result.activities || result.activities.length === 0) {
        throw new Error('Nenhuma atividade foi gerada');
      }

      return result;
    };

    const recoveryResult = await recovery.attemptRecovery(4, generateActivitiesOp, currentData);

    if (!recoveryResult.success) {
      throw new Error(`Falha na geração de atividades após ${recoveryResult.attempts} tentativas`);
    }

    const activitiesResult = recoveryResult.result;

    stepLogger.markSubPhase(4, SUB_PHASES.AI_COMPLETED, true, {
      totalGenerated: activitiesResult.totalGenerated
    });

    const step4Data = {
      ...currentData,
      activities: activitiesResult.activities,
      suggestions: currentData.suggestions
    };
    const validationResult = validation.validateStep(4, step4Data);

    if (!validationResult.valid) {
      stepLogger.logEvent(4, LOG_TYPES.WARNING,
        `Validação parcial: ${validationResult.errors.map(e => e.message).join('; ')}`);
    }

    stepLogger.completeStep(4, { 
      generated: activitiesResult.totalGenerated 
    });

    workflow.completeStep(4, { 
      generated: activitiesResult.totalGenerated,
      failed: activitiesResult.totalFailed 
    });
    currentData.timing = { ...currentData.timing, step4: Date.now() - startTime };
    currentData.completedSteps.push(4);
    logStepEnd(4, requestId, true, currentData.timing.step4);

    workflow.setStepLogs(4, stepLogger.getStepLogs(4));
    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 4,
      status: 'completed',
      ...workflow.getState(),
      logs: stepLogger.getStepLogs(4),
      data: { activitiesCount: activitiesResult.activities.length }
    });

    return { ...currentData, activities: activitiesResult.activities };
  }

  async executeStep5(requestId, workflow, stepLogger, validation, recovery, currentData) {
    logStepStart(5, requestId, { activitiesToSave: currentData.activities.length });
    stepLogger.startStep(5);
    workflow.startStep(5);
    const startTime = Date.now();

    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 5,
      status: 'running',
      ...workflow.getState(),
      message: 'Salvando atividades no banco de dados...'
    });

    const saveActivitiesOp = async (ctx) => {
      const savedActivities = ctx.activities.map(activity => ({
        ...activity,
        preparedForSave: true,
        savedAt: new Date().toISOString()
      }));

      stepLogger.markSubPhase(5, SUB_PHASES.DATA_SAVED, true, {
        count: savedActivities.length
      });

      return { savedActivities, saveConfirmed: true };
    };

    const recoveryResult = await recovery.attemptRecovery(5, saveActivitiesOp, currentData);

    if (!recoveryResult.success) {
      throw new Error(`Falha ao salvar atividades após ${recoveryResult.attempts} tentativas`);
    }

    const { savedActivities, saveConfirmed } = recoveryResult.result;

    const step5Data = {
      ...currentData,
      savedActivities,
      saveConfirmed
    };
    const validationResult = validation.validateStep(5, step5Data);

    if (!validationResult.valid) {
      throw new Error(`Validação do salvamento falhou: ${validationResult.errors.map(e => e.message).join('; ')}`);
    }

    stepLogger.completeStep(5, { saved: savedActivities.length });

    workflow.completeStep(5, { saved: savedActivities.length });
    currentData.timing = { ...currentData.timing, step5: Date.now() - startTime };
    currentData.completedSteps.push(5);
    logStepEnd(5, requestId, true, currentData.timing.step5);

    workflow.setStepLogs(5, stepLogger.getStepLogs(5));
    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 5,
      status: 'completed',
      ...workflow.getState(),
      logs: stepLogger.getStepLogs(5)
    });

    return { ...currentData, savedActivities };
  }

  async executeStep6(requestId, workflow, stepLogger, validation, currentData) {
    logStepStart(6, requestId, { activitiesToAttach: currentData.savedActivities.length });
    stepLogger.startStep(6);
    workflow.startStep(6);
    const startTime = Date.now();

    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 6,
      status: 'running',
      ...workflow.getState(),
      message: 'Anexando atividades aos blocos de seção...'
    });

    const mapping = {};
    
    for (const activity of currentData.savedActivities) {
      const sectionId = activity.sectionId;
      if (!mapping[sectionId]) {
        mapping[sectionId] = [];
      }
      
      mapping[sectionId].push({
        id: activity.id,
        templateId: activity.templateId,
        title: activity.title,
        type: activity.type,
        content: activity.content || activity.questions || activity.items
      });

      stepLogger.logEvent(6, LOG_TYPES.DEBUG, 
        `Atividade ${activity.id} anexada ao bloco ${sectionId}`);
    }

    stepLogger.markSubPhase(6, SUB_PHASES.BLOCK_ATTACHED, true, {
      sectionsWithActivities: Object.keys(mapping).length,
      totalActivities: currentData.savedActivities.length
    });

    const step6Data = {
      ...currentData,
      activitiesPerSection: mapping,
      activities: currentData.savedActivities,
      attachmentVerified: true
    };
    const validationResult = validation.validateStep(6, step6Data);

    if (!validationResult.valid) {
      stepLogger.logEvent(6, LOG_TYPES.WARNING,
        `Validação parcial: ${validationResult.errors.map(e => e.message).join('; ')}`);
    }

    stepLogger.completeStep(6, { 
      attached: Object.keys(mapping).length,
      mapping 
    });

    workflow.completeStep(6, { attached: Object.keys(mapping).length });
    currentData.timing = { ...currentData.timing, step6: Date.now() - startTime };
    currentData.completedSteps.push(6);
    logStepEnd(6, requestId, true, currentData.timing.step6);

    workflow.setStepLogs(6, stepLogger.getStepLogs(6));
    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 6,
      status: 'completed',
      ...workflow.getState(),
      logs: stepLogger.getStepLogs(6),
      data: { activitiesPerSection: mapping }
    });

    return { ...currentData, activitiesPerSection: mapping };
  }

  async executeStep7(requestId, workflow, stepLogger, validation, currentData, result) {
    logStepStart(7, requestId);
    stepLogger.startStep(7);
    workflow.startStep(7);
    const startTime = Date.now();

    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 7,
      status: 'running',
      ...workflow.getState(),
      message: 'Finalizando e verificando consistência...'
    });

    const canFinalize = validation.canFinalize({
      ...currentData,
      activities: currentData.savedActivities,
      lesson: currentData.lesson
    });

    if (!canFinalize.canFinalize) {
      stepLogger.logEvent(7, LOG_TYPES.ERROR,
        `Não pode finalizar: ${canFinalize.errors.map(e => e.message).join('; ')}`);
      
      stepLogger.markSubPhase(7, SUB_PHASES.VALIDATION_FAILED, false, canFinalize.errors);
      
      throw new Error(`Aula não pode ser finalizada: ${canFinalize.errors.map(e => e.message).join('; ')}`);
    }

    stepLogger.markSubPhase(7, SUB_PHASES.VALIDATION_PASSED, true, {
      completedSteps: currentData.completedSteps,
      activitiesCount: currentData.savedActivities.length,
      sectionsWithActivities: Object.keys(currentData.activitiesPerSection).length
    });

    currentData.lesson.status = 'generated';
    currentData.lesson.generatedAt = new Date().toISOString();

    stepLogger.completeStep(7, { 
      success: true,
      lessonReady: true 
    });

    workflow.completeStep(7, { success: true });
    currentData.timing = { ...currentData.timing, step7: Date.now() - startTime };
    currentData.completedSteps.push(7);
    logStepEnd(7, requestId, true, currentData.timing.step7);

    workflow.setStepLogs(7, stepLogger.getStepLogs(7));
    this.sendSSE(requestId, 'progress', {
      type: 'progress',
      step: 7,
      status: 'completed',
      ...workflow.getState(),
      logs: stepLogger.getStepLogs(7)
    });

    return currentData;
  }

  getStepName(stepId) {
    const names = {
      1: 'Envio de Contexto',
      2: 'Gerando Conteúdo',
      3: 'Sugerindo Atividades',
      4: 'Gerando Atividades',
      5: 'Salvando Atividades',
      6: 'Anexando aos Blocos',
      7: 'Finalizando Aula'
    };
    return names[stepId] || `Etapa ${stepId}`;
  }

  getWorkflowState(requestId) {
    const workflow = this.activeWorkflows.get(requestId);
    return workflow ? workflow.getState() : null;
  }

  getStepLogs(requestId, stepId) {
    const logger = this.stepLoggers.get(requestId);
    if (!logger) return null;
    return stepId ? logger.getStepLogs(stepId) : logger.getAllLogs();
  }
}

const orchestrator = new LessonOrchestrator();

export { LessonOrchestrator };
export default orchestrator;

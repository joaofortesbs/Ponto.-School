/**
 * ====================================================================
 * ORQUESTRADOR PRINCIPAL DE CRIAÇÃO DE AULAS
 * ====================================================================
 * 
 * Coordena os agentes em sequência para criar uma aula completa
 * com conteúdo e atividades automaticamente geradas.
 * 
 * FLUXO:
 * 1. Recebe contexto (template, assunto, seções)
 * 2. USA O LESSON-GENERATOR.JS EXISTENTE para gerar conteúdo
 * 3. ActivitySuggestionAgent sugere atividades baseadas no conteúdo
 * 4. ActivityGenerationAgent gera as atividades
 * 5. Salva atividades e anexa aos blocos
 * 6. Finaliza e retorna dados completos
 * 
 * VERSÃO: 2.0.0 - Consolidado com lesson-generator.js
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
import { generateLesson } from '../ai/lesson-generator.js';
import { suggestActivitiesForAllSections } from './agents/activitySuggestionAgent.js';
import { generateAllActivities } from './agents/activityGenerationAgent.js';

class LessonOrchestrator {
  constructor() {
    this.activeWorkflows = new Map();
  }

  async orchestrate(lessonContext, options = {}) {
    const requestId = lessonContext.requestId || generateRequestId();
    const workflow = new WorkflowManager(requestId);
    
    this.activeWorkflows.set(requestId, workflow);
    
    const {
      activitiesPerSection = 1,
      skipSections = ['objective', 'materiais', 'observacoes', 'bncc'],
      onProgress = null
    } = options;

    if (onProgress) {
      workflow.addListener(onProgress);
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
      timing: {}
    };

    try {
      // ========================================
      // ETAPA 1: Envio de Contexto
      // ========================================
      logStepStart(1, requestId, { template: lessonContext.templateName });
      workflow.startStep(1);
      const step1Start = Date.now();
      
      const validatedContext = this.validateContext(lessonContext);
      
      workflow.completeStep(1, { validated: true });
      result.timing.step1 = Date.now() - step1Start;
      logStepEnd(1, requestId, true, result.timing.step1);

      // ========================================
      // ETAPA 2: Gerando Conteúdo dos Blocos
      // USANDO O LESSON-GENERATOR.JS EXISTENTE
      // ========================================
      logStepStart(2, requestId, { sections: validatedContext.sectionOrder.length });
      workflow.startStep(2);
      const step2Start = Date.now();

      log(LOG_PREFIXES.CONTENT, `[${requestId}] Chamando lesson-generator.js existente...`);
      
      const lessonResult = await generateLesson({
        templateId: validatedContext.templateId,
        templateName: validatedContext.templateName,
        assunto: validatedContext.assunto,
        contexto: validatedContext.contexto,
        sectionOrder: validatedContext.sectionOrder
      });
      
      if (!lessonResult.success || !lessonResult.data) {
        throw new Error(lessonResult.error || 'Nenhum conteúdo foi gerado');
      }

      log(LOG_PREFIXES.CONTENT, `[${requestId}] Conteúdo gerado com sucesso via lesson-generator.js`);
      
      const contentSections = Object.entries(lessonResult.data.secoes || {}).map(([sectionId, text]) => ({
        sectionId,
        sectionName: sectionId,
        content: typeof text === 'string' ? text : text.text || '',
        generatedAt: new Date().toISOString()
      }));

      workflow.completeStep(2, { 
        generated: contentSections.length,
        failed: 0 
      });
      result.timing.step2 = Date.now() - step2Start;
      result.lesson = {
        titulo: lessonResult.data.titulo || validatedContext.assunto,
        objetivo: lessonResult.data.objetivo || '',
        templateId: validatedContext.templateId,
        templateName: validatedContext.templateName,
        secoes: lessonResult.data.secoes || {}
      };
      logStepEnd(2, requestId, true, result.timing.step2);

      // ========================================
      // ETAPA 3: Sugerindo Atividades
      // ========================================
      logStepStart(3, requestId, { activitiesPerSection, skipSections });
      workflow.startStep(3);
      const step3Start = Date.now();

      const suggestionsResult = await suggestActivitiesForAllSections(
        requestId, 
        contentSections,
        { activitiesPerSection, skipSections }
      );

      workflow.completeStep(3, { 
        suggested: suggestionsResult.totalSuggested,
        failed: suggestionsResult.totalFailed 
      });
      result.timing.step3 = Date.now() - step3Start;
      logStepEnd(3, requestId, true, result.timing.step3);

      // ========================================
      // ETAPA 4: Gerando Atividades
      // ========================================
      logStepStart(4, requestId, { activitiesToGenerate: suggestionsResult.suggestions.length });
      workflow.startStep(4);
      const step4Start = Date.now();

      const activitiesResult = await generateAllActivities(
        requestId,
        suggestionsResult.suggestions,
        contentSections
      );

      workflow.completeStep(4, { 
        generated: activitiesResult.totalGenerated,
        failed: activitiesResult.totalFailed 
      });
      result.timing.step4 = Date.now() - step4Start;
      result.activities = activitiesResult.activities;
      logStepEnd(4, requestId, true, result.timing.step4);

      // ========================================
      // ETAPA 5: Salvando Atividades
      // ========================================
      logStepStart(5, requestId, { activitiesToSave: activitiesResult.activities.length });
      workflow.startStep(5);
      const step5Start = Date.now();

      const savedActivities = await this.prepareActivitiesForSave(
        requestId,
        activitiesResult.activities
      );

      workflow.completeStep(5, { saved: savedActivities.length });
      result.timing.step5 = Date.now() - step5Start;
      logStepEnd(5, requestId, true, result.timing.step5);

      // ========================================
      // ETAPA 6: Anexando aos Blocos
      // ========================================
      logStepStart(6, requestId, { activitiesToAttach: savedActivities.length });
      workflow.startStep(6);
      const step6Start = Date.now();

      const attachments = this.createActivityBlockMapping(
        requestId,
        savedActivities,
        result.lesson
      );

      result.lesson.activitiesPerSection = attachments;

      workflow.completeStep(6, { attached: Object.keys(attachments).length });
      result.timing.step6 = Date.now() - step6Start;
      logStepEnd(6, requestId, true, result.timing.step6);

      // ========================================
      // ETAPA 7: Finalizando Aula
      // ========================================
      logStepStart(7, requestId);
      workflow.startStep(7);
      const step7Start = Date.now();

      result.success = true;
      result.lesson.status = 'generated';
      result.lesson.generatedAt = new Date().toISOString();

      workflow.completeStep(7, { success: true });
      result.timing.step7 = Date.now() - step7Start;
      result.timing.total = workflow.getTotalDuration();
      logStepEnd(7, requestId, true, result.timing.step7);

    } catch (error) {
      const currentStep = workflow.currentStep || 1;
      workflow.failStep(currentStep, error);
      logError(requestId, currentStep, error);
      
      result.success = false;
      result.errors.push({
        step: currentStep,
        message: error.message,
        stack: error.stack
      });
      result.timing.total = workflow.getTotalDuration();
    }

    const summary = workflow.getSummary();
    logOrchestratorEnd(requestId, result.success, result.timing.total, summary);

    if (onProgress) {
      workflow.removeListener(onProgress);
    }
    this.activeWorkflows.delete(requestId);

    return result;
  }

  validateContext(lessonContext) {
    const required = ['templateId', 'templateName', 'assunto', 'sectionOrder'];
    const missing = required.filter(field => !lessonContext[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    }

    if (!Array.isArray(lessonContext.sectionOrder) || lessonContext.sectionOrder.length === 0) {
      throw new Error('sectionOrder deve ser um array não vazio');
    }

    return {
      ...lessonContext,
      contexto: lessonContext.contexto || lessonContext.assunto
    };
  }

  async prepareActivitiesForSave(requestId, activities) {
    log(LOG_PREFIXES.SAVE, `[${requestId}] Preparando ${activities.length} atividades para salvamento`);
    
    return activities.map(activity => ({
      ...activity,
      preparedForSave: true,
      savedAt: new Date().toISOString()
    }));
  }

  createActivityBlockMapping(requestId, activities, lesson) {
    log(LOG_PREFIXES.ATTACH, `[${requestId}] Criando mapeamento de atividades para blocos`);
    
    const mapping = {};
    
    for (const activity of activities) {
      const sectionId = activity.sectionId;
      if (!mapping[sectionId]) {
        mapping[sectionId] = [];
      }
      
      mapping[sectionId].push({
        id: activity.id,
        templateId: activity.templateId,
        title: activity.title,
        type: activity.type
      });

      log(LOG_PREFIXES.ATTACH, `[${requestId}] ${activity.id} -> ${sectionId}`);
    }

    return mapping;
  }

  getWorkflowState(requestId) {
    const workflow = this.activeWorkflows.get(requestId);
    return workflow ? workflow.getState() : null;
  }
}

const orchestrator = new LessonOrchestrator();

export { LessonOrchestrator };
export default orchestrator;

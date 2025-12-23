/**
 * ====================================================================
 * MOTOR DE VALIDAÇÃO E BLOQUEIO DE CONCLUSÃO
 * ====================================================================
 * 
 * Sistema que impede avanço ou conclusão de etapas até que
 * todas as verificações obrigatórias sejam atendidas.
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import { LOG_TYPES, SUB_PHASES } from './stepLogger.js';

const VALIDATION_RULES = {
  1: {
    name: 'Envio de Contexto',
    required: [
      { check: 'hasTemplateId', message: 'Template ID é obrigatório' },
      { check: 'hasTemplateName', message: 'Nome do template é obrigatório' },
      { check: 'hasAssunto', message: 'Assunto é obrigatório' },
      { check: 'hasSectionOrder', message: 'Ordem das seções é obrigatória' }
    ]
  },
  2: {
    name: 'Geração de Conteúdo',
    required: [
      { check: 'contentGenerated', message: 'Conteúdo não foi gerado' },
      { check: 'allSectionsHaveContent', message: 'Algumas seções não têm conteúdo' },
      { check: 'contentNotEmpty', message: 'Conteúdo está vazio' }
    ]
  },
  3: {
    name: 'Sugestão de Atividades',
    required: [
      { check: 'suggestionsGenerated', message: 'Sugestões não foram geradas' },
      { check: 'suggestionsForEligibleSections', message: 'Faltam sugestões para seções elegíveis' },
      { check: 'validActivityTypes', message: 'Tipos de atividade inválidos' }
    ]
  },
  4: {
    name: 'Geração de Input para School Power',
    required: [
      { check: 'inputGenerated', message: 'Input não foi gerado' },
      { check: 'inputHasFields', message: 'Input sem campos obrigatórios' },
      { check: 'inputIsConsolidated', message: 'Input não é consolidado' }
    ]
  },
  5: {
    name: 'Salvamento de Atividades',
    required: [
      { check: 'activitiesSaved', message: 'Atividades não foram salvas' },
      { check: 'saveConfirmed', message: 'Confirmação de salvamento não recebida' }
    ]
  },
  6: {
    name: 'Anexação aos Blocos',
    required: [
      { check: 'activitiesAttached', message: 'Atividades não foram anexadas' },
      { check: 'mappingComplete', message: 'Mapeamento de blocos incompleto' },
      { check: 'attachmentVerified', message: 'Anexação não verificada' }
    ]
  },
  7: {
    name: 'Finalização',
    required: [
      { check: 'allStepsComplete', message: 'Nem todas as etapas estão completas' },
      { check: 'dataConsistent', message: 'Dados inconsistentes' },
      { check: 'lessonReady', message: 'Aula não está pronta para uso' }
    ]
  }
};

const VALID_ACTIVITY_TYPES = [
  // IDs do catálogo schoolPowerActivities.json
  'lista-exercicios',
  'plano-aula',
  'sequencia-didatica',
  'quiz-interativo',
  'flash-cards',
  'tese-redacao',
  // Fallback IDs (compatibilidade)
  'quiz',
  'flashcards', 
  'exercise_list',
  'didactic_sequence',
  'lesson_plan',
  'essay_thesis'
];

class StepValidation {
  constructor(stepLogger) {
    this.stepLogger = stepLogger;
    this.validationResults = new Map();
  }

  validateStep(stepId, data = {}) {
    const rules = VALIDATION_RULES[stepId];
    if (!rules) {
      return { valid: true, errors: [] };
    }

    const errors = [];
    const passed = [];

    for (const rule of rules.required) {
      const result = this.runCheck(rule.check, data, stepId);
      
      if (result.passed) {
        passed.push({ check: rule.check, details: result.details });
        this.stepLogger.addValidationCheck(stepId, rule.check, true, result.details);
      } else {
        errors.push({ 
          check: rule.check, 
          message: rule.message,
          details: result.details 
        });
        this.stepLogger.addValidationCheck(stepId, rule.check, false, {
          message: rule.message,
          ...result.details
        });
      }
    }

    const result = {
      valid: errors.length === 0,
      stepId,
      stepName: rules.name,
      errors,
      passed,
      timestamp: Date.now()
    };

    this.validationResults.set(stepId, result);
    
    if (!result.valid) {
      this.stepLogger.logEvent(stepId, LOG_TYPES.WARNING,
        `Validação falhou: ${errors.length} erro(s)`, { errors });
    }

    return result;
  }

  runCheck(checkName, data, stepId) {
    const checks = {
      hasTemplateId: () => ({
        passed: !!data.templateId,
        details: { templateId: data.templateId }
      }),
      hasTemplateName: () => ({
        passed: !!data.templateName,
        details: { templateName: data.templateName }
      }),
      hasAssunto: () => ({
        passed: !!data.assunto,
        details: { assunto: data.assunto }
      }),
      hasSectionOrder: () => ({
        passed: Array.isArray(data.sectionOrder) && data.sectionOrder.length > 0,
        details: { sectionCount: data.sectionOrder?.length || 0 }
      }),

      contentGenerated: () => ({
        passed: !!data.lesson && !!data.lesson.secoes,
        details: { hasLesson: !!data.lesson }
      }),
      allSectionsHaveContent: () => {
        const secoes = data.lesson?.secoes || {};
        const sectionOrder = data.sectionOrder || [];
        const missing = sectionOrder.filter(s => {
          const content = secoes[s];
          if (!content) return true;
          // Handle both string and object content
          if (typeof content === 'string') {
            return !content.trim();
          }
          if (typeof content === 'object') {
            const stringified = JSON.stringify(content).trim();
            return !stringified || stringified === '{}' || stringified === '[]';
          }
          return true;
        });
        return {
          passed: missing.length === 0,
          details: { missing, total: sectionOrder.length }
        };
      },
      contentNotEmpty: () => {
        const secoes = data.lesson?.secoes || {};
        const totalContent = Object.values(secoes)
          .map(v => typeof v === 'string' ? v : JSON.stringify(v))
          .join('')
          .trim();
        return {
          passed: totalContent.length > 100,
          details: { contentLength: totalContent.length }
        };
      },

      suggestionsGenerated: () => ({
        passed: Array.isArray(data.suggestions) && data.suggestions.length > 0,
        details: { count: data.suggestions?.length || 0 }
      }),
      suggestionsForEligibleSections: () => {
        const skipSections = data.skipSections || ['objective', 'materiais', 'observacoes', 'bncc'];
        const eligibleSections = (data.sectionOrder || []).filter(s => !skipSections.includes(s));
        const suggestedSections = [...new Set((data.suggestions || []).map(s => s.sectionId))];
        const missing = eligibleSections.filter(s => !suggestedSections.includes(s));
        return {
          passed: missing.length === 0,
          details: { eligible: eligibleSections.length, suggested: suggestedSections.length, missing }
        };
      },
      validActivityTypes: () => {
        // Access activityId from nested suggestion object
        const types = (data.suggestions || []).map(s => s.suggestion?.activityId || s.activityType);
        const invalid = types.filter(t => !t || !VALID_ACTIVITY_TYPES.includes(t));
        return {
          passed: invalid.length === 0,
          details: { types, invalid }
        };
      },

      // ETAPA 4: Validações para Input Consolidado do School Power
      inputGenerated: () => ({
        passed: Array.isArray(data.activities) && data.activities.length > 0,
        details: { count: data.activities?.length || 0 }
      }),
      inputHasFields: () => {
        const inputs = data.activities || [];
        const withAllFields = inputs.filter(a => 
          a.input && 
          a.input.initialMessage && 
          a.input.subjects && 
          a.input.targetAudience && 
          a.input.restrictions !== undefined && 
          a.input.deliveryPeriod && 
          a.input.observations
        );
        return {
          passed: withAllFields.length === inputs.length,
          details: { 
            total: inputs.length,
            complete: withAllFields.length 
          }
        };
      },
      inputIsConsolidated: () => {
        const inputs = data.activities || [];
        const isConsolidated = inputs.length === 1 && inputs[0].isConsolidated === true;
        return {
          passed: isConsolidated,
          details: { 
            totalInputs: inputs.length,
            isConsolidated: inputs[0]?.isConsolidated || false,
            applicableSections: inputs[0]?.applicableSections?.length || 0
          }
        };
      },

      // Fallback: verificações antigas para compatibilidade
      activitiesGenerated: () => ({
        passed: Array.isArray(data.activities) && data.activities.length > 0,
        details: { count: data.activities?.length || 0 }
      }),
      activitiesHaveContent: () => {
        const withContent = (data.activities || []).filter(a => a.content || a.input || a.questions || a.items);
        return {
          passed: withContent.length === (data.activities?.length || 0),
          details: { 
            total: data.activities?.length || 0,
            withContent: withContent.length 
          }
        };
      },
      activitiesMatchSuggestions: () => {
        const suggestionCount = data.suggestions?.length || 0;
        const activityCount = data.activities?.length || 0;
        // Para input consolidado, sempre retorna true (um input cobre tudo)
        const isConsolidated = data.activities?.[0]?.isConsolidated;
        return {
          passed: isConsolidated || (activityCount >= suggestionCount * 0.8),
          details: { suggestions: suggestionCount, activities: activityCount, isConsolidated }
        };
      },

      activitiesSaved: () => ({
        passed: !!data.savedActivities && data.savedActivities.length > 0,
        details: { count: data.savedActivities?.length || 0 }
      }),
      saveConfirmed: () => ({
        passed: data.saveConfirmed === true,
        details: { confirmed: data.saveConfirmed }
      }),

      activitiesAttached: () => {
        const mapping = data.activitiesPerSection || {};
        const attachedCount = Object.values(mapping).flat().length;
        return {
          passed: attachedCount > 0,
          details: { attachedCount, sections: Object.keys(mapping).length }
        };
      },
      mappingComplete: () => {
        const activities = data.activities || [];
        const mapping = data.activitiesPerSection || {};
        const mappedIds = Object.values(mapping).flat().map(a => a.id);
        const unmapped = activities.filter(a => !mappedIds.includes(a.id));
        return {
          passed: unmapped.length === 0,
          details: { total: activities.length, mapped: mappedIds.length, unmapped: unmapped.length }
        };
      },
      attachmentVerified: () => ({
        passed: data.attachmentVerified === true,
        details: { verified: data.attachmentVerified }
      }),

      allStepsComplete: () => {
        const completedSteps = data.completedSteps || [];
        const requiredSteps = [1, 2, 3, 4, 5, 6];
        const missing = requiredSteps.filter(s => !completedSteps.includes(s));
        return {
          passed: missing.length === 0,
          details: { completed: completedSteps, missing }
        };
      },
      dataConsistent: () => {
        const hasLesson = !!data.lesson;
        const hasActivities = (data.activities?.length || 0) > 0;
        const hasMapping = Object.keys(data.activitiesPerSection || {}).length > 0;
        return {
          passed: hasLesson && hasActivities && hasMapping,
          details: { hasLesson, hasActivities, hasMapping }
        };
      },
      lessonReady: () => ({
        passed: data.lesson?.status === 'generated' && data.lesson?.generatedAt,
        details: { status: data.lesson?.status, generatedAt: data.lesson?.generatedAt }
      })
    };

    const checkFn = checks[checkName];
    if (!checkFn) {
      return { passed: true, details: { warning: 'Check não implementado' } };
    }

    try {
      return checkFn();
    } catch (error) {
      return { 
        passed: false, 
        details: { error: error.message } 
      };
    }
  }

  canAdvanceToStep(nextStepId, currentData) {
    if (nextStepId === 1) return { canAdvance: true };

    const prevStepId = nextStepId - 1;
    const prevValidation = this.validationResults.get(prevStepId);

    if (!prevValidation || !prevValidation.valid) {
      return {
        canAdvance: false,
        reason: `Etapa ${prevStepId} não foi validada`,
        blockedBy: prevStepId
      };
    }

    return { canAdvance: true };
  }

  canFinalize(allData) {
    const finalValidation = this.validateStep(7, allData);
    
    return {
      canFinalize: finalValidation.valid,
      errors: finalValidation.errors,
      allValidations: Array.from(this.validationResults.values())
    };
  }

  getValidationSummary() {
    const summary = {};
    this.validationResults.forEach((result, stepId) => {
      summary[stepId] = {
        valid: result.valid,
        errorCount: result.errors.length,
        passedCount: result.passed.length
      };
    });
    return summary;
  }
}

export { StepValidation, VALIDATION_RULES, VALID_ACTIVITY_TYPES };
export default StepValidation;

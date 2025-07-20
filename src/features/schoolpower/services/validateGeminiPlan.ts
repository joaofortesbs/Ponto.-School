
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import schoolPowerActivities from '../data/schoolPowerActivities.json';
import { GeminiActivityResponse } from './generatePersonalizedPlan';

export interface ValidationResult {
  isValid: boolean;
  validActivities: ActionPlanItem[];
  invalidActivities: GeminiActivityResponse[];
  errors: string[];
}

export function validateGeminiPlan(generatedActivities: GeminiActivityResponse[]): ValidationResult {
  console.log('🔍 Validando plano gerado pela IA Gemini...');
  console.log('📊 Atividades recebidas:', generatedActivities);

  const validActivities: ActionPlanItem[] = [];
  const invalidActivities: GeminiActivityResponse[] = [];
  const errors: string[] = [];

  // Verificar se é um array válido
  if (!Array.isArray(generatedActivities)) {
    errors.push('Resposta da IA não é um array válido');
    return {
      isValid: false,
      validActivities: [],
      invalidActivities: [],
      errors
    };
  }

  // Verificar quantidade de atividades
  if (generatedActivities.length === 0) {
    errors.push('Nenhuma atividade foi gerada');
  } else if (generatedActivities.length > 5) {
    errors.push(`Muitas atividades geradas (${generatedActivities.length}). Máximo permitido: 5`);
    generatedActivities = generatedActivities.slice(0, 5); // Limitar a 5
  }

  // Validar cada atividade
  generatedActivities.forEach((activity, index) => {
    console.log(`🔍 Validando atividade ${index + 1}:`, activity);

    // Verificar se tem campos obrigatórios
    if (!activity.id || !activity.title || !activity.description) {
      errors.push(`Atividade ${index + 1}: Campos obrigatórios ausentes (id, title, description)`);
      invalidActivities.push(activity);
      return;
    }

    // Verificar se o ID existe na lista de atividades disponíveis
    const existingActivity = schoolPowerActivities.find(a => a.id === activity.id);
    if (!existingActivity) {
      errors.push(`Atividade ${index + 1}: ID "${activity.id}" não existe na lista de atividades disponíveis`);
      invalidActivities.push(activity);
      return;
    }

    // Verificar se a atividade está habilitada
    if (!existingActivity.enabled) {
      errors.push(`Atividade ${index + 1}: ID "${activity.id}" está desabilitada`);
      invalidActivities.push(activity);
      return;
    }

    // Verificar duplicatas
    const isDuplicate = validActivities.some(validActivity => validActivity.id === activity.id);
    if (isDuplicate) {
      errors.push(`Atividade ${index + 1}: ID "${activity.id}" duplicado`);
      invalidActivities.push(activity);
      return;
    }

    // Verificar tamanho dos campos
    if (activity.title.length > 100) {
      errors.push(`Atividade ${index + 1}: Título muito longo (máximo 100 caracteres)`);
    }

    if (activity.description.length > 500) {
      errors.push(`Atividade ${index + 1}: Descrição muito longa (máximo 500 caracteres)`);
    }

    // Se chegou até aqui, a atividade é válida
    validActivities.push({
      id: activity.id,
      title: activity.title.trim(),
      description: activity.description.trim(),
      approved: false
    });

    console.log(`✅ Atividade ${index + 1} validada com sucesso`);
  });

  const isValid = validActivities.length > 0 && errors.length === 0;

  const result: ValidationResult = {
    isValid,
    validActivities,
    invalidActivities,
    errors
  };

  console.log('📊 Resultado da validação:', result);

  // Log de resumo
  if (isValid) {
    console.log(`✅ Validação concluída: ${validActivities.length} atividades válidas`);
  } else {
    console.log(`❌ Validação falhou: ${errors.length} erros encontrados`);
    console.log('🔍 Erros:', errors);
  }

  return result;
}

export function sanitizeAndFixActivities(activities: GeminiActivityResponse[]): ActionPlanItem[] {
  console.log('🔧 Sanitizando e corrigindo atividades...');

  const sanitizedActivities: ActionPlanItem[] = [];

  activities.forEach((activity, index) => {
    // Tentar corrigir problemas comuns
    let sanitizedActivity = { ...activity };

    // Corrigir ID - remover caracteres especiais e espaços
    if (sanitizedActivity.id) {
      sanitizedActivity.id = sanitizedActivity.id
        .toLowerCase()
        .replace(/[^a-z0-9\-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Truncar título se muito longo
    if (sanitizedActivity.title && sanitizedActivity.title.length > 100) {
      sanitizedActivity.title = sanitizedActivity.title.substring(0, 97) + '...';
    }

    // Truncar descrição se muito longa
    if (sanitizedActivity.description && sanitizedActivity.description.length > 500) {
      sanitizedActivity.description = sanitizedActivity.description.substring(0, 497) + '...';
    }

    // Verificar se o ID corrigido existe
    const existingActivity = schoolPowerActivities.find(a => a.id === sanitizedActivity.id);
    if (existingActivity && existingActivity.enabled) {
      sanitizedActivities.push({
        id: sanitizedActivity.id,
        title: sanitizedActivity.title?.trim() || existingActivity.title,
        description: sanitizedActivity.description?.trim() || existingActivity.description,
        approved: false
      });

      console.log(`✅ Atividade ${index + 1} sanitizada com sucesso`);
    } else {
      console.log(`❌ Atividade ${index + 1} não pôde ser corrigida: ID "${sanitizedActivity.id}" inválido`);
    }
  });

  console.log(`🔧 Sanitização concluída: ${sanitizedActivities.length} atividades válidas`);
  return sanitizedActivities;
}

export function getActivityValidationStats() {
  return {
    totalAvailableActivities: schoolPowerActivities.length,
    enabledActivities: schoolPowerActivities.filter(a => a.enabled).length,
    disabledActivities: schoolPowerActivities.filter(a => !a.enabled).length,
    uniqueTags: [...new Set(schoolPowerActivities.flatMap(a => a.tags))].length
  };
}

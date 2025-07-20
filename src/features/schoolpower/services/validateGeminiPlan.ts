
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
  console.log('📊 Atividades recebidas para validação:', generatedActivities);
  console.log('📋 Total de atividades disponíveis no JSON:', schoolPowerActivities.length);

  const validActivities: ActionPlanItem[] = [];
  const invalidActivities: GeminiActivityResponse[] = [];
  const errors: string[] = [];

  // Verificar se é um array válido
  if (!Array.isArray(generatedActivities)) {
    errors.push('Resposta da IA não é um array válido');
    console.error('❌ Resposta da IA não é um array válido');
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
    console.error('❌ Nenhuma atividade foi gerada');
  } else if (generatedActivities.length > 5) {
    errors.push(`Muitas atividades geradas (${generatedActivities.length}). Máximo permitido: 5`);
    console.warn(`⚠️ Limitando ${generatedActivities.length} atividades para 5`);
    generatedActivities = generatedActivities.slice(0, 5);
  }

  // Validar cada atividade individualmente
  generatedActivities.forEach((activity, index) => {
    console.log(`🔍 Validando atividade ${index + 1}:`, activity);

    // Verificar se tem campos obrigatórios
    if (!activity.id || !activity.title || !activity.description) {
      const error = `Atividade ${index + 1}: Campos obrigatórios ausentes (id: "${activity.id}", title: "${activity.title}", description: "${activity.description}")`;
      errors.push(error);
      invalidActivities.push(activity);
      console.error(`❌ ${error}`);
      return;
    }

    // Verificar se o ID existe na lista de atividades disponíveis
    const existingActivity = schoolPowerActivities.find(a => a.id === activity.id);
    if (!existingActivity) {
      const error = `Atividade ${index + 1}: ID "${activity.id}" não existe na lista de atividades disponíveis`;
      errors.push(error);
      invalidActivities.push(activity);
      console.error(`❌ ${error}`);
      console.log('📋 IDs disponíveis:', schoolPowerActivities.map(a => a.id));
      return;
    }

    // Verificar se a atividade está habilitada
    if (!existingActivity.enabled) {
      const error = `Atividade ${index + 1}: ID "${activity.id}" está desabilitada`;
      errors.push(error);
      invalidActivities.push(activity);
      console.error(`❌ ${error}`);
      return;
    }

    // Verificar duplicatas
    const isDuplicate = validActivities.some(validActivity => validActivity.id === activity.id);
    if (isDuplicate) {
      const error = `Atividade ${index + 1}: ID "${activity.id}" duplicado`;
      errors.push(error);
      invalidActivities.push(activity);
      console.error(`❌ ${error}`);
      return;
    }

    // Verificar tamanho dos campos para evitar problemas de renderização
    if (activity.title.length > 100) {
      console.warn(`⚠️ Atividade ${index + 1}: Título muito longo, será truncado`);
      activity.title = activity.title.substring(0, 97) + '...';
    }

    if (activity.description.length > 500) {
      console.warn(`⚠️ Atividade ${index + 1}: Descrição muito longa, será truncada`);
      activity.description = activity.description.substring(0, 497) + '...';
    }

    // Se chegou até aqui, a atividade é válida
    const validActivity: ActionPlanItem = {
      id: activity.id,
      title: activity.title.trim(),
      description: activity.description.trim(),
      approved: false
    };

    validActivities.push(validActivity);
    console.log(`✅ Atividade ${index + 1} validada com sucesso:`, validActivity);
  });

  const isValid = validActivities.length > 0 && invalidActivities.length === 0;

  const result: ValidationResult = {
    isValid,
    validActivities,
    invalidActivities,
    errors
  };

  // Log de resumo da validação
  if (isValid) {
    console.log(`✅ Validação concluída com sucesso: ${validActivities.length} atividades válidas`);
  } else {
    console.log(`⚠️ Validação concluída com problemas: ${validActivities.length} válidas, ${invalidActivities.length} inválidas`);
    console.log('🔍 Erros encontrados:', errors);
  }

  console.log('📊 Resultado final da validação:', result);
  return result;
}

export function sanitizeAndFixActivities(activities: GeminiActivityResponse[]): ActionPlanItem[] {
  console.log('🔧 Sanitizando e corrigindo atividades...');
  console.log('📋 Atividades para sanitizar:', activities);

  const sanitizedActivities: ActionPlanItem[] = [];

  activities.forEach((activity, index) => {
    console.log(`🔧 Sanitizando atividade ${index + 1}:`, activity);

    // Tentar corrigir problemas comuns
    let sanitizedActivity = { ...activity };

    // Corrigir ID - remover caracteres especiais e espaços
    if (sanitizedActivity.id) {
      const originalId = sanitizedActivity.id;
      sanitizedActivity.id = sanitizedActivity.id
        .toLowerCase()
        .replace(/[^a-z0-9\-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (originalId !== sanitizedActivity.id) {
        console.log(`🔧 ID corrigido: "${originalId}" -> "${sanitizedActivity.id}"`);
      }
    }

    // Truncar título se muito longo
    if (sanitizedActivity.title && sanitizedActivity.title.length > 100) {
      console.log(`🔧 Título truncado: ${sanitizedActivity.title.length} chars -> 100 chars`);
      sanitizedActivity.title = sanitizedActivity.title.substring(0, 97) + '...';
    }

    // Truncar descrição se muito longa
    if (sanitizedActivity.description && sanitizedActivity.description.length > 500) {
      console.log(`🔧 Descrição truncada: ${sanitizedActivity.description.length} chars -> 500 chars`);
      sanitizedActivity.description = sanitizedActivity.description.substring(0, 497) + '...';
    }

    // Verificar se o ID corrigido existe nas atividades disponíveis
    const existingActivity = schoolPowerActivities.find(a => a.id === sanitizedActivity.id);
    if (existingActivity && existingActivity.enabled) {
      const finalActivity: ActionPlanItem = {
        id: sanitizedActivity.id,
        title: sanitizedActivity.title?.trim() || existingActivity.title,
        description: sanitizedActivity.description?.trim() || existingActivity.description,
        approved: false
      };

      sanitizedActivities.push(finalActivity);
      console.log(`✅ Atividade ${index + 1} sanitizada com sucesso:`, finalActivity);
    } else {
      console.error(`❌ Atividade ${index + 1} não pôde ser corrigida: ID "${sanitizedActivity.id}" inválido ou desabilitado`);
    }
  });

  console.log(`🔧 Sanitização concluída: ${sanitizedActivities.length} atividades válidas de ${activities.length} originais`);
  return sanitizedActivities;
}

export function getActivityValidationStats() {
  const stats = {
    totalAvailableActivities: schoolPowerActivities.length,
    enabledActivities: schoolPowerActivities.filter(a => a.enabled).length,
    disabledActivities: schoolPowerActivities.filter(a => !a.enabled).length,
    uniqueTags: [...new Set(schoolPowerActivities.flatMap(a => a.tags || []))].length
  };

  console.log('📊 Estatísticas das atividades disponíveis:', stats);
  return stats;
}


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
  console.log('🔍 Iniciando validação do plano gerado pela IA Gemini...');
  console.log('📊 Atividades recebidas para validação:', generatedActivities);
  console.log('📚 Total de atividades disponíveis no sistema:', schoolPowerActivities.length);

  const validActivities: ActionPlanItem[] = [];
  const invalidActivities: GeminiActivityResponse[] = [];
  const errors: string[] = [];

  // Verificar se é um array válido
  if (!Array.isArray(generatedActivities)) {
    const error = 'Resposta da IA não é um array válido';
    console.error('❌', error);
    errors.push(error);
    return {
      isValid: false,
      validActivities: [],
      invalidActivities: [],
      errors
    };
  }

  // Verificar quantidade de atividades
  if (generatedActivities.length === 0) {
    const error = 'Nenhuma atividade foi gerada pela IA';
    console.error('❌', error);
    errors.push(error);
  } else if (generatedActivities.length > 5) {
    const warning = `Muitas atividades geradas (${generatedActivities.length}). Máximo permitido: 5`;
    console.warn('⚠️', warning);
    errors.push(warning);
    generatedActivities = generatedActivities.slice(0, 5); // Limitar a 5
    console.log('✂️ Atividades limitadas a 5:', generatedActivities.map(a => a.id));
  }

  console.log(`🔢 Validando ${generatedActivities.length} atividades...`);

  // Validar cada atividade
  generatedActivities.forEach((activity, index) => {
    console.log(`🔍 Validando atividade ${index + 1}/${generatedActivities.length}:`, {
      id: activity.id,
      title: activity.title?.substring(0, 50) + '...',
      hasDescription: !!activity.description
    });

    // Verificar se tem campos obrigatórios
    if (!activity.id || !activity.title || !activity.description) {
      const error = `Atividade ${index + 1}: Campos obrigatórios ausentes (id: ${!!activity.id}, title: ${!!activity.title}, description: ${!!activity.description})`;
      console.error('❌', error);
      errors.push(error);
      invalidActivities.push(activity);
      return;
    }

    // Verificar se o ID existe na lista de atividades disponíveis
    const existingActivity = schoolPowerActivities.find(a => a.id === activity.id);
    if (!existingActivity) {
      const error = `Atividade ${index + 1}: ID "${activity.id}" não existe na lista de atividades disponíveis`;
      console.error('❌', error);
      console.log('📋 IDs disponíveis:', schoolPowerActivities.slice(0, 10).map(a => a.id));
      errors.push(error);
      invalidActivities.push(activity);
      return;
    }

    // Verificar se a atividade está habilitada
    if (!existingActivity.enabled) {
      const error = `Atividade ${index + 1}: ID "${activity.id}" está desabilitada no sistema`;
      console.error('❌', error);
      errors.push(error);
      invalidActivities.push(activity);
      return;
    }

    // Verificar duplicatas
    const isDuplicate = validActivities.some(validActivity => validActivity.id === activity.id);
    if (isDuplicate) {
      const error = `Atividade ${index + 1}: ID "${activity.id}" duplicado`;
      console.warn('⚠️', error);
      errors.push(error);
      invalidActivities.push(activity);
      return;
    }

    // Verificar tamanho dos campos
    if (activity.title.length > 100) {
      const warning = `Atividade ${index + 1}: Título muito longo (${activity.title.length} caracteres, máximo 100)`;
      console.warn('⚠️', warning);
      errors.push(warning);
    }

    if (activity.description.length > 500) {
      const warning = `Atividade ${index + 1}: Descrição muito longa (${activity.description.length} caracteres, máximo 500)`;
      console.warn('⚠️', warning);
      errors.push(warning);
    }

    // Se chegou até aqui, a atividade é válida
    validActivities.push({
      id: activity.id,
      title: activity.title.trim(),
      description: activity.description.trim(),
      approved: false
    });

    console.log(`✅ Atividade ${index + 1} validada com sucesso: ${activity.id}`);
  });

  const isValid = validActivities.length > 0 && errors.filter(e => !e.includes('muito longo')).length === 0;

  const result: ValidationResult = {
    isValid,
    validActivities,
    invalidActivities,
    errors
  };

  // Log de resumo detalhado
  console.log('📊 RESUMO DA VALIDAÇÃO:');
  console.log(`✅ Atividades válidas: ${validActivities.length}`);
  console.log(`❌ Atividades inválidas: ${invalidActivities.length}`);
  console.log(`⚠️ Total de erros/avisos: ${errors.length}`);
  
  if (validActivities.length > 0) {
    console.log('📋 IDs das atividades válidas:', validActivities.map(a => a.id));
  }
  
  if (invalidActivities.length > 0) {
    console.log('🚫 IDs das atividades inválidas:', invalidActivities.map(a => a.id));
  }
  
  if (errors.length > 0) {
    console.log('📝 Lista de erros:', errors);
  }

  if (isValid) {
    console.log(`🎉 Validação concluída com SUCESSO: ${validActivities.length} atividades válidas`);
  } else {
    console.log(`💥 Validação FALHOU: ${errors.length} erros encontrados`);
  }

  return result;
}

export function sanitizeAndFixActivities(activities: GeminiActivityResponse[]): ActionPlanItem[] {
  console.log('🔧 Iniciando sanitização e correção de atividades...');
  console.log('📋 Atividades recebidas para sanitização:', activities.length);

  const sanitizedActivities: ActionPlanItem[] = [];

  activities.forEach((activity, index) => {
    console.log(`🔧 Sanitizando atividade ${index + 1}: ${activity.id}`);
    
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
        console.log(`🔧 ID corrigido: "${originalId}" → "${sanitizedActivity.id}"`);
      }
    }

    // Truncar título se muito longo
    if (sanitizedActivity.title && sanitizedActivity.title.length > 100) {
      const originalLength = sanitizedActivity.title.length;
      sanitizedActivity.title = sanitizedActivity.title.substring(0, 97) + '...';
      console.log(`✂️ Título truncado de ${originalLength} para ${sanitizedActivity.title.length} caracteres`);
    }

    // Truncar descrição se muito longa
    if (sanitizedActivity.description && sanitizedActivity.description.length > 500) {
      const originalLength = sanitizedActivity.description.length;
      sanitizedActivity.description = sanitizedActivity.description.substring(0, 497) + '...';
      console.log(`✂️ Descrição truncada de ${originalLength} para ${sanitizedActivity.description.length} caracteres`);
    }

    // Verificar se o ID corrigido existe e está habilitado
    const existingActivity = schoolPowerActivities.find(a => a.id === sanitizedActivity.id);
    if (existingActivity && existingActivity.enabled) {
      sanitizedActivities.push({
        id: sanitizedActivity.id,
        title: sanitizedActivity.title?.trim() || existingActivity.title,
        description: sanitizedActivity.description?.trim() || existingActivity.description,
        approved: false
      });

      console.log(`✅ Atividade ${index + 1} sanitizada com sucesso: ${sanitizedActivity.id}`);
    } else {
      console.log(`❌ Atividade ${index + 1} não pôde ser corrigida: ID "${sanitizedActivity.id}" inválido ou desabilitado`);
      
      // Tentar encontrar atividade similar
      const similarActivity = findSimilarActivity(activity.title || '', activity.description || '');
      if (similarActivity) {
        console.log(`🔍 Atividade similar encontrada: ${similarActivity.id}`);
        sanitizedActivities.push({
          id: similarActivity.id,
          title: activity.title?.trim() || similarActivity.title,
          description: activity.description?.trim() || similarActivity.description,
          approved: false
        });
      }
    }
  });

  console.log(`🔧 Sanitização concluída: ${sanitizedActivities.length}/${activities.length} atividades válidas`);
  return sanitizedActivities;
}

function findSimilarActivity(title: string, description: string): any {
  const searchText = `${title} ${description}`.toLowerCase();
  
  // Buscar por palavras-chave nas atividades disponíveis
  return schoolPowerActivities.find(activity => {
    if (!activity.enabled) return false;
    
    const activityText = `${activity.title} ${activity.description} ${activity.tags.join(' ')}`.toLowerCase();
    
    // Verificar se há palavras em comum
    const searchWords = searchText.split(/\s+/).filter(word => word.length > 3);
    const matches = searchWords.filter(word => activityText.includes(word));
    
    return matches.length > 0;
  });
}

export function getActivityValidationStats() {
  const stats = {
    totalAvailableActivities: schoolPowerActivities.length,
    enabledActivities: schoolPowerActivities.filter(a => a.enabled).length,
    disabledActivities: schoolPowerActivities.filter(a => !a.enabled).length,
    uniqueTags: [...new Set(schoolPowerActivities.flatMap(a => a.tags))].length,
    activitiesByType: {} as { [key: string]: number }
  };

  // Contar atividades por tipo de API
  schoolPowerActivities.forEach(activity => {
    const type = activity.apiType || 'unknown';
    stats.activitiesByType[type] = (stats.activitiesByType[type] || 0) + 1;
  });

  console.log('📊 Estatísticas das atividades:', stats);
  return stats;
}

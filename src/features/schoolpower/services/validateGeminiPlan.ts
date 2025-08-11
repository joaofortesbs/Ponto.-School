import schoolPowerActivities from '../data/schoolPowerActivities.json';
import { getCustomFieldsForActivity, hasCustomFields } from '../data/activityCustomFields';

/**
 * Interface para atividade retornada pela Gemini
 */
interface GeminiActivity {
  id: string;
  title?: string;
  description?: string;
  personalizedTitle?: string;
  personalizedDescription?: string;
  [key: string]: any;
}

/**
 * Interface para atividade válida
 */
interface ValidatedActivity {
  id: string;
  title: string;
  description: string;
  personalizedTitle?: string;
  personalizedDescription?: string;
  [key: string]: any; // Permite campos personalizados dinâmicos
}

/**
 * Relatório de validação
 */
interface ValidationReport {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  validActivities: ValidatedActivity[];
  invalidIds: string[];
  duplicateIds: string[];
}

/**
 * Valida se um ID de atividade existe na lista permitida
 */
function isValidActivityId(activityId: string, allowedActivities: typeof schoolPowerActivities): boolean {
  if (!activityId || typeof activityId !== 'string') {
    return false;
  }

  const normalizedId = activityId.trim().toLowerCase();

  return allowedActivities.some(activity => {
    const activityNormalizedId = activity.id.toLowerCase();
    return (
      (activityNormalizedId === normalizedId ||
       activity.id === activityId.trim()) &&
      activity.enabled
    );
  });
}

/**
 * Busca uma atividade pela ID na lista permitida
 */
function findActivityById(activityId: string, allowedActivities: typeof schoolPowerActivities) {
  return allowedActivities.find(activity =>
    activity.id === activityId.trim().toLowerCase() && activity.enabled
  );
}

/**
 * Valida os dados específicos da Sequência Didática
 */
function validateSequenciaDidaticaData(customFields: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Exemplo de validação: verificar se o campo 'duracao' existe e é um número
  if (!customFields.duracao || typeof customFields.duracao !== 'number') {
    errors.push('Duração é obrigatória e deve ser um número');
  }

  // Exemplo de validação: verificar se o campo 'objetivo' existe e é uma string não vazia
  if (!customFields.objetivo || typeof customFields.objetivo !== 'string' || customFields.objetivo.trim() === '') {
    errors.push('Objetivo é obrigatório e não pode ser vazio');
  }

  // Exemplo de validação: verificar se o campo 'publicoAlvo' existe e é uma string não vazia
  if (!customFields.publicoAlvo || typeof customFields.publicoAlvo !== 'string' || customFields.publicoAlvo.trim() === '') {
    errors.push('Público-alvo é obrigatório e não pode ser vazio');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}


/**
 * Valida uma única atividade retornada pela Gemini
 */
function validateSingleActivity(
  activity: GeminiActivity,
  allowedActivities: typeof schoolPowerActivities
): ValidatedActivity | null {
  console.log('🔍 Validando atividade:', activity);

  // Verifica se a atividade tem ID
  if (!activity.id) {
    console.warn('⚠️ Atividade sem ID ignorada:', activity);
    return null;
  }

  // Normaliza o ID
  const normalizedId = activity.id.trim().toLowerCase();

  // Verifica se o ID é válido
  if (!isValidActivityId(normalizedId, allowedActivities)) {
    console.warn(`❌ ID de atividade inválido: ${normalizedId}`);
    return null;
  }

  // Busca a atividade original
  const originalActivity = findActivityById(normalizedId, allowedActivities);

  if (!originalActivity) {
    console.warn(`❌ Atividade não encontrada: ${normalizedId}`);
    return null;
  }

  // Cria atividade validada
  const validatedActivity: ValidatedActivity = {
    id: originalActivity.id,
    title: activity.personalizedTitle || activity.title || originalActivity.name,
    description: activity.personalizedDescription || activity.description || originalActivity.description,
  };

  // Adiciona campos de personalização se existirem
  if (activity.personalizedTitle) {
    validatedActivity.personalizedTitle = activity.personalizedTitle;
  }

  if (activity.personalizedDescription) {
    validatedActivity.personalizedDescription = activity.personalizedDescription;
  }

  // Preserva todos os campos personalizados da resposta da Gemini
  const standardFields = ['id', 'title', 'description', 'duration', 'difficulty', 'category', 'type', 'personalizedTitle', 'personalizedDescription'];

  // Array para coletar warnings de validação
  const warnings: string[] = [];

  Object.keys(activity).forEach(key => {
    if (!standardFields.includes(key) && typeof activity[key] === 'string') {
      validatedActivity[key] = activity[key];
    }
  });

  // Validar campos customizados se existirem
    if (activity.customFields && Object.keys(activity.customFields).length > 0) {
      console.log(`🔍 Validando campos customizados para ${activity.id}:`, activity.customFields);

      // Validação específica para Sequência Didática
      if (activity.id === 'sequencia-didatica') {
        const validationResult = validateSequenciaDidaticaData(activity.customFields);
        if (!validationResult.isValid) {
          console.warn(`⚠️ Problemas na validação da Sequência Didática:`, validationResult.errors);
          warnings.push(`Sequência Didática: ${validationResult.errors.join(', ')}`);
        } else {
          console.log(`✅ Sequência Didática validada com sucesso`);
        }
      }
    }

  // Se houver warnings, adicionar uma chave 'validationWarnings' à atividade validada
  if (warnings.length > 0) {
    validatedActivity.validationWarnings = warnings;
  }


  console.log('✅ Atividade validada:', validatedActivity);
  return validatedActivity;
}

/**
 * Remove atividades duplicadas mantendo a primeira ocorrência
 */
function removeDuplicates(activities: ValidatedActivity[]): {
  uniqueActivities: ValidatedActivity[],
  duplicateIds: string[]
} {
  console.log('🔄 Removendo duplicatas...');

  const seen = new Set<string>();
  const uniqueActivities: ValidatedActivity[] = [];
  const duplicateIds: string[] = [];

  for (const activity of activities) {
    if (seen.has(activity.id)) {
      duplicateIds.push(activity.id);
      console.warn(`⚠️ Atividade duplicada removida: ${activity.id}`);
    } else {
      seen.add(activity.id);
      uniqueActivities.push(activity);
    }
  }

  console.log(`✅ Remoção de duplicatas concluída: ${uniqueActivities.length} únicas, ${duplicateIds.length} removidas`);
  return { uniqueActivities, duplicateIds };
}

/**
 * Gera relatório detalhado da validação
 */
function generateValidationReport(
  originalActivities: GeminiActivity[],
  validActivities: ValidatedActivity[],
  invalidIds: string[],
  duplicateIds: string[]
): ValidationReport {
  const report: ValidationReport = {
    total: originalActivities.length,
    valid: validActivities.length,
    invalid: invalidIds.length,
    duplicates: duplicateIds.length,
    validActivities,
    invalidIds,
    duplicateIds
  };

  console.log('📊 Relatório de validação:', {
    total: report.total,
    valid: report.valid,
    invalid: report.invalid,
    duplicates: report.duplicates
  });

  return report;
}

/**
 * Valida o plano completo retornado pela Gemini
 */
export async function validateGeminiPlan(
  geminiActivities: GeminiActivity[],
  allowedActivities: typeof schoolPowerActivities = schoolPowerActivities
): Promise<ValidatedActivity[]> {
  console.log('🔍 Iniciando validação do plano da Gemini...');
  console.log('📊 Dados de entrada:', {
    activitiesCount: geminiActivities.length,
    allowedCount: allowedActivities.length
  });

  // Validação dos parâmetros de entrada
  if (!Array.isArray(geminiActivities)) {
    console.error('❌ geminiActivities deve ser um array');
    throw new Error('Lista de atividades inválida');
  }

  if (!Array.isArray(allowedActivities)) {
    console.error('❌ allowedActivities deve ser um array');
    throw new Error('Lista de atividades permitidas inválida');
  }

  if (geminiActivities.length === 0) {
    console.warn('⚠️ Nenhuma atividade para validar');
    return [];
  }

  const validatedActivities: ValidatedActivity[] = [];
  const invalidIds: string[] = [];

  // Valida cada atividade individualmente
  for (let i = 0; i < geminiActivities.length; i++) {
    const activity = geminiActivities[i];
    console.log(`🔍 Validando atividade ${i + 1}/${geminiActivities.length}:`, activity);

    const validatedActivity = validateSingleActivity(activity, allowedActivities);

    if (validatedActivity) {
      validatedActivities.push(validatedActivity);
    } else {
      invalidIds.push(activity.id || `atividade-${i}`);
    }
  }

  // Remove duplicatas
  const { uniqueActivities, duplicateIds } = removeDuplicates(validatedActivities);

  // Gera relatório final
  const report = generateValidationReport(
    geminiActivities,
    uniqueActivities,
    invalidIds,
    duplicateIds
  );

  // Log de relatório detalhado
  console.log('📋 Relatório final de validação:');
  console.log(`✅ Total processado: ${report.total}`);
  console.log(`✅ Atividades válidas: ${report.valid}`);
  console.log(`❌ Atividades inválidas: ${report.invalid}`);
  console.log(`🔄 Duplicatas removidas: ${report.duplicates}`);

  if (report.invalidIds.length > 0) {
    console.warn('❌ IDs inválidos encontrados:', report.invalidIds);
  }

  if (report.duplicateIds.length > 0) {
    console.warn('🔄 IDs duplicados removidos:', report.duplicateIds);
  }

  // Alerta se muitas atividades foram rejeitadas
  if (report.valid === 0 && report.total > 0) {
    console.error('❌ CRÍTICO: Todas as atividades foram rejeitadas na validação!');
    console.error('📝 Atividades originais:', geminiActivities);
    console.error('📋 IDs permitidos:', allowedActivities.map(a => a.id));
  } else if (report.valid < report.total / 2) {
    console.warn('⚠️ ATENÇÃO: Mais da metade das atividades foram rejeitadas');
  }

  // Remove limitação de atividades para permitir geração ilimitada
  // Apenas log para acompanhamento
  if (report.validActivities) {
    console.log(`📊 Total de atividades geradas: ${report.validActivities.length}`);
  }

  console.log('✅ Validação concluída com sucesso');
  console.log('📊 Atividades aprovadas:', uniqueActivities.map(a => ({ id: a.id, title: a.title })));

  return uniqueActivities;
}

/**
 * Valida apenas os IDs de atividades (função auxiliar)
 */
export function validateActivityIds(activityIds: string[]): {
  validIds: string[];
  invalidIds: string[];
} {
  console.log('🔍 Validando IDs de atividades:', activityIds);

  const validIds: string[] = [];
  const invalidIds: string[] = [];

  for (const id of activityIds) {
    if (isValidActivityId(id, schoolPowerActivities)) {
      validIds.push(id.trim().toLowerCase());
    } else {
      invalidIds.push(id);
    }
  }

  console.log('✅ Validação de IDs concluída:', { validIds, invalidIds });
  return { validIds, invalidIds };
}

/**
 * Obtém lista de IDs de atividades válidas (função auxiliar)
 */
export function getValidActivityIds(): string[] {
  return schoolPowerActivities
    .filter(activity => activity.enabled)
    .map(activity => activity.id);
}

/**
 * Verifica se existe pelo menos uma atividade válida
 */
export function hasValidActivities(activities: GeminiActivity[]): boolean {
  return activities.some(activity =>
    activity.id && isValidActivityId(activity.id, schoolPowerActivities)
  );
}
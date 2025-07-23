import schoolPowerActivities from '../data/schoolPowerActivities.json';

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
export async function validateGeminiPlan(geminiActivities: any[], schoolPowerActivities: any[]): Promise<any[]> {
  console.log('🔍 Iniciando validação do plano da Gemini...');
  console.log('📊 Dados de entrada:', {
    activitiesCount: geminiActivities?.length || 0,
    allowedCount: schoolPowerActivities?.length || 0,
    maxProcessing: 100 // Aumentando limite de processamento
  });

  const validActivities: any[] = [];

  if (!geminiActivities || !Array.isArray(geminiActivities) || geminiActivities.length === 0) {
    console.warn('⚠️ Nenhuma atividade foi fornecida pela Gemini');
    return [];
  }

  console.log('🚀 Processando até 100 atividades da Gemini...');

  const invalidIds: string[] = [];

  // Valida cada atividade individualmente
  for (let i = 0; i < geminiActivities.length; i++) {
    const activity = geminiActivities[i];
    console.log(`🔍 Validando atividade ${i + 1}/${geminiActivities.length}:`, activity);

    const validatedActivity = validateSingleActivity(activity, schoolPowerActivities);

    if (validatedActivity) {
      validActivities.push(validatedActivity);
    } else {
      invalidIds.push(activity.id || `atividade-${i}`);
    }
  }

  // Remove duplicatas
  const { uniqueActivities, duplicateIds } = removeDuplicates(validActivities);

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
    console.error('📋 IDs permitidos:', schoolPowerActivities.map(a => a.id));
  } else if (report.valid < report.total / 2) {
    console.warn('⚠️ ATENÇÃO: Mais da metade das atividades foram rejeitadas');
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
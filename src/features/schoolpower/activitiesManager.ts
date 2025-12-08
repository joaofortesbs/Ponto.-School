
import schoolPowerActivities from './data/schoolPowerActivities.json';

export interface SchoolPowerActivity {
  id: string;
  title: string;
  description: string;
  tags: string[];
  apiType: 'gemini' | 'openai' | 'claude';
  enabled: boolean;
}

export interface ActionPlanActivity {
  id: string;
  title: string;
  description: string;
  personalizedTitle?: string;
  personalizedDescription?: string;
  approved: boolean;
}

// Chave da API Gemini para School Power
export const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';

/**
 * Encontra uma atividade do School Power pelo ID
 * @param id - Identificador único da atividade
 * @returns A atividade encontrada ou undefined
 */
export function getSchoolPowerActivityById(id: string): SchoolPowerActivity | undefined {
  return schoolPowerActivities.find(activity => activity.id === id);
}

/**
 * Filtra atividades do School Power por tag
 * @param tag - Tag para filtrar (ex: "estudo", "avaliação", "prática")
 * @returns Array de atividades que incluem a tag especificada
 */
export function listSchoolPowerActivitiesByTag(tag: string): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => 
    activity.tags.includes(tag) && activity.enabled
  );
}

/**
 * Obtém todas as atividades habilitadas do School Power
 * @returns Array de todas as atividades atualmente habilitadas
 */
export function getEnabledSchoolPowerActivities(): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => activity.enabled);
}

/**
 * Obtém todas as tags disponíveis das atividades registradas
 * @returns Array de tags únicas usadas em todas as atividades
 */
export function getAvailableActivityTags(): string[] {
  const allTags = schoolPowerActivities.flatMap(activity => activity.tags);
  return [...new Set(allTags)];
}

/**
 * Verifica se uma atividade está disponível e habilitada
 * @param id - Identificador único da atividade
 * @returns Boolean indicando se a atividade está disponível e habilitada
 */
export function isActivityEnabled(id: string): boolean {
  const activity = getSchoolPowerActivityById(id);
  return activity?.enabled ?? false;
}

/**
 * Obtém atividades por tipo de API
 * @param apiType - Tipo de API para filtrar
 * @returns Array de atividades que usam o tipo de API especificado
 */
export function getActivitiesByApiType(apiType: SchoolPowerActivity['apiType']): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => 
    activity.apiType === apiType && activity.enabled
  );
}

/**
 * Converte atividade para formato de Action Plan
 * @param activity - Atividade do School Power
 * @param personalizedTitle - Título personalizado opcional
 * @param personalizedDescription - Descrição personalizada opcional
 * @returns Atividade no formato ActionPlanActivity
 */
export function convertToActionPlanActivity(
  activity: SchoolPowerActivity,
  personalizedTitle?: string,
  personalizedDescription?: string
): ActionPlanActivity {
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    personalizedTitle,
    personalizedDescription,
    approved: false
  };
}

/**
 * Valida se um ID de atividade existe na lista
 * @param id - ID da atividade a ser validado
 * @returns Boolean indicando se o ID é válido
 */
export function validateActivityId(id: string): boolean {
  return schoolPowerActivities.some(activity => activity.id === id);
}

/**
 * Obtém estatísticas das atividades
 * @returns Objeto com estatísticas das atividades
 */
export function getActivityStats() {
  const total = schoolPowerActivities.length;
  const enabled = schoolPowerActivities.filter(a => a.enabled).length;
  const disabled = total - enabled;
  const byApiType = {
    gemini: getActivitiesByApiType('gemini').length,
    openai: getActivitiesByApiType('openai').length,
    claude: getActivitiesByApiType('claude').length
  };

  return {
    total,
    enabled,
    disabled,
    byApiType,
    tags: getAvailableActivityTags().length
  };
}

// Log de inicialização
console.log('📚 School Power Activities Manager inicializado');
console.log('📊 Estatísticas:', getActivityStats());

// Export da lista principal como default para fácil importação
export default schoolPowerActivities;

// Export nomeado para maior clareza
export { schoolPowerActivities };

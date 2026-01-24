/**
 * Configuração de Versões de Atividades - Sistema "Atividades Versão em Texto"
 * 
 * Este arquivo organiza as atividades em duas categorias:
 * 1. Atividades Interativas: Possuem interface visual completa e funcional
 * 2. Atividades Versão Texto: Geram conteúdo em formato texto enquanto a versão interativa está em desenvolvimento
 * 
 * IMPORTANTE: Uma atividade só pode pertencer a UMA categoria. Não pode ter os dois modos.
 */

export type ActivityVersionType = 'interactive' | 'text';

export interface ActivityVersionInfo {
  id: string;
  name: string;
  versionType: ActivityVersionType;
  icon: string;
  description: string;
}

/**
 * Atividades com versão INTERATIVA completa
 * Estas atividades possuem interface visual funcional e estão prontas para uso
 */
export const INTERACTIVE_ACTIVITIES: readonly string[] = [
  'lista-exercicios',
  'quiz-interativo', 
  'flash-cards'
] as const;

/**
 * Atividades com versão em TEXTO
 * Estas atividades geram conteúdo em formato texto enquanto a versão interativa está em desenvolvimento
 */
export const TEXT_VERSION_ACTIVITIES: readonly string[] = [
  'plano-aula',
  'sequencia-didatica',
  'tese-redacao'
] as const;

/**
 * Verifica se uma atividade é do tipo INTERATIVO
 * @param activityType - Tipo/ID da atividade
 * @returns true se a atividade possui versão interativa
 */
export function isInteractiveActivity(activityType: string): boolean {
  return INTERACTIVE_ACTIVITIES.includes(activityType as any);
}

/**
 * Verifica se uma atividade é do tipo VERSÃO TEXTO
 * @param activityType - Tipo/ID da atividade
 * @returns true se a atividade usa versão em texto
 */
export function isTextVersionActivity(activityType: string): boolean {
  return TEXT_VERSION_ACTIVITIES.includes(activityType as any);
}

/**
 * Obtém o tipo de versão de uma atividade
 * @param activityType - Tipo/ID da atividade
 * @returns 'interactive', 'text' ou undefined se não catalogada
 */
export function getActivityVersionType(activityType: string): ActivityVersionType | undefined {
  if (isInteractiveActivity(activityType)) return 'interactive';
  if (isTextVersionActivity(activityType)) return 'text';
  return undefined;
}

/**
 * Mapeamento de atividades com informações detalhadas
 */
export const ACTIVITY_VERSION_CATALOG: Record<string, ActivityVersionInfo> = {
  'lista-exercicios': {
    id: 'lista-exercicios',
    name: 'Lista de Exercícios',
    versionType: 'interactive',
    icon: 'BookOpen',
    description: 'Questões interativas com múltipla escolha, V/F e discursivas'
  },
  'quiz-interativo': {
    id: 'quiz-interativo',
    name: 'Quiz Interativo',
    versionType: 'interactive',
    icon: 'Gamepad',
    description: 'Quiz gamificado com pontuação e feedback instantâneo'
  },
  'flash-cards': {
    id: 'flash-cards',
    name: 'Flash Cards',
    versionType: 'interactive',
    icon: 'Star',
    description: 'Cartões de memorização com frente e verso'
  },
  'plano-aula': {
    id: 'plano-aula',
    name: 'Plano de Aula',
    versionType: 'text',
    icon: 'FileText',
    description: 'Planejamento completo de aula em formato texto'
  },
  'sequencia-didatica': {
    id: 'sequencia-didatica',
    name: 'Sequência Didática',
    versionType: 'text',
    icon: 'Calendar',
    description: 'Sequência de aulas estruturada em formato texto'
  },
  'tese-redacao': {
    id: 'tese-redacao',
    name: 'Tese de Redação',
    versionType: 'text',
    icon: 'PenTool',
    description: 'Argumentação e tese para redação em formato texto'
  }
};

/**
 * Obtém informações detalhadas de uma atividade
 * @param activityType - Tipo/ID da atividade
 * @returns Informações da atividade ou undefined
 */
export function getActivityInfo(activityType: string): ActivityVersionInfo | undefined {
  return ACTIVITY_VERSION_CATALOG[activityType];
}

/**
 * Lista todas as atividades de um determinado tipo de versão
 * @param versionType - 'interactive' ou 'text'
 * @returns Array com IDs das atividades
 */
export function getActivitiesByVersionType(versionType: ActivityVersionType): string[] {
  return Object.entries(ACTIVITY_VERSION_CATALOG)
    .filter(([_, info]) => info.versionType === versionType)
    .map(([id]) => id);
}

console.log('📋 [ActivityVersionConfig] Sistema de versões de atividades carregado');
console.log('   ✅ Atividades interativas:', INTERACTIVE_ACTIVITIES.join(', '));
console.log('   📝 Atividades em texto:', TEXT_VERSION_ACTIVITIES.join(', '));

export { modalBinderEngine } from './modalBinderEngine';
export { getFieldMap, getAllSupportedActivityTypes, isActivityTypeSupported } from './fieldMaps';
export { parseIAResponse } from './utils/parseIAResponse';
export { fillModalField } from './utils/fieldSetter';

export type { ModalBinderConfig } from './modalBinderEngine';
export type { ActivityFieldMap } from './fieldMaps';
export type { ParsedIAResponse } from './utils/parseIAResponse';

// Sistema principal exportado como default
export { modalBinderEngine as default } from './modalBinderEngine';

// Função para obter mapeamento de campos por tipo de atividade
export function getFieldMap(activityType: string): Record<string, string> {
  const fieldMaps = {
    'atividade_lista_exercicios': require('./fieldMaps/atividade_lista_exercicios').default,
    'atividade_prova': require('./fieldMaps/atividade_prova').default,
    'atividade_resumo': require('./fieldMaps/atividade_resumo').default,
    'atividade_mapa_mental': require('./fieldMaps/atividade_mapa_mental').default,
    'atividade_jogos_educativos': require('./fieldMaps/atividade_jogos_educativos').default,
    'atividade_proposta_redacao': require('./fieldMaps/atividade_proposta_redacao').default,
    'atividade_sequencia_didatica': require('./fieldMaps/atividade_sequencia_didatica').default,
    'atividade_texto_apoio': require('./fieldMaps/atividade_texto_apoio').default,
    'atividade_exemplos_contextualizados': require('./fieldMaps/atividade_exemplos_contextualizados').default,
    'atividade_criterios_avaliacao': require('./fieldMaps/atividade_criterios_avaliacao').default,
  };

  return fieldMaps[activityType] || {};
}
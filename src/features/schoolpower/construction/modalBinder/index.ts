export { modalBinderEngine } from './modalBinderEngine';
export { getFieldMap } from './fieldMaps';
export type { FieldMap, FieldSetter } from './fieldMaps';

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
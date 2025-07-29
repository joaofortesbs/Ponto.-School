
// Importar todos os field maps
import { atividade_criterios_avaliacao } from './atividade_criterios_avaliacao';
import { atividade_exemplos_contextualizados } from './atividade_exemplos_contextualizados';
import { atividade_jogos_educativos } from './atividade_jogos_educativos';
import { atividade_lista_exercicios } from './atividade_lista_exercicios';
import { atividade_mapa_mental } from './atividade_mapa_mental';
import { atividade_proposta_redacao } from './atividade_proposta_redacao';
import { atividade_prova } from './atividade_prova';
import { atividade_resumo } from './atividade_resumo';
import { atividade_sequencia_didatica } from './atividade_sequencia_didatica';
import { atividade_texto_apoio } from './atividade_texto_apoio';

// Definir tipos
export interface FieldMap {
  [key: string]: string;
}

export interface FieldSetter {
  (fieldId: string, value: string): void;
}

// Mapeamento de atividades para field maps
const fieldMaps: Record<string, FieldMap> = {
  'criterios-avaliacao': atividade_criterios_avaliacao,
  'exemplos-contextualizados': atividade_exemplos_contextualizados,
  'jogos-educativos': atividade_jogos_educativos,
  'lista-exercicios': atividade_lista_exercicios,
  'mapa-mental': atividade_mapa_mental,
  'proposta-redacao': atividade_proposta_redacao,
  'prova': atividade_prova,
  'resumo': atividade_resumo,
  'sequencia-didatica': atividade_sequencia_didatica,
  'texto-apoio': atividade_texto_apoio,
};

// Função principal para obter field map
export function getFieldMap(activityId: string): FieldMap | null {
  return fieldMaps[activityId] || null;
}

// Exportações individuais para compatibilidade
export {
  atividade_criterios_avaliacao,
  atividade_exemplos_contextualizados,
  atividade_jogos_educativos,
  atividade_lista_exercicios,
  atividade_mapa_mental,
  atividade_proposta_redacao,
  atividade_prova,
  atividade_resumo,
  atividade_sequencia_didatica,
  atividade_texto_apoio,
};

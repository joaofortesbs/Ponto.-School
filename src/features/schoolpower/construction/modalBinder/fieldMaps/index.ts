
import { activityListaExerciciosFieldMap } from './atividade_lista_exercicios';
import { activityProvaFieldMap } from './atividade_prova';
import { activityResumoFieldMap } from './atividade_resumo';
import { activityMapaMentalFieldMap } from './atividade_mapa_mental';
import { activityJogosEducativosFieldMap } from './atividade_jogos_educativos';
import { activitySequenciaDidaticaFieldMap } from './atividade_sequencia_didatica';
import { activityTextoApoioFieldMap } from './atividade_texto_apoio';
import { activityExemplosContextualizadosFieldMap } from './atividade_exemplos_contextualizados';
import { activityPropostaRedacaoFieldMap } from './atividade_proposta_redacao';
import { activityCriteriosAvaliacaoFieldMap } from './atividade_criterios_avaliacao';

export interface ActivityFieldMap {
  [key: string]: string;
}

const fieldMapsRegistry: { [activityType: string]: ActivityFieldMap } = {
  'lista-exercicios': activityListaExerciciosFieldMap,
  'prova': activityProvaFieldMap,
  'resumo': activityResumoFieldMap,
  'mapa-mental': activityMapaMentalFieldMap,
  'jogos-educativos': activityJogosEducativosFieldMap,
  'sequencia-didatica': activitySequenciaDidaticaFieldMap,
  'texto-apoio': activityTextoApoioFieldMap,
  'exemplos-contextualizados': activityExemplosContextualizadosFieldMap,
  'proposta-redacao': activityPropostaRedacaoFieldMap,
  'criterios-avaliacao': activityCriteriosAvaliacaoFieldMap,
};

export const getFieldMap = (activityType: string): ActivityFieldMap | null => {
  const fieldMap = fieldMapsRegistry[activityType];
  
  if (!fieldMap) {
    console.warn(`⚠️ Mapeamento de campos não encontrado para tipo: ${activityType}`);
    return null;
  }
  
  console.log(`📋 Mapeamento carregado para: ${activityType}`);
  return fieldMap;
};

export const getAllSupportedActivityTypes = (): string[] => {
  return Object.keys(fieldMapsRegistry);
};

export const isActivityTypeSupported = (activityType: string): boolean => {
  return activityType in fieldMapsRegistry;
};

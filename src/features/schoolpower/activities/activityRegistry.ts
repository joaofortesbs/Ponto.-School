import { lazy, LazyExoticComponent, FC } from 'react';
import { processSequenciaDidaticaData } from './sequencia-didatica';
import { PlanoAulaProcessor } from './plano-aula/planoAulaProcessor';
import { processQuadroInterativoData } from './quadro-interativo/quadroInterativoProcessor';

export interface ActivityComponentSet {
  editor: LazyExoticComponent<FC<any>>;
  preview: LazyExoticComponent<FC<any>>;
}

export interface ActivityRegistryType {
  [key: string]: ActivityComponentSet;
}

// Registro centralizado de todas as atividades disponíveis
export const activityRegistry: ActivityRegistryType = {
  // Atividades de Funções do 1º Grau
  "prova-funcao-1grau": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "lista-exercicios-funcao-1grau": {
    editor: lazy(() => import("./funcao-1grau_lista/EditActivity")),
    preview: lazy(() => import("./funcao-1grau_lista/ActivityPreview")),
  },
  "jogo-educacional-funcao-1grau": {
    editor: lazy(() => import("./funcao-1grau_jogo/EditActivity")),
    preview: lazy(() => import("./funcao-1grau_jogo/ActivityPreview")),
  },
  "atividade-contextualizada-funcao-1grau": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "funcoes-primeiro-grau": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },

  // Atividades Genéricas do School Power
  "lista-exercicios": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./lista-exercicios/ExerciseListPreview")),
  },
  "prova": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "revisao-guiada": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "jogos-educativos": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "sequencia-didatica": {
    editor: lazy(() => import("./sequencia-didatica/EditActivity")), // Importação específica para Sequência Didática
    preview: lazy(() => import("./sequencia-didatica/SequenciaDidaticaPreview")), // Importação específica para Sequência Didática
  },
  "texto-apoio": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "exemplos-contextualizados": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "mapa-mental": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "proposta-redacao": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  "criterios-avaliacao": {
    editor: lazy(() => import("./default/EditActivity")),
    preview: lazy(() => import("./default/ActivityPreview")),
  },
  // Adicionar quadro-interativo à atividade
  "quadro-interativo": {
    editor: lazy(() => import("./quadro-interativo/EditActivity")),
    preview: lazy(() => import("./quadro-interativo/QuadroInterativoPreview")),
  },view")),
  },
};

export const activityProcessors = {
  'lista-exercicios': null, // Implementar se necessário
  'plano-aula': PlanoAulaProcessor.processData,
  'sequencia-didatica': processSequenciaDidaticaData,
  'quadro-interativo': processQuadroInterativoData
};

// Função para verificar se uma atividade existe no registro
export const isActivityRegistered = (activityId: string): boolean => {
  return activityId in activityRegistry;
};

// Função para obter os componentes de uma atividade
export const getActivityComponents = (activityId: string): ActivityComponentSet | null => {
  return activityRegistry[activityId] || null;
};

// Função para obter todos os IDs de atividades registradas
export const getRegisteredActivityIds = (): string[] => {
  return Object.keys(activityRegistry);
};
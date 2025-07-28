
// activityMaterialFieldsMap.ts - Define campos obrigatórios para cada tipo de atividade

export interface ActivityFieldConfig {
  camposObrigatorios: string[];
  camposOpcionais?: string[];
}

export const activityMaterialFieldsMap: Record<string, ActivityFieldConfig> = {
  "lista-exercicios": {
    camposObrigatorios: [
      "disciplina",
      "dificuldade", 
      "formatoEntrega",
      "tempoEstimado",
      "objetivos",
      "materiais"
    ]
  },
  "prova": {
    camposObrigatorios: [
      "disciplina",
      "quantidadeQuestoes",
      "tipoQuestao", 
      "tempoEstimado",
      "criteriosAvaliacao",
      "materiais"
    ]
  },
  "resumo": {
    camposObrigatorios: [
      "disciplina",
      "extensao",
      "formatoEntrega",
      "tempoEstimado",
      "topicosAbordados"
    ]
  },
  "mapa-mental": {
    camposObrigatorios: [
      "disciplina",
      "ferramentaSugerida",
      "tempoEstimado",
      "conceituaisChave",
      "materiais"
    ]
  },
  "jogos-educativos": {
    camposObrigatorios: [
      "disciplina",
      "tipoJogo",
      "numeroParticipantes",
      "tempoEstimado",
      "materiais",
      "objetivos"
    ]
  },
  "proposta-redacao": {
    camposObrigatorios: [
      "disciplina",
      "tipoTexto",
      "extensao",
      "tempoEstimado",
      "criteriosAvaliacao",
      "tematica"
    ]
  },
  "sequencia-didatica": {
    camposObrigatorios: [
      "disciplina",
      "numeroAulas",
      "tempoEstimado",
      "objetivos",
      "materiais",
      "metodologia"
    ]
  },
  "texto-apoio": {
    camposObrigatorios: [
      "disciplina",
      "extensao",
      "formatoEntrega",
      "fontesBibliograficas",
      "nivelLeitura"
    ]
  },
  "exemplos-contextualizados": {
    camposObrigatorios: [
      "disciplina",
      "quantidadeExemplos",
      "contextoAplicacao",
      "formatoEntrega",
      "objetivos"
    ]
  },
  "criterios-avaliacao": {
    camposObrigatorios: [
      "disciplina",
      "tipoAvaliacao",
      "numeroNiveis",
      "aspectosAvaliados",
      "formatoEntrega"
    ]
  },
  "revisao-guiada": {
    camposObrigatorios: [
      "disciplina",
      "tempoEstimado",
      "topicosRevisao",
      "metodologia",
      "materiais"
    ]
  },
  "pergunte-texto": {
    camposObrigatorios: [
      "disciplina",
      "tipoTexto",
      "quantidadeQuestoes",
      "nivelComplexidade",
      "objetivos"
    ]
  },
  "lista-vocabulario": {
    camposObrigatorios: [
      "disciplina",
      "quantidadePalavras",
      "tematica",
      "formatoEntrega",
      "atividades"
    ]
  },
  "atividades-ortografia-alfabeto": {
    camposObrigatorios: [
      "disciplina",
      "focoOrtografico",
      "tempoEstimado",
      "materiais",
      "objetivos"
    ]
  },
  "plano-aula": {
    camposObrigatorios: [
      "disciplina",
      "duracaoAula",
      "objetivos",
      "metodologia",
      "materiais",
      "avaliacao"
    ]
  },
  "projeto": {
    camposObrigatorios: [
      "disciplina",
      "tipoProjeto",
      "duracaoTotal",
      "objetivos",
      "entregaveis",
      "recursos"
    ]
  },
  "simulado": {
    camposObrigatorios: [
      "disciplina",
      "quantidadeQuestoes",
      "tempoEstimado",
      "tiposQuestao",
      "criteriosAvaliacao"
    ]
  },
  "questoes-pdf": {
    camposObrigatorios: [
      "disciplina",
      "quantidadeQuestoes",
      "tiposQuestao",
      "formatoEntrega",
      "tempoEstimado"
    ]
  },
  "corretor-redacao": {
    camposObrigatorios: [
      "disciplina",
      "tipoTexto",
      "criteriosCorrecao",
      "formatoFeedback",
      "tempoEstimado"
    ]
  },
  "dinamicas-sala-aula": {
    camposObrigatorios: [
      "disciplina",
      "tipoDinamica",
      "numeroParticipantes",
      "tempoEstimado",
      "materiais",
      "objetivos"
    ]
  },
  "experimento-cientifico": {
    camposObrigatorios: [
      "disciplina",
      "tipoExperimento",
      "materiaisNecessarios",
      "tempoEstimado",
      "procedimentos",
      "objetivos"
    ]
  }
};

// Função para obter campos obrigatórios de uma atividade
export function getCamposObrigatorios(activityId: string): string[] {
  const config = activityMaterialFieldsMap[activityId];
  return config ? config.camposObrigatorios : [];
}

// Função para verificar se uma atividade tem campos obrigatórios definidos
export function hasCustomFields(activityId: string): boolean {
  return activityId in activityMaterialFieldsMap;
}

// Lista de todos os tipos de campos possíveis
export const AVAILABLE_FIELD_TYPES = [
  "disciplina",
  "dificuldade",
  "formatoEntrega", 
  "tempoEstimado",
  "objetivos",
  "materiais",
  "quantidadeQuestoes",
  "tipoQuestao",
  "criteriosAvaliacao",
  "extensao",
  "topicosAbordados",
  "ferramentaSugerida",
  "conceituaisChave",
  "tipoJogo",
  "numeroParticipantes",
  "tipoTexto",
  "tematica",
  "numeroAulas",
  "metodologia",
  "fontesBibliograficas",
  "nivelLeitura",
  "quantidadeExemplos",
  "contextoAplicacao",
  "tipoAvaliacao",
  "numeroNiveis",
  "aspectosAvaliados",
  "topicosRevisao",
  "nivelComplexidade",
  "quantidadePalavras",
  "atividades",
  "focoOrtografico",
  "duracaoAula",
  "avaliacao",
  "tipoProjeto",
  "duracaoTotal",
  "entregaveis",
  "recursos",
  "tiposQuestao",
  "formatoFeedback",
  "tipoDinamica",
  "tipoExperimento",
  "materiaisNecessarios",
  "procedimentos"
];

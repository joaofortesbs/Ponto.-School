export const activityCustomFields: Record<string, string[]> = {
  "lista-exercicios": [
    "tema",
    "disciplina",
    "anoEscolaridade",
    "quantidadeQuestoes",
    "modeloQuestoes",
    "fontes"
  ],
  "prova": [
    "tema",
    "disciplina",
    "anoEscolaridade",
    "quantidadeQuestoes",
    "tipoQuestoes",
    "tempoProva",
    "criteriosAvaliacao"
  ],
  "podcast": [
    "tema",
    "roteiro",
    "duracao",
    "recursosTecnologicos",
    "papeisAlunos",
    "formaEntrega"
  ],
  "resumo": [
    "tema",
    "disciplina",
    "fonteConteudo",
    "extensao",
    "formatoEntrega",
    "topicosChave"
  ],
  "mapa-mental": [
    "tema",
    "disciplina",
    "conceituosChave",
    "nivelComplexidade",
    "ferramentasVisuais",
    "objetivoAprendizagem"
  ],
  "jogos-educativos": [
    "tema",
    "disciplina",
    "tipoJogo",
    "numeroJogadores",
    "materiaisNecessarios",
    "tempoJogo"
  ],
  "caca-palavras": [
    "tema",
    "disciplina",
    "palavrasChave",
    "nivelDificuldade",
    "tamanhoGrade",
    "orientacoes"
  ],
  "proposta-redacao": [
    "tema",
    "generoTextual",
    "extensaoTexto",
    "criteriosAvaliacao",
    "fontesPesquisa",
    "prazoEntrega"
  ],
  "sequencia-didatica": [
    "tema",
    "disciplina",
    "numeroAulas",
    "objetivosAprendizagem",
    "metodologias",
    "avaliacaoFormativa"
  ],
  "plano-aula": [
    "tema",
    "disciplina",
    "duracao",
    "objetivos",
    "metodologia",
    "recursos",
    "avaliacao"
  ],
  "slides-didaticos": [
    "tema",
    "disciplina",
    "numeroSlides",
    "recursosVisuais",
    "interatividade",
    "publicoAlvo"
  ],
  "projeto": [
    "tema",
    "disciplina",
    "tipoProjetoo",
    "duracaoProjeto",
    "recursosNecessarios",
    "entregaveis",
    "avaliacaoProjeto"
  ],
  "atividades-matematica": [
    "tema",
    "conteudoMatematico",
    "nivelEnsino",
    "tipoAtividade",
    "recursosNecessarios",
    "aplicacaoPratica"
  ],
  "atividades-ortografia-alfabeto": [
    "tema",
    "focusOrtografico",
    "nivelAlfabetizacao",
    "tipoAtividade",
    "recursosVisuais",
    "metodologiaAplicacao"
  ],
  "palavra-cruzada": [
    "tema",
    "disciplina",
    "palavrasChave",
    "nivelDificuldade",
    "tamanhoGrade",
    "dicasIncluidas"
  ],
  "desenho-simetrico": [
    "tema",
    "tipoSimetria",
    "materiaisNecessarios",
    "nivelComplexidade",
    "objetivosGeometricos",
    "aplicacaoArtistica"
  ],
  "atividades-contos-infantis": [
    "tema",
    "contoSelecionado",
    "faixaEtaria",
    "objetivosLiterarios",
    "atividadesComplementares",
    "recursosLudicos"
  ],
  "revisao-guiada": [
    "tema",
    "disciplina",
    "conteudosRevisao",
    "metodologiaRevisao",
    "duracaoSessao",
    "avaliacaoCompreensao"
  ],
  "pergunte-texto": [
    "tema",
    "textoBase",
    "tipoQuestoes",
    "nivelCompreensao",
    "estrategiasLeitura",
    "avaliacaoTextual"
  ],
  "lista-vocabulario": [
    "tema",
    "disciplina",
    "palavrasIncluidas",
    "contextosUso",
    "atividadesFixacao",
    "avaliacaoVocabulario"
  ],
  "exemplos-contextualizados": [
    "tema",
    "disciplina",
    "contextosAplicacao",
    "exemplosPraticos",
    "situacoesReais",
    "analiseContextual"
  ]
};

/**
 * Obtém os campos personalizados para um tipo de atividade
 */
export function getCustomFieldsForActivity(activityId: string): Record<string, any> {
  // Campos específicos para lista de exercícios
  if (activityId === 'lista-exercicios') {
    return getListaExerciciosCustomFields();
  }
}

/**
 * Verifica se uma atividade possui campos personalizados
 */
export function hasCustomFields(activityId: string): boolean {
  return activityId in activityCustomFields && activityCustomFields[activityId].length > 0;
}

/**
 * Obtém todos os tipos de atividades que possuem campos personalizados
 */
export function getActivitiesWithCustomFields(): string[] {
  return Object.keys(activityCustomFields);
}
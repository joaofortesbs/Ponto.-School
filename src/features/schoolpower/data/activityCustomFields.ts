import { sequenciaDidaticaFieldMapping } from '../activities/sequencia-didatica';
import { planoAulaFieldMapping } from '../activities/plano-aula/fieldMapping';
import { quadroInterativoFieldMapping } from '../activities/quadro-interativo/fieldMapping';

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
    "Título do Tema / Assunto",
    "Ano / Série", 
    "Disciplina",
    "BNCC / Competências",
    "Público-alvo",
    "Objetivos de Aprendizagem",
    "Quantidade de Aulas",
    "Quantidade de Diagnósticos",
    "Quantidade de Avaliações",
    "Cronograma"
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

  // Campos específicos para sequência didática
  if (activityId === 'sequencia-didatica') {
    return getSequenciaDidaticaCustomFields();
  }
}

/**
 * Obtém os campos personalizados específicos para Sequência Didática
 */
function getSequenciaDidaticaCustomFields(): Record<string, any> {
  return {
    'Título do Tema / Assunto': {
      type: 'text',
      label: 'Título do Tema / Assunto',
      placeholder: 'Ex: Substantivos Próprios e Verbos',
      required: true
    },
    'Ano / Série': {
      type: 'text', 
      label: 'Ano / Série',
      placeholder: 'Ex: 6º ano do Ensino Fundamental',
      required: true
    },
    'Disciplina': {
      type: 'select',
      label: 'Disciplina',
      options: ['Português', 'Matemática', 'Geografia', 'História', 'Ciências', 'Inglês', 'Arte', 'Educação Física'],
      required: true
    },
    'BNCC / Competências': {
      type: 'text',
      label: 'BNCC / Competências (opcional)',
      placeholder: 'Ex: EF67LP32, EF67LP33',
      required: false
    },
    'Público-alvo': {
      type: 'text',
      label: 'Público-alvo',
      placeholder: 'Ex: Ensino Fundamental II',
      required: true
    },
    'Objetivos de Aprendizagem': {
      type: 'textarea',
      label: 'Objetivos de Aprendizagem',
      placeholder: 'Liste os objetivos de aprendizagem da sequência didática...',
      required: true
    },
    'Quantidade de Aulas': {
      type: 'number',
      label: 'Quantidade de Aulas',
      placeholder: 'Ex: 8',
      required: true
    },
    'Quantidade de Diagnósticos': {
      type: 'number',
      label: 'Quantidade de Diagnósticos',
      placeholder: 'Ex: 2',
      required: true
    },
    'Quantidade de Avaliações': {
      type: 'number',
      label: 'Quantidade de Avaliações',
      placeholder: 'Ex: 3',
      required: true
    },
    'Cronograma': {
      type: 'textarea',
      label: 'Cronograma (opcional)',
      placeholder: 'Descreva o cronograma das aulas ou ordem sequencial...',
      required: false
    }
  };
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
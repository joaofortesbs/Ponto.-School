
export interface QuadroInterativoFields {
  disciplina: string;
  anoSerie: string;
  tema: string;
  objetivo: string;
  nivelDificuldade: string;
  atividadeMostrada: string;
}

export const quadroInterativoFieldMapping = {
  'Disciplina / Área de conhecimento': 'disciplina',
  'Disciplina': 'disciplina',
  'Área de conhecimento': 'disciplina',
  'Ano / Série': 'anoSerie',
  'Ano': 'anoSerie',
  'Série': 'anoSerie',
  'Tema ou Assunto da aula': 'tema',
  'Tema': 'tema',
  'Assunto': 'tema',
  'Objetivo de aprendizagem da aula': 'objetivo',
  'Objetivo': 'objetivo',
  'Objetivos': 'objetivo',
  'Nível de Dificuldade': 'nivelDificuldade',
  'Dificuldade': 'nivelDificuldade',
  'Atividade mostrada': 'atividadeMostrada',
  'Atividade': 'atividadeMostrada',
  'Atividades': 'atividadeMostrada'
};

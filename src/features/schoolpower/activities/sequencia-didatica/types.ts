
export interface SequenciaDidaticaData {
  id: string;
  title: string;
  type: 'sequencia-didatica';
  tituloTemaAssunto: string;
  disciplina: string;
  anoSerie: string;
  quantidadeAulas: string;
  publicoAlvo?: string;
  objetivosAprendizagem?: string;
  bnccCompetencias?: string;
  quantidadeDiagnosticos?: string;
  quantidadeAvaliacoes?: string;
  cronograma?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SequenciaDidaticaFormData {
  tituloTemaAssunto: string;
  disciplina: string;
  anoSerie: string;
  quantidadeAulas: string;
  publicoAlvo?: string;
  objetivosAprendizagem?: string;
  bnccCompetencias?: string;
  quantidadeDiagnosticos?: string;
  quantidadeAvaliacoes?: string;
  cronograma?: string;
}

export interface AulaSequencia {
  numero: number;
  titulo: string;
  objetivos: string[];
  conteudo: string;
  metodologia: string;
  recursos: string[];
  avaliacao?: string;
  tempoDuracao: string;
}

export interface AtividadeDiagnostica {
  id: string;
  titulo: string;
  descricao: string;
  criterios: string[];
  instrumentos: string[];
}

export interface AtividadeAvaliativa {
  id: string;
  titulo: string;
  descricao: string;
  criterios: string[];
  peso: number;
  tipo: 'formativa' | 'somativa';
}

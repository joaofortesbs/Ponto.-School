
import { ActivityFormData } from '../../construction/types/ActivityTypes';

export interface SequenciaDidaticaCustomFields {
  [key: string]: string;
}

export interface SequenciaDidaticaActivity {
  id: string;
  title: string;
  description: string;
  customFields: SequenciaDidaticaCustomFields;
  personalizedTitle?: string;
  personalizedDescription?: string;
}

export interface SequenciaDidaticaData {
  tituloTemaAssunto: string;
  anoSerie: string;
  disciplina: string;
  bnccCompetencias: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma: string;
}

export const sequenciaDidaticaFieldMapping = {
  'Título do Tema / Assunto': 'tituloTemaAssunto',
  'Ano / Série': 'anoSerie',
  'Disciplina': 'disciplina',
  'BNCC / Competências': 'bnccCompetencias',
  'Público-alvo': 'publicoAlvo',
  'Objetivos de Aprendizagem': 'objetivosAprendizagem',
  'Quantidade de Aulas': 'quantidadeAulas',
  'Quantidade de Diagnósticos': 'quantidadeDiagnosticos',
  'Quantidade de Avaliações': 'quantidadeAvaliacoes',
  'Cronograma': 'cronograma'
};

export function processSequenciaDidaticaData(formData: ActivityFormData): SequenciaDidaticaData {
  console.log('🔄 Processando dados da Sequência Didática:', formData);

  const processedData: SequenciaDidaticaData = {
    tituloTemaAssunto: formData.tituloTemaAssunto || formData.title || '',
    anoSerie: formData.anoSerie || formData.schoolYear || '',
    disciplina: formData.disciplina || formData.subject || '',
    bnccCompetencias: formData.bnccCompetencias || formData.competencies || '',
    publicoAlvo: formData.publicoAlvo || formData.context || '',
    objetivosAprendizagem: formData.objetivosAprendizagem || formData.objectives || '',
    quantidadeAulas: formData.quantidadeAulas || '4',
    quantidadeDiagnosticos: formData.quantidadeDiagnosticos || '2',
    quantidadeAvaliacoes: formData.quantidadeAvaliacoes || '2',
    cronograma: formData.cronograma || ''
  };

  console.log('✅ Dados processados da Sequência Didática:', processedData);
  return processedData;
}

export function validateSequenciaDidaticaData(data: SequenciaDidaticaData): boolean {
  const requiredFields = [
    'tituloTemaAssunto',
    'disciplina',
    'anoSerie',
    'publicoAlvo',
    'objetivosAprendizagem'
  ];

  for (const field of requiredFields) {
    if (!data[field as keyof SequenciaDidaticaData]?.trim()) {
      console.error(`❌ Campo obrigatório ausente: ${field}`);
      return false;
    }
  }

  return true;
}

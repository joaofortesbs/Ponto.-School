
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

export function validateSequenciaDidaticaData(data: SequenciaDidaticaData): boolean {
  console.log('🔍 Validando dados da Sequência Didática:', data);
  
  const requiredFields = [
    'tituloTemaAssunto',
    'anoSerie', 
    'disciplina',
    'publicoAlvo',
    'objetivosAprendizagem'
  ];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      console.warn(`⚠️ Campo obrigatório ausente: ${field}`);
      return false;
    }
  }
  
  console.log('✅ Dados validados com sucesso');
  return true;
}

export function processSequenciaDidaticaData(formData: ActivityFormData): SequenciaDidaticaData {
  console.log('🔄 Processando dados da Sequência Didática:', formData);

  // Extrair dados dos campos customizados
  const customFields = formData.customFields || {};
  
  return {
    tituloTemaAssunto: customFields['Título do Tema / Assunto'] || 
                      formData.tituloTemaAssunto || 
                      formData.title || 
                      'Sequência Didática',
    anoSerie: customFields['Ano / Série'] || 
              formData.anoSerie || 
              '6º Ano',
    disciplina: customFields['Disciplina'] || 
                formData.disciplina || 
                'Matemática',
    bnccCompetencias: customFields['BNCC / Competências'] || 
                      formData.bnccCompetencias || 
                      'Competências específicas da BNCC',
    publicoAlvo: customFields['Público-alvo'] || 
                 formData.publicoAlvo || 
                 'Estudantes do ensino fundamental',
    objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || 
                          formData.objetivosAprendizagem || 
                          'Desenvolver habilidades específicas da disciplina',
    quantidadeAulas: customFields['Quantidade de Aulas'] || 
                     formData.quantidadeAulas || 
                     '4',
    quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || 
                           formData.quantidadeDiagnosticos || 
                           '1',
    quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || 
                         formData.quantidadeAvaliacoes || 
                         '1',
    cronograma: customFields['Cronograma'] || 
                formData.cronograma || 
                'Conforme cronograma escolar'
  };
}, formData);

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
  console.log('🔍 Validando dados da Sequência Didática:', data);

  const requiredFields = [
    'tituloTemaAssunto',
    'disciplina',
    'anoSerie',
    'publicoAlvo',
    'objetivosAprendizagem'
  ];

  const errors: string[] = [];

  requiredFields.forEach(field => {
    if (!data[field as keyof SequenciaDidaticaData] || 
        !data[field as keyof SequenciaDidaticaData].trim()) {
      errors.push(`Campo obrigatório: ${field}`);
    }
  });

  // Validar campos numéricos
  const quantidadeAulas = parseInt(data.quantidadeAulas) || 0;
  const quantidadeDiagnosticos = parseInt(data.quantidadeDiagnosticos) || 0;
  const quantidadeAvaliacoes = parseInt(data.quantidadeAvaliacoes) || 0;

  if (quantidadeAulas < 1 || quantidadeAulas > 20) {
    errors.push('Quantidade de aulas deve ser entre 1 e 20');
  }

  if (quantidadeDiagnosticos < 1 || quantidadeDiagnosticos > 10) {
    errors.push('Quantidade de diagnósticos deve ser entre 1 e 10');
  }

  if (quantidadeAvaliacoes < 1 || quantidadeAvaliacoes > 10) {
    errors.push('Quantidade de avaliações deve ser entre 1 e 10');
  }

  if (errors.length > 0) {
    console.warn('❌ Erros de validação encontrados:', errors);
    return false;
  }

  console.log('✅ Dados válidos para Sequência Didática');
  return true;
}

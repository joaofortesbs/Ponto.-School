
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

export function processSequenciaDidaticaData(formData: any, customFields: any = {}): SequenciaDidaticaData {
  console.log('📊 Processando dados da Sequência Didática:', { formData, customFields });

  return {
    tituloTemaAssunto: formData.tituloTemaAssunto || 
                      customFields['Título do Tema / Assunto'] || 
                      formData.title || '',
    anoSerie: formData.anoSerie || 
              customFields['Ano / Série'] || 
              formData.schoolYear || '',
    disciplina: formData.disciplina || 
                customFields['Disciplina'] || 
                formData.subject || '',
    bnccCompetencias: formData.bnccCompetencias || 
                     customFields['BNCC / Competências'] || 
                     formData.competencies || '',
    publicoAlvo: formData.publicoAlvo || 
                customFields['Público-alvo'] || 
                formData.context || '',
    objetivosAprendizagem: formData.objetivosAprendizagem || 
                          customFields['Objetivos de Aprendizagem'] || 
                          formData.objectives || '',
    quantidadeAulas: formData.quantidadeAulas || 
                    customFields['Quantidade de Aulas'] || '4',
    quantidadeDiagnosticos: formData.quantidadeDiagnosticos || 
                           customFields['Quantidade de Diagnósticos'] || '1',
    quantidadeAvaliacoes: formData.quantidadeAvaliacoes || 
                         customFields['Quantidade de Avaliações'] || '2',
    cronograma: formData.cronograma || 
                customFields['Cronograma'] || 
                formData.timeLimit || ''
  };
}

export function validateSequenciaDidaticaData(data: SequenciaDidaticaData): string[] {
  const errors: string[] = [];

  if (!data.tituloTemaAssunto?.trim()) {
    errors.push('Título do Tema / Assunto é obrigatório');
  }

  if (!data.disciplina?.trim()) {
    errors.push('Disciplina é obrigatória');
  }

  if (!data.anoSerie?.trim()) {
    errors.push('Ano / Série é obrigatório');
  }

  if (!data.publicoAlvo?.trim()) {
    errors.push('Público-alvo é obrigatório');
  }

  if (!data.objetivosAprendizagem?.trim()) {
    errors.push('Objetivos de Aprendizagem são obrigatórios');
  }

  const quantidadeAulas = parseInt(data.quantidadeAulas);
  if (isNaN(quantidadeAulas) || quantidadeAulas < 1) {
    errors.push('Quantidade de Aulas deve ser um número maior que 0');
  }

  const quantidadeDiagnosticos = parseInt(data.quantidadeDiagnosticos);
  if (isNaN(quantidadeDiagnosticos) || quantidadeDiagnosticos < 0) {
    errors.push('Quantidade de Diagnósticos deve ser um número válido');
  }

  const quantidadeAvaliacoes = parseInt(data.quantidadeAvaliacoes);
  if (isNaN(quantidadeAvaliacoes) || quantidadeAvaliacoes < 0) {
    errors.push('Quantidade de Avaliações deve ser um número válido');
  }

  return errors;
}

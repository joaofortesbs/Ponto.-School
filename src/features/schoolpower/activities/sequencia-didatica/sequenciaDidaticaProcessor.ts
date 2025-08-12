
export interface SequenciaDidaticaData {
  tituloTemaAssunto: string;
  anoSerie: string;
  disciplina: string;
  bnccCompetencias?: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSequenciaDidaticaData(data: SequenciaDidaticaData): ValidationResult {
  const errors: string[] = [];

  console.log('🔍 Validando dados da sequência didática:', data);

  // Validações obrigatórias
  if (!data.tituloTemaAssunto?.trim()) {
    errors.push('Título do tema/assunto é obrigatório');
  }

  if (!data.anoSerie?.trim()) {
    errors.push('Ano/série é obrigatório');
  }

  if (!data.disciplina?.trim()) {
    errors.push('Disciplina é obrigatória');
  }

  if (!data.publicoAlvo?.trim()) {
    errors.push('Público-alvo é obrigatório');
  }

  if (!data.objetivosAprendizagem?.trim()) {
    errors.push('Objetivos de aprendizagem são obrigatórios');
  }

  if (!data.quantidadeAulas?.trim()) {
    errors.push('Quantidade de aulas é obrigatória');
  } else {
    const quantAulas = parseInt(data.quantidadeAulas);
    if (isNaN(quantAulas) || quantAulas < 1) {
      errors.push('Quantidade de aulas deve ser um número maior que 0');
    }
  }

  if (!data.quantidadeDiagnosticos?.trim()) {
    errors.push('Quantidade de diagnósticos é obrigatória');
  } else {
    const quantDiag = parseInt(data.quantidadeDiagnosticos);
    if (isNaN(quantDiag) || quantDiag < 0) {
      errors.push('Quantidade de diagnósticos deve ser um número maior ou igual a 0');
    }
  }

  if (!data.quantidadeAvaliacoes?.trim()) {
    errors.push('Quantidade de avaliações é obrigatória');
  } else {
    const quantAval = parseInt(data.quantidadeAvaliacoes);
    if (isNaN(quantAval) || quantAval < 0) {
      errors.push('Quantidade de avaliações deve ser um número maior ou igual a 0');
    }
  }

  const isValid = errors.length === 0;
  console.log(`${isValid ? '✅' : '❌'} Validação ${isValid ? 'passou' : 'falhou'}:`, errors);

  return {
    valid: isValid,
    errors
  };
}

export function processSequenciaDidaticaData(rawData: any): SequenciaDidaticaData {
  console.log('🔄 Processando dados brutos:', rawData);

  const processed: SequenciaDidaticaData = {
    tituloTemaAssunto: rawData.tituloTemaAssunto || rawData.title || '',
    anoSerie: rawData.anoSerie || rawData.schoolYear || '',
    disciplina: rawData.disciplina || rawData.subject || '',
    bnccCompetencias: rawData.bnccCompetencias || rawData.competencies || '',
    publicoAlvo: rawData.publicoAlvo || rawData.context || '',
    objetivosAprendizagem: rawData.objetivosAprendizagem || rawData.objectives || '',
    quantidadeAulas: rawData.quantidadeAulas || '4',
    quantidadeDiagnosticos: rawData.quantidadeDiagnosticos || '1',
    quantidadeAvaliacoes: rawData.quantidadeAvaliacoes || '1',
    cronograma: rawData.cronograma || ''
  };

  console.log('✅ Dados processados:', processed);
  return processed;
}

export function activityFormToSequenciaData(formData: any): SequenciaDidaticaData {
  console.log('🔄 Convertendo dados do formulário:', formData);

  return {
    tituloTemaAssunto: formData.tituloTemaAssunto || formData.title || '',
    anoSerie: formData.anoSerie || formData.schoolYear || '',
    disciplina: formData.disciplina || formData.subject || '',
    bnccCompetencias: formData.bnccCompetencias || formData.competencies || '',
    publicoAlvo: formData.publicoAlvo || formData.context || '',
    objetivosAprendizagem: formData.objetivosAprendizagem || formData.objectives || '',
    quantidadeAulas: formData.quantidadeAulas || '4',
    quantidadeDiagnosticos: formData.quantidadeDiagnosticos || '1',
    quantidadeAvaliacoes: formData.quantidadeAvaliacoes || '1',
    cronograma: formData.cronograma || ''
  };
}

// Mapeamento de campos para compatibilidade
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

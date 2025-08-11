
export interface SequenciaDidaticaValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateSequenciaDidaticaFields = (customFields: Record<string, string>): SequenciaDidaticaValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Campos obrigatórios
  const requiredFields = [
    'Título do Tema / Assunto',
    'Ano / Série',
    'Disciplina',
    'Público-alvo',
    'Objetivos de Aprendizagem',
    'Quantidade de Aulas',
    'Quantidade de Diagnósticos',
    'Quantidade de Avaliações'
  ];

  // Verificar campos obrigatórios
  requiredFields.forEach(field => {
    if (!customFields[field] || customFields[field].trim() === '') {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  });

  // Validações específicas
  const quantidadeAulas = parseInt(customFields['Quantidade de Aulas'] || '0');
  if (quantidadeAulas < 4 || quantidadeAulas > 12) {
    warnings.push('Quantidade de aulas deve estar entre 4 e 12');
  }

  const quantidadeDiagnosticos = parseInt(customFields['Quantidade de Diagnósticos'] || '0');
  if (quantidadeDiagnosticos < 1 || quantidadeDiagnosticos > 3) {
    warnings.push('Quantidade de diagnósticos deve estar entre 1 e 3');
  }

  const quantidadeAvaliacoes = parseInt(customFields['Quantidade de Avaliações'] || '0');
  if (quantidadeAvaliacoes < 2 || quantidadeAvaliacoes > 4) {
    warnings.push('Quantidade de avaliações deve estar entre 2 e 4');
  }

  // Verificar se não estão usando campos incorretos
  const incorrectFields = ['Tema Central', 'Objetivos', 'Etapas', 'Recursos', 'Avaliação'];
  incorrectFields.forEach(field => {
    if (customFields[field]) {
      warnings.push(`Campo "${field}" detectado - deve ser mapeado para o campo correto da Sequência Didática`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const fixSequenciaDidaticaFields = (customFields: Record<string, string>): Record<string, string> => {
  const fixed = { ...customFields };

  // Mapeamento de campos incorretos para corretos
  const fieldMapping: Record<string, string> = {
    'Tema Central': 'Título do Tema / Assunto',
    'Tema': 'Título do Tema / Assunto',
    'Assunto': 'Título do Tema / Assunto',
    'Objetivos': 'Objetivos de Aprendizagem',
    'Série': 'Ano / Série',
    'Ano': 'Ano / Série',
    'Competências': 'BNCC / Competências',
    'BNCC': 'BNCC / Competências',
    'Publico Alvo': 'Público-alvo',
    'Aulas': 'Quantidade de Aulas',
    'Diagnósticos': 'Quantidade de Diagnósticos',
    'Avaliações': 'Quantidade de Avaliações'
  };

  // Aplicar mapeamento
  Object.entries(fieldMapping).forEach(([incorrectField, correctField]) => {
    if (fixed[incorrectField] && !fixed[correctField]) {
      fixed[correctField] = fixed[incorrectField];
      delete fixed[incorrectField];
    }
  });

  return fixed;
};

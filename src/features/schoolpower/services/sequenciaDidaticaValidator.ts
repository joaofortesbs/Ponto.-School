
export interface SequenciaDidaticaValidation {
  isValid: boolean;
  errors: string[];
  processedData?: any;
}

export function validateSequenciaDidaticaData(data: any): SequenciaDidaticaValidation {
  const errors: string[] = [];
  
  // Validações obrigatórias para Sequência Didática
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

  if (!data.customFields) {
    errors.push('CustomFields não encontrados para Sequência Didática');
    return { isValid: false, errors };
  }

  // Verificar campos obrigatórios
  requiredFields.forEach(field => {
    const value = data.customFields[field];
    if (!value || typeof value !== 'string' || value.trim() === '') {
      errors.push(`Campo obrigatório "${field}" está vazio ou inválido`);
    }
  });

  // Validação específica para quantidades (devem ser números)
  const quantityFields = ['Quantidade de Aulas', 'Quantidade de Diagnósticos', 'Quantidade de Avaliações'];
  quantityFields.forEach(field => {
    const value = data.customFields[field];
    if (value && isNaN(Number(value))) {
      errors.push(`Campo "${field}" deve conter um número válido`);
    }
  });

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    processedData: isValid ? {
      ...data,
      customFields: {
        ...data.customFields,
        // Garantir que os valores sejam strings
        'Título do Tema / Assunto': String(data.customFields['Título do Tema / Assunto'] || ''),
        'Ano / Série': String(data.customFields['Ano / Série'] || ''),
        'Disciplina': String(data.customFields['Disciplina'] || ''),
        'BNCC / Competências': String(data.customFields['BNCC / Competências'] || ''),
        'Público-alvo': String(data.customFields['Público-alvo'] || ''),
        'Objetivos de Aprendizagem': String(data.customFields['Objetivos de Aprendizagem'] || ''),
        'Quantidade de Aulas': String(data.customFields['Quantidade de Aulas'] || '1'),
        'Quantidade de Diagnósticos': String(data.customFields['Quantidade de Diagnósticos'] || '1'),
        'Quantidade de Avaliações': String(data.customFields['Quantidade de Avaliações'] || '1'),
        'Cronograma': String(data.customFields['Cronograma'] || '')
      }
    } : undefined
  };
}

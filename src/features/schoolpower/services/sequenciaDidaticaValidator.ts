
import { SequenciaDidaticaFields } from '../activities/sequencia-didatica/sequenciaDidaticaProcessor';

export interface SequenciaDidaticaValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields: string[];
  data: SequenciaDidaticaFields;
}

/**
 * Valida os dados de uma Sequência Didática gerados pela IA
 */
export function validateSequenciaDidaticaData(customFields: Record<string, string>): SequenciaDidaticaValidationResult {
  const errors: string[] = [];
  const missingFields: string[] = [];
  
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
  for (const field of requiredFields) {
    if (!customFields[field] || customFields[field].trim() === '') {
      missingFields.push(field);
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  }
  
  // Validações específicas
  if (customFields['Quantidade de Aulas']) {
    const quantidadeAulas = parseInt(customFields['Quantidade de Aulas']);
    if (isNaN(quantidadeAulas) || quantidadeAulas <= 0) {
      errors.push('Quantidade de Aulas deve ser um número válido maior que zero');
    }
  }
  
  if (customFields['Quantidade de Diagnósticos']) {
    const quantidadeDiagnosticos = parseInt(customFields['Quantidade de Diagnósticos']);
    if (isNaN(quantidadeDiagnosticos) || quantidadeDiagnosticos < 0) {
      errors.push('Quantidade de Diagnósticos deve ser um número válido maior ou igual a zero');
    }
  }
  
  if (customFields['Quantidade de Avaliações']) {
    const quantidadeAvaliacoes = parseInt(customFields['Quantidade de Avaliações']);
    if (isNaN(quantidadeAvaliacoes) || quantidadeAvaliacoes < 0) {
      errors.push('Quantidade de Avaliações deve ser um número válido maior ou igual a zero');
    }
  }
  
  // Extrair dados
  const data: SequenciaDidaticaFields = {
    'Título do Tema / Assunto': customFields['Título do Tema / Assunto'] || '',
    'Ano / Série': customFields['Ano / Série'] || '',
    'Disciplina': customFields['Disciplina'] || '',
    'BNCC / Competências': customFields['BNCC / Competências'] || '',
    'Público-alvo': customFields['Público-alvo'] || '',
    'Objetivos de Aprendizagem': customFields['Objetivos de Aprendizagem'] || '',
    'Quantidade de Aulas': customFields['Quantidade de Aulas'] || '',
    'Quantidade de Diagnósticos': customFields['Quantidade de Diagnósticos'] || '',
    'Quantidade de Avaliações': customFields['Quantidade de Avaliações'] || '',
    'Cronograma': customFields['Cronograma'] || ''
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    missingFields,
    data
  };
}

export default validateSequenciaDidaticaData;

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

// Interface para os dados processados com validação e IA
export interface ProcessedSequenciaDidaticaData {
  tituloTemaAssunto: string;
  anoSerie: string;
  disciplina: string;
  bnccCompetencias: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: number;
  quantidadeDiagnosticos: number;
  quantidadeAvaliacoes: number;
  cronograma: string;
  duracaoTotal?: string;
  frequenciaSemanal?: string;
  isComplete: boolean;
  validationErrors: string[];
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

// Funções auxiliares
function calculateDuracaoTotal(cronograma: string, quantidadeAulas: number): string {
  if (!cronograma) {
    // Estimativa padrão: 50 minutos por aula
    const totalMinutos = quantidadeAulas * 50;
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return horas > 0 
      ? `${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`
      : `${minutos}min`;
  }

  // Tentar extrair duração do cronograma
  const duracaoPatterns = [
    /(\d+)\s*(?:horas?|h)/i,
    /(\d+)\s*(?:minutos?|min)/i,
    /(\d+)\s*(?:aulas?|encontros?)\s*de\s*(\d+)\s*(?:minutos?|min)/i
  ];

  for (const pattern of duracaoPatterns) {
    const match = cronograma.match(pattern);
    if (match) {
      if (pattern.source.includes('aulas')) {
        const aulas = parseInt(match[1]);
        const minutosPorAula = parseInt(match[2]);
        return `${Math.floor((aulas * minutosPorAula) / 60)}h ${(aulas * minutosPorAula) % 60}min`;
      }
      return match[0];
    }
  }

  // Fallback para estimativa baseada na quantidade de aulas
  const totalMinutos = quantidadeAulas * 50;
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  return horas > 0 
    ? `${horas}h${minutos > 0 ? ` ${minutos}min` : ''}`
    : `${minutos}min`;
}

function extractFrequenciaSemanal(cronograma: string): string {
  if (!cronograma) return '2x por semana';

  // Extrair informações sobre frequência do cronograma
  const frequenciaPatterns = [
    /(\d+)\s*(?:x|vezes?)\s*(?:por\s*)?semana/i,
    /(\d+)\s*aulas?\s*por\s*semana/i,
    /semanalmente/i,
    /semanal/i
  ];

  for (const pattern of frequenciaPatterns) {
    const match = cronograma.match(pattern);
    if (match) {
      if (pattern.source.includes('semanalmente') || pattern.source.includes('semanal')) {
        return '1x por semana';
      }
      return match[1] ? `${match[1]}x por semana` : '2x por semana';
    }
  }

  return '2x por semana';
}

export function validateSequenciaDidaticaData(data: ProcessedSequenciaDidaticaData): boolean {
  console.log('🔍 [SEQUENCIA_DIDATICA_VALIDATOR] Validando dados processados:', {
    isComplete: data.isComplete,
    errorsCount: data.validationErrors.length,
    hasTitle: !!data.tituloTemaAssunto,
    hasObjectives: !!data.objetivosAprendizagem
  });

  return data.isComplete && data.validationErrors.length === 0;
}

export function processSequenciaDidaticaData(formData: ActivityFormData): ProcessedSequenciaDidaticaData {
  console.log('🔄 [SEQUENCIA_DIDATICA_PROCESSOR] Processando dados do formulário:', formData);

  const validationErrors: string[] = [];
  
  // Validação obrigatória de campos
  const requiredFields = [
    { field: 'tituloTemaAssunto', name: 'Título do Tema/Assunto' },
    { field: 'anoSerie', name: 'Ano/Série' },
    { field: 'disciplina', name: 'Disciplina' },
    { field: 'publicoAlvo', name: 'Público-alvo' },
    { field: 'objetivosAprendizagem', name: 'Objetivos de Aprendizagem' },
    { field: 'quantidadeAulas', name: 'Quantidade de Aulas' },
    { field: 'quantidadeDiagnosticos', name: 'Quantidade de Diagnósticos' },
    { field: 'quantidadeAvaliacoes', name: 'Quantidade de Avaliações' }
  ];

  requiredFields.forEach(({ field, name }) => {
    const value = formData[field as keyof ActivityFormData];
    if (!value || (typeof value === 'string' && !value.trim())) {
      validationErrors.push(`${name} é obrigatório`);
      console.log(`❌ [VALIDATION] ${name} está vazio`);
    }
  });

  // Conversão e validação de números
  const quantidadeAulas = parseInt(formData.quantidadeAulas || '0');
  const quantidadeDiagnosticos = parseInt(formData.quantidadeDiagnosticos || '0');
  const quantidadeAvaliacoes = parseInt(formData.quantidadeAvaliacoes || '0');

  if (isNaN(quantidadeAulas) || quantidadeAulas <= 0) {
    validationErrors.push('Quantidade de Aulas deve ser um número maior que zero');
  }

  if (isNaN(quantidadeDiagnosticos) || quantidadeDiagnosticos < 0) {
    validationErrors.push('Quantidade de Diagnósticos deve ser um número não negativo');
  }

  if (isNaN(quantidadeAvaliacoes) || quantidadeAvaliacoes < 0) {
    validationErrors.push('Quantidade de Avaliações deve ser um número não negativo');
  }

  // Cálculo de duração e frequência
  const duracaoTotal = calculateDuracaoTotal(formData.cronograma || '', quantidadeAulas);
  const frequenciaSemanal = extractFrequenciaSemanal(formData.cronograma || '');

  const processedData: ProcessedSequenciaDidaticaData = {
    tituloTemaAssunto: formData.tituloTemaAssunto || '',
    anoSerie: formData.anoSerie || '',
    disciplina: formData.disciplina || '',
    bnccCompetencias: formData.bnccCompetencias || '',
    publicoAlvo: formData.publicoAlvo || '',
    objetivosAprendizagem: formData.objetivosAprendizagem || '',
    quantidadeAulas,
    quantidadeDiagnosticos,
    quantidadeAvaliacoes,
    cronograma: formData.cronograma || '',
    duracaoTotal,
    frequenciaSemanal,
    isComplete: validationErrors.length === 0,
    validationErrors
  };

  console.log('✅ [SEQUENCIA_DIDATICA_PROCESSOR] Dados processados:', processedData);
  
  return processedData;
}
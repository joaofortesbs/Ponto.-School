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
function calculateDuracaoTotal(aulas: number, diagnosticos: number, avaliacoes: number): string {
  const tempoAulas = aulas * 50; // 50 minutos por aula
  const tempoDiagnosticos = diagnosticos * 20; // 20 minutos por diagnóstico
  const tempoAvaliacoes = avaliacoes * 45; // 45 minutos por avaliação

  const totalMinutos = tempoAulas + tempoDiagnosticos + tempoAvaliacoes;
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${horas}h${minutos > 0 ? minutos + 'min' : ''}`;
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

  // Aplicar valores padrão para campos ausentes
  const defaultValues = {
    tituloTemaAssunto: formData.tituloTemaAssunto?.trim() || formData.title?.trim() || 'Sequência Didática',
    disciplina: formData.disciplina?.trim() || formData.subject?.trim() || 'Educação Básica',
    anoSerie: formData.anoSerie?.trim() || formData.schoolYear?.trim() || '6º Ano do Ensino Fundamental',
    bnccCompetencias: formData.bnccCompetencias?.trim() || 'Competências gerais da BNCC',
    publicoAlvo: formData.publicoAlvo?.trim() || 'Estudantes do Ensino Fundamental',
    objetivosAprendizagem: formData.objetivosAprendizagem?.trim() || formData.objectives?.trim() || 'Desenvolver competências e habilidades',
    quantidadeAulas: formData.quantidadeAulas?.trim() || '4',
    quantidadeDiagnosticos: formData.quantidadeDiagnosticos?.trim() || '1',
    quantidadeAvaliacoes: formData.quantidadeAvaliacoes?.trim() || '2',
    cronograma: formData.cronograma?.trim() || 'Cronograma a ser definido'
  };

  // Validar campos obrigatórios após aplicar valores padrão
  if (!defaultValues.tituloTemaAssunto) {
    validationErrors.push('Título do tema/assunto é obrigatório');
  }
  if (!defaultValues.disciplina) {
    validationErrors.push('Disciplina é obrigatória');
  }
  if (!defaultValues.anoSerie) {
    validationErrors.push('Ano/série é obrigatório');
  }
  if (!defaultValues.publicoAlvo) {
    validationErrors.push('Público-alvo é obrigatório');
  }
  if (!defaultValues.objetivosAprendizagem) {
    validationErrors.push('Objetivos de aprendizagem são obrigatórios');
  }

  // Validar quantidades numéricas
  const qtdAulas = parseInt(defaultValues.quantidadeAulas);
  const qtdDiag = parseInt(defaultValues.quantidadeDiagnosticos);
  const qtdAval = parseInt(defaultValues.quantidadeAvaliacoes);

  if (isNaN(qtdAulas) || qtdAulas < 1 || qtdAulas > 20) {
    validationErrors.push('Quantidade de aulas deve ser entre 1 e 20');
    defaultValues.quantidadeAulas = '4'; // valor padrão
  }
  if (isNaN(qtdDiag) || qtdDiag < 0 || qtdDiag > 10) {
    validationErrors.push('Quantidade de diagnósticos deve ser entre 0 e 10');
    defaultValues.quantidadeDiagnosticos = '1'; // valor padrão
  }
  if (isNaN(qtdAval) || qtdAval < 1 || qtdAval > 10) {
    validationErrors.push('Quantidade de avaliações deve ser entre 1 e 10');
    defaultValues.quantidadeAvaliacoes = '2'; // valor padrão
  }

  const processedData: ProcessedSequenciaDidaticaData = {
    ...defaultValues,
    isComplete: validationErrors.length === 0,
    validationErrors
  };

  console.log('✅ [SEQUENCIA_DIDATICA_PROCESSOR] Dados processados:', {
    isComplete: processedData.isComplete,
    validationErrors: processedData.validationErrors,
    appliedDefaults: Object.keys(defaultValues).length,
    processedData
  });

  return processedData;
}
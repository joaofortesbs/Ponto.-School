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
  console.log('🔄 Processando dados da Sequência Didática:', formData);

  const quantidadeAulasNum = parseInt(formData.quantidadeAulas || '4', 10);
  const quantidadeDiagnosticosNum = parseInt(formData.quantidadeDiagnosticos || '2', 10);
  const quantidadeAvaliacoesNum = parseInt(formData.quantidadeAvaliacoes || '2', 10);

  const processedData: ProcessedSequenciaDidaticaData = {
    tituloTemaAssunto: formData.tituloTemaAssunto || formData.title || '',
    anoSerie: formData.anoSerie || formData.schoolYear || '',
    disciplina: formData.disciplina || formData.subject || '',
    bnccCompetencias: formData.bnccCompetencias || formData.competencies || '',
    publicoAlvo: formData.publicoAlvo || formData.context || '',
    objetivosAprendizagem: formData.objetivosAprendizagem || formData.objectives || '',
    quantidadeAulas: quantidadeAulasNum,
    quantidadeDiagnosticos: quantidadeDiagnosticosNum,
    quantidadeAvaliacoes: quantidadeAvaliacoesNum,
    cronograma: formData.cronograma || '',
    duracaoTotal: calculateDuracaoTotal(quantidadeAulasNum, quantidadeDiagnosticosNum, quantidadeAvaliacoesNum),
    frequenciaSemanal: extractFrequenciaSemanal(formData.cronograma || ''),
    isComplete: false,
    validationErrors: []
  };

  // Validação dos campos essenciais
  const requiredFields = [
    'tituloTemaAssunto',
    'disciplina',
    'anoSerie',
    'publicoAlvo',
    'objetivosAprendizagem'
  ];

  for (const field of requiredFields) {
    if (!processedData[field as keyof ProcessedSequenciaDidaticaData]?.toString().trim()) {
      processedData.validationErrors.push(`Campo obrigatório ausente: ${field}`);
    }
  }

  processedData.isComplete = processedData.validationErrors.length === 0;

  console.log('✅ Dados processados e validados da Sequência Didática:', processedData);
  return processedData;
}
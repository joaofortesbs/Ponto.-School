
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

export interface ActivityFormData {
  tituloTemaAssunto?: string;
  title?: string;
  anoSerie?: string;
  schoolYear?: string;
  disciplina?: string;
  subject?: string;
  bnccCompetencias?: string;
  competencies?: string;
  publicoAlvo?: string;
  context?: string;
  objetivosAprendizagem?: string;
  objectives?: string;
  quantidadeAulas?: string;
  quantidadeDiagnosticos?: string;
  quantidadeAvaliacoes?: string;
  cronograma?: string;
  [key: string]: any;
}

// Mapeamento de campos para processamento
const fieldMapping: Record<string, string> = {
  'Título/Tema/Assunto': 'tituloTemaAssunto',
  'Ano/Série': 'anoSerie',
  'Disciplina': 'disciplina',
  'BNCC Competências': 'bnccCompetencias',
  'Público-Alvo': 'publicoAlvo',
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

// Função para extrair dados da resposta da IA
export function parseSequenciaDidaticaResponse(response: string): SequenciaDidaticaData | null {
  try {
    console.log('🔍 Fazendo parsing da resposta da IA para Sequência Didática');
    
    // Tentar extrair JSON se presente
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return processSequenciaDidaticaData(parsedData);
    }
    
    // Se não há JSON, extrair dados do texto
    const extractedData: ActivityFormData = {};
    
    // Extrair título
    const titleMatch = response.match(/(?:título|tema|assunto):\s*(.+)/i);
    if (titleMatch) extractedData.tituloTemaAssunto = titleMatch[1].trim();
    
    // Extrair ano/série
    const anoMatch = response.match(/(?:ano|série):\s*(.+)/i);
    if (anoMatch) extractedData.anoSerie = anoMatch[1].trim();
    
    // Extrair disciplina
    const disciplinaMatch = response.match(/disciplina:\s*(.+)/i);
    if (disciplinaMatch) extractedData.disciplina = disciplinaMatch[1].trim();
    
    // Extrair BNCC
    const bnccMatch = response.match(/(?:bncc|competências):\s*(.+)/i);
    if (bnccMatch) extractedData.bnccCompetencias = bnccMatch[1].trim();
    
    // Extrair público-alvo
    const publicoMatch = response.match(/(?:público|alvo|contexto):\s*(.+)/i);
    if (publicoMatch) extractedData.publicoAlvo = publicoMatch[1].trim();
    
    // Extrair objetivos
    const objetivosMatch = response.match(/(?:objetivos|aprendizagem):\s*(.+)/i);
    if (objetivosMatch) extractedData.objetivosAprendizagem = objetivosMatch[1].trim();
    
    return processSequenciaDidaticaData(extractedData);
    
  } catch (error) {
    console.error('❌ Erro no parsing da resposta da IA:', error);
    return null;
  }
}

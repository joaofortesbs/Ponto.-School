
export interface ParsedIAResponse {
  [key: string]: string | string[] | number;
}

export const parseIAResponse = (
  iaRawOutput: any, 
  contextualizationData?: any
): ParsedIAResponse | null => {
  try {
    console.log('🧠 Processando resposta da IA:', iaRawOutput);
    
    let parsedResponse: ParsedIAResponse = {};
    
    // Se a resposta já é um objeto estruturado
    if (typeof iaRawOutput === 'object' && iaRawOutput !== null) {
      parsedResponse = { ...iaRawOutput };
    }
    // Se é uma string JSON
    else if (typeof iaRawOutput === 'string') {
      try {
        parsedResponse = JSON.parse(iaRawOutput);
      } catch {
        // Se não é JSON, tentar extrair dados da string
        parsedResponse = extractDataFromString(iaRawOutput);
      }
    }
    
    // Enriquecer com dados de contextualização se disponível
    if (contextualizationData) {
      parsedResponse = enrichWithContextualization(parsedResponse, contextualizationData);
    }
    
    // Validar e limpar dados
    parsedResponse = validateAndCleanData(parsedResponse);
    
    console.log('✅ Resposta processada:', parsedResponse);
    return parsedResponse;
    
  } catch (error) {
    console.error('❌ Erro ao processar resposta da IA:', error);
    return null;
  }
};

const extractDataFromString = (text: string): ParsedIAResponse => {
  const result: ParsedIAResponse = {};
  
  // Padrões para extrair informações da string
  const patterns = {
    titulo: /(?:título|title):\s*(.+?)(?:\n|$)/i,
    descricao: /(?:descrição|description):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
    disciplina: /(?:disciplina|subject|matéria):\s*(.+?)(?:\n|$)/i,
    dificuldade: /(?:dificuldade|difficulty|nível):\s*(.+?)(?:\n|$)/i,
    duracao: /(?:duração|duration|tempo):\s*(.+?)(?:\n|$)/i,
    objetivos: /(?:objetivos|objectives|goals):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/is,
    materiais: /(?:materiais|materials|recursos):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/is,
    instrucoes: /(?:instruções|instructions|como fazer):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/is,
    conteudo: /(?:conteúdo|content|texto):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/is
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result[key] = match[1].trim();
    }
  }
  
  return result;
};

const enrichWithContextualization = (
  parsedResponse: ParsedIAResponse, 
  contextualizationData: any
): ParsedIAResponse => {
  const enriched = { ...parsedResponse };
  
  // Adicionar informações de contextualização se não estiverem presentes
  if (!enriched.disciplina && contextualizationData.materias) {
    enriched.disciplina = contextualizationData.materias;
  }
  
  if (!enriched.publicoAlvo && contextualizationData.publicoAlvo) {
    enriched.publicoAlvo = contextualizationData.publicoAlvo;
  }
  
  if (!enriched.duracao && contextualizationData.datasImportantes) {
    enriched.duracao = contextualizationData.datasImportantes;
  }
  
  if (!enriched.observacoes && contextualizationData.observacoes) {
    enriched.observacoes = contextualizationData.observacoes;
  }
  
  return enriched;
};

const validateAndCleanData = (data: ParsedIAResponse): ParsedIAResponse => {
  const cleaned: ParsedIAResponse = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        cleaned[key] = trimmed;
      }
    } else if (Array.isArray(value)) {
      const filteredArray = value.filter(item => 
        item !== null && item !== undefined && String(item).trim().length > 0
      );
      if (filteredArray.length > 0) {
        cleaned[key] = filteredArray;
      }
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

export { extractDataFromString, enrichWithContextualization, validateAndCleanData };

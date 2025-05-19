
/**
 * Utilitários para manipulação segura de datas
 */

/**
 * Verifica se um valor é uma data válida
 * @param value Valor a ser verificado
 * @returns true se for uma data válida, false caso contrário
 */
export const isValidDate = (value: any): boolean => {
  if (!value) return false;
  
  // Se já for um objeto Date
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  // Se for uma string, tenta converter para Date
  if (typeof value === 'string') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  
  return false;
};

/**
 * Obtém o timestamp de uma data de forma segura
 * @param value Valor da data (Date, string ou timestamp)
 * @param defaultValue Valor padrão caso a data seja inválida
 * @returns O timestamp da data ou o valor padrão
 */
export const getTimeSafe = (value: any, defaultValue: number = Date.now()): number => {
  try {
    if (!value) return defaultValue;
    
    // Se já for um número
    if (typeof value === 'number') {
      return value;
    }
    
    // Se for um objeto Date
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? defaultValue : value.getTime();
    }
    
    // Se for uma string, tenta converter para Date
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? defaultValue : date.getTime();
    }
    
    return defaultValue;
  } catch (error) {
    console.error("Erro ao processar data:", error);
    return defaultValue;
  }
};

/**
 * Formata a data para exibição em formato relativo (hoje, ontem, etc.)
 * @param date Data a ser formatada
 * @returns String formatada da data relativa
 */
export const formatRelativeDate = (date: Date | string | number | null | undefined): string => {
  if (!date) return "Data desconhecida";
  
  try {
    const dateTime = getTimeSafe(date);
    const now = Date.now();
    const diffMs = now - dateTime;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return "agora mesmo";
    if (diffMins < 60) return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `há ${diffDays} dias`;
    
    const dateObj = new Date(dateTime);
    return dateObj.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error("Erro ao formatar data relativa:", error);
    return "Data desconhecida";
  }
};

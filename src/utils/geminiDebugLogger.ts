interface GeminiDebugLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'request' | 'response' | 'error' | 'validation' | 'processing' | 'api_call';
  message: string;
  data?: any;
  stack?: string;
}

class GeminiDebugLogger {
  private static instance: GeminiDebugLogger;
  private logs: GeminiDebugLog[] = [];
  private maxLogs = 100;

  static getInstance(): GeminiDebugLogger {
    if (!GeminiDebugLogger.instance) {
      GeminiDebugLogger.instance = new GeminiDebugLogger();
    }
    return GeminiDebugLogger.instance;
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  log(level: GeminiDebugLog['level'], category: GeminiDebugLog['category'], message: string, data?: any): void {
    const log: GeminiDebugLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined, // Deep clone
      stack: level === 'error' ? new Error().stack : undefined
    };

    this.logs.push(log);

    // Manter apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log no console para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[GEMINI ${category.toUpperCase()}] ${message}`, data || '');
    }

    // Salvar no localStorage para debug
    try {
      localStorage.setItem('gemini_debug_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Não foi possível salvar logs no localStorage:', error);
    }
  }

  info(category: GeminiDebugLog['category'], message: string, data?: any): void {
    this.log('info', category, message, data);
  }

  warn(category: GeminiDebugLog['category'], message: string, data?: any): void {
    this.log('warn', category, message, data);
  }

  error(category: GeminiDebugLog['category'], message: string, data?: any): void {
    this.log('error', category, message, data);
  }

  debug(category: GeminiDebugLog['category'], message: string, data?: any): void {
    this.log('debug', category, message, data);
  }

  getLogs(level?: GeminiDebugLog['level'], category?: GeminiDebugLog['category']): GeminiDebugLog[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs;
  }

  getRecentLogs(count: number = 20): GeminiDebugLog[] {
    return this.logs.slice(-count);
  }

  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('gemini_debug_logs');
    } catch (error) {
      console.warn('Não foi possível limpar logs do localStorage:', error);
    }
  }

  exportLogs(): string {
    return JSON.stringify({
      exported_at: new Date().toISOString(),
      total_logs: this.logs.length,
      logs: this.logs
    }, null, 2);
  }

  // Restaurar logs do localStorage
  restoreLogs(): void {
    try {
      const savedLogs = localStorage.getItem('gemini_debug_logs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.warn('Não foi possível restaurar logs do localStorage:', error);
    }
  }

  // Métodos específicos para debug Gemini
  logRequest(prompt: string, config?: any) {
    this.log('info', 'request', 'Enviando requisição para API Gemini', {
      prompt_length: prompt.length,
      prompt_preview: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      config,
      timestamp: new Date().toISOString(),
      hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY
    });
  }

  logResponse(response: any, executionTime: number) {
    const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    this.log('info', 'response', 'Resposta recebida da API Gemini', {
      execution_time: executionTime,
      response_length: responseText?.length || 0,
      response_preview: responseText?.substring(0, 200) + (responseText?.length > 200 ? '...' : ''),
      has_content: !!responseText
    });
  }

  logError(error: Error | string, context?: any): void {
    this.log('error', 'error', 'Erro na API Gemini', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context
    });
  }

  logValidation(data: any, isValid: boolean, errors?: string[]): void {
    this.log('debug', 'validation', 'Validação de dados', {
      is_valid: isValid,
      errors: errors || [],
      data_preview: JSON.stringify(data).substring(0, 300)
    });
  }

  logProcessing(step: string, data?: any): void {
    this.log('debug', 'processing', `Processamento: ${step}`, data);
  }

  logSuccess(message: string, data?: any): void {
    this.log('info', 'response', message, data);
  }

  // Métodos adicionais para o quiz
  logApiResponse(response: any, executionTime: number) {
    this.log('info', 'response', 'API Gemini Response', {
      hasCandidates: !!response.candidates,
      candidatesCount: response.candidates?.length || 0,
      hasContent: !!response.candidates?.[0]?.content,
      responseSize: JSON.stringify(response).length,
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString()
    });
  }

  logQuestionGeneration(questionData: any, questionIndex: number) {
    this.log('info', 'processing', `QUESTÃO ${questionIndex + 1} GERADA`, {
      hasQuestion: !!questionData.question,
      hasOptions: !!questionData.options,
      optionsCount: questionData.options?.length || 0,
      hasCorrectAnswer: !!questionData.correctAnswer,
      hasExplanation: !!questionData.explanation,
      questionType: questionData.type || 'não definido'
    });
  }

  logApiCall(prompt: string, response: string, executionTime: number) {
    this.log('info', 'api_call', 'CHAMADA API GEMINI CONCLUÍDA', {
      promptLength: prompt.length,
      responseLength: response.length,
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
      promptPreview: prompt.substring(0, 200) + '...',
      responsePreview: response.substring(0, 300) + '...',
      hasValidJson: this.isValidJson(response)
    });
  }

  private isValidJson(text: string): boolean {
    try {
      // Tentar encontrar JSON na resposta
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1) return false;

      const jsonText = text.substring(jsonStart, jsonEnd + 1);
      JSON.parse(jsonText);
      return true;
    } catch {
      return false;
    }
  }
}

export const geminiLogger = GeminiDebugLogger.getInstance();

// Restaurar logs ao importar
geminiLogger.restoreLogs();
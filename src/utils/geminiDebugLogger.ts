interface GeminiDebugLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'request' | 'response' | 'error' | 'validation' | 'processing';
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
  logRequest(prompt: string, config: any): void {
    this.info('request', 'Enviando requisição para API Gemini', {
      prompt_length: prompt.length,
      prompt_preview: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      config
    });
  }

  logResponse(response: any, executionTime: number): void {
    const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    this.info('response', 'Resposta recebida da API Gemini', {
      execution_time: executionTime,
      response_length: responseText?.length || 0,
      response_preview: responseText?.substring(0, 200) + (responseText?.length > 200 ? '...' : ''),
      has_content: !!responseText
    });
  }

  logError(error: Error | string, context?: any): void {
    this.error('error', 'Erro na API Gemini', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context
    });
  }

  logValidation(data: any, isValid: boolean, errors?: string[]): void {
    this.debug('validation', 'Validação de dados', {
      is_valid: isValid,
      errors: errors || [],
      data_preview: JSON.stringify(data).substring(0, 300)
    });
  }

  logProcessing(step: string, data?: any): void {
    this.debug('processing', `Processamento: ${step}`, data);
  }

  logSuccess(message: string, data?: any): void {
    this.info('response', message, data);
  }

  // Métodos específicos para Quiz Interativo
  logQuizGeneration(data: any): void {
    this.info('processing', 'Iniciando geração de Quiz Interativo', {
      numberOfQuestions: data.numberOfQuestions,
      theme: data.theme,
      subject: data.subject,
      schoolYear: data.schoolYear,
      format: data.format,
      timestamp: new Date().toISOString()
    });
  }

  logQuizParsing(rawResponse: string, parsedData: any): void {
    this.debug('processing', 'Parseando resposta do Quiz', {
      raw_response_length: rawResponse.length,
      raw_response_preview: rawResponse.substring(0, 300),
      parsed_questions_count: parsedData.questions?.length || 0,
      parsed_title: parsedData.title,
      has_valid_structure: !!(parsedData.questions && parsedData.questions.length > 0)
    });
  }

  logQuizValidation(content: any, isValid: boolean, errors?: string[]): void {
    this.debug('validation', 'Validação do conteúdo do Quiz', {
      is_valid: isValid,
      questions_count: content.questions?.length || 0,
      has_title: !!content.title,
      has_time_per_question: !!content.timePerQuestion,
      validation_errors: errors || [],
      content_preview: {
        title: content.title,
        questionsStructure: content.questions?.map((q: any) => ({
          hasQuestion: !!q.question,
          hasOptions: !!q.options,
          optionsCount: q.options?.length || 0
        }))
      }
    });
  }

  logQuizSyncronization(quizContent: any, generatedContent: any): void {
    this.debug('processing', 'Sincronização de estados do Quiz', {
      quiz_content_exists: !!quizContent,
      generated_content_exists: !!generatedContent,
      quiz_questions_count: quizContent?.questions?.length || 0,
      generated_questions_count: generatedContent?.questions?.length || 0,
      states_match: JSON.stringify(quizContent) === JSON.stringify(generatedContent)
    });
  }
}

export const geminiLogger = GeminiDebugLogger.getInstance();

// Restaurar logs ao importar
geminiLogger.restoreLogs();
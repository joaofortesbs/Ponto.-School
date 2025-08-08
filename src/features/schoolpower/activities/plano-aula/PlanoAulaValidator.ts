
export class PlanoAulaValidator {
  /**
   * Valida se os dados básicos do plano de aula estão corretos
   */
  static validateBasicData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.titulo || typeof data.titulo !== 'string' || data.titulo.trim().length === 0) {
      errors.push('Título é obrigatório');
    }

    if (!data.disciplina || typeof data.disciplina !== 'string' || data.disciplina.trim().length === 0) {
      errors.push('Disciplina é obrigatória');
    }

    if (!data.tema || typeof data.tema !== 'string' || data.tema.trim().length === 0) {
      errors.push('Tema é obrigatório');
    }

    if (!data.serie || typeof data.serie !== 'string' || data.serie.trim().length === 0) {
      errors.push('Série/Ano é obrigatório');
    }

    if (!data.objetivoGeral || typeof data.objetivoGeral !== 'string' || data.objetivoGeral.trim().length === 0) {
      errors.push('Objetivo Geral é obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida se a resposta da IA está no formato esperado
   */
  static validateAIResponse(response: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!response || typeof response !== 'object') {
      errors.push('Resposta da IA é inválida');
      return { isValid: false, errors };
    }

    // Validar seções obrigatórias
    const requiredSections = ['visao_geral', 'objetivos', 'metodologia', 'desenvolvimento', 'atividades'];
    
    for (const section of requiredSections) {
      if (!response[section]) {
        errors.push(`Seção '${section}' está ausente`);
      }
    }

    // Validar estrutura da visão geral
    if (response.visao_geral) {
      const requiredFields = ['disciplina', 'tema', 'serie', 'tempo', 'metodologia'];
      for (const field of requiredFields) {
        if (!response.visao_geral[field]) {
          errors.push(`Campo '${field}' da visão geral está ausente`);
        }
      }
      
      if (!Array.isArray(response.visao_geral.recursos)) {
        errors.push('Campo "recursos" deve ser um array');
      }
    }

    // Validar objetivos
    if (response.objetivos && !Array.isArray(response.objetivos)) {
      errors.push('Campo "objetivos" deve ser um array');
    }

    // Validar desenvolvimento
    if (response.desenvolvimento && !Array.isArray(response.desenvolvimento)) {
      errors.push('Campo "desenvolvimento" deve ser um array');
    }

    // Validar atividades
    if (response.atividades && !Array.isArray(response.atividades)) {
      errors.push('Campo "atividades" deve ser um array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitiza dados de entrada removendo caracteres perigosos
   */
  static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Valida se uma seção específica do plano está completa
   */
  static validateSection(sectionName: string, sectionData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (sectionName) {
      case 'visao_geral':
        if (!sectionData.disciplina) errors.push('Disciplina é obrigatória');
        if (!sectionData.tema) errors.push('Tema é obrigatório');
        if (!sectionData.serie) errors.push('Série é obrigatória');
        if (!sectionData.tempo) errors.push('Tempo é obrigatório');
        break;

      case 'objetivos':
        if (!Array.isArray(sectionData) || sectionData.length === 0) {
          errors.push('Pelo menos um objetivo é obrigatório');
        } else {
          sectionData.forEach((obj: any, index: number) => {
            if (!obj.descricao) {
              errors.push(`Objetivo ${index + 1} precisa de uma descrição`);
            }
          });
        }
        break;

      case 'desenvolvimento':
        if (!Array.isArray(sectionData) || sectionData.length === 0) {
          errors.push('Pelo menos uma etapa de desenvolvimento é obrigatória');
        } else {
          sectionData.forEach((etapa: any, index: number) => {
            if (!etapa.titulo) {
              errors.push(`Etapa ${index + 1} precisa de um título`);
            }
            if (!etapa.descricao) {
              errors.push(`Etapa ${index + 1} precisa de uma descrição`);
            }
          });
        }
        break;

      case 'atividades':
        if (!Array.isArray(sectionData) || sectionData.length === 0) {
          errors.push('Pelo menos uma atividade é obrigatória');
        } else {
          sectionData.forEach((atividade: any, index: number) => {
            if (!atividade.nome) {
              errors.push(`Atividade ${index + 1} precisa de um nome`);
            }
            if (!atividade.tipo) {
              errors.push(`Atividade ${index + 1} precisa de um tipo`);
            }
          });
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}


export interface PlanoAulaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PlanoAulaValidator {
  /**
   * Valida a estrutura completa de um plano de aula
   */
  static validatePlanoAula(data: any): PlanoAulaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('🔍 [PlanoAulaValidator] Validando dados:', data);

    // Validações obrigatórias
    if (!data) {
      errors.push('Dados do plano de aula não fornecidos');
      return { isValid: false, errors, warnings };
    }

    // Validar visão geral
    if (!data.visao_geral && !data.titulo) {
      errors.push('Visão geral ou título do plano é obrigatório');
    }

    if (data.visao_geral) {
      if (!data.visao_geral.disciplina && !data.disciplina) {
        warnings.push('Disciplina não especificada');
      }
      if (!data.visao_geral.tema && !data.titulo) {
        warnings.push('Tema não especificado');
      }
      if (!data.visao_geral.serie && !data.serie) {
        warnings.push('Série/Ano não especificado');
      }
    }

    // Validar objetivos
    if (!data.objetivos || !Array.isArray(data.objetivos) || data.objetivos.length === 0) {
      warnings.push('Nenhum objetivo de aprendizagem definido');
    }

    // Validar metodologia
    if (!data.metodologia) {
      warnings.push('Metodologia não especificada');
    }

    // Validar desenvolvimento
    if (!data.desenvolvimento || !Array.isArray(data.desenvolvimento) || data.desenvolvimento.length === 0) {
      warnings.push('Nenhuma etapa de desenvolvimento definida');
    }

    // Validar atividades
    if (!data.atividades || !Array.isArray(data.atividades) || data.atividades.length === 0) {
      warnings.push('Nenhuma atividade específica definida');
    }

    const isValid = errors.length === 0;

    console.log('✅ [PlanoAulaValidator] Resultado da validação:', {
      isValid,
      errorsCount: errors.length,
      warningsCount: warnings.length
    });

    return { isValid, errors, warnings };
  }

  /**
   * Normaliza dados do plano de aula para garantir estrutura consistente
   */
  static normalizePlanoAula(data: any): any {
    console.log('🔄 [PlanoAulaValidator] Normalizando dados:', data);

    if (!data) return null;

    // Se os dados já estão na estrutura correta, retornar como estão
    if (data.visao_geral && data.objetivos && data.metodologia && data.desenvolvimento && data.atividades) {
      console.log('✅ Dados já normalizados');
      return data;
    }

    // Normalizar dados para estrutura padrão
    const normalized = {
      titulo: data.titulo || data.visao_geral?.tema || 'Plano de Aula',
      disciplina: data.disciplina || data.visao_geral?.disciplina || 'Disciplina não especificada',
      serie: data.serie || data.visao_geral?.serie || 'Série não especificada',
      tempo: data.tempo || data.visao_geral?.tempo || '50 minutos',
      metodologia: data.metodologia?.nome || data.metodologia || 'Metodologia não especificada',
      recursos: data.recursos || data.visao_geral?.recursos || [],
      objetivos: data.objetivos || [],
      desenvolvimento: data.desenvolvimento || [],
      atividades: data.atividades || [],
      sugestoes_ia: data.sugestoes_ia || data.visao_geral?.sugestoes_ia || [],
      visao_geral: data.visao_geral || {
        disciplina: data.disciplina || 'Disciplina não especificada',
        tema: data.titulo || 'Plano de Aula',
        serie: data.serie || 'Série não especificada',
        tempo: data.tempo || '50 minutos',
        metodologia: data.metodologia?.nome || data.metodologia || 'Metodologia não especificada',
        recursos: data.recursos || [],
        sugestoes_ia: data.sugestoes_ia || []
      },
      isGeneratedByAI: data.isGeneratedByAI || false,
      generatedAt: data.generatedAt || new Date().toISOString()
    };

    console.log('🔄 Dados normalizados:', normalized);
    return normalized;
  }

  /**
   * Verifica se os dados são de um plano de aula válido
   */
  static isPlanoAulaData(data: any): boolean {
    if (!data) return false;

    // Verificar se contém pelo menos algumas propriedades de plano de aula
    const hasPlanoAulaProperties = 
      data.visao_geral || 
      data.objetivos || 
      data.metodologia || 
      data.desenvolvimento || 
      data.atividades ||
      (data.titulo && data.disciplina);

    return hasPlanoAulaProperties;
  }
}

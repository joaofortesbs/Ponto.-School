
/**
 * Integrador para sincronização de dados entre seções do plano de aula
 * e coleta de contexto para geração via IA
 */

export interface ContextoPlanoCompleto {
  // Dados básicos
  id?: string;
  titulo?: string;
  disciplina?: string;
  tema?: string;
  anoEscolaridade?: string;
  serie?: string;
  tempo?: string;
  tempoLimite?: string;
  
  // Dados das outras seções
  objetivos?: string[];
  materiais?: string[];
  recursos?: string[];
  metodologia?: string;
  competencias?: string[];
  habilidadesBNCC?: string[];
  
  // Dados específicos do contexto
  contextoAplicacao?: string;
  nivelComplexidade?: string;
  estrategiasEnsino?: string[];
  avaliacaoPlaneada?: string;
  
  // Metadados
  dataGeracao?: string;
  versao?: string;
}

export class DesenvolvimentoIntegrator {
  /**
   * Coleta dados completos do plano de aula para enviar à IA
   */
  static coletarContextoCompleto(activityData: any, originalData: any): ContextoPlanoCompleto {
    console.log('📊 Coletando contexto completo do plano...');
    console.log('ActivityData recebido:', activityData);
    console.log('OriginalData recebido:', originalData);

    const contexto: ContextoPlanoCompleto = {
      // IDs e identificação
      id: activityData?.id || originalData?.id || `plano_${Date.now()}`,
      
      // Dados básicos - múltiplas fontes
      titulo: activityData?.title || originalData?.titulo || originalData?.title,
      disciplina: activityData?.subject || originalData?.disciplina || originalData?.subject,
      tema: activityData?.theme || originalData?.tema || originalData?.theme,
      anoEscolaridade: activityData?.schoolYear || originalData?.anoEscolaridade || originalData?.schoolYear,
      serie: originalData?.serie,
      tempo: activityData?.timeLimit || originalData?.tempo || originalData?.timeLimit || '50 minutos',
      tempoLimite: originalData?.tempoLimite,
      
      // Objetivos - várias possibilidades
      objetivos: this.extrairObjetivos(activityData, originalData),
      
      // Materiais e recursos
      materiais: this.extrairMateriais(activityData, originalData),
      recursos: this.extrairRecursos(activityData, originalData),
      
      // Metodologia e estratégias
      metodologia: activityData?.methodology || originalData?.metodologia || originalData?.nivelDificuldade,
      estrategiasEnsino: this.extrairEstrategias(activityData, originalData),
      
      // Competências e habilidades
      competencias: this.extrairCompetencias(activityData, originalData),
      habilidadesBNCC: this.extrairHabilidadesBNCC(activityData, originalData),
      
      // Contexto adicional
      contextoAplicacao: activityData?.context || originalData?.contextoAplicacao || originalData?.context,
      nivelComplexidade: activityData?.difficultyLevel || originalData?.nivelDificuldade || originalData?.difficultyLevel,
      
      // Metadados
      dataGeracao: new Date().toISOString(),
      versao: '1.0'
    };

    console.log('✅ Contexto completo coletado:', contexto);
    return contexto;
  }

  private static extrairObjetivos(activityData: any, originalData: any): string[] {
    const objetivos: string[] = [];
    
    // Múltiplas fontes de objetivos
    if (activityData?.objectives) {
      if (Array.isArray(activityData.objectives)) {
        objetivos.push(...activityData.objectives);
      } else if (typeof activityData.objectives === 'string') {
        objetivos.push(activityData.objectives);
      }
    }
    
    if (originalData?.objetivos) {
      if (Array.isArray(originalData.objetivos)) {
        objetivos.push(...originalData.objetivos);
      } else if (typeof originalData.objetivos === 'string') {
        objetivos.push(originalData.objetivos);
      }
    }
    
    if (originalData?.objectives) {
      if (Array.isArray(originalData.objectives)) {
        objetivos.push(...originalData.objectives);
      }
    }

    // Remover duplicatas
    return [...new Set(objetivos.filter(obj => obj && obj.trim()))];
  }

  private static extrairMateriais(activityData: any, originalData: any): string[] {
    const materiais: string[] = [];
    
    if (activityData?.materials) {
      if (Array.isArray(activityData.materials)) {
        materiais.push(...activityData.materials);
      }
    }
    
    if (originalData?.materiais) {
      if (Array.isArray(originalData.materiais)) {
        materiais.push(...originalData.materiais);
      }
    }
    
    if (originalData?.materials) {
      if (Array.isArray(originalData.materials)) {
        materiais.push(...originalData.materials);
      }
    }

    return [...new Set(materiais.filter(mat => mat && mat.trim()))];
  }

  private static extrairRecursos(activityData: any, originalData: any): string[] {
    const recursos: string[] = [];
    
    if (activityData?.resources) {
      if (Array.isArray(activityData.resources)) {
        recursos.push(...activityData.resources);
      }
    }
    
    if (originalData?.recursos) {
      if (Array.isArray(originalData.recursos)) {
        recursos.push(...originalData.recursos);
      }
    }

    return [...new Set(recursos.filter(rec => rec && rec.trim()))];
  }

  private static extrairCompetencias(activityData: any, originalData: any): string[] {
    const competencias: string[] = [];
    
    if (activityData?.competencies) {
      if (Array.isArray(activityData.competencies)) {
        competencias.push(...activityData.competencies);
      }
    }
    
    if (originalData?.competencias) {
      if (Array.isArray(originalData.competencias)) {
        competencias.push(...originalData.competencias);
      }
    }

    return [...new Set(competencias.filter(comp => comp && comp.trim()))];
  }

  private static extrairHabilidadesBNCC(activityData: any, originalData: any): string[] {
    const habilidades: string[] = [];
    
    if (originalData?.habilidadesBNCC) {
      if (Array.isArray(originalData.habilidadesBNCC)) {
        habilidades.push(...originalData.habilidadesBNCC);
      }
    }
    
    if (activityData?.bnccSkills) {
      if (Array.isArray(activityData.bnccSkills)) {
        habilidades.push(...activityData.bnccSkills);
      }
    }

    return [...new Set(habilidades.filter(hab => hab && hab.trim()))];
  }

  private static extrairEstrategias(activityData: any, originalData: any): string[] {
    const estrategias: string[] = [];
    
    if (originalData?.estrategiasEnsino) {
      if (Array.isArray(originalData.estrategiasEnsino)) {
        estrategias.push(...originalData.estrategiasEnsino);
      }
    }
    
    if (originalData?.estrategiasLeitura) {
      if (Array.isArray(originalData.estrategiasLeitura)) {
        estrategias.push(...originalData.estrategiasLeitura);
      }
    }
    
    // Inferir estratégias baseadas no tipo de atividade
    const tipo = activityData?.type || originalData?.tipo;
    if (tipo) {
      switch (tipo) {
        case 'plano-aula':
          estrategias.push('Ensino expositivo-dialogado', 'Atividades práticas');
          break;
        case 'lista-exercicios':
          estrategias.push('Resolução de problemas', 'Prática dirigida');
          break;
      }
    }

    return [...new Set(estrategias.filter(est => est && est.trim()))];
  }

  /**
   * Sincroniza dados de desenvolvimento com outras seções
   */
  static sincronizarComOutrasSecoes(desenvolvimentoData: any, planoId: string): void {
    try {
      console.log('🔄 Sincronizando dados de desenvolvimento com outras seções...');
      
      // Calcular tempo total baseado nas etapas
      if (desenvolvimentoData.etapas) {
        const tempoTotal = this.calcularTempoTotal(desenvolvimentoData.etapas);
        
        // Salvar tempo calculado para outras seções usarem
        const tempoData = {
          tempoDesenvolvimento: tempoTotal,
          ultimaAtualizacao: new Date().toISOString()
        };
        
        localStorage.setItem(`plano_tempo_${planoId}`, JSON.stringify(tempoData));
      }
      
      // Extrair recursos únicos das etapas para sincronizar com seção de materiais
      if (desenvolvimentoData.etapas) {
        const recursosUnicos = this.extrairRecursosUnicos(desenvolvimentoData.etapas);
        
        const recursosData = {
          recursosDesenvolvimento: recursosUnicos,
          ultimaAtualizacao: new Date().toISOString()
        };
        
        localStorage.setItem(`plano_recursos_${planoId}`, JSON.stringify(recursosData));
      }
      
      console.log('✅ Sincronização concluída');
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  }

  private static calcularTempoTotal(etapas: any[]): string {
    let totalMinutos = 0;
    
    etapas.forEach(etapa => {
      if (etapa.tempoEstimado) {
        const match = etapa.tempoEstimado.match(/(\d+)/);
        if (match) {
          totalMinutos += parseInt(match[1]);
        }
      }
    });
    
    return `${totalMinutos} minutos`;
  }

  private static extrairRecursosUnicos(etapas: any[]): string[] {
    const recursos = new Set<string>();
    
    etapas.forEach(etapa => {
      if (etapa.recursosUsados && Array.isArray(etapa.recursosUsados)) {
        etapa.recursosUsados.forEach((recurso: string) => recursos.add(recurso));
      }
    });
    
    return Array.from(recursos);
  }

  /**
   * Valida se os dados coletados são suficientes para geração via IA
   */
  static validarContextoParaIA(contexto: ContextoPlanoCompleto): { valido: boolean; erros: string[] } {
    const erros: string[] = [];
    
    if (!contexto.disciplina || contexto.disciplina.trim() === '') {
      erros.push('Disciplina é obrigatória');
    }
    
    if (!contexto.tema || contexto.tema.trim() === '') {
      erros.push('Tema é obrigatório');
    }
    
    if (!contexto.anoEscolaridade || contexto.anoEscolaridade.trim() === '') {
      erros.push('Ano de escolaridade é obrigatório');
    }
    
    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Salva dados de contexto para debug e auditoria
   */
  static salvarContextoDebug(contexto: ContextoPlanoCompleto, planoId: string): void {
    try {
      const debugData = {
        contexto,
        timestamp: new Date().toISOString(),
        planoId
      };
      
      localStorage.setItem(`debug_contexto_${planoId}`, JSON.stringify(debugData));
      console.log('🐛 Contexto salvo para debug:', `debug_contexto_${planoId}`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar contexto debug:', error);
    }
  }
}

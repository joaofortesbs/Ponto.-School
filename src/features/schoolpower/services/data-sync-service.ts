
/**
 * Serviço de Sincronização de Dados para Atividades Compartilhadas
 * Sistema completo de mapeamento e sincronização de dados entre diferentes fontes
 */

export interface AtividadeDados {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  dados: any;
  customFields?: any;
  personalizedTitle?: string;
  personalizedDescription?: string;
  description?: string;
  // Campos específicos por tipo de atividade
  subject?: string;
  schoolYear?: string;
  theme?: string;
  objectives?: string;
  nivel?: string;
  disciplina?: string;
  tempo_estimado?: number;
}

export interface FonteDados {
  prioridade: number;
  extrair: (atividade: any) => string | null;
  validar: (valor: string) => boolean;
}

export class DataSyncService {
  private static readonly DEBUG = true;

  /**
   * Mapeamento hierárquico de fontes para descrição
   * Ordem de prioridade: maior número = maior prioridade
   */
  private static readonly FONTES_DESCRICAO: FonteDados[] = [
    {
      prioridade: 10,
      extrair: (atividade) => atividade?.descricao?.trim() || null,
      validar: (valor) => valor.length > 10
    },
    {
      prioridade: 9,
      extrair: (atividade) => atividade?.personalizedDescription?.trim() || null,
      validar: (valor) => valor.length > 10
    },
    {
      prioridade: 8,
      extrair: (atividade) => atividade?.description?.trim() || null,
      validar: (valor) => valor.length > 10
    },
    {
      prioridade: 7,
      extrair: (atividade) => atividade?.dados?.descricao?.trim() || null,
      validar: (valor) => valor.length > 10
    },
    {
      prioridade: 6,
      extrair: (atividade) => atividade?.dados?.description?.trim() || null,
      validar: (valor) => valor.length > 10
    },
    {
      prioridade: 5,
      extrair: (atividade) => atividade?.dados?.personalizedDescription?.trim() || null,
      validar: (valor) => valor.length > 10
    },
    {
      prioridade: 4,
      extrair: (atividade) => atividade?.customFields?.descricao?.trim() || null,
      validar: (valor) => valor.length > 5
    },
    {
      prioridade: 3,
      extrair: (atividade) => atividade?.customFields?.['Descrição']?.trim() || null,
      validar: (valor) => valor.length > 5
    },
    {
      prioridade: 2,
      extrair: (atividade) => atividade?.dados?.objectives?.trim() || null,
      validar: (valor) => valor.length > 15
    },
    {
      prioridade: 1,
      extrair: (atividade) => this.gerarDescricaoFallback(atividade),
      validar: (valor) => valor.length > 0
    }
  ];

  /**
   * Mapeamento de fontes para título
   */
  private static readonly FONTES_TITULO: FonteDados[] = [
    {
      prioridade: 10,
      extrair: (atividade) => atividade?.titulo?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 9,
      extrair: (atividade) => atividade?.personalizedTitle?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 8,
      extrair: (atividade) => atividade?.title?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 7,
      extrair: (atividade) => atividade?.dados?.titulo?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 6,
      extrair: (atividade) => atividade?.dados?.title?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 5,
      extrair: (atividade) => atividade?.dados?.personalizedTitle?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 4,
      extrair: (atividade) => atividade?.customFields?.titulo?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 3,
      extrair: (atividade) => atividade?.customFields?.['Título']?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 2,
      extrair: (atividade) => atividade?.dados?.theme?.trim() || null,
      validar: (valor) => valor.length > 3
    },
    {
      prioridade: 1,
      extrair: (atividade) => this.gerarTituloFallback(atividade),
      validar: (valor) => valor.length > 0
    }
  ];

  /**
   * Debug logger
   */
  private static debugLog(message: string, data?: any): void {
    if (this.DEBUG) {
      console.log(`🔄 [DataSync] ${message}`, data || '');
    }
  }

  /**
   * Sincroniza dados completos de uma atividade
   */
  static sincronizarAtividade(atividade: any): AtividadeDados {
    this.debugLog('Iniciando sincronização de atividade', { id: atividade?.id, tipo: atividade?.tipo });

    if (!atividade) {
      throw new Error('Atividade é obrigatória para sincronização');
    }

    const atividadeSincronizada: AtividadeDados = {
      id: atividade.id || `atividade-${Date.now()}`,
      titulo: this.extrairTitulo(atividade),
      descricao: this.extrairDescricao(atividade),
      tipo: this.extrairTipo(atividade),
      dados: this.consolidarDados(atividade),
      customFields: atividade.customFields || {},
      personalizedTitle: atividade.personalizedTitle,
      personalizedDescription: atividade.personalizedDescription,
      description: atividade.description,
      // Metadados específicos
      subject: this.extrairDisciplina(atividade),
      schoolYear: this.extrairAnoEscolar(atividade),
      theme: this.extrairTema(atividade),
      objectives: this.extrairObjetivos(atividade),
      nivel: this.extrairNivel(atividade),
      disciplina: this.extrairDisciplina(atividade),
      tempo_estimado: this.extrairTempoEstimado(atividade)
    };

    this.debugLog('Sincronização concluída', atividadeSincronizada);
    return atividadeSincronizada;
  }

  /**
   * Extrai título usando hierarquia de fontes
   */
  private static extrairTitulo(atividade: any): string {
    return this.extrairDadoComHierarquia(atividade, this.FONTES_TITULO, 'título');
  }

  /**
   * Extrai descrição usando hierarquia de fontes
   */
  private static extrairDescricao(atividade: any): string {
    return this.extrairDadoComHierarquia(atividade, this.FONTES_DESCRICAO, 'descrição');
  }

  /**
   * Método genérico para extrair dados com hierarquia
   */
  private static extrairDadoComHierarquia(
    atividade: any, 
    fontes: FonteDados[], 
    tipoDado: string
  ): string {
    this.debugLog(`Extraindo ${tipoDado} com hierarquia de fontes`);

    // Ordenar fontes por prioridade (maior primeiro)
    const fontesOrdenadas = [...fontes].sort((a, b) => b.prioridade - a.prioridade);

    for (const fonte of fontesOrdenadas) {
      try {
        const valor = fonte.extrair(atividade);
        
        if (valor && fonte.validar(valor)) {
          this.debugLog(`${tipoDado} extraído da fonte prioritária ${fonte.prioridade}`, valor);
          return valor;
        }
      } catch (error) {
        this.debugLog(`Erro ao extrair ${tipoDado} da fonte ${fonte.prioridade}`, error);
      }
    }

    this.debugLog(`Nenhuma fonte válida encontrada para ${tipoDado}, usando fallback`);
    return tipoDado === 'título' ? 'Atividade Educacional' : 'Descrição não disponível.';
  }

  /**
   * Extrai tipo da atividade
   */
  private static extrairTipo(atividade: any): string {
    return atividade?.tipo || 
           atividade?.type || 
           atividade?.activityType || 
           atividade?.dados?.tipo ||
           'atividade-generica';
  }

  /**
   * Consolida todos os dados da atividade
   */
  private static consolidarDados(atividade: any): any {
    return {
      ...atividade?.dados,
      ...atividade?.data,
      ...atividade?.content,
      originalData: atividade,
      sincronizadoEm: new Date().toISOString()
    };
  }

  /**
   * Extrai disciplina/matéria
   */
  private static extrairDisciplina(atividade: any): string {
    const disciplinas = [
      atividade?.disciplina,
      atividade?.subject,
      atividade?.dados?.disciplina,
      atividade?.dados?.subject,
      atividade?.customFields?.disciplina,
      atividade?.customFields?.['Disciplina'],
      atividade?.customFields?.subject
    ];

    return disciplinas.find(d => d && d.trim()) || 'Geral';
  }

  /**
   * Extrai ano escolar
   */
  private static extrairAnoEscolar(atividade: any): string {
    const anos = [
      atividade?.schoolYear,
      atividade?.anoEscolar,
      atividade?.dados?.schoolYear,
      atividade?.dados?.anoEscolar,
      atividade?.customFields?.schoolYear,
      atividade?.customFields?.['Ano Escolar'],
      atividade?.customFields?.anoEscolar
    ];

    return anos.find(a => a && a.trim()) || 'Ensino Fundamental';
  }

  /**
   * Extrai tema
   */
  private static extrairTema(atividade: any): string {
    const temas = [
      atividade?.theme,
      atividade?.tema,
      atividade?.dados?.theme,
      atividade?.dados?.tema,
      atividade?.customFields?.theme,
      atividade?.customFields?.['Tema'],
      atividade?.customFields?.tema
    ];

    return temas.find(t => t && t.trim()) || '';
  }

  /**
   * Extrai objetivos
   */
  private static extrairObjetivos(atividade: any): string {
    const objetivos = [
      atividade?.objectives,
      atividade?.objetivos,
      atividade?.dados?.objectives,
      atividade?.dados?.objetivos,
      atividade?.customFields?.objectives,
      atividade?.customFields?.['Objetivos']
    ];

    return objetivos.find(o => o && o.trim()) || '';
  }

  /**
   * Extrai nível de dificuldade
   */
  private static extrairNivel(atividade: any): string {
    const niveis = [
      atividade?.nivel,
      atividade?.difficultyLevel,
      atividade?.dados?.nivel,
      atividade?.dados?.difficultyLevel,
      atividade?.customFields?.nivel,
      atividade?.customFields?.['Nível']
    ];

    return niveis.find(n => n && n.trim()) || 'Médio';
  }

  /**
   * Extrai tempo estimado
   */
  private static extrairTempoEstimado(atividade: any): number {
    const tempos = [
      atividade?.tempo_estimado,
      atividade?.timeEstimated,
      atividade?.dados?.tempo_estimado,
      atividade?.dados?.timeEstimated,
      atividade?.customFields?.tempo_estimado,
      atividade?.customFields?.['Tempo Estimado']
    ];

    const tempo = tempos.find(t => t && (typeof t === 'number' || !isNaN(parseInt(t))));
    return tempo ? (typeof tempo === 'number' ? tempo : parseInt(tempo)) : 30;
  }

  /**
   * Gera descrição de fallback baseada nos dados disponíveis
   */
  private static gerarDescricaoFallback(atividade: any): string {
    const tipo = this.extrairTipo(atividade);
    const disciplina = this.extrairDisciplina(atividade);
    const tema = this.extrairTema(atividade);

    let descricao = 'Esta é uma atividade educacional';

    if (tipo && tipo !== 'atividade-generica') {
      const tipoFormatado = this.formatarTipoAtividade(tipo);
      descricao += ` do tipo ${tipoFormatado}`;
    }

    if (disciplina && disciplina !== 'Geral') {
      descricao += ` da disciplina ${disciplina}`;
    }

    if (tema) {
      descricao += ` com foco no tema "${tema}"`;
    }

    descricao += '. Desenvolvida para facilitar o processo de ensino-aprendizagem com metodologias pedagógicas modernas.';

    return descricao;
  }

  /**
   * Gera título de fallback
   */
  private static gerarTituloFallback(atividade: any): string {
    const tipo = this.extrairTipo(atividade);
    const tema = this.extrairTema(atividade);

    if (tema) {
      return `${this.formatarTipoAtividade(tipo)}: ${tema}`;
    }

    return this.formatarTipoAtividade(tipo);
  }

  /**
   * Formata tipo de atividade para exibição
   */
  private static formatarTipoAtividade(tipo: string): string {
    const formatacao: { [key: string]: string } = {
      'flash-cards': 'Flash Cards',
      'quiz-interativo': 'Quiz Interativo',
      'lista-exercicios': 'Lista de Exercícios',
      'plano-aula': 'Plano de Aula',
      'sequencia-didatica': 'Sequência Didática',
      'quadro-interativo': 'Quadro Interativo',
      'mapa-mental': 'Mapa Mental',
      'atividade-generica': 'Atividade Educacional'
    };

    return formatacao[tipo] || 'Atividade Educacional';
  }

  /**
   * Valida se uma atividade tem dados suficientes
   */
  static validarAtividade(atividade: any): { valida: boolean; erros: string[] } {
    const erros: string[] = [];

    if (!atividade) {
      erros.push('Atividade não fornecida');
      return { valida: false, erros };
    }

    if (!atividade.id && !atividade.titulo && !atividade.title) {
      erros.push('Atividade deve ter pelo menos ID ou título');
    }

    const descricao = this.extrairDescricao(atividade);
    if (descricao === 'Descrição não disponível.' || descricao.length < 10) {
      erros.push('Descrição insuficiente ou ausente');
    }

    return {
      valida: erros.length === 0,
      erros
    };
  }

  /**
   * Atualiza uma atividade com novos dados mantendo integridade
   */
  static atualizarAtividade(atividadeOriginal: any, novosDados: Partial<AtividadeDados>): AtividadeDados {
    this.debugLog('Atualizando atividade', { id: atividadeOriginal?.id });

    const atividadeAtualizada = {
      ...atividadeOriginal,
      ...novosDados,
      dados: {
        ...atividadeOriginal?.dados,
        ...novosDados?.dados
      },
      customFields: {
        ...atividadeOriginal?.customFields,
        ...novosDados?.customFields
      },
      atualizadoEm: new Date().toISOString()
    };

    return this.sincronizarAtividade(atividadeAtualizada);
  }
}

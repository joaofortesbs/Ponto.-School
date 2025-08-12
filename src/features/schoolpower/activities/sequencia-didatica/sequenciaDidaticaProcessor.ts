
import SequenciaDidaticaGenerator, { SequenciaDidaticaData, SequenciaDidaticaResult } from './SequenciaDidaticaGenerator';

export interface ProcessorOptions {
  enableValidation?: boolean;
  enableEnhancement?: boolean;
  fallbackOnError?: boolean;
  customPrompts?: Record<string, string>;
}

export interface ProcessorResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  metadata?: {
    processingTime: number;
    validationPassed: boolean;
    enhancementsApplied: number;
    source: 'ai' | 'fallback' | 'enhanced';
  };
}

export class SequenciaDidaticaProcessor {
  private static readonly DEFAULT_OPTIONS: ProcessorOptions = {
    enableValidation: true,
    enableEnhancement: true,
    fallbackOnError: true,
    customPrompts: {}
  };

  /**
   * Processa uma solicitação de sequência didática
   */
  static async processSequenciaDidatica(
    inputData: any,
    options: ProcessorOptions = {}
  ): Promise<ProcessorResult> {
    const startTime = Date.now();
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const warnings: string[] = [];

    console.log('🔄 Iniciando processamento de Sequência Didática');
    console.log('📥 Dados de entrada:', inputData);

    try {
      // 1. Normalizar dados de entrada
      const normalizedData = this.normalizeInputData(inputData);
      console.log('✅ Dados normalizados:', normalizedData);

      // 2. Gerar sequência didática
      const generationResult = await SequenciaDidaticaGenerator.generate(normalizedData);

      if (!generationResult.success) {
        throw new Error(generationResult.error || 'Falha na geração');
      }

      let processedData = generationResult.data;

      // 3. Validação (se habilitada)
      if (mergedOptions.enableValidation) {
        const validationResult = this.validateSequenciaDidatica(processedData);
        if (!validationResult.isValid) {
          warnings.push(...validationResult.warnings);
          
          if (validationResult.isCritical && mergedOptions.fallbackOnError) {
            console.warn('⚠️ Validação crítica falhou, aplicando correções...');
            processedData = this.applyValidationFixes(processedData, validationResult.errors);
          }
        }
      }

      // 4. Melhorias (se habilitadas)
      let enhancementsApplied = 0;
      if (mergedOptions.enableEnhancement) {
        const enhancementResult = this.enhanceSequenciaDidatica(processedData);
        processedData = enhancementResult.data;
        enhancementsApplied = enhancementResult.count;
        warnings.push(...enhancementResult.warnings);
      }

      // 5. Finalização
      const finalData = this.finalizeSequenciaDidatica(processedData, normalizedData);

      console.log('✅ Processamento concluído com sucesso');

      return {
        success: true,
        data: finalData,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          processingTime: Date.now() - startTime,
          validationPassed: warnings.length === 0,
          enhancementsApplied,
          source: generationResult.metadata?.source || 'ai'
        }
      };

    } catch (error) {
      console.error('❌ Erro no processamento:', error);

      return {
        success: false,
        error: `Erro no processamento: ${error.message}`,
        metadata: {
          processingTime: Date.now() - startTime,
          validationPassed: false,
          enhancementsApplied: 0,
          source: 'fallback'
        }
      };
    }
  }

  /**
   * Normaliza os dados de entrada
   */
  private static normalizeInputData(inputData: any): SequenciaDidaticaData {
    // Mapear campos do actionPlan para formato esperado
    const normalizedData: SequenciaDidaticaData = {
      disciplina: inputData.disciplina || inputData.subject || inputData.materia || 'Não especificado',
      tema: inputData.tema || inputData.topic || inputData.title || inputData.description || 'Tema educacional',
      publicoAlvo: inputData.publicoAlvo || inputData.audience || inputData.target || 'Estudantes',
      duracao: inputData.duracao || inputData.duration || '4 aulas de 50 minutos',
      objetivo: inputData.objetivo || inputData.objective || inputData.goal || 'Desenvolver conhecimentos sobre o tema',
      observacoes: inputData.observacoes || inputData.notes || inputData.comments
    };

    // Aplicar melhorias nos dados normalizados
    if (normalizedData.tema === 'Não especificado' && inputData.description) {
      normalizedData.tema = this.extractThemeFromDescription(inputData.description);
    }

    if (normalizedData.disciplina === 'Não especificado' && inputData.category) {
      normalizedData.disciplina = this.mapCategoryToSubject(inputData.category);
    }

    return normalizedData;
  }

  /**
   * Extrai tema da descrição
   */
  private static extractThemeFromDescription(description: string): string {
    // Lógica simples para extrair tema de uma descrição
    const words = description.split(' ');
    if (words.length > 0) {
      return words.slice(0, 4).join(' '); // Primeiras 4 palavras como tema
    }
    return description.substring(0, 50); // Primeiros 50 caracteres
  }

  /**
   * Mapeia categoria para disciplina
   */
  private static mapCategoryToSubject(category: string): string {
    const mapping: Record<string, string> = {
      'matematica': 'Matemática',
      'portugues': 'Língua Portuguesa',
      'ciencias': 'Ciências',
      'historia': 'História',
      'geografia': 'Geografia',
      'fisica': 'Física',
      'quimica': 'Química',
      'biologia': 'Biologia',
      'educacional': 'Interdisciplinar'
    };

    const key = category.toLowerCase().trim();
    return mapping[key] || category;
  }

  /**
   * Valida a sequência didática gerada
   */
  private static validateSequenciaDidatica(data: any): {
    isValid: boolean;
    isCritical: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações críticas
    if (!data.titulo || data.titulo.trim() === '') {
      errors.push('Título não pode estar vazio');
    }

    if (!data.objetivos || !data.objetivos.geral) {
      errors.push('Objetivo geral é obrigatório');
    }

    if (!data.aulas || !Array.isArray(data.aulas) || data.aulas.length === 0) {
      errors.push('Pelo menos uma aula deve ser definida');
    }

    // Validações de aviso
    if (data.aulas && data.aulas.length < 2) {
      warnings.push('Sequência didática com apenas uma aula pode ser limitada');
    }

    if (!data.recursos || Object.keys(data.recursos).length === 0) {
      warnings.push('Recursos não especificados');
    }

    const isCritical = errors.length > 0;
    const isValid = errors.length === 0 && warnings.length < 3;

    return { isValid, isCritical, errors, warnings };
  }

  /**
   * Aplica correções de validação
   */
  private static applyValidationFixes(data: any, errors: string[]): any {
    const fixedData = { ...data };

    errors.forEach(error => {
      if (error.includes('Título')) {
        fixedData.titulo = `Sequência Didática: ${fixedData.tema || 'Conteúdo Educacional'}`;
      }

      if (error.includes('Objetivo geral')) {
        if (!fixedData.objetivos) fixedData.objetivos = {};
        fixedData.objetivos.geral = `Desenvolver compreensão sobre ${fixedData.tema || 'o conteúdo proposto'}`;
      }

      if (error.includes('aula')) {
        if (!fixedData.aulas || !Array.isArray(fixedData.aulas)) {
          fixedData.aulas = [{
            numero: 1,
            titulo: 'Aula Introdutória',
            duracao: '50 minutos',
            objetivos: ['Apresentar o conteúdo básico'],
            metodologia: 'Aula expositiva dialogada',
            desenvolvimento: {
              inicio: 'Apresentação do tema (10 min)',
              desenvolvimento: 'Exposição do conteúdo (30 min)',
              fechamento: 'Síntese e questionamentos (10 min)'
            },
            atividades: [{
              nome: 'Apresentação inicial',
              tipo: 'exposicao',
              duracao: '30 minutos',
              descricao: 'Apresentação dos conceitos básicos',
              materiais: ['Quadro', 'Projetor']
            }],
            avaliacao: {
              tipo: 'formativa',
              instrumentos: ['Observação'],
              criterios: ['Participação']
            }
          }];
        }
      }
    });

    return fixedData;
  }

  /**
   * Aplica melhorias na sequência didática
   */
  private static enhanceSequenciaDidatica(data: any): {
    data: any;
    count: number;
    warnings: string[];
  } {
    const enhanced = { ...data };
    let count = 0;
    const warnings: string[] = [];

    // 1. Enriquecer objetivos se necessário
    if (enhanced.objetivos && (!enhanced.objetivos.especificos || enhanced.objetivos.especificos.length < 3)) {
      enhanced.objetivos.especificos = this.generateObjectivesFromGeneral(enhanced.objetivos.geral, enhanced.tema);
      count++;
    }

    // 2. Adicionar competências e habilidades se não existir
    if (!enhanced.competenciasHabilidades) {
      enhanced.competenciasHabilidades = this.generateCompetenciasHabilidades(enhanced.disciplina);
      count++;
    }

    // 3. Enriquecer recursos se limitados
    if (!enhanced.recursos || Object.keys(enhanced.recursos).length < 2) {
      enhanced.recursos = this.enhanceRecursos(enhanced.recursos, enhanced.disciplina);
      count++;
    }

    // 4. Adicionar referências se não existir
    if (!enhanced.referencias || enhanced.referencias.length === 0) {
      enhanced.referencias = this.generateReferencias(enhanced.disciplina, enhanced.tema);
      count++;
    }

    // 5. Melhorar avaliação se básica
    if (enhanced.avaliacaoGeral && this.isBasicAssessment(enhanced.avaliacaoGeral)) {
      enhanced.avaliacaoGeral = this.enhanceAssessment(enhanced.avaliacaoGeral, enhanced.disciplina);
      count++;
    }

    return { data: enhanced, count, warnings };
  }

  private static generateObjectivesFromGeneral(generalObjective: string, tema: string): string[] {
    return [
      `Compreender os conceitos fundamentais relacionados a ${tema}`,
      `Aplicar conhecimentos sobre ${tema} em situações práticas`,
      `Desenvolver pensamento crítico sobre ${tema}`,
      `Estabelecer relações entre ${tema} e outros conhecimentos`
    ];
  }

  private static generateCompetenciasHabilidades(disciplina: string): string[] {
    const competenciasBase = [
      'Comunicação clara e eficaz',
      'Trabalho colaborativo',
      'Pensamento crítico e analítico',
      'Resolução de problemas'
    ];

    const competenciasPorDisciplina: Record<string, string[]> = {
      'Matemática': ['Raciocínio lógico-matemático', 'Interpretação de gráficos e dados'],
      'Língua Portuguesa': ['Interpretação textual', 'Produção textual'],
      'Ciências': ['Observação científica', 'Experimentação'],
      'História': ['Análise temporal', 'Interpretação de fontes históricas'],
      'Geografia': ['Análise espacial', 'Interpretação cartográfica']
    };

    return [...competenciasBase, ...(competenciasPorDisciplina[disciplina] || [])];
  }

  private static enhanceRecursos(recursosExistentes: any, disciplina: string): any {
    const recursosBase = {
      materiais: ['Quadro branco', 'Projetor multimídia', 'Material impresso'],
      tecnologicos: ['Computador', 'Internet', 'Aplicativos educacionais'],
      espaciais: ['Sala de aula', 'Biblioteca']
    };

    const recursosPorDisciplina: Record<string, any> = {
      'Matemática': {
        materiais: ['Calculadoras', 'Réguas e compassos', 'Material manipulativo'],
        tecnologicos: ['Software matemático', 'Aplicativos de geometria']
      },
      'Ciências': {
        materiais: ['Kit de experimentos', 'Microscópio', 'Materiais de laboratório'],
        espaciais: ['Laboratório de ciências']
      }
    };

    const disciplinaRecursos = recursosPorDisciplina[disciplina] || {};
    
    return {
      materiais: [...(recursosExistentes?.materiais || recursosBase.materiais), ...(disciplinaRecursos.materiais || [])],
      tecnologicos: [...(recursosExistentes?.tecnologicos || recursosBase.tecnologicos), ...(disciplinaRecursos.tecnologicos || [])],
      espaciais: [...(recursosExistentes?.espaciais || recursosBase.espaciais), ...(disciplinaRecursos.espaciais || [])]
    };
  }

  private static generateReferencias(disciplina: string, tema: string): string[] {
    return [
      'Base Nacional Comum Curricular (BNCC)',
      `Livro didático de ${disciplina}`,
      `Artigos científicos sobre ${tema}`,
      'Recursos digitais educacionais',
      'Material complementar da disciplina'
    ];
  }

  private static isBasicAssessment(avaliacao: any): boolean {
    return !avaliacao.criterios || avaliacao.criterios.length < 3 ||
           !avaliacao.instrumentos || avaliacao.instrumentos.length < 2;
  }

  private static enhanceAssessment(avaliacaoExistente: any, disciplina: string): any {
    return {
      ...avaliacaoExistente,
      tipos: ['Diagnóstica', 'Formativa', 'Somativa'],
      criterios: [
        'Compreensão conceitual',
        'Aplicação prática',
        'Participação e engajamento',
        'Qualidade das produções',
        'Colaboração'
      ],
      instrumentos: [
        'Observação sistemática',
        'Questionários',
        'Projetos práticos',
        'Apresentações',
        'Portfólio',
        'Autoavaliação'
      ],
      rubricas: {
        excelente: 'Demonstra domínio completo dos conceitos',
        bom: 'Demonstra boa compreensão com pequenas lacunas',
        satisfatorio: 'Demonstra compreensão básica',
        insuficiente: 'Apresenta dificuldades significativas'
      }
    };
  }

  /**
   * Finaliza a sequência didática com metadados
   */
  private static finalizeSequenciaDidatica(data: any, originalData: SequenciaDidaticaData): any {
    return {
      ...data,
      metadata: {
        geradoEm: new Date().toISOString(),
        versao: '1.0',
        origem: 'School Power IA',
        dadosOriginais: originalData,
        identificador: `seq_${Date.now()}`
      }
    };
  }

  /**
   * Valida dados de entrada antes do processamento
   */
  static validateInputData(inputData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!inputData) {
      errors.push('Dados de entrada não fornecidos');
      return { valid: false, errors };
    }

    // Verificar se há pelo menos informações mínimas
    const hasBasicInfo = inputData.tema || inputData.description || inputData.title ||
                        inputData.disciplina || inputData.subject || inputData.materia;

    if (!hasBasicInfo) {
      errors.push('Informações básicas insuficientes (tema, disciplina ou descrição)');
    }

    return { valid: errors.length === 0, errors };
  }
}

export default SequenciaDidaticaProcessor;

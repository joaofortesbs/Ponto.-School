
import { generateSequenciaDidatica } from '../../../../utils/api/geminiClient';

export interface SequenciaDidaticaData {
  disciplina: string;
  tema: string;
  publicoAlvo: string;
  duracao: string;
  objetivo: string;
  observacoes?: string;
}

export interface SequenciaDidaticaResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    generatedAt: string;
    processingTime: number;
    source: 'ai' | 'fallback';
  };
}

export class SequenciaDidaticaGenerator {
  private static readonly TIMEOUT_MS = 30000; // 30 segundos
  private static readonly MAX_RETRIES = 3;

  /**
   * Gera uma sequência didática completa
   */
  static async generate(data: SequenciaDidaticaData): Promise<SequenciaDidaticaResult> {
    const startTime = Date.now();
    
    console.log('🎯 Iniciando geração de Sequência Didática:', data);

    try {
      // Validação dos dados de entrada
      this.validateInputData(data);

      // Tentativa de geração com IA
      const aiResult = await this.generateWithAI(data);
      
      if (aiResult.success) {
        console.log('✅ Sequência Didática gerada com sucesso via IA');
        return {
          ...aiResult,
          metadata: {
            generatedAt: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            source: 'ai'
          }
        };
      }

      throw new Error(aiResult.error || 'Falha na geração via IA');

    } catch (error) {
      console.error('❌ Erro na geração via IA:', error);
      
      // Fallback para geração local
      console.log('🔄 Usando geração de fallback...');
      const fallbackResult = this.generateFallback(data);
      
      return {
        ...fallbackResult,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          source: 'fallback'
        }
      };
    }
  }

  /**
   * Valida os dados de entrada
   */
  private static validateInputData(data: SequenciaDidaticaData): void {
    const required = ['disciplina', 'tema', 'publicoAlvo'];
    const missing = required.filter(field => !data[field as keyof SequenciaDidaticaData]);
    
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios não preenchidos: ${missing.join(', ')}`);
    }
  }

  /**
   * Gera sequência didática usando IA
   */
  private static async generateWithAI(data: SequenciaDidaticaData): Promise<SequenciaDidaticaResult> {
    return new Promise(async (resolve, reject) => {
      // Timeout de segurança
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout na geração da sequência didática'));
      }, this.TIMEOUT_MS);

      try {
        const result = await generateSequenciaDidatica(data);
        clearTimeout(timeoutId);
        
        if (result && result.sequenciaDidatica) {
          resolve({
            success: true,
            data: result.sequenciaDidatica
          });
        } else {
          throw new Error('Resposta da IA não contém sequência didática válida');
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Gera sequência didática usando fallback local
   */
  private static generateFallback(data: SequenciaDidaticaData): SequenciaDidaticaResult {
    const sequenciaDidatica = {
      titulo: `Sequência Didática: ${data.tema}`,
      disciplina: data.disciplina,
      tema: data.tema,
      publicoAlvo: data.publicoAlvo,
      duracao: data.duracao || '4 aulas de 50 minutos',
      
      objetivos: {
        geral: `Desenvolver compreensão abrangente sobre ${data.tema} na disciplina de ${data.disciplina}`,
        especificos: [
          `Compreender os conceitos fundamentais de ${data.tema}`,
          `Aplicar conhecimentos de ${data.tema} em situações práticas`,
          `Desenvolver pensamento crítico sobre ${data.tema}`,
          `Estabelecer conexões entre ${data.tema} e outras áreas do conhecimento`
        ]
      },

      competenciasHabilidades: [
        'Análise e interpretação de informações',
        'Comunicação clara e objetiva',
        'Trabalho colaborativo',
        'Pensamento crítico e reflexivo'
      ],

      aulas: this.generateAulasFallback(data),
      
      recursos: {
        materiais: [
          'Quadro branco ou lousa',
          'Projetor multimídia',
          'Material impresso (textos, exercícios)',
          'Cartolinas e marcadores',
          'Computadores/tablets (se disponível)'
        ],
        tecnologicos: [
          'Acesso à internet',
          'Plataforma digital de aprendizagem',
          'Ferramentas de apresentação',
          'Aplicativos educacionais'
        ],
        espaciais: [
          'Sala de aula tradicional',
          'Laboratório de informática (se necessário)',
          'Biblioteca',
          'Espaços externos (quando aplicável)'
        ]
      },

      avaliacaoGeral: {
        tipos: ['Formativa', 'Somativa', 'Diagnóstica'],
        instrumentos: [
          'Observação sistemática',
          'Questionários',
          'Projetos práticos',
          'Apresentações orais',
          'Portfólio',
          'Autoavaliação'
        ],
        criterios: [
          'Compreensão conceitual',
          'Aplicação prática do conhecimento',
          'Participação e engajamento',
          'Qualidade das produções',
          'Colaboração e trabalho em equipe'
        ],
        rubricas: {
          excelente: 'Demonstra domínio completo e aplica conhecimentos de forma criativa',
          bom: 'Demonstra boa compreensão e aplica conhecimentos adequadamente',
          satisfatorio: 'Demonstra compreensão básica com algumas lacunas',
          insuficiente: 'Demonstra dificuldades significativas na compreensão'
        }
      },

      referencias: [
        'Base Nacional Comum Curricular (BNCC)',
        'Livro didático da disciplina',
        'Artigos científicos relacionados ao tema',
        'Recursos digitais educacionais'
      ],

      observacoes: data.observacoes || 'Esta sequência didática foi gerada automaticamente e pode ser adaptada conforme as necessidades específicas da turma.'
    };

    return {
      success: true,
      data: sequenciaDidatica
    };
  }

  /**
   * Gera aulas para o fallback
   */
  private static generateAulasFallback(data: SequenciaDidaticaData): any[] {
    const numeroAulas = this.extractNumeroAulas(data.duracao);
    const aulas = [];

    for (let i = 1; i <= numeroAulas; i++) {
      aulas.push({
        numero: i,
        titulo: this.generateTituloAula(i, data.tema, numeroAulas),
        duracao: '50 minutos',
        objetivos: this.generateObjetivosAula(i, data.tema),
        metodologia: this.generateMetodologia(i),
        
        desenvolvimento: {
          inicio: `Atividade de ${i === 1 ? 'diagnóstico e' : ''} motivação (10 min)`,
          desenvolvimento: `Desenvolvimento do conteúdo sobre ${data.tema} (30 min)`,
          fechamento: 'Síntese e avaliação da aprendizagem (10 min)'
        },

        atividades: this.generateAtividades(i, data.tema),
        
        avaliacao: {
          tipo: i === numeroAulas ? 'somativa' : 'formativa',
          instrumentos: this.generateInstrumentosAvaliacao(i, numeroAulas),
          criterios: [
            'Participação ativa nas discussões',
            'Compreensão dos conceitos apresentados',
            'Qualidade das respostas e questionamentos'
          ]
        },

        recursosEspecificos: this.generateRecursosAula(i),
        tarefasCasa: this.generateTarefasCasa(i, data.tema)
      });
    }

    return aulas;
  }

  private static extractNumeroAulas(duracao: string): number {
    const match = duracao.match(/(\d+)\s*aulas?/i);
    return match ? parseInt(match[1]) : 4;
  }

  private static generateTituloAula(numero: number, tema: string, total: number): string {
    if (numero === 1) return `Introdução a ${tema}`;
    if (numero === total) return `Consolidação e Avaliação de ${tema}`;
    if (numero === 2) return `Desenvolvimento Conceitual de ${tema}`;
    return `Aprofundamento em ${tema} - Parte ${numero - 1}`;
  }

  private static generateObjetivosAula(numero: number, tema: string): string[] {
    const objetivos = [
      [`Apresentar os conceitos fundamentais de ${tema}`, 'Diagnosticar conhecimentos prévios'],
      [`Aprofundar a compreensão sobre ${tema}`, 'Desenvolver habilidades práticas'],
      [`Aplicar conhecimentos de ${tema} em exercícios`, 'Estimular o pensamento crítico'],
      [`Consolidar a aprendizagem sobre ${tema}`, 'Avaliar o progresso dos estudantes']
    ];

    return objetivos[Math.min(numero - 1, objetivos.length - 1)] || objetivos[0];
  }

  private static generateMetodologia(numero: number): string {
    const metodologias = [
      'Aula expositiva dialogada com recursos audiovisuais',
      'Metodologia ativa com trabalho em grupos',
      'Aprendizagem baseada em problemas',
      'Síntese colaborativa e apresentações'
    ];

    return metodologias[Math.min(numero - 1, metodologias.length - 1)] || metodologias[0];
  }

  private static generateAtividades(numero: number, tema: string): any[] {
    const atividadesPorAula = [
      [ // Aula 1
        {
          nome: 'Brainstorming de conhecimentos prévios',
          tipo: 'grupo',
          duracao: '15 minutos',
          descricao: `Levantamento coletivo sobre o que os estudantes já sabem sobre ${tema}`,
          materiais: ['Quadro', 'Marcadores', 'Post-its']
        },
        {
          nome: 'Apresentação conceitual',
          tipo: 'exposicao',
          duracao: '20 minutos',
          descricao: `Apresentação dos conceitos básicos de ${tema}`,
          materiais: ['Projetor', 'Slides', 'Exemplos visuais']
        }
      ],
      [ // Aula 2
        {
          nome: 'Estudo de caso',
          tipo: 'grupo',
          duracao: '25 minutos',
          descricao: `Análise de situações práticas relacionadas a ${tema}`,
          materiais: ['Textos', 'Roteiro de análise']
        },
        {
          nome: 'Discussão dirigida',
          tipo: 'discussao',
          duracao: '15 minutos',
          descricao: 'Compartilhamento das análises entre os grupos',
          materiais: ['Quadro de sistematização']
        }
      ]
    ];

    return atividadesPorAula[Math.min(numero - 1, atividadesPorAula.length - 1)] || atividadesPorAula[0];
  }

  private static generateInstrumentosAvaliacao(numero: number, total: number): string[] {
    if (numero === 1) return ['Observação da participação', 'Diagnóstico inicial'];
    if (numero === total) return ['Avaliação escrita', 'Apresentação final', 'Autoavaliação'];
    return ['Observação sistemática', 'Registro de participação', 'Atividades práticas'];
  }

  private static generateRecursosAula(numero: number): string[] {
    const recursos = [
      ['Slides introdutórios', 'Vídeo motivacional', 'Material diagnóstico'],
      ['Textos para estudo de caso', 'Roteiros de atividades', 'Materiais de apoio'],
      ['Exercícios práticos', 'Ferramentas de criação', 'Referencias complementares'],
      ['Instrumentos de avaliação', 'Rubrica de correção', 'Material de síntese']
    ];

    return recursos[Math.min(numero - 1, recursos.length - 1)] || recursos[0];
  }

  private static generateTarefasCasa(numero: number, tema: string): string[] {
    return [
      `Pesquisar exemplos de ${tema} no cotidiano`,
      `Ler texto complementar sobre ${tema}`,
      `Preparar apresentação sobre aspecto específico de ${tema}`,
      `Elaborar síntese pessoal sobre o aprendizado de ${tema}`
    ][Math.min(numero - 1, 3)] ? [`Pesquisar exemplos de ${tema} no cotidiano`] : ['Revisar conteúdos abordados'];
  }

  /**
   * Valida a estrutura da sequência didática gerada
   */
  static validateSequenciaDidatica(data: any): boolean {
    try {
      const required = ['titulo', 'disciplina', 'tema', 'objetivos', 'aulas'];
      return required.every(field => data[field] !== undefined);
    } catch (error) {
      console.error('❌ Erro na validação:', error);
      return false;
    }
  }
}

export default SequenciaDidaticaGenerator;

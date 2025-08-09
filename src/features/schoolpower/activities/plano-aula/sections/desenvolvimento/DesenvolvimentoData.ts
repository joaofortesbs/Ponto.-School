
<old_str>import { ActivityData } from '../../types/ActivityData';

export interface EtapaDesenvolvimento {
  id: string;
  titulo: string;
  descricao: string;
  duracao: string;
  recursos: string[];
  metodologia: string;
  observacoes?: string;
}

export interface DesenvolvimentoData {
  etapas: EtapaDesenvolvimento[];
  observacoesGerais?: string;
  metodologiaGeral?: string;
  recursosNecessarios?: string[];
}

export class DesenvolvimentoDataProcessor {
  /**
   * Processa dados de desenvolvimento do plano de aula
   */
  static processarDados(activityData: any): DesenvolvimentoData {
    try {
      // Validar se activityData existe
      if (!activityData) {
        console.warn('⚠️ ActivityData não fornecido, criando dados padrão');
        return this.criarDadosPadrao();
      }

      // Extrair dados específicos do desenvolvimento
      const desenvolvimentoRaw = activityData.desenvolvimento || 
                                activityData.originalData?.desenvolvimento ||
                                activityData.generatedContent?.desenvolvimento;

      if (!desenvolvimentoRaw) {
        console.warn('⚠️ Dados de desenvolvimento não encontrados, criando padrão');
        return this.criarDadosPadrao();
      }

      // Processar etapas
      const etapas = this.processarEtapas(desenvolvimentoRaw);

      return {
        etapas: etapas || [],
        observacoesGerais: desenvolvimentoRaw.observacoesGerais || '',
        metodologiaGeral: desenvolvimentoRaw.metodologiaGeral || '',
        recursosNecessarios: Array.isArray(desenvolvimentoRaw.recursosNecessarios) 
          ? desenvolvimentoRaw.recursosNecessarios 
          : []
      };

    } catch (error) {
      console.error('❌ Erro ao processar dados de desenvolvimento:', error);
      return this.criarDadosPadrao();
    }
  }

  /**
   * Processa etapas de desenvolvimento
   */
  private static processarEtapas(desenvolvimentoRaw: any): EtapaDesenvolvimento[] {
    try {
      if (!desenvolvimentoRaw) return [];

      // Verificar se existe array de etapas
      let etapasArray = desenvolvimentoRaw.etapas || 
                       desenvolvimentoRaw.passos || 
                       desenvolvimentoRaw.fases ||
                       [];

      // Garantir que é um array
      if (!Array.isArray(etapasArray)) {
        console.warn('⚠️ Etapas não é um array, tentando converter');
        
        // Se for objeto, tentar extrair propriedades
        if (typeof etapasArray === 'object') {
          etapasArray = Object.values(etapasArray).filter(item => 
            item && typeof item === 'object'
          );
        } else {
          etapasArray = [];
        }
      }

      // Processar cada etapa
      return etapasArray.map((etapa: any, index: number) => {
        if (!etapa || typeof etapa !== 'object') {
          return this.criarEtapaPadrao(index + 1);
        }

        return {
          id: etapa.id || `etapa-${index + 1}`,
          titulo: etapa.titulo || etapa.title || etapa.nome || `Etapa ${index + 1}`,
          descricao: etapa.descricao || etapa.description || etapa.desc || '',
          duracao: etapa.duracao || etapa.tempo || etapa.duration || '30 min',
          recursos: Array.isArray(etapa.recursos) ? etapa.recursos : 
                   Array.isArray(etapa.materiais) ? etapa.materiais : [],
          metodologia: etapa.metodologia || etapa.metodo || etapa.abordagem || '',
          observacoes: etapa.observacoes || etapa.obs || ''
        };
      });

    } catch (error) {
      console.error('❌ Erro ao processar etapas:', error);
      return [this.criarEtapaPadrao(1)];
    }
  }

  /**
   * Cria dados padrão para desenvolvimento
   */
  private static criarDadosPadrao(): DesenvolvimentoData {
    return {
      etapas: [
        this.criarEtapaPadrao(1),
        this.criarEtapaPadrao(2),
        this.criarEtapaPadrao(3)
      ],
      observacoesGerais: 'Plano de desenvolvimento a ser personalizado conforme necessidades da turma.',
      metodologiaGeral: 'Metodologia participativa e interativa',
      recursosNecessarios: ['Material didático', 'Quadro', 'Projetor']
    };
  }

  /**
   * Cria uma etapa padrão
   */
  private static criarEtapaPadrao(numero: number): EtapaDesenvolvimento {
    const etapas = {
      1: {
        titulo: 'Abertura e Motivação',
        descricao: 'Apresentação do tema e motivação inicial dos alunos',
        metodologia: 'Exposição dialogada'
      },
      2: {
        titulo: 'Desenvolvimento do Conteúdo',
        descricao: 'Apresentação e explicação do conteúdo principal',
        metodologia: 'Metodologia expositiva e prática'
      },
      3: {
        titulo: 'Fixação e Avaliação',
        descricao: 'Atividades práticas para fixação do conteúdo',
        metodologia: 'Exercícios práticos e discussão'
      }
    };

    const etapaInfo = etapas[numero as keyof typeof etapas] || etapas[1];

    return {
      id: `etapa-${numero}`,
      titulo: etapaInfo.titulo,
      descricao: etapaInfo.descricao,
      duracao: '30 min',
      recursos: ['Material didático', 'Quadro'],
      metodologia: etapaInfo.metodologia,
      observacoes: ''
    };
  }

  /**
   * Valida dados de desenvolvimento
   */
  static validarDados(dados: DesenvolvimentoData): boolean {
    try {
      if (!dados) return false;
      
      // Verificar se tem etapas
      if (!Array.isArray(dados.etapas) || dados.etapas.length === 0) {
        return false;
      }

      // Validar cada etapa
      return dados.etapas.every(etapa => 
        etapa && 
        typeof etapa === 'object' &&
        etapa.id && 
        etapa.titulo && 
        etapa.descricao
      );

    } catch (error) {
      console.error('❌ Erro na validação dos dados de desenvolvimento:', error);
      return false;
    }
  }
}

// Export para compatibilidade
export { DesenvolvimentoDataProcessor as DesenvolvimentoGeminiService };</old_str>
<new_str>import { ActivityData } from '../../types/ActivityData';

export interface EtapaDesenvolvimento {
  id: string;
  titulo: string;
  descricao: string;
  duracao: string;
  recursos: string[];
  metodologia: string;
  observacoes?: string;
}

export interface DesenvolvimentoData {
  etapas: EtapaDesenvolvimento[];
  observacoesGerais?: string;
  metodologiaGeral?: string;
  recursosNecessarios?: string[];
}

export class DesenvolvimentoDataProcessor {
  /**
   * Processa dados de desenvolvimento do plano de aula
   */
  static processarDados(activityData: any): DesenvolvimentoData {
    try {
      // Validar se activityData existe
      if (!activityData) {
        console.warn('⚠️ ActivityData não fornecido, criando dados padrão');
        return this.criarDadosPadrao();
      }

      // Extrair dados específicos do desenvolvimento
      const desenvolvimentoRaw = activityData.desenvolvimento || 
                                activityData.originalData?.desenvolvimento ||
                                activityData.generatedContent?.desenvolvimento;

      if (!desenvolvimentoRaw) {
        console.warn('⚠️ Dados de desenvolvimento não encontrados, criando padrão');
        return this.criarDadosPadrao();
      }

      // Processar etapas
      const etapas = this.processarEtapas(desenvolvimentoRaw);

      return {
        etapas: etapas && etapas.length > 0 ? etapas : [this.criarEtapaPadrao(1)],
        observacoesGerais: desenvolvimentoRaw.observacoesGerais || '',
        metodologiaGeral: desenvolvimentoRaw.metodologiaGeral || '',
        recursosNecessarios: Array.isArray(desenvolvimentoRaw.recursosNecessarios) 
          ? desenvolvimentoRaw.recursosNecessarios 
          : []
      };

    } catch (error) {
      console.error('❌ Erro ao processar dados de desenvolvimento:', error);
      return this.criarDadosPadrao();
    }
  }

  /**
   * Processa etapas de desenvolvimento
   */
  private static processarEtapas(desenvolvimentoRaw: any): EtapaDesenvolvimento[] {
    try {
      if (!desenvolvimentoRaw) return [];

      // Verificar se existe array de etapas
      let etapasArray = desenvolvimentoRaw.etapas || 
                       desenvolvimentoRaw.passos || 
                       desenvolvimentoRaw.fases ||
                       [];

      // Garantir que é um array
      if (!Array.isArray(etapasArray)) {
        console.warn('⚠️ Etapas não é um array, tentando converter');
        
        // Se for objeto, tentar extrair propriedades
        if (typeof etapasArray === 'object') {
          etapasArray = Object.values(etapasArray).filter(item => 
            item && typeof item === 'object'
          );
        } else {
          etapasArray = [];
        }
      }

      // Se não há etapas válidas, retornar array vazio para criar padrões
      if (!etapasArray || etapasArray.length === 0) {
        return [];
      }

      // Processar cada etapa
      return etapasArray.map((etapa: any, index: number) => {
        if (!etapa || typeof etapa !== 'object') {
          return this.criarEtapaPadrao(index + 1);
        }

        return {
          id: etapa.id || `etapa-${index + 1}`,
          titulo: etapa.titulo || etapa.title || etapa.nome || `Etapa ${index + 1}`,
          descricao: etapa.descricao || etapa.description || etapa.desc || '',
          duracao: etapa.duracao || etapa.tempo || etapa.duration || '30 min',
          recursos: Array.isArray(etapa.recursos) ? etapa.recursos : 
                   Array.isArray(etapa.materiais) ? etapa.materiais : [],
          metodologia: etapa.metodologia || etapa.metodo || etapa.abordagem || '',
          observacoes: etapa.observacoes || etapa.obs || ''
        };
      });

    } catch (error) {
      console.error('❌ Erro ao processar etapas:', error);
      return [];
    }
  }

  /**
   * Cria dados padrão para desenvolvimento
   */
  private static criarDadosPadrao(): DesenvolvimentoData {
    return {
      etapas: [
        this.criarEtapaPadrao(1),
        this.criarEtapaPadrao(2),
        this.criarEtapaPadrao(3)
      ],
      observacoesGerais: 'Plano de desenvolvimento a ser personalizado conforme necessidades da turma.',
      metodologiaGeral: 'Metodologia participativa e interativa',
      recursosNecessarios: ['Material didático', 'Quadro', 'Projetor']
    };
  }

  /**
   * Cria uma etapa padrão
   */
  private static criarEtapaPadrao(numero: number): EtapaDesenvolvimento {
    const etapas = {
      1: {
        titulo: 'Abertura e Motivação',
        descricao: 'Apresentação do tema e motivação inicial dos alunos',
        metodologia: 'Exposição dialogada'
      },
      2: {
        titulo: 'Desenvolvimento do Conteúdo',
        descricao: 'Apresentação e explicação do conteúdo principal',
        metodologia: 'Metodologia expositiva e prática'
      },
      3: {
        titulo: 'Fixação e Avaliação',
        descricao: 'Atividades práticas para fixação do conteúdo',
        metodologia: 'Exercícios práticos e discussão'
      }
    };

    const etapaInfo = etapas[numero as keyof typeof etapas] || etapas[1];

    return {
      id: `etapa-${numero}`,
      titulo: etapaInfo.titulo,
      descricao: etapaInfo.descricao,
      duracao: '30 min',
      recursos: ['Material didático', 'Quadro'],
      metodologia: etapaInfo.metodologia,
      observacoes: ''
    };
  }

  /**
   * Valida dados de desenvolvimento
   */
  static validarDados(dados: DesenvolvimentoData): boolean {
    try {
      if (!dados) return false;
      
      // Verificar se tem etapas
      if (!Array.isArray(dados.etapas) || dados.etapas.length === 0) {
        return false;
      }

      // Validar cada etapa
      return dados.etapas.every(etapa => 
        etapa && 
        typeof etapa === 'object' &&
        etapa.id && 
        etapa.titulo && 
        etapa.descricao
      );

    } catch (error) {
      console.error('❌ Erro na validação dos dados de desenvolvimento:', error);
      return false;
    }
  }
}

// Export do serviço com nome correto
export class DesenvolvimentoGeminiService {
  static processarDados = DesenvolvimentoDataProcessor.processarDados;
  static validarDados = DesenvolvimentoDataProcessor.validarDados;
  
  static processarEtapas(desenvolvimentoRaw: any): EtapaDesenvolvimento[] {
    return DesenvolvimentoDataProcessor['processarEtapas'](desenvolvimentoRaw);
  }
  
  static criarDadosPadrao(): DesenvolvimentoData {
    return DesenvolvimentoDataProcessor['criarDadosPadrao']();
  }
  
  static criarEtapaPadrao(numero: number): EtapaDesenvolvimento {
    return DesenvolvimentoDataProcessor['criarEtapaPadrao'](numero);
  }
}

// Export default
export default DesenvolvimentoDataProcessor;</old_str>

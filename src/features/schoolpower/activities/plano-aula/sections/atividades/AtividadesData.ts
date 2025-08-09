
export interface AtividadeRecurso {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'exercicio' | 'leitura' | 'pesquisa' | 'pratica' | 'projeto' | 'discussao' | 'avaliacao';
  duracao: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  recursos: string[];
  objetivos: string[];
  tags: string[];
  categoria?: string;
  schoolPowerId?: string;
}

export interface AtividadesData {
  atividadesRecursos: AtividadeRecurso[];
  orientacoesGerais: string;
  materiaisNecessarios: string[];
  tempoEstimado: string;
  observacoes?: string;
}

import schoolPowerActivitiesData from '../../../data/schoolPowerActivities.json';

export class AtividadesDataProcessor {
  /**
   * Gera dados padrão para a seção de Atividades
   */
  static gerarDadosPadrao(): AtividadesData {
    return {
      atividadesRecursos: [
        {
          id: 'atividade_001',
          titulo: 'Lista de Exercícios Fundamentais',
          descricao: 'Exercícios básicos para fixação do conteúdo apresentado',
          tipo: 'exercicio',
          duracao: '30 minutos',
          dificuldade: 'medio',
          recursos: ['Caderno', 'Calculadora'],
          objetivos: ['Fixar conceitos básicos', 'Praticar resolução de problemas'],
          tags: ['exercicios', 'pratica', 'fixacao']
        },
        {
          id: 'atividade_002',
          titulo: 'Pesquisa Dirigida',
          descricao: 'Investigação sobre aplicações práticas do tema estudado',
          tipo: 'pesquisa',
          duracao: '45 minutos',
          dificuldade: 'medio',
          recursos: ['Internet', 'Fontes bibliográficas'],
          objetivos: ['Ampliar conhecimentos', 'Desenvolver autonomia'],
          tags: ['pesquisa', 'autonomia', 'aplicacao']
        },
        {
          id: 'atividade_003',
          titulo: 'Discussão em Grupo',
          descricao: 'Debate sobre os principais conceitos e suas implicações',
          tipo: 'discussao',
          duracao: '25 minutos',
          dificuldade: 'facil',
          recursos: ['Espaço para discussão'],
          objetivos: ['Promover debate', 'Compartilhar ideias'],
          tags: ['discussao', 'colaboracao', 'debate']
        }
      ],
      orientacoesGerais: 'As atividades devem ser realizadas de forma sequencial, permitindo que os alunos construam conhecimento de forma progressiva.',
      materiaisNecessarios: ['Caderno', 'Lápis/Caneta', 'Calculadora', 'Acesso à internet'],
      tempoEstimado: '100 minutos',
      observacoes: 'Observar o ritmo de aprendizagem dos alunos e adaptar conforme necessário.'
    };
  }

  /**
   * Processa dados recebidos da IA
   */
  static processarDadosIA(dadosIA: any, contexto?: any): AtividadesData {
    const dadosPadrao = this.gerarDadosPadrao();
    
    if (!dadosIA) {
      return dadosPadrao;
    }

    try {
      const atividades = this.extrairAtividades(dadosIA, contexto);
      
      return {
        atividadesRecursos: atividades.length > 0 ? atividades : dadosPadrao.atividadesRecursos,
        orientacoesGerais: dadosIA.orientacoesGerais || dadosIA.orientacoes || dadosPadrao.orientacoesGerais,
        materiaisNecessarios: Array.isArray(dadosIA.materiaisNecessarios) 
          ? dadosIA.materiaisNecessarios 
          : dadosPadrao.materiaisNecessarios,
        tempoEstimado: dadosIA.tempoEstimado || dadosIA.tempo || dadosPadrao.tempoEstimado,
        observacoes: dadosIA.observacoes || dadosPadrao.observacoes
      };
    } catch (error) {
      console.error('Erro ao processar dados da IA para Atividades:', error);
      return dadosPadrao;
    }
  }

  /**
   * Extrai atividades dos dados da IA
   */
  private static extrairAtividades(dadosIA: any, contexto?: any): AtividadeRecurso[] {
    const atividades: AtividadeRecurso[] = [];

    // Tentar extrair de diferentes estruturas possíveis
    const fontesAtividades = [
      dadosIA.atividadesRecursos,
      dadosIA.atividades,
      dadosIA.recursos,
      dadosIA.atividade,
      dadosIA
    ];

    for (const fonte of fontesAtividades) {
      if (Array.isArray(fonte)) {
        fonte.forEach((item, index) => {
          const atividade = this.processarAtividadeItem(item, index);
          if (atividade) {
            atividades.push(atividade);
          }
        });
        break;
      }
    }

    // Se não encontrou atividades, adicionar atividades do School Power relevantes
    if (atividades.length === 0) {
      this.adicionarAtividadesSchoolPowerRelevantes(atividades, contexto);
    }

    return atividades;
  }

  /**
   * Processa um item de atividade individual
   */
  private static processarAtividadeItem(item: any, index: number): AtividadeRecurso | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const tipos = ['exercicio', 'leitura', 'pesquisa', 'pratica', 'projeto', 'discussao', 'avaliacao'];
    const dificuldades = ['facil', 'medio', 'dificil'];

    return {
      id: item.id || `atividade_${String(index + 1).padStart(3, '0')}`,
      titulo: item.titulo || item.title || item.nome || `Atividade ${index + 1}`,
      descricao: item.descricao || item.description || item.desc || 'Descrição da atividade',
      tipo: tipos.includes(item.tipo) ? item.tipo : 'exercicio',
      duracao: item.duracao || item.tempo || item.duration || '30 minutos',
      dificuldade: dificuldades.includes(item.dificuldade) ? item.dificuldade : 'medio',
      recursos: Array.isArray(item.recursos) ? item.recursos : 
                Array.isArray(item.materiais) ? item.materiais : 
                ['Material básico'],
      objetivos: Array.isArray(item.objetivos) ? item.objetivos : 
                 Array.isArray(item.metas) ? item.metas : 
                 ['Objetivo da atividade'],
      tags: Array.isArray(item.tags) ? item.tags : 
            Array.isArray(item.palavrasChave) ? item.palavrasChave : 
            ['atividade'],
      categoria: item.categoria || item.category,
      schoolPowerId: item.schoolPowerId || item.schoolPowerActivityId
    };
  }

  /**
   * Adiciona atividades do School Power relevantes ao contexto
   */
  private static adicionarAtividadesSchoolPowerRelevantes(
    atividadesRecursos: AtividadeRecurso[], 
    contexto?: any
  ): void {
    // Obter disciplina do contexto se disponível
    const disciplina = contexto?.disciplina || contexto?.materia || '';
    const tema = contexto?.tema || contexto?.assunto || '';

    // Selecionar atividades relevantes
    const atividadesRelevantes = schoolPowerActivitiesData.filter(activity => {
      const tags = activity.tags || [];
      const categoria = activity.category || '';

      // Verificar se a atividade é relevante para a disciplina ou tema
      return tags.some((tag: string) => 
        disciplina.toLowerCase().includes(tag.toLowerCase()) ||
        tema.toLowerCase().includes(tag.toLowerCase()) ||
        categoria.toLowerCase().includes(disciplina.toLowerCase())
      );
    }).slice(0, 3); // Limite de 3 atividades

    // Converter atividades do School Power para o formato esperado
    atividadesRelevantes.forEach((activity, index) => {
      atividadesRecursos.push({
        id: `sp_${activity.id}`,
        titulo: activity.title || activity.name,
        descricao: activity.description,
        tipo: this.mapearTipoSchoolPower(activity.category),
        duracao: '30 minutos',
        dificuldade: 'medio',
        recursos: ['Material digital', 'Computador/Tablet'],
        objetivos: ['Aplicar conhecimentos', 'Desenvolver competências'],
        tags: activity.tags || [],
        categoria: activity.category,
        schoolPowerId: activity.id
      });
    });
  }

  /**
   * Mapeia categoria do School Power para tipo de atividade
   */
  private static mapearTipoSchoolPower(categoria: string): AtividadeRecurso['tipo'] {
    const mapeamento: Record<string, AtividadeRecurso['tipo']> = {
      'exercicios': 'exercicio',
      'lista': 'exercicio',
      'pesquisa': 'pesquisa',
      'projeto': 'projeto',
      'avaliacao': 'avaliacao',
      'prova': 'avaliacao',
      'discussao': 'discussao',
      'leitura': 'leitura',
      'pratica': 'pratica'
    };

    for (const [key, value] of Object.entries(mapeamento)) {
      if (categoria?.toLowerCase().includes(key)) {
        return value;
      }
    }

    return 'exercicio';
  }

  /**
   * Valida dados de atividades
   */
  static validarDados(dados: AtividadesData): boolean {
    if (!dados || typeof dados !== 'object') {
      return false;
    }

    if (!Array.isArray(dados.atividadesRecursos)) {
      return false;
    }

    // Validar cada atividade
    return dados.atividadesRecursos.every(atividade => 
      atividade &&
      typeof atividade.id === 'string' &&
      typeof atividade.titulo === 'string' &&
      typeof atividade.descricao === 'string' &&
      Array.isArray(atividade.recursos) &&
      Array.isArray(atividade.objetivos)
    );
  }

  /**
   * Converte dados para formato de exibição
   */
  static converterParaExibicao(dados: AtividadesData): any {
    return {
      titulo: 'Atividades e Recursos',
      dados: dados,
      estrutura: {
        atividadesRecursos: dados.atividadesRecursos.map(atividade => ({
          ...atividade,
          tipoDisplay: this.obterTipoDisplay(atividade.tipo),
          dificuldadeDisplay: this.obterDificuldadeDisplay(atividade.dificuldade),
          icone: this.obterIconeAtividade(atividade.tipo)
        })),
        orientacoesGerais: dados.orientacoesGerais,
        materiaisNecessarios: dados.materiaisNecessarios,
        tempoEstimado: dados.tempoEstimado,
        observacoes: dados.observacoes
      }
    };
  }

  /**
   * Obtém display do tipo de atividade
   */
  private static obterTipoDisplay(tipo: string): string {
    const displays: Record<string, string> = {
      'exercicio': 'Exercício',
      'leitura': 'Leitura',
      'pesquisa': 'Pesquisa',
      'pratica': 'Prática',
      'projeto': 'Projeto',
      'discussao': 'Discussão',
      'avaliacao': 'Avaliação'
    };
    return displays[tipo] || 'Atividade';
  }

  /**
   * Obtém display da dificuldade
   */
  private static obterDificuldadeDisplay(dificuldade: string): string {
    const displays: Record<string, string> = {
      'facil': 'Fácil',
      'medio': 'Médio',
      'dificil': 'Difícil'
    };
    return displays[dificuldade] || 'Médio';
  }

  /**
   * Obtém ícone da atividade
   */
  private static obterIconeAtividade(tipo: string): string {
    const icones: Record<string, string> = {
      'exercicio': '📝',
      'leitura': '📖',
      'pesquisa': '🔍',
      'pratica': '⚡',
      'projeto': '🏗️',
      'discussao': '💬',
      'avaliacao': '📊'
    };
    return icones[tipo] || '📝';
  }
}

// Dados padrão para inicialização
export const atividadesDataPadrao: AtividadesData = AtividadesDataProcessor.gerarDadosPadrao();

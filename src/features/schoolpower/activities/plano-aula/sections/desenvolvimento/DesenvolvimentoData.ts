
export interface EtapaDesenvolvimento {
  titulo: string;
  descricao: string;
  tipoInteracao: 'apresentacao' | 'discussao' | 'pratica' | 'grupo' | 'individual' | 'demonstracao';
  tempoEstimado: number; // em minutos
  recursos: string[];
  observacoes?: string;
}

export interface DesenvolvimentoData {
  titulo: string;
  descricao: string;
  tempoTotal: number;
  etapas: EtapaDesenvolvimento[];
  timestamp: string;
  plano_id: string;
}

export class DesenvolvimentoDataProcessor {
  /**
   * Cria dados padrão para desenvolvimento quando não há dados disponíveis
   */
  private static criarDadosPadrao(planoData?: any): DesenvolvimentoData {
    return {
      titulo: "Desenvolvimento da Aula",
      descricao: "Sequência de atividades para desenvolvimento do conteúdo",
      tempoTotal: 45,
      etapas: this.criarEtapasPadrao(planoData),
      timestamp: new Date().toISOString(),
      plano_id: planoData?.id || `plano_${Date.now()}`
    };
  }

  /**
   * Cria etapas padrão para o desenvolvimento
   */
  private static criarEtapasPadrao(planoData?: any): EtapaDesenvolvimento[] {
    const disciplina = planoData?.disciplina || 'disciplina';
    const tema = planoData?.tema || 'tema da aula';

    return [
      {
        titulo: "Introdução ao Tema",
        descricao: `Apresentação inicial sobre ${tema}`,
        tipoInteracao: 'apresentacao',
        tempoEstimado: 10,
        recursos: ["Quadro", "Material didático"],
        observacoes: "Contextualizar o tema com exemplos práticos"
      },
      {
        titulo: "Desenvolvimento do Conteúdo",
        descricao: `Exploração detalhada dos conceitos de ${disciplina}`,
        tipoInteracao: 'discussao',
        tempoEstimado: 20,
        recursos: ["Livro didático", "Atividades práticas"],
        observacoes: "Incentivar participação dos alunos"
      },
      {
        titulo: "Atividade Prática",
        descricao: "Exercícios e aplicação dos conceitos aprendidos",
        tipoInteracao: 'pratica',
        tempoEstimado: 10,
        recursos: ["Lista de exercícios", "Material de apoio"],
        observacoes: "Acompanhar individualmente os alunos"
      },
      {
        titulo: "Síntese e Fechamento",
        descricao: "Revisão dos principais pontos da aula",
        tipoInteracao: 'discussao',
        tempoEstimado: 5,
        recursos: ["Quadro", "Resumo"],
        observacoes: "Verificar compreensão dos alunos"
      }
    ];
  }

  /**
   * Valida se um objeto tem a estrutura de EtapaDesenvolvimento
   */
  private static validarEtapa(etapa: any): boolean {
    if (!etapa || typeof etapa !== 'object') return false;
    
    const camposObrigatorios = ['titulo', 'descricao', 'tipoInteracao', 'tempoEstimado'];
    return camposObrigatorios.every(campo => etapa.hasOwnProperty(campo));
  }

  /**
   * Sanitiza e valida as etapas de desenvolvimento
   */
  private static sanitizarEtapas(etapas: any[]): EtapaDesenvolvimento[] {
    if (!Array.isArray(etapas) || etapas.length === 0) {
      return this.criarEtapasPadrao();
    }

    return etapas
      .filter(etapa => this.validarEtapa(etapa))
      .map(etapa => ({
        titulo: String(etapa.titulo || 'Etapa sem título'),
        descricao: String(etapa.descricao || 'Descrição não disponível'),
        tipoInteracao: etapa.tipoInteracao || 'apresentacao',
        tempoEstimado: Number(etapa.tempoEstimado) || 5,
        recursos: Array.isArray(etapa.recursos) ? etapa.recursos : ['Material didático'],
        observacoes: etapa.observacoes ? String(etapa.observacoes) : undefined
      }));
  }

  /**
   * Processa dados de desenvolvimento vindos de diferentes fontes
   */
  static processarDadosDesenvolvimento(input: any): DesenvolvimentoData {
    console.log('🔄 DesenvolvimentoDataProcessor: Iniciando processamento', input);

    // Verificar se input existe e não é nulo
    if (!input || typeof input !== 'object') {
      console.warn('⚠️ Input inválido, criando dados padrão');
      return this.criarDadosPadrao();
    }

    const { planoData, activityData, desenvolvimento } = input;

    // Tentar extrair etapas de desenvolvimento de várias fontes possíveis
    let etapasOriginais: any[] = [];
    
    // Prioridade: desenvolvimento direto > planoData > activityData
    if (desenvolvimento?.etapas && Array.isArray(desenvolvimento.etapas)) {
      etapasOriginais = desenvolvimento.etapas;
      console.log('📝 Usando etapas do desenvolvimento direto:', etapasOriginais.length);
    } else if (planoData?.desenvolvimento?.etapas && Array.isArray(planoData.desenvolvimento.etapas)) {
      etapasOriginais = planoData.desenvolvimento.etapas;
      console.log('📝 Usando etapas do planoData:', etapasOriginais.length);
    } else if (activityData?.desenvolvimento?.etapas && Array.isArray(activityData.desenvolvimento.etapas)) {
      etapasOriginais = activityData.desenvolvimento.etapas;
      console.log('📝 Usando etapas do activityData:', etapasOriginais.length);
    } else if (activityData?.originalData?.desenvolvimento?.etapas && Array.isArray(activityData.originalData.desenvolvimento.etapas)) {
      etapasOriginais = activityData.originalData.desenvolvimento.etapas;
      console.log('📝 Usando etapas do originalData:', etapasOriginais.length);
    } else {
      console.log('📝 Nenhuma etapa encontrada, criando etapas padrão');
    }

    // Sanitizar e validar as etapas
    const etapasProcessadas = this.sanitizarEtapas(etapasOriginais);
    
    // Calcular tempo total
    const tempoTotal = etapasProcessadas.reduce((total, etapa) => {
      return total + (etapa.tempoEstimado || 0);
    }, 0);

    // Criar o objeto de retorno
    const resultado: DesenvolvimentoData = {
      titulo: desenvolvimento?.titulo || planoData?.titulo || activityData?.titulo || "Desenvolvimento da Aula",
      descricao: desenvolvimento?.descricao || "Sequência de atividades para desenvolvimento do conteúdo",
      tempoTotal: Math.min(tempoTotal, 45), // Limitar a 45 minutos
      etapas: etapasProcessadas,
      timestamp: new Date().toISOString(),
      plano_id: planoData?.id || activityData?.id || `plano_${Date.now()}`
    };

    console.log('✅ DesenvolvimentoDataProcessor: Processamento concluído', {
      totalEtapas: resultado.etapas.length,
      tempoTotal: resultado.tempoTotal
    });

    return resultado;
  }

  /**
   * Gera prompt para IA criar desenvolvimento de aula
   */
  static gerarPromptDesenvolvimento(contextoPlano: any): string {
    const disciplina = contextoPlano?.disciplina || 'disciplina não especificada';
    const tema = contextoPlano?.tema || 'tema não especificado';
    const objetivos = contextoPlano?.objetivos || 'objetivos não definidos';
    
    return `Crie um desenvolvimento de aula detalhado para:

**CONTEXTO DA AULA:**
- Disciplina: ${disciplina}
- Tema: ${tema}  
- Objetivos: ${objetivos}
- Ano/Série: ${contextoPlano?.anoEscolaridade || contextoPlano?.serie || 'Não especificado'}
- Tempo disponível: 45 minutos (MÁXIMO)
- Metodologia: ${contextoPlano?.metodologia || 'Ativa e participativa'}

**ATIVIDADES DISPONÍVEIS NO SCHOOL POWER (inclua algumas nos recursos):**
Resumo, Lista de Exercícios, Prova, Mapa Mental, Texto de Apoio, Plano de Aula, Sequência Didática, Jogos Educativos, Apresentação de Slides, Proposta de Redação, Simulado, Caça-Palavras, Palavras Cruzadas, Experimento Científico, Critérios de Avaliação, Revisão Guiada, Atividades de Matemática, Quiz, Charadas, Corretor de Questões.

**INSTRUÇÕES ESPECÍFICAS:**
1. Crie entre 3 a 5 etapas de desenvolvimento da aula
2. Cada etapa deve ter: título claro, descrição detalhada, tipo de interação, tempo estimado e recursos necessários
3. O tempo total NÃO deve exceder 45 minutos (LIMITE MÁXIMO)
4. Distribua o tempo de forma equilibrada entre as etapas
5. Varie os tipos de interação (apresentacao, discussao, pratica, grupo, individual)
6. SEMPRE inclua pelo menos 1-2 atividades do School Power nos recursos
7. Seja específico e prático nas descrições

**FORMATO DE RESPOSTA (JSON):**
{
  "titulo": "Desenvolvimento da Aula",
  "descricao": "Breve descrição do desenvolvimento",
  "etapas": [
    {
      "titulo": "Nome da Etapa",
      "descricao": "Descrição detalhada do que será feito",
      "tipoInteracao": "apresentacao|discussao|pratica|grupo|individual",
      "tempoEstimado": numero_em_minutos,
      "recursos": ["recurso1", "recurso2", "atividade_school_power"],
      "observacoes": "Dicas pedagógicas específicas"
    }
  ]
}`;
  }

  /**
   * Valida se os dados de desenvolvimento estão corretos
   */
  static validarDados(dados: DesenvolvimentoData): boolean {
    if (!dados || typeof dados !== 'object') return false;
    
    // Verificar campos obrigatórios
    if (!dados.titulo || !dados.etapas || !Array.isArray(dados.etapas)) {
      return false;
    }
    
    // Verificar se há pelo menos uma etapa
    if (dados.etapas.length === 0) return false;
    
    // Verificar cada etapa
    return dados.etapas.every(etapa => this.validarEtapa(etapa));
  }
}

// Função de conveniência para uso direto
export const processarDesenvolvimento = (input: any): DesenvolvimentoData => {
  return DesenvolvimentoDataProcessor.processarDadosDesenvolvimento(input);
};

// Export das interfaces e classe principal
export { DesenvolvimentoDataProcessor as default };

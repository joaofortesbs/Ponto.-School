
export interface AtividadeRecurso {
  id: string;
  nome: string;
  tipo: 'atividade' | 'recurso';
  icone: string;
  descricao?: string;
  origem_etapa?: number;
  categoria?: string;
}

export interface AtividadesData {
  atividades_recursos: AtividadeRecurso[];
  total_items: number;
  ultima_atualizacao: string;
}

export class AtividadesDataProcessor {
  static extrairAtividadesRecursosDoDesenvolvimento(desenvolvimentoData: any): AtividadeRecurso[] {
    if (!desenvolvimentoData || !Array.isArray(desenvolvimentoData)) {
      return [];
    }

    const atividadesRecursos: AtividadeRecurso[] = [];

    desenvolvimentoData.forEach((etapa: any, index: number) => {
      // Extrair recursos gerados
      if (etapa.recurso_gerado && etapa.recurso_gerado.trim()) {
        const recursos = etapa.recurso_gerado.split(',').map((r: string) => r.trim());
        recursos.forEach((recurso: string) => {
          if (recurso) {
            atividadesRecursos.push({
              id: `recurso-${index}-${recurso.toLowerCase().replace(/\s+/g, '-')}`,
              nome: recurso,
              tipo: 'recurso',
              icone: this.obterIconeRecurso(recurso),
              descricao: `Recurso utilizado na etapa "${etapa.titulo}"`,
              origem_etapa: index + 1,
              categoria: 'Material Didático'
            });
          }
        });
      }

      // Extrair atividades baseadas no tipo de interação
      if (etapa.tipo_interacao && etapa.tipo_interacao.trim()) {
        const atividade = this.criarAtividadeDoTipoInteracao(etapa.tipo_interacao, etapa, index);
        if (atividade) {
          atividadesRecursos.push(atividade);
        }
      }

      // Extrair atividades adicionais mencionadas na descrição
      const atividadesExtras = this.extrairAtividadesDaDescricao(etapa.descricao, etapa, index);
      atividadesRecursos.push(...atividadesExtras);
    });

    // Remover duplicatas baseado no nome
    const atividadesUnicas = atividadesRecursos.filter((item, index, self) =>
      index === self.findIndex(t => t.nome.toLowerCase() === item.nome.toLowerCase())
    );

    return atividadesUnicas;
  }

  static obterIconeRecurso(recurso: string): string {
    const recursoLower = recurso.toLowerCase();
    
    if (recursoLower.includes('slide') || recursoLower.includes('apresenta')) return 'presentation';
    if (recursoLower.includes('video') || recursoLower.includes('vídeo')) return 'video';
    if (recursoLower.includes('áudio') || recursoLower.includes('som')) return 'mic';
    if (recursoLower.includes('texto') || recursoLower.includes('material')) return 'file-text';
    if (recursoLower.includes('jogo') || recursoLower.includes('lúdic')) return 'gamepad-2';
    if (recursoLower.includes('quadro') || recursoLower.includes('lousa')) return 'square';
    if (recursoLower.includes('livro') || recursoLower.includes('apostila')) return 'book-open';
    if (recursoLower.includes('exercício') || recursoLower.includes('atividade')) return 'pen-tool';
    if (recursoLower.includes('mapa') || recursoLower.includes('esquema')) return 'map';
    if (recursoLower.includes('imagem') || recursoLower.includes('figura')) return 'image';
    
    return 'activity';
  }

  static criarAtividadeDoTipoInteracao(tipoInteracao: string, etapa: any, index: number): AtividadeRecurso | null {
    const tipo = tipoInteracao.toLowerCase();
    
    let nomeAtividade = '';
    let icone = '';
    let categoria = '';

    if (tipo.includes('exposi') || tipo.includes('apresenta')) {
      nomeAtividade = 'Apresentação Expositiva';
      icone = 'presentation';
      categoria = 'Metodologia Ativa';
    } else if (tipo.includes('interativ') || tipo.includes('particip')) {
      nomeAtividade = 'Atividade Interativa';
      icone = 'users';
      categoria = 'Metodologia Ativa';
    } else if (tipo.includes('prática') || tipo.includes('exercít')) {
      nomeAtividade = 'Atividade Prática';
      icone = 'pen-tool';
      categoria = 'Prática';
    } else if (tipo.includes('avaliat') || tipo.includes('test')) {
      nomeAtividade = 'Atividade Avaliativa';
      icone = 'check-circle';
      categoria = 'Avaliação';
    } else if (tipo.includes('discussão') || tipo.includes('debate')) {
      nomeAtividade = 'Discussão em Grupo';
      icone = 'message-square';
      categoria = 'Metodologia Ativa';
    } else {
      nomeAtividade = `Atividade - ${tipoInteracao}`;
      icone = 'activity';
      categoria = 'Geral';
    }

    return {
      id: `atividade-${index}-${tipo.replace(/\s+/g, '-')}`,
      nome: nomeAtividade,
      tipo: 'atividade',
      icone,
      descricao: `${tipoInteracao} - ${etapa.descricao}`,
      origem_etapa: index + 1,
      categoria
    };
  }

  static extrairAtividadesDaDescricao(descricao: string, etapa: any, index: number): AtividadeRecurso[] {
    if (!descricao) return [];

    const atividades: AtividadeRecurso[] = [];
    const descricaoLower = descricao.toLowerCase();

    // Palavras-chave para identificar atividades
    const atividadesChave = [
      { keyword: 'quiz', nome: 'Quiz Interativo', icone: 'help-circle' },
      { keyword: 'brainstorm', nome: 'Brainstorming', icone: 'zap' },
      { keyword: 'roda de conversa', nome: 'Roda de Conversa', icone: 'users' },
      { keyword: 'dinâmica', nome: 'Dinâmica de Grupo', icone: 'users-2' },
      { keyword: 'simulação', nome: 'Simulação', icone: 'play' },
      { keyword: 'pesquisa', nome: 'Atividade de Pesquisa', icone: 'search' },
      { keyword: 'produção textual', nome: 'Produção Textual', icone: 'edit-3' },
      { keyword: 'leitura', nome: 'Leitura Dirigida', icone: 'book-open' }
    ];

    atividadesChave.forEach((ativ, idx) => {
      if (descricaoLower.includes(ativ.keyword)) {
        atividades.push({
          id: `atividade-extra-${index}-${idx}`,
          nome: ativ.nome,
          tipo: 'atividade',
          icone: ativ.icone,
          descricao: `Identificado na etapa "${etapa.titulo}"`,
          origem_etapa: index + 1,
          categoria: 'Metodologia Ativa'
        });
      }
    });

    return atividades;
  }

  static processarDadosAtividades(planoData: any): AtividadesData {
    let atividadesRecursos: AtividadeRecurso[] = [];

    // Extrair do desenvolvimento
    if (planoData?.desenvolvimento) {
      const atividadesDesenvolvimento = this.extrairAtividadesRecursosDoDesenvolvimento(planoData.desenvolvimento);
      atividadesRecursos = [...atividadesRecursos, ...atividadesDesenvolvimento];
    }

    // Adicionar atividades School Power mencionadas nos recursos
    const atividadesSchoolPower = this.adicionarAtividadesSchoolPower(atividadesRecursos);
    atividadesRecursos = [...atividadesRecursos, ...atividadesSchoolPower];

    return {
      atividades_recursos: atividadesRecursos,
      total_items: atividadesRecursos.length,
      ultima_atualizacao: new Date().toISOString()
    };
  }

  static adicionarAtividadesSchoolPower(atividadesExistentes: AtividadeRecurso[]): AtividadeRecurso[] {
    const schoolPowerActivities = [
      { name: 'Lista de Exercícios Interativa', icon: 'list-checks' },
      { name: 'Quiz Gamificado', icon: 'gamepad-2' },
      { name: 'Mapa Mental Digital', icon: 'brain' },
      { name: 'Simulador de Experimentos', icon: 'flask' },
      { name: 'Apresentação Interativa', icon: 'presentation' }
    ];

    return schoolPowerActivities.map((activity, index) => ({
      id: `school-power-${index}`,
      nome: activity.name,
      tipo: 'atividade' as const,
      icone: activity.icon,
      descricao: 'Atividade gerada pelo School Power',
      categoria: 'School Power'
    }));
  }
}

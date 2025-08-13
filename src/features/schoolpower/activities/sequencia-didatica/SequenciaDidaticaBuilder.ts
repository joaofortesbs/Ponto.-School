
export interface SequenciaDidaticaData {
  titulo: string;
  disciplina: string;
  serieAno: string;
  duracao: string;
  objetivos: {
    geral: string;
    especificos: string[];
  };
  competenciasBNCC: string[];
  conteudos: string[];
  metodologia: {
    estrategias: string[];
    recursos: string[];
  };
  etapas: {
    numero: number;
    titulo: string;
    duracao: string;
    objetivoEspecifico: string;
    atividades: string[];
    recursos: string[];
    avaliacao: string;
  }[];
  avaliacaoFinal: {
    criterios: string[];
    instrumentos: string[];
    forma: string;
  };
  recursosNecessarios: string[];
  referencias: string[];
}

export class SequenciaDidaticaBuilder {
  private data: Partial<SequenciaDidaticaData> = {};

  constructor() {
    console.log('🏗️ SequenciaDidaticaBuilder: Inicializando builder');
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    this.data = {
      titulo: '',
      disciplina: '',
      serieAno: '',
      duracao: '',
      objetivos: {
        geral: '',
        especificos: []
      },
      competenciasBNCC: [],
      conteudos: [],
      metodologia: {
        estrategias: [],
        recursos: []
      },
      etapas: [],
      avaliacaoFinal: {
        criterios: [],
        instrumentos: [],
        forma: ''
      },
      recursosNecessarios: [],
      referencias: []
    };
  }

  setTitulo(titulo: string): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo título:', titulo);
    this.data.titulo = titulo;
    return this;
  }

  setDisciplina(disciplina: string): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo disciplina:', disciplina);
    this.data.disciplina = disciplina;
    return this;
  }

  setSerieAno(serieAno: string): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo série/ano:', serieAno);
    this.data.serieAno = serieAno;
    return this;
  }

  setDuracao(duracao: string): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo duração:', duracao);
    this.data.duracao = duracao;
    return this;
  }

  setObjetivos(geral: string, especificos: string[]): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo objetivos');
    this.data.objetivos = { geral, especificos };
    return this;
  }

  setCompetenciasBNCC(competencias: string[]): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo competências BNCC');
    this.data.competenciasBNCC = competencias;
    return this;
  }

  setConteudos(conteudos: string[]): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo conteúdos');
    this.data.conteudos = conteudos;
    return this;
  }

  setMetodologia(estrategias: string[], recursos: string[]): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo metodologia');
    this.data.metodologia = { estrategias, recursos };
    return this;
  }

  addEtapa(etapa: SequenciaDidaticaData['etapas'][0]): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Adicionando etapa:', etapa.titulo);
    if (!this.data.etapas) this.data.etapas = [];
    this.data.etapas.push(etapa);
    return this;
  }

  setAvaliacaoFinal(criterios: string[], instrumentos: string[], forma: string): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo avaliação final');
    this.data.avaliacaoFinal = { criterios, instrumentos, forma };
    return this;
  }

  setRecursosNecessarios(recursos: string[]): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo recursos necessários');
    this.data.recursosNecessarios = recursos;
    return this;
  }

  setReferencias(referencias: string[]): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Definindo referências');
    this.data.referencias = referencias;
    return this;
  }

  // Método para construir a partir de dados brutos da IA
  buildFromAIResponse(response: string): this {
    console.log('🏗️ SequenciaDidaticaBuilder: Construindo a partir da resposta da IA');
    
    try {
      // Tentar parsear como JSON primeiro
      const jsonData = JSON.parse(response);
      this.buildFromStructuredData(jsonData);
    } catch (error) {
      console.log('🏗️ SequenciaDidaticaBuilder: Resposta não é JSON, processando como texto');
      this.buildFromTextResponse(response);
    }

    return this;
  }

  private buildFromStructuredData(data: any): void {
    console.log('🏗️ SequenciaDidaticaBuilder: Construindo a partir de dados estruturados');
    
    if (data.titulo) this.setTitulo(data.titulo);
    if (data.disciplina) this.setDisciplina(data.disciplina);
    if (data.serieAno || data.serie_ano) this.setSerieAno(data.serieAno || data.serie_ano);
    if (data.duracao) this.setDuracao(data.duracao);
    
    if (data.objetivos) {
      this.setObjetivos(
        data.objetivos.geral || '',
        data.objetivos.especificos || []
      );
    }
    
    if (data.competenciasBNCC || data.competencias) {
      this.setCompetenciasBNCC(data.competenciasBNCC || data.competencias);
    }
    
    if (data.conteudos) {
      this.setConteudos(data.conteudos);
    }
    
    if (data.metodologia) {
      this.setMetodologia(
        data.metodologia.estrategias || [],
        data.metodologia.recursos || []
      );
    }
    
    if (data.etapas && Array.isArray(data.etapas)) {
      data.etapas.forEach((etapa: any) => {
        this.addEtapa({
          numero: etapa.numero || 1,
          titulo: etapa.titulo || '',
          duracao: etapa.duracao || '',
          objetivoEspecifico: etapa.objetivoEspecifico || etapa.objetivo || '',
          atividades: etapa.atividades || [],
          recursos: etapa.recursos || [],
          avaliacao: etapa.avaliacao || ''
        });
      });
    }
    
    if (data.avaliacaoFinal || data.avaliacao_final) {
      const avaliacao = data.avaliacaoFinal || data.avaliacao_final;
      this.setAvaliacaoFinal(
        avaliacao.criterios || [],
        avaliacao.instrumentos || [],
        avaliacao.forma || ''
      );
    }
    
    if (data.recursosNecessarios || data.recursos_necessarios) {
      this.setRecursosNecessarios(data.recursosNecessarios || data.recursos_necessarios);
    }
    
    if (data.referencias) {
      this.setReferencias(data.referencias);
    }
  }

  private buildFromTextResponse(response: string): void {
    console.log('🏗️ SequenciaDidaticaBuilder: Construindo a partir de resposta textual');
    
    // Extrair título
    const tituloMatch = response.match(/(?:título|title)[:\s]*([^\n]+)/i);
    if (tituloMatch) this.setTitulo(tituloMatch[1].trim());
    
    // Extrair disciplina
    const disciplinaMatch = response.match(/(?:disciplina|subject)[:\s]*([^\n]+)/i);
    if (disciplinaMatch) this.setDisciplina(disciplinaMatch[1].trim());
    
    // Extrair série/ano
    const serieMatch = response.match(/(?:série|ano|grade|series?)[:\s]*([^\n]+)/i);
    if (serieMatch) this.setSerieAno(serieMatch[1].trim());
    
    // Extrair duração
    const duracaoMatch = response.match(/(?:duração|duration|tempo)[:\s]*([^\n]+)/i);
    if (duracaoMatch) this.setDuracao(duracaoMatch[1].trim());
    
    // Definir valores padrão quando não encontrados
    if (!this.data.titulo) this.setTitulo('Sequência Didática');
    if (!this.data.disciplina) this.setDisciplina('Multidisciplinar');
    if (!this.data.serieAno) this.setSerieAno('Ensino Fundamental');
    if (!this.data.duracao) this.setDuracao('4 aulas');
    
    // Adicionar etapa padrão se não houver etapas
    if (!this.data.etapas || this.data.etapas.length === 0) {
      this.addEtapa({
        numero: 1,
        titulo: 'Introdução ao Tema',
        duracao: '1 aula',
        objetivoEspecifico: 'Apresentar o tema central da sequência didática',
        atividades: ['Discussão inicial', 'Apresentação conceitual', 'Atividade diagnóstica'],
        recursos: ['Quadro', 'Material audiovisual', 'Folhas para atividades'],
        avaliacao: 'Participação nas discussões e resolução da atividade diagnóstica'
      });
      
      this.addEtapa({
        numero: 2,
        titulo: 'Desenvolvimento dos Conceitos',
        duracao: '2 aulas',
        objetivoEspecifico: 'Aprofundar o conhecimento sobre o tema',
        atividades: ['Explicação teórica', 'Exercícios práticos', 'Trabalho em grupos'],
        recursos: ['Livro didático', 'Exercícios impressos', 'Material de apoio'],
        avaliacao: 'Resolução de exercícios e apresentação dos grupos'
      });
      
      this.addEtapa({
        numero: 3,
        titulo: 'Aplicação e Síntese',
        duracao: '1 aula',
        objetivoEspecifico: 'Aplicar os conhecimentos adquiridos',
        atividades: ['Atividade de aplicação', 'Síntese dos aprendizados', 'Avaliação final'],
        recursos: ['Atividade impressa', 'Material para apresentação'],
        avaliacao: 'Atividade de aplicação e participação na síntese'
      });
    }
  }

  build(): SequenciaDidaticaData {
    console.log('🏗️ SequenciaDidaticaBuilder: Construindo objeto final');
    
    // Validar dados essenciais
    if (!this.data.titulo) this.data.titulo = 'Sequência Didática';
    if (!this.data.disciplina) this.data.disciplina = 'Multidisciplinar';
    if (!this.data.serieAno) this.data.serieAno = 'Ensino Fundamental';
    if (!this.data.duracao) this.data.duracao = '4 aulas';
    
    // Garantir estrutura completa
    if (!this.data.objetivos) {
      this.data.objetivos = {
        geral: 'Promover o aprendizado significativo através de atividades sequenciadas',
        especificos: [
          'Desenvolver habilidades específicas do tema',
          'Estimular o pensamento crítico',
          'Promover a participação ativa dos estudantes'
        ]
      };
    }
    
    if (!this.data.competenciasBNCC) {
      this.data.competenciasBNCC = [
        'Competência específica relacionada ao tema',
        'Desenvolvimento do pensamento científico',
        'Comunicação e expressão'
      ];
    }
    
    if (!this.data.conteudos) {
      this.data.conteudos = [
        'Conceitos fundamentais do tema',
        'Aplicações práticas',
        'Relações interdisciplinares'
      ];
    }
    
    if (!this.data.metodologia) {
      this.data.metodologia = {
        estrategias: [
          'Aula expositiva dialogada',
          'Trabalho em grupos',
          'Atividades práticas',
          'Discussão e debate'
        ],
        recursos: [
          'Quadro e giz/marcador',
          'Material audiovisual',
          'Livro didático',
          'Atividades impressas'
        ]
      };
    }
    
    if (!this.data.avaliacaoFinal) {
      this.data.avaliacaoFinal = {
        criterios: [
          'Participação nas atividades',
          'Compreensão dos conceitos',
          'Aplicação dos conhecimentos',
          'Trabalho colaborativo'
        ],
        instrumentos: [
          'Observação direta',
          'Atividades escritas',
          'Apresentações',
          'Autoavaliação'
        ],
        forma: 'Avaliação processual e formativa'
      };
    }
    
    if (!this.data.recursosNecessarios) {
      this.data.recursosNecessarios = [
        'Espaço físico adequado',
        'Material didático',
        'Recursos audiovisuais',
        'Tempo suficiente para desenvolvimento'
      ];
    }
    
    if (!this.data.referencias) {
      this.data.referencias = [
        'Base Nacional Comum Curricular (BNCC)',
        'Livro didático adotado',
        'Recursos complementares específicos do tema'
      ];
    }
    
    const result = this.data as SequenciaDidaticaData;
    console.log('✅ SequenciaDidaticaBuilder: Sequência didática construída com sucesso', result);
    
    return result;
  }
}

export default SequenciaDidaticaBuilder;


export interface ActivityTypeMapping {
  id: string;
  name: string;
  modalSelector: string;
  requiredFields: string[];
  conditionalFields?: { [key: string]: string[] };
}

export class ActivityTypeDetector {
  private static typeMap: Map<string, ActivityTypeMapping> = new Map([
    ['lista-exercicios', {
      id: 'lista-exercicios',
      name: 'Lista de Exercícios',
      modalSelector: '.modal-lista-exercicios',
      requiredFields: ['titulo', 'descricao', 'disciplina', 'ano', 'nivel', 'modelo_questao'],
      conditionalFields: {
        'modelo_questao': ['multipla_escolha', 'verdadeiro_falso', 'dissertativa']
      }
    }],
    ['jogo-educativo', {
      id: 'jogo-educativo',
      name: 'Jogo Educativo',
      modalSelector: '.modal-jogo-educativo',
      requiredFields: ['titulo', 'descricao', 'disciplina', 'tipo_jogo', 'nivel'],
      conditionalFields: {
        'tipo_jogo': ['quiz', 'memoria', 'puzzle', 'simulacao']
      }
    }],
    ['prova', {
      id: 'prova',
      name: 'Prova/Avaliação',
      modalSelector: '.modal-prova',
      requiredFields: ['titulo', 'descricao', 'disciplina', 'tempo_duracao', 'valor_total'],
      conditionalFields: {
        'formato': ['presencial', 'online', 'mista']
      }
    }],
    ['redacao', {
      id: 'redacao',
      name: 'Produção Textual',
      modalSelector: '.modal-redacao',
      requiredFields: ['titulo', 'descricao', 'genero_textual', 'tema', 'criterios'],
      conditionalFields: {
        'genero_textual': ['narrativo', 'descritivo', 'dissertativo', 'argumentativo']
      }
    }],
    ['projeto', {
      id: 'projeto',
      name: 'Projeto Interdisciplinar',
      modalSelector: '.modal-projeto',
      requiredFields: ['titulo', 'descricao', 'disciplinas', 'etapas', 'recursos'],
      conditionalFields: {
        'tipo_projeto': ['pesquisa', 'experimento', 'construcao', 'apresentacao']
      }
    }],
    ['resumo', {
      id: 'resumo',
      name: 'Resumo/Síntese',
      modalSelector: '.modal-resumo',
      requiredFields: ['titulo', 'topico', 'nivel_detalhamento', 'formato'],
      conditionalFields: {
        'formato': ['texto', 'mapa_mental', 'esquema', 'infografico']
      }
    }]
  ]);

  public static detectActivityType(activityData: any): ActivityTypeMapping | null {
    // Try to detect by explicit type field
    if (activityData.type) {
      const mapping = this.typeMap.get(activityData.type);
      if (mapping) return mapping;
    }

    // Try to detect by title/description keywords
    const title = (activityData.titulo || activityData.title || '').toLowerCase();
    const description = (activityData.descricao || activityData.description || '').toLowerCase();
    const content = `${title} ${description}`;

    // Lista de exercícios
    if (content.includes('exercício') || content.includes('questões') || content.includes('lista')) {
      return this.typeMap.get('lista-exercicios') || null;
    }

    // Jogo educativo
    if (content.includes('jogo') || content.includes('lúdico') || content.includes('interativo')) {
      return this.typeMap.get('jogo-educativo') || null;
    }

    // Prova/Avaliação
    if (content.includes('prova') || content.includes('avaliação') || content.includes('teste')) {
      return this.typeMap.get('prova') || null;
    }

    // Redação
    if (content.includes('redação') || content.includes('texto') || content.includes('produção textual')) {
      return this.typeMap.get('redacao') || null;
    }

    // Projeto
    if (content.includes('projeto') || content.includes('interdisciplinar') || content.includes('pesquisa')) {
      return this.typeMap.get('projeto') || null;
    }

    // Resumo
    if (content.includes('resumo') || content.includes('síntese') || content.includes('mapa mental')) {
      return this.typeMap.get('resumo') || null;
    }

    // Default to lista-exercicios if can't detect
    return this.typeMap.get('lista-exercicios') || null;
  }

  public static getAllTypes(): ActivityTypeMapping[] {
    return Array.from(this.typeMap.values());
  }

  public static getTypeById(id: string): ActivityTypeMapping | null {
    return this.typeMap.get(id) || null;
  }

  public static addCustomType(mapping: ActivityTypeMapping): void {
    this.typeMap.set(mapping.id, mapping);
  }
}

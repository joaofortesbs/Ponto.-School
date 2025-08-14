
export interface QuadroContent {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  imageUrl?: string;
  type: 'introduction' | 'development' | 'conclusion' | 'activity' | 'assessment';
}

export interface SequenciaDidaticaData {
  tema: string;
  serie: string;
  disciplina: string;
  duracao: string;
  objetivos: string[];
  conteudos: string[];
  metodologia: string;
  recursos: string[];
  avaliacao: string;
  referencias: string[];
}

export class QuadroContentGenerator {
  private static readonly BACKGROUND_GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea4c46 100%)'
  ];

  static generateQuadrosFromSequencia(data: SequenciaDidaticaData): QuadroContent[] {
    const quadros: QuadroContent[] = [];

    // Quadro 1: Introdução/Abertura
    quadros.push({
      id: 'intro',
      title: 'Abertura da Aula',
      content: this.generateIntroductionContent(data),
      backgroundColor: this.BACKGROUND_GRADIENTS[0],
      textColor: '#ffffff',
      type: 'introduction'
    });

    // Quadro 2: Desenvolvimento Principal
    quadros.push({
      id: 'desenvolvimento',
      title: 'Desenvolvimento',
      content: this.generateDevelopmentContent(data),
      backgroundColor: this.BACKGROUND_GRADIENTS[1],
      textColor: '#ffffff',
      type: 'development'
    });

    // Quadro 3: Atividade Prática
    quadros.push({
      id: 'atividade',
      title: 'Atividade Prática',
      content: this.generateActivityContent(data),
      backgroundColor: this.BACKGROUND_GRADIENTS[2],
      textColor: '#ffffff',
      type: 'activity'
    });

    // Quadros adicionais baseados no número de objetivos
    if (data.objetivos.length > 3) {
      for (let i = 3; i < Math.min(data.objetivos.length, 6); i++) {
        quadros.push({
          id: `objetivo_${i}`,
          title: `Objetivo ${i - 2}`,
          content: this.generateObjectiveContent(data.objetivos[i], data),
          backgroundColor: this.BACKGROUND_GRADIENTS[i % this.BACKGROUND_GRADIENTS.length],
          textColor: '#ffffff',
          type: 'development'
        });
      }
    }

    // Quadro de Avaliação
    quadros.push({
      id: 'avaliacao',
      title: 'Avaliação',
      content: this.generateAssessmentContent(data),
      backgroundColor: this.BACKGROUND_GRADIENTS[3],
      textColor: '#ffffff',
      type: 'assessment'
    });

    // Quadro de Conclusão
    quadros.push({
      id: 'conclusao',
      title: 'Fechamento',
      content: this.generateConclusionContent(data),
      backgroundColor: this.BACKGROUND_GRADIENTS[4],
      textColor: '#ffffff',
      type: 'conclusion'
    });

    return quadros.slice(0, 8); // Máximo de 8 quadros
  }

  private static generateIntroductionContent(data: SequenciaDidaticaData): string {
    return `
📚 TEMA DA AULA
${data.tema}

🎯 SÉRIE/ANO
${data.serie}

📖 DISCIPLINA
${data.disciplina}

⏱️ DURAÇÃO
${data.duracao}

💡 OBJETIVO PRINCIPAL
${data.objetivos[0] || 'Desenvolver conhecimentos sobre o tema proposto'}
    `.trim();
  }

  private static generateDevelopmentContent(data: SequenciaDidaticaData): string {
    const conteudosPrincipais = data.conteudos.slice(0, 4);
    const conteudosTexto = conteudosPrincipais.map((conteudo, index) => 
      `${index + 1}. ${conteudo}`
    ).join('\n');

    return `
📝 CONTEÚDOS PRINCIPAIS

${conteudosTexto}

🔧 METODOLOGIA
${data.metodologia}

💻 RECURSOS NECESSÁRIOS
• ${data.recursos.slice(0, 3).join('\n• ')}
    `.trim();
  }

  private static generateActivityContent(data: SequenciaDidaticaData): string {
    return `
🎯 ATIVIDADE PRÁTICA

📋 INSTRUÇÕES:
• Trabalho em grupos de 3-4 alunos
• Tempo estimado: ${this.extractTimeFromDuration(data.duracao)}
• Utilizar materiais disponíveis

🔍 ORIENTAÇÕES:
• Aplicar os conceitos estudados
• Registrar observações
• Preparar apresentação

💡 DICA:
Relacione o conteúdo com situações do cotidiano para melhor compreensão!
    `.trim();
  }

  private static generateObjectiveContent(objetivo: string, data: SequenciaDidaticaData): string {
    return `
🎯 OBJETIVO ESPECÍFICO

${objetivo}

📚 DESENVOLVIMENTO:
• Explicação teórica do conceito
• Exemplos práticos relacionados
• Exercícios de fixação
• Discussão em grupo

🔧 ESTRATÉGIA:
${this.getRandomStrategy()}

⚡ TEMPO SUGERIDO:
${this.calculateObjectiveTime(data.duracao)}
    `.trim();
  }

  private static generateAssessmentContent(data: SequenciaDidaticaData): string {
    return `
📊 AVALIAÇÃO

✅ CRITÉRIOS:
${data.avaliacao}

📈 INSTRUMENTOS:
• Observação da participação
• Qualidade das respostas
• Colaboração em atividades
• Apresentação dos resultados

🎯 INDICADORES:
• Compreensão dos conceitos
• Aplicação prática
• Criatividade nas soluções
• Comunicação eficaz
    `.trim();
  }

  private static generateConclusionContent(data: SequenciaDidaticaData): string {
    return `
🔚 FECHAMENTO DA AULA

📝 SÍNTESE:
• Recapitulação dos pontos principais
• Conexão entre os conceitos estudados
• Esclarecimento de dúvidas

🎯 PRÓXIMOS PASSOS:
• Tarefa para casa (se aplicável)
• Preparação para próxima aula
• Material complementar

💭 REFLEXÃO:
"O que aprendemos hoje será a base para nossa próxima jornada de descobertas!"

📚 REFERÊNCIAS:
• ${data.referencias.slice(0, 2).join('\n• ')}
    `.trim();
  }

  private static extractTimeFromDuration(duracao: string): string {
    const match = duracao.match(/(\d+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      return `${Math.floor(minutes / 2)} minutos`;
    }
    return '15 minutos';
  }

  private static calculateObjectiveTime(duracao: string): string {
    const match = duracao.match(/(\d+)/);
    if (match) {
      const totalMinutes = parseInt(match[1]);
      const objectiveTime = Math.floor(totalMinutes / 4);
      return `${objectiveTime} minutos`;
    }
    return '10 minutos';
  }

  private static getRandomStrategy(): string {
    const strategies = [
      'Aprendizagem ativa com discussões dirigidas',
      'Metodologia expositiva dialogada',
      'Trabalho colaborativo em pequenos grupos',
      'Resolução de problemas práticos',
      'Estudo de casos contextualizados',
      'Demonstração prática com participação'
    ];
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  static regenerateQuadro(quadroId: string, data: SequenciaDidaticaData): QuadroContent {
    const newBackgroundIndex = Math.floor(Math.random() * this.BACKGROUND_GRADIENTS.length);
    
    switch (quadroId) {
      case 'intro':
        return {
          id: 'intro',
          title: 'Abertura da Aula',
          content: this.generateIntroductionContent(data),
          backgroundColor: this.BACKGROUND_GRADIENTS[newBackgroundIndex],
          textColor: '#ffffff',
          type: 'introduction'
        };
      
      case 'desenvolvimento':
        return {
          id: 'desenvolvimento',
          title: 'Desenvolvimento',
          content: this.generateDevelopmentContent(data),
          backgroundColor: this.BACKGROUND_GRADIENTS[newBackgroundIndex],
          textColor: '#ffffff',
          type: 'development'
        };
        
      case 'atividade':
        return {
          id: 'atividade',
          title: 'Atividade Prática',
          content: this.generateActivityContent(data),
          backgroundColor: this.BACKGROUND_GRADIENTS[newBackgroundIndex],
          textColor: '#ffffff',
          type: 'activity'
        };
        
      default:
        return {
          id: quadroId,
          title: 'Quadro Personalizado',
          content: 'Conteúdo regenerado automaticamente',
          backgroundColor: this.BACKGROUND_GRADIENTS[newBackgroundIndex],
          textColor: '#ffffff',
          type: 'development'
        };
    }
  }
}

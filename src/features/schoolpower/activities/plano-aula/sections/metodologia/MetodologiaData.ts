
export interface MetodologiaData {
  nome: string;
  descricao: string;
  alternativas: string[];
  simulacao_de_aula: string;
  explicacao_em_video: string;
}

export class MetodologiaDataProcessor {
  static processData(planoData: any): MetodologiaData {
    return {
      nome: planoData.metodologia?.nome || 'Metodologia',
      descricao: planoData.metodologia?.descricao || 'Descrição da metodologia não disponível',
      alternativas: planoData.metodologia?.alternativas || ['Aula expositiva', 'Atividades práticas'],
      simulacao_de_aula: planoData.metodologia?.simulacao_de_aula || 'Simulação disponível',
      explicacao_em_video: planoData.metodologia?.explicacao_em_video || 'Video explicativo disponível'
    };
  }

  static getMethodologyIcon(methodologyName: string) {
    const methodologyIcons: { [key: string]: string } = {
      'Aula Expositiva': 'Presentation',
      'Atividades Práticas': 'Gamepad2',
      'Estudo de Caso': 'Search',
      'Aprendizagem Baseada em Projetos': 'PenTool',
      'Aprendizagem Cooperativa': 'Users2',
      'Resolução de Problemas': 'Zap',
      'Simulação': 'Presentation',
      'Discussão em Grupo': 'Users2',
      'Metacognição': 'Brain',
      'Aula Dialogada': 'UserCheck',
      'Outra Metodologia': 'Lightbulb',
    };
    
    return methodologyIcons[methodologyName] || 'Lightbulb';
  }
}

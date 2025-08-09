import { ActivityFormData } from '../../construction/types/ActivityTypes';

export interface PlanoAulaData {
  // Dados de entrada do formulário
  titulo: string;
  disciplina: string;
  tema: string;
  serie: string;
  cargaHoraria: string;
  habilidadesBNCC: string;
  objetivoGeral: string;
  materiaisRecursos: string;
  perfilTurma: string;
  tipoAula: string;
  observacoesProfessor: string;
}

export interface PlanoAulaResponse {
  visao_geral: {
    disciplina: string;
    tema: string;
    serie: string;
    tempo: string;
    metodologia: string;
    recursos: string[];
    sugestoes_ia: string[];
  };
  objetivos: Array<{
    descricao: string;
    habilidade_bncc: string;
    sugestao_reescrita: string;
    atividade_relacionada: string;
  }>;
  metodologia: {
    nome: string;
    descricao: string;
    alternativas: string[];
    simulacao_de_aula: string;
    explicacao_em_video: string;
  };
  desenvolvimento: Array<{
    etapa: number;
    titulo: string;
    descricao: string;
    tipo_interacao: string;
    tempo_estimado: string;
    recurso_gerado: string;
    nota_privada_professor: string;
  }>;
  atividades: Array<{
    nome: string;
    tipo: string;
    ref_objetivos: number[];
    visualizar_como_aluno: string;
    sugestoes_ia: string[];
  }>;
}

export class PlanoAulaBuilder {
  /**
   * Converte dados do formulário para o formato de entrada da IA
   */
  static formatDataForAI(formData: ActivityFormData): PlanoAulaData {
    return {
      titulo: formData.title || 'Plano de Aula',
      disciplina: formData.subject || 'Disciplina não especificada',
      tema: formData.theme || 'Tema não especificado',
      serie: formData.schoolYear || 'Série não especificada',
      cargaHoraria: formData.timeLimit || '50 minutos',
      habilidadesBNCC: formData.competencies || 'A definir conforme BNCC',
      objetivoGeral: formData.objectives || 'Objetivo não especificado',
      materiaisRecursos: formData.materials || 'Materiais a definir',
      perfilTurma: formData.context || 'Turma padrão',
      tipoAula: formData.difficultyLevel || 'Aula expositiva dialogada',
      observacoesProfessor: formData.evaluation || 'Sem observações adicionais'
    };
  }

  /**
   * Gera o prompt estruturado para o Gemini
   */
  static generatePrompt(data: PlanoAulaData): string {
    const promptData = JSON.stringify(data, null, 2);

    return `Você é um planejador pedagógico especialista da School Power. Com base nos seguintes dados do professor, construa um plano de aula completo dividido em: Visão Geral, Objetivos, Metodologia, Desenvolvimento e Atividades.

${promptData}

O plano de aula deve ser aplicável, dinâmico, moderno e atender à BNCC. Use linguagem clara e gere sugestões inteligentes em cada seção.

IMPORTANTE: Retorne APENAS um JSON válido no seguinte formato exato:

{
  "visao_geral": {
    "disciplina": "${data.disciplina}",
    "tema": "${data.tema}",
    "serie": "${data.serie}",
    "tempo": "${data.cargaHoraria}",
    "metodologia": "Nome da metodologia pedagógica apropriada",
    "recursos": ["recurso1", "recurso2", "recurso3"],
    "sugestoes_ia": ["sugestão1", "sugestão2"]
  },
  "objetivos": [
    {
      "descricao": "Objetivo específico de aprendizagem",
      "habilidade_bncc": "Código da habilidade BNCC",
      "sugestao_reescrita": "Versão alternativa do objetivo",
      "atividade_relacionada": "Atividade que desenvolve este objetivo"
    }
  ],
  "metodologia": {
    "nome": "Nome da metodologia ativa",
    "descricao": "Descrição detalhada da metodologia",
    "alternativas": ["metodologia1", "metodologia2"],
    "simulacao_de_aula": "Descrição de como seria a aula com essa metodologia",
    "explicacao_em_video": "Descrição do que seria mostrado no vídeo explicativo"
  },
  "desenvolvimento": [
    {
      "etapa": 1,
      "titulo": "Nome da etapa",
      "descricao": "Descrição detalhada da etapa",
      "tipo_interacao": "tipo de interação (discussão, individual, grupo)",
      "tempo_estimado": "tempo em minutos",
      "recurso_gerado": "tipo de recurso necessário",
      "nota_privada_professor": "orientação específica para o professor"
    }
  ],
  "atividades": [
    {
      "nome": "Nome da atividade",
      "tipo": "tipo da atividade (interativa, individual, grupo)",
      "ref_objetivos": [1, 2],
      "visualizar_como_aluno": "descrição da experiência do aluno",
      "sugestoes_ia": ["sugestão1", "sugestão2"]
    }
  ]
}`;
  }

  /**
   * Valida e processa a resposta da IA
   */
  static processAIResponse(response: string): PlanoAulaResponse {
    try {
      // Remove possíveis marcadores de código e limpa a resposta
      const cleanedResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanedResponse);

      // Validação básica da estrutura
      if (!parsed.visao_geral || !parsed.objetivos || !parsed.metodologia || 
          !parsed.desenvolvimento || !parsed.atividades) {
        throw new Error('Estrutura JSON inválida - campos obrigatórios ausentes');
      }

      // Garantir que arrays existam
      if (!Array.isArray(parsed.objetivos)) parsed.objetivos = [];
      if (!Array.isArray(parsed.desenvolvimento)) parsed.desenvolvimento = [];
      if (!Array.isArray(parsed.atividades)) parsed.atividades = [];
      if (!Array.isArray(parsed.visao_geral.recursos)) parsed.visao_geral.recursos = [];
      if (!Array.isArray(parsed.visao_geral.sugestoes_ia)) parsed.visao_geral.sugestoes_ia = [];

      return parsed as PlanoAulaResponse;
    } catch (error) {
      console.error('Erro ao processar resposta da IA:', error);
      console.error('Resposta recebida:', response);

      // Retornar estrutura de fallback
      return PlanoAulaBuilder.createFallbackResponse();
    }
  }

  /**
   * Cria uma resposta de fallback em caso de erro
   */
  static createFallbackResponse(): PlanoAulaResponse {
    return {
      visao_geral: {
        disciplina: 'Disciplina não especificada',
        tema: 'Tema não especificado',
        serie: 'Série não especificada',
        tempo: '50 minutos',
        metodologia: 'Aula expositiva dialogada',
        recursos: ['Quadro', 'Material didático', 'Projetor'],
        sugestoes_ia: ['Adicione recursos visuais', 'Considere atividades interativas']
      },
      objetivos: [
        {
          descricao: 'Objetivo geral de aprendizagem a ser definido',
          habilidade_bncc: 'A definir conforme BNCC',
          sugestao_reescrita: 'Reescreva com linguagem mais específica',
          atividade_relacionada: 'Atividade prática relacionada'
        }
      ],
      metodologia: {
        nome: 'Metodologia Tradicional',
        descricao: 'Aula expositiva com participação dos alunos',
        alternativas: ['Sala de aula invertida', 'Aprendizagem baseada em problemas'],
        simulacao_de_aula: 'Aula com apresentação do conteúdo e discussão',
        explicacao_em_video: 'Vídeo explicativo sobre a metodologia'
      },
      desenvolvimento: [
        {
          etapa: 1,
          titulo: 'Introdução',
          descricao: 'Apresentação do tema e objetivos',
          tipo_interacao: 'discussão',
          tempo_estimado: '10 minutos',
          recurso_gerado: 'slide introdutório',
          nota_privada_professor: 'Verificar conhecimentos prévios'
        },
        {
          etapa: 2,
          titulo: 'Desenvolvimento',
          descricao: 'Exposição do conteúdo principal',
          tipo_interacao: 'explicação',
          tempo_estimado: '25 minutos',
          recurso_gerado: 'material de apoio',
          nota_privada_professor: 'Manter atenção dos alunos'
        },
        {
          etapa: 3,
          titulo: 'Conclusão',
          descricao: 'Síntese e avaliação',
          tipo_interacao: 'discussão',
          tempo_estimado: '15 minutos',
          recurso_gerado: 'atividade de fixação',
          nota_privada_professor: 'Verificar aprendizagem'
        }
      ],
      atividades: [
        {
          nome: 'Discussão em grupo',
          tipo: 'interativa',
          ref_objetivos: [1],
          visualizar_como_aluno: 'Participação em discussão orientada',
          sugestoes_ia: ['Adicionar roteiro de discussão', 'Incluir avaliação por pares']
        }
      ]
    };
  }

  /**
   * Formata o plano para exibição no preview
   */
  static formatForPreview(planoResponse: PlanoAulaResponse) {
    return {
      titulo: planoResponse.visao_geral.tema,
      disciplina: planoResponse.visao_geral.disciplina,
      serie: planoResponse.visao_geral.serie,
      tempo: planoResponse.visao_geral.tempo,
      metodologia: planoResponse.metodologia.nome,
      recursos: planoResponse.visao_geral.recursos,
      objetivos: planoResponse.objetivos,
      desenvolvimento: planoResponse.desenvolvimento,
      atividades: planoResponse.atividades,
      sugestoes_ia: planoResponse.visao_geral.sugestoes_ia,
      isGeneratedByAI: true,
      generatedAt: new Date().toISOString()
    };
  }
}

export const buildPlanoAulaFromData = (data: any): PlanoAulaData => {
  console.log('🔨 PlanoAulaBuilder - Construindo plano a partir dos dados:', data);

  // Verificar se os dados já estão no formato correto
  if (data.visao_geral && data.objetivos && data.metodologia && data.desenvolvimento) {
    console.log('✅ PlanoAulaBuilder - Dados já estão estruturados');
    // Garantir que desenvolvimento tenha etapas válidas
    if (!data.desenvolvimento || data.desenvolvimento.length === 0) {
      data.desenvolvimento = getDefaultDevelopmentSteps();
    }
    return data as PlanoAulaData;
  }

  // Construir etapas de desenvolvimento robustas
  const buildDevelopmentSteps = () => {
    if (data.desenvolvimento && Array.isArray(data.desenvolvimento) && data.desenvolvimento.length > 0) {
      return data.desenvolvimento.map((etapa: any, index: number) => ({
        etapa: etapa.etapa || index + 1,
        titulo: etapa.titulo || `${index + 1}. Etapa ${index + 1}`,
        descricao: etapa.descricao || `Descrição da etapa ${index + 1}`,
        tipo_interacao: etapa.tipo_interacao || etapa.tipoInteracao || 'Interativa',
        tipoInteracao: etapa.tipoInteracao || etapa.tipo_interacao || 'Interativa',
        tempo_estimado: etapa.tempo_estimado || '15 min',
        recurso_gerado: etapa.recurso_gerado || 'Material didático',
        nota_privada_professor: etapa.nota_privada_professor || 'Orientação para o professor'
      }));
    }
    return getDefaultDevelopmentSteps();
  };

  // Construir estrutura básica
  const planoAula: PlanoAulaData = {
    titulo: data.titulo || data.title || 'Plano de Aula',
    descricao: data.descricao || data.description || 'Descrição do plano de aula',
    visao_geral: {
      disciplina: data.disciplina || data.subject || 'Disciplina',
      tema: data.tema || data.theme || data.titulo || data.title || 'Tema',
      serie: data.serie || data.anoEscolaridade || data.schoolYear || 'Série',
      tempo: data.tempo || data.tempoLimite || data.timeLimit || 'Tempo',
      metodologia: data.metodologia || data.tipoAula || data.difficultyLevel || 'Metodologia',
      recursos: data.recursos || (data.materiais ? [data.materiais] : ['Recursos não especificados']),
      sugestoes_ia: ['Plano de aula personalizado']
    },
    objetivos: data.objetivos ? (Array.isArray(data.objetivos) ? data.objetivos.map((obj: any) => ({
      descricao: typeof obj === 'string' ? obj : obj.descricao || obj,
      habilidade_bncc: data.competencias || 'BNCC não especificada',
      sugestao_reescrita: '',
      atividade_relacionada: ''
    })) : [{
      descricao: data.objetivos,
      habilidade_bncc: data.competencias || 'BNCC não especificada',
      sugestao_reescrita: '',
      atividade_relacionada: ''
    }]) : [{
      descricao: data.objetivos || 'Objetivo não especificado',
      habilidade_bncc: data.competencias || 'BNCC não especificada',
      sugestao_reescrita: '',
      atividade_relacionada: ''
    }],
    metodologia: {
      nome: data.metodologia || data.tipoAula || data.difficultyLevel || 'Metodologia Ativa',
      descricao: data.descricaoMetodologia || data.descricao || data.description || 'Descrição da metodologia',
      alternativas: ['Aula expositiva', 'Atividades práticas'],
      simulacao_de_aula: 'Simulação disponível',
      explicacao_em_video: 'Video explicativo disponível'
    },
    desenvolvimento: buildDevelopmentSteps(),
    atividades: data.atividades || [
      {
        nome: 'Atividade Principal',
        tipo: 'Prática',
        ref_objetivos: [1],
        visualizar_como_aluno: 'Atividade interativa',
        sugestoes_ia: ['Personalize conforme necessário']
      }
    ],
    avaliacao: {
      criterios: data.avaliacao || data.observacoes || data.evaluation || 'Critérios não especificados',
      instrumentos: ['Observação', 'Participação'],
      feedback: 'Feedback personalizado'
    },
    recursos_extras: {
      materiais_complementares: data.materiais ? [data.materiais] : ['Material não especificado'],
      tecnologias: ['Quadro', 'Projetor'],
      referencias: ['Bibliografia básica']
    }
  };

  console.log('✅ PlanoAulaBuilder - Plano construído:', planoAula);
  console.log('🔍 PlanoAulaBuilder - Etapas de desenvolvimento:', planoAula.desenvolvimento);
  return planoAula;
};

// Função auxiliar para etapas padrão
const getDefaultDevelopmentSteps = () => [
  {
    etapa: 1,
    titulo: "1. Introdução e Contextualização",
    descricao: "Apresente o contexto histórico da Europa no século XVIII e introduza o tema da Revolução Francesa, destacando suas causas principais.",
    tipo_interacao: "Apresentação + debate",
    tipoInteracao: "Apresentação + debate",
    tempo_estimado: "15 min",
    recurso_gerado: "Slides introdutórios",
    nota_privada_professor: "Contextualizar o período histórico e verificar conhecimentos prévios dos alunos"
  },
  {
    etapa: 2,
    titulo: "2. Vídeo Interativo",
    descricao: "Assista com os alunos um vídeo de 5 minutos sobre os três estados franceses e pause para discussões pontuais.",
    tipo_interacao: "Assistir + Discussão",
    tipoInteracao: "Assistir + Discussão",
    tempo_estimado: "10 min",
    recurso_gerado: "Vídeo educativo + roteiro de discussão",
    nota_privada_professor: "Pausar o vídeo em momentos estratégicos para promover discussão"
  },
  {
    etapa: 3,
    titulo: "3. Atividade Prática",
    descricao: "Divida os alunos em grupos para simular os três estados franceses e discutir suas diferenças e conflitos.",
    tipo_interacao: "Dinâmica em grupo",
    tipoInteracao: "Dinâmica em grupo",
    tempo_estimado: "20 min",
    recurso_gerado: "Cartas de personagens + roteiro da dinâmica",
    nota_privada_professor: "Circular entre os grupos orientando a discussão e garantindo participação"
  },
  {
    etapa: 4,
    titulo: "4. Reflexão Final",
    descricao: "Recolha as conclusões dos grupos e faça uma análise guiada sobre as causas da Revolução Francesa.",
    tipo_interacao: "Discussão guiada",
    tipoInteracao: "Discussão guiada",
    tempo_estimado: "10 min",
    recurso_gerado: "Quadro síntese + questionário",
    nota_privada_professor: "Sistematizar as principais conclusões e conectar com o próximo conteúdo"
  }
];
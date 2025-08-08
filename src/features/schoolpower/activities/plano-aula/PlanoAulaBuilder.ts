
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
    const formatted = {
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
      
      // Manter estrutura original também para compatibilidade
      visao_geral: planoResponse.visao_geral,
      metodologia_completa: planoResponse.metodologia,
      
      // Metadados
      isGeneratedByAI: true,
      generatedAt: new Date().toISOString(),
      activityType: 'plano-aula'
    };

    console.log('🎨 [PlanoAulaBuilder] Dados formatados para preview:', formatted);
    return formatted;
  }
}

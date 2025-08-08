
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { GeminiClient } from '@/utils/api/geminiClient';

export interface PlanoAulaData {
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
  titulo: string;
  descricao: string;
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
  avaliacao: {
    criterios: string;
    instrumentos: string[];
    feedback: string;
  };
  recursos_extras: {
    materiais_complementares: string[];
    tecnologias: string[];
    referencias: string[];
  };
}

export class PlanoAulaBuilder {
  private static geminiClient = new GeminiClient();

  /**
   * Formata dados do formulário para envio à IA
   */
  static formatDataForAI(formData: ActivityFormData): PlanoAulaData {
    console.log('📊 PlanoAulaBuilder - Formatando dados para IA:', formData);

    return {
      disciplina: formData.subject || 'Disciplina não especificada',
      tema: formData.theme || 'Tema não especificado',
      serie: formData.schoolYear || 'Série não especificada',
      cargaHoraria: formData.timeLimit || '50 minutos',
      habilidadesBNCC: formData.competencies || 'Competências da BNCC',
      objetivoGeral: formData.objectives || 'Objetivo geral não especificado',
      materiaisRecursos: formData.materials || 'Materiais básicos',
      perfilTurma: formData.context || 'Turma heterogênea',
      tipoAula: formData.difficultyLevel || 'Metodologia ativa',
      observacoesProfessor: formData.evaluation || 'Observações gerais'
    };
  }

  /**
   * Gera prompt estruturado para o Gemini
   */
  static generatePrompt(planoData: PlanoAulaData): string {
    return `Você é um especialista em educação brasileira e criação de planos de aula. Crie um plano de aula COMPLETO e DETALHADO baseado nos dados específicos fornecidos.

DADOS ESPECÍFICOS DO PLANO:
- Disciplina: ${planoData.disciplina}
- Tema: ${planoData.tema}
- Série/Ano: ${planoData.serie}
- Carga Horária: ${planoData.cargaHoraria}
- Habilidades BNCC: ${planoData.habilidadesBNCC}
- Objetivo Geral: ${planoData.objetivoGeral}
- Materiais/Recursos: ${planoData.materiaisRecursos}
- Perfil da Turma: ${planoData.perfilTurma}
- Tipo de Aula: ${planoData.tipoAula}
- Observações: ${planoData.observacoesProfessor}

Crie um plano de aula seguindo EXATAMENTE esta estrutura JSON:

{
  "titulo": "Título específico do plano de aula",
  "descricao": "Descrição detalhada do plano",
  "visao_geral": {
    "disciplina": "${planoData.disciplina}",
    "tema": "${planoData.tema}",
    "serie": "${planoData.serie}",
    "tempo": "${planoData.cargaHoraria}",
    "metodologia": "Metodologia pedagógica específica",
    "recursos": ["Lista", "de", "recursos", "necessários"],
    "sugestoes_ia": ["Sugestões", "específicas", "da", "IA"]
  },
  "objetivos": [
    {
      "descricao": "Objetivo de aprendizagem específico e mensurável",
      "habilidade_bncc": "Código e descrição da habilidade BNCC relacionada",
      "sugestao_reescrita": "Sugestão de melhoria para o objetivo",
      "atividade_relacionada": "Atividade que desenvolve este objetivo"
    }
  ],
  "metodologia": {
    "nome": "Nome da metodologia escolhida",
    "descricao": "Descrição detalhada da abordagem pedagógica",
    "alternativas": ["Metodologia alternativa 1", "Metodologia alternativa 2"],
    "simulacao_de_aula": "Descrição de como simular a aula",
    "explicacao_em_video": "Roteiro para vídeo explicativo"
  },
  "desenvolvimento": [
    {
      "etapa": 1,
      "titulo": "Título da etapa",
      "descricao": "Descrição detalhada da etapa",
      "tipo_interacao": "Tipo de interação (expositiva, interativa, etc.)",
      "tempo_estimado": "Tempo estimado",
      "recurso_gerado": "Recurso específico gerado",
      "nota_privada_professor": "Orientação exclusiva para o professor"
    }
  ],
  "atividades": [
    {
      "nome": "Nome da atividade",
      "tipo": "Tipo da atividade",
      "ref_objetivos": [1, 2],
      "visualizar_como_aluno": "Como o aluno verá esta atividade",
      "sugestoes_ia": ["Sugestão 1", "Sugestão 2"]
    }
  ],
  "avaliacao": {
    "criterios": "Critérios específicos de avaliação",
    "instrumentos": ["Instrumento 1", "Instrumento 2"],
    "feedback": "Como dar feedback aos alunos"
  },
  "recursos_extras": {
    "materiais_complementares": ["Material 1", "Material 2"],
    "tecnologias": ["Tecnologia 1", "Tecnologia 2"],
    "referencias": ["Referência 1", "Referência 2"]
  }
}

IMPORTANTE:
- Seja específico e detalhado em cada seção
- Use os dados fornecidos como base para personalização
- Crie pelo menos 3 objetivos de aprendizagem
- Desenvolva pelo menos 3 etapas de desenvolvimento
- Sugira pelo menos 2 atividades práticas
- Retorne APENAS o JSON válido, sem explicações adicionais
- Garanta que todos os campos sejam preenchidos com conteúdo real e útil`;
  }

  /**
   * Chama a API Gemini para gerar o plano
   */
  static async callGeminiAPI(prompt: string): Promise<string> {
    console.log('🤖 PlanoAulaBuilder - Chamando API Gemini');

    try {
      const response = await this.geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 4096,
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro na API Gemini');
      }

      console.log('✅ PlanoAulaBuilder - Resposta recebida do Gemini');
      return response.result;
    } catch (error) {
      console.error('❌ PlanoAulaBuilder - Erro na API Gemini:', error);
      throw error;
    }
  }

  /**
   * Processa a resposta da IA
   */
  static processAIResponse(aiResponse: string): PlanoAulaResponse {
    console.log('🔧 PlanoAulaBuilder - Processando resposta da IA');

    try {
      // Limpar a resposta
      let cleanResponse = aiResponse.trim();
      
      // Remover markdown se presente
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Tentar fazer parse do JSON
      const parsedResponse = JSON.parse(cleanResponse);
      
      console.log('✅ PlanoAulaBuilder - Resposta processada com sucesso');
      return parsedResponse;
      
    } catch (error) {
      console.error('❌ PlanoAulaBuilder - Erro ao processar resposta:', error);
      console.log('📝 Resposta bruta:', aiResponse);
      
      // Retornar resposta de fallback
      return this.createFallbackResponse();
    }
  }

  /**
   * Formata o plano para exibição no preview
   */
  static formatForPreview(planoResponse: PlanoAulaResponse): any {
    console.log('🎨 PlanoAulaBuilder - Formatando para preview');

    return {
      titulo: planoResponse.titulo,
      descricao: planoResponse.descricao,
      visao_geral: planoResponse.visao_geral,
      objetivos: planoResponse.objetivos,
      metodologia: planoResponse.metodologia,
      desenvolvimento: planoResponse.desenvolvimento,
      atividades: planoResponse.atividades,
      avaliacao: planoResponse.avaliacao,
      recursos_extras: planoResponse.recursos_extras
    };
  }

  /**
   * Cria uma resposta de fallback em caso de erro
   */
  static createFallbackResponse(): PlanoAulaResponse {
    console.log('🔄 PlanoAulaBuilder - Criando resposta de fallback');

    return {
      titulo: "Plano de Aula Personalizado",
      descricao: "Plano de aula criado automaticamente pelo sistema",
      visao_geral: {
        disciplina: "Disciplina",
        tema: "Tema da aula",
        serie: "Série/Ano",
        tempo: "50 minutos",
        metodologia: "Metodologia Ativa",
        recursos: ["Quadro", "Projetor", "Material didático"],
        sugestoes_ia: ["Plano personalizado", "Adaptável à turma"]
      },
      objetivos: [
        {
          descricao: "Compreender os conceitos fundamentais do tema",
          habilidade_bncc: "Competência específica da BNCC",
          sugestao_reescrita: "Objetivo claro e mensurável",
          atividade_relacionada: "Atividade prática relacionada"
        }
      ],
      metodologia: {
        nome: "Metodologia Ativa",
        descricao: "Abordagem centrada no aluno com participação ativa",
        alternativas: ["Aula expositiva", "Aprendizagem colaborativa"],
        simulacao_de_aula: "Simulação disponível",
        explicacao_em_video: "Vídeo explicativo disponível"
      },
      desenvolvimento: [
        {
          etapa: 1,
          titulo: "Introdução",
          descricao: "Apresentação do tema e objetivos",
          tipo_interacao: "Expositiva",
          tempo_estimado: "15 minutos",
          recurso_gerado: "Slides introdutórios",
          nota_privada_professor: "Verificar conhecimentos prévios"
        },
        {
          etapa: 2,
          titulo: "Desenvolvimento",
          descricao: "Exploração do conteúdo principal",
          tipo_interacao: "Interativa",
          tempo_estimado: "25 minutos",
          recurso_gerado: "Atividade prática",
          nota_privada_professor: "Acompanhar participação dos alunos"
        },
        {
          etapa: 3,
          titulo: "Conclusão",
          descricao: "Síntese e avaliação",
          tipo_interacao: "Colaborativa",
          tempo_estimado: "10 minutos",
          recurso_gerado: "Resumo visual",
          nota_privada_professor: "Avaliar compreensão geral"
        }
      ],
      atividades: [
        {
          nome: "Atividade Principal",
          tipo: "Prática",
          ref_objetivos: [1],
          visualizar_como_aluno: "Atividade interativa e engajante",
          sugestoes_ia: ["Personalizar conforme necessário", "Adaptar ao nível da turma"]
        }
      ],
      avaliacao: {
        criterios: "Participação, compreensão e aplicação dos conceitos",
        instrumentos: ["Observação", "Atividades práticas"],
        feedback: "Feedback contínuo e construtivo"
      },
      recursos_extras: {
        materiais_complementares: ["Textos de apoio", "Exercícios extras"],
        tecnologias: ["Projetor", "Computador"],
        referencias: ["Bibliografia básica", "Sites educacionais"]
      }
    };
  }
}


import { generateAIResponse } from '@/services/aiChatService';

export interface PlanoAulaInputData {
  disciplina?: string;
  turma?: string;
  professor?: string;
  duracao?: string;
  objetivos?: string;
  conteudo?: string;
  metodologia?: string;
  recursos?: string;
  avaliacao?: string;
  tema?: string;
  nivel?: string;
  instituicao?: string;
  data?: string;
  [key: string]: any;
}

export interface PlanoAulaGeneratedContent {
  tema: string;
  disciplina: string;
  turma: string;
  professor: string;
  duracao: string;
  objetivosGerais: string[];
  objetivosEspecificos: string[];
  conteudoProgramatico: {
    titulo: string;
    topicos: string[];
  }[];
  metodologias: {
    fase: string;
    atividade: string;
    tempo: string;
    recursos: string[];
  }[];
  recursosNecessarios: string[];
  avaliacaoAprendizagem: {
    tipo: string;
    descricao: string;
    criterios: string[];
  }[];
  referencias: string[];
  observacoes: string;
  competenciasHabilidades: string[];
}

export class PlanoAulaService {
  
  static async generatePlanoContent(inputData: PlanoAulaInputData): Promise<PlanoAulaGeneratedContent> {
    try {
      // Construir prompt otimizado
      const prompt = this.buildPrompt(inputData);
      
      // Chamar API do Gemini
      const response = await generateAIResponse(prompt, 'plano-aula-generation', {
        intelligenceLevel: 'advanced',
        languageStyle: 'formal'
      });

      // Processar e validar resposta
      return this.processGeminiResponse(response, inputData);
    } catch (error) {
      console.error('Erro ao gerar plano de aula:', error);
      
      // Retornar conteúdo fallback estruturado
      return this.generateFallbackContent(inputData);
    }
  }

  private static buildPrompt(data: PlanoAulaInputData): string {
    return `
      Você é um especialista em pedagogia e elaboração de planos de aula. Crie um plano de aula completo, detalhado e pedagogicamente estruturado baseado nos seguintes dados coletados:

      === DADOS FORNECIDOS ===
      Disciplina: ${data.disciplina || 'Não especificado'}
      Turma/Série: ${data.turma || 'Não especificado'}
      Professor(a): ${data.professor || 'Não especificado'}
      Duração da Aula: ${data.duracao || '50 minutos'}
      Tema Principal: ${data.tema || 'Tema da aula'}
      Nível de Ensino: ${data.nivel || 'Ensino Fundamental'}
      Instituição: ${data.instituicao || 'Instituição de ensino'}
      Data: ${data.data || new Date().toLocaleDateString('pt-BR')}
      
      Objetivos Gerais: ${data.objetivos || 'Desenvolver conhecimentos sobre o tema'}
      Conteúdo Programático: ${data.conteudo || 'Conteúdo relacionado ao tema'}
      Metodologia Proposta: ${data.metodologia || 'Aula expositiva e participativa'}
      Recursos Disponíveis: ${data.recursos || 'Quadro, projetor, material didático'}
      Método de Avaliação: ${data.avaliacao || 'Participação e exercícios'}

      === INSTRUÇÕES ESPECÍFICAS ===
      1. Adapte todo o conteúdo ao nível educacional especificado
      2. Use terminologia pedagógica adequada
      3. Inclua metodologias ativas quando apropriado
      4. Considere recursos tecnológicos modernos
      5. Estruture avaliações formativas e somativas
      6. Inclua competências da BNCC quando aplicável

      === FORMATO DE RESPOSTA OBRIGATÓRIO ===
      Responda EXCLUSIVAMENTE com um JSON válido seguindo esta estrutura:

      {
        "tema": "Título específico e atrativo para a aula",
        "disciplina": "${data.disciplina || 'Disciplina'}",
        "turma": "${data.turma || 'Série/Turma'}",
        "professor": "${data.professor || 'Professor(a)'}",
        "duracao": "${data.duracao || '50 minutos'}",
        "objetivosGerais": [
          "Objetivo geral 1 (mais amplo e conceitual)",
          "Objetivo geral 2 (focado no desenvolvimento de competências)"
        ],
        "objetivosEspecificos": [
          "Objetivo específico 1 (comportamento observável)",
          "Objetivo específico 2 (habilidade prática)",
          "Objetivo específico 3 (aplicação do conhecimento)",
          "Objetivo específico 4 (se necessário)"
        ],
        "conteudoProgramatico": [
          {
            "titulo": "Tópico Principal 1",
            "topicos": [
              "Subtópico 1.1 detalhado",
              "Subtópico 1.2 com exemplos",
              "Subtópico 1.3 aplicação prática"
            ]
          },
          {
            "titulo": "Tópico Principal 2",
            "topicos": [
              "Subtópico 2.1 com contextualização",
              "Subtópico 2.2 exercícios práticos"
            ]
          }
        ],
        "metodologias": [
          {
            "fase": "Introdução/Motivação",
            "atividade": "Descrição detalhada da atividade introdutória que desperta interesse",
            "tempo": "10 min",
            "recursos": ["Recurso específico 1", "Recurso específico 2"]
          },
          {
            "fase": "Desenvolvimento",
            "atividade": "Descrição da atividade principal com metodologia ativa",
            "tempo": "30 min",
            "recursos": ["Material didático", "Tecnologia educacional"]
          },
          {
            "fase": "Sistematização",
            "atividade": "Atividade de consolidação e síntese do aprendizado",
            "tempo": "8 min",
            "recursos": ["Quadro", "Participação dos alunos"]
          },
          {
            "fase": "Avaliação",
            "atividade": "Verificação do aprendizado e feedback",
            "tempo": "2 min",
            "recursos": ["Exercício rápido", "Discussão"]
          }
        ],
        "recursosNecessarios": [
          "Recurso tecnológico específico",
          "Material didático detalhado",
          "Recurso físico necessário",
          "Outro recurso pedagógico"
        ],
        "avaliacaoAprendizagem": [
          {
            "tipo": "Formativa",
            "descricao": "Descrição detalhada da avaliação durante a aula",
            "criterios": [
              "Critério específico 1",
              "Critério observável 2",
              "Critério de participação 3"
            ]
          },
          {
            "tipo": "Somativa",
            "descricao": "Descrição da avaliação de resultado/produto",
            "criterios": [
              "Critério de conhecimento",
              "Critério de aplicação",
              "Critério de criatividade"
            ]
          }
        ],
        "referencias": [
          "Referência bibliográfica principal da disciplina",
          "Material didático complementar específico",
          "Recurso digital ou online relevante"
        ],
        "observacoes": "Observações pedagógicas importantes, adaptações necessárias e orientações para o professor",
        "competenciasHabilidades": [
          "Competência específica relacionada ao tema",
          "Habilidade da BNCC aplicável",
          "Competência transversal desenvolvida"
        ]
      }

      IMPORTANTE: 
      - Responda APENAS com o JSON válido
      - Não inclua texto antes ou depois do JSON
      - Use aspas duplas em todas as strings
      - Certifique-se de que todos os colchetes e chaves estejam fechados
      - Adapte o vocabulário ao nível educacional especificado
    `;
  }

  private static async processGeminiResponse(response: string, inputData: PlanoAulaInputData): Promise<PlanoAulaGeneratedContent> {
    try {
      // Tentar extrair JSON da resposta
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        // Tentar encontrar JSON em diferentes formatos
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      }

      if (jsonMatch) {
        const parsedContent = JSON.parse(jsonMatch[0]);
        
        // Validar estrutura básica
        if (this.validatePlanoStructure(parsedContent)) {
          return parsedContent;
        }
      }

      // Se chegou aqui, houve problema no parsing
      throw new Error('Estrutura JSON inválida');
    } catch (error) {
      console.error('Erro ao processar resposta do Gemini:', error);
      
      // Retornar fallback
      return this.generateFallbackContent(inputData);
    }
  }

  private static validatePlanoStructure(content: any): boolean {
    const requiredFields = [
      'tema', 'disciplina', 'turma', 'professor', 'duracao',
      'objetivosGerais', 'objetivosEspecificos', 'conteudoProgramatico',
      'metodologias', 'recursosNecessarios', 'avaliacaoAprendizagem'
    ];

    return requiredFields.every(field => content.hasOwnProperty(field));
  }

  private static generateFallbackContent(inputData: PlanoAulaInputData): PlanoAulaGeneratedContent {
    return {
      tema: inputData.tema || 'Plano de Aula Educacional',
      disciplina: inputData.disciplina || 'Disciplina',
      turma: inputData.turma || 'Turma',
      professor: inputData.professor || 'Professor(a)',
      duracao: inputData.duracao || '50 minutos',
      objetivosGerais: [
        'Desenvolver conhecimentos fundamentais sobre o tema proposto',
        'Promover o pensamento crítico e a capacidade de análise dos estudantes'
      ],
      objetivosEspecificos: [
        'Identificar e compreender os conceitos principais do conteúdo',
        'Aplicar os conhecimentos adquiridos em situações práticas',
        'Desenvolver habilidades de comunicação e expressão',
        'Demonstrar compreensão através de atividades dirigidas'
      ],
      conteudoProgramatico: [
        {
          titulo: 'Introdução e Contextualização',
          topicos: [
            'Apresentação do tema e sua relevância',
            'Conexão com conhecimentos prévios',
            'Contextualização histórica ou social'
          ]
        },
        {
          titulo: 'Desenvolvimento do Conteúdo',
          topicos: [
            'Conceitos fundamentais e definições',
            'Exemplos práticos e aplicações',
            'Exercícios de fixação direcionados'
          ]
        }
      ],
      metodologias: [
        {
          fase: 'Introdução',
          atividade: 'Apresentação do tema com recursos audiovisuais e questionamentos iniciais para verificar conhecimentos prévios',
          tempo: '10 min',
          recursos: ['Projetor multimídia', 'Slides preparados', 'Quadro interativo']
        },
        {
          fase: 'Desenvolvimento',
          atividade: 'Explicação teórica combinada com exemplos práticos, promovendo participação ativa dos estudantes',
          tempo: '30 min',
          recursos: ['Material didático', 'Exemplos práticos', 'Atividades participativas']
        },
        {
          fase: 'Sistematização',
          atividade: 'Síntese dos principais conceitos abordados e resolução de exercícios de fixação',
          tempo: '8 min',
          recursos: ['Quadro', 'Exercícios impressos', 'Discussão coletiva']
        },
        {
          fase: 'Avaliação',
          atividade: 'Verificação da aprendizagem através de perguntas dirigidas e feedback dos estudantes',
          tempo: '2 min',
          recursos: ['Questionário rápido', 'Participação oral']
        }
      ],
      recursosNecessarios: [
        'Quadro branco ou lousa digital',
        'Projetor multimídia e tela',
        'Material didático impresso',
        'Computador com acesso à internet',
        'Marcadores e apagador',
        'Caderno e material de escrita dos estudantes'
      ],
      avaliacaoAprendizagem: [
        {
          tipo: 'Formativa',
          descricao: 'Observação contínua da participação, engajamento e compreensão durante as atividades',
          criterios: [
            'Participação ativa nas discussões',
            'Qualidade das perguntas e respostas',
            'Demonstração de interesse e engajamento',
            'Colaboração nas atividades em grupo'
          ]
        },
        {
          tipo: 'Somativa',
          descricao: 'Exercício de aplicação dos conceitos abordados para verificar a assimilação do conteúdo',
          criterios: [
            'Compreensão correta dos conceitos principais',
            'Capacidade de aplicar conhecimentos em situações novas',
            'Clareza na comunicação das ideias',
            'Uso adequado da terminologia específica'
          ]
        }
      ],
      referencias: [
        'Material didático oficial da instituição de ensino',
        'Bibliografia recomendada da disciplina',
        'Recursos educacionais digitais complementares'
      ],
      observacoes: 'É importante adaptar a metodologia conforme as necessidades específicas da turma, considerando diferentes estilos de aprendizagem e promovendo um ambiente inclusivo e participativo.',
      competenciasHabilidades: [
        'Pensamento crítico e capacidade de análise',
        'Comunicação eficaz e expressão clara de ideias',
        'Resolução de problemas e tomada de decisões',
        'Trabalho colaborativo e cooperativo'
      ]
    };
  }

  static async validateAndEnhancePlano(planoContent: PlanoAulaGeneratedContent): Promise<PlanoAulaGeneratedContent> {
    // Implementar validações adicionais e melhorias se necessário
    try {
      // Verificar se todos os campos obrigatórios estão preenchidos
      if (!planoContent.tema || planoContent.tema.trim() === '') {
        planoContent.tema = 'Plano de Aula Educacional';
      }

      // Garantir que arrays não estejam vazios
      if (!planoContent.objetivosGerais || planoContent.objetivosGerais.length === 0) {
        planoContent.objetivosGerais = ['Desenvolver conhecimentos sobre o tema'];
      }

      if (!planoContent.objetivosEspecificos || planoContent.objetivosEspecificos.length === 0) {
        planoContent.objetivosEspecificos = ['Compreender conceitos fundamentais'];
      }

      // Garantir estrutura mínima das metodologias
      if (!planoContent.metodologias || planoContent.metodologias.length === 0) {
        planoContent.metodologias = [
          {
            fase: 'Desenvolvimento',
            atividade: 'Apresentação e discussão do conteúdo',
            tempo: '40 min',
            recursos: ['Material didático']
          }
        ];
      }

      return planoContent;
    } catch (error) {
      console.error('Erro na validação do plano:', error);
      return planoContent;
    }
  }
}

export default PlanoAulaService;

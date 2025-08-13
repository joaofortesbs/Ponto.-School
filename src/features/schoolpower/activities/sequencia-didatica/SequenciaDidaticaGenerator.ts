import { geminiClient } from '@/utils/api/geminiClient';
import { SequenciaDidaticaBuilder, SequenciaDidaticaData } from './SequenciaDidaticaBuilder';

export interface SequenciaDidaticaGenerationParams {
  tema: string;
  disciplina: string;
  serieAno: string;
  duracao?: string;
  objetivos?: string;
  contexto?: string;
  competenciasBNCC?: string[];
  recursosDisponiveis?: string[];
}

export class SequenciaDidaticaGenerator {
  private builder: SequenciaDidaticaBuilder;

  constructor() {
    console.log('🤖 SequenciaDidaticaGenerator: Inicializando gerador');
    this.builder = new SequenciaDidaticaBuilder();
  }

  async generate(params: SequenciaDidaticaGenerationParams): Promise<SequenciaDidaticaData> {
    console.log('🤖 SequenciaDidaticaGenerator: Iniciando geração com parâmetros:', params);

    try {
      // Gerar prompt para a IA
      const prompt = this.createPrompt(params);
      console.log('🤖 SequenciaDidaticaGenerator: Prompt criado:', prompt);

      // Fazer chamada para a API Gemini
      const response = await geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 3000
      });

      console.log('🤖 SequenciaDidaticaGenerator: Resposta da API:', response);

      if (!response.success) {
        console.error('❌ SequenciaDidaticaGenerator: Erro na API:', response.error);
        return this.generateFallback(params);
      }

      // Construir sequência didática a partir da resposta
      const sequenciaDidatica = this.builder
        .buildFromAIResponse(response.result)
        .build();

      console.log('✅ SequenciaDidaticaGenerator: Sequência didática gerada com sucesso');
      return sequenciaDidatica;

    } catch (error) {
      console.error('❌ SequenciaDidaticaGenerator: Erro durante geração:', error);
      return this.generateFallback(params);
    }
  }

  private createPrompt(params: SequenciaDidaticaGenerationParams): string {
    console.log('📝 SequenciaDidaticaGenerator: Criando prompt personalizado');

    return `
Você é um especialista em educação e precisa criar uma SEQUÊNCIA DIDÁTICA completa e detalhada.

INFORMAÇÕES FORNECIDAS:
- Tema: ${params.tema}
- Disciplina: ${params.disciplina}
- Série/Ano: ${params.serieAno}
- Duração: ${params.duracao || '4 aulas de 50 minutos'}
- Objetivos específicos: ${params.objetivos || 'Não especificado'}
- Contexto: ${params.contexto || 'Ensino regular'}
- Competências BNCC: ${params.competenciasBNCC?.join(', ') || 'A definir'}
- Recursos disponíveis: ${params.recursosDisponiveis?.join(', ') || 'Recursos básicos de sala de aula'}

ESTRUTURA OBRIGATÓRIA DA SEQUÊNCIA DIDÁTICA:

{
  "titulo": "Título claro e específico da sequência didática",
  "disciplina": "${params.disciplina}",
  "serieAno": "${params.serieAno}",
  "duracao": "${params.duracao || '4 aulas de 50 minutos'}",

  "objetivos": {
    "geral": "Objetivo geral amplo e claro",
    "especificos": [
      "Objetivo específico 1",
      "Objetivo específico 2",
      "Objetivo específico 3"
    ]
  },

  "competenciasBNCC": [
    "Competência 1 específica da BNCC",
    "Competência 2 específica da BNCC",
    "Competência 3 específica da BNCC"
  ],

  "conteudos": [
    "Conteúdo conceitual 1",
    "Conteúdo procedimental 2",
    "Conteúdo atitudinal 3"
  ],

  "metodologia": {
    "estrategias": [
      "Estratégia metodológica 1",
      "Estratégia metodológica 2",
      "Estratégia metodológica 3"
    ],
    "recursos": [
      "Recurso didático 1",
      "Recurso didático 2",
      "Recurso didático 3"
    ]
  },

  "etapas": [
    {
      "numero": 1,
      "titulo": "Título da Etapa 1",
      "duracao": "1 aula",
      "objetivoEspecifico": "Objetivo específico desta etapa",
      "atividades": [
        "Atividade 1.1 - Descrição detalhada",
        "Atividade 1.2 - Descrição detalhada",
        "Atividade 1.3 - Descrição detalhada"
      ],
      "recursos": [
        "Recurso específico 1",
        "Recurso específico 2"
      ],
      "avaliacao": "Como será avaliada esta etapa"
    },
    {
      "numero": 2,
      "titulo": "Título da Etapa 2",
      "duracao": "2 aulas",
      "objetivoEspecifico": "Objetivo específico desta etapa",
      "atividades": [
        "Atividade 2.1 - Descrição detalhada",
        "Atividade 2.2 - Descrição detalhada",
        "Atividade 2.3 - Descrição detalhada"
      ],
      "recursos": [
        "Recurso específico 1",
        "Recurso específico 2"
      ],
      "avaliacao": "Como será avaliada esta etapa"
    },
    {
      "numero": 3,
      "titulo": "Título da Etapa 3",
      "duracao": "1 aula",
      "objetivoEspecifico": "Objetivo específico desta etapa",
      "atividades": [
        "Atividade 3.1 - Descrição detalhada",
        "Atividade 3.2 - Descrição detalhada",
        "Atividade 3.3 - Descrição detalhada"
      ],
      "recursos": [
        "Recurso específico 1",
        "Recurso específico 2"
      ],
      "avaliacao": "Como será avaliada esta etapa"
    }
  ],

  "avaliacaoFinal": {
    "criterios": [
      "Critério de avaliação 1",
      "Critério de avaliação 2",
      "Critério de avaliação 3"
    ],
    "instrumentos": [
      "Instrumento 1",
      "Instrumento 2",
      "Instrumento 3"
    ],
    "forma": "Descrição da forma de avaliação"
  },

  "recursosNecessarios": [
    "Recurso necessário 1",
    "Recurso necessário 2",
    "Recurso necessário 3"
  ],

  "referencias": [
    "Referência bibliográfica 1",
    "Referência bibliográfica 2",
    "Referência bibliográfica 3"
  ]
}

DIRETRIZES IMPORTANTES:
1. A sequência deve ser ESPECÍFICA para o tema "${params.tema}" na disciplina ${params.disciplina}
2. Adapte o conteúdo para a faixa etária de ${params.serieAno}
3. Cada etapa deve ter progressão lógica e conexão com as outras
4. As atividades devem ser práticas, viáveis e envolventes
5. Inclua diferentes estratégias metodológicas para atender diversos estilos de aprendizagem
6. A avaliação deve ser formativa e processual
7. Use competências reais da BNCC para ${params.disciplina}
8. NÃO use dados fictícios ou genéricos demais

RETORNE APENAS o JSON válido da sequência didática, sem explicações adicionais.
    `.trim();
  }

  private generateFallback(params: SequenciaDidaticaGenerationParams): SequenciaDidaticaData {
    console.log('🔄 SequenciaDidaticaGenerator: Gerando sequência didática de fallback');

    return this.builder
      .setTitulo(`Sequência Didática: ${params.tema}`)
      .setDisciplina(params.disciplina)
      .setSerieAno(params.serieAno)
      .setDuracao(params.duracao || '4 aulas de 50 minutos')
      .setObjetivos(
        `Desenvolver conhecimentos e habilidades sobre ${params.tema}`,
        [
          `Compreender os conceitos básicos de ${params.tema}`,
          `Aplicar os conhecimentos em situações práticas`,
          `Desenvolver pensamento crítico sobre o tema`
        ]
      )
      .setCompetenciasBNCC([
        'Competência específica da área de conhecimento',
        'Desenvolvimento de habilidades cognitivas',
        'Formação para cidadania'
      ])
      .setConteudos([
        `Fundamentos teóricos de ${params.tema}`,
        'Aplicações práticas e contextualizadas',
        'Reflexões e análises críticas'
      ])
      .setMetodologia(
        [
          'Aula expositiva dialogada',
          'Atividades práticas em grupos',
          'Discussões e debates',
          'Resolução de problemas'
        ],
        [
          'Quadro e projetor',
          'Material impresso',
          'Recursos audiovisuais',
          'Atividades interativas'
        ]
      )
      .addEtapa({
        numero: 1,
        titulo: `Introdução a ${params.tema}`,
        duracao: '1 aula',
        objetivoEspecifico: `Apresentar e contextualizar ${params.tema}`,
        atividades: [
          'Discussão inicial sobre conhecimentos prévios',
          `Apresentação conceitual de ${params.tema}`,
          'Atividade diagnóstica'
        ],
        recursos: ['Quadro', 'Projetor', 'Material impresso'],
        avaliacao: 'Participação nas discussões e atividade diagnóstica'
      })
      .addEtapa({
        numero: 2,
        titulo: `Desenvolvimento dos Conceitos de ${params.tema}`,
        duracao: '2 aulas',
        objetivoEspecifico: `Aprofundar o conhecimento sobre ${params.tema}`,
        atividades: [
          'Explicação detalhada dos conceitos',
          'Exercícios práticos orientados',
          'Trabalho colaborativo em grupos',
          'Apresentação dos resultados'
        ],
        recursos: ['Livro didático', 'Atividades práticas', 'Material de apoio'],
        avaliacao: 'Resolução de exercícios e apresentação em grupo'
      })
      .addEtapa({
        numero: 3,
        titulo: `Aplicação e Síntese de ${params.tema}`,
        duracao: '1 aula',
        objetivoEspecifico: `Aplicar os conhecimentos adquiridos sobre ${params.tema}`,
        atividades: [
          'Atividade de aplicação prática',
          'Síntese coletiva dos aprendizados',
          'Avaliação final do processo',
          'Reflexão sobre a aplicabilidade'
        ],
        recursos: ['Material para atividade prática', 'Ficha de avaliação'],
        avaliacao: 'Atividade prática e participação na síntese'
      })
      .setAvaliacaoFinal(
        [
          'Compreensão dos conceitos fundamentais',
          'Capacidade de aplicação prática',
          'Participação ativa nas atividades',
          'Colaboração e trabalho em equipe'
        ],
        [
          'Observação sistemática',
          'Atividades escritas',
          'Apresentações orais',
          'Autoavaliação'
        ],
        'Avaliação formativa e processual durante toda a sequência'
      )
      .setRecursosNecessarios([
        'Sala de aula adequada',
        'Material didático específico',
        'Recursos audiovisuais básicos',
        'Tempo suficiente para desenvolvimento'
      ])
      .setReferencias([
        'Base Nacional Comum Curricular (BNCC)',
        'Livro didático da disciplina',
        'Materiais complementares específicos do tema'
      ])
      .build();
  }
}

export default SequenciaDidaticaGenerator;
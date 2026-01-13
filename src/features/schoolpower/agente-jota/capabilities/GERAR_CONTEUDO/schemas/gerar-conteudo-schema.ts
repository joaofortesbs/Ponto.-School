/**
 * GERAR CONTEÚDO ATIVIDADES - Schema
 * 
 * Define os campos obrigatórios e opcionais para cada tipo de atividade.
 * Este mapeamento é usado pela IA para gerar conteúdo específico.
 */

export interface ActivityFieldsMapping {
  type: string;
  displayName: string;
  requiredFields: FieldDefinition[];
  optionalFields?: FieldDefinition[];
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  description: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export const ACTIVITY_FIELDS_MAPPING: Record<string, ActivityFieldsMapping> = {
  'lista-exercicios': {
    type: 'lista-exercicios',
    displayName: 'Lista de Exercícios',
    requiredFields: [
      { name: 'numberOfQuestions', label: 'Número de Questões', type: 'number', description: 'Quantidade de questões na lista', placeholder: '10' },
      { name: 'difficultyLevel', label: 'Nível de Dificuldade', type: 'select', description: 'Nível de complexidade das questões', options: ['facil', 'medio', 'dificil'] },
      { name: 'questionModel', label: 'Modelo de Questões', type: 'select', description: 'Formato das questões', options: ['multipla-escolha', 'dissertativa', 'misto'] },
      { name: 'objectives', label: 'Objetivos de Aprendizagem', type: 'textarea', description: 'O que o aluno deve aprender com esta lista' },
      { name: 'context', label: 'Contexto/Tema', type: 'textarea', description: 'Tema e contexto das questões' }
    ],
    optionalFields: [
      { name: 'sources', label: 'Fontes/Referências', type: 'textarea', description: 'Materiais de apoio' },
      { name: 'materials', label: 'Materiais Necessários', type: 'textarea', description: 'Recursos para resolução' },
      { name: 'timeLimit', label: 'Tempo Limite', type: 'text', description: 'Tempo sugerido para resolução' }
    ]
  },

  'plano-aula': {
    type: 'plano-aula',
    displayName: 'Plano de Aula',
    requiredFields: [
      { name: 'subject', label: 'Componente Curricular', type: 'text', description: 'Disciplina principal', placeholder: 'Matemática' },
      { name: 'theme', label: 'Tema Central', type: 'text', description: 'Tópico principal da aula', placeholder: 'Frações e Decimais' },
      { name: 'schoolYear', label: 'Ano/Série', type: 'text', description: 'Série escolar', placeholder: '6º ano' },
      { name: 'objectives', label: 'Objetivos de Aprendizagem', type: 'textarea', description: 'O que os alunos devem aprender' },
      { name: 'context', label: 'Contextualização', type: 'textarea', description: 'Conexão com realidade do aluno' }
    ],
    optionalFields: [
      { name: 'competencies', label: 'Competências BNCC', type: 'textarea', description: 'Competências alinhadas à BNCC' },
      { name: 'materials', label: 'Materiais Didáticos', type: 'textarea', description: 'Recursos necessários' },
      { name: 'evaluation', label: 'Avaliação', type: 'textarea', description: 'Como avaliar a aprendizagem' },
      { name: 'timeLimit', label: 'Duração da Aula', type: 'text', description: 'Tempo total da aula' }
    ]
  },

  'sequencia-didatica': {
    type: 'sequencia-didatica',
    displayName: 'Sequência Didática',
    requiredFields: [
      { name: 'tituloTemaAssunto', label: 'Título/Tema/Assunto', type: 'text', description: 'Tema central da sequência', placeholder: 'Ecossistemas Brasileiros' },
      { name: 'anoSerie', label: 'Ano/Série', type: 'text', description: 'Série escolar alvo', placeholder: '7º ano' },
      { name: 'disciplina', label: 'Disciplina', type: 'text', description: 'Componente curricular', placeholder: 'Ciências' },
      { name: 'objetivosAprendizagem', label: 'Objetivos de Aprendizagem', type: 'textarea', description: 'Metas de aprendizado' },
      { name: 'quantidadeAulas', label: 'Quantidade de Aulas', type: 'number', description: 'Número de aulas previstas', placeholder: '5' }
    ],
    optionalFields: [
      { name: 'bnccCompetencias', label: 'Competências BNCC', type: 'textarea', description: 'Alinhamento com Base Nacional' },
      { name: 'publicoAlvo', label: 'Público-Alvo', type: 'text', description: 'Descrição dos estudantes' },
      { name: 'quantidadeDiagnosticos', label: 'Diagnósticos', type: 'number', description: 'Avaliações diagnósticas' },
      { name: 'quantidadeAvaliacoes', label: 'Avaliações', type: 'number', description: 'Avaliações formativas' },
      { name: 'cronograma', label: 'Cronograma', type: 'textarea', description: 'Distribuição temporal' }
    ]
  },

  'quiz-interativo': {
    type: 'quiz-interativo',
    displayName: 'Quiz Interativo',
    requiredFields: [
      { name: 'numberOfQuestions', label: 'Número de Questões', type: 'number', description: 'Total de perguntas', placeholder: '10' },
      { name: 'theme', label: 'Tema do Quiz', type: 'text', description: 'Assunto principal', placeholder: 'Revolução Industrial' },
      { name: 'subject', label: 'Disciplina', type: 'text', description: 'Área do conhecimento', placeholder: 'História' },
      { name: 'schoolYear', label: 'Ano/Série', type: 'text', description: 'Série escolar', placeholder: '8º ano' },
      { name: 'difficultyLevel', label: 'Nível de Dificuldade', type: 'select', description: 'Complexidade das questões', options: ['facil', 'medio', 'dificil'] }
    ],
    optionalFields: [
      { name: 'questionModel', label: 'Modelo de Questões', type: 'select', description: 'Formato', options: ['multipla-escolha', 'verdadeiro-falso', 'misto'] },
      { name: 'format', label: 'Formato do Quiz', type: 'select', description: 'Tipo de aplicação', options: ['individual', 'grupo', 'competitivo'] },
      { name: 'timePerQuestion', label: 'Tempo por Questão', type: 'number', description: 'Segundos por pergunta' }
    ]
  },

  'flash-cards': {
    type: 'flash-cards',
    displayName: 'Flash Cards',
    requiredFields: [
      { name: 'theme', label: 'Tema dos Flash Cards', type: 'text', description: 'Assunto central', placeholder: 'Verbos Irregulares em Inglês' },
      { name: 'topicos', label: 'Tópicos Principais', type: 'textarea', description: 'Lista de tópicos a cobrir', placeholder: 'Presente, Passado, Particípio...' },
      { name: 'numberOfFlashcards', label: 'Quantidade de Cards', type: 'number', description: 'Total de cartões', placeholder: '20' }
    ],
    optionalFields: [
      { name: 'contextoUso', label: 'Contexto de Uso', type: 'textarea', description: 'Como os cards serão utilizados' }
    ]
  },

  'tese-redacao': {
    type: 'tese-redacao',
    displayName: 'Tese de Redação',
    requiredFields: [
      { name: 'temaRedacao', label: 'Tema da Redação', type: 'text', description: 'Tema central para argumentação', placeholder: 'Desafios da mobilidade urbana no Brasil' },
      { name: 'objetivo', label: 'Objetivo da Tese', type: 'textarea', description: 'O que o aluno deve argumentar' },
      { name: 'nivelDificuldade', label: 'Nível de Dificuldade', type: 'select', description: 'Complexidade esperada', options: ['basico', 'intermediario', 'avancado'] }
    ],
    optionalFields: [
      { name: 'competenciasENEM', label: 'Competências ENEM', type: 'textarea', description: 'Competências a desenvolver' },
      { name: 'contextoAdicional', label: 'Contexto Adicional', type: 'textarea', description: 'Informações extras para a redação' }
    ]
  },

  'quadro-interativo': {
    type: 'quadro-interativo',
    displayName: 'Quadro Interativo',
    requiredFields: [
      { name: 'subject', label: 'Disciplina', type: 'text', description: 'Área de conhecimento', placeholder: 'Ciências' },
      { name: 'schoolYear', label: 'Ano/Série', type: 'text', description: 'Série escolar', placeholder: '5º ano' },
      { name: 'theme', label: 'Tema', type: 'text', description: 'Tópico principal', placeholder: 'Sistema Solar' },
      { name: 'objectives', label: 'Objetivos', type: 'textarea', description: 'Metas de aprendizagem' }
    ],
    optionalFields: [
      { name: 'difficultyLevel', label: 'Nível de Dificuldade', type: 'select', description: 'Complexidade', options: ['facil', 'medio', 'dificil'] },
      { name: 'quadroInterativoCampoEspecifico', label: 'Campo Específico', type: 'textarea', description: 'Configurações específicas do quadro' }
    ]
  },

  'mapa-mental': {
    type: 'mapa-mental',
    displayName: 'Mapa Mental',
    requiredFields: [
      { name: 'centralTheme', label: 'Tema Central', type: 'text', description: 'Conceito principal do mapa', placeholder: 'Ciclo da Água' },
      { name: 'mainCategories', label: 'Categorias Principais', type: 'textarea', description: 'Ramificações principais do mapa' },
      { name: 'generalObjective', label: 'Objetivo Geral', type: 'textarea', description: 'Finalidade do mapa mental' }
    ],
    optionalFields: [
      { name: 'subject', label: 'Disciplina', type: 'text', description: 'Área de conhecimento' },
      { name: 'schoolYear', label: 'Ano/Série', type: 'text', description: 'Série escolar' },
      { name: 'evaluationCriteria', label: 'Critérios de Avaliação', type: 'textarea', description: 'Como avaliar o mapa' }
    ]
  }
};

export const gerarConteudoSchema = {
  name: 'gerar_conteudo_atividades',
  description: 'Gera conteúdo para preencher os campos de cada atividade decidida, mantendo contexto completo da conversa',
  parameters: {
    session_id: { type: 'string', required: true, description: 'ID da sessão atual' },
    conversation_context: { type: 'string', required: true, description: 'Contexto completo da conversa com o usuário' },
    user_objective: { type: 'string', required: true, description: 'Objetivo original do usuário' },
    activities_to_fill: { type: 'array', required: false, description: 'Atividades específicas para preencher (opcional, usa store se não fornecido)' }
  }
};

export function getFieldsForActivityType(activityType: string): ActivityFieldsMapping | null {
  const normalized = activityType.toLowerCase().replace(/\s+/g, '-');
  
  for (const [key, mapping] of Object.entries(ACTIVITY_FIELDS_MAPPING)) {
    if (key === normalized || 
        mapping.type === normalized || 
        mapping.displayName.toLowerCase().includes(activityType.toLowerCase())) {
      return mapping;
    }
  }
  
  return null;
}

export function getAllRequiredFieldNames(activityType: string): string[] {
  const mapping = getFieldsForActivityType(activityType);
  return mapping?.requiredFields.map(f => f.name) || [];
}

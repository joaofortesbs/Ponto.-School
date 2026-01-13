/**
 * GERAR CONTEÚDO ATIVIDADES - Schema
 * 
 * Define os campos obrigatórios e opcionais para cada tipo de atividade.
 * Este mapeamento é usado pela IA para gerar conteúdo específico.
 * 
 * IMPORTANTE: Os nomes dos campos (name) devem corresponder EXATAMENTE aos
 * campos usados nos modais de Editar Atividades em:
 * src/features/schoolpower/construction/components/EditFields/
 * 
 * Isso garante sincronização entre:
 * - gerar_conteudo_atividades (gera os campos)
 * - ChosenActivitiesStore (armazena os campos)
 * - EditActivityModal (exibe os campos preenchidos)
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

/**
 * MAPEAMENTO CENTRALIZADO DE CAMPOS POR TIPO DE ATIVIDADE
 * 
 * Sincronizado com os componentes EditFields:
 * - PlanoAulaEditActivity.tsx
 * - QuizInterativoEditActivity.tsx
 * - FlashCardsEditActivity.tsx
 * - SequenciaDidaticaEditActivity.tsx
 * - TeseRedacaoEditActivity.tsx
 * - QuadroInterativoEditActivity.tsx
 */
export const ACTIVITY_FIELDS_MAPPING: Record<string, ActivityFieldsMapping> = {
  
  // ============================================================
  // PLANO DE AULA - PlanoAulaEditActivity.tsx
  // ============================================================
  'plano-aula': {
    type: 'plano-aula',
    displayName: 'Plano de Aula',
    requiredFields: [
      { 
        name: 'subject', 
        label: 'Componente Curricular', 
        type: 'text', 
        description: 'Disciplina principal da aula (ex: Matemática, Português, História)',
        placeholder: 'Ex: Matemática, Português, História'
      },
      { 
        name: 'theme', 
        label: 'Tema ou Tópico Central', 
        type: 'text', 
        description: 'Assunto principal que será abordado na aula',
        placeholder: 'Ex: Frações, Revolução Francesa'
      },
      { 
        name: 'schoolYear', 
        label: 'Ano/Série Escolar', 
        type: 'text', 
        description: 'Série/ano escolar dos alunos',
        placeholder: 'Ex: 6º Ano - Ensino Fundamental'
      },
      { 
        name: 'objectives', 
        label: 'Objetivo Geral', 
        type: 'textarea', 
        description: 'O que os alunos devem aprender ao final da aula. Descreva de forma clara e mensurável.',
        placeholder: 'Descreva o objetivo principal da aula...'
      },
      { 
        name: 'materials', 
        label: 'Materiais/Recursos', 
        type: 'textarea', 
        description: 'Lista de materiais e recursos necessários para a aula',
        placeholder: 'Lista de materiais necessários (um por linha)...'
      },
      { 
        name: 'context', 
        label: 'Perfil da Turma / Contexto', 
        type: 'textarea', 
        description: 'Descrição do perfil da turma e contexto em que a aula será aplicada',
        placeholder: 'Descrição do perfil da turma e contexto da aula...'
      }
    ],
    optionalFields: [
      { 
        name: 'competencies', 
        label: 'Habilidades BNCC', 
        type: 'text', 
        description: 'Códigos das habilidades da BNCC',
        placeholder: 'Ex: EF67MA01, EF67LP02'
      },
      { 
        name: 'timeLimit', 
        label: 'Carga Horária / Tempo Estimado', 
        type: 'text', 
        description: 'Duração prevista da aula',
        placeholder: 'Ex: 2 aulas de 50 minutos'
      },
      { 
        name: 'difficultyLevel', 
        label: 'Tipo de Aula / Metodologia', 
        type: 'select', 
        description: 'Abordagem metodológica da aula',
        options: ['Expositiva', 'Debate', 'Estudo de Caso', 'Resolução de Problemas', 'Outro']
      },
      { 
        name: 'evaluation', 
        label: 'Observações do Professor / Avaliação', 
        type: 'textarea', 
        description: 'Critérios de avaliação e observações relevantes',
        placeholder: 'Observações relevantes para a aula ou critérios de avaliação...'
      }
    ]
  },

  // ============================================================
  // QUIZ INTERATIVO - QuizInterativoEditActivity.tsx
  // ============================================================
  'quiz-interativo': {
    type: 'quiz-interativo',
    displayName: 'Quiz Interativo',
    requiredFields: [
      { 
        name: 'numberOfQuestions', 
        label: 'Número de Questões', 
        type: 'number', 
        description: 'Quantidade total de questões do quiz',
        placeholder: 'Ex: 10, 15, 20',
        validation: { min: 1, max: 50 }
      },
      { 
        name: 'theme', 
        label: 'Tema', 
        type: 'text', 
        description: 'Assunto principal que será abordado no quiz',
        placeholder: 'Ex: Teorema de Pitágoras, Revolução Francesa'
      },
      { 
        name: 'subject', 
        label: 'Disciplina', 
        type: 'text', 
        description: 'Área do conhecimento',
        placeholder: 'Ex: Matemática, Português, História'
      },
      { 
        name: 'schoolYear', 
        label: 'Ano de Escolaridade', 
        type: 'text', 
        description: 'Série/ano escolar dos alunos',
        placeholder: 'Ex: 6º Ano - Ensino Fundamental'
      },
      { 
        name: 'difficultyLevel', 
        label: 'Nível de Dificuldade', 
        type: 'text', 
        description: 'Grau de complexidade das questões',
        placeholder: 'Ex: Fácil, Médio, Difícil'
      },
      { 
        name: 'questionModel', 
        label: 'Formato', 
        type: 'text', 
        description: 'Tipo/formato das questões',
        placeholder: 'Ex: Múltipla Escolha, Verdadeiro ou Falso'
      }
    ],
    optionalFields: []
  },

  // ============================================================
  // FLASH CARDS - FlashCardsEditActivity.tsx
  // ============================================================
  'flash-cards': {
    type: 'flash-cards',
    displayName: 'Flash Cards',
    requiredFields: [
      { 
        name: 'theme', 
        label: 'Tema dos Flash Cards', 
        type: 'text', 
        description: 'Assunto central que os flash cards abordarão',
        placeholder: 'Ex: Substantivos Próprios e Verbos'
      },
      { 
        name: 'topicos', 
        label: 'Tópicos Principais', 
        type: 'textarea', 
        description: 'Lista detalhada dos principais tópicos que os flash cards devem abordar',
        placeholder: 'Liste os principais tópicos que os flash cards devem abordar...'
      },
      { 
        name: 'numberOfFlashcards', 
        label: 'Número de Flash Cards', 
        type: 'number', 
        description: 'Quantidade total de cartões a serem criados',
        placeholder: 'Ex: 10',
        validation: { min: 1, max: 100 }
      }
    ],
    optionalFields: [
      { 
        name: 'contextoUso', 
        label: 'Contexto de Uso', 
        type: 'textarea', 
        description: 'Situação ou contexto em que os flash cards serão utilizados',
        placeholder: 'Descreva o contexto ou situação em que estes flash cards serão utilizados...'
      }
    ]
  },

  // ============================================================
  // SEQUÊNCIA DIDÁTICA - SequenciaDidaticaEditActivity.tsx
  // ============================================================
  'sequencia-didatica': {
    type: 'sequencia-didatica',
    displayName: 'Sequência Didática',
    requiredFields: [
      { 
        name: 'tituloTemaAssunto', 
        label: 'Título do Tema / Assunto', 
        type: 'text', 
        description: 'Tema central da sequência didática',
        placeholder: 'Ex: Substantivos Próprios e Verbos'
      },
      { 
        name: 'anoSerie', 
        label: 'Ano / Série', 
        type: 'text', 
        description: 'Série/ano escolar dos alunos',
        placeholder: 'Ex: 6º Ano do Ensino Fundamental'
      },
      { 
        name: 'disciplina', 
        label: 'Disciplina', 
        type: 'text', 
        description: 'Componente curricular principal',
        placeholder: 'Ex: Língua Portuguesa'
      },
      { 
        name: 'publicoAlvo', 
        label: 'Público-alvo', 
        type: 'textarea', 
        description: 'Descrição detalhada do público-alvo da sequência',
        placeholder: 'Descrição detalhada do público-alvo...'
      },
      { 
        name: 'objetivosAprendizagem', 
        label: 'Objetivos de Aprendizagem', 
        type: 'textarea', 
        description: 'Objetivos específicos que os alunos devem alcançar',
        placeholder: 'Objetivos específicos que os alunos devem alcançar...'
      },
      { 
        name: 'quantidadeAulas', 
        label: 'Quantidade de Aulas', 
        type: 'number', 
        description: 'Número total de aulas na sequência',
        placeholder: 'Ex: 4',
        validation: { min: 1 }
      },
      { 
        name: 'quantidadeDiagnosticos', 
        label: 'Quantidade de Diagnósticos', 
        type: 'number', 
        description: 'Número de avaliações diagnósticas',
        placeholder: 'Ex: 1',
        validation: { min: 0 }
      },
      { 
        name: 'quantidadeAvaliacoes', 
        label: 'Quantidade de Avaliações', 
        type: 'number', 
        description: 'Número de avaliações formativas/somativas',
        placeholder: 'Ex: 2',
        validation: { min: 0 }
      }
    ],
    optionalFields: [
      { 
        name: 'bnccCompetencias', 
        label: 'BNCC / Competências', 
        type: 'text', 
        description: 'Códigos das competências da BNCC',
        placeholder: 'Ex: EF06LP01, EF06LP02'
      },
      { 
        name: 'cronograma', 
        label: 'Cronograma', 
        type: 'textarea', 
        description: 'Distribuição temporal das aulas e atividades',
        placeholder: 'Cronograma resumido da sequência didática...'
      }
    ]
  },

  // ============================================================
  // TESE DE REDAÇÃO - TeseRedacaoEditActivity.tsx
  // ============================================================
  'tese-redacao': {
    type: 'tese-redacao',
    displayName: 'Tese de Redação',
    requiredFields: [
      { 
        name: 'temaRedacao', 
        label: 'Tema da Redação', 
        type: 'text', 
        description: 'Tema central para argumentação na redação',
        placeholder: 'Ex: Desafios da mobilidade urbana no Brasil'
      },
      { 
        name: 'objetivo', 
        label: 'Objetivo da Tese', 
        type: 'textarea', 
        description: 'O que o aluno deve argumentar e defender em sua redação',
        placeholder: 'Descreva o objetivo principal que o aluno deve alcançar com esta tese...'
      },
      { 
        name: 'nivelDificuldade', 
        label: 'Nível de Dificuldade', 
        type: 'select', 
        description: 'Nível de complexidade esperado',
        options: ['Fundamental', 'Médio', 'ENEM', 'Vestibular']
      },
      { 
        name: 'competenciasENEM', 
        label: 'Competências ENEM', 
        type: 'text', 
        description: 'Competências do ENEM a serem trabalhadas',
        placeholder: 'Ex: C1, C2, C3, C4, C5'
      }
    ],
    optionalFields: [
      { 
        name: 'contextoAdicional', 
        label: 'Contexto Adicional', 
        type: 'textarea', 
        description: 'Informações adicionais sobre o contexto histórico, social ou político do tema',
        placeholder: 'Informações adicionais sobre o contexto histórico, social ou político do tema...'
      }
    ]
  },

  // ============================================================
  // QUADRO INTERATIVO - QuadroInterativoEditActivity.tsx
  // ============================================================
  'quadro-interativo': {
    type: 'quadro-interativo',
    displayName: 'Quadro Interativo',
    requiredFields: [
      { 
        name: 'subject', 
        label: 'Disciplina / Área de conhecimento', 
        type: 'text', 
        description: 'Área do conhecimento da atividade',
        placeholder: 'Ex: Matemática, Português, Ciências'
      },
      { 
        name: 'schoolYear', 
        label: 'Ano / Série', 
        type: 'text', 
        description: 'Série/ano escolar dos alunos',
        placeholder: 'Ex: 6º Ano, 7º Ano, 8º Ano'
      },
      { 
        name: 'theme', 
        label: 'Tema ou Assunto da aula', 
        type: 'text', 
        description: 'Tópico principal da atividade no quadro',
        placeholder: 'Ex: Substantivos e Verbos, Frações, Sistema Solar'
      },
      { 
        name: 'objectives', 
        label: 'Objetivo de aprendizagem da aula', 
        type: 'textarea', 
        description: 'O que os alunos devem aprender com esta atividade',
        placeholder: 'Descreva os objetivos específicos que os alunos devem alcançar com esta atividade de quadro interativo...'
      },
      { 
        name: 'difficultyLevel', 
        label: 'Nível de Dificuldade', 
        type: 'text', 
        description: 'Grau de complexidade da atividade',
        placeholder: 'Ex: Básico, Intermediário, Avançado'
      },
      { 
        name: 'quadroInterativoCampoEspecifico', 
        label: 'Atividade mostrada', 
        type: 'text', 
        description: 'Tipo de atividade interativa a ser exibida no quadro',
        placeholder: 'Ex: Jogo de arrastar e soltar, Quiz interativo, Mapa mental'
      }
    ],
    optionalFields: []
  },

  // ============================================================
  // LISTA DE EXERCÍCIOS
  // ============================================================
  'lista-exercicios': {
    type: 'lista-exercicios',
    displayName: 'Lista de Exercícios',
    requiredFields: [
      { 
        name: 'numberOfQuestions', 
        label: 'Número de Questões', 
        type: 'number', 
        description: 'Quantidade de questões na lista',
        placeholder: '10',
        validation: { min: 1, max: 100 }
      },
      { 
        name: 'theme', 
        label: 'Tema', 
        type: 'text', 
        description: 'Assunto principal das questões',
        placeholder: 'Ex: Equações do 1º grau'
      },
      { 
        name: 'subject', 
        label: 'Disciplina', 
        type: 'text', 
        description: 'Área do conhecimento',
        placeholder: 'Ex: Matemática'
      },
      { 
        name: 'schoolYear', 
        label: 'Ano de Escolaridade', 
        type: 'text', 
        description: 'Série/ano escolar',
        placeholder: 'Ex: 7º Ano'
      },
      { 
        name: 'difficultyLevel', 
        label: 'Nível de Dificuldade', 
        type: 'select', 
        description: 'Complexidade das questões',
        options: ['Fácil', 'Médio', 'Difícil']
      },
      { 
        name: 'questionModel', 
        label: 'Modelo de Questões', 
        type: 'select', 
        description: 'Formato das questões',
        options: ['Múltipla Escolha', 'Dissertativa', 'Misto']
      }
    ],
    optionalFields: [
      { 
        name: 'objectives', 
        label: 'Objetivos de Aprendizagem', 
        type: 'textarea', 
        description: 'O que o aluno deve aprender com esta lista'
      },
      { 
        name: 'context', 
        label: 'Contexto/Tema', 
        type: 'textarea', 
        description: 'Tema e contexto das questões'
      }
    ]
  },

  // ============================================================
  // MAPA MENTAL
  // ============================================================
  'mapa-mental': {
    type: 'mapa-mental',
    displayName: 'Mapa Mental',
    requiredFields: [
      { 
        name: 'centralTheme', 
        label: 'Tema Central', 
        type: 'text', 
        description: 'Conceito principal do mapa',
        placeholder: 'Ciclo da Água'
      },
      { 
        name: 'mainCategories', 
        label: 'Categorias Principais', 
        type: 'textarea', 
        description: 'Ramificações principais do mapa'
      },
      { 
        name: 'generalObjective', 
        label: 'Objetivo Geral', 
        type: 'textarea', 
        description: 'Finalidade do mapa mental'
      }
    ],
    optionalFields: [
      { 
        name: 'subject', 
        label: 'Disciplina', 
        type: 'text', 
        description: 'Área de conhecimento'
      },
      { 
        name: 'schoolYear', 
        label: 'Ano/Série', 
        type: 'text', 
        description: 'Série escolar'
      },
      { 
        name: 'evaluationCriteria', 
        label: 'Critérios de Avaliação', 
        type: 'textarea', 
        description: 'Como avaliar o mapa'
      }
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

/**
 * Busca o mapeamento de campos para um tipo de atividade
 * Suporta múltiplos formatos de nome (com/sem hífen, maiúsculas/minúsculas)
 */
export function getFieldsForActivityType(activityType: string): ActivityFieldsMapping | null {
  const normalized = activityType.toLowerCase().replace(/\s+/g, '-');
  
  // Busca direta pelo tipo normalizado
  if (ACTIVITY_FIELDS_MAPPING[normalized]) {
    return ACTIVITY_FIELDS_MAPPING[normalized];
  }
  
  // Busca por correspondência parcial
  for (const [key, mapping] of Object.entries(ACTIVITY_FIELDS_MAPPING)) {
    if (key === normalized || 
        mapping.type === normalized || 
        mapping.displayName.toLowerCase().replace(/\s+/g, '-') === normalized ||
        mapping.displayName.toLowerCase().includes(activityType.toLowerCase())) {
      return mapping;
    }
  }
  
  // Busca por aliases comuns
  const aliases: Record<string, string> = {
    'plano': 'plano-aula',
    'aula': 'plano-aula',
    'quiz': 'quiz-interativo',
    'flashcard': 'flash-cards',
    'flashcards': 'flash-cards',
    'sequencia': 'sequencia-didatica',
    'tese': 'tese-redacao',
    'redacao': 'tese-redacao',
    'quadro': 'quadro-interativo',
    'lista': 'lista-exercicios',
    'exercicios': 'lista-exercicios',
    'mapa': 'mapa-mental'
  };
  
  const aliasKey = aliases[normalized];
  if (aliasKey && ACTIVITY_FIELDS_MAPPING[aliasKey]) {
    return ACTIVITY_FIELDS_MAPPING[aliasKey];
  }
  
  return null;
}

/**
 * Retorna todos os nomes de campos obrigatórios para um tipo de atividade
 */
export function getAllRequiredFieldNames(activityType: string): string[] {
  const mapping = getFieldsForActivityType(activityType);
  return mapping?.requiredFields.map(f => f.name) || [];
}

/**
 * Retorna todos os nomes de campos (obrigatórios + opcionais) para um tipo de atividade
 */
export function getAllFieldNames(activityType: string): string[] {
  const mapping = getFieldsForActivityType(activityType);
  if (!mapping) return [];
  
  const requiredNames = mapping.requiredFields.map(f => f.name);
  const optionalNames = mapping.optionalFields?.map(f => f.name) || [];
  
  return [...requiredNames, ...optionalNames];
}

/**
 * Valida se todos os campos obrigatórios estão preenchidos
 */
export function validateRequiredFields(
  activityType: string, 
  fields: Record<string, any>
): { valid: boolean; missingFields: string[] } {
  const requiredNames = getAllRequiredFieldNames(activityType);
  const missingFields: string[] = [];
  
  for (const fieldName of requiredNames) {
    const value = fields[fieldName];
    if (value === undefined || value === null || value === '') {
      missingFields.push(fieldName);
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Lista todos os tipos de atividades suportados
 */
export function getSupportedActivityTypes(): string[] {
  return Object.keys(ACTIVITY_FIELDS_MAPPING);
}

/**
 * Obtém informação sobre um campo específico
 */
export function getFieldInfo(
  activityType: string, 
  fieldName: string
): FieldDefinition | null {
  const mapping = getFieldsForActivityType(activityType);
  if (!mapping) return null;
  
  const allFields = [...mapping.requiredFields, ...(mapping.optionalFields || [])];
  return allFields.find(f => f.name === fieldName) || null;
}

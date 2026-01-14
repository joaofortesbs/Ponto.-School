/**
 * ACTIVITY FIELDS SYNC - Mapeamento Bidirecional Centralizado
 * 
 * Este arquivo resolve o problema de desalinhamento entre:
 * - gerar_conteudo_atividades (usa nomes do schema: subject, theme, etc.)
 * - EditActivityModal formData (usa mesmos nomes: subject, theme, etc.)
 * - ChosenActivitiesStore (armazena campos_preenchidos)
 * 
 * FUNÇÃO: Garantir que campos gerados pela IA apareçam corretamente nos modais
 */

export interface FieldSyncMapping {
  schemaName: string;      // Nome usado no schema/IA
  formDataName: string;    // Nome usado no formData do modal
  displayLabel: string;    // Label exibido na UI
  type: 'text' | 'textarea' | 'number' | 'select';
}

export interface ActivitySyncConfig {
  activityType: string;
  displayName: string;
  fields: FieldSyncMapping[];
}

/**
 * MAPEAMENTO BIDIRECIONAL CENTRALIZADO
 * 
 * Cada entrada mapeia:
 * - schemaName: nome que a IA gera (e que está no gerar-conteudo-schema.ts)
 * - formDataName: nome que o modal espera (ActivityFormData)
 * - displayLabel: label para exibição na UI
 */
export const ACTIVITY_SYNC_CONFIGS: Record<string, ActivitySyncConfig> = {
  
  'plano-aula': {
    activityType: 'plano-aula',
    displayName: 'Plano de Aula',
    fields: [
      { schemaName: 'subject', formDataName: 'subject', displayLabel: 'Componente Curricular', type: 'text' },
      { schemaName: 'theme', formDataName: 'theme', displayLabel: 'Tema ou Tópico Central', type: 'text' },
      { schemaName: 'schoolYear', formDataName: 'schoolYear', displayLabel: 'Ano/Série Escolar', type: 'text' },
      { schemaName: 'objectives', formDataName: 'objectives', displayLabel: 'Objetivo Geral', type: 'textarea' },
      { schemaName: 'materials', formDataName: 'materials', displayLabel: 'Materiais/Recursos', type: 'textarea' },
      { schemaName: 'context', formDataName: 'context', displayLabel: 'Perfil da Turma / Contexto', type: 'textarea' },
      { schemaName: 'competencies', formDataName: 'competencies', displayLabel: 'Habilidades BNCC', type: 'text' },
      { schemaName: 'timeLimit', formDataName: 'timeLimit', displayLabel: 'Carga Horária / Tempo Estimado', type: 'text' },
      { schemaName: 'difficultyLevel', formDataName: 'difficultyLevel', displayLabel: 'Tipo de Aula / Metodologia', type: 'select' },
      { schemaName: 'evaluation', formDataName: 'evaluation', displayLabel: 'Observações do Professor / Avaliação', type: 'textarea' }
    ]
  },

  'quiz-interativo': {
    activityType: 'quiz-interativo',
    displayName: 'Quiz Interativo',
    fields: [
      { schemaName: 'numberOfQuestions', formDataName: 'numberOfQuestions', displayLabel: 'Número de Questões', type: 'number' },
      { schemaName: 'theme', formDataName: 'theme', displayLabel: 'Tema', type: 'text' },
      { schemaName: 'subject', formDataName: 'subject', displayLabel: 'Disciplina', type: 'text' },
      { schemaName: 'schoolYear', formDataName: 'schoolYear', displayLabel: 'Ano de Escolaridade', type: 'text' },
      { schemaName: 'difficultyLevel', formDataName: 'difficultyLevel', displayLabel: 'Nível de Dificuldade', type: 'text' },
      { schemaName: 'questionModel', formDataName: 'questionModel', displayLabel: 'Formato', type: 'text' }
    ]
  },

  'flash-cards': {
    activityType: 'flash-cards',
    displayName: 'Flash Cards',
    fields: [
      { schemaName: 'theme', formDataName: 'theme', displayLabel: 'Tema dos Flash Cards', type: 'text' },
      { schemaName: 'topicos', formDataName: 'topicos', displayLabel: 'Tópicos Principais', type: 'textarea' },
      { schemaName: 'numberOfFlashcards', formDataName: 'numberOfFlashcards', displayLabel: 'Número de Flash Cards', type: 'number' },
      { schemaName: 'contextoUso', formDataName: 'context', displayLabel: 'Contexto de Uso', type: 'textarea' }
    ]
  },

  'sequencia-didatica': {
    activityType: 'sequencia-didatica',
    displayName: 'Sequência Didática',
    fields: [
      { schemaName: 'tituloTemaAssunto', formDataName: 'tituloTemaAssunto', displayLabel: 'Título do Tema / Assunto', type: 'text' },
      { schemaName: 'anoSerie', formDataName: 'anoSerie', displayLabel: 'Ano / Série', type: 'text' },
      { schemaName: 'disciplina', formDataName: 'disciplina', displayLabel: 'Disciplina', type: 'text' },
      { schemaName: 'publicoAlvo', formDataName: 'publicoAlvo', displayLabel: 'Público-alvo', type: 'textarea' },
      { schemaName: 'objetivosAprendizagem', formDataName: 'objetivosAprendizagem', displayLabel: 'Objetivos de Aprendizagem', type: 'textarea' },
      { schemaName: 'quantidadeAulas', formDataName: 'quantidadeAulas', displayLabel: 'Quantidade de Aulas', type: 'number' },
      { schemaName: 'quantidadeDiagnosticos', formDataName: 'quantidadeDiagnosticos', displayLabel: 'Quantidade de Diagnósticos', type: 'number' },
      { schemaName: 'quantidadeAvaliacoes', formDataName: 'quantidadeAvaliacoes', displayLabel: 'Quantidade de Avaliações', type: 'number' },
      { schemaName: 'bnccCompetencias', formDataName: 'bnccCompetencias', displayLabel: 'BNCC / Competências', type: 'text' },
      { schemaName: 'cronograma', formDataName: 'cronograma', displayLabel: 'Cronograma', type: 'textarea' }
    ]
  },

  'tese-redacao': {
    activityType: 'tese-redacao',
    displayName: 'Tese de Redação',
    fields: [
      { schemaName: 'temaRedacao', formDataName: 'temaRedacao', displayLabel: 'Tema da Redação', type: 'text' },
      { schemaName: 'objetivo', formDataName: 'objetivo', displayLabel: 'Objetivo da Tese', type: 'textarea' },
      { schemaName: 'nivelDificuldade', formDataName: 'nivelDificuldade', displayLabel: 'Nível de Dificuldade', type: 'select' },
      { schemaName: 'competenciasENEM', formDataName: 'competenciasENEM', displayLabel: 'Competências ENEM', type: 'text' },
      { schemaName: 'contextoAdicional', formDataName: 'contextoAdicional', displayLabel: 'Contexto Adicional', type: 'textarea' }
    ]
  },

  'quadro-interativo': {
    activityType: 'quadro-interativo',
    displayName: 'Quadro Interativo',
    fields: [
      { schemaName: 'subject', formDataName: 'subject', displayLabel: 'Disciplina / Área de conhecimento', type: 'text' },
      { schemaName: 'schoolYear', formDataName: 'schoolYear', displayLabel: 'Ano / Série', type: 'text' },
      { schemaName: 'theme', formDataName: 'theme', displayLabel: 'Tema ou Assunto da aula', type: 'text' },
      { schemaName: 'objectives', formDataName: 'objectives', displayLabel: 'Objetivo de aprendizagem da aula', type: 'textarea' },
      { schemaName: 'difficultyLevel', formDataName: 'difficultyLevel', displayLabel: 'Nível de Dificuldade', type: 'text' },
      { schemaName: 'quadroInterativoCampoEspecifico', formDataName: 'quadroInterativoCampoEspecifico', displayLabel: 'Atividade mostrada', type: 'text' }
    ]
  },

  'lista-exercicios': {
    activityType: 'lista-exercicios',
    displayName: 'Lista de Exercícios',
    fields: [
      { schemaName: 'numberOfQuestions', formDataName: 'numberOfQuestions', displayLabel: 'Número de Questões', type: 'number' },
      { schemaName: 'theme', formDataName: 'theme', displayLabel: 'Tema', type: 'text' },
      { schemaName: 'subject', formDataName: 'subject', displayLabel: 'Disciplina', type: 'text' },
      { schemaName: 'schoolYear', formDataName: 'schoolYear', displayLabel: 'Ano de Escolaridade', type: 'text' },
      { schemaName: 'difficultyLevel', formDataName: 'difficultyLevel', displayLabel: 'Nível de Dificuldade', type: 'select' },
      { schemaName: 'questionModel', formDataName: 'questionModel', displayLabel: 'Modelo de Questões', type: 'select' },
      { schemaName: 'objectives', formDataName: 'objectives', displayLabel: 'Objetivos de Aprendizagem', type: 'textarea' },
      { schemaName: 'context', formDataName: 'context', displayLabel: 'Contexto/Tema', type: 'textarea' }
    ]
  },

  'mapa-mental': {
    activityType: 'mapa-mental',
    displayName: 'Mapa Mental',
    fields: [
      { schemaName: 'centralTheme', formDataName: 'centralTheme', displayLabel: 'Tema Central', type: 'text' },
      { schemaName: 'mainCategories', formDataName: 'mainCategories', displayLabel: 'Categorias Principais', type: 'textarea' },
      { schemaName: 'generalObjective', formDataName: 'generalObjective', displayLabel: 'Objetivo Geral', type: 'textarea' },
      { schemaName: 'subject', formDataName: 'subject', displayLabel: 'Disciplina', type: 'text' },
      { schemaName: 'schoolYear', formDataName: 'schoolYear', displayLabel: 'Ano/Série', type: 'text' },
      { schemaName: 'evaluationCriteria', formDataName: 'evaluationCriteria', displayLabel: 'Critérios de Avaliação', type: 'textarea' }
    ]
  }
};

/**
 * Converte campos gerados pela IA (schemaName) para formato do formData (formDataName)
 * Usado quando recebemos dados do gerar_conteudo_atividades
 */
export function syncSchemaToFormData(
  activityType: string, 
  schemaFields: Record<string, any>
): Record<string, any> {
  const config = ACTIVITY_SYNC_CONFIGS[normalizeActivityType(activityType)];
  
  if (!config) {
    console.warn(`[ACTIVITY-SYNC] Tipo não mapeado: ${activityType}, retornando dados brutos`);
    return schemaFields;
  }

  const formData: Record<string, any> = {};
  
  for (const field of config.fields) {
    // O schema e formData usam os mesmos nomes na maioria dos casos
    // Mas verificamos ambos para garantir compatibilidade
    if (schemaFields[field.schemaName] !== undefined) {
      formData[field.formDataName] = schemaFields[field.schemaName];
    }
    // Fallback: verificar se já veio com o nome do formData
    if (formData[field.formDataName] === undefined && schemaFields[field.formDataName] !== undefined) {
      formData[field.formDataName] = schemaFields[field.formDataName];
    }
  }

  console.log(`%c🔄 [ACTIVITY-SYNC] Schema → FormData para ${activityType}:`, 
    'background: #2196F3; color: white; padding: 2px 5px; border-radius: 3px;', 
    { input: schemaFields, output: formData }
  );

  return formData;
}

/**
 * Converte campos do formData para formato do schema (para salvar no store)
 * Usado quando queremos persistir dados no ChosenActivitiesStore
 */
export function syncFormDataToSchema(
  activityType: string, 
  formDataFields: Record<string, any>
): Record<string, any> {
  const config = ACTIVITY_SYNC_CONFIGS[normalizeActivityType(activityType)];
  
  if (!config) {
    console.warn(`[ACTIVITY-SYNC] Tipo não mapeado: ${activityType}, retornando dados brutos`);
    return formDataFields;
  }

  const schemaFields: Record<string, any> = {};
  
  for (const field of config.fields) {
    if (formDataFields[field.formDataName] !== undefined) {
      schemaFields[field.schemaName] = formDataFields[field.formDataName];
    }
  }

  console.log(`%c🔄 [ACTIVITY-SYNC] FormData → Schema para ${activityType}:`, 
    'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px;', 
    { input: formDataFields, output: schemaFields }
  );

  return schemaFields;
}

/**
 * Obtém a lista de campos para um tipo de atividade
 */
export function getFieldsForActivity(activityType: string): FieldSyncMapping[] {
  const config = ACTIVITY_SYNC_CONFIGS[normalizeActivityType(activityType)];
  return config?.fields || [];
}

/**
 * Obtém informações de sincronização para um tipo de atividade
 */
export function getActivitySyncConfig(activityType: string): ActivitySyncConfig | null {
  return ACTIVITY_SYNC_CONFIGS[normalizeActivityType(activityType)] || null;
}

/**
 * Normaliza o tipo de atividade (minúsculas, com hífen)
 */
export function normalizeActivityType(activityType: string): string {
  return activityType.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
}

/**
 * Verifica se todos os campos obrigatórios estão preenchidos
 */
export function validateSyncedFields(
  activityType: string, 
  fields: Record<string, any>
): { valid: boolean; missingFields: string[]; filledFields: string[] } {
  const config = ACTIVITY_SYNC_CONFIGS[normalizeActivityType(activityType)];
  
  if (!config) {
    return { valid: false, missingFields: [], filledFields: [] };
  }

  const missingFields: string[] = [];
  const filledFields: string[] = [];

  for (const field of config.fields) {
    const value = fields[field.formDataName] || fields[field.schemaName];
    if (value !== undefined && value !== null && value !== '') {
      filledFields.push(field.displayLabel);
    } else {
      missingFields.push(field.displayLabel);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
    filledFields
  };
}

/**
 * Mescla dados existentes com novos campos gerados, priorizando novos
 */
export function mergeGeneratedFields(
  activityType: string,
  existingData: Record<string, any>,
  generatedFields: Record<string, any>
): Record<string, any> {
  const syncedGenerated = syncSchemaToFormData(activityType, generatedFields);
  
  const merged = {
    ...existingData,
    ...syncedGenerated
  };

  console.log(`%c🔀 [ACTIVITY-SYNC] Merge para ${activityType}:`, 
    'background: #9C27B0; color: white; padding: 2px 5px; border-radius: 3px;',
    { existing: existingData, generated: generatedFields, merged }
  );

  return merged;
}

/**
 * Gera um relatório de debug mostrando o estado dos campos
 */
export function generateFieldSyncDebugReport(
  activityType: string,
  fields: Record<string, any>
): string {
  const config = ACTIVITY_SYNC_CONFIGS[normalizeActivityType(activityType)];
  
  if (!config) {
    return `[DEBUG] Tipo de atividade "${activityType}" não mapeado`;
  }

  const lines: string[] = [
    `═══ SYNC DEBUG: ${config.displayName} ═══`,
    ``
  ];

  for (const field of config.fields) {
    const schemaValue = fields[field.schemaName];
    const formDataValue = fields[field.formDataName];
    const value = schemaValue ?? formDataValue;
    const status = value ? '✅' : '❌';
    const preview = value ? String(value).substring(0, 40) + (String(value).length > 40 ? '...' : '') : '(vazio)';
    
    lines.push(`${status} ${field.displayLabel}: ${preview}`);
  }

  return lines.join('\n');
}

export default {
  ACTIVITY_SYNC_CONFIGS,
  syncSchemaToFormData,
  syncFormDataToSchema,
  getFieldsForActivity,
  getActivitySyncConfig,
  normalizeActivityType,
  validateSyncedFields,
  mergeGeneratedFields,
  generateFieldSyncDebugReport
};

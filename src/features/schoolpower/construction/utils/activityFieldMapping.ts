/**
 * Mapeamento centralizado de campos para todas as atividades
 * Este arquivo define como os dados gerados pela IA são mapeados para os campos do formulário
 */

export interface ActivityFieldMapping {
  [activityId: string]: {
    [displayName: string]: string; // displayName -> formDataKey
  };
}

/**
 * Mapeamento de campos personalizados por tipo de atividade
 * Usado ao salvar atividades para exibir os custom fields corretos
 */
export const ACTIVITY_FIELD_MAPPINGS: ActivityFieldMapping = {
  'lista-exercicios': {
    'Número de Questões': 'numberOfQuestions',
    'Tema': 'theme',
    'Disciplina': 'subject',
    'Ano de Escolaridade': 'schoolYear',
    'Nível de Dificuldade': 'difficultyLevel',
    'Modelo de Questões': 'questionModel',
    'Fontes': 'sources',
    'Objetivos': 'objectives',
    'Materiais': 'materials',
    'Instruções': 'instructions',
    'Critérios de Avaliação': 'evaluation'
  },
  'plano-aula': {
    'Disciplina / Área de conhecimento': 'subject',
    'Ano / Série': 'schoolYear',
    'Tema ou Assunto da aula': 'theme',
    'Objetivo de aprendizagem da aula': 'objectives',
    'Nível de Dificuldade': 'difficultyLevel',
    'Número de Questões': 'numberOfQuestions',
    'Formato': 'questionModel'
  },
  'sequencia-didatica': {
    'Título / Tema / Assunto': 'tituloTemaAssunto',
    'Ano / Série': 'anoSerie',
    'Disciplina': 'disciplina',
    'Público-alvo': 'publicoAlvo',
    'Objetivos de Aprendizagem': 'objetivosAprendizagem',
    'Quantidade de Aulas': 'quantidadeAulas',
    'Quantidade de Diagnósticos': 'quantidadeDiagnosticos',
    'Quantidade de Avaliações': 'quantidadeAvaliacoes',
    'Cronograma': 'cronograma'
  },
  'quadro-interativo': {
    'Disciplina / Área de conhecimento': 'subject',
    'Ano / Série': 'schoolYear',
    'Tema ou Assunto da aula': 'theme',
    'Objetivo de aprendizagem da aula': 'objectives',
    'Nível de Dificuldade': 'difficultyLevel',
    'Atividade mostrada': 'quadroInterativoCampoEspecifico'
  },
  'flash-cards': {
    'Tema dos Flash Cards': 'theme',
    'Tópicos Principais': 'topicos',
    'Número de Flash Cards': 'numberOfFlashcards',
    'Contexto de Uso': 'context'
  },
  'mapa-mental': {
    'Tema Central': 'centralTheme',
    'Categorias Principais': 'mainCategories',
    'Objetivo Geral': 'generalObjective',
    'Critérios de Avaliação': 'evaluationCriteria'
  },
  'tese-redacao': {
    'Tema da Redação': 'temaRedacao',
    'Objetivos': 'objetivo',
    'Nível de Dificuldade': 'nivelDificuldade',
    'Competências ENEM': 'competenciasENEM',
    'Contexto Adicional': 'contextoAdicional'
  }
};

/**
 * Obtém os custom fields de uma atividade formatados para exibição
 */
export function getActivityCustomFields(activityId: string, formData: any): Record<string, any> {
  const mapping = ACTIVITY_FIELD_MAPPINGS[activityId];
  if (!mapping) {
    console.warn(`[FIELD-MAPPING] Nenhum mapeamento encontrado para: ${activityId}`);
    return {};
  }

  const customFields: Record<string, any> = {};
  
  Object.entries(mapping).forEach(([displayName, formDataKey]) => {
    if (formData[formDataKey] !== undefined && formData[formDataKey] !== null && formData[formDataKey] !== '') {
      customFields[displayName] = formData[formDataKey];
    }
  });

  console.log(`%c🗺️ [FIELD-MAPPING] Custom fields gerados para ${activityId}:`, 'color: #00BCD4; font-weight: bold;', customFields);
  
  return customFields;
}

/**
 * Mapeia dados da IA para o formato do formData
 * Converte nomes de campos da IA para as chaves esperadas pelo formulário
 */
export function mapAIDataToFormData(activityId: string, aiData: any): any {
  console.log(`%c🔄 [FIELD-MAPPING] Mapeando dados da IA para ${activityId}`, 'color: #00BCD4; font-weight: bold;', aiData);

  const mapping = ACTIVITY_FIELD_MAPPINGS[activityId];
  if (!mapping) {
    console.warn(`[FIELD-MAPPING] Sem mapeamento específico, usando dados brutos`);
    return aiData;
  }

  const mapped: any = { ...aiData };

  // Mapear campos reversos (displayName -> formDataKey)
  Object.entries(mapping).forEach(([displayName, formDataKey]) => {
    if (aiData[displayName] !== undefined) {
      mapped[formDataKey] = aiData[displayName];
    }
  });

  console.log(`%c✅ [FIELD-MAPPING] Dados mapeados:`, 'color: #00BCD4;', mapped);
  
  return mapped;
}

export interface QuadroInterativoFields {
  recursos: string;
  conteudo: string;
  interatividade: string;
  design: string;
  objetivo: string;
  avaliacao: string;
  // Campos específicos do modal de edição
  title: string;
  description: string;
  subject: string;
  theme: string;
  schoolYear: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
  materials: string;
  instructions: string;
  evaluation: string;
  timeLimit: string;
  context: string;
}

export const quadroInterativoFieldMapping: Record<string, keyof QuadroInterativoFields> = {
  // Mapeamentos originais
  'Recursos': 'recursos',
  'Conteúdo': 'conteudo', 
  'Interatividade': 'interatividade',
  'Design': 'design',
  'Objetivo': 'objetivo',
  'Avaliação': 'avaliacao',

  // Mapeamentos específicos para o modal
  'title': 'title',
  'description': 'description',
  'subject': 'subject',
  'theme': 'theme',
  'schoolYear': 'schoolYear',
  'objectives': 'objectives',
  'difficultyLevel': 'difficultyLevel',
  'quadroInterativoCampoEspecifico': 'quadroInterativoCampoEspecifico',
  'materials': 'materials',
  'instructions': 'instructions',
  'evaluation': 'evaluation',
  'timeLimit': 'timeLimit',
  'context': 'context',

  // Mapeamentos alternativos para campos do Action Plan
  'Disciplina / Área de conhecimento': 'subject',
  'Disciplina': 'subject',
  'Área de conhecimento': 'subject',
  'Componente Curricular': 'subject',
  'Matéria': 'subject',

  'Ano / Série': 'schoolYear',
  'Ano': 'schoolYear', 
  'Série': 'schoolYear',
  'Ano de Escolaridade': 'schoolYear',
  'Público-Alvo': 'schoolYear',

  'Tema ou Assunto da aula': 'theme',
  'Tema': 'theme',
  'Assunto': 'theme',
  'Tópico': 'theme',
  'Tema Central': 'theme',

  'Objetivo de aprendizagem da aula': 'objectives',
  'Objetivos': 'objectives',
  'Objetivo Principal': 'objectives',
  'Objetivos de Aprendizagem': 'objectives',

  'Nível de Dificuldade': 'difficultyLevel',
  'Dificuldade': 'difficultyLevel',
  'Nível': 'difficultyLevel',
  'Complexidade': 'difficultyLevel',

  'Atividade mostrada': 'quadroInterativoCampoEspecifico',
  'Atividade': 'quadroInterativoCampoEspecifico',
  'Atividades': 'quadroInterativoCampoEspecifico',
  'Tipo de Atividade': 'quadroInterativoCampoEspecifico',
  'Recursos Interativos': 'quadroInterativoCampoEspecifico',

  'Materiais': 'materials',
  'Materiais Necessários': 'materials',
  'Recursos Visuais': 'materials',

  'Instruções': 'instructions',
  'Metodologia': 'instructions',
  'Como Fazer': 'instructions',
  'Procedimentos': 'instructions',

  'Critérios de Avaliação': 'evaluation',
  'Critérios': 'evaluation',
  'Como Avaliar': 'evaluation',

  'Tempo': 'timeLimit',
  'Duração': 'timeLimit',
  'Tempo Estimado': 'timeLimit',
  'Tempo da Atividade': 'timeLimit',

  'Contexto': 'context',
  'Aplicação': 'context',
  'Onde Usar': 'context',
  'Contexto de Aplicação': 'context'
};

// Mapeamento reverso para facilitar a busca
export const reverseQuadroInterativoFieldMapping: Record<keyof QuadroInterativoFields, string[]> = {
  recursos: ['Recursos', 'Materiais', 'Materiais Necessários'],
  conteudo: ['Conteúdo', 'Instruções', 'Metodologia'],
  interatividade: ['Interatividade', 'Atividade mostrada', 'Recursos Interativos'],
  design: ['Design', 'Nível de Dificuldade', 'Complexidade'],
  objetivo: ['Objetivo', 'Objetivos', 'Objetivo de aprendizagem da aula'],
  avaliacao: ['Avaliação', 'Critérios', 'Critérios de Avaliação'],
  title: ['title', 'Título'],
  description: ['description', 'Descrição'],
  subject: ['subject', 'Disciplina', 'Disciplina / Área de conhecimento'],
  theme: ['theme', 'Tema', 'Tema ou Assunto da aula'],
  schoolYear: ['schoolYear', 'Ano / Série', 'Ano de Escolaridade'],
  objectives: ['objectives', 'Objetivos', 'Objetivo de aprendizagem da aula'],
  difficultyLevel: ['difficultyLevel', 'Nível de Dificuldade', 'Dificuldade'],
  quadroInterativoCampoEspecifico: ['quadroInterativoCampoEspecifico', 'Atividade mostrada', 'Atividade'],
  materials: ['materials', 'Materiais', 'Recursos'],
  instructions: ['instructions', 'Instruções', 'Metodologia'],
  evaluation: ['evaluation', 'Avaliação', 'Critérios de Avaliação'],
  timeLimit: ['timeLimit', 'Tempo', 'Duração'],
  context: ['context', 'Contexto', 'Aplicação']
};

// Função utilitária para encontrar o campo correto baseado no valor
export function findFieldByValue(value: string, targetField: keyof QuadroInterativoFields): boolean {
  const possibleKeys = reverseQuadroInterativoFieldMapping[targetField] || [];
  return possibleKeys.some(key => quadroInterativoFieldMapping[key] === targetField);
}

// Função para validar se um campo é válido para Quadro Interativo
export function isValidQuadroInterativoField(fieldKey: string): boolean {
  return fieldKey in quadroInterativoFieldMapping;
}

// Campos obrigatórios para Quadro Interativo
export const requiredQuadroInterativoFields: (keyof QuadroInterativoFields)[] = [
  'subject',
  'schoolYear', 
  'theme',
  'objectives',
  'difficultyLevel',
  'quadroInterativoCampoEspecifico'
];

// Função para validar se todos os campos obrigatórios estão preenchidos
export function validateRequiredFields(data: Partial<QuadroInterativoFields>): boolean {
  return requiredQuadroInterativoFields.every(field => 
    data[field] && typeof data[field] === 'string' && data[field]!.trim().length > 0
  );
}

// Atualizar mapeamento de campos do Quadro Interativo para corresponder exatamente aos nomes dos campos
export const quadroInterativoFieldMappingUpdate: Record<keyof QuadroInterativoFields, string[]> = {
  recursos: ['Recursos', 'Materiais', 'Materiais Necessários'],
  conteudo: ['Conteúdo', 'Instruções', 'Metodologia'],
  interatividade: ['Interatividade', 'Atividade mostrada', 'Recursos Interativos'],
  design: ['Design', 'Nível de Dificuldade', 'Complexidade'],
  objetivo: ['Objetivo', 'Objetivos', 'Objetivo de aprendizagem da aula'],
  avaliacao: ['Avaliação', 'Critérios', 'Critérios de Avaliação'],
  title: ['title', 'Título'],
  description: ['description', 'Descrição'],
  subject: ['Disciplina / Área de conhecimento', 'disciplina', 'Disciplina'],
  schoolYear: ['Ano / Série', 'anoSerie', 'Ano de Escolaridade'],
  theme: ['Tema ou Assunto da aula', 'tema', 'Tema'],
  objectives: ['Objetivo de aprendizagem da aula', 'objetivos', 'Objetivos'],
  difficultyLevel: ['Nível de Dificuldade', 'nivelDificuldade', 'dificuldade'],
  quadroInterativoCampoEspecifico: ['Atividade mostrada', 'atividadeMostrada', 'quadroInterativoCampoEspecifico', 'Campo Específico do Quadro Interativo'],
  materials: ['Materiais', 'Recursos'],
  instructions: ['Instruções', 'Metodologia'],
  evaluation: ['Avaliação', 'Critérios de Avaliação'],
  timeLimit: ['Tempo', 'Duração'],
  context: ['Contexto', 'Aplicação']
};

// Função para transformar dados do plano de ação em campos do Quadro Interativo
export function transformActionPlanToQuadroInterativoFields(actionPlanData: any): any {
  const customFields = actionPlanData.customFields || {};

  console.log('🔄 Transformando dados para Quadro Interativo:', { actionPlanData, customFields });

  const transformed = {
    title: actionPlanData.personalizedTitle || actionPlanData.title || '',
    description: actionPlanData.personalizedDescription || actionPlanData.description || '',
    subject: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.subject) || 'Matemática',
    schoolYear: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.schoolYear) || '6º Ano',
    theme: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.theme) || actionPlanData.title || 'Tema da Aula',
    objectives: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.objectives) || actionPlanData.description || 'Objetivos de aprendizagem',
    difficultyLevel: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.difficultyLevel) || 'Intermediário',
    quadroInterativoCampoEspecifico: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.quadroInterativoCampoEspecifico) || 'Atividade interativa no quadro',
    materials: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.materials) || 'Quadro digital, computador',
    instructions: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.instructions) || '',
    evaluation: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.evaluation) || '',
    timeLimit: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.timeLimit) || '50 minutos',
    context: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.context) || ''
  };

  console.log('✅ Dados transformados:', transformed);
  return transformed;
}

function getFieldValue(customFields: any, possibleKeys: string[]): string {
  for (const key of possibleKeys) {
    if (customFields[key]) {
      return customFields[key];
    }
  }
  return '';
}

// Configuração de campos para o formulário de edição (renomeado para evitar conflito)
export const quadroInterativoFormFieldsConfig = {
  'Disciplina / Área de conhecimento': {
    type: 'text',
    label: 'Disciplina / Área de conhecimento',
    placeholder: 'Ex: Língua Portuguesa',
    required: true
  },
  'Ano / Série': {
    type: 'text',
    label: 'Ano / Série',
    placeholder: 'Ex: 3º Bimestre',
    required: true
  },
  'Tema ou Assunto da aula': {
    type: 'text',
    label: 'Tema ou Assunto da aula',
    placeholder: 'Ex: Substantivos Próprios e Verbos',
    required: true
  },
  'Objetivo de aprendizagem da aula': {
    type: 'textarea',
    label: 'Objetivo de aprendizagem da aula',
    placeholder: 'Descreva os objetivos de aprendizagem',
    required: true
  },
  'Nível de Dificuldade': {
    type: 'select',
    label: 'Nível de Dificuldade',
    options: ['Fácil', 'Médio', 'Difícil'],
    required: false
  },
  'Atividade mostrada': {
    type: 'text',
    label: 'Atividade mostrada',
    placeholder: 'Ex: lista-exercicios',
    required: false
  }
};

export default quadroInterativoFormFieldsConfig;
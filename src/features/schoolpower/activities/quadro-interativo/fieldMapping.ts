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
  'Tipo de Interação': 'quadroInterativoCampoEspecifico',

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
  quadroInterativoCampoEspecifico: ['quadroInterativoCampoEspecifico', 'Atividade mostrada', 'Atividade', 'Tipo de Interação'],
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
  subject: ['Disciplina / Área de conhecimento', 'disciplina', 'Disciplina'],
  schoolYear: ['Ano / Série', 'anoSerie', 'Ano de Escolaridade'],
  theme: ['Tema ou Assunto da aula', 'tema', 'Tema'],
  objectives: ['Objetivo de aprendizagem da aula', 'objetivos', 'Objetivos'],
  difficultyLevel: ['Nível de Dificuldade', 'nivelDificuldade', 'dificuldade'],
  quadroInterativoCampoEspecifico: ['Atividade mostrada', 'atividadeMostrada', 'quadroInterativoCampoEspecifico', 'Campo Específico do Quadro Interativo', 'Tipo de Interação'],
  recursos: ['Recursos', 'Materiais', 'Materiais Necessários'],
  conteudo: ['Conteúdo', 'Instruções', 'Metodologia'],
  interatividade: ['Interatividade', 'Atividade mostrada', 'Recursos Interativos'],
  design: ['Design', 'Nível de Dificuldade', 'Complexidade'],
  objetivo: ['Objetivo', 'Objetivos', 'Objetivo de aprendizagem da aula'],
  avaliacao: ['Avaliação', 'Critérios', 'Critérios de Avaliação'],
  title: ['title', 'Título'],
  description: ['description', 'Descrição'],
  materials: [
    'materials',
    'material',
    'materiais',
    'materiaisNecessarios',
    'recursos',
    'recursos_necessarios'
  ],
  instructions: ['instructions', 'Instruções', 'Metodologia'],
  evaluation: ['evaluation', 'Avaliação', 'Critérios de Avaliação'],
  timeLimit: ['timeLimit', 'Tempo', 'Duração'],
  context: ['context', 'Contexto', 'Aplicação']
};

// Função para mapear dados do Action Plan para campos do formulário
export function mapQuadroInterativoFields(actionPlanData: any): any {
  const customFields = actionPlanData.customFields || {};

  return {
    title: actionPlanData.personalizedTitle || actionPlanData.title || '',
    description: actionPlanData.personalizedDescription || actionPlanData.description || '',
    subject: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.subject) || 'Matemática',
    schoolYear: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.schoolYear) || 'Ex: 6º Ano, 7º Ano, 8º Ano',
    theme: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.theme) || actionPlanData.title || 'Ex: Substantivos e Verbos, Frações, Sistema Solar',
    objectives: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.objectives) || actionPlanData.description || '',
    difficultyLevel: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.difficultyLevel) || 'Ex: Básico, Intermediário, Avançado',
    quadroInterativoCampoEspecifico: getFieldValue(customFields, quadroInterativoFieldMappingUpdate.quadroInterativoCampoEspecifico) || 'Ex: Jogo de arrastar e soltar, Quiz interativo, Mapa mental',
    materials: normalizeMaterials(getFieldValue(customFields, ['Materiais', 'Recursos'])),
    instructions: getFieldValue(customFields, ['Instruções', 'Metodologia']),
    evaluation: getFieldValue(customFields, ['Avaliação', 'Critérios de Avaliação']),
    timeLimit: getFieldValue(customFields, ['Tempo', 'Duração']),
    context: getFieldValue(customFields, ['Contexto', 'Aplicação'])
  };
}

function getFieldValue(customFields: any, possibleKeys: string[]): string {
  for (const key of possibleKeys) {
    if (customFields[key]) {
      return customFields[key];
    }
  }
  return '';
}

/**
 * Sanitiza texto para evitar problemas de JSON
 */
function sanitizeText(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Valida se o valor é seguro para uso
 */
function isValidValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

export function prepareQuadroInterativoDataForModal(activity: any) {
  console.log('🎯 Preparando dados do Quadro Interativo para o modal:', activity);

  try {
    const customFields = activity.customFields || {};

    // Sanitizar e validar cada campo
    const safeTitle = sanitizeText(activity.personalizedTitle || activity.title);
    const safeDescription = sanitizeText(activity.personalizedDescription || activity.description);

    const formData = {
      subject: isValidValue(customFields['Disciplina']) ? sanitizeText(customFields['Disciplina']) : 'Matemática',
      schoolYear: isValidValue(customFields['Ano / Série']) ? sanitizeText(customFields['Ano / Série']) : 'Ex: 6º Ano, 7º Ano, 8º Ano',
      theme: safeTitle || 'Ex: Substantivos e Verbos, Frações, Sistema Solar',
      objectives: isValidValue(customFields['Objetivos de Aprendizagem']) ? sanitizeText(customFields['Objetivos de Aprendizagem']) : '',
      difficultyLevel: isValidValue(customFields['Nível de Dificuldade']) ? sanitizeText(customFields['Nível de Dificuldade']) : 'Ex: Básico, Intermediário, Avançado',
      quadroInterativoCampoEspecifico: isValidValue(customFields['Tipo de Interação']) ? sanitizeText(customFields['Tipo de Interação']) : 'Ex: Jogo de arrastar e soltar, Quiz interativo, Mapa mental',
      bnccCompetencias: isValidValue(customFields['BNCC / Competências']) ? sanitizeText(customFields['BNCC / Competências']) : '',
      publico: isValidValue(customFields['Público-alvo']) ? sanitizeText(customFields['Público-alvo']) : '',
      materials: normalizeMaterials(customFields['Materiais'] || customFields['Recursos'])
    };

    // Validar que nenhum campo contém valores problemáticos
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string' && formData[key].includes('undefined')) {
        formData[key] = '';
      }
    });

    console.log('✅ FormData do Quadro Interativo preparado e validado:', formData);
    return formData;

  } catch (error) {
    console.error('❌ Erro ao preparar dados do Quadro Interativo:', error);

    // Retornar dados padrão seguros em caso de erro
    return {
      subject: 'Matemática',
      schoolYear: 'Ex: 6º Ano, 7º Ano, 8º Ano',
      theme: 'Ex: Substantivos e Verbos, Frações, Sistema Solar',
      objectives: '',
      difficultyLevel: 'Ex: Básico, Intermediário, Avançado',
      quadroInterativoCampoEspecifico: 'Ex: Jogo de arrastar e soltar, Quiz interativo, Mapa mental',
      bnccCompetencias: '',
      publico: '',
      materials: ''
    };
  }
}

// Função para normalizar o campo materials
export const normalizeMaterials = (materials: any): string => {
  if (!materials) return '';

  if (typeof materials === 'string') {
    return materials;
  }

  if (Array.isArray(materials)) {
    return materials.map(item =>
      typeof item === 'string' ? item : String(item)
    ).join('\n');
  }

  return String(materials);
};
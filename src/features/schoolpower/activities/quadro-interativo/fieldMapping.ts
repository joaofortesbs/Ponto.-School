
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

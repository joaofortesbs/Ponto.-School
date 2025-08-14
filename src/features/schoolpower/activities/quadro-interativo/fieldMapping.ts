export interface QuadroInterativoFields {
  recursos: string;
  conteudo: string;
  interatividade: string;
  design: string;
  objetivo: string;
  avaliacao: string;
  // Campos adicionais para o modal de edição
  title: string;
  description: string;
  objective: string;
  materials: string;
  instructions: string;
  evaluationCriteria: string;
}

export const quadroInterativoFieldMapping: Record<string, keyof QuadroInterativoFields> = {
  'Recursos': 'recursos',
  'Conteúdo': 'conteudo',
  'Interatividade': 'interatividade',
  'Design': 'design',
  'Objetivo': 'objetivo',
  'Avaliação': 'avaliacao',
  // Mapeamento para campos do modal de edição
  'title': 'title',
  'description': 'description',
  'objective': 'objective',
  'materials': 'materials',
  'instructions': 'instructions',
  'evaluationCriteria': 'evaluationCriteria'
};
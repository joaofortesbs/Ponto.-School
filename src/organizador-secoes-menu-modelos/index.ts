
// Organizador de Seções - Central
// Este arquivo exporta todos os organizadores de seções dos modelos

export { professorSections, type ProfessorSection } from './professor';
export { alunoSections, type AlunoSection } from './aluno';
export { coordenadorSections, type CoordenadorSection } from './coordenador';

// Tipos unificados
export type UserModel = 'professor' | 'aluno' | 'coordenador';

export interface SectionConfig {
  path: string;
  component: string;
  interface: string;
  status?: 'active' | 'construction' | 'pending';
}

// Função utilitária para obter seções por modelo
export const getSectionsByModel = (model: UserModel) => {
  switch (model) {
    case 'professor':
      return require('./professor').professorSections;
    case 'aluno':
      return require('./aluno').alunoSections;
    case 'coordenador':
      return require('./coordenador').coordenadorSections;
    default:
      return null;
  }
};

// Função para verificar se uma seção está em construção
export const isSectionUnderConstruction = (model: UserModel, sectionKey: string): boolean => {
  const sections = getSectionsByModel(model);
  return sections?.[sectionKey]?.status === 'construction';
};

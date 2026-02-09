export type TextActivityCategoryId = 
  | 'avaliacoes'
  | 'jogos_educativos'
  | 'organizadores'
  | 'escrita_producao'
  | 'planejamento'
  | 'comunicacao'
  | 'diferenciacao'
  | 'engajamento';

export interface TextActivityTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: TextActivityCategoryId;
  icone: string;
  cor: string;
  keywords: string[];
  promptTemplate: string;
  secoesEsperadas: string[];
  exemploUso: string;
}

export interface TextActivityCategory {
  id: TextActivityCategoryId;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  templates: TextActivityTemplate[];
}

export interface AutoEvolvedTemplate {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  keywords: string[];
  promptTemplate: string;
  secoesEsperadas: string[];
  criadoEm: number;
  usosCount: number;
  origemPrompt: string;
}

export interface TextActivityRouterResult {
  origem: 'interativa' | 'template_textual' | 'auto_gerada' | 'documento_livre';
  template: TextActivityTemplate | AutoEvolvedTemplate | null;
  templateId: string | null;
  categoria: string | null;
  metadata: {
    motivo: string;
    confianca: 'alta' | 'media' | 'baixa';
    atividadeInterativaId?: string;
  };
}

export const INTERACTIVE_ACTIVITY_TYPES = [
  { id: 'lista-exercicios', keywords: ['lista de exercícios', 'lista de exercicio', 'exercícios', 'exercicio'] },
  { id: 'plano-aula', keywords: ['plano de aula'] },
  { id: 'sequencia-didatica', keywords: ['sequência didática', 'sequencia didatica'] },
  { id: 'quiz-interativo', keywords: ['quiz', 'quiz interativo'] },
  { id: 'flash-cards', keywords: ['flash card', 'flash cards', 'flashcard', 'flashcards'] },
  { id: 'tese-redacao', keywords: ['tese da redação', 'tese de redação', 'tese redação', 'tese redacao'] },
] as const;

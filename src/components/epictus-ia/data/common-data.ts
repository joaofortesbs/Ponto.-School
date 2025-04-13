
/**
 * Common data structures used across Epictus IA components
 */

export const notifications = [
  { title: "Nova sugestão de estudo disponível", time: "Agora", read: false },
  { title: "Resposta ao seu questionamento", time: "2h atrás", read: true },
  { title: "Novo conteúdo recomendado", time: "Ontem", read: false },
  { title: "Seu resumo foi gerado", time: "Ontem", read: true },
];

export const recentInteractions = [
  {
    title: "Plano de Estudos ENEM",
    preview:
      "Criação de um plano personalizado para o ENEM com foco em ciências da natureza e matemática...",
    timestamp: "Hoje",
    rating: 5,
  },
  {
    title: "Resumo de Física",
    preview:
      "Resumo sobre termodinâmica e leis da física quântica para revisão...",
    timestamp: "Ontem",
    rating: 4,
  },
  {
    title: "Dúvidas de Matemática",
    preview:
      "Resolução de exercícios sobre funções trigonométricas e cálculo diferencial...",
    timestamp: "3 dias atrás",
    rating: 5,
  },
];

export const defaultPrompts = [
  {
    title: "Resumir conteúdo",
    description: "Crie um resumo conciso do material de estudo",
    category: "resumo",
  },
  {
    title: "Explicar conceito",
    description: "Explique um conceito complexo de forma simples",
    category: "explicação",
  },
  {
    title: "Gerar questões",
    description: "Crie questões de prática baseadas no material",
    category: "prática",
  },
  {
    title: "Plano de estudos",
    description: "Desenvolva um plano de estudos personalizado",
    category: "planejamento",
  },
];

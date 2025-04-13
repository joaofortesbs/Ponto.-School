
/**
 * Dados comuns utilizados nos componentes de EpictusIA
 */

// Tipos de funcionalidades disponíveis
export type FeatureType = 
  | "resumos" 
  | "planos_estudo" 
  | "exercicios" 
  | "explicacoes"
  | "conversacao" 
  | "exploracao" 
  | "desempenho";

// Configuração de ícones e labels para funcionalidades
export const featureConfig: Record<FeatureType, {
  label: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  gradient: string;
}> = {
  resumos: {
    label: "Resumos Inteligentes",
    description: "Crie resumos personalizados de qualquer conteúdo",
    icon: "FileText",
    path: "/epictus-ia/resumos",
    color: "text-blue-500",
    gradient: "from-blue-500 to-blue-600"
  },
  planos_estudo: {
    label: "Planos de Estudo",
    description: "Organize seu tempo com planos personalizados",
    icon: "Calendar",
    path: "/epictus-ia/planos-estudo",
    color: "text-purple-500",
    gradient: "from-purple-500 to-purple-600"
  },
  exercicios: {
    label: "Exercícios",
    description: "Pratique com exercícios personalizados",
    icon: "CheckSquare",
    path: "/epictus-ia/exercicios",
    color: "text-green-500",
    gradient: "from-green-500 to-green-600"
  },
  explicacoes: {
    label: "Explicações",
    description: "Receba explicações detalhadas sobre qualquer tema",
    icon: "BookOpen",
    path: "/epictus-ia/explicacoes",
    color: "text-amber-500",
    gradient: "from-amber-500 to-amber-600"
  },
  conversacao: {
    label: "Conversa",
    description: "Converse com a IA para tirar suas dúvidas",
    icon: "MessageSquare",
    path: "/epictus-ia/chat",
    color: "text-red-500",
    gradient: "from-red-500 to-red-600"
  },
  exploracao: {
    label: "Exploração",
    description: "Explore novos temas de forma interativa",
    icon: "Compass",
    path: "/epictus-ia/exploracao",
    color: "text-teal-500",
    gradient: "from-teal-500 to-teal-600"
  },
  desempenho: {
    label: "Desempenho",
    description: "Analise seu progresso e desempenho",
    icon: "BarChart3",
    path: "/epictus-ia/desempenho",
    color: "text-indigo-500",
    gradient: "from-indigo-500 to-indigo-600"
  }
};

// Exemplos de histórico de interação
export const interactionHistory = [
  {
    id: "1",
    title: "Resumo de Física Quântica",
    type: "resumos",
    date: "Hoje, 10:30",
    preview: "Resumo abordando os princípios da mecânica quântica..."
  },
  {
    id: "2",
    title: "Exercícios de Cálculo Diferencial",
    type: "exercicios",
    date: "Ontem, 15:45",
    preview: "20 exercícios de derivadas e integrais com resoluções passo a passo..."
  },
  {
    id: "3",
    title: "Plano de Estudos para o ENEM",
    type: "planos_estudo",
    date: "22/06/2024",
    preview: "Plano de 90 dias para organizar seus estudos para o ENEM..."
  },
  {
    id: "4",
    title: "Dúvidas sobre Ácidos e Bases",
    type: "conversacao",
    date: "20/06/2024",
    preview: "Conversa sobre conceitos de pH, pOH e reações de neutralização..."
  }
];

// Sugestões populares para rápido acesso
export const popularSuggestions = [
  "Resumo sobre Segunda Guerra Mundial",
  "Como funciona fotossíntese?",
  "Exercícios de equações do 2º grau",
  "Plano de estudos para Matemática",
  "Explique o que é DNA",
  "Como priorizar matérias para vestibular?",
  "Resumo de Romeo e Julieta"
];

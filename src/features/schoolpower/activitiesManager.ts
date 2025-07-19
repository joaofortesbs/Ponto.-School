
/**
 * School Power Activities Manager
 * Central management system for all School Power functionalities and APIs
 * 
 * This file serves as the Single Source of Truth (SSOT) for:
 * - Activity definitions and metadata
 * - API configurations and pipelines
 * - Feature flags and enablement status
 * - Scalable activity registration system
 */

// API Key Configuration
export const GEMINI_API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';

// Type definitions for School Power activities
export interface SchoolPowerActivity {
  /** Unique identifier for the activity */
  id: string;
  
  /** Display name of the activity */
  name: string;
  
  /** Short description of what the activity does */
  description: string;
  
  /** Tags for categorization and filtering */
  tags: string[];
  
  /** API key to be used for this activity */
  apiKey: string;
  
  /** Type of API service being used */
  apiType: "gemini" | "openai" | "custom";
  
  /** Optional specific prompt or pipeline configuration */
  pipelinePrompt?: string;
  
  /** Whether this activity is currently enabled */
  enabled: boolean;
}

/**
 * Registry of all School Power activities
 * Add new activities here to make them available throughout the application
 */
export const schoolPowerActivities: SchoolPowerActivity[] = [
  {
    id: "prova-interativa",
    name: "Prova Interativa",
    description: "Gera uma prova interativa com correção automática.",
    tags: ["ponto-ativo", "avaliacao"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Crie uma prova interativa para o seguinte tema e nível de ensino. Inclua questões de múltipla escolha, verdadeiro/falso e questões dissertativas. Forneça gabarito e explicações detalhadas para cada resposta.",
    enabled: true,
  },
  {
    id: "resumo-inteligente",
    name: "Resumo Inteligente",
    description: "Cria resumos otimizados de conteúdos educacionais.",
    tags: ["ponto-ativo", "estudo"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Crie um resumo inteligente e estruturado do seguinte conteúdo. Organize em tópicos principais, subtópicos e pontos-chave. Use formatação clara e inclua exemplos quando necessário.",
    enabled: true,
  },
  {
    id: "plano-estudo-personalizado",
    name: "Plano de Estudo Personalizado",
    description: "Gera cronogramas de estudo adaptados ao perfil do aluno.",
    tags: ["ponto-ativo", "planejamento"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Crie um plano de estudos personalizado baseado nos seguintes parâmetros: matérias, tempo disponível, objetivos e nível de conhecimento. Organize por semanas e inclua metas específicas.",
    enabled: true,
  },
  {
    id: "simulado-vestibular",
    name: "Simulado de Vestibular",
    description: "Cria simulados específicos para diferentes vestibulares.",
    tags: ["ponto-ativo", "avaliacao", "vestibular"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Gere um simulado de vestibular com questões no estilo do exame especificado. Inclua questões de diferentes níveis de dificuldade, gabarito comentado e tempo sugerido para resolução.",
    enabled: true,
  },
  {
    id: "mapa-mental",
    name: "Mapa Mental",
    description: "Cria mapas mentais estruturados para organização de conteúdo.",
    tags: ["ponto-ativo", "organizacao"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Crie um mapa mental estruturado para o tema fornecido. Organize hierarquicamente com tópico central, ramificações principais e subtópicos. Use linguagem clara e concisa.",
    enabled: true,
  },
  {
    id: "exercicios-personalizados",
    name: "Exercícios Personalizados",
    description: "Gera listas de exercícios adaptadas ao nível do aluno.",
    tags: ["ponto-ativo", "pratica"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Crie uma lista de exercícios personalizados para o conteúdo e nível especificados. Varie os tipos de questões e inclua diferentes níveis de dificuldade com gabarito detalhado.",
    enabled: true,
  },
  {
    id: "explicacao-interativa",
    name: "Explicação Interativa",
    description: "Fornece explicações detalhadas e interativas de conceitos.",
    tags: ["geral", "ensino"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Explique o conceito solicitado de forma didática e interativa. Use analogias, exemplos práticos e estruture a explicação do básico ao avançado. Inclua perguntas reflexivas.",
    enabled: true,
  },
  {
    id: "correcao-redacao",
    name: "Correção de Redação",
    description: "Analisa e corrige redações com feedback detalhado.",
    tags: ["ponto-ativo", "correcao"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Analise a redação fornecida considerando critérios de correção padrão: estrutura, coesão, coerência, adequação ao tema e domínio da norma culta. Forneça nota e sugestões de melhoria.",
    enabled: true,
  },
  {
    id: "flashcards-inteligentes",
    name: "Flashcards Inteligentes",
    description: "Cria flashcards otimizados para memorização ativa.",
    tags: ["ponto-ativo", "memorizacao"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Crie flashcards inteligentes para o conteúdo fornecido. Cada card deve ter uma pergunta clara na frente e resposta concisa no verso. Foque nos pontos mais importantes.",
    enabled: true,
  },
  {
    id: "cronograma-revisao",
    name: "Cronograma de Revisão",
    description: "Gera cronogramas de revisão baseados na curva do esquecimento.",
    tags: ["ponto-ativo", "revisao"],
    apiKey: GEMINI_API_KEY,
    apiType: "gemini",
    pipelinePrompt: "Crie um cronograma de revisão otimizado usando princípios da curva do esquecimento. Distribua as revisões em intervalos crescentes para maximizar a retenção.",
    enabled: true,
  }
];

/**
 * Utility Functions
 */

/**
 * Finds a School Power activity by its unique ID
 * @param id - The unique identifier of the activity
 * @returns The activity object if found, undefined otherwise
 */
export function getSchoolPowerActivityById(id: string): SchoolPowerActivity | undefined {
  return schoolPowerActivities.find(activity => activity.id === id);
}

/**
 * Filters School Power activities by tag
 * @param tag - The tag to filter by (e.g., "ponto-ativo", "geral", "avaliacao")
 * @returns Array of activities that include the specified tag
 */
export function listSchoolPowerActivitiesByTag(tag: string): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => 
    activity.tags.includes(tag) && activity.enabled
  );
}

/**
 * Gets all enabled School Power activities
 * @returns Array of all currently enabled activities
 */
export function getEnabledSchoolPowerActivities(): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => activity.enabled);
}

/**
 * Gets all available tags from registered activities
 * @returns Array of unique tags used across all activities
 */
export function getAvailableActivityTags(): string[] {
  const allTags = schoolPowerActivities.flatMap(activity => activity.tags);
  return [...new Set(allTags)];
}

/**
 * Checks if an activity is available and enabled
 * @param id - The unique identifier of the activity
 * @returns Boolean indicating if the activity is available and enabled
 */
export function isActivityEnabled(id: string): boolean {
  const activity = getSchoolPowerActivityById(id);
  return activity?.enabled ?? false;
}

/**
 * Gets activities by API type
 * @param apiType - The type of API to filter by
 * @returns Array of activities using the specified API type
 */
export function getActivitiesByApiType(apiType: SchoolPowerActivity['apiType']): SchoolPowerActivity[] {
  return schoolPowerActivities.filter(activity => 
    activity.apiType === apiType && activity.enabled
  );
}

// Export the main registry as default for easy importing
export default schoolPowerActivities;

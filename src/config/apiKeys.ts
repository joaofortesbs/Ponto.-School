
// Configuração centralizada das chaves de API
export const API_KEYS = {
  GROQ: import.meta.env.VITE_GROQ_API_KEY || '',
  CLAUDE: '',
} as const;

// URLs base das APIs
export const API_URLS = {
  GROQ: 'https://api.groq.com/openai/v1/chat/completions',
  CLAUDE: 'https://api.anthropic.com/v1/messages',
} as const;

// Modelos disponíveis
export const API_MODELS = {
  GROQ: 'llama-3.3-70b-versatile',
} as const;

// Configurações de timeout e retry
export const API_CONFIG = {
  timeout: 30000, // 30 segundos
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
  maxTokens: 2048,
} as const;

// Custos estimados por token (em "School Power" units)
export const TOKEN_COSTS = {
  CLAUDE: 0.002,
  GROQ: 0.0005,
} as const;


// Configuração centralizada das chaves de API
// As chaves são lidas das variáveis de ambiente para maior segurança
export const API_KEYS = {
  GEMINI: import.meta.env.VITE_GEMINI_API_KEY || '',
  CLAUDE: '', // Adicionar quando disponível
} as const;

// Função para obter a chave do Gemini de forma segura
export const getGeminiApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// URLs base das APIs
export const API_URLS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  CLAUDE: 'https://api.anthropic.com/v1/messages',
} as const;

// Configurações de timeout e retry
export const API_CONFIG = {
  timeout: 30000, // 30 segundos
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
} as const;

// Custos estimados por token (em "School Power" units)
export const TOKEN_COSTS = {
  CLAUDE: 0.002, // 0.002 power por token
  GEMINI: 0.001, // 0.001 power por token
} as const;

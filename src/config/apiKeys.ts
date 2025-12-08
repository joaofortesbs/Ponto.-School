
// Configuração centralizada das chaves de API
// NOTA: Migrado de Google Gemini para Mistral via HuggingFace

// API Keys - Use environment variables (nunca hardcode)
export const API_KEYS = {
  HUGGINGFACE: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  GEMINI: '', // DEPRECATED - Migrado para HuggingFace/Mistral
  CLAUDE: '', // Adicionar quando disponível
} as const;

// URLs base das APIs
export const API_URLS = {
  HUGGINGFACE: 'https://api-inference.huggingface.co/models',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', // DEPRECATED
  CLAUDE: 'https://api.anthropic.com/v1/messages',
} as const;

// Modelos disponíveis
export const AI_MODELS = {
  MISTRAL: 'mistralai/Mistral-7B-Instruct-v0.3',
  MISTRAL_NEMO: 'mistralai/Mistral-Nemo-Instruct-2407',
} as const;

// Configurações de timeout e retry
export const API_CONFIG = {
  timeout: 60000, // 60 segundos (HuggingFace pode ser mais lento)
  maxRetries: 3,
  retryDelay: 2000, // 2 segundos
} as const;

// Custos estimados por token (em "School Power" units)
export const TOKEN_COSTS = {
  CLAUDE: 0.002, // 0.002 power por token
  GEMINI: 0.001, // 0.001 power por token (DEPRECATED)
  MISTRAL: 0.0005, // 0.0005 power por token
} as const;

// Provider atual
export const CURRENT_PROVIDER = 'huggingface' as const;

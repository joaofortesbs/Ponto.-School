
// Configuração centralizada das chaves de API
export const API_KEYS = {
  GEMINI: 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4',
  CLAUDE: '', // Adicionar quando disponível
} as const;

// URLs base das APIs
export const API_URLS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  CLAUDE: 'https://api.anthropic.com/v1/messages', // URL da API Claude
} as const;

// Configurações de timeout e retry
export const API_CONFIG = {
  timeout: 30000, // 30 segundos
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
} as const;

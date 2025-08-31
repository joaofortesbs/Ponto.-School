// Configuração centralizada das chaves de API

// Função para validar API Keys
const validateApiKey = (key: string, serviceName: string): string => {
  if (!key) {
    console.warn(`⚠️ API Key para ${serviceName} não configurada`);
    return '';
  }

  if (key.length < 10) {
    console.warn(`⚠️ API Key para ${serviceName} parece inválida (muito curta)`);
  } else {
    console.log(`✅ API Key para ${serviceName} configurada`);
  }

  return key;
};

export const API_KEYS = {
  GEMINI: validateApiKey(import.meta.env.VITE_GEMINI_API_KEY || '', 'Gemini'),
  CLAUDE: validateApiKey(import.meta.env.VITE_CLAUDE_API_KEY || '', 'Claude'),
  OPENAI: validateApiKey(import.meta.env.VITE_OPENAI_API_KEY || '', 'OpenAI')
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
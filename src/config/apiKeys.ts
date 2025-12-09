
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
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  maxTokens: 7000,
} as const;

// Custos estimados por token (em "School Power" units)
export const TOKEN_COSTS = {
  CLAUDE: 0.002,
  GROQ: 0.0005,
} as const;

export function validateGroqApiKey(apiKey: string): boolean {
  const trimmedKey = (apiKey || '').trim();
  return trimmedKey.startsWith('gsk_') && trimmedKey.length > 10;
}

export function isGroqApiKeyConfigured(): boolean {
  return validateGroqApiKey(API_KEYS.GROQ);
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = API_CONFIG.maxRetries,
  initialDelay: number = API_CONFIG.retryDelay
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(API_CONFIG.timeout)
      });
      
      if (response.ok) {
        return response;
      }
      
      if (response.status === 429) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Rate limited. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (response.status >= 500) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Server error ${response.status}. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Request failed: ${lastError.message}. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Request failed after all retries');
}

export interface Flashcard {
  pergunta: string;
  resposta: string;
}

export interface QuizQuestion {
  pergunta: string;
  opcoes: string[];
  resposta: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type ActivityType = 'flashcards' | 'quiz' | 'test' | 'chat';

export interface ProcessedResult {
  type: ActivityType;
  data: Flashcard[] | QuizQuestion[] | string;
  success: boolean;
  error?: string;
}

function getApiBaseUrl(): string {
  const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  if (isProduction) {
    return '';
  }
  return 'http://localhost:3001';
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function generateFlashcards(topic: string, quantity: number = 5): Promise<Flashcard[]> {
  const result = await apiRequest<{ success: boolean; data: Flashcard[]; error?: string }>('/api/groq/flashcards', {
    method: 'POST',
    body: JSON.stringify({ topic, quantity }),
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate flashcards');
  }
  
  return result.data;
}

export async function generateQuiz(topic: string, questions: number = 5): Promise<QuizQuestion[]> {
  const result = await apiRequest<{ success: boolean; data: QuizQuestion[]; error?: string }>('/api/groq/quiz', {
    method: 'POST',
    body: JSON.stringify({ topic, questions }),
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate quiz');
  }
  
  return result.data;
}

export async function generateTest(
  topic: string, 
  questions: number = 10, 
  difficulty: 'fácil' | 'médio' | 'difícil' = 'médio'
): Promise<string> {
  const result = await apiRequest<{ success: boolean; data: string; error?: string }>('/api/groq/test', {
    method: 'POST',
    body: JSON.stringify({ topic, questions, difficulty }),
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate test');
  }
  
  return result.data;
}

export async function chat(
  userMessage: string, 
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const result = await apiRequest<{ success: boolean; data: string; error?: string }>('/api/groq/chat', {
    method: 'POST',
    body: JSON.stringify({ message: userMessage, conversationHistory }),
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to process chat message');
  }
  
  return result.data;
}

export async function processUserPrompt(
  userPrompt: string, 
  activityType?: ActivityType
): Promise<ProcessedResult> {
  try {
    const result = await apiRequest<ProcessedResult>('/api/groq/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: userPrompt, activityType }),
    });
    
    return result;
  } catch (err: any) {
    console.error('Erro ao processar prompt:', err);
    return {
      type: activityType || 'chat',
      data: '',
      success: false,
      error: err.message || 'Erro desconhecido ao processar prompt'
    };
  }
}

export async function testGroqConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await apiRequest<{ success: boolean; message: string }>('/api/groq/test', {
      method: 'GET',
    });
    
    return result;
  } catch (err: any) {
    return { success: false, message: `❌ Erro: ${err.message}` };
  }
}

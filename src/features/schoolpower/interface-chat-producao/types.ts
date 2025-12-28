/**
 * TYPES - Interface de Chat em Produção
 * 
 * Tipagens centralizadas para todo o sistema de chat do School Power
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'file' | 'image' | 'document';
  name: string;
  url?: string;
  size?: number;
}

export interface ExecutionPlan {
  planId: string;
  objetivo: string;
  etapas: ExecutionStep[];
  status: 'aguardando_aprovacao' | 'em_execucao' | 'concluido' | 'erro';
  createdAt: number;
}

export interface ExecutionStep {
  ordem: number;
  descricao: string;
  funcao: string;
  parametros: Record<string, any>;
  justificativa?: string;
  status: 'pendente' | 'executando' | 'concluida' | 'erro';
  resultado?: any;
  erro?: string;
}

export interface WorkingMemoryItem {
  id: string;
  tipo: 'objetivo' | 'descoberta' | 'acao' | 'erro' | 'resultado';
  conteudo: string;
  etapa?: number;
  funcao?: string;
  resultado?: any;
  timestamp: number;
}

export interface ChatSessionState {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  executionPlan: ExecutionPlan | null;
  workingMemory: WorkingMemoryItem[];
  isExecuting: boolean;
  isLoading: boolean;
  currentStep: number | null;
}

export interface ProgressUpdate {
  sessionId: string;
  status: 'iniciando' | 'executando' | 'etapa_concluida' | 'concluido' | 'erro';
  etapaAtual?: number;
  descricao?: string;
  resultado?: any;
  erro?: string;
}

export type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_PLAN'; payload: ExecutionPlan }
  | { type: 'UPDATE_STEP'; payload: { ordem: number; updates: Partial<ExecutionStep> } }
  | { type: 'SET_EXECUTING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_MEMORY'; payload: WorkingMemoryItem }
  | { type: 'CLEAR_SESSION' }
  | { type: 'SET_CURRENT_STEP'; payload: number | null };

export type MessageType = 
  | 'user'
  | 'assistant'
  | 'plan_card'
  | 'dev_mode_card'
  | 'construction_card'
  | 'content_generation_card'
  | 'system';

export interface Message {
  id: string;
  type: MessageType;
  role: 'user' | 'assistant' | 'system';
  content: string | any;
  timestamp: number;
  metadata?: {
    cardType?: 'plan' | 'dev_mode' | 'construction' | 'content_generation';
    cardData?: any;
    isStatic?: boolean;
    shouldUpdate?: boolean;
  };
}

export interface CapabilityState {
  id: string;
  nome: string;
  displayName?: string;
  status: 'pendente' | 'executando' | 'concluido' | 'erro' | 'pending' | 'executing' | 'completed' | 'error';
  resultado?: any;
}

export interface EtapaState {
  ordem: number;
  titulo: string;
  descricao?: string;
  status: 'pendente' | 'executando' | 'concluido';
  capabilities: CapabilityState[];
}

export interface DevModeCardData {
  plano: any;
  status: 'executando' | 'concluido' | 'erro';
  etapaAtual: number;
  etapas: EtapaState[];
}

export interface PlanCardData {
  objetivo: string;
  etapas: Array<{
    ordem: number;
    titulo: string;
    descricao: string;
  }>;
}

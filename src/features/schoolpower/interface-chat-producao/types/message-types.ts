export type MessageType = 
  | 'user'
  | 'assistant'
  | 'plan_card'
  | 'dev_mode_card'
  | 'construction_card'
  | 'content_generation_card'
  | 'artifact_card'
  | 'structured_response'
  | 'system';

export interface Message {
  id: string;
  type: MessageType;
  role: 'user' | 'assistant' | 'system';
  content: string | any;
  timestamp: number;
  metadata?: {
    cardType?: 'plan' | 'dev_mode' | 'construction' | 'content_generation' | 'artifact' | 'structured_response';
    cardData?: any;
    isStatic?: boolean;
    shouldUpdate?: boolean;
  };
}

export interface CapabilityState {
  id: string;
  nome: string;
  displayName?: string;
  status: 'pendente' | 'executando' | 'concluido' | 'erro';
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

export interface StructuredResponseBlock {
  type: 'text' | 'activities_card' | 'artifact_card';
  content?: string;
  activities?: ActivitySummaryUI[];
  artifact?: any;
}

export interface ActivitySummaryUI {
  id: string;
  titulo: string;
  tipo: string;
  db_id?: number;
}

export interface StructuredResponseData {
  blocks: StructuredResponseBlock[];
  rawText: string;
}

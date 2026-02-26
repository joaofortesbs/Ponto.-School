/**
 * content-types.ts
 * Interfaces e tipos compartilhados por todos os módulos de geração de conteúdo.
 */

import type { ChosenActivity } from '../../../../interface-chat-producao/stores/ChosenActivitiesStore';

export interface BnccContextData {
  habilidades: any[];
  componentes: string[];
  anos: string[];
  prompt_context: string;
  count: number;
}

export interface QuestoesReferenciaData {
  questoes: any[];
  componentes: string[];
  temas: string[];
  prompt_context: string;
  count: number;
}

export interface WebSearchContextData {
  results: unknown[];
  prompt_context: string;
  count: number;
  query: string;
}

export interface GerarConteudoParams {
  session_id: string;
  conversation_context: string;
  user_objective: string;
  tema_limpo?: string;
  temas_extraidos?: string[];
  disciplina_extraida?: string;
  turma_extraida?: string;
  activities_to_fill?: ChosenActivity[];
  on_progress?: (update: ProgressUpdate) => void;
  bncc_context?: BnccContextData;
  questoes_referencia?: QuestoesReferenciaData;
  file_context?: string;
}

export interface ProgressUpdate {
  type: 'activity_started' | 'field_generated' | 'activity_completed' | 'activity_error' | 'all_completed';
  activity_id?: string;
  activity_title?: string;
  field_name?: string;
  field_value?: string;
  progress?: number;
  total_activities?: number;
  current_activity?: number;
  error?: string;
  message?: string;
}

export interface GeneratedFieldsResult {
  activity_id: string;
  activity_type: string;
  generated_fields: Record<string, any>;
  schema_fields?: Record<string, any>;
  text_metadata?: Record<string, any>;
  success: boolean;
  error?: string;
}

export interface DebugLogEntry {
  timestamp: string;
  type: 'action' | 'discovery' | 'decision' | 'error' | 'warning' | 'info';
  narrative: string;
  technical_data?: any;
}

export interface GerarConteudoOutput {
  success: boolean;
  capability_id: string;
  data: any;
  error: string | null;
  debug_log: DebugLogEntry[];
  execution_time_ms: number;
  message?: string;
}

export interface JsonParseResult {
  success: boolean;
  data: any;
  method: string;
  error?: string;
}

export interface HandlerContext {
  correlationId: string;
  activityStartTime: number;
  capabilityId: string;
  capabilityName: string;
  userObjective: string;
  temaLimpo: string;
  disciplinaExtraida: string;
  turmaExtraida: string;
  onProgress?: (update: ProgressUpdate) => void;
}

export interface VerificationResult {
  approved: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  model_used: string;
  duration_ms: number;
}

export interface CoherenceResult {
  coherence_score: number;
  sequence_ok: boolean;
  coherence_issues: string[];
  coverage_ok: boolean;
  duration_ms: number;
}

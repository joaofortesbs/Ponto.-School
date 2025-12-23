/**
 * ====================================================================
 * TIPOS DO ORQUESTRADOR DE AULAS
 * ====================================================================
 */

export interface LessonContext {
  templateId: string;
  templateName: string;
  assunto: string;
  contexto?: string;
  objetivo?: string;
  sectionOrder: string[];
}

export interface OrchestratorOptions {
  activitiesPerSection?: number;
  skipSections?: string[];
  onProgress?: (state: WorkflowState) => void;
}

export type LogEventType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'RETRY' | 'DEBUG';

export interface LogEvent {
  timestamp: number;
  type: LogEventType;
  message: string;
  data?: any;
  relativeTime: number;
}

export interface SubPhase {
  completed: boolean;
  timestamp: number;
  details?: any;
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  timestamp: number;
  details?: any;
}

export interface StepLogs {
  stepId: number;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'retrying';
  events: LogEvent[];
  subPhases: Record<string, SubPhase>;
  retryCount: number;
  lastError: { message: string; stack?: string; timestamp: number } | null;
  startTime: number | null;
  endTime: number | null;
  validationChecks: ValidationCheck[];
  duration: number | null;
}

export interface WorkflowStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'retrying';
  startTime: number | null;
  endTime: number | null;
  data: any;
  error: string | null;
  logs?: StepLogs;
}

export interface WorkflowState {
  requestId: string;
  currentStep: number;
  steps: Record<number, WorkflowStep>;
  progress: number;
  totalDuration: number;
  isComplete: boolean;
  hasError: boolean;
}

export interface GeneratedActivity {
  id: string;
  templateId: string;
  type: string;
  title: string;
  description: string;
  content: any;
  sectionId: string;
  sectionName: string;
  metadata: {
    generatedAt: string;
    duration: number;
    difficulty: string;
    estimatedTime: string;
    source: string;
    requestId: string;
  };
}

export interface SectionContent {
  sectionId: string;
  sectionName: string;
  content: string;
  generatedAt: string;
  duration: number;
}

export interface LessonData {
  titulo: string;
  objetivo: string;
  templateId: string;
  templateName: string;
  secoes: Record<string, { text: string; generatedAt: string }>;
  activitiesPerSection?: Record<string, ActivityReference[]>;
  status?: string;
  generatedAt?: string;
}

export interface ActivityReference {
  id: string;
  templateId: string;
  title: string;
  type: string;
}

export interface OrchestratorResult {
  requestId: string;
  success: boolean;
  lesson: LessonData | null;
  activities: GeneratedActivity[];
  errors: Array<{ 
    step: number; 
    message: string; 
    stack?: string;
    recoveryStats?: {
      attempts: number;
      maxRetries: number;
      lastError: any;
      corrections: any[];
      exhausted: boolean;
    };
  }>;
  timing: {
    step1?: number;
    step2?: number;
    step3?: number;
    step4?: number;
    step5?: number;
    step6?: number;
    step7?: number;
    total?: number;
  };
  logs?: {
    requestId: string;
    createdAt: number;
    steps: Record<number, StepLogs>;
    totalDuration: number;
  };
  validationSummary?: Record<number, {
    valid: boolean;
    errorCount: number;
    passedCount: number;
  }>;
}

export const WORKFLOW_STEPS = {
  1: 'Envio de contexto',
  2: 'Criando conteúdo dos blocos',
  3: 'Sugerindo atividades',
  4: 'Gerando atividades',
  5: 'Salvando atividades',
  6: 'Anexando aos blocos',
  7: 'Finalizando aula'
} as const;

/**
 * ====================================================================
 * SERVIÇO CLIENTE DO ORQUESTRADOR
 * ====================================================================
 * 
 * Cliente frontend para comunicação com o servidor do orquestrador.
 * Usa SSE (Server-Sent Events) para atualizações em tempo real.
 * 
 * VERSÃO: 2.0.0 - Integrado com SSE
 * ====================================================================
 */

import type {
  LessonContext,
  OrchestratorOptions,
  OrchestratorResult,
  WorkflowState,
  GeneratedActivity,
  StepLogs
} from '../types';

const ORCHESTRATOR_BASE_URL = '/api/orchestrator';

const LOG_PREFIX = '🎭 [ORCHESTRATOR-CLIENT]';

function log(message: string, data?: any) {
  console.log(`${LOG_PREFIX} ${message}`);
  if (data) {
    console.log(data);
  }
}

export class OrchestratorService {
  private static instance: OrchestratorService;
  private eventSources: Map<string, EventSource> = new Map();
  private stepLogsCache: Map<string, Record<number, StepLogs>> = new Map();

  private constructor() {}

  static getInstance(): OrchestratorService {
    if (!OrchestratorService.instance) {
      OrchestratorService.instance = new OrchestratorService();
    }
    return OrchestratorService.instance;
  }

  async checkHealth(): Promise<{ status: string; groqConfigured: boolean }> {
    try {
      const response = await fetch(`${ORCHESTRATOR_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      log('Erro ao verificar saúde do orquestrador', error);
      return { status: 'error', groqConfigured: false };
    }
  }

  generateRequestId(): string {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  connectSSE(
    requestId: string,
    onProgress: (state: WorkflowState) => void,
    onComplete: (result: OrchestratorResult) => void,
    onError: (error: string) => void
  ): void {
    log(`Conectando SSE para ${requestId}`);
    
    const eventSource = new EventSource(`${ORCHESTRATOR_BASE_URL}/stream/${requestId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        log(`SSE recebido: ${data.type}`, data);
        
        switch (data.type) {
          case 'connected':
            log('SSE conectado com sucesso');
            break;
            
          case 'progress':
            if (data.logs) {
              this.updateStepLogs(requestId, data.step, data.logs);
            }
            onProgress({
              requestId: data.requestId,
              currentStep: data.currentStep || data.step,
              steps: data.steps || {},
              progress: data.progress || 0,
              totalDuration: data.totalDuration || 0,
              isComplete: data.isComplete || false,
              hasError: data.hasError || false
            });
            break;
            
          case 'complete':
          case 'failed':
            onComplete({
              success: data.success,
              requestId: requestId,
              lesson: data.lesson,
              activities: data.activities || [],
              errors: data.errors || [],
              timing: data.timing || {},
              logs: data.logs,
              validationSummary: data.validationSummary
            });
            this.disconnectSSE(requestId);
            break;
            
          case 'error':
            onError(data.message || data.error || 'Erro desconhecido');
            this.disconnectSSE(requestId);
            break;
        }
      } catch (error) {
        log('Erro ao processar evento SSE', error);
      }
    };
    
    eventSource.onerror = (error) => {
      log('Erro SSE', error);
      onError('Conexão SSE perdida');
      this.disconnectSSE(requestId);
    };
    
    this.eventSources.set(requestId, eventSource);
  }
  
  disconnectSSE(requestId: string): void {
    const eventSource = this.eventSources.get(requestId);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(requestId);
      log(`SSE desconectado para ${requestId}`);
    }
  }

  private updateStepLogs(requestId: string, stepId: number, logs: StepLogs): void {
    if (!this.stepLogsCache.has(requestId)) {
      this.stepLogsCache.set(requestId, {});
    }
    const cache = this.stepLogsCache.get(requestId)!;
    cache[stepId] = logs;
  }

  getStepLogs(requestId: string): Record<number, StepLogs> | undefined {
    return this.stepLogsCache.get(requestId);
  }

  clearStepLogs(requestId: string): void {
    this.stepLogsCache.delete(requestId);
  }

  async fetchStepLogs(requestId: string, stepId?: number): Promise<StepLogs | Record<number, StepLogs> | null> {
    try {
      const url = stepId 
        ? `${ORCHESTRATOR_BASE_URL}/logs/${requestId}?step=${stepId}`
        : `${ORCHESTRATOR_BASE_URL}/logs/${requestId}`;
      
      const response = await fetch(url);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.logs;
    } catch (error) {
      log('Erro ao buscar logs', error);
      return null;
    }
  }
  
  disconnectAllSSE(): void {
    this.eventSources.forEach((es, id) => {
      es.close();
      log(`SSE desconectado para ${id}`);
    });
    this.eventSources.clear();
  }

  async orchestrateLessonWithSSE(
    lessonContext: LessonContext,
    options: OrchestratorOptions = {},
    callbacks: {
      onProgress: (state: WorkflowState) => void;
      onComplete: (result: OrchestratorResult) => void;
      onError: (error: string) => void;
    }
  ): Promise<string> {
    const requestId = this.generateRequestId();
    
    log('Iniciando orquestração com SSE', { lessonContext, requestId });

    const lessonContextWithId = {
      ...lessonContext,
      requestId
    };

    this.connectSSE(
      requestId,
      callbacks.onProgress,
      (result) => {
        if (result.success && result.activities && result.activities.length > 0) {
          this.saveActivitiesToLocalStorage(
            result.activities,
            result.lesson?.activitiesPerSection || {}
          );
        }
        callbacks.onComplete(result);
      },
      callbacks.onError
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const response = await fetch(`${ORCHESTRATOR_BASE_URL}/orchestrate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonContext: lessonContextWithId,
          options: {
            activitiesPerSection: options.activitiesPerSection || 1,
            skipSections: options.skipSections || ['objective', 'materiais', 'observacoes', 'bncc']
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na orquestração');
      }

      return requestId;
    } catch (error: any) {
      log('Erro na orquestração', error);
      this.disconnectSSE(requestId);
      callbacks.onError(error.message || 'Erro de conexão');
      throw error;
    }
  }

  async orchestrateLesson(
    lessonContext: LessonContext,
    options: OrchestratorOptions = {}
  ): Promise<OrchestratorResult> {
    log('Iniciando orquestração de aula (modo simples)', { lessonContext, options });

    try {
      const response = await fetch(`${ORCHESTRATOR_BASE_URL}/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonContext,
          options: {
            activitiesPerSection: options.activitiesPerSection || 1,
            skipSections: options.skipSections || ['objective', 'materiais', 'observacoes', 'bncc']
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na orquestração');
      }

      const result: OrchestratorResult = await response.json();
      log('Orquestração concluída', { requestId: result.requestId, success: result.success });

      if (result.success && result.activities.length > 0) {
        this.saveActivitiesToLocalStorage(result.activities, result.lesson?.activitiesPerSection || {});
      }

      return result;
    } catch (error) {
      log('Erro na orquestração', error);
      throw error;
    }
  }

  private saveActivitiesToLocalStorage(
    activities: GeneratedActivity[],
    activitiesPerSection: Record<string, any[]>
  ): void {
    log('Salvando atividades no localStorage', { count: activities.length });

    try {
      const existingActivities = JSON.parse(
        localStorage.getItem('orchestrator_generated_activities') || '[]'
      );

      const updatedActivities = [...existingActivities, ...activities];
      localStorage.setItem('orchestrator_generated_activities', JSON.stringify(updatedActivities));

      const existingMappings = JSON.parse(
        localStorage.getItem('orchestrator_section_activities') || '{}'
      );

      const updatedMappings = { ...existingMappings, ...activitiesPerSection };
      localStorage.setItem('orchestrator_section_activities', JSON.stringify(updatedMappings));

      log('Atividades salvas no localStorage com sucesso');
    } catch (error) {
      log('Erro ao salvar atividades no localStorage', error);
    }
  }

  getActivitiesForSection(sectionId: string): any[] {
    try {
      const mappings = JSON.parse(
        localStorage.getItem('orchestrator_section_activities') || '{}'
      );
      return mappings[sectionId] || [];
    } catch {
      return [];
    }
  }

  getAllGeneratedActivities(): GeneratedActivity[] {
    try {
      return JSON.parse(
        localStorage.getItem('orchestrator_generated_activities') || '[]'
      );
    } catch {
      return [];
    }
  }

  clearLocalStorageData(): void {
    localStorage.removeItem('orchestrator_generated_activities');
    localStorage.removeItem('orchestrator_section_activities');
    log('Dados do localStorage limpos');
  }

  async getActivitiesCatalog(): Promise<any[]> {
    try {
      const response = await fetch(`${ORCHESTRATOR_BASE_URL}/activities-catalog`);
      const data = await response.json();
      return data.catalog || [];
    } catch (error) {
      log('Erro ao obter catálogo de atividades', error);
      return [];
    }
  }
}

export const orchestratorService = OrchestratorService.getInstance();

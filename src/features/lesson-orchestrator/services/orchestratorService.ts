/**
 * ====================================================================
 * SERVIÇO CLIENTE DO ORQUESTRADOR
 * ====================================================================
 * 
 * Cliente frontend para comunicação com o servidor do orquestrador.
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import type {
  LessonContext,
  OrchestratorOptions,
  OrchestratorResult,
  WorkflowState,
  GeneratedActivity
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
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

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

  async orchestrateLesson(
    lessonContext: LessonContext,
    options: OrchestratorOptions = {}
  ): Promise<OrchestratorResult> {
    log('Iniciando orquestração de aula', { lessonContext, options });

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

  async getWorkflowStatus(requestId: string): Promise<WorkflowState | null> {
    try {
      const response = await fetch(`${ORCHESTRATOR_BASE_URL}/status/${requestId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Erro ao obter status');
      }

      return await response.json();
    } catch (error) {
      log(`Erro ao obter status do workflow ${requestId}`, error);
      return null;
    }
  }

  startPolling(
    requestId: string,
    onUpdate: (state: WorkflowState) => void,
    intervalMs: number = 1000
  ): void {
    if (this.pollingIntervals.has(requestId)) {
      this.stopPolling(requestId);
    }

    const interval = setInterval(async () => {
      const state = await this.getWorkflowStatus(requestId);
      
      if (state) {
        onUpdate(state);
        
        if (state.isComplete || state.hasError) {
          this.stopPolling(requestId);
        }
      } else {
        this.stopPolling(requestId);
      }
    }, intervalMs);

    this.pollingIntervals.set(requestId, interval);
    log(`Polling iniciado para ${requestId}`);
  }

  stopPolling(requestId: string): void {
    const interval = this.pollingIntervals.get(requestId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(requestId);
      log(`Polling parado para ${requestId}`);
    }
  }

  stopAllPolling(): void {
    this.pollingIntervals.forEach((interval, requestId) => {
      clearInterval(interval);
      log(`Polling parado para ${requestId}`);
    });
    this.pollingIntervals.clear();
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

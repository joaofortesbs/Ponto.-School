/**
 * BuildQueueController - Sistema de Fila Ordenada para Construção de Atividades
 * 
 * Responsabilidades:
 * - Processar atividades em ordem sequencial (1 por vez)
 * - Só iniciar a próxima após a conclusão da anterior
 * - Emitir eventos de progresso para cada fase
 * - Prevenir sobrecarga do sistema de renderização
 * 
 * @author Ponto.School
 * @version 2.0.0
 */

import { ConstructionActivity } from '../types';
import { useActivityDebugStore } from '../stores/activityDebugStore';

export type QueueStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';
export type ActivityBuildStatus = 'queued' | 'building' | 'completed' | 'failed' | 'skipped';

export interface QueuedActivity {
  activity: ConstructionActivity;
  position: number;
  status: ActivityBuildStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface QueueProgress {
  status: QueueStatus;
  currentPosition: number;
  totalActivities: number;
  currentActivity: QueuedActivity | null;
  completedCount: number;
  failedCount: number;
  skippedCount: number;
  estimatedTimeRemaining?: number;
}

export interface BuildQueueConfig {
  delayBetweenActivities: number;
  maxRetries: number;
  timeout: number;
  onProgress?: (progress: QueueProgress) => void;
  onActivityStart?: (activity: QueuedActivity) => void;
  onActivityComplete?: (activity: QueuedActivity, success: boolean) => void;
  onQueueComplete?: (summary: QueueSummary) => void;
}

export interface QueueSummary {
  totalActivities: number;
  completedCount: number;
  failedCount: number;
  skippedCount: number;
  totalDuration: number;
  activities: QueuedActivity[];
}

type BuildFunction = (activity: ConstructionActivity) => Promise<boolean>;

const DEFAULT_CONFIG: BuildQueueConfig = {
  delayBetweenActivities: 800,
  maxRetries: 2,
  timeout: 120000
};

/**
 * Controlador de Fila de Construção Sequencial
 */
export class BuildQueueController {
  private static instance: BuildQueueController;
  private static runIdCounter: number = 0;
  private queue: QueuedActivity[] = [];
  private currentIndex: number = 0;
  private status: QueueStatus = 'idle';
  private config: BuildQueueConfig;
  private buildFunction: BuildFunction | null = null;
  private startTime: number = 0;
  private abortController: AbortController | null = null;
  private currentRunId: number = 0;

  private constructor(config: Partial<BuildQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('🎛️ [BuildQueue] Controller inicializado com config:', this.config);
  }

  /**
   * Singleton para acesso global com proteção contra overlapping builds
   */
  static getInstance(config?: Partial<BuildQueueConfig>): BuildQueueController {
    if (!BuildQueueController.instance) {
      BuildQueueController.instance = new BuildQueueController(config);
    }
    if (config) {
      BuildQueueController.instance.updateConfig(config);
    }
    return BuildQueueController.instance;
  }

  /**
   * Verifica se há um build em andamento
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Atualiza configurações do controller
   */
  updateConfig(config: Partial<BuildQueueConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Define a função de build que será executada para cada atividade
   */
  setBuildFunction(fn: BuildFunction): void {
    this.buildFunction = fn;
    console.log('🔧 [BuildQueue] Build function definida');
  }

  /**
   * Inicializa a fila com atividades ordenadas
   */
  initQueue(activities: ConstructionActivity[]): void {
    console.log(`📋 [BuildQueue] Inicializando fila com ${activities.length} atividades`);
    
    this.queue = activities.map((activity, index) => ({
      activity,
      position: index + 1,
      status: 'queued' as ActivityBuildStatus
    }));

    this.currentIndex = 0;
    this.status = 'idle';
    
    const debugStore = useActivityDebugStore.getState();
    this.queue.forEach(item => {
      debugStore.initActivity(item.activity.id, item.activity.title, item.activity.type || item.activity.id);
      debugStore.log(item.activity.id, 'info', 'Queue', `Posição na fila: ${item.position}/${activities.length}`, {
        position: item.position,
        total: activities.length
      });
      debugStore.setStatus(item.activity.id, 'pending');
    });

    this.emitProgress();
    console.log(`✅ [BuildQueue] Fila inicializada: ${this.queue.length} itens`);
  }

  /**
   * Inicia o processamento sequencial da fila
   * Proteção contra overlapping: aborta run anterior se existir
   */
  async start(): Promise<QueueSummary> {
    if (this.status === 'running') {
      console.warn('⚠️ [BuildQueue] Build em andamento detectado - abortando anterior para iniciar novo');
      this.abort();
      await this.delay(200);
    }

    if (!this.buildFunction) {
      throw new Error('Build function não definida. Use setBuildFunction() primeiro.');
    }

    if (this.queue.length === 0) {
      console.warn('⚠️ [BuildQueue] Fila vazia, nada a processar');
      return this.getSummary();
    }

    BuildQueueController.runIdCounter++;
    this.currentRunId = BuildQueueController.runIdCounter;
    const runId = this.currentRunId;

    console.log(`
═══════════════════════════════════════════════════════════════════════
🚀 [BuildQueue] INICIANDO PROCESSAMENTO SEQUENCIAL (Run #${runId})
═══════════════════════════════════════════════════════════════════════
Total de atividades: ${this.queue.length}
Delay entre atividades: ${this.config.delayBetweenActivities}ms
Timeout por atividade: ${this.config.timeout}ms
═══════════════════════════════════════════════════════════════════════`);

    this.status = 'running';
    this.startTime = Date.now();
    this.abortController = new AbortController();

    const debugStore = useActivityDebugStore.getState();

    while (this.currentIndex < this.queue.length && this.status === 'running' && this.currentRunId === runId) {
      const queuedItem = this.queue[this.currentIndex];
      const { activity } = queuedItem;

      if (activity.isBuilt || activity.status === 'completed') {
        console.log(`⏭️ [BuildQueue] Pulando atividade já construída: ${activity.title}`);
        queuedItem.status = 'skipped';
        debugStore.log(activity.id, 'info', 'Skip', 'Atividade já construída, pulando');
        this.currentIndex++;
        this.emitProgress();
        continue;
      }

      if (!activity.title || !activity.description) {
        console.warn(`⚠️ [BuildQueue] Dados insuficientes: ${activity.title || 'Sem título'}`);
        queuedItem.status = 'failed';
        queuedItem.error = 'Dados insuficientes para construção';
        activity.status = 'error';
        activity.progress = 0;
        debugStore.log(activity.id, 'error', 'Validation', 'Dados insuficientes');
        debugStore.setError(activity.id, 'Dados insuficientes');
        this.currentIndex++;
        this.emitProgress();
        continue;
      }

      console.log(`
┌─────────────────────────────────────────────────────────────────────
│ 🔨 [BuildQueue] PROCESSANDO ATIVIDADE ${queuedItem.position}/${this.queue.length}
├─────────────────────────────────────────────────────────────────────
│ ID: ${activity.id}
│ Título: ${activity.title}
│ Tipo: ${activity.type || activity.id}
└─────────────────────────────────────────────────────────────────────`);

      queuedItem.status = 'building';
      queuedItem.startedAt = new Date().toISOString();
      
      activity.status = 'in_progress';
      activity.progress = 10;
      
      debugStore.setStatus(activity.id, 'building');
      debugStore.setProgress(activity.id, 10, 'Iniciando construção...');
      debugStore.log(activity.id, 'action', 'BuildStart', `Iniciando construção (${queuedItem.position}/${this.queue.length})`);

      this.config.onActivityStart?.(queuedItem);
      this.emitProgress();

      window.dispatchEvent(new CustomEvent('construction:activity_building', {
        detail: {
          activity_id: activity.id,
          position: queuedItem.position,
          total: this.queue.length
        }
      }));

      try {
        activity.progress = 50;

        const success = await this.executeWithTimeout(
          this.buildFunction(activity),
          this.config.timeout
        );

        if (this.currentRunId !== runId) {
          console.log(`⚠️ [BuildQueue] Run #${runId} foi substituído por Run #${this.currentRunId}, abortando`);
          break;
        }

        queuedItem.completedAt = new Date().toISOString();
        
        if (success) {
          queuedItem.status = 'completed';
          activity.status = 'completed';
          activity.progress = 100;
          activity.isBuilt = true;
          activity.builtAt = new Date().toISOString();
          
          debugStore.markCompleted(activity.id);
          debugStore.log(activity.id, 'success', 'BuildComplete', 'Construção concluída com sucesso');
          
          console.log(`✅ [BuildQueue] Atividade ${queuedItem.position}/${this.queue.length} concluída: ${activity.title}`);
          
          window.dispatchEvent(new CustomEvent('construction:activity_completed', {
            detail: {
              activity_id: activity.id,
              position: queuedItem.position,
              total: this.queue.length,
              success: true
            }
          }));
        } else {
          queuedItem.status = 'failed';
          queuedItem.error = 'Build retornou falha';
          activity.status = 'error';
          activity.progress = 0;
          
          debugStore.setError(activity.id, 'Build retornou falha');
          debugStore.log(activity.id, 'error', 'BuildFailed', 'Construção falhou');
          
          console.error(`❌ [BuildQueue] Atividade ${queuedItem.position}/${this.queue.length} falhou: ${activity.title}`);
          
          window.dispatchEvent(new CustomEvent('construction:activity_error', {
            detail: {
              activity_id: activity.id,
              position: queuedItem.position,
              error: 'Build falhou'
            }
          }));
        }

        this.config.onActivityComplete?.(queuedItem, success);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        queuedItem.status = 'failed';
        queuedItem.error = errorMsg;
        queuedItem.completedAt = new Date().toISOString();
        
        activity.status = 'error';
        activity.progress = 0;
        
        debugStore.setError(activity.id, errorMsg);
        debugStore.log(activity.id, 'error', 'BuildError', `Erro: ${errorMsg}`);
        
        console.error(`❌ [BuildQueue] Erro na atividade ${activity.title}:`, error);
        
        window.dispatchEvent(new CustomEvent('construction:activity_error', {
          detail: {
            activity_id: activity.id,
            position: queuedItem.position,
            error: errorMsg
          }
        }));

        this.config.onActivityComplete?.(queuedItem, false);
      }

      this.currentIndex++;
      this.emitProgress();

      if (this.currentIndex < this.queue.length && this.status === 'running' && this.currentRunId === runId) {
        console.log(`⏱️ [BuildQueue] Aguardando ${this.config.delayBetweenActivities}ms antes da próxima...`);
        await this.delay(this.config.delayBetweenActivities);
      }
    }

    if (this.currentRunId === runId) {
      this.status = 'completed';
    }
    
    const summary = this.getSummary();

    console.log(`
═══════════════════════════════════════════════════════════════════════
🎉 [BuildQueue] PROCESSAMENTO CONCLUÍDO (Run #${runId})
═══════════════════════════════════════════════════════════════════════
Total: ${summary.totalActivities}
Concluídas: ${summary.completedCount}
Falhas: ${summary.failedCount}
Puladas: ${summary.skippedCount}
Duração: ${summary.totalDuration}ms
═══════════════════════════════════════════════════════════════════════`);

    if (this.currentRunId === runId) {
      this.config.onQueueComplete?.(summary);
      
      window.dispatchEvent(new CustomEvent('construction:queue_completed', {
        detail: summary
      }));
    }

    return summary;
  }

  /**
   * Pausa o processamento
   */
  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused';
      console.log('⏸️ [BuildQueue] Processamento pausado');
      this.emitProgress();
    }
  }

  /**
   * Retoma o processamento
   */
  async resume(): Promise<QueueSummary> {
    if (this.status === 'paused') {
      console.log('▶️ [BuildQueue] Retomando processamento');
      return this.start();
    }
    return this.getSummary();
  }

  /**
   * Aborta o processamento
   */
  abort(): void {
    if (this.status === 'running' || this.status === 'paused') {
      this.status = 'error';
      this.abortController?.abort();
      console.log('🛑 [BuildQueue] Processamento abortado');
      this.emitProgress();
    }
  }

  /**
   * Reseta a fila
   */
  reset(): void {
    this.queue = [];
    this.currentIndex = 0;
    this.status = 'idle';
    this.abortController = null;
    console.log('🔄 [BuildQueue] Fila resetada');
  }

  /**
   * Retorna o status atual
   */
  getStatus(): QueueStatus {
    return this.status;
  }

  /**
   * Retorna a atividade atual
   */
  getCurrentActivity(): QueuedActivity | null {
    return this.queue[this.currentIndex] || null;
  }

  /**
   * Retorna resumo da execução
   */
  private getSummary(): QueueSummary {
    return {
      totalActivities: this.queue.length,
      completedCount: this.queue.filter(q => q.status === 'completed').length,
      failedCount: this.queue.filter(q => q.status === 'failed').length,
      skippedCount: this.queue.filter(q => q.status === 'skipped').length,
      totalDuration: this.startTime > 0 ? Date.now() - this.startTime : 0,
      activities: [...this.queue]
    };
  }

  /**
   * Emite evento de progresso
   */
  private emitProgress(): void {
    const progress: QueueProgress = {
      status: this.status,
      currentPosition: this.currentIndex + 1,
      totalActivities: this.queue.length,
      currentActivity: this.queue[this.currentIndex] || null,
      completedCount: this.queue.filter(q => q.status === 'completed').length,
      failedCount: this.queue.filter(q => q.status === 'failed').length,
      skippedCount: this.queue.filter(q => q.status === 'skipped').length
    };

    this.config.onProgress?.(progress);

    window.dispatchEvent(new CustomEvent('construction:queue_progress', {
      detail: progress
    }));
  }

  /**
   * Executa com timeout
   */
  private executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout após ${timeout}ms`));
      }, timeout);

      promise
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const buildQueueController = BuildQueueController.getInstance();

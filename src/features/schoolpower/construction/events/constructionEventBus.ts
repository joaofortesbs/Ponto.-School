/**
 * CONSTRUCTION EVENT BUS
 * 
 * Sistema de eventos para construção programática de atividades.
 * Permite que criar_atividade.ts acione a construção real através do modal.
 * 
 * EVENTOS:
 * - construction:build_activity: Solicita construção de uma atividade
 * - construction:activity_progress: Atualiza progresso de construção
 * - construction:activity_built: Confirma que atividade foi construída
 * - construction:build_error: Reporta erro na construção
 */

export interface BuildActivityRequest {
  activityId: string;
  activityType: string;
  fields: Record<string, any>;
  requestId: string;
}

export interface BuildProgressUpdate {
  activityId: string;
  requestId: string;
  phase: 'modal_opening' | 'fields_injecting' | 'build_started' | 'build_complete';
  progress: number;
  message: string;
}

export interface BuildActivityResult {
  activityId: string;
  requestId: string;
  success: boolean;
  result?: any;
  error?: string;
  storageKeys: string[];
  timestamp: string;
}

export function emitBuildActivityRequest(request: BuildActivityRequest): void {
  console.log(`📡 [EventBus] Emitindo construction:build_activity para ${request.activityId}`);
  window.dispatchEvent(new CustomEvent('construction:build_activity', {
    detail: request
  }));
}

export function emitBuildProgress(update: BuildProgressUpdate): void {
  console.log(`📊 [EventBus] Progresso ${update.activityId}: ${update.phase} (${update.progress}%)`);
  window.dispatchEvent(new CustomEvent('construction:activity_progress', {
    detail: update
  }));
}

export function emitBuildResult(result: BuildActivityResult): void {
  console.log(`${result.success ? '✅' : '❌'} [EventBus] Resultado ${result.activityId}:`, result);
  window.dispatchEvent(new CustomEvent('construction:activity_built', {
    detail: result
  }));
}

export function waitForBuildResult(
  requestId: string,
  timeout: number = 60000
): Promise<BuildActivityResult> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      window.removeEventListener('construction:activity_built', handler);
      reject(new Error(`Timeout aguardando construção (requestId: ${requestId})`));
    }, timeout);

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<BuildActivityResult>;
      if (customEvent.detail.requestId === requestId) {
        clearTimeout(timeoutId);
        window.removeEventListener('construction:activity_built', handler);
        
        if (customEvent.detail.success) {
          resolve(customEvent.detail);
        } else {
          reject(new Error(customEvent.detail.error || 'Erro desconhecido na construção'));
        }
      }
    };

    window.addEventListener('construction:activity_built', handler);
  });
}

export function onBuildActivityRequest(
  callback: (request: BuildActivityRequest) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<BuildActivityRequest>;
    callback(customEvent.detail);
  };

  window.addEventListener('construction:build_activity', handler);
  
  return () => {
    window.removeEventListener('construction:build_activity', handler);
  };
}

export function onBuildProgress(
  callback: (update: BuildProgressUpdate) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<BuildProgressUpdate>;
    callback(customEvent.detail);
  };

  window.addEventListener('construction:activity_progress', handler);
  
  return () => {
    window.removeEventListener('construction:activity_progress', handler);
  };
}

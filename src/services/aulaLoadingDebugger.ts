// Sistema de rastreamento COMPLETO do carregamento de aula
interface DebugEntry {
  timestamp: string;
  stage: string;
  data: any;
}

class AulaLoadingDebugger {
  logs: DebugEntry[] = [];

  log = (stage: string, data: any) => {
    const entry: DebugEntry = {
      timestamp: new Date().toISOString(),
      stage,
      data,
    };
    this.logs.push(entry);
    console.log(`[AULA_DEBUG] ${stage}:`, data);
  };

  getFullTrace = () => {
    console.table(this.logs);
    return this.logs;
  };

  limpar = () => {
    this.logs = [];
    console.log('[AULA_DEBUG] Logs limpos');
  };

  getLastError = () => {
    const errorLog = this.logs.find(l => l.stage === 'ERROR');
    return errorLog || null;
  };
}

export const aulaLoadingDebugger = new AulaLoadingDebugger();

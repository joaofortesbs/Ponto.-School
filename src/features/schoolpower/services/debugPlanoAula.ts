
/**
 * Sistema de debug para acompanhar o processamento de dados do plano de aula
 */

export class PlanoAulaDebugger {
  private static logs: string[] = [];
  
  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage, data || '');
    this.logs.push(logMessage);
    
    // Salvar logs no localStorage para debug
    try {
      localStorage.setItem('plano_aula_debug_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Erro ao salvar logs de debug:', error);
    }
  }
  
  static trackAIResponse(response: any) {
    this.log('🤖 Resposta bruta da IA Gemini:', response);
    
    // Verificar se contém etapas
    const etapasFound = this.findEtapasInData(response);
    this.log(`📊 Etapas encontradas na resposta da IA: ${etapasFound.length}`, etapasFound);
    
    return etapasFound;
  }
  
  static trackDataProcessing(originalData: any, processedData: any) {
    this.log('🔄 Dados originais:', originalData);
    this.log('✅ Dados processados:', processedData);
    
    const originalEtapas = this.findEtapasInData(originalData);
    const processedEtapas = this.findEtapasInData(processedData);
    
    this.log(`📈 Etapas original: ${originalEtapas.length} | Etapas processadas: ${processedEtapas.length}`);
    
    if (originalEtapas.length > 0 && processedEtapas.length === 0) {
      this.log('⚠️ ALERTA: Etapas perdidas durante o processamento!');
    }
  }
  
  static trackPreviewLoad(data: any) {
    this.log('👁️ Dados carregados no preview:', data);
    
    const etapas = this.findEtapasInData(data);
    this.log(`🎯 Etapas disponíveis para exibição: ${etapas.length}`, etapas);
    
    return etapas;
  }
  
  private static findEtapasInData(data: any): any[] {
    if (!data) return [];
    
    const possiblePaths = [
      data.etapas_desenvolvimento,
      data.desenvolvimento,
      data.etapas,
      data.steps,
      data.development_steps,
      data.lesson_steps,
      data.class_development,
      data.plano?.etapas_desenvolvimento,
      data.plano?.desenvolvimento,
      data.conteudo?.etapas
    ];
    
    for (const path of possiblePaths) {
      if (path && Array.isArray(path) && path.length > 0) {
        return path;
      }
    }
    
    return [];
  }
  
  static getDebugReport(): string {
    return this.logs.join('\n');
  }
  
  static clearLogs() {
    this.logs = [];
    localStorage.removeItem('plano_aula_debug_logs');
  }
}

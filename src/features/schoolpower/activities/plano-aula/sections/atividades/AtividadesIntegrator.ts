
import { AtividadesDataProcessor, AtividadesData } from './AtividadesData';
import { storageSet, storageGet } from '@/features/schoolpower/services/StorageOrchestrator';

export class AtividadesIntegrator {
  private static readonly STORAGE_KEY = 'plano_aula_atividades_data';
  private static readonly DEBUG = true;
  
  /**
   * Log de debug se habilitado
   */
  private static debugLog(message: string, data?: any): void {
    if (this.DEBUG) {
      console.log(`🔧 AtividadesIntegrator: ${message}`, data || '');
    }
  }

  /**
   * Valida dados antes do processamento
   */
  private static validarDados(dados: any, origem: string): boolean {
    this.debugLog(`Validando dados de ${origem}`, dados);
    
    if (!dados) {
      console.warn(`⚠️ AtividadesIntegrator: Dados inválidos de ${origem}`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Sincroniza dados das atividades quando há mudanças no desenvolvimento
   */
  static async sincronizarComDesenvolvimento(desenvolvimentoData: any, planoId: string): Promise<AtividadesData> {
    this.debugLog('Sincronizando com dados de desenvolvimento');
    
    if (!this.validarDados(desenvolvimentoData, 'desenvolvimento')) {
      throw new Error('Dados de desenvolvimento inválidos');
    }
    
    if (!planoId) {
      throw new Error('ID do plano é obrigatório');
    }
    
    try {
      // Processar dados do desenvolvimento
      const atividadesData = AtividadesDataProcessor.processarDadosAtividades({
        desenvolvimento: desenvolvimentoData
      });

      // Validar dados processados
      if (!atividadesData || !Array.isArray(atividadesData.atividades_recursos)) {
        throw new Error('Dados processados são inválidos');
      }

      // Salvar no StorageOrchestrator para persistência
      await this.salvarDadosAtividades(planoId, atividadesData);

      this.debugLog('Sincronização concluída', {
        totalItems: atividadesData.total_items,
        atividades: atividadesData.atividades_recursos.filter(item => item.tipo === 'atividade').length,
        recursos: atividadesData.atividades_recursos.filter(item => item.tipo === 'recurso').length
      });

      return atividadesData;
    } catch (error) {
      console.error('❌ AtividadesIntegrator: Erro na sincronização', error);
      throw error;
    }
  }

  /**
   * Carrega dados de atividades salvos
   */
  static async carregarDadosAtividades(planoId: string): Promise<AtividadesData | null> {
    try {
      const dadosSalvos = await storageGet<AtividadesData>(`${this.STORAGE_KEY}_${planoId}`);
      if (dadosSalvos) {
        return dadosSalvos;
      }
    } catch (error) {
      console.error('Erro ao carregar dados de atividades:', error);
    }
    return null;
  }

  /**
   * Salva dados de atividades
   */
  static async salvarDadosAtividades(planoId: string, dados: AtividadesData): Promise<void> {
    try {
      await storageSet(`${this.STORAGE_KEY}_${planoId}`, dados, { activityType: 'plano-aula' });
    } catch (error) {
      console.error('Erro ao salvar dados de atividades:', error);
    }
  }

  /**
   * Limpa dados de atividades salvos
   */
  static limparDadosAtividades(planoId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${planoId}`);
    } catch (error) {
      console.error('Erro ao limpar dados de atividades:', error);
    }
  }

  /**
   * Observer para mudanças nos dados de desenvolvimento
   */
  static observarMudancasDesenvolvimento(callback: (dados: AtividadesData) => void) {
    // Implementar sistema de observação se necessário
    return () => {
      // Cleanup function
    };
  }

  /**
   * Valida se os dados de atividades estão atualizados
   */
  static validarAtualizacaoAtividades(desenvolvimentoTimestamp: string, atividadesTimestamp: string): boolean {
    try {
      const devTime = new Date(desenvolvimentoTimestamp).getTime();
      const ativTime = new Date(atividadesTimestamp).getTime();
      return ativTime >= devTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Força uma nova sincronização
   */
  static async forcarSincronizacao(planoData: any, planoId: string): Promise<AtividadesData> {
    console.log('🔄 AtividadesIntegrator: Forçando nova sincronização completa');
    
    // Limpar dados antigos
    this.limparDadosAtividades(planoId);
    
    // Reprocessar todos os dados
    const atividadesData = AtividadesDataProcessor.processarDadosAtividades(planoData);
    
    // Salvar novos dados
    await this.salvarDadosAtividades(planoId, atividadesData);
    
    return atividadesData;
  }
}

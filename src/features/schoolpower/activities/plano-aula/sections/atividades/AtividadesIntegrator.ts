
import { AtividadesDataProcessor, AtividadesData } from './AtividadesData';

export class AtividadesIntegrator {
  private static readonly STORAGE_KEY = 'plano_aula_atividades_data';
  
  /**
   * Sincroniza dados das atividades quando há mudanças no desenvolvimento
   */
  static sincronizarComDesenvolvimento(desenvolvimentoData: any, planoId: string): AtividadesData {
    console.log('🔄 AtividadesIntegrator: Sincronizando com dados de desenvolvimento');
    
    // Processar dados do desenvolvimento
    const atividadesData = AtividadesDataProcessor.processarDadosAtividades({
      desenvolvimento: desenvolvimentoData
    });

    // Salvar no localStorage para persistência
    this.salvarDadosAtividades(planoId, atividadesData);

    console.log('✅ AtividadesIntegrator: Sincronização concluída', {
      totalItems: atividadesData.total_items,
      atividades: atividadesData.atividades_recursos.filter(item => item.tipo === 'atividade').length,
      recursos: atividadesData.atividades_recursos.filter(item => item.tipo === 'recurso').length
    });

    return atividadesData;
  }

  /**
   * Carrega dados de atividades salvos
   */
  static carregarDadosAtividades(planoId: string): AtividadesData | null {
    try {
      const dadosSalvos = localStorage.getItem(`${this.STORAGE_KEY}_${planoId}`);
      if (dadosSalvos) {
        return JSON.parse(dadosSalvos);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de atividades:', error);
    }
    return null;
  }

  /**
   * Salva dados de atividades
   */
  static salvarDadosAtividades(planoId: string, dados: AtividadesData): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${planoId}`, JSON.stringify(dados));
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
  static forcarSincronizacao(planoData: any, planoId: string): AtividadesData {
    console.log('🔄 AtividadesIntegrator: Forçando nova sincronização completa');
    
    // Limpar dados antigos
    this.limparDadosAtividades(planoId);
    
    // Reprocessar todos os dados
    const atividadesData = AtividadesDataProcessor.processarDadosAtividades(planoData);
    
    // Salvar novos dados
    this.salvarDadosAtividades(planoId, atividadesData);
    
    return atividadesData;
  }
}

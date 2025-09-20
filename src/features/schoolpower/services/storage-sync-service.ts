
/**
 * Serviço de Sincronização com Storage Local
 * Gerencia persistência e sincronização de dados de atividades compartilhadas
 */

import { DataSyncService, AtividadeDados } from './data-sync-service';

export interface StorageMetadata {
  versao: string;
  criadoEm: string;
  atualizadoEm: string;
  origem: 'local' | 'compartilhada' | 'construida';
  checksum?: string;
}

export interface AtividadeArmazenada {
  dados: AtividadeDados;
  metadata: StorageMetadata;
}

export class StorageSyncService {
  private static readonly STORAGE_PREFIX = 'atividade_compartilhada_';
  private static readonly METADATA_PREFIX = 'atividade_metadata_';
  private static readonly VERSAO_ATUAL = '1.0.0';
  private static readonly DEBUG = true;

  /**
   * Debug logger
   */
  private static debugLog(message: string, data?: any): void {
    if (this.DEBUG) {
      console.log(`💾 [StorageSync] ${message}`, data || '');
    }
  }

  /**
   * Salva atividade no localStorage com sincronização
   */
  static salvarAtividade(atividade: any, origem: 'local' | 'compartilhada' | 'construida' = 'compartilhada'): boolean {
    try {
      this.debugLog('Salvando atividade', { id: atividade?.id, origem });

      // Sincronizar dados usando DataSyncService
      const atividadeSincronizada = DataSyncService.sincronizarAtividade(atividade);

      // Criar metadata
      const metadata: StorageMetadata = {
        versao: this.VERSAO_ATUAL,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        origem,
        checksum: this.gerarChecksum(atividadeSincronizada)
      };

      // Estrutura final para armazenamento
      const atividadeArmazenada: AtividadeArmazenada = {
        dados: atividadeSincronizada,
        metadata
      };

      // Salvar no localStorage
      const chaveStorage = `${this.STORAGE_PREFIX}${atividadeSincronizada.id}`;
      const chaveMetadata = `${this.METADATA_PREFIX}${atividadeSincronizada.id}`;

      localStorage.setItem(chaveStorage, JSON.stringify(atividadeArmazenada));
      localStorage.setItem(chaveMetadata, JSON.stringify(metadata));

      this.debugLog('Atividade salva com sucesso', {
        chave: chaveStorage,
        tamanho: JSON.stringify(atividadeArmazenada).length
      });

      return true;
    } catch (error) {
      console.error('❌ [StorageSync] Erro ao salvar atividade:', error);
      return false;
    }
  }

  /**
   * Carrega atividade do localStorage com sincronização
   */
  static carregarAtividade(id: string): AtividadeDados | null {
    try {
      this.debugLog('Carregando atividade', { id });

      const chaveStorage = `${this.STORAGE_PREFIX}${id}`;
      const dados = localStorage.getItem(chaveStorage);

      if (!dados) {
        this.debugLog('Atividade não encontrada no localStorage', { chave: chaveStorage });
        return null;
      }

      const atividadeArmazenada: AtividadeArmazenada = JSON.parse(dados);

      // Validar integridade
      if (!this.validarIntegridade(atividadeArmazenada)) {
        this.debugLog('Integridade da atividade comprometida, removendo');
        this.removerAtividade(id);
        return null;
      }

      // Re-sincronizar dados para garantir consistência
      const atividadeSincronizada = DataSyncService.sincronizarAtividade(atividadeArmazenada.dados);

      this.debugLog('Atividade carregada e sincronizada', atividadeSincronizada);
      return atividadeSincronizada;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao carregar atividade:', error);
      return null;
    }
  }

  /**
   * Busca atividade por código único
   */
  static buscarPorCodigo(codigo: string): AtividadeDados | null {
    try {
      this.debugLog('Buscando atividade por código', { codigo });

      // Listar todas as atividades armazenadas
      const todasAtividades = this.listarTodasAtividades();

      // Buscar por código único ou ID
      const atividadeEncontrada = todasAtividades.find(atividade => 
        atividade.dados.id === codigo ||
        atividade.dados.id.includes(codigo) ||
        (atividade.dados as any).codigoUnico === codigo
      );

      if (atividadeEncontrada) {
        this.debugLog('Atividade encontrada por código', atividadeEncontrada.dados);
        return atividadeEncontrada.dados;
      }

      this.debugLog('Atividade não encontrada por código');
      return null;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao buscar por código:', error);
      return null;
    }
  }

  /**
   * Atualiza atividade existente
   */
  static atualizarAtividade(id: string, novosDados: Partial<AtividadeDados>): boolean {
    try {
      this.debugLog('Atualizando atividade', { id, novosDados });

      const atividadeAtual = this.carregarAtividade(id);
      if (!atividadeAtual) {
        this.debugLog('Atividade não encontrada para atualização');
        return false;
      }

      // Mesclar dados usando DataSyncService
      const atividadeAtualizada = DataSyncService.atualizarAtividade(atividadeAtual, novosDados);

      // Salvar atividade atualizada
      return this.salvarAtividade(atividadeAtualizada, 'local');

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao atualizar atividade:', error);
      return false;
    }
  }

  /**
   * Remove atividade do localStorage
   */
  static removerAtividade(id: string): boolean {
    try {
      this.debugLog('Removendo atividade', { id });

      const chaveStorage = `${this.STORAGE_PREFIX}${id}`;
      const chaveMetadata = `${this.METADATA_PREFIX}${id}`;

      localStorage.removeItem(chaveStorage);
      localStorage.removeItem(chaveMetadata);

      this.debugLog('Atividade removida com sucesso');
      return true;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao remover atividade:', error);
      return false;
    }
  }

  /**
   * Lista todas as atividades armazenadas
   */
  static listarTodasAtividades(): AtividadeArmazenada[] {
    try {
      const atividades: AtividadeArmazenada[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        
        if (chave?.startsWith(this.STORAGE_PREFIX)) {
          const dados = localStorage.getItem(chave);
          if (dados) {
            try {
              const atividade: AtividadeArmazenada = JSON.parse(dados);
              atividades.push(atividade);
            } catch (parseError) {
              console.warn('❌ [StorageSync] Erro ao parsear atividade:', chave);
            }
          }
        }
      }

      this.debugLog('Atividades listadas', { total: atividades.length });
      return atividades;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao listar atividades:', error);
      return [];
    }
  }

  /**
   * Limpa todas as atividades do localStorage
   */
  static limparTodasAtividades(): boolean {
    try {
      this.debugLog('Limpando todas as atividades');

      const chavesParaRemover: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        
        if (chave?.startsWith(this.STORAGE_PREFIX) || chave?.startsWith(this.METADATA_PREFIX)) {
          chavesParaRemover.push(chave);
        }
      }

      chavesParaRemover.forEach(chave => localStorage.removeItem(chave));

      this.debugLog('Todas as atividades foram removidas', { total: chavesParaRemover.length });
      return true;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao limpar atividades:', error);
      return false;
    }
  }

  /**
   * Valida integridade da atividade armazenada
   */
  private static validarIntegridade(atividadeArmazenada: AtividadeArmazenada): boolean {
    try {
      // Verificar estrutura básica
      if (!atividadeArmazenada.dados || !atividadeArmazenada.metadata) {
        return false;
      }

      // Verificar versão
      if (atividadeArmazenada.metadata.versao !== this.VERSAO_ATUAL) {
        this.debugLog('Versão incompatível detectada', {
          esperada: this.VERSAO_ATUAL,
          encontrada: atividadeArmazenada.metadata.versao
        });
        return false;
      }

      // Verificar checksum se disponível
      if (atividadeArmazenada.metadata.checksum) {
        const checksumAtual = this.gerarChecksum(atividadeArmazenada.dados);
        if (checksumAtual !== atividadeArmazenada.metadata.checksum) {
          this.debugLog('Checksum inválido detectado');
          return false;
        }
      }

      // Verificar dados obrigatórios
      const validacao = DataSyncService.validarAtividade(atividadeArmazenada.dados);
      return validacao.valida;

    } catch (error) {
      console.error('❌ [StorageSync] Erro na validação de integridade:', error);
      return false;
    }
  }

  /**
   * Gera checksum simples para validação de integridade
   */
  private static gerarChecksum(dados: AtividadeDados): string {
    try {
      const dadosString = JSON.stringify(dados);
      let hash = 0;
      
      for (let i = 0; i < dadosString.length; i++) {
        const char = dadosString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return hash.toString(16);
    } catch (error) {
      return '0';
    }
  }

  /**
   * Sincroniza atividade compartilhada específica
   */
  static sincronizarAtividadeCompartilhada(atividadeId: string, codigoUnico: string): AtividadeDados | null {
    try {
      this.debugLog('Sincronizando atividade compartilhada específica', { atividadeId, codigoUnico });

      // Primeiro, tentar buscar no localStorage
      let atividade = this.carregarAtividade(atividadeId);

      if (!atividade) {
        // Tentar buscar por código único
        atividade = this.buscarPorCodigo(codigoUnico);
      }

      if (!atividade) {
        this.debugLog('Atividade não encontrada para sincronização');
        return null;
      }

      // Re-sincronizar para garantir dados atualizados
      const atividadeSincronizada = DataSyncService.sincronizarAtividade(atividade);

      // Salvar versão sincronizada
      this.salvarAtividade(atividadeSincronizada, 'compartilhada');

      this.debugLog('Atividade compartilhada sincronizada com sucesso', atividadeSincronizada);
      return atividadeSincronizada;

    } catch (error) {
      console.error('❌ [StorageSync] Erro na sincronização específica:', error);
      return null;
    }
  }
}

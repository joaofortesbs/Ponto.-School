/**
 * STORAGE SYNC SERVICE v2.0
 * 
 * Serviço centralizado de sincronização e persistência de atividades no School Power.
 * Gerencia múltiplas chaves de localStorage, versionamento, eventos de sincronização,
 * e integração com stores Zustand.
 * 
 * ARQUITETURA DE CHAVES:
 * - atividade_compartilhada_{id}: Dados completos com metadata
 * - atividade_metadata_{id}: Apenas metadata para consultas rápidas
 * - constructed_{type}_{id}: Atividades construídas pelo pipeline V2
 * - constructed_{id}: Formato legado de construção
 * - activity_{id}: Dados para ViewActivityModal
 * - generated_content_{id}: Conteúdo gerado pela IA
 * - constructedActivities: Objeto global de todas atividades construídas
 * 
 * EVENTOS EMITIDOS:
 * - storage-sync:activity-saved - Quando uma atividade é salva
 * - storage-sync:activity-updated - Quando uma atividade é atualizada
 * - storage-sync:activity-removed - Quando uma atividade é removida
 * - activity-data-sync - Evento legado para compatibilidade com ViewActivityModal
 */

import { DataSyncService, AtividadeDados } from './data-sync-service';
import { storageSet, storageGet, storageSetJSON, safeSetItem, safeSetJSON, isHeavyActivityType } from '@/features/schoolpower/services/StorageOrchestrator';

export const STORAGE_VERSION = '2.0.0';

export type StorageOrigin = 'local' | 'compartilhada' | 'construida' | 'gerada' | 'importada';

export interface StorageMetadata {
  versao: string;
  criadoEm: string;
  atualizadoEm: string;
  origem: StorageOrigin;
  checksum?: string;
  pipeline_version?: 'v1' | 'v2';
  build_session_id?: string;
  generation_model?: string;
  generation_duration_ms?: number;
}

export interface AtividadeArmazenada {
  dados: AtividadeDados;
  metadata: StorageMetadata;
  campos_gerados?: Record<string, any>;
  validation_status?: 'pending' | 'validated' | 'failed';
}

export interface StorageStats {
  total_atividades: number;
  total_construidas: number;
  total_geradas: number;
  espaco_usado_kb: number;
  ultima_sincronizacao?: string;
}

export interface StorageSearchOptions {
  tipo?: string;
  origem?: StorageOrigin;
  desde?: Date;
  ate?: Date;
  limite?: number;
}

export class StorageSyncService {
  private static readonly STORAGE_PREFIX = 'atividade_compartilhada_';
  private static readonly METADATA_PREFIX = 'atividade_metadata_';
  private static readonly CONSTRUCTED_PREFIX = 'constructed_';
  private static readonly ACTIVITY_PREFIX = 'activity_';
  private static readonly GENERATED_PREFIX = 'generated_content_';
  private static readonly GLOBAL_CONSTRUCTED_KEY = 'constructedActivities';
  private static readonly VERSAO_ATUAL = STORAGE_VERSION;
  private static readonly DEBUG = true;

  private static debugLog(message: string, data?: any): void {
    if (this.DEBUG) {
      console.log(`💾 [StorageSync] ${message}`, data || '');
    }
  }

  private static emitEvent(eventName: string, detail: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  static salvarAtividade(
    atividade: any, 
    origem: StorageOrigin = 'compartilhada',
    options?: {
      pipeline_version?: 'v1' | 'v2';
      session_id?: string;
      model?: string;
      duration_ms?: number;
      campos_gerados?: Record<string, any>;
    }
  ): boolean {
    try {
      this.debugLog('Salvando atividade', { id: atividade?.id, origem, options });

      const atividadeSincronizada = DataSyncService.sincronizarAtividade(atividade);

      const metadata: StorageMetadata = {
        versao: this.VERSAO_ATUAL,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        origem,
        checksum: this.gerarChecksum(atividadeSincronizada),
        pipeline_version: options?.pipeline_version,
        build_session_id: options?.session_id,
        generation_model: options?.model,
        generation_duration_ms: options?.duration_ms
      };

      const atividadeArmazenada: AtividadeArmazenada = {
        dados: atividadeSincronizada,
        metadata,
        campos_gerados: options?.campos_gerados,
        validation_status: 'validated'
      };

      const chaveStorage = `${this.STORAGE_PREFIX}${atividadeSincronizada.id}`;
      const chaveMetadata = `${this.METADATA_PREFIX}${atividadeSincronizada.id}`;

      safeSetJSON(chaveStorage, atividadeArmazenada);
      safeSetJSON(chaveMetadata, metadata);

      this.emitEvent('storage-sync:activity-saved', {
        activityId: atividadeSincronizada.id,
        origem,
        timestamp: metadata.atualizadoEm
      });

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

  static salvarAtividadeConstruida(
    activityId: string,
    activityType: string,
    formData: Record<string, any>,
    options?: {
      session_id?: string;
      model?: string;
      duration_ms?: number;
    }
  ): boolean {
    try {
      this.debugLog('Salvando atividade construída', { activityId, activityType });

      const timestamp = new Date().toISOString();
      const constructedData = {
        ...formData,
        _metadata: {
          built_at: timestamp,
          activity_type: activityType,
          pipeline: 'v2',
          session_id: options?.session_id,
          model: options?.model,
          duration_ms: options?.duration_ms
        }
      };

      const keys = [
        `${this.CONSTRUCTED_PREFIX}${activityType}_${activityId}`,
        `${this.CONSTRUCTED_PREFIX}${activityId}`,
        `${this.ACTIVITY_PREFIX}${activityId}`,
        `${this.GENERATED_PREFIX}${activityId}`
      ];

      keys.forEach(key => {
        if (isHeavyActivityType(activityType)) {
          storageSet(key, constructedData, { activityType }).catch(err => 
            console.error(`[StorageSync] Error storing ${key}:`, err)
          );
        } else {
          safeSetJSON(key, constructedData);
        }
      });

      this.atualizarGlobalConstructed(activityId, activityType, constructedData);

      this.emitEvent('activity-data-sync', {
        activityId,
        type: activityType,
        data: constructedData
      });

      this.emitEvent('storage-sync:activity-saved', {
        activityId,
        origem: 'construida',
        keys,
        timestamp
      });

      this.debugLog('Atividade construída salva em múltiplas chaves', { keys });

      return true;
    } catch (error) {
      console.error('❌ [StorageSync] Erro ao salvar atividade construída:', error);
      return false;
    }
  }

  static salvarConteudoGerado(
    activityId: string,
    activityType: string,
    campos: Record<string, any>,
    options?: {
      model?: string;
      duration_ms?: number;
    }
  ): boolean {
    try {
      this.debugLog('Salvando conteúdo gerado', { activityId, activityType, campos: Object.keys(campos) });

      const timestamp = new Date().toISOString();
      const contentData = {
        ...campos,
        _generation_metadata: {
          generated_at: timestamp,
          activity_type: activityType,
          model: options?.model,
          duration_ms: options?.duration_ms,
          field_count: Object.keys(campos).filter(k => !k.startsWith('_')).length
        }
      };

      if (isHeavyActivityType(activityType)) {
        storageSet(`${this.GENERATED_PREFIX}${activityId}`, contentData, { activityType }).catch(err => 
          console.error(`[StorageSync] Error storing generated content:`, err)
        );
      } else {
        safeSetJSON(`${this.GENERATED_PREFIX}${activityId}`, contentData);
      }

      this.emitEvent('storage-sync:content-generated', {
        activityId,
        type: activityType,
        fields: Object.keys(campos),
        timestamp
      });

      return true;
    } catch (error) {
      console.error('❌ [StorageSync] Erro ao salvar conteúdo gerado:', error);
      return false;
    }
  }

  private static atualizarGlobalConstructed(
    activityId: string, 
    activityType: string, 
    data: Record<string, any>
  ): void {
    try {
      const existingData = localStorage.getItem(this.GLOBAL_CONSTRUCTED_KEY);
      const globalData = existingData ? JSON.parse(existingData) : {};

      globalData[activityId] = {
        type: activityType,
        data,
        updated_at: new Date().toISOString()
      };

      safeSetJSON(this.GLOBAL_CONSTRUCTED_KEY, globalData);
    } catch (error) {
      console.error('❌ [StorageSync] Erro ao atualizar global constructed:', error);
    }
  }

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

      if (!this.validarIntegridade(atividadeArmazenada)) {
        this.debugLog('Integridade da atividade comprometida, removendo');
        this.removerAtividade(id);
        return null;
      }

      const atividadeSincronizada = DataSyncService.sincronizarAtividade(atividadeArmazenada.dados);

      this.debugLog('Atividade carregada e sincronizada', atividadeSincronizada);
      return atividadeSincronizada;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao carregar atividade:', error);
      return null;
    }
  }

  static carregarAtividadeConstruida(
    activityId: string, 
    activityType?: string
  ): Record<string, any> | null {
    try {
      this.debugLog('Carregando atividade construída', { activityId, activityType });

      const keysToTry = activityType 
        ? [
            `${this.CONSTRUCTED_PREFIX}${activityType}_${activityId}`,
            `${this.CONSTRUCTED_PREFIX}${activityId}`,
            `${this.ACTIVITY_PREFIX}${activityId}`,
            `${this.GENERATED_PREFIX}${activityId}`
          ]
        : [
            `${this.CONSTRUCTED_PREFIX}${activityId}`,
            `${this.ACTIVITY_PREFIX}${activityId}`,
            `${this.GENERATED_PREFIX}${activityId}`
          ];

      for (const key of keysToTry) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          this.debugLog('Atividade construída encontrada', { key, fields: Object.keys(parsed) });
          return parsed;
        }
      }

      const globalData = localStorage.getItem(this.GLOBAL_CONSTRUCTED_KEY);
      if (globalData) {
        const parsed = JSON.parse(globalData);
        if (parsed[activityId]) {
          this.debugLog('Atividade encontrada no global constructed', { activityId });
          return parsed[activityId].data;
        }
      }

      this.debugLog('Atividade construída não encontrada', { activityId });
      return null;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao carregar atividade construída:', error);
      return null;
    }
  }

  static carregarConteudoGerado(activityId: string): Record<string, any> | null {
    try {
      const data = localStorage.getItem(`${this.GENERATED_PREFIX}${activityId}`);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('❌ [StorageSync] Erro ao carregar conteúdo gerado:', error);
      return null;
    }
  }

  static buscarPorCodigo(codigo: string): AtividadeDados | null {
    try {
      this.debugLog('Buscando atividade por código', { codigo });

      const todasAtividades = this.listarTodasAtividades();

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

  static buscarAtividades(options: StorageSearchOptions = {}): AtividadeArmazenada[] {
    try {
      this.debugLog('Buscando atividades com filtros', options);

      let atividades = this.listarTodasAtividades();

      if (options.tipo) {
        atividades = atividades.filter(a => a.dados.tipo === options.tipo);
      }

      if (options.origem) {
        atividades = atividades.filter(a => a.metadata.origem === options.origem);
      }

      if (options.desde) {
        const desdeTs = options.desde.getTime();
        atividades = atividades.filter(a => 
          new Date(a.metadata.criadoEm).getTime() >= desdeTs
        );
      }

      if (options.ate) {
        const ateTs = options.ate.getTime();
        atividades = atividades.filter(a => 
          new Date(a.metadata.criadoEm).getTime() <= ateTs
        );
      }

      atividades.sort((a, b) => 
        new Date(b.metadata.atualizadoEm).getTime() - new Date(a.metadata.atualizadoEm).getTime()
      );

      if (options.limite) {
        atividades = atividades.slice(0, options.limite);
      }

      this.debugLog('Busca concluída', { total: atividades.length });
      return atividades;

    } catch (error) {
      console.error('❌ [StorageSync] Erro na busca de atividades:', error);
      return [];
    }
  }

  static atualizarAtividade(id: string, novosDados: Partial<AtividadeDados>): boolean {
    try {
      this.debugLog('Atualizando atividade', { id, novosDados });

      const atividadeAtual = this.carregarAtividade(id);
      if (!atividadeAtual) {
        this.debugLog('Atividade não encontrada para atualização');
        return false;
      }

      const atividadeAtualizada = DataSyncService.atualizarAtividade(atividadeAtual, novosDados);

      const result = this.salvarAtividade(atividadeAtualizada, 'local');

      if (result) {
        this.emitEvent('storage-sync:activity-updated', {
          activityId: id,
          changes: Object.keys(novosDados),
          timestamp: new Date().toISOString()
        });
      }

      return result;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao atualizar atividade:', error);
      return false;
    }
  }

  static removerAtividade(id: string): boolean {
    try {
      this.debugLog('Removendo atividade', { id });

      const keysToRemove = [
        `${this.STORAGE_PREFIX}${id}`,
        `${this.METADATA_PREFIX}${id}`,
        `${this.CONSTRUCTED_PREFIX}${id}`,
        `${this.ACTIVITY_PREFIX}${id}`,
        `${this.GENERATED_PREFIX}${id}`
      ];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(id) && key.startsWith(this.CONSTRUCTED_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      try {
        const globalData = localStorage.getItem(this.GLOBAL_CONSTRUCTED_KEY);
        if (globalData) {
          const parsed = JSON.parse(globalData);
          if (parsed[id]) {
            delete parsed[id];
            safeSetJSON(this.GLOBAL_CONSTRUCTED_KEY, parsed);
          }
        }
      } catch (e) {
        console.warn('Erro ao limpar global constructed:', e);
      }

      this.emitEvent('storage-sync:activity-removed', {
        activityId: id,
        keysRemoved: keysToRemove.length,
        timestamp: new Date().toISOString()
      });

      this.debugLog('Atividade removida com sucesso', { keysRemoved: keysToRemove.length });
      return true;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao remover atividade:', error);
      return false;
    }
  }

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

  static listarAtividadesConstruidas(): Array<{ id: string; type: string; data: any }> {
    try {
      const globalData = localStorage.getItem(this.GLOBAL_CONSTRUCTED_KEY);
      if (!globalData) return [];

      const parsed = JSON.parse(globalData);
      return Object.entries(parsed).map(([id, value]: [string, any]) => ({
        id,
        type: value.type,
        data: value.data
      }));
    } catch (error) {
      console.error('❌ [StorageSync] Erro ao listar atividades construídas:', error);
      return [];
    }
  }

  static obterEstatisticas(): StorageStats {
    try {
      const todasAtividades = this.listarTodasAtividades();
      const construidas = this.listarAtividadesConstruidas();

      let espacoUsado = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith(this.STORAGE_PREFIX) ||
          key.startsWith(this.METADATA_PREFIX) ||
          key.startsWith(this.CONSTRUCTED_PREFIX) ||
          key.startsWith(this.ACTIVITY_PREFIX) ||
          key.startsWith(this.GENERATED_PREFIX) ||
          key === this.GLOBAL_CONSTRUCTED_KEY
        )) {
          const value = localStorage.getItem(key);
          if (value) {
            espacoUsado += (key.length + value.length) * 2;
          }
        }
      }

      const geradas = todasAtividades.filter(a => a.metadata.origem === 'gerada').length;

      return {
        total_atividades: todasAtividades.length,
        total_construidas: construidas.length,
        total_geradas: geradas,
        espaco_usado_kb: Math.round(espacoUsado / 1024),
        ultima_sincronizacao: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [StorageSync] Erro ao obter estatísticas:', error);
      return {
        total_atividades: 0,
        total_construidas: 0,
        total_geradas: 0,
        espaco_usado_kb: 0
      };
    }
  }

  static limparTodasAtividades(): boolean {
    try {
      this.debugLog('Limpando todas as atividades');

      const chavesParaRemover: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        
        if (chave && (
          chave.startsWith(this.STORAGE_PREFIX) || 
          chave.startsWith(this.METADATA_PREFIX) ||
          chave.startsWith(this.CONSTRUCTED_PREFIX) ||
          chave.startsWith(this.ACTIVITY_PREFIX) ||
          chave.startsWith(this.GENERATED_PREFIX) ||
          chave === this.GLOBAL_CONSTRUCTED_KEY
        )) {
          chavesParaRemover.push(chave);
        }
      }

      chavesParaRemover.forEach(chave => localStorage.removeItem(chave));

      this.emitEvent('storage-sync:all-cleared', {
        keysRemoved: chavesParaRemover.length,
        timestamp: new Date().toISOString()
      });

      this.debugLog('Todas as atividades foram removidas', { total: chavesParaRemover.length });
      return true;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao limpar atividades:', error);
      return false;
    }
  }

  static limparAtividadesConstruidas(): boolean {
    try {
      this.debugLog('Limpando atividades construídas');

      const chavesParaRemover: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        
        if (chave && (
          chave.startsWith(this.CONSTRUCTED_PREFIX) ||
          chave.startsWith(this.ACTIVITY_PREFIX) ||
          chave.startsWith(this.GENERATED_PREFIX) ||
          chave === this.GLOBAL_CONSTRUCTED_KEY
        )) {
          chavesParaRemover.push(chave);
        }
      }

      chavesParaRemover.forEach(chave => localStorage.removeItem(chave));

      this.debugLog('Atividades construídas removidas', { total: chavesParaRemover.length });
      return true;

    } catch (error) {
      console.error('❌ [StorageSync] Erro ao limpar atividades construídas:', error);
      return false;
    }
  }

  private static validarIntegridade(atividadeArmazenada: AtividadeArmazenada): boolean {
    try {
      if (!atividadeArmazenada.dados || !atividadeArmazenada.metadata) {
        return false;
      }

      const versaoMajor = (v: string) => parseInt(v.split('.')[0]);
      if (versaoMajor(atividadeArmazenada.metadata.versao) < versaoMajor(this.VERSAO_ATUAL)) {
        this.debugLog('Versão antiga detectada, migrando...', {
          de: atividadeArmazenada.metadata.versao,
          para: this.VERSAO_ATUAL
        });
        return true;
      }

      if (atividadeArmazenada.metadata.checksum) {
        const checksumAtual = this.gerarChecksum(atividadeArmazenada.dados);
        if (checksumAtual !== atividadeArmazenada.metadata.checksum) {
          this.debugLog('Checksum inválido detectado');
          return false;
        }
      }

      const validacao = DataSyncService.validarAtividade(atividadeArmazenada.dados);
      return validacao.valida;

    } catch (error) {
      console.error('❌ [StorageSync] Erro na validação de integridade:', error);
      return false;
    }
  }

  private static gerarChecksum(dados: AtividadeDados): string {
    try {
      const dadosString = JSON.stringify(dados);
      let hash = 0;
      
      for (let i = 0; i < dadosString.length; i++) {
        const char = dadosString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return hash.toString(16);
    } catch (error) {
      return '0';
    }
  }

  static sincronizarAtividadeCompartilhada(atividadeId: string, codigoUnico: string): AtividadeDados | null {
    try {
      this.debugLog('Sincronizando atividade compartilhada específica', { atividadeId, codigoUnico });

      let atividade = this.carregarAtividade(atividadeId);

      if (!atividade) {
        atividade = this.buscarPorCodigo(codigoUnico);
      }

      if (!atividade) {
        this.debugLog('Atividade não encontrada para sincronização');
        return null;
      }

      const atividadeSincronizada = DataSyncService.sincronizarAtividade(atividade);

      this.salvarAtividade(atividadeSincronizada, 'compartilhada');

      this.debugLog('Atividade compartilhada sincronizada com sucesso', atividadeSincronizada);
      return atividadeSincronizada;

    } catch (error) {
      console.error('❌ [StorageSync] Erro na sincronização específica:', error);
      return null;
    }
  }

  static exportarDados(): string {
    try {
      const dados = {
        versao: this.VERSAO_ATUAL,
        exportado_em: new Date().toISOString(),
        atividades: this.listarTodasAtividades(),
        construidas: this.listarAtividadesConstruidas(),
        estatisticas: this.obterEstatisticas()
      };

      return JSON.stringify(dados, null, 2);
    } catch (error) {
      console.error('❌ [StorageSync] Erro ao exportar dados:', error);
      return '{}';
    }
  }

  static importarDados(jsonData: string): { sucesso: boolean; importadas: number; erros: string[] } {
    const erros: string[] = [];
    let importadas = 0;

    try {
      const dados = JSON.parse(jsonData);

      if (dados.atividades && Array.isArray(dados.atividades)) {
        for (const atividade of dados.atividades) {
          try {
            if (this.salvarAtividade(atividade.dados, 'importada')) {
              importadas++;
            }
          } catch (e) {
            erros.push(`Erro ao importar atividade ${atividade.dados?.id}: ${e}`);
          }
        }
      }

      return { sucesso: erros.length === 0, importadas, erros };
    } catch (error) {
      return { sucesso: false, importadas: 0, erros: [`Erro ao parsear JSON: ${error}`] };
    }
  }
}

export function getStorageKeys(activityId: string, activityType?: string): string[] {
  const keys = [
    `atividade_compartilhada_${activityId}`,
    `constructed_${activityId}`,
    `activity_${activityId}`,
    `generated_content_${activityId}`
  ];

  if (activityType) {
    keys.unshift(`constructed_${activityType}_${activityId}`);
  }

  return keys;
}

export function findActivityInStorage(activityId: string): Record<string, any> | null {
  return StorageSyncService.carregarAtividadeConstruida(activityId);
}

export function saveActivityToAllKeys(
  activityId: string,
  activityType: string,
  data: Record<string, any>,
  options?: { session_id?: string; model?: string; duration_ms?: number }
): boolean {
  return StorageSyncService.salvarAtividadeConstruida(activityId, activityType, data, options);
}

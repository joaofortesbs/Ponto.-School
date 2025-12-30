/**
 * ACTIVITY CATALOG SERVICE
 * 
 * Service Layer isolada para carregar e validar o catálogo de atividades.
 * Responsabilidade ÚNICA: File loading + Cache + Validação
 * 
 * Princípios:
 * - Fail-fast: Se arquivo não carrega, throw error
 * - Cache: Evitar reloads desnecessários
 * - Logging: Logs explícitos em cada etapa
 */

import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';
import type { ActivityFromCatalog } from '../agente-jota/capabilities/shared/types';

interface CatalogData {
  activities: ActivityFromCatalog[];
  types: string[];
  categories: string[];
  total: number;
  version: string;
}

class ActivityCatalogService {
  private cache: CatalogData | null = null;
  private lastLoadTime: number = 0;
  private readonly CACHE_DURATION_MS = 60000; // 1 minuto

  /**
   * Carrega e valida o catálogo de atividades.
   * 
   * @throws Error se arquivo não existir, schema inválido, ou catálogo vazio
   * @returns Catálogo processado com activities, types, categories
   */
  async loadCatalog(): Promise<CatalogData> {
    console.log('📂 [CatalogService] Iniciando carregamento do catálogo...');
    
    // Verificar cache válido
    if (this.cache && (Date.now() - this.lastLoadTime < this.CACHE_DURATION_MS)) {
      console.log(`📦 [CatalogService] Usando cache: ${this.cache.total} atividades`);
      return this.cache;
    }

    // FASE 1: Validar import existe
    if (!schoolPowerActivitiesData) {
      throw new Error('FATAL: Import do JSON falhou. schoolPowerActivitiesData é null.');
    }

    const rawData = schoolPowerActivitiesData as any;

    // FASE 2: Validar é objeto
    if (typeof rawData !== 'object') {
      throw new Error(`FATAL: Tipo inválido. Esperado objeto, recebido ${typeof rawData}`);
    }

    // FASE 3: Validar campo atividades
    if (!rawData.atividades) {
      console.error('❌ [CatalogService] Campos disponíveis:', Object.keys(rawData));
      throw new Error('FATAL: Schema incorreto. Campo "atividades" não encontrado.');
    }

    // FASE 4: Validar é array
    if (!Array.isArray(rawData.atividades)) {
      throw new Error(`FATAL: "atividades" deve ser array, recebido ${typeof rawData.atividades}`);
    }

    // FASE 5: Validar não vazio
    if (rawData.atividades.length === 0) {
      throw new Error('FATAL: Catálogo vazio. 0 atividades encontradas.');
    }

    console.log(`📊 [CatalogService] Raw data: ${rawData.atividades.length} atividades no JSON`);

    // FASE 6: Processar e validar cada atividade
    const activities: ActivityFromCatalog[] = rawData.atividades
      .filter((a: any) => {
        if (!a) return false;
        if (a.enabled === false) {
          console.log(`⏭️ [CatalogService] Atividade ${a.id} desabilitada, ignorando`);
          return false;
        }
        return true;
      })
      .map((a: any, index: number): ActivityFromCatalog => ({
        id: a.id || `auto-${index}`,
        titulo: a.titulo || a.name || 'Atividade sem título',
        tipo: a.tipo || 'atividade',
        categoria: a.categoria || 'geral',
        materia: a.materia || 'geral',
        nivel_dificuldade: a.nivel_dificuldade || 'intermediario',
        tags: a.tags || [],
        descricao: a.descricao || a.description || '',
        icone: a.icone,
        cor: a.cor,
        enabled: true,
        campos_obrigatorios: a.campos_obrigatorios || [],
        campos_opcionais: a.campos_opcionais || [],
        schema_campos: a.schema_campos || {}
      }));

    // Extrair tipos e categorias únicos
    const types = [...new Set(activities.map(a => a.tipo))];
    const categories = [...new Set(activities.map(a => a.categoria))];

    // Construir resultado
    const catalogData: CatalogData = {
      activities,
      types,
      categories,
      total: activities.length,
      version: rawData.versao || '2.0'
    };

    // Salvar cache
    this.cache = catalogData;
    this.lastLoadTime = Date.now();

    console.log(`✅ [CatalogService] Catálogo carregado com SUCESSO:`);
    console.log(`   📊 Total: ${catalogData.total} atividades`);
    console.log(`   📋 Tipos: ${types.join(', ')}`);
    console.log(`   📁 Categorias: ${categories.join(', ')}`);
    console.log(`   🔖 IDs: ${activities.map(a => a.id).join(', ')}`);

    return catalogData;
  }

  /**
   * Obtém catálogo do cache (sync) ou null se não carregado
   */
  getCachedCatalog(): CatalogData | null {
    return this.cache;
  }

  /**
   * Limpa o cache forçando reload na próxima chamada
   */
  clearCache(): void {
    this.cache = null;
    this.lastLoadTime = 0;
    console.log('🗑️ [CatalogService] Cache limpo');
  }

  /**
   * Valida se uma lista de IDs existe no catálogo
   */
  validateIds(ids: string[]): { valid: boolean; invalidIds: string[] } {
    if (!this.cache) {
      console.warn('⚠️ [CatalogService] Validação sem cache carregado');
      return { valid: false, invalidIds: ids };
    }

    const validIdSet = new Set(this.cache.activities.map(a => a.id));
    const invalidIds = ids.filter(id => !validIdSet.has(id));

    return {
      valid: invalidIds.length === 0,
      invalidIds
    };
  }

  /**
   * Busca atividade por ID
   */
  getActivityById(id: string): ActivityFromCatalog | undefined {
    return this.cache?.activities.find(a => a.id === id);
  }
}

export const activityCatalogService = new ActivityCatalogService();
export default activityCatalogService;

/**
 * CAPABILITY 2: pesquisar_atividades_disponiveis
 * 
 * Responsabilidade ÚNICA: Consultar o catálogo de atividades disponíveis
 * via Activity Catalog Service.
 * 
 * ARQUITETURA API-FIRST:
 * - Recebe: CapabilityInput
 * - Retorna: CapabilityOutput padronizado
 * - Usa: activityCatalogService para file loading
 * 
 * Princípios:
 * - Fail-fast se dados não carregam
 * - Debug log em cada etapa
 * - Validação rigorosa
 */

import { activityCatalogService } from '../../../../services/activity-catalog.service';
import { 
  ActivityFromCatalog, 
  FilterOptions, 
  SearchAvailableActivitiesResult,
  buildAntiHallucinationPrompt,
  CapabilityInput,
  CapabilityOutput,
  DebugEntry
} from '../../shared/types';

interface PesquisarDisponiveisParams {
  filtros?: FilterOptions;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL - API-FIRST CAPABILITY
// ═══════════════════════════════════════════════════════════════════════════

export async function pesquisarAtividadesDisponiveisV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugEntry[] = [];
  const startTime = Date.now();
  const params = (input.context?.filtros || {}) as PesquisarDisponiveisParams;

  try {
    // LOG 1: Início
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: 'Iniciando carregamento do catálogo de atividades disponíveis via Service Layer.',
      technical_data: { filters: params.filtros }
    });

    // CARREGAR CATÁLOGO VIA SERVICE
    console.log('🔍 [Capability:PESQUISAR_DISPONIVEIS] Chamando Activity Catalog Service...');
    const catalog = await activityCatalogService.loadCatalog();

    // VALIDAÇÃO CRÍTICA
    if (!catalog) {
      throw new Error('Activity Catalog Service retornou null');
    }

    if (!catalog.activities || catalog.activities.length === 0) {
      throw new Error('Catálogo carregou mas não contém atividades');
    }

    // LOG 2: Dados carregados
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `✅ SUCESSO: Carregadas ${catalog.total} atividades do catálogo. Tipos disponíveis: ${catalog.types.join(', ')}. Categorias: ${catalog.categories.join(', ')}.`,
      technical_data: {
        count: catalog.total,
        types: catalog.types,
        categories: catalog.categories,
        ids: catalog.activities.map(a => a.id)
      }
    });

    // APLICAR FILTROS SE EXISTIREM
    let filteredActivities = catalog.activities;
    
    if (params.filtros) {
      filteredActivities = filterActivities(catalog.activities, params.filtros);
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'info',
        narrative: `Filtros aplicados: ${catalog.total} → ${filteredActivities.length} atividades`,
        technical_data: { filters: params.filtros, original: catalog.total, filtered: filteredActivities.length }
      });
    }

    const validIds = filteredActivities.map(a => a.id);
    const elapsedTime = Date.now() - startTime;

    // LOG 3: Conclusão
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `Consulta concluída em ${elapsedTime}ms. Retornando ${filteredActivities.length} atividades para próxima capability.`,
      technical_data: { duration_ms: elapsedTime, valid_ids: validIds }
    });

    // RETORNO PADRONIZADO
    return {
      success: true,
      capability_id: 'pesquisar_atividades_disponiveis',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        catalog: filteredActivities,
        count: filteredActivities.length,
        types: catalog.types,
        categories: catalog.categories,
        summary: filteredActivities.map(a => ({
          id: a.id,
          titulo: a.titulo,
          tipo: a.tipo,
          categoria: a.categoria
        })),
        valid_ids: validIds,
        catalog_version: catalog.version
      },
      error: null,
      debug_log,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'schoolPowerActivities.json via ActivityCatalogService'
      }
    };

  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // LOG ERRO
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `❌ ERRO CRÍTICO: Não consegui carregar o catálogo. Razão: ${errorMessage}. Sistema NÃO pode prosseguir sem estes dados.`,
      technical_data: { 
        error: errorMessage, 
        stack: error instanceof Error ? error.stack : undefined,
        duration_ms: elapsedTime
      }
    });

    console.error('❌ [Capability:PESQUISAR_DISPONIVEIS] ERRO:', errorMessage);

    return {
      success: false,
      capability_id: 'pesquisar_atividades_disponiveis',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'CATALOG_LOAD_FAILED',
        message: errorMessage,
        severity: 'critical',
        recoverable: false,
        recovery_suggestion: 'Verificar path do arquivo schoolPowerActivities.json e formato do JSON'
      },
      debug_log,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'schoolPowerActivities.json'
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO LEGACY (Compatibilidade com executor atual)
// ═══════════════════════════════════════════════════════════════════════════

export async function pesquisarAtividadesDisponiveis(
  params: PesquisarDisponiveisParams = {}
): Promise<SearchAvailableActivitiesResult> {
  console.log('🔍 [Capability:PESQUISAR_DISPONIVEIS] Consultando catálogo via Service Layer');
  
  const startTime = Date.now();
  
  try {
    // Usar o novo service
    const catalog = await activityCatalogService.loadCatalog();
    
    let filteredActivities = catalog.activities;
    
    if (params.filtros) {
      filteredActivities = filterActivities(catalog.activities, params.filtros);
      console.log(`🔎 [Capability:PESQUISAR_DISPONIVEIS] Filtros aplicados: ${catalog.total} → ${filteredActivities.length}`);
    }

    const validIds = filteredActivities.map(a => a.id);
    const elapsedTime = Date.now() - startTime;

    console.log(`✅ [Capability:PESQUISAR_DISPONIVEIS] Concluído em ${elapsedTime}ms. ${filteredActivities.length} atividades.`);

    return {
      found: filteredActivities.length > 0,
      count: filteredActivities.length,
      activities: filteredActivities,
      filtered_count: params.filtros ? filteredActivities.length : undefined,
      filters_applied: params.filtros,
      metadata: {
        catalog_version: catalog.version,
        query_timestamp: new Date().toISOString(),
        source: "schoolPowerActivities.json"
      },
      summary: `Encontradas ${filteredActivities.length} atividade(s) disponível(is) no catálogo`,
      valid_ids: validIds
    };

  } catch (error) {
    console.error('❌ [Capability:PESQUISAR_DISPONIVEIS] Erro ao carregar catálogo:', error);
    
    return {
      found: false,
      count: 0,
      activities: [],
      metadata: {
        catalog_version: 'error',
        query_timestamp: new Date().toISOString(),
        source: "schoolPowerActivities.json"
      },
      summary: `Erro ao carregar catálogo: ${(error as Error).message}`,
      valid_ids: []
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

function filterActivities(
  catalog: ActivityFromCatalog[],
  filters: FilterOptions
): ActivityFromCatalog[] {
  let result = [...catalog];

  if (filters.tipo && filters.tipo.length > 0) {
    result = result.filter(a => 
      filters.tipo!.some(t => a.tipo.toLowerCase() === t.toLowerCase())
    );
  }

  if (filters.categoria && filters.categoria.length > 0) {
    result = result.filter(a => 
      filters.categoria!.some(c => a.categoria.toLowerCase() === c.toLowerCase())
    );
  }

  if (filters.disciplina && filters.disciplina.length > 0) {
    result = result.filter(a => 
      a.materia.toLowerCase() === 'geral' ||
      filters.disciplina!.some(d => a.materia.toLowerCase().includes(d.toLowerCase()))
    );
  }

  if (filters.nivel && filters.nivel.length > 0) {
    result = result.filter(a => 
      filters.nivel!.some(n => a.nivel_dificuldade.toLowerCase() === n.toLowerCase())
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(a => 
      a.tags.some(tag => 
        filters.tags!.some(filterTag => 
          tag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
    );
  }

  if (filters.search_text) {
    const searchLower = filters.search_text.toLowerCase();
    result = result.filter(a => 
      a.titulo.toLowerCase().includes(searchLower) ||
      a.descricao.toLowerCase().includes(searchLower) ||
      a.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  return result;
}

export function formatAvailableActivitiesForPrompt(result: SearchAvailableActivitiesResult): string {
  const activitiesList = result.activities.map((a, idx) => `
${idx + 1}. **${a.titulo}** (ID: ${a.id})
   - Tipo: ${a.tipo}
   - Categoria: ${a.categoria}
   - Matéria: ${a.materia}
   - Descrição: ${a.descricao}
   - Campos obrigatórios: ${a.campos_obrigatorios.join(', ')}
`).join('');

  return `
ATIVIDADES DISPONÍVEIS NO CATÁLOGO (FONTE DE VERDADE):
═══════════════════════════════════════════════════════════

Total: ${result.count}
Versão do catálogo: ${result.metadata.catalog_version}
Fonte: ${result.metadata.source}

IDs VÁLIDOS (whitelist):
${result.valid_ids.join(', ')}

LISTA COMPLETA:
${activitiesList}

${buildAntiHallucinationPrompt(result.valid_ids)}
  `.trim();
}

export function validateActivitySelection(
  selectedIds: string[],
  validResult: SearchAvailableActivitiesResult
): { valid: boolean; invalidIds: string[]; message: string } {
  const validIdSet = new Set(validResult.valid_ids);
  const invalidIds = selectedIds.filter(id => !validIdSet.has(id));
  
  if (invalidIds.length > 0) {
    return {
      valid: false,
      invalidIds,
      message: `ERRO DE VALIDAÇÃO: Os seguintes IDs não existem no catálogo: ${invalidIds.join(', ')}. Use APENAS IDs da lista válida.`
    };
  }
  
  return {
    valid: true,
    invalidIds: [],
    message: 'Todos os IDs selecionados são válidos'
  };
}

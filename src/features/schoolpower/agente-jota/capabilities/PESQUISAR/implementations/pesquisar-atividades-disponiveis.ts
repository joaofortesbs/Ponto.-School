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
  DebugEntry,
  DataConfirmation,
  createDataConfirmation,
  createDataCheck
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
    // ═══════════════════════════════════════════════════════════════════════════
    // ETAPA 1: INICIALIZAÇÃO E LOCALIZAÇÃO DO ARQUIVO
    // ═══════════════════════════════════════════════════════════════════════════
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: '📂 ETAPA 1: Iniciando busca no catálogo de atividades do School Power...',
      technical_data: { 
        arquivo_alvo: 'schoolPowerActivities.json',
        caminho: 'src/data/schoolPowerActivities.json',
        filtros_solicitados: params.filtros || 'nenhum'
      }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ETAPA 2: CARREGAMENTO DO ARQUIVO VIA SERVICE LAYER
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('🔍 [Capability:PESQUISAR_DISPONIVEIS] Chamando Activity Catalog Service...');
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'info',
      narrative: '⏳ ETAPA 2: Acessando arquivo schoolPowerActivities.json via ActivityCatalogService...',
      technical_data: { 
        servico: 'ActivityCatalogService',
        metodo: 'loadCatalog()',
        cache_ativo: true,
        cache_ttl: '1 minuto'
      }
    });

    const catalog = await activityCatalogService.loadCatalog();

    // CONFIRMAÇÃO 1: Arquivo carregado?
    const arquivoCarregado = catalog !== null;
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: arquivoCarregado 
        ? '✅ CONFIRMAÇÃO: Arquivo schoolPowerActivities.json carregado com sucesso!'
        : '❌ FALHA: Arquivo não foi carregado - retorno null do service',
      technical_data: { 
        confirmacao: 'arquivo_carregado',
        status: arquivoCarregado ? 'SUCESSO' : 'FALHA',
        dados_recebidos: arquivoCarregado,
        bloqueia_proxima_etapa: !arquivoCarregado
      }
    });

    // VALIDAÇÃO CRÍTICA
    if (!catalog) {
      throw new Error('Activity Catalog Service retornou null - arquivo não encontrado ou inválido');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ETAPA 3: EXTRAÇÃO E PARSING DOS DADOS
    // ═══════════════════════════════════════════════════════════════════════════
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: '🔍 ETAPA 3: Extraindo atividades do JSON carregado...',
      technical_data: { 
        versao_catalogo: catalog.version,
        total_bruto: catalog.total,
        tipos_encontrados: catalog.types,
        categorias_encontradas: catalog.categories
      }
    });

    // CONFIRMAÇÃO 2: Atividades existem no arquivo?
    const temAtividades = catalog.activities && catalog.activities.length > 0;
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: temAtividades 
        ? `✅ CONFIRMAÇÃO: Encontradas ${catalog.activities.length} atividades no arquivo!`
        : '❌ FALHA: Arquivo carregou mas não contém atividades',
      technical_data: { 
        confirmacao: 'atividades_encontradas',
        status: temAtividades ? 'SUCESSO' : 'FALHA',
        quantidade: catalog.activities?.length || 0,
        bloqueia_proxima_etapa: !temAtividades
      }
    });

    if (!temAtividades) {
      throw new Error('Catálogo carregou mas não contém atividades');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ETAPA 4: EXTRAÇÃO DOS IDs POR ATIVIDADE
    // ═══════════════════════════════════════════════════════════════════════════
    const idsExtraidos = catalog.activities.map(a => a.id);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `📋 ETAPA 4: Extraídos ${idsExtraidos.length} IDs únicos do catálogo.`,
      technical_data: { 
        ids_extraidos: idsExtraidos,
        quantidade_ids: idsExtraidos.length,
        lista_atividades: catalog.activities.map(a => ({
          id: a.id,
          titulo: a.titulo,
          tipo: a.tipo,
          categoria: a.categoria
        }))
      }
    });

    // CONFIRMAÇÃO 3: IDs válidos extraídos?
    const idsValidos = idsExtraidos.every(id => typeof id === 'string' && id.length > 0);
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: idsValidos 
        ? `✅ CONFIRMAÇÃO: Todos os ${idsExtraidos.length} IDs são strings válidas!`
        : '⚠️ AVISO: Alguns IDs podem estar inválidos ou vazios',
      technical_data: { 
        confirmacao: 'ids_validos',
        status: idsValidos ? 'SUCESSO' : 'AVISO',
        ids_verificados: idsExtraidos.length,
        formato_esperado: 'string não vazia'
      }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ETAPA 5: APLICAÇÃO DE FILTROS (SE SOLICITADO)
    // ═══════════════════════════════════════════════════════════════════════════
    let filteredActivities = catalog.activities;
    
    if (params.filtros) {
      filteredActivities = filterActivities(catalog.activities, params.filtros);
      
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔎 ETAPA 5: Filtros aplicados - ${catalog.total} → ${filteredActivities.length} atividades após filtragem.`,
        technical_data: { 
          filtros_aplicados: params.filtros, 
          antes_filtro: catalog.total, 
          depois_filtro: filteredActivities.length,
          atividades_filtradas: filteredActivities.map(a => ({ id: a.id, titulo: a.titulo }))
        }
      });

      // CONFIRMAÇÃO 4: Filtros resultaram em atividades?
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'confirmation',
        narrative: filteredActivities.length > 0 
          ? `✅ CONFIRMAÇÃO: Filtros retornaram ${filteredActivities.length} atividades!`
          : '⚠️ AVISO: Filtros não retornaram nenhuma atividade - usando todas',
        technical_data: { 
          confirmacao: 'filtros_resultado',
          status: filteredActivities.length > 0 ? 'SUCESSO' : 'AVISO',
          quantidade_pos_filtro: filteredActivities.length
        }
      });
    } else {
      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'info',
        narrative: 'ℹ️ ETAPA 5: Nenhum filtro solicitado - retornando todas as atividades.',
        technical_data: { 
          filtros_aplicados: 'nenhum',
          total_atividades: filteredActivities.length
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ETAPA 6: VALIDAÇÃO DE SCHEMA DAS ATIVIDADES
    // ═══════════════════════════════════════════════════════════════════════════
    const validIds = filteredActivities.map(a => a.id);
    const atividadesComSchema = filteredActivities.filter(a => a.schema_campos);
    
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: `📝 ETAPA 6: Validando schema das ${filteredActivities.length} atividades...`,
      technical_data: { 
        atividades_com_schema: atividadesComSchema.length,
        atividades_sem_schema: filteredActivities.length - atividadesComSchema.length,
        campos_obrigatorios_exemplo: filteredActivities[0]?.campos_obrigatorios || []
      }
    });

    // CONFIRMAÇÃO 5: Todas têm schema?
    const todasTemSchema = filteredActivities.every(a => a.schema_campos);
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: todasTemSchema 
        ? `✅ CONFIRMAÇÃO: Todas as ${filteredActivities.length} atividades possuem schema de campos!`
        : `⚠️ AVISO: ${atividadesComSchema.length}/${filteredActivities.length} atividades têm schema`,
      technical_data: { 
        confirmacao: 'schema_validado',
        status: todasTemSchema ? 'SUCESSO' : 'AVISO',
        com_schema: atividadesComSchema.length,
        sem_schema: filteredActivities.length - atividadesComSchema.length
      }
    });

    const elapsedTime = Date.now() - startTime;

    // ═══════════════════════════════════════════════════════════════════════════
    // ETAPA 7: CONFIRMAÇÃO FINAL DE DADOS RECEBIDOS
    // ═══════════════════════════════════════════════════════════════════════════
    const dataConfirmation = createDataConfirmation([
      createDataCheck('catalog_loaded', 'Arquivo carregado', catalog !== null, catalog?.total, '> 0 atividades'),
      createDataCheck('has_activities', 'Atividades encontradas', filteredActivities.length > 0, filteredActivities.length, '> 0'),
      createDataCheck('has_valid_ids', 'IDs extraídos', validIds.length > 0, validIds.length, '> 0'),
      createDataCheck('activities_have_schema', 'Schema validado', todasTemSchema, `${atividadesComSchema.length}/${filteredActivities.length}`, 'todos'),
      createDataCheck('catalog_version_ok', 'Versão válida', !!catalog.version, catalog.version, 'string')
    ]);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `🎯 ETAPA 7 - RESUMO FINAL: ${dataConfirmation.summary}`,
      technical_data: { 
        confirmacao: 'resumo_final',
        todos_checks_passaram: dataConfirmation.confirmed,
        checks_detalhados: dataConfirmation.checks.map(c => ({ 
          id: c.id, 
          label: c.label,
          passou: c.passed, 
          valor: c.value,
          esperado: c.expected
        })),
        pode_prosseguir: dataConfirmation.confirmed,
        bloqueia_proxima_etapa: dataConfirmation.blocksNextStep && !dataConfirmation.confirmed
      }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ETAPA 8: RESULTADO FINAL PARA PRÓXIMA CAPABILITY
    // ═══════════════════════════════════════════════════════════════════════════
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `✅ ETAPA 8: Pesquisa concluída em ${elapsedTime}ms! Entregando ${filteredActivities.length} atividades para próxima capability.`,
      technical_data: { 
        resultado_resumo: `Encontradas ${filteredActivities.length} atividade(s) disponível(is) no catálogo`,
        duracao_ms: elapsedTime, 
        ids_validos_para_uso: validIds,
        tipos_disponiveis: catalog.types,
        categorias_disponiveis: catalog.categories,
        pronto_para_proxima_etapa: true
      }
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
      data_confirmation: dataConfirmation,
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

/**
 * CAPABILITY 2: pesquisar_atividades_disponiveis
 * 
 * Responsabilidade: Consultar o catálogo completo de atividades que o sistema
 * pode criar, definido no arquivo JSON local schoolPowerActivities.json.
 * 
 * Fonte de Dados: schoolPowerActivities.json (static import)
 * 
 * SISTEMA DE VALIDAÇÃO ROBUSTA:
 * - Fail-fast se arquivo não carrega
 * - Validação de schema obrigatória
 * - Log explícito de quantidades
 */

import schoolPowerActivitiesData from '../../../../data/schoolPowerActivities.json';
import { 
  ActivityFromCatalog, 
  FilterOptions, 
  SearchAvailableActivitiesResult,
  buildAntiHallucinationPrompt 
} from '../../shared/types';

interface PesquisarDisponiveisParams {
  filtros?: FilterOptions;
}

// ═══════════════════════════════════════════════════════════════════════════
// FASE 1: VALIDAÇÃO CRÍTICA DO IMPORT (FAIL-FAST)
// ═══════════════════════════════════════════════════════════════════════════
function validateCatalogImport(): { versao: string; total_atividades: number; atividades: any[] } {
  console.log('🔍 [VALIDAÇÃO] Verificando import do catálogo...');
  
  // Check 1: Import existe?
  if (!schoolPowerActivitiesData) {
    console.error('❌ [FATAL] schoolPowerActivitiesData é null/undefined');
    throw new Error('FATAL: Import do arquivo JSON falhou. schoolPowerActivitiesData é null.');
  }
  
  const data = schoolPowerActivitiesData as any;
  
  // Check 2: É um objeto?
  if (typeof data !== 'object') {
    console.error('❌ [FATAL] schoolPowerActivitiesData não é um objeto:', typeof data);
    throw new Error(`FATAL: Tipo inválido. Esperado objeto, recebido ${typeof data}`);
  }
  
  // Check 3: Tem campo atividades?
  if (!data.atividades) {
    console.error('❌ [FATAL] Campo "atividades" não existe no JSON');
    console.error('❌ [DEBUG] Campos disponíveis:', Object.keys(data));
    throw new Error('FATAL: Schema incorreto. Campo "atividades" não encontrado.');
  }
  
  // Check 4: atividades é array?
  if (!Array.isArray(data.atividades)) {
    console.error('❌ [FATAL] Campo "atividades" não é array:', typeof data.atividades);
    throw new Error(`FATAL: "atividades" deve ser array, recebido ${typeof data.atividades}`);
  }
  
  // Check 5: Array não vazio?
  if (data.atividades.length === 0) {
    console.error('❌ [FATAL] Array de atividades está VAZIO');
    throw new Error('FATAL: Catálogo vazio. Verifique o arquivo schoolPowerActivities.json');
  }
  
  console.log(`✅ [VALIDAÇÃO] Import OK! Versão: ${data.versao}, Total: ${data.atividades.length} atividades`);
  
  return {
    versao: data.versao || '2.0',
    total_atividades: data.total_atividades || data.atividades.length,
    atividades: data.atividades
  };
}

// Validar IMEDIATAMENTE no load do módulo
let catalogData: { versao: string; total_atividades: number; atividades: any[] };
try {
  catalogData = validateCatalogImport();
} catch (error) {
  console.error('💥 [CATÁLOGO] FALHA CRÍTICA AO CARREGAR:', error);
  // Fallback para estrutura vazia mas válida
  catalogData = { versao: 'ERRO', total_atividades: 0, atividades: [] };
}

let cachedActivities: ActivityFromCatalog[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

// ═══════════════════════════════════════════════════════════════════════════
// FASE 2: TRANSFORMAÇÃO E VALIDAÇÃO DE CADA ATIVIDADE
// ═══════════════════════════════════════════════════════════════════════════
function loadAndValidateCatalog(): ActivityFromCatalog[] {
  // Usar cache se válido
  if (cachedActivities && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL_MS)) {
    console.log(`📦 [CACHE] Usando cache: ${cachedActivities.length} atividades`);
    return cachedActivities;
  }

  console.log('📖 [LOAD] Processando catálogo do JSON...');
  console.log(`📊 [LOAD] Raw data: ${catalogData.atividades.length} itens no array`);

  // Validar que temos dados
  if (!catalogData.atividades || catalogData.atividades.length === 0) {
    console.error('❌ [LOAD] ERRO: catalogData.atividades está vazio!');
    console.error('❌ [DEBUG] catalogData:', JSON.stringify(catalogData).substring(0, 200));
    return [];
  }

  const rawActivities = catalogData.atividades;
  console.log(`📋 [LOAD] Primeira atividade raw:`, JSON.stringify(rawActivities[0]).substring(0, 150));
  
  const validatedActivities: ActivityFromCatalog[] = rawActivities
    .filter((a: any) => {
      if (!a) {
        console.warn('⚠️ [FILTER] Atividade null/undefined ignorada');
        return false;
      }
      if (a.enabled === false) {
        console.log(`⏭️ [FILTER] Atividade ${a.id} desabilitada, ignorando`);
        return false;
      }
      return true;
    })
    .map((a: any, index: number) => {
      const activity: ActivityFromCatalog = {
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
      };
      return activity;
    });

  cachedActivities = validatedActivities;
  cacheTimestamp = Date.now();

  console.log(`✅ [LOAD] ${validatedActivities.length} atividades processadas e validadas`);
  console.log(`📋 [LOAD] IDs carregados: ${validatedActivities.map(a => a.id).join(', ')}`);

  return validatedActivities;
}

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

export async function pesquisarAtividadesDisponiveis(
  params: PesquisarDisponiveisParams = {}
): Promise<SearchAvailableActivitiesResult> {
  console.log('🔍 [Capability:PESQUISAR_DISPONIVEIS] Consultando catálogo de atividades');
  
  const startTime = Date.now();
  
  try {
    const allActivities = loadAndValidateCatalog();
    
    let filteredActivities = allActivities;
    
    if (params.filtros) {
      filteredActivities = filterActivities(allActivities, params.filtros);
      console.log(`🔎 [Capability:PESQUISAR_DISPONIVEIS] Filtros aplicados: ${allActivities.length} → ${filteredActivities.length}`);
    }

    const validIds = filteredActivities.map(a => a.id);

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ [Capability:PESQUISAR_DISPONIVEIS] Concluído em ${elapsedTime}ms`);

    return {
      found: filteredActivities.length > 0,
      count: filteredActivities.length,
      activities: filteredActivities,
      filtered_count: params.filtros ? filteredActivities.length : undefined,
      filters_applied: params.filtros,
      metadata: {
        catalog_version: catalogData.versao || '2.0',
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
        catalog_version: catalogData.versao || 'unknown',
        query_timestamp: new Date().toISOString(),
        source: "schoolPowerActivities.json"
      },
      summary: `Erro ao carregar catálogo: ${(error as Error).message}`,
      valid_ids: []
    };
  }
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

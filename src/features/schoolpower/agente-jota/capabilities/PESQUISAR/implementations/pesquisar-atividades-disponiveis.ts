/**
 * CAPABILITY 2: pesquisar_atividades_disponiveis
 * 
 * Responsabilidade: Consultar o catálogo completo de atividades que o sistema
 * pode criar, definido no arquivo JSON local schoolPowerActivities.json.
 * 
 * Fonte de Dados: schoolPowerActivities.json (static import)
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

const catalogData = schoolPowerActivitiesData as {
  versao: string;
  total_atividades: number;
  atividades: any[];
};

let cachedActivities: ActivityFromCatalog[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

function loadAndValidateCatalog(): ActivityFromCatalog[] {
  if (cachedActivities && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL_MS)) {
    console.log('📦 [Capability:PESQUISAR_DISPONIVEIS] Usando cache do catálogo');
    return cachedActivities;
  }

  console.log('📖 [Capability:PESQUISAR_DISPONIVEIS] Carregando catálogo do JSON');

  const rawActivities = catalogData.atividades || [];
  
  const validatedActivities: ActivityFromCatalog[] = rawActivities
    .filter((a: any) => a.enabled !== false)
    .map((a: any) => ({
      id: a.id,
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

  cachedActivities = validatedActivities;
  cacheTimestamp = Date.now();

  console.log(`✅ [Capability:PESQUISAR_DISPONIVEIS] ${validatedActivities.length} atividades validadas`);

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

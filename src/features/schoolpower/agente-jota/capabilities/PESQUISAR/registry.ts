/**
 * PESQUISAR CAPABILITIES - Registry das Capabilities de Pesquisa
 * 
 * Capabilities Core:
 * 1. pesquisar_atividades_conta - Busca no banco Neon (atividades do professor)
 * 2. pesquisar_atividades_disponiveis - Busca no catálogo JSON local
 */

import { pesquisarAtividadesDisponiveis, pesquisarAtividadesDisponiveisV2, formatAvailableActivitiesForPrompt } from './implementations/pesquisar-atividades-disponiveis';
import { pesquisarAtividadesConta, formatAccountActivitiesForPrompt } from './implementations/pesquisar-atividades-conta';
import { pesquisarAtividadesDisponiveisSchema } from './schemas/pesquisar-atividades-schema';
import { createDebugEntry } from '../../../interface-chat-producao/debug-system/DebugStore';

export const PESQUISAR_CAPABILITIES = {
  
  pesquisar_atividades_conta: {
    funcao: 'pesquisar_atividades_conta',
    name: 'pesquisar_atividades_conta',
    displayName: 'Vou buscar suas atividades anteriores',
    categoria: 'PESQUISAR',
    description: 'Busca atividades que o professor já criou anteriormente no banco de dados',
    descricao: 'Busca atividades anteriores do professor para evitar duplicações',
    schema: null,
    execute: async (params: any) => {
      const result = await pesquisarAtividadesConta(params);
      return {
        ...result,
        prompt_context: formatAccountActivitiesForPrompt(result)
      };
    },
    parameters: {
      professor_id: { type: 'string', required: true, description: 'ID do professor' },
      limit: { type: 'number', required: false, description: 'Limite de resultados' },
      disciplina: { type: 'string', required: false, description: 'Filtrar por disciplina' },
      tipo: { type: 'string', required: false, description: 'Filtrar por tipo' }
    },
    isSequential: false,
    showProgress: false,
    cacheResults: true,
    cacheTTL: 300000
  },

  pesquisar_atividades_disponiveis: {
    funcao: 'pesquisar_atividades_disponiveis',
    name: 'pesquisar_atividades_disponiveis',
    displayName: 'Vou pesquisar quais atividades eu posso criar',
    categoria: 'PESQUISAR',
    description: 'Consulta o catálogo completo de atividades disponíveis no School Power',
    descricao: 'Consulta as atividades disponíveis na plataforma com filtros',
    schema: pesquisarAtividadesDisponiveisSchema,
    execute: async (params: any) => {
      const capabilityId = 'pesquisar_atividades_disponiveis';
      const executionId = `exec_${Date.now()}`;
      
      // Usar função V2 com logs detalhados
      const v2Result = await pesquisarAtividadesDisponiveisV2({
        capability_id: capabilityId,
        execution_id: executionId,
        context: params
      });

      // Injetar logs de debug no DebugStore
      if (v2Result.debug_log && v2Result.debug_log.length > 0) {
        console.log(`📋 [Registry:PESQUISAR] Injetando ${v2Result.debug_log.length} entries no DebugStore`);
        
        v2Result.debug_log.forEach((entry) => {
          const severity = entry.type === 'error' ? 'high' : 
                          entry.type === 'warning' ? 'medium' : 
                          entry.type === 'confirmation' ? (entry.technical_data?.status === 'FALHA' ? 'high' : 'low') :
                          'low';
          
          createDebugEntry(
            capabilityId,
            'Pesquisar Atividades Disponíveis',
            entry.type as any,
            entry.narrative,
            severity,
            entry.technical_data
          );
        });
      }

      // Converter V2 para formato esperado pelo sistema legado
      if (v2Result.success && v2Result.data) {
        const legacyResult = {
          found: v2Result.data.count > 0,
          count: v2Result.data.count,
          activities: v2Result.data.catalog,
          types: v2Result.data.types,
          categories: v2Result.data.categories,
          valid_ids: v2Result.data.valid_ids,
          metadata: {
            catalog_version: v2Result.data.catalog_version,
            query_timestamp: v2Result.timestamp,
            source: v2Result.metadata.data_source
          },
          summary: `Encontradas ${v2Result.data.count} atividade(s) disponível(is) no catálogo`,
          prompt_context: formatAvailableActivitiesForPrompt({
            found: v2Result.data.count > 0,
            count: v2Result.data.count,
            activities: v2Result.data.catalog,
            metadata: {
              catalog_version: v2Result.data.catalog_version,
              query_timestamp: v2Result.timestamp,
              source: v2Result.metadata.data_source
            },
            valid_ids: v2Result.data.valid_ids
          } as any),
          // Preservar debug_log e data_confirmation para o executor
          debug_log: v2Result.debug_log,
          data_confirmation: v2Result.data_confirmation
        };
        return legacyResult;
      }

      // Fallback para erro
      return {
        found: false,
        count: 0,
        activities: [],
        error: v2Result.error?.message || 'Erro desconhecido',
        debug_log: v2Result.debug_log,
        data_confirmation: v2Result.data_confirmation
      };
    },
    parameters: {
      filtros: { type: 'object', required: false, description: 'Filtros para busca' }
    },
    isSequential: true,
    showProgress: true,
    cacheResults: true,
    cacheTTL: 300000
  }
};

export default PESQUISAR_CAPABILITIES;

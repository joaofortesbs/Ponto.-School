/**
 * PESQUISAR CAPABILITIES - Registry das Capabilities de Pesquisa
 * 
 * Capabilities Core:
 * 1. pesquisar_atividades_conta - Busca no banco Neon (atividades do professor)
 * 2. pesquisar_atividades_disponiveis - Busca no catálogo JSON local
 * 3. pesquisar_bncc - Pesquisa habilidades da BNCC para alinhamento curricular
 * 4. pesquisar_banco_questoes - Pesquisa questões de referência no banco de questões
 */

import { pesquisarAtividadesDisponiveis, pesquisarAtividadesDisponiveisV2, formatAvailableActivitiesForPrompt } from './implementations/pesquisar-atividades-disponiveis';
import { pesquisarAtividadesConta, formatAccountActivitiesForPrompt } from './implementations/pesquisar-atividades-conta';
import { pesquisarBnccV2 } from './implementations/pesquisar-bncc';
import { pesquisarBancoQuestoesV2 } from './implementations/pesquisar-banco-questoes';
import { pesquisarAtividadesDisponiveisSchema } from './schemas/pesquisar-atividades-schema';
import { pesquisarBnccSchema } from './schemas/pesquisar-bncc-schema';
import { pesquisarBancoQuestoesSchema } from './schemas/pesquisar-banco-questoes-schema';
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
  },

  pesquisar_bncc: {
    funcao: 'pesquisar_bncc',
    name: 'pesquisar_bncc',
    displayName: 'Vou pesquisar habilidades BNCC para alinhamento curricular',
    categoria: 'PESQUISAR',
    description: 'Pesquisa habilidades da BNCC (Base Nacional Comum Curricular) por componente curricular, ano/série, código ou palavra-chave para garantir alinhamento curricular nas atividades geradas',
    descricao: 'Pesquisa habilidades BNCC para alinhamento curricular das atividades',
    schema: pesquisarBnccSchema,
    execute: async (params: any) => {
      const capabilityId = 'pesquisar_bncc';
      const executionId = `exec_${Date.now()}`;

      const v2Result = await pesquisarBnccV2({
        capability_id: capabilityId,
        execution_id: executionId,
        context: params
      });

      if (v2Result.debug_log && v2Result.debug_log.length > 0) {
        console.log(`📋 [Registry:PESQUISAR_BNCC] Injetando ${v2Result.debug_log.length} entries no DebugStore`);

        v2Result.debug_log.forEach((entry) => {
          const severity = entry.type === 'error' ? 'high' :
                          entry.type === 'warning' ? 'medium' :
                          entry.type === 'confirmation' ? (entry.technical_data?.status === 'FALHA' ? 'high' : 'low') :
                          'low';

          createDebugEntry(
            capabilityId,
            'Pesquisar Habilidades BNCC',
            entry.type as any,
            entry.narrative,
            severity,
            entry.technical_data
          );
        });
      }

      if (v2Result.success && v2Result.data) {
        return {
          found: v2Result.data.count > 0,
          count: v2Result.data.count,
          habilidades: v2Result.data.habilidades,
          componentes: v2Result.data.componentes,
          anos: v2Result.data.anos,
          prompt_context: v2Result.data.prompt_context,
          summary: v2Result.data.summary,
          debug_log: v2Result.debug_log,
          data_confirmation: v2Result.data_confirmation
        };
      }

      return {
        found: false,
        count: 0,
        habilidades: [],
        error: v2Result.error?.message || 'Erro desconhecido',
        debug_log: v2Result.debug_log,
        data_confirmation: v2Result.data_confirmation
      };
    },
    parameters: {
      componente: { type: 'string', required: false, description: 'Componente curricular (Matemática, Língua Portuguesa, Ciências, História, Geografia)' },
      ano_serie: { type: 'string', required: false, description: 'Ano/série (ex: 7º Ano)' },
      busca_texto: { type: 'string', required: false, description: 'Palavra-chave para busca' },
      codigo: { type: 'string', required: false, description: 'Código BNCC específico (ex: EF07MA17)' },
      max_resultados: { type: 'number', required: false, description: 'Máximo de resultados (padrão: 5)' }
    },
    isSequential: false,
    showProgress: true,
    cacheResults: true,
    cacheTTL: 600000
  },

  pesquisar_banco_questoes: {
    funcao: 'pesquisar_banco_questoes',
    name: 'pesquisar_banco_questoes',
    displayName: 'Vou pesquisar questões de referência para garantir qualidade',
    categoria: 'PESQUISAR',
    description: 'Pesquisa questões de referência no banco de questões curado por componente curricular, tema, dificuldade e tipo para servir como modelo de qualidade na geração de conteúdo',
    descricao: 'Pesquisa questões de referência para garantir qualidade e padrão pedagógico nas atividades geradas',
    schema: pesquisarBancoQuestoesSchema,
    execute: async (params: any) => {
      const capabilityId = 'pesquisar_banco_questoes';
      const executionId = `exec_${Date.now()}`;

      const v2Result = await pesquisarBancoQuestoesV2({
        capability_id: capabilityId,
        execution_id: executionId,
        context: params
      });

      if (v2Result.debug_log && v2Result.debug_log.length > 0) {
        console.log(`📋 [Registry:PESQUISAR_BANCO_QUESTOES] Injetando ${v2Result.debug_log.length} entries no DebugStore`);

        v2Result.debug_log.forEach((entry) => {
          const severity = entry.type === 'error' ? 'high' :
                          entry.type === 'warning' ? 'medium' :
                          entry.type === 'confirmation' ? (entry.technical_data?.status === 'FALHA' ? 'high' : 'low') :
                          'low';

          createDebugEntry(
            capabilityId,
            'Pesquisar Banco de Questões',
            entry.type as any,
            entry.narrative,
            severity,
            entry.technical_data
          );
        });
      }

      if (v2Result.success && v2Result.data) {
        return {
          found: v2Result.data.count > 0,
          count: v2Result.data.count,
          questoes: v2Result.data.questoes,
          componentes: v2Result.data.componentes,
          temas: v2Result.data.temas,
          dificuldades: v2Result.data.dificuldades,
          prompt_context: v2Result.data.prompt_context,
          summary: v2Result.data.summary,
          debug_log: v2Result.debug_log,
          data_confirmation: v2Result.data_confirmation
        };
      }

      return {
        found: false,
        count: 0,
        questoes: [],
        error: v2Result.error?.message || 'Erro desconhecido',
        debug_log: v2Result.debug_log,
        data_confirmation: v2Result.data_confirmation
      };
    },
    parameters: {
      componente: { type: 'string', required: false, description: 'Componente curricular (Matemática, Língua Portuguesa, Ciências, História, Geografia)' },
      ano_serie: { type: 'string', required: false, description: 'Ano/série (ex: 7º Ano)' },
      tema: { type: 'string', required: false, description: 'Tema ou assunto específico (ex: frações, fotossíntese)' },
      dificuldade: { type: 'string', required: false, description: 'Nível de dificuldade (facil, medio, dificil)' },
      tipo_questao: { type: 'string', required: false, description: 'Tipo de questão (multipla_escolha, dissertativa, verdadeiro_falso, todos)' },
      max_resultados: { type: 'number', required: false, description: 'Máximo de resultados (padrão: 5)' }
    },
    isSequential: false,
    showProgress: true,
    cacheResults: true,
    cacheTTL: 600000
  }
};

export default PESQUISAR_CAPABILITIES;

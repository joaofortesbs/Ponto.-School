/**
 * PESQUISAR CAPABILITIES - Registry das Capabilities de Pesquisa
 * 
 * Capabilities Core:
 * 1. pesquisar_atividades_conta - Busca no banco Neon (atividades do professor)
 * 2. pesquisar_atividades_disponiveis - Busca no catálogo JSON local
 */

import { pesquisarAtividadesDisponiveis, formatAvailableActivitiesForPrompt } from './implementations/pesquisar-atividades-disponiveis';
import { pesquisarAtividadesConta, formatAccountActivitiesForPrompt } from './implementations/pesquisar-atividades-conta';
import { pesquisarAtividadesDisponiveisSchema } from './schemas/pesquisar-atividades-schema';

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
      const result = await pesquisarAtividadesDisponiveis(params);
      return {
        ...result,
        prompt_context: formatAvailableActivitiesForPrompt(result)
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

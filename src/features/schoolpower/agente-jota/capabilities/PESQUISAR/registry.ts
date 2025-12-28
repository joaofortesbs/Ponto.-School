import { pesquisarAtividadesDisponiveis } from './implementations/pesquisar-atividades-disponiveis';
import { pesquisarAtividadesDisponiveisSchema } from './schemas/pesquisar-atividades-schema';

export const PESQUISAR_CAPABILITIES = {
  pesquisar_atividades_disponiveis: {
    funcao: 'pesquisar_atividades_disponiveis',
    name: 'pesquisar_atividades_disponiveis',
    displayName: 'Vou pesquisar quais atividades eu posso criar',
    categoria: 'PESQUISAR',
    description: 'Consulta as atividades disponíveis na plataforma com filtros',
    descricao: 'Consulta as atividades disponíveis na plataforma com filtros',
    schema: pesquisarAtividadesDisponiveisSchema,
    execute: pesquisarAtividadesDisponiveis,
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

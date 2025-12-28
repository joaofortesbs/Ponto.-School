import { criarAtividades } from './implementations/criar-atividades';
import { criarAtividadesSchema } from './schemas/criar-atividades-schema';

export const CRIAR_ATIVIDADES_CAPABILITIES = {
  criar_atividades: {
    funcao: 'criar_atividades',
    name: 'criar_atividades',
    displayName: 'Vou criar todas as atividades',
    categoria: 'CRIAR',
    description: 'Constrói as atividades decididas e salva na plataforma',
    descricao: 'Constrói as atividades decididas e salva na plataforma',
    schema: criarAtividadesSchema,
    execute: criarAtividades,
    parameters: {
      atividades_decididas: { type: 'array', required: true, description: 'Atividades para criar' },
      configuracoes_criacao: { type: 'object', required: false, description: 'Configurações de criação' }
    },
    requiresPreviousCapability: 'decidir_atividades_criar',
    isSequential: true,
    showProgress: true,
    renderComponent: 'ActivityConstructionCard',
    streamProgress: true
  }
};

export default CRIAR_ATIVIDADES_CAPABILITIES;

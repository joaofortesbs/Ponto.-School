/**
 * CRIAR ATIVIDADES CAPABILITIES - Registry das Capabilities de Criação
 * 
 * Capability Core:
 * criar_atividade - Constrói atividades com IA e salva no banco
 */

import { criarAtividades } from './implementations/criar-atividades';
import { criarAtividadesSchema } from './schemas/criar-atividades-schema';
import { criarAtividade } from '../CRIAR/criar-atividade';

export const CRIAR_ATIVIDADES_CAPABILITIES = {
  
  criar_atividade: {
    funcao: 'criar_atividade',
    name: 'criar_atividade',
    displayName: 'Vou criar as atividades selecionadas',
    categoria: 'CRIAR',
    description: 'Preenche campos obrigatórios com IA e salva atividades no banco de dados',
    descricao: 'Constrói as atividades decididas e salva na plataforma',
    schema: criarAtividadesSchema,
    execute: async (params: any, onProgress?: (update: any) => void) => {
      return await criarAtividade({
        decision_result: params.decision_result,
        professor_id: params.professor_id,
        auto_save: params.auto_save ?? true,
        on_progress: onProgress
      });
    },
    parameters: {
      decision_result: { type: 'object', required: true, description: 'Resultado da decisão (ChosenActivity[])' },
      professor_id: { type: 'string', required: true, description: 'ID do professor' },
      auto_save: { type: 'boolean', required: false, description: 'Salvar automaticamente no banco' }
    },
    requiresPreviousCapability: 'decidir_atividades_criar',
    isSequential: true,
    showProgress: true,
    renderComponent: 'ActivityConstructionCard',
    streamProgress: true
  },

  criar_atividades: {
    funcao: 'criar_atividades',
    name: 'criar_atividades',
    displayName: 'Vou criar todas as atividades',
    categoria: 'CRIAR',
    description: 'Constrói múltiplas atividades (legacy)',
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

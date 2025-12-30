/**
 * CRIAR ATIVIDADES CAPABILITIES - Registry das Capabilities de Criação
 * 
 * Capability Core ÚNICA:
 * criar_atividade - Constrói atividades com IA e salva no banco
 * 
 * NOTA: Unificamos criar_atividade e criar_atividades em uma única capability
 * para evitar confusão e erros de execução da IA.
 */

import { criarAtividade } from '../CRIAR/criar-atividade';
import { criarAtividadesSchema } from './schemas/criar-atividades-schema';

export const CRIAR_ATIVIDADES_CAPABILITIES = {
  
  criar_atividade: {
    funcao: 'criar_atividade',
    name: 'criar_atividade',
    displayName: 'Vou criar as atividades selecionadas',
    categoria: 'CRIAR',
    description: 'Preenche campos obrigatórios com IA e salva atividades no banco de dados. Funciona com uma ou múltiplas atividades.',
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
  }
};

export default CRIAR_ATIVIDADES_CAPABILITIES;

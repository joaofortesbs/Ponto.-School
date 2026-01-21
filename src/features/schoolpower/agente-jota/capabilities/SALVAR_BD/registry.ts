/**
 * SALVAR_BD CAPABILITIES - Registry das Capabilities de Persistência
 * 
 * Capability Core:
 * salvar_atividades_bd - Persiste atividades criadas no banco Neon
 */

import { salvarAtividadesBdV2 } from './implementations/salvar-atividades-bd';
import { salvarAtividadesBdSchema } from './schemas/salvar-atividades-schema';

export const SALVAR_BD_CAPABILITIES = {
  
  salvar_atividades_bd: {
    funcao: 'salvar_atividades_bd',
    name: 'salvar_atividades_bd',
    displayName: 'Salvando atividades no banco de dados',
    categoria: 'SALVAR',
    description: 'Persiste as atividades criadas no banco de dados Neon externo. Coleta dados do localStorage, valida campos obrigatórios, salva via API e confirma o salvamento.',
    descricao: 'Salva as atividades criadas permanentemente no banco de dados',
    schema: salvarAtividadesBdSchema,
    execute: async (params: any, onProgress?: (update: any) => void) => {
      const input = {
        capability_id: 'salvar_atividades_bd',
        execution_id: params.execution_id || `exec_${Date.now()}`,
        context: {
          user_id: params.user_id || params.professor_id,
          session_id: params.session_id,
          force_save: params.force_save,
          skip_validation: params.skip_validation
        },
        previous_results: params.previous_results
      };
      
      return await salvarAtividadesBdV2(input);
    },
    parameters: {
      user_id: { type: 'string', required: true, description: 'ID do usuário/professor' },
      session_id: { type: 'string', required: false, description: 'ID da sessão de execução' },
      force_save: { type: 'boolean', required: false, description: 'Forçar salvamento mesmo com warnings', default: false },
      skip_validation: { type: 'boolean', required: false, description: 'Pular validação (apenas debug)', default: false }
    },
    requiresPreviousCapability: 'criar_atividade',
    isSequential: true,
    showProgress: true,
    renderComponent: 'DatabaseSaveCard',
    streamProgress: true
  }
};

export default SALVAR_BD_CAPABILITIES;

/**
 * DECIDIR CAPABILITIES - Registry das Capabilities de Decisão
 * 
 * Capability Core:
 * decidir_atividades_criar - IA decide quais atividades criar baseado em contexto
 */

import { decidirAtividadesCriar, formatDecisionForNextCapability } from './implementations/decidir-atividades-criar';
import { decidirAtividadesCriarSchema } from './schemas/decidir-atividades-schema';

export const DECIDIR_CAPABILITIES = {
  decidir_atividades_criar: {
    funcao: 'decidir_atividades_criar',
    name: 'decidir_atividades_criar',
    displayName: 'Vou decidir quais atividades criar estrategicamente',
    categoria: 'DECIDIR',
    description: 'Analisa contexto completo e decide estrategicamente quais atividades criar',
    descricao: 'Analisa e escolhe as melhores atividades baseado em critérios pedagógicos',
    schema: decidirAtividadesCriarSchema,
    execute: async (params: any) => {
      const result = await decidirAtividadesCriar(params);
      return {
        ...result,
        prompt_context: formatDecisionForNextCapability(result)
      };
    },
    parameters: {
      account_activities: { type: 'object', required: true, description: 'Resultado da pesquisa de atividades da conta' },
      available_activities: { type: 'object', required: true, description: 'Resultado da pesquisa de atividades disponíveis' },
      user_objective: { type: 'string', required: true, description: 'Objetivo do usuário' },
      user_context: { type: 'object', required: false, description: 'Contexto adicional (turma, disciplina, etc)' },
      constraints: { type: 'object', required: false, description: 'Restrições (max_activities, tipos preferidos/evitados)' }
    },
    requiresPreviousCapability: 'pesquisar_atividades_disponiveis',
    isSequential: true,
    showProgress: true,
    prepareForNext: 'criar_atividade'
  }
};

export default DECIDIR_CAPABILITIES;

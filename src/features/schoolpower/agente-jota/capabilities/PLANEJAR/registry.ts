import { planejarPlanoDeAcao } from './implementations/planejar-plano-de-acao';
import { planejarPlanoAcaoSchema } from './schemas/planejar-schema';

export const PLANEJAR_CAPABILITIES = {
  planejar_plano_de_acao: {
    funcao: 'planejar_plano_de_acao',
    name: 'planejar_plano_de_acao',
    displayName: 'Vou montar um plano de ação pra você',
    categoria: 'PLANEJAR',
    description: 'Cria um plano estruturado de ações para alcançar objetivo do usuário',
    descricao: 'Cria um plano estruturado de ações para alcançar objetivo do usuário',
    schema: planejarPlanoAcaoSchema,
    execute: planejarPlanoDeAcao,
    parameters: {
      objetivo: { type: 'string', required: true, description: 'Objetivo do plano' },
      contexto: { type: 'object', required: false, description: 'Contexto da turma' },
      preferencias: { type: 'object', required: false, description: 'Preferências do professor' }
    },
    canCallAnytime: true,
    requiresUserApproval: true,
    renderComponent: 'PlanActionCard'
  }
};

export default PLANEJAR_CAPABILITIES;

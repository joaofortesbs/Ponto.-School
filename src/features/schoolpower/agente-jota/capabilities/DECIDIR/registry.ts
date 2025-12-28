import { decidirAtividadesCriar } from './implementations/decidir-atividades-criar';
import { decidirAtividadesCriarSchema } from './schemas/decidir-atividades-schema';

export const DECIDIR_CAPABILITIES = {
  decidir_atividades_criar: {
    funcao: 'decidir_atividades_criar',
    name: 'decidir_atividades_criar',
    displayName: 'Vou decidir quais atividades criar estrategicamente',
    categoria: 'DECIDIR',
    description: 'Analisa e escolhe as melhores atividades baseado em critérios pedagógicos',
    descricao: 'Analisa e escolhe as melhores atividades baseado em critérios pedagógicos',
    schema: decidirAtividadesCriarSchema,
    execute: decidirAtividadesCriar,
    parameters: {
      atividades_disponiveis: { type: 'array', required: true, description: 'Lista de atividades disponíveis' },
      criterios_decisao: { type: 'object', required: true, description: 'Critérios para decisão' },
      contexto_turma: { type: 'object', required: false, description: 'Contexto da turma' }
    },
    requiresPreviousCapability: 'pesquisar_atividades_disponiveis',
    isSequential: true,
    showProgress: true,
    prepareForNext: 'criar_atividades'
  }
};

export default DECIDIR_CAPABILITIES;

import { criarCompromissoCalendarioV2 } from './criar-compromisso-calendario';

export const CRIAR_COMPROMISSO_CAPABILITIES = {

  criar_compromisso_calendario: {
    funcao: 'criar_compromisso_calendario',
    name: 'criar_compromisso_calendario',
    displayName: 'Adicionando compromissos ao calendário',
    categoria: 'CRIAR',
    description: 'Cria um ou mais compromissos/eventos no calendário do professor. Pode configurar título, data, horários, repetição, ícone, etiquetas e vincular atividades já criadas. Ideal para organizar aulas, avaliações, reuniões e tarefas no calendário.',
    descricao: 'Adiciona compromissos completos no calendário do professor com todos os campos configuráveis',
    schema: null,
    execute: async (params: any, _onProgress?: (update: any) => void) => {
      return await criarCompromissoCalendarioV2({
        capability_id: 'criar_compromisso_calendario',
        execution_id: `exec_${Date.now()}`,
        context: params,
      });
    },
    parameters: {
      compromissos: {
        type: 'array',
        required: true,
        description: 'Lista de compromissos a criar. Cada compromisso tem: titulo (obrigatório), data (obrigatório, formato YYYY-MM-DD), hora_inicio (opcional, formato HH:MM), hora_fim (opcional, formato HH:MM), dia_todo (boolean, default true se sem horários), repeticao (none/daily/weekly/monthly/yearly), icone (emoji), etiquetas (array de strings), atividades_vinculadas (array de {id, tipo, titulo}), descricao (texto)'
      },
    },
    requiresPreviousCapability: null,
    isSequential: false,
    showProgress: true,
    renderComponent: 'CompromissoCalendarioCard',
    streamProgress: false,
    canCallAnytime: true,
  }
};

export default CRIAR_COMPROMISSO_CAPABILITIES;

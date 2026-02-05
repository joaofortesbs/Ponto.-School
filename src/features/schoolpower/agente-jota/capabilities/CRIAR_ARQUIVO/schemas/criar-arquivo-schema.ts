export const criarArquivoSchema = {
  name: 'criar_arquivo',
  description: 'Gera um artefato estruturado (dossiê, resumo, roadmap) com base no contexto da sessão',
  parameters: {
    session_id: {
      type: 'string',
      required: true,
      description: 'ID da sessão para coletar contexto',
    },
    tipo: {
      type: 'string',
      required: false,
      description: 'Tipo do artefato: dossie, resumo, roadmap, relatorio, generico',
      default: 'dossie',
    },
  },
};

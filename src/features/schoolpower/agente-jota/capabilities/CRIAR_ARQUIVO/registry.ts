import { generateArtifact } from './artifact-generator';

export const CRIAR_ARQUIVO_CAPABILITIES = {
  
  criar_arquivo: {
    funcao: 'criar_arquivo',
    name: 'criar_arquivo',
    displayName: 'Gerando documento',
    categoria: 'CRIAR',
    description: 'Gera um documento/artefato (dossiê, resumo, roteiro, relatório, guia, mensagens, ou documento livre com estrutura customizada pela IA) com base no contexto da sessão ou solicitação do professor.',
    descricao: 'Cria um documento estruturado — pode ser tipo específico ou documento livre com estrutura customizada',
    schema: null,
    execute: async (params: any, _onProgress?: (update: any) => void) => {
      return await generateArtifact(
        params.session_id || params.sessionId,
        params.tipo_artefato || params.tipo,
        params.solicitacao || params.tema
      );
    },
    parameters: {
      session_id: { type: 'string', required: true, description: 'ID da sessão de execução' },
      tipo_artefato: { type: 'string', required: false, description: 'Tipo do artefato (dossie_pedagogico, resumo_executivo, roteiro_aula, relatorio_progresso, guia_aplicacao, mensagem_pais, mensagem_alunos, relatorio_coordenacao, documento_livre). Se omitido, será detectado automaticamente.' },
      solicitacao: { type: 'string', required: false, description: 'Texto da solicitação do professor — usado especialmente para documento_livre, onde a IA cria estrutura customizada baseada no pedido.' }
    },
    requiresPreviousCapability: null,
    isSequential: true,
    showProgress: true,
    renderComponent: 'ArtifactCard',
    streamProgress: false
  }
};

export default CRIAR_ARQUIVO_CAPABILITIES;

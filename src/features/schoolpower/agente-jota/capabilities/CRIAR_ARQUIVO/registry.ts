import { generateArtifact } from './artifact-generator';

export const CRIAR_ARQUIVO_CAPABILITIES = {
  
  criar_arquivo: {
    funcao: 'criar_arquivo',
    name: 'criar_arquivo',
    displayName: 'Gerando documento complementar',
    categoria: 'CRIAR',
    description: 'Gera um documento/artefato complementar (dossiê pedagógico, resumo executivo, roteiro de aula, relatório de progresso ou guia de aplicação) com base no contexto da sessão.',
    descricao: 'Cria um documento estruturado complementar às atividades criadas',
    schema: null,
    execute: async (params: any, _onProgress?: (update: any) => void) => {
      return await generateArtifact(
        params.session_id || params.sessionId,
        params.tipo_artefato
      );
    },
    parameters: {
      session_id: { type: 'string', required: true, description: 'ID da sessão de execução' },
      tipo_artefato: { type: 'string', required: false, description: 'Tipo do artefato (dossie_pedagogico, resumo_executivo, roteiro_aula, relatorio_progresso, guia_aplicacao). Se omitido, será detectado automaticamente.' }
    },
    requiresPreviousCapability: 'salvar_atividades_bd',
    isSequential: true,
    showProgress: true,
    renderComponent: 'ArtifactCard',
    streamProgress: false
  }
};

export default CRIAR_ARQUIVO_CAPABILITIES;

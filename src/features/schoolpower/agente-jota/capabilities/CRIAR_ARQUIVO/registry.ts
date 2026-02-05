import { criarArquivo } from './implementations/criar-arquivo';
import { criarArquivoSchema } from './schemas/criar-arquivo-schema';

export const CRIAR_ARQUIVO_CAPABILITIES = {
  criar_arquivo: {
    funcao: 'criar_arquivo',
    name: 'criar_arquivo',
    displayName: 'Gerando artefato da sessão',
    categoria: 'CRIAR',
    description: 'Gera um artefato estruturado (dossiê, resumo, roadmap, relatório) com base no contexto completo da sessão via IA.',
    descricao: 'Cria um documento estruturado com resumo, roadmap, ganchos e materiais complementares',
    schema: criarArquivoSchema,
    execute: async (params: any) => {
      return await criarArquivo({
        session_id: params.session_id,
        tipo: params.tipo || 'dossie',
      });
    },
    parameters: {
      session_id: { type: 'string', required: true, description: 'ID da sessão para coletar contexto' },
      tipo: { type: 'string', required: false, description: 'Tipo do artefato: dossie, resumo, roadmap, relatorio, generico' },
    },
    isSequential: false,
    showProgress: false,
    canCallAnytime: true,
  },
};

export default CRIAR_ARQUIVO_CAPABILITIES;

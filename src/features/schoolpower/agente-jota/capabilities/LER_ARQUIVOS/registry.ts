import { lerArquivosV2 } from './implementations/ler-arquivos-v2';

export const LER_ARQUIVOS_CAPABILITIES = {
  ler_arquivos: {
    name: 'ler_arquivos',
    funcao: 'ler_arquivos',
    displayName: 'Vou ler seus arquivos...',
    categoria: 'LER_ARQUIVOS',
    description: 'Lê e interpreta arquivos enviados pelo professor (PDFs, imagens, documentos Word, planilhas, apresentações, arquivos de texto). Extrai o conteúdo completo, gera transcrição estruturada com resumo, metadados pedagógicos e descrição de elementos visuais. O conteúdo transcrito fica disponível para todas as capabilities posteriores.',
    descricao: 'Lê arquivos e imagens do professor, gerando transcrição detalhada para uso em todo o fluxo.',
    parameters: {
      files: {
        type: 'array',
        required: true,
        description: 'Array de arquivos com {base64, name, type, size}',
      },
    },
    execute: async (params: any) => {
      const v2Result = await lerArquivosV2({
        capability_id: 'ler_arquivos',
        execution_id: `exec_${Date.now()}`,
        context: params,
      });

      if (v2Result.success && v2Result.data) {
        return {
          found: v2Result.data.count > 0,
          count: v2Result.data.count,
          arquivos: v2Result.data.arquivos,
          prompt_context: v2Result.data.prompt_context,
          summary: v2Result.data.summary,
          debug_log: v2Result.debug_log,
          data_confirmation: v2Result.data_confirmation,
        };
      }
      return {
        found: false,
        count: 0,
        arquivos: [],
        prompt_context: '',
        summary: 'Nenhum arquivo processado',
        debug_log: v2Result.debug_log,
        data_confirmation: v2Result.data_confirmation,
      };
    },
  },
};

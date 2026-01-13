/**
 * GERAR CONTEÚDO CAPABILITIES - Registry
 * 
 * Capability que gera conteúdo para preencher automaticamente os campos
 * de cada atividade decidida, mantendo contexto completo da conversa.
 * 
 * Posição no pipeline: DECIDIR → GERAR_CONTEUDO → [Interface de Construção] → CRIAR
 * Esta capability é executada DENTRO do tópico "Decidir quais atividades criar",
 * imediatamente após a capability decidir_atividades_criar completar.
 */

import { gerarConteudoAtividades } from './implementations/gerar-conteudo-atividades';
import { gerarConteudoSchema } from './schemas/gerar-conteudo-schema';

export const GERAR_CONTEUDO_CAPABILITIES = {
  
  gerar_conteudo_atividades: {
    funcao: 'gerar_conteudo_atividades',
    name: 'gerar_conteudo_atividades',
    displayName: 'Gerando conteúdo para as atividades',
    categoria: 'GERAR_CONTEUDO',
    description: 'Gera conteúdo detalhado para preencher todos os campos de cada atividade decidida, usando o contexto completo da conversa.',
    descricao: 'Preenche automaticamente os campos de cada atividade com conteúdo pedagógico relevante',
    schema: gerarConteudoSchema,
    execute: async (params: any, onProgress?: (update: any) => void) => {
      return await gerarConteudoAtividades({
        session_id: params.session_id,
        conversation_context: params.conversation_context,
        user_objective: params.user_objective,
        activities_to_fill: params.activities_to_fill,
        on_progress: onProgress
      });
    },
    parameters: {
      session_id: { type: 'string', required: true, description: 'ID da sessão atual' },
      conversation_context: { type: 'string', required: true, description: 'Contexto completo da conversa' },
      user_objective: { type: 'string', required: true, description: 'Objetivo original do usuário' },
      activities_to_fill: { type: 'array', required: false, description: 'Atividades específicas (opcional)' }
    },
    requiresPreviousCapability: 'decidir_atividades_criar',
    isSequential: true,
    showProgress: true,
    renderComponent: 'ContentGenerationCard',
    streamProgress: true
  }
};

export default GERAR_CONTEUDO_CAPABILITIES;

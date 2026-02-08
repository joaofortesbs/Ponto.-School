/**
 * FINAL RESPONSE SERVICE - Chamada 3: Resposta Final
 * 
 * Responsável por gerar a resposta final consolidada,
 * analisando tudo que foi feito durante a execução.
 * 
 * Esta é uma chamada SEPARADA que recebe o contexto completo.
 */

import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { getContextManager, type ContextoMacro } from './context-manager';
import { 
  sanitizeAiOutput, 
  sanitizeContextForPrompt, 
  containsRawJson,
} from './output-sanitizer';

const FINAL_RESPONSE_PROMPT = `
Você é o Jota, assistente de IA do Ponto School.

CONTEXTO COMPLETO:
{full_context}

ITENS CRIADOS NESTA SESSÃO:
{created_items}

SUA TAREFA:
Gere uma RESPOSTA FINAL ESTRUTURADA que:
1. Resume o que foi FEITO em resposta ao pedido original
2. Menciona DADOS ESPECÍFICOS (números, tipos, nomes)
3. Usa MARCADORES ESPECIAIS para mostrar os itens criados de forma interativa
4. Oferece próximos passos ou dicas úteis

MARCADORES DISPONÍVEIS (use-os no meio do texto):
- [[ATIVIDADES]] — Mostra um card interativo com todas as atividades criadas
- [[ARQUIVO:titulo do arquivo]] — Mostra um card interativo de um arquivo/documento específico

REGRAS:
- Escreva texto narrativo natural intercalado com os marcadores
- Coloque cada marcador em uma LINHA SEPARADA entre os parágrafos de texto
- Use tom de celebração/conclusão
- Mencione elementos ESPECÍFICOS do que foi criado
- Conecte com o pedido ORIGINAL do usuário
- NÃO repita as reflexões anteriores verbatim
- Sintetize os resultados de forma nova

REGRAS CRÍTICAS DE FORMATO:
- NUNCA retorne JSON, arrays ou objetos técnicos
- NUNCA retorne dados como [{"id":"...", "title":"..."}]
- SEMPRE responda em texto narrativo natural com os marcadores intercalados
- Se você recebeu dados técnicos no contexto, SINTETIZE-OS em linguagem natural

EXEMPLO DE FORMATO COM MARCADORES:
"Pronto! Criei 3 atividades de matemática personalizadas para o 7º ano, todas alinhadas com a BNCC e prontas para uso!

[[ATIVIDADES]]

Também preparei um roteiro detalhado para te ajudar na aplicação dessas atividades em sala de aula.

[[ARQUIVO:Roteiro de Aula]]

Você pode editar qualquer atividade ou acessar o roteiro a qualquer momento. Precisa de mais alguma coisa?"

RETORNE APENAS A RESPOSTA FINAL COM OS MARCADORES, sem formatação extra.
`.trim();

export interface FinalResponseResult {
  resposta: string;
  resumo: {
    inputOriginal: string;
    objetivoGeral: string;
    etapasCompletas: number;
    totalEtapas: number;
    atividadesCriadas: string[];
    principaisResultados: string[];
  };
  collectedItems?: {
    activities: Array<{ id: string; titulo: string; tipo: string; db_id?: number }>;
    artifacts: any[];
  };
  sucesso: boolean;
  erro?: string;
}

export async function generateFinalResponse(
  sessionId: string,
  collectedItems?: { activities: Array<{ id: string; titulo: string; tipo: string; db_id?: number }>; artifacts: any[] }
): Promise<FinalResponseResult> {
  console.log(`🏁 [FinalResponse] Gerando resposta final para sessão: ${sessionId}`);

  const contextManager = getContextManager(sessionId);
  const contexto = contextManager.obterContexto();

  if (!contexto) {
    console.error(`❌ [FinalResponse] Contexto não encontrado para sessão: ${sessionId}`);
    return {
      resposta: 'Processo concluído com sucesso! Suas atividades estão prontas para uso.',
      resumo: {
        inputOriginal: '',
        objetivoGeral: '',
        etapasCompletas: 0,
        totalEtapas: 0,
        atividadesCriadas: [],
        principaisResultados: [],
      },
      sucesso: false,
      erro: 'Contexto não encontrado',
    };
  }

  contextManager.atualizarEstado('gerando_final');

  const rawContext = contextManager.gerarContextoParaChamada('final');
  const fullContext = sanitizeContextForPrompt(rawContext);

  let createdItemsStr = '';
  if (collectedItems) {
    if (collectedItems.activities.length > 0) {
      createdItemsStr += `ATIVIDADES CRIADAS (${collectedItems.activities.length}):\n`;
      collectedItems.activities.forEach(a => {
        createdItemsStr += `- ${a.titulo} (tipo: ${a.tipo})\n`;
      });
    }
    if (collectedItems.artifacts.length > 0) {
      createdItemsStr += `ARQUIVOS/DOCUMENTOS CRIADOS (${collectedItems.artifacts.length}):\n`;
      collectedItems.artifacts.forEach(a => {
        createdItemsStr += `- ${a.metadata?.titulo || 'Documento'} (tipo: ${a.metadata?.tipo || 'documento'})\n`;
      });
    }
  }
  if (!createdItemsStr) {
    createdItemsStr = 'Nenhum item específico foi criado nesta sessão.';
  }

  const prompt = FINAL_RESPONSE_PROMPT
    .replace('{full_context}', fullContext)
    .replace('{created_items}', createdItemsStr);

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`📝 [FinalResponse] ${status}`),
    });

    let resposta = gerarRespostaFallback(contexto);

    if (result.success && result.data) {
      const rawResposta = result.data.trim();
      
      if (containsRawJson(rawResposta)) {
        console.warn('⚠️ [FinalResponse] Resposta contém JSON bruto, sanitizando...');
        const sanitized = sanitizeAiOutput(rawResposta, { expectedType: 'narrative' });
        resposta = sanitized.sanitized;
      } else {
        resposta = rawResposta;
      }
    }

    contextManager.finalizarSessao();

    console.log(`✅ [FinalResponse] Resposta final gerada: "${resposta.substring(0, 100)}..."`);

    return {
      resposta,
      resumo: {
        inputOriginal: contexto.inputOriginal.texto,
        objetivoGeral: contexto.objetivoGeral || '',
        etapasCompletas: contexto.resumoProgressivo.etapasCompletas,
        totalEtapas: contexto.resumoProgressivo.totalEtapas,
        atividadesCriadas: contexto.resumoProgressivo.atividadesCriadas,
        principaisResultados: [
          ...contexto.resumoProgressivo.principaisDescobertas,
          ...contexto.resumoProgressivo.principaisDecisoes,
        ],
      },
      collectedItems,
      sucesso: true,
    };
  } catch (error) {
    console.error('❌ [FinalResponse] Erro ao gerar resposta:', error);
    
    const fallbackResponse = gerarRespostaFallback(contexto);
    contextManager.finalizarSessao();

    return {
      resposta: fallbackResponse,
      resumo: {
        inputOriginal: contexto.inputOriginal.texto,
        objetivoGeral: contexto.objetivoGeral || '',
        etapasCompletas: contexto.resumoProgressivo.etapasCompletas,
        totalEtapas: contexto.resumoProgressivo.totalEtapas,
        atividadesCriadas: contexto.resumoProgressivo.atividadesCriadas,
        principaisResultados: [],
      },
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

function gerarRespostaFallback(contexto: ContextoMacro): string {
  const { resumoProgressivo, inputOriginal } = contexto;
  
  if (resumoProgressivo.atividadesCriadas.length > 0) {
    return `Pronto! Criei ${resumoProgressivo.atividadesCriadas.length} atividade(s) conforme você pediu: ${resumoProgressivo.atividadesCriadas.slice(0, 3).join(', ')}. Tudo está pronto para uso!`;
  }
  
  if (resumoProgressivo.etapasCompletas > 0) {
    return `Concluí ${resumoProgressivo.etapasCompletas} etapa(s) do processo. Suas atividades estão prontas para uso com sua turma!`;
  }
  
  return `Processo concluído! Trabalhei em "${inputOriginal.texto.substring(0, 50)}..." e tudo está pronto.`;
}

export async function generateQuickFinalResponse(
  inputOriginal: string,
  atividadesCriadas: string[],
  dadosAdicionais?: Record<string, any>
): Promise<string> {
  const dadosLimpos: Record<string, any> = {};
  if (dadosAdicionais) {
    for (const [key, value] of Object.entries(dadosAdicionais)) {
      if (typeof value === 'string' && containsRawJson(value)) {
        continue;
      }
      if (typeof value === 'object' && value !== null) {
        continue;
      }
      dadosLimpos[key] = value;
    }
  }

  const contextoSimplificado = `
PEDIDO ORIGINAL: "${inputOriginal}"
ATIVIDADES CRIADAS: ${atividadesCriadas.join(', ') || 'Nenhuma'}
TOTAL DE ATIVIDADES: ${atividadesCriadas.length}
`.trim();

  const prompt = FINAL_RESPONSE_PROMPT
    .replace('{full_context}', contextoSimplificado)
    .replace('{created_items}', `ATIVIDADES CRIADAS: ${atividadesCriadas.join(', ') || 'Nenhuma'}`);

  const result = await executeWithCascadeFallback(prompt, {
    onProgress: (status) => console.log(`📝 [FinalResponse] ${status}`),
  });

  if (result.success && result.data) {
    const rawResponse = result.data.trim();
    
    if (containsRawJson(rawResponse)) {
      console.warn('⚠️ [FinalResponse] Quick response contém JSON, sanitizando...');
      const sanitized = sanitizeAiOutput(rawResponse, {
        etapaTitulo: 'Resposta Final',
        expectedType: 'narrative',
      });
      return sanitized.sanitized;
    }
    
    return rawResponse;
  }

  if (atividadesCriadas.length > 0) {
    return `Pronto! Criei ${atividadesCriadas.length} atividade(s): ${atividadesCriadas.slice(0, 3).join(', ')}. Tudo pronto para uso!`;
  }

  return 'Processo concluído com sucesso! Suas atividades estão prontas.';
}

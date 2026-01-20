/**
 * INITIAL RESPONSE SERVICE - Chamada 1: Resposta Inicial
 * 
 * Responsável por gerar a primeira resposta ao usuário,
 * interpretando seu pedido e definindo expectativas.
 * 
 * Esta é uma chamada EXCLUSIVA para a resposta inicial.
 */

import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { getContextManager, type ContextoMacro } from './context-manager';

const INITIAL_RESPONSE_PROMPT = `
Você é o Jota, assistente de IA do Ponto School especializado em ajudar professores.

PEDIDO DO USUÁRIO:
"{user_input}"

SUA TAREFA:
Gere uma RESPOSTA INICIAL acolhedora e informativa que:
1. Demonstre que você ENTENDEU o pedido específico do usuário
2. Explique BREVEMENTE o que você vai fazer para atender
3. Defina EXPECTATIVAS claras sobre o que será criado

REGRAS:
- Seja direto e objetivo (2-4 frases)
- Use tom amigável e profissional
- Mencione elementos ESPECÍFICOS do pedido do usuário
- NÃO use frases genéricas como "Vou te ajudar com isso"
- NÃO liste etapas técnicas
- NÃO mencione "plano de ação" ou termos técnicos

EXEMPLOS DE RESPOSTAS BOAS:
- Pedido: "Crie 3 atividades de matemática para 7º ano"
  Resposta: "Perfeito! Vou criar 3 atividades de matemática focadas no 7º ano. Vou analisar as melhores opções de formato para engajar seus alunos e personalizar o conteúdo para a faixa etária."

- Pedido: "Preciso de um quiz sobre fotossíntese"
  Resposta: "Entendi! Vou montar um quiz completo sobre fotossíntese. Vou criar questões variadas que testem o conhecimento dos alunos de forma dinâmica e educativa."

- Pedido: "Faça uma avaliação diagnóstica de português"
  Resposta: "Combinado! Vou preparar uma avaliação diagnóstica de português personalizada. Isso vai ajudar você a identificar o nível atual da turma e planejar as próximas aulas."

RETORNE APENAS A RESPOSTA, sem formatação extra ou explicações.
`.trim();

const INTERPRETATION_PROMPT = `
Analise o pedido do usuário e extraia informações estruturadas.

PEDIDO: "{user_input}"

Retorne um JSON com:
{
  "interpretacao": "resumo do que o usuário quer em uma frase",
  "intencao": "CRIAR_ATIVIDADE | CRIAR_AVALIACAO | PESQUISAR | PLANEJAR | OUTRO",
  "entidades": {
    "quantidade": número ou null,
    "disciplina": string ou null,
    "serie": string ou null,
    "tipo_atividade": string ou null,
    "tema": string ou null,
    "outros": {}
  }
}

Retorne APENAS o JSON, sem explicações.
`.trim();

export interface InitialResponseResult {
  resposta: string;
  interpretacao: string;
  intencao: string;
  entidades: Record<string, any>;
  sucesso: boolean;
  erro?: string;
}

export async function generateInitialResponse(
  sessionId: string,
  userInput: string
): Promise<InitialResponseResult> {
  console.log(`🎯 [InitialResponse] Gerando resposta inicial para: "${userInput.substring(0, 50)}..."`);
  
  const contextManager = getContextManager(sessionId);
  const contexto = contextManager.obterOuCriar(userInput);
  contextManager.atualizarEstado('respondendo_inicial');

  try {
    const [responseResult, interpretationResult] = await Promise.all([
      executeWithCascadeFallback(
        INITIAL_RESPONSE_PROMPT.replace('{user_input}', userInput),
        { onProgress: (status) => console.log(`📝 [InitialResponse] ${status}`) }
      ),
      executeWithCascadeFallback(
        INTERPRETATION_PROMPT.replace('{user_input}', userInput),
        { onProgress: (status) => console.log(`🔍 [InitialResponse] ${status}`) }
      ),
    ]);

    let resposta = 'Entendi seu pedido! Vou começar a trabalhar nisso agora.';
    let interpretacao = userInput;
    let intencao = 'CRIAR_ATIVIDADE';
    let entidades: Record<string, any> = {};

    if (responseResult.success && responseResult.data) {
      resposta = responseResult.data.trim();
    }

    if (interpretationResult.success && interpretationResult.data) {
      try {
        const cleanedData = interpretationResult.data
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        const jsonMatch = cleanedData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          interpretacao = parsed.interpretacao || userInput;
          intencao = parsed.intencao || 'CRIAR_ATIVIDADE';
          entidades = parsed.entidades || {};
        }
      } catch (parseError) {
        console.warn('⚠️ [InitialResponse] Erro ao parsear interpretação:', parseError);
      }
    }

    contextManager.salvarInterpretacaoInput(interpretacao, intencao, entidades);
    contextManager.salvarRespostaInicial(resposta);

    console.log(`✅ [InitialResponse] Resposta gerada: "${resposta.substring(0, 100)}..."`);

    return {
      resposta,
      interpretacao,
      intencao,
      entidades,
      sucesso: true,
    };
  } catch (error) {
    console.error('❌ [InitialResponse] Erro ao gerar resposta:', error);
    
    const fallbackResponse = `Entendi! Você quer: "${userInput}". Vou começar a trabalhar nisso agora.`;
    contextManager.salvarRespostaInicial(fallbackResponse);
    
    return {
      resposta: fallbackResponse,
      interpretacao: userInput,
      intencao: 'CRIAR_ATIVIDADE',
      entidades: {},
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export async function getInitialResponseOnly(userInput: string): Promise<string> {
  const prompt = INITIAL_RESPONSE_PROMPT.replace('{user_input}', userInput);
  
  const result = await executeWithCascadeFallback(prompt, {
    onProgress: (status) => console.log(`📝 [InitialResponse] ${status}`),
  });

  if (result.success && result.data) {
    return result.data.trim();
  }

  return `Entendi seu pedido! Vou trabalhar em "${userInput}" agora.`;
}

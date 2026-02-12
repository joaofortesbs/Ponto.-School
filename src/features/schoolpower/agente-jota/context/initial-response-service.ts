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
import { sanitizeAiOutput, containsRawJson } from './output-sanitizer';

const INITIAL_RESPONSE_PROMPT = `
Você é o Jota, assistente de IA do Ponto School especializado em ajudar professores.

PEDIDO DO USUÁRIO:
"{user_input}"

SUA TAREFA:
Gere uma RESPOSTA INICIAL acolhedora e informativa que:
1. Demonstre que você ENTENDEU o pedido específico do usuário
2. Explique BREVEMENTE o que você vai fazer para atender
3. Defina EXPECTATIVAS claras sobre o que será entregue

REGRAS:
- Seja direto e objetivo (2-4 frases)
- Use tom amigável e profissional
- Mencione elementos ESPECÍFICOS do pedido do usuário
- NÃO use frases genéricas como "Vou te ajudar com isso"
- NÃO liste etapas técnicas
- NÃO mencione "plano de ação" ou termos técnicos

FORMATAÇÃO PREMIUM OBRIGATÓRIA (use SEMPRE):
- **Negrito** nos termos mais importantes: nomes de atividades, temas, séries, quantidades
- *Itálico* para termos pedagógicos e referências curriculares
- Respostas curtas (2-4 frases): use negrito nos dados-chave e seja direto
- > 💡 para uma dica pedagógica rápida (opcional, quando a resposta tiver mais de 3 frases)
- OBRIGATÓRIO: Use negrito em TODOS os dados específicos do pedido do professor

EXEMPLOS DE RESPOSTAS PARA DIFERENTES TIPOS DE PEDIDO:

Criação de atividades:
- Pedido: "Crie 3 atividades de matemática para 7º ano"
  Resposta: "Perfeito! Vou criar **3 atividades de matemática** focadas no **7º ano**. Vou analisar as melhores opções de formato para engajar seus alunos e personalizar o conteúdo para a faixa etária."

Explicação/Texto:
- Pedido: "Me explique o que é metodologia ativa"
  Resposta: "Claro! Vou preparar uma explicação completa sobre **metodologia ativa**, com conceitos, exemplos práticos e dicas de como aplicar em sala de aula."

Pesquisa:
- Pedido: "Quais atividades eu já criei?"
  Resposta: "Vou consultar suas **atividades anteriores** agora mesmo! Em instantes você terá uma lista completa do que já foi criado."

Plano de aula:
- Pedido: "Monte um plano de aula sobre clima"
  Resposta: "Ótimo! Vou elaborar um **plano de aula completo** sobre **clima**, com objetivos, metodologia e atividades sugeridas para você aplicar com a turma."

RETORNE A RESPOSTA COM FORMATAÇÃO RICA (negrito e itálico nos dados importantes).
`.trim();

const INTERPRETATION_PROMPT = `
Analise o pedido do usuário e extraia informações estruturadas.

PEDIDO: "{user_input}"

Retorne um JSON com:
{
  "interpretacao": "resumo do que o usuário quer em uma frase",
  "intencao": "CRIAR_ATIVIDADE | CRIAR_AVALIACAO | EXPLICAR_CONCEITO | CRIAR_TEXTO | CRIAR_PLANO_AULA | PESQUISAR | PLANEJAR | OUTRO",
  "entidades": {
    "quantidade": número ou null,
    "disciplina": string ou null,
    "serie": string ou null,
    "tipo_atividade": string ou null,
    "tema": string ou null,
    "outros": {}
  }
}

GUIA DE INTENÇÕES:
- CRIAR_ATIVIDADE: quando o professor quer criar atividades, exercícios, quiz, jogos educativos na plataforma
- CRIAR_AVALIACAO: quando quer uma avaliação diagnóstica ou prova
- EXPLICAR_CONCEITO: quando quer uma explicação sobre um tema pedagógico ou educacional
- CRIAR_TEXTO: quando quer um texto, resumo, roteiro, dossiê ou documento escrito
- CRIAR_PLANO_AULA: quando quer um plano de aula ou sequência didática
- PESQUISAR: quando quer saber o que tem disponível ou o que já criou
- PLANEJAR: quando quer ajuda para planejar algo mais amplo
- OUTRO: quando não se encaixa em nenhuma das categorias acima

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
    let intencao = 'OUTRO';
    let entidades: Record<string, any> = {};

    if (responseResult.success && responseResult.data) {
      const rawResponse = responseResult.data.trim();
      
      // SANITIZAÇÃO CRÍTICA: Garantir que JSON bruto nunca chegue à UI
      if (containsRawJson(rawResponse)) {
        console.warn('⚠️ [InitialResponse] Resposta da IA contém JSON bruto! Sanitizando...');
        const sanitized = sanitizeAiOutput(rawResponse, { capabilityName: 'resposta_inicial' });
        resposta = sanitized.sanitized;
        console.log(`✅ [InitialResponse] Resposta sanitizada: "${resposta.substring(0, 100)}..."`);
      } else {
        resposta = rawResponse;
      }
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
          intencao = parsed.intencao || 'OUTRO';
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
      intencao: 'OUTRO',
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
    const rawResponse = result.data.trim();
    
    // SANITIZAÇÃO CRÍTICA: Garantir que JSON bruto nunca chegue à UI
    if (containsRawJson(rawResponse)) {
      console.warn('⚠️ [InitialResponseOnly] Resposta contém JSON bruto! Sanitizando...');
      const sanitized = sanitizeAiOutput(rawResponse, { capabilityName: 'resposta_inicial' });
      return sanitized.sanitized;
    }
    
    return rawResponse;
  }

  return `Entendi seu pedido! Vou trabalhar em "${userInput}" agora.`;
}

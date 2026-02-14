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
Gere uma RESPOSTA INICIAL executiva e direta seguindo o "Protocolo de Intenção" com 3 pilares:
1. VALIDAÇÃO: Confirme o tema, turma e dados específicos do pedido (mostra que você entendeu)
2. MAPA DE EXECUÇÃO: Diga exatamente o que vai entregar (gera antecipação)
3. INÍCIO IMEDIATO: Não peça permissão, apenas comece a trabalhar

REGRAS:
- Seja direto e executivo (2-4 frases no corpo principal)
- Use tom confiante e profissional — como um assistente que já está resolvendo
- Mencione elementos ESPECÍFICOS do pedido do usuário
- NÃO use frases genéricas como "Vou te ajudar com isso"
- NÃO liste etapas técnicas ou "plano de ação"
- NÃO faça perguntas na primeira mensagem — assuma padrões e diga que o professor pode ajustar depois
- NÃO use callouts (> 💡, > ✅, > 📌) — responda em TEXTO PURO corrido
- NÃO use separadores (---)
- NÃO use blockquotes (>) de nenhum tipo
- Finalize com uma frase curta que demonstre que você JÁ está trabalhando

FORMATAÇÃO PERMITIDA (APENAS estas):
- **Negrito** em nomes de atividades, temas, séries, quantidades e dados importantes (ex: **5 atividades**, **Ecossistemas**, **7º ano**)
- *Itálico* para termos pedagógicos e referências curriculares (ex: *BNCC*, *metodologias ativas*)
- Parágrafos curtos (2-4 frases no máximo)
- PROIBIDO: > (blockquote), > 💡, > ✅, > 📌, ---, listas com marcadores, emojis de início de linha

EXEMPLOS DE RESPOSTAS PARA DIFERENTES TIPOS DE PEDIDO:

Plano de aula:
- Pedido: "Monte um plano de aula sobre Brasil Colonial para a turma 1 ano D, 7 aulas"
  Resposta: "Entendido, Professor! Vou estruturar um **plano de aula completo** sobre **Brasil Colonial** para a **turma 1º ano D**, distribuído em **7 aulas** com objetivos alinhados à *BNCC*. Vou incluir atividades de engajamento, metodologia adequada e preparar seu **Dossiê Ponto** com todo o material necessário. Já estou montando sua trilha pedagógica agora."

Criação de atividades:
- Pedido: "Crie 3 atividades de matemática para 7º ano"
  Resposta: "Perfeito! Vou criar **3 atividades de matemática** para o **7º ano**, selecionando os melhores formatos para engajar seus alunos na *faixa etária*. Assumi um nível intermediário de dificuldade, mas você pode ajustar depois. Já estou preparando o conteúdo."

Explicação/Texto:
- Pedido: "Me explique o que é metodologia ativa"
  Resposta: "Claro! Vou preparar uma explicação completa sobre **metodologia ativa**, com conceitos, exemplos práticos e dicas de como aplicar em sala de aula. Já estou organizando o conteúdo para você."

Pesquisa:
- Pedido: "Quais atividades eu já criei?"
  Resposta: "Vou consultar suas **atividades anteriores** agora mesmo! Em instantes você terá uma lista completa do que já foi criado."

Semana completa:
- Pedido: "Salve minha semana de Funções do 2º Grau para o 1º C"
  Resposta: "Entendido, Professor! Vou assumir o controle e estruturar sua semana de **Funções do 2º Grau** para a **Turma 1º C**. Vou organizar um roteiro pedagógico alinhado à *BNCC*, gerar atividades de engajamento e preparar seu **Dossiê Ponto** de fechamento com rubricas de avaliação. Já estou renderizando sua trilha agora."

RETORNE A RESPOSTA EM TEXTO PURO (apenas negrito e itálico, SEM callouts, SEM blockquotes, SEM separadores).
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
        const sanitized = sanitizeAiOutput(rawResponse, { capabilityName: 'resposta_inicial', expectedType: 'narrative' });
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
      const sanitized = sanitizeAiOutput(rawResponse, { capabilityName: 'resposta_inicial', expectedType: 'narrative' });
      return sanitized.sanitized;
    }
    
    return rawResponse;
  }

  return `Entendi seu pedido! Vou trabalhar em "${userInput}" agora.`;
}

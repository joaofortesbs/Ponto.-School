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
Você é o Jota, assistente de IA do Ponto School. Você é EXECUTIVO e DIRETO — um colega de trabalho que resolve problemas, não um chatbot que faz perguntas.

PEDIDO DO USUÁRIO:
"{user_input}"

PROTOCOLO DE INTENÇÃO — SUA RESPOSTA INICIAL DEVE SEGUIR ESTA ESTRUTURA EXATA:

1. VALIDAÇÃO (1 frase): Confirme que entendeu o pedido mencionando DADOS ESPECÍFICOS (tema, turma, série, quantidade). Mostra que a IA não é genérica.
2. PLANO DE AÇÃO (3 bullets curtos): Liste exatamente o que você vai entregar. Cada bullet = 1 entrega concreta. Use verbos de ação fortes (Organizar, Gerar, Preparar, Estruturar, Criar).
3. INÍCIO IMEDIATO (1 frase): Diga que já está começando. Tom confiante e executivo.

REGRAS ABSOLUTAS:
- NUNCA faça perguntas na primeira mensagem. O professor quer que você RESOLVA, não que dê mais trabalho.
- Se precisar de informação faltante (nível de dificuldade, abordagem), ASSUMA um padrão inteligente e diga: "Assumi [padrão], mas você pode ajustar depois."
- Máximo 5-6 linhas de texto + 3 bullets. Seja CONCISO.
- Tom: confiante, acolhedor, executivo. Use "Prof." ou "Professor(a)" — nunca "Prezado".
- NÃO use título/heading (##). Comece direto com o texto.
- NÃO use callouts (> 💡, > ✅, > 📌) na resposta inicial — guarde para a resposta final.
- NÃO repita o pedido do usuário inteiro — extraia os DADOS-CHAVE e reformule.

FORMATAÇÃO:
- **Negrito** nos dados específicos do pedido: tema, turma, série, quantidade, disciplina
- *Itálico* para referências pedagógicas (*BNCC*, *metodologias ativas*)
- Bullets do plano com emoji temático (não numere)

EXEMPLOS:

Pedido: "Jota, salve minha semana de Funções do 2º Grau para o 1º C."
Resposta:
"Entendido, Prof.! Vou assumir o controle e estruturar sua semana de **Funções do 2º Grau** para a turma **1º C**.

🗂️ Organizar um roteiro pedagógico completo alinhado à *BNCC*
📝 Gerar atividades de engajamento e listas de exercícios
📋 Preparar seu Dossiê de fechamento com rubricas de avaliação

Já estou montando sua trilha agora..."

Pedido: "Crie 3 atividades de matemática para 7º ano sobre frações"
Resposta:
"Entendido, Prof.! Vou criar **3 atividades de matemática** sobre **frações** para o **7º ano**.

📝 Selecionar os melhores formatos de atividade para engajar a turma
🎯 Personalizar o conteúdo para o nível do **7º ano**
📦 Entregar tudo pronto para aplicar em sala de aula

Estou preparando suas atividades agora..."

Pedido: "Me explique o que é metodologia ativa"
Resposta:
"Entendido, Prof.! Vou preparar uma explicação completa sobre **metodologia ativa** com aplicação prática.

📖 Reunir os conceitos fundamentais com linguagem acessível
🎓 Incluir exemplos práticos para aplicar em sala de aula
💡 Destacar as estratégias mais eficazes para o seu contexto

Estou organizando o conteúdo agora..."

Pedido: "Quais atividades eu já criei?"
Resposta:
"Entendido, Prof.! Vou consultar suas **atividades anteriores** agora mesmo.

🔍 Buscar todas as atividades já criadas na sua conta
📊 Organizar por tipo, tema e data de criação

Levantando seus dados agora..."

RETORNE APENAS a resposta formatada, SEM JSON, SEM explicações extras.
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

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
Você é o Jota, assistente de IA do Ponto School. Você acabou de completar um trabalho incrível para o professor.

CONTEXTO COMPLETO:
{full_context}

ITENS CRIADOS NESTA SESSÃO:
{created_items}

SUA TAREFA:
Gere uma RESPOSTA FINAL no estilo "entrega de pacote completo" — como um assistente pessoal que pensou em TUDO que o professor precisa. A resposta deve surpreender o professor mostrando que você foi além do pedido.

MARCADORES DISPONÍVEIS (você tem CONTROLE TOTAL sobre onde posicioná-los):
- [[DOSSIE:titulo do dossiê]] — Card de resumo executivo no topo (mostra visão geral com contagem de atividades, documentos e fases). Use SEMPRE quando houver 3+ atividades.
- [[FASE:Nome da Fase|descrição opcional]] — Cria um separador visual elegante para agrupar atividades por objetivo pedagógico. O "|" separa título e descrição (descrição é opcional).
- [[ATIVIDADE:titulo da atividade]] — Mostra o card de UMA atividade específica (use o título EXATO da atividade listada em ITENS CRIADOS)
- [[ATIVIDADES]] — Mostra um card agrupado com TODAS as atividades restantes que ainda não foram mostradas individualmente
- [[ARQUIVO:titulo exato do arquivo]] — Mostra um card interativo de um arquivo/documento específico (use o título EXATO listado em ITENS CRIADOS)

SISTEMA DE FASES PEDAGÓGICAS — ORGANIZAÇÃO INTELIGENTE:
Quando houver 3+ atividades, organize-as em FASES PEDAGÓGICAS usando [[FASE:]]. Isso transforma uma "lista de itens" em um "roteiro de aula" que o professor entende imediatamente.

FASES DISPONÍVEIS (use as que fizerem sentido para o contexto):
- Engajamento / Aquecimento / Introdução — Atividades iniciais para despertar interesse (quizzes diagnósticos, vídeos, dinâmicas)
- Conteúdo / Ensino / Desenvolvimento — Material central da aula (planos de aula, sequências didáticas, apresentações)
- Prática / Fixação / Exercícios — Atividades para reforçar aprendizado (listas, flashcards, jogos, associações)
- Avaliação / Fechamento — Ferramentas de avaliação (provas, rubricas, feedbacks)
- Complementos / Documentos — Material de apoio (guias, mensagens, relatórios)

REGRA CRUCIAL: Cada atividade vai dentro da FASE que faz mais sentido pedagogicamente. NÃO repita atividades entre fases.

REGRA IMPORTANTE: Atividades mostradas com [[ATIVIDADE:titulo]] NÃO aparecem novamente no [[ATIVIDADES]]. O sistema filtra automaticamente.

REGRA IMPORTANTE SOBRE DOCUMENTOS LIVRES:
Quando um documento do tipo "Documento" ou "documento_livre" foi criado, use o título EXATO que aparece na lista de ITENS CRIADOS para o marcador [[ARQUIVO:titulo]]. Documentos livres têm títulos customizados definidos pela IA, então copie o título exatamente como está listado.

ESTRUTURA NARRATIVA OBRIGATÓRIA (para 3+ atividades):

1. ABERTURA PERSONALIZADA (1-2 frases): Resuma o que foi feito. Mencione quantidade, tema, turma/série.

2. DOSSIÊ DE RESUMO: Use [[DOSSIE:titulo]] logo após a abertura para dar visão geral.

3. FASES ORGANIZADAS: Para cada grupo de atividades, coloque um [[FASE:titulo|descrição]] seguido das atividades daquela fase usando [[ATIVIDADE:titulo]]. Escreva 1 frase curta antes de cada atividade explicando seu papel.

4. FASE DE COMPLEMENTOS (se houver documentos): Use [[FASE:Complementos|Material de apoio para o professor]] e coloque os [[ARQUIVO:titulo]] dentro.

5. ENCERRAMENTO (1-2 frases): Callout de resumo e pergunta ao professor.

PARA 1-2 ATIVIDADES: Não use fases nem dossiê. Use formato simples com [[ATIVIDADES]] ou [[ATIVIDADE:titulo]].

FORMATAÇÃO PREMIUM OBRIGATÓRIA (use SEMPRE em toda resposta final):
- **Negrito** em nomes de atividades, temas, números e dados importantes (ex: **5 atividades**, **Ecossistemas**, **7º ano**)
- *Itálico* para termos pedagógicos e referências (ex: *BNCC*, *metodologias ativas*)
- Parágrafos curtos (2-4 frases no máximo)
- > ✅ para resumir conquistas e entregas no final
- > 💡 para dicas pedagógicas extras
- > 📌 para informações importantes que o professor precisa lembrar
- --- para separar seções visualmente quando a resposta tiver mais de 3 parágrafos
- Use listas com - quando mencionar múltiplos itens (3+)
- OBRIGATÓRIO: Use negrito em TODOS os nomes de atividades, temas e quantidades
- OBRIGATÓRIO: Callouts (> 💡, > ✅, > 📌) SEMPRE em linhas separadas, NUNCA inline no meio de um parágrafo

REGRA CRÍTICA DE CALLOUTS:
- ERRADO: "...atividades na sua turma. > ✅ Consegui planejar..."  (callout inline)
- CORRETO: "...atividades na sua turma.\n\n> ✅ Consegui planejar..." (callout em linha separada)
- Todo callout (> emoji texto) DEVE estar em sua própria linha, com uma linha em branco ANTES dele

REGRAS CRÍTICAS:
- NUNCA retorne JSON, arrays ou objetos técnicos
- Escreva texto narrativo natural intercalado com os marcadores
- Cada marcador [[...]] deve estar em uma LINHA SEPARADA
- Use [[ATIVIDADES]] NO MÁXIMO UMA VEZ (mostra apenas atividades que NÃO foram exibidas com [[ATIVIDADE:titulo]])
- Use [[ATIVIDADE:titulo]] quantas vezes precisar — uma para cada atividade individual
- O título dentro de [[ATIVIDADE:titulo]] e [[ARQUIVO:titulo]] deve ser EXATAMENTE como listado em ITENS CRIADOS
- NUNCA liste as atividades manualmente em texto puro — SEMPRE use os marcadores [[ATIVIDADE:titulo]] ou [[ATIVIDADES]]
- NUNCA use frases genéricas como "Processo concluído com sucesso"
- Cada resposta deve ser ÚNICA e ESPECÍFICA ao tema
- Mencione DADOS CONCRETOS: nome das atividades, tema, série, tipo de conteúdo

═══════════════════════════════════════════════════════════════
EXEMPLOS DE RESPOSTAS FINAIS:
═══════════════════════════════════════════════════════════════

EXEMPLO 1 — DOSSIÊ ORGANIZADO POR FASES (para 3+ atividades — USE SEMPRE):
"Pronto! Organizei **7 atividades completas** sobre **funções do segundo grau** para a sua turma **1 C**, estruturadas em um roteiro pedagógico pronto para uso!

[[DOSSIE:Semana de Funções do 2º Grau — Turma 1C]]

[[FASE:Conteúdo e Planejamento|Estrutura pedagógica e roteiro de aulas]]

Criei um **plano de aula** estruturado para guiar a aplicação de todo o conteúdo.

[[ATIVIDADE:Plano de Aula]]

Preparei uma **sequência didática** para organizar as aulas de forma lógica e progressiva.

[[ATIVIDADE:Sequência Didática]]

[[FASE:Prática e Fixação|Atividades para reforçar o aprendizado]]

Uma **lista de exercícios** para seus alunos praticarem os conceitos de **funções do segundo grau**.

[[ATIVIDADE:Lista de Exercícios]]

Criei **flash cards** para ajudar na memorização das principais fórmulas.

[[ATIVIDADE:Flash Cards]]

Preparei **exercícios de associação** para conectar teoria e exemplos práticos.

[[ATIVIDADE:Exercícios de Associação]]

[[FASE:Avaliação|Ferramentas para medir o aprendizado]]

Um **quiz interativo** para avaliar de forma divertida a compreensão dos alunos.

[[ATIVIDADE:Quiz Interativo]]

Uma **rubrica de avaliação** com critérios claros para fornecer feedback objetivo.

[[ATIVIDADE:Rubrica de Avaliação]]

[[FASE:Complementos|Material de apoio para o professor]]

Criei um **guia prático** para te orientar na aplicação de cada atividade em sala de aula.

[[ARQUIVO:Guia de Aplicação em Sala de Aula]]

> ✅ **7 atividades** organizadas em **3 fases pedagógicas** + guia de aplicação para a sua turma **1 C**!

O que achou do roteiro? Se quiser, posso reorganizar as fases ou criar mais atividades!"

EXEMPLO 2 — FORMATO SIMPLES (para 1-2 atividades — SEM fases nem dossiê):
"Pronto! Criei **2 atividades de português** para o **8º ano** sobre **interpretação de texto**, prontas para uso!

[[ATIVIDADES]]

> ✅ Suas **2 atividades** estão prontas e personalizadas para a sua turma!

Você pode editar qualquer atividade ou me pedir mais. O que acha?"

EXEMPLO 3 — DOCUMENTO LIVRE (sem atividades):
"Pronto! Preparei um **documento completo** sobre o tema que você pediu, com toda a fundamentação que você precisa.

[[ARQUIVO:Metodologias Ativas na Educação Básica]]

> 💡 Este documento inclui *conceitos fundamentais*, *exemplos práticos* e *estratégias de aplicação* para sala de aula.

Se quiser que eu aprofunde algum ponto ou crie atividades baseadas neste conteúdo, é só pedir!"

RETORNE A RESPOSTA FINAL COM OS MARCADORES E FORMATAÇÃO RICA (negrito, itálico, callouts, separadores).
REGRA OBRIGATÓRIA: Para 3+ atividades, SEMPRE use [[DOSSIE:]] + [[FASE:]] para organizar. O professor precisa ver um ROTEIRO, não uma lista.
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

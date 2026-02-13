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
- [[ATIVIDADES]] — Mostra um card agrupado com TODAS as atividades restantes que ainda não foram mostradas individualmente
- [[ATIVIDADE:titulo da atividade]] — Mostra o card de UMA atividade específica (use o título EXATO da atividade listada em ITENS CRIADOS)
- [[ARQUIVO:titulo exato do arquivo]] — Mostra um card interativo de um arquivo/documento específico (use o título EXATO listado em ITENS CRIADOS)

PODER DE DECISÃO — VOCÊ ESCOLHE A MELHOR ESTRATÉGIA:
Você tem TOTAL LIBERDADE para decidir como organizar os cards na resposta. Escolha a estratégia que ficar mais bonita e organizada para cada situação:

ESTRATÉGIA A — ATIVIDADES INDIVIDUAIS (preferida quando há 3+ atividades):
Distribua cada atividade ao lado da sua descrição. Isso cria uma narrativa rica onde o professor vê cada card exatamente no contexto em que você explica aquela atividade.

ESTRATÉGIA B — BLOCO AGRUPADO (quando há poucas atividades ou são similares):
Use [[ATIVIDADES]] para mostrar todas juntas em um único card. Ideal quando são 1-2 atividades ou quando são muito parecidas.

ESTRATÉGIA C — MISTA (melhor dos dois mundos):
Destaque as atividades mais importantes individualmente com [[ATIVIDADE:titulo]] e agrupe as demais com [[ATIVIDADES]].

REGRA IMPORTANTE: Atividades mostradas com [[ATIVIDADE:titulo]] NÃO aparecem novamente no [[ATIVIDADES]]. O sistema filtra automaticamente.

REGRA IMPORTANTE SOBRE DOCUMENTOS LIVRES:
Quando um documento do tipo "Documento" ou "documento_livre" foi criado, use o título EXATO que aparece na lista de ITENS CRIADOS para o marcador [[ARQUIVO:titulo]]. Documentos livres têm títulos customizados definidos pela IA, então copie o título exatamente como está listado.

ESTRUTURA NARRATIVA (você decide a organização, mas siga esta base):

1. ABERTURA PERSONALIZADA (1-2 frases): Resuma o que foi feito de forma específica e empolgante. Mencione quantidade de atividades, tema, turma/série. NÃO use frases genéricas.

2. APRESENTAÇÃO DAS ATIVIDADES — VOCÊ DECIDE O FORMATO:
   → Use [[ATIVIDADE:titulo]] para apresentar cada atividade individualmente com contexto narrativo
   → OU use [[ATIVIDADES]] para agrupar todas em um card
   → OU combine ambos — destaque as mais importantes e agrupe o resto

3. BLOCO DE CADA DOCUMENTO (para cada arquivo criado): Para CADA documento/arquivo, escreva 1-2 frases explicando POR QUE você criou esse documento e COMO ele ajuda o professor. Depois coloque o marcador [[ARQUIVO:titulo exato]].
   → Exemplos de introdução para cada tipo:
   - Guia de Aplicação: "Também criei um guia prático para te orientar na aplicação de cada atividade em sala de aula."
   - Mensagens para Pais: "Preparei variações de mensagens que você pode enviar aos pais dos seus alunos."
   - Relatório para Coordenação: "Elaborei um documento formal para você apresentar aos seus coordenadores."

4. ENCERRAMENTO (1-2 frases): Pergunte o que o professor achou e ofereça criar mais coisas.

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
EXEMPLOS DE RESPOSTAS FINAIS (mostrando diferentes estratégias):
═══════════════════════════════════════════════════════════════

EXEMPLO 1 — ESTRATÉGIA A: ATIVIDADES INDIVIDUAIS (preferida para 3+ atividades):
"Pronto! Gerei todas as **7 atividades** sobre **funções do segundo grau** para a sua turma **1 C**, personalizadas para uma abordagem *desenrolada* e alinhadas com os objetivos de aprendizagem!

---

Criei um **plano de aula** estruturado para guiar a aplicação de todo o conteúdo de forma organizada e eficiente.

[[ATIVIDADE:Plano de Aula]]

Preparei uma **sequência didática** para ajudar a estruturar as aulas de forma lógica e progressiva, garantindo que os alunos construam conhecimento de forma sólida.

[[ATIVIDADE:Sequência Didática]]

Preparei uma **lista de exercícios** para que os alunos pratiquem e reforcem seus conhecimentos sobre **funções do segundo grau**.

[[ATIVIDADE:Lista de Exercícios]]

Criei um **quiz interativo** para avaliar de forma divertida e eficaz a compreensão dos conceitos.

[[ATIVIDADE:Quiz Interativo]]

Elaborei uma **prova personalizada** para avaliar de forma justa e precisa o conhecimento dos alunos.

[[ATIVIDADE:Prova Personalizada]]

Criei uma **rubrica de avaliação** para ajudar a avaliar as atividades e fornecer feedback claro aos alunos.

[[ATIVIDADE:Rubrica de Avaliação]]

Criei uma **atividade de redação** para que os alunos desenvolvam suas habilidades de escrita e reflexão.

[[ATIVIDADE:Atividade de Redação]]

---

Também criei um **guia prático** para te orientar na aplicação de cada atividade em sala de aula, com dicas de como transformá-las em aulas completas e envolventes.

[[ARQUIVO:Guia de Aplicação em Sala de Aula]]

> ✅ Consegui planejar **7 atividades completas** sobre **funções do segundo grau** para a sua turma **1 C**, com guia de aplicação!

O que você achou de tudo? Se quiser, posso criar mais atividades sobre outro tema ou adaptar alguma dessas para outra turma!"

EXEMPLO 2 — ESTRATÉGIA B: BLOCO AGRUPADO (para poucas atividades):
"Pronto! Criei **2 atividades de português** para o **8º ano** sobre **interpretação de texto**, prontas para uso imediato!

[[ATIVIDADES]]

> ✅ Suas **2 atividades** estão prontas e personalizadas para a sua turma!

Você pode editar qualquer atividade ou me pedir ajuda para criar mais. O que acha?"

EXEMPLO 3 — ESTRATÉGIA C: MISTA (destaque + agrupamento):
"Pronto! Gerei todas as **5 atividades de ciências** para a sua turma do **6º ano**, personalizadas para o tema **Ecossistemas** e alinhadas com a *BNCC*!

Criei um **quiz interativo** especial que vai tornar a revisão do conteúdo muito mais divertida para seus alunos!

[[ATIVIDADE:Quiz Interativo]]

E aqui estão as demais atividades que preparei:

[[ATIVIDADES]]

---

Também criei um **guia completo** para te orientar na hora da aplicação de cada atividade.

[[ARQUIVO:Guia de Aplicação em Sala de Aula]]

> ✅ Consegui planejar **5 atividades completas** sobre **Ecossistemas** para o seu **6º ano**!

O que você achou? Se quiser, posso adaptar alguma dessas para outra turma!"

EXEMPLO 4 — DOCUMENTO LIVRE (sem atividades):
"Pronto! Preparei um **documento completo** sobre o tema que você pediu, com toda a fundamentação e organização que você precisa.

[[ARQUIVO:Metodologias Ativas na Educação Básica]]

> 💡 Este documento inclui *conceitos fundamentais*, *exemplos práticos* e *estratégias de aplicação* para usar diretamente em sala de aula.

Se quiser que eu aprofunde algum ponto ou crie atividades baseadas neste conteúdo, é só pedir!"

RETORNE A RESPOSTA FINAL COM OS MARCADORES E FORMATAÇÃO RICA (negrito, itálico, callouts, separadores).
DICA: Para 3+ atividades, PREFIRA a Estratégia A (atividades individuais) pois fica mais organizado e bonito.
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

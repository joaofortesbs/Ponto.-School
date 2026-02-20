/**
 * FINAL RESPONSE SERVICE v2.1 — Full Prompt + Deterministic Safety Net
 * 
 * Architecture:
 * 1. CODE pre-organizes items by pedagogical phase (deterministic classification)
 * 2. Full FINAL_RESPONSE_PROMPT is sent to LLM with pre-organized items
 * 3. If LLM response is valid (has markers) → use it directly (rich quality)
 * 4. If LLM fails → deterministic fallback builds structure with fallback paragraphs
 * 
 * This preserves the original prompt's quality while guaranteeing structure.
 */

import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import { getContextManager, type ContextoMacro } from './context-manager';
import { 
  sanitizeAiOutput, 
  sanitizeContextForPrompt, 
  containsRawJson,
} from './output-sanitizer';

interface ActivityItem {
  id: string;
  titulo: string;
  tipo: string;
  db_id?: number;
}

interface ArtifactItem {
  id: string;
  metadata?: {
    titulo?: string;
    tipo?: string;
  };
}

interface CollectedItemsInput {
  activities: ActivityItem[];
  artifacts: ArtifactItem[];
}

interface PhaseGroup {
  phaseKey: string;
  phaseTitle: string;
  phaseDescription: string;
  activities: ActivityItem[];
  artifacts: ArtifactItem[];
}

const PHASE_DEFINITIONS: Record<string, { title: string; description: string; order: number }> = {
  'engajamento': {
    title: 'Engajamento / Aquecimento / Introdução',
    description: 'Atividades iniciais para despertar interesse',
    order: 1,
  },
  'conteudo': {
    title: 'Conteúdo / Ensino / Desenvolvimento',
    description: 'Material central da aula',
    order: 2,
  },
  'pratica': {
    title: 'Prática / Fixação / Exercícios',
    description: 'Atividades para reforçar o aprendizado',
    order: 3,
  },
  'avaliacao': {
    title: 'Avaliação / Fechamento',
    description: 'Ferramentas para medir o aprendizado',
    order: 4,
  },
  'complementos': {
    title: 'Documentos Complementares',
    description: 'Materiais estratégicos que antecipam suas próximas necessidades',
    order: 5,
  },
};

const CATEGORY_TO_PHASE: Record<string, string> = {
  'planejamento': 'engajamento',
  'engajamento': 'engajamento',
  'estudo': 'conteudo',
  'escrita': 'conteudo',
  'pratica': 'pratica',
  'avaliacao': 'avaliacao',
  'organizacao': 'complementos',
  'comunicacao': 'complementos',
  'diferenciacao': 'complementos',
};

const TIPO_TO_PHASE: Record<string, string> = {
  'plano-aula': 'engajamento',
  'sequencia-didatica': 'engajamento',
  'lista-exercicios': 'pratica',
  'quiz-interativo': 'avaliacao',
  'flash-cards': 'conteudo',
  'tese-redacao': 'conteudo',
};

const TITLE_TO_CATEGORY: Record<string, string> = {
  'atividade diferenciada': 'diferenciacao',
  'atividade steam': 'planejamento',
  'atividade socioemocional': 'engajamento',
  'atividade de redação': 'escrita',
  'autoavaliação do aluno': 'avaliacao',
  'avaliação diagnóstica': 'avaliacao',
  'bingo educativo': 'engajamento',
  'cer — afirmação, evidência e raciocínio': 'engajamento',
  'caça-palavras': 'engajamento',
  'comentários para boletim': 'comunicacao',
  'comunicado institucional': 'comunicacao',
  'convite para evento': 'comunicacao',
  'cronograma de estudos': 'planejamento',
  'debate estruturado': 'engajamento',
  'desafios e competições': 'engajamento',
  'diário reflexivo': 'escrita',
  'estudo de caso': 'engajamento',
  'exercícios verdadeiro ou falso': 'avaliacao',
  'exercícios de associação': 'avaliacao',
  'exercícios de múltipla escolha': 'avaliacao',
  'exercícios de ordenação': 'avaliacao',
  'exercícios de preencher lacunas': 'avaliacao',
  'exit ticket': 'engajamento',
  'gabarito comentado': 'organizacao',
  'gallery walk': 'engajamento',
  'guia de estudo / apostila': 'organizacao',
  'icebreaker / acolhimento': 'engajamento',
  'infográfico textual': 'organizacao',
  'interpretação de texto': 'escrita',
  'jigsaw (cooperativa)': 'engajamento',
  'jogo show do milhão': 'engajamento',
  'leitura com perguntas': 'escrita',
  'lista de vocabulário': 'engajamento',
  'mapa mental': 'organizacao',
  'material adaptado por nível': 'diferenciacao',
  'newsletter da turma': 'comunicacao',
  'organizador gráfico': 'organizacao',
  'painel de âncora': 'organizacao',
  'palavras cruzadas': 'engajamento',
  'planejamento anual': 'planejamento',
  'plano de apoio individualizado': 'diferenciacao',
  'plano de unidade': 'planejamento',
  'plano para professor substituto': 'planejamento',
  'prompt de escrita': 'escrita',
  'prova personalizada': 'avaliacao',
  'quadro comparativo': 'organizacao',
  'quadro de escolhas': 'diferenciacao',
  'questões dissertativas': 'avaliacao',
  'relatório individual': 'comunicacao',
  'resenha crítica': 'escrita',
  'resumo / fichamento': 'organizacao',
  'revisão espiral': 'planejamento',
  'roteiro de apresentação': 'escrita',
  'roteiro de laboratório': 'planejamento',
  'roteiro de projeto pbl': 'planejamento',
  'rubrica de avaliação': 'organizacao',
  'seminário socrático': 'engajamento',
  'simulado': 'avaliacao',
  'teste cloze': 'avaliacao',
  'texto mentor': 'escrita',
  'think-pair-share': 'engajamento',
};

function classifyActivityToPhase(activity: ActivityItem): string {
  const tipo = (activity.tipo || '').toLowerCase();
  const titulo = (activity.titulo || '').toLowerCase();

  if (TIPO_TO_PHASE[tipo]) {
    return TIPO_TO_PHASE[tipo];
  }

  if (tipo === 'atividade-textual') {
    const exactCategory = TITLE_TO_CATEGORY[titulo];
    if (exactCategory) {
      return CATEGORY_TO_PHASE[exactCategory] || 'pratica';
    }

    for (const [knownTitle, category] of Object.entries(TITLE_TO_CATEGORY)) {
      if (titulo.includes(knownTitle) || knownTitle.includes(titulo)) {
        return CATEGORY_TO_PHASE[category] || 'pratica';
      }
    }

    console.warn(`⚠️ [FinalResponse] Atividade textual sem mapeamento de fase: "${activity.titulo}" — usando fallback 'pratica'`);
    return 'pratica';
  }

  console.warn(`⚠️ [FinalResponse] Tipo de atividade desconhecido: "${activity.tipo}" título: "${activity.titulo}" — usando fallback 'pratica'`);
  return 'pratica';
}

function classifyArtifactToPhase(_artifact: ArtifactItem): string {
  return 'complementos';
}

function groupItemsByPhase(items: CollectedItemsInput): PhaseGroup[] {
  const phaseMap: Record<string, PhaseGroup> = {};

  for (const activity of items.activities) {
    const phaseKey = classifyActivityToPhase(activity);
    if (!phaseMap[phaseKey]) {
      const def = PHASE_DEFINITIONS[phaseKey] || PHASE_DEFINITIONS['pratica'];
      phaseMap[phaseKey] = {
        phaseKey,
        phaseTitle: def.title,
        phaseDescription: def.description,
        activities: [],
        artifacts: [],
      };
    }
    phaseMap[phaseKey].activities.push(activity);
  }

  for (const artifact of items.artifacts) {
    const phaseKey = classifyArtifactToPhase(artifact);
    if (!phaseMap[phaseKey]) {
      const def = PHASE_DEFINITIONS[phaseKey] || PHASE_DEFINITIONS['complementos'];
      phaseMap[phaseKey] = {
        phaseKey,
        phaseTitle: def.title,
        phaseDescription: def.description,
        activities: [],
        artifacts: [],
      };
    }
    phaseMap[phaseKey].artifacts.push(artifact);
  }

  return Object.values(phaseMap).sort((a, b) => {
    const orderA = PHASE_DEFINITIONS[a.phaseKey]?.order ?? 99;
    const orderB = PHASE_DEFINITIONS[b.phaseKey]?.order ?? 99;
    return orderA - orderB;
  });
}

const FINAL_RESPONSE_SYSTEM_PROMPT = `Você é o Jota, assistente de IA do Ponto School. Você é um consultor pedagógico experiente que orienta professores com insights práticos e estratégicos. Sua linguagem é direta, acolhedora e profissional.`;

const FINAL_RESPONSE_PROMPT = `
Você é o Jota, assistente de IA do Ponto School. Você acabou de completar um trabalho incrível para o professor.

CONTEXTO COMPLETO:
{full_context}

ITENS CRIADOS NESTA SESSÃO:
{created_items}

SUA TAREFA:
Gere uma RESPOSTA FINAL no estilo "entrega de pacote completo" — como um assistente pessoal que pensou em TUDO que o professor precisa. A resposta deve surpreender o professor mostrando que você foi além do pedido.

MARCADORES DISPONÍVEIS (você tem CONTROLE TOTAL sobre onde posicioná-los):
- [[FASE:Nome da Fase|descrição opcional]] — Cria um separador visual elegante para agrupar atividades por objetivo pedagógico. O "|" separa título e descrição (descrição é opcional).
- [[ATIVIDADE:titulo da atividade]] — Mostra o card de UMA atividade específica (use o título EXATO da atividade listada em ITENS CRIADOS)
- [[ATIVIDADES]] — Mostra um card agrupado com TODAS as atividades restantes que ainda não foram mostradas individualmente
- [[ARQUIVO:titulo exato do arquivo]] — Mostra um card interativo de um arquivo/documento específico (use o título EXATO listado em ITENS CRIADOS)

SISTEMA DE FASES PEDAGÓGICAS — ORGANIZAÇÃO INTELIGENTE:
Quando houver 3+ atividades, organize-as em FASES PEDAGÓGICAS usando [[FASE:]]. Isso transforma uma "lista de itens" em um "roteiro de aula" que o professor entende imediatamente.

FASES DISPONÍVEIS (use as que fizerem sentido para o contexto):
- Engajamento / Aquecimento / Introdução — Atividades iniciais para despertar interesse
- Conteúdo / Ensino / Desenvolvimento — Material central da aula
- Prática / Fixação / Exercícios — Atividades para reforçar aprendizado
- Avaliação / Fechamento — Ferramentas de avaliação
- Complementos / Documentos — Material de apoio

REGRA CRUCIAL: Cada atividade vai dentro da FASE que faz mais sentido pedagogicamente. NÃO repita atividades entre fases.

REGRA CRUCIAL DE AGRUPAMENTO POR FASE:
Dentro de cada fase, escreva UM PARÁGRAFO ESTRATÉGICO de 2-4 frases (NÃO uma frase por atividade, mas um parágrafo unificado com insights pedagógicos valiosos sobre TODAS as atividades daquela fase). Depois do parágrafo, liste TODOS os marcadores [[ATIVIDADE:titulo]] consecutivamente (um abaixo do outro, sem texto entre eles). O sistema automaticamente agrupa atividades consecutivas em um card único.

FORMATO OBRIGATÓRIO POR FASE:
[[FASE:titulo|descrição]]

Um parágrafo estratégico de 2-4 frases com INSIGHTS PEDAGÓGICOS VALIOSOS para o professor: explique POR QUE escolheu essas atividades para essa fase, COMO elas se complementam entre si, QUANDO aplicar (em que momento da aula/sequência), e DICAS PRÁTICAS de uso em sala. Isso é o diferencial do Jota — não apenas criar, mas orientar o professor como um consultor pedagógico.

[[ATIVIDADE:Atividade 1]]
[[ATIVIDADE:Atividade 2]]
[[ATIVIDADE:Atividade 3]]

ERRADO (NÃO faça assim — frases curtas e genéricas SEM valor estratégico):
[[FASE:Prática]]
Criei uma lista de exercícios para praticar.
[[ATIVIDADE:Lista de Exercícios]]
Preparei flash cards para memorização.
[[ATIVIDADE:Flash Cards]]

ERRADO (NÃO faça assim — frase única e superficial):
[[FASE:Engajamento / Aquecimento|Atividades iniciais]]
Comece por aqui — atividades curtas que ativam o conhecimento prévio.
[[ATIVIDADE:Plano de Aula]]

CORRETO (faça assim — insights estratégicos RICOS com valor real para o professor):
[[FASE:Prática e Fixação|Atividades para reforçar o aprendizado]]

Prof., essas atividades funcionam melhor quando aplicadas na **segunda ou terceira aula** da sequência, depois que os conceitos iniciais já foram apresentados. Recomendo alternar entre exercícios individuais e em dupla — a troca entre pares ajuda na fixação e cobre lacunas que a explicação sozinha não resolve. Os **Flash Cards** são ideais para revisão nos últimos 10 minutos, ou como aquecimento da aula seguinte.

[[ATIVIDADE:Lista de Exercícios]]
[[ATIVIDADE:Flash Cards]]

REGRA IMPORTANTE: Atividades mostradas com [[ATIVIDADE:titulo]] NÃO aparecem novamente no [[ATIVIDADES]]. O sistema filtra automaticamente.

REGRA IMPORTANTE SOBRE DOCUMENTOS LIVRES:
Quando um documento do tipo "Documento" ou "documento_livre" foi criado, use o título EXATO que aparece na lista de ITENS CRIADOS para o marcador [[ARQUIVO:titulo]]. Documentos livres têm títulos customizados definidos pela IA, então copie o título exatamente como está listado.

ESTRUTURA NARRATIVA OBRIGATÓRIA (para 3+ atividades):
1. ABERTURA PERSONALIZADA (1-2 frases): Resuma o que foi feito. Mencione quantidade, tema, turma/série.
2. FASES ORGANIZADAS: Para cada grupo de atividades, coloque um [[FASE:titulo|descrição]], depois um PARÁGRAFO ESTRATÉGICO de 2-4 frases com insights pedagógicos valiosos (por que, como, quando aplicar), e em seguida todos os marcadores [[ATIVIDADE:titulo]] juntos consecutivamente.
3. FASE DE COMPLEMENTOS (OBRIGATÓRIA quando houver documentos): Use [[FASE:Documentos Complementares|Materiais estratégicos que antecipam suas próximas necessidades]], seguido de um PARÁGRAFO ESTRATÉGICO de 3-5 frases que explique o VALOR REAL de cada documento — não apenas liste, mas mostre ao professor como cada um resolve uma dor específica do dia a dia (ex: "A **Mensagem para os Pais** já está pronta em 3 versões — formal, WhatsApp e objetiva — para você não perder tempo redigindo comunicados"). Depois do parágrafo, coloque os [[ARQUIVO:titulo]] juntos consecutivamente.
4. ENCERRAMENTO ESTRATÉGICO (3-5 frases): Um parágrafo de fechamento onde o Jota dá sua OPINIÃO formada sobre o roteiro criado, sugere PRÓXIMOS PASSOS concretos que o professor pode pedir (ex: "Se quiser, posso criar uma avaliação diagnóstica para aplicar antes de começar, ou adaptar as atividades para uma turma com mais dificuldade"), e fecha com uma pergunta engajadora. Depois do parágrafo, opcionalmente use > 💡 para uma dica extra ou > 📌 para um lembrete prático. NÃO use > ✅ (ele é redundante).

PARA 1-2 ATIVIDADES: Não use fases. Use formato simples com [[ATIVIDADES]] ou [[ATIVIDADE:titulo]].

FORMATAÇÃO PREMIUM OBRIGATÓRIA (use SEMPRE em toda resposta final):
- **Negrito** em nomes de atividades, temas, números e dados importantes (ex: **5 atividades**, **Ecossistemas**, **7º ano**)
- *Itálico* para termos pedagógicos e referências (ex: *BNCC*, *metodologias ativas*)
- Parágrafos curtos (2-4 frases no máximo)
- > 💡 para dicas pedagógicas extras (máximo 1 por resposta)
- > 📌 para informações práticas que o professor precisa lembrar (máximo 1 por resposta)
- NUNCA use > ✅ — é redundante e não agrega valor (o professor já sabe o que foi feito)
- --- para separar seções visualmente quando a resposta tiver mais de 3 parágrafos
- Use listas com - quando mencionar múltiplos itens (3+)
- OBRIGATÓRIO: Use negrito em TODOS os nomes de atividades, temas e quantidades
- OBRIGATÓRIO: Callouts (> 💡, > 📌) SEMPRE em linhas separadas, NUNCA inline no meio de um parágrafo

REGRA CRÍTICA DE CALLOUTS:
- Todo callout (> emoji texto) DEVE estar em sua própria linha, com uma linha em branco ANTES dele
- Use no MÁXIMO 2 callouts por resposta (1x > 💡 + 1x > 📌, ou apenas 1 deles)
- NUNCA use > ✅ — o professor não precisa de um resumo do que já viu sendo criado

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

EXEMPLO 1 — FASES COM ATIVIDADES AGRUPADAS (para 3+ atividades — USE SEMPRE):
"Pronto! Organizei **7 atividades completas** sobre **funções do segundo grau** para a sua turma **1 C**, em um roteiro pedagógico pronto para uso!

[[FASE:Engajamento / Aquecimento|Atividades iniciais para despertar interesse]]

Prof., a ideia aqui é começar pela **ativação do conhecimento prévio** — se os alunos já tiveram contato com equações de 1º grau, essas atividades criam a ponte natural para o segundo grau. O Plano de Aula traz a estrutura completa da primeira aula, enquanto a Sequência Didática conecta as **3 a 4 aulas seguintes** em uma progressão coerente. Sugiro aplicar o Plano de Aula primeiro e usar a Sequência como guia para as próximas aulas.

[[ATIVIDADE:Plano de Aula]]
[[ATIVIDADE:Sequência Didática]]

[[FASE:Prática e Fixação|Atividades para reforçar o aprendizado]]

Essas atividades funcionam melhor a partir da **segunda aula**, quando os conceitos iniciais já foram apresentados. Recomendo alternar entre exercícios individuais e em dupla — a troca entre pares ajuda na fixação e cobre lacunas que a explicação sozinha não resolve. Os Flash Cards são ideais para revisão nos **últimos 10 minutos** da aula, ou como aquecimento da aula seguinte, reforçando a memorização das fórmulas sem monotonia.

[[ATIVIDADE:Lista de Exercícios]]
[[ATIVIDADE:Flash Cards]]
[[ATIVIDADE:Exercícios de Associação]]

[[FASE:Avaliação / Fechamento|Ferramentas para medir o aprendizado]]

Prof., use o Quiz Interativo como **avaliação formativa** (sem nota) — ele mostra em tempo real quais conceitos a turma dominou e onde precisa reforçar. A Rubrica complementa como ferramenta de **feedback individualizado**, permitindo que cada aluno entenda seus pontos fortes e o que precisa melhorar. Juntas, essas ferramentas dão um mapa completo do aprendizado da turma.

[[ATIVIDADE:Quiz Interativo]]
[[ATIVIDADE:Rubrica de Avaliação]]

[[FASE:Documentos Complementares|Materiais estratégicos que antecipam suas próximas necessidades]]

Prof., além das atividades, preparei **3 documentos** que resolvem as tarefas burocráticas que viriam depois: o **Guia de Aplicação** traz o passo a passo para aplicar tudo em sala com cronograma e dicas de mediação. A **Mensagem para os Pais** já está pronta em **3 versões** (formal, WhatsApp e objetiva) — é só copiar e enviar, sem precisar redigir nada. E o **Relatório para Coordenação** documenta todo o trabalho com justificativa pedagógica e alinhamento *BNCC*, pronto para apresentar.

[[ARQUIVO:Guia de Aplicação em Sala de Aula]]
[[ARQUIVO:Mensagem Explicativa para os Pais]]
[[ARQUIVO:Relatório de Criação para Coordenadores]]

Prof., esse roteiro cobre desde a **ativação do conhecimento prévio** até a **avaliação individualizada**, o que significa que você pode usar essas atividades ao longo de **4 a 5 aulas** sem precisar montar nada do zero. Se quiser, posso criar uma **avaliação diagnóstica** para aplicar antes de começar (assim você identifica o nível real da turma), ou adaptar esse roteiro para outra turma com um perfil diferente. Também posso aprofundar qualquer fase com mais atividades — o que prefere?

> 💡 Uma dica: aplique o **Quiz Interativo** na aula seguinte à introdução como *termômetro rápido* — ele mostra em 5 minutos quais conceitos a turma precisa reforçar antes de avançar."

REGRA ANTI-REDUNDÂNCIA + INSIGHT ESTRATÉGICO OBRIGATÓRIO:
O texto entre a fase e os marcadores é o DIFERENCIAL do Jota como consultor pedagógico. NUNCA seja genérico ou superficial.

ERRADO (superficial, sem valor): "Comece por aqui — atividades curtas que ativam o conhecimento prévio." (FRASE GENÉRICA que serve para qualquer tema — zero valor estratégico!)
ERRADO (redundante): "Criei um Plano de Aula para guiar a aplicação." (O CARD JÁ DIZ o nome — não repita!)
CORRETO (insight estratégico RICO — 2-4 frases com valor real):
"Prof., a ideia aqui é começar pela **ativação do conhecimento prévio** — se os alunos já tiveram contato com X, essas atividades criam a ponte natural para Y. Sugiro aplicar na primeira aula da sequência, dedicando os primeiros 15-20 minutos para construir a base."
`.trim();

function buildContextForPrompt(
  contexto: ContextoMacro,
  items: CollectedItemsInput,
  phases: PhaseGroup[],
): { fullContext: string; createdItems: string } {
  const temaLimpo = contexto.resumoProgressivo?.dadosRelevantes?.tema_limpo
    || contexto.resumoProgressivo?.dadosRelevantes?.temas_extraidos
    || '';
  const disciplina = contexto.resumoProgressivo?.dadosRelevantes?.disciplina_extraida || '';
  const turma = contexto.resumoProgressivo?.dadosRelevantes?.turma_extraida || '';

  const fullContext = `
PEDIDO ORIGINAL DO PROFESSOR: "${contexto.inputOriginal.texto}"
TEMA: ${temaLimpo || 'Extrair do pedido acima'}
DISCIPLINA: ${disciplina || 'Não especificada'}
TURMA/SÉRIE: ${turma || 'Não especificada'}
TOTAL DE ATIVIDADES: ${items.activities.length}
TOTAL DE DOCUMENTOS: ${items.artifacts.length}
`.trim();

  const totalItems = items.activities.length + items.artifacts.length;
  const usePhases = totalItems >= 3 && phases.length > 0;

  let createdItems = '';

  if (usePhases) {
    const phaseLines: string[] = [];
    phaseLines.push(`TOTAL: ${items.activities.length} atividades + ${items.artifacts.length} documentos`);
    phaseLines.push('');
    phaseLines.push('ORGANIZAÇÃO POR FASE PEDAGÓGICA (use esta organização na sua resposta):');

    for (const phase of phases) {
      phaseLines.push('');
      phaseLines.push(`📁 FASE: ${phase.phaseTitle}`);
      for (const act of phase.activities) {
        phaseLines.push(`  - ATIVIDADE: "${act.titulo}" (tipo: ${act.tipo})`);
      }
      for (const art of phase.artifacts) {
        const titulo = art.metadata?.titulo || 'Documento';
        phaseLines.push(`  - DOCUMENTO: "${titulo}" (tipo: ${art.metadata?.tipo || 'documento_livre'})`);
      }
    }

    createdItems = phaseLines.join('\n');
  } else {
    const itemLines: string[] = [];
    for (const act of items.activities) {
      itemLines.push(`- ATIVIDADE: "${act.titulo}" (tipo: ${act.tipo})`);
    }
    for (const art of items.artifacts) {
      const titulo = art.metadata?.titulo || 'Documento';
      itemLines.push(`- DOCUMENTO: "${titulo}" (tipo: ${art.metadata?.tipo || 'documento_livre'})`);
    }
    createdItems = itemLines.join('\n');
  }

  return { fullContext, createdItems };
}

function buildDeterministicStructure(
  phases: PhaseGroup[],
  aiParagraphs: Record<string, string>,
  abertura: string,
  encerramento: string,
): string {
  const lines: string[] = [];

  lines.push(abertura);
  lines.push('');

  for (const phase of phases) {
    lines.push(`[[FASE:${phase.phaseTitle}|${phase.phaseDescription}]]`);
    lines.push('');

    const paragraph = aiParagraphs[phase.phaseKey];
    if (paragraph) {
      lines.push(paragraph);
      lines.push('');
    }

    for (const activity of phase.activities) {
      lines.push(`[[ATIVIDADE:${activity.titulo}]]`);
    }

    for (const artifact of phase.artifacts) {
      const titulo = artifact.metadata?.titulo || 'Documento';
      lines.push(`[[ARQUIVO:${titulo}]]`);
    }

    lines.push('');
  }

  lines.push(encerramento);

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function generateFallbackParagraphs(
  phases: PhaseGroup[],
  contexto: ContextoMacro,
  totalActivities: number,
  totalArtifacts: number,
): { abertura: string; fases: Record<string, string>; encerramento: string } {
  const temaLimpo = contexto.resumoProgressivo?.dadosRelevantes?.tema_limpo
    || contexto.resumoProgressivo?.dadosRelevantes?.temas_extraidos
    || 'o conteúdo solicitado';
  const turma = contexto.resumoProgressivo?.dadosRelevantes?.turma_extraida || '';
  const totalItems = totalActivities + totalArtifacts;

  const turmaStr = turma ? ` para a turma **${turma}**` : '';
  const abertura = `Pronto! Organizei **${totalItems} ${totalItems === 1 ? 'item completo' : 'itens completos'}** sobre **${temaLimpo}**${turmaStr}, estruturados em um roteiro pedagógico pronto para uso!`;

  const fases: Record<string, string> = {};

  for (const phase of phases) {
    const count = phase.activities.length + phase.artifacts.length;
    switch (phase.phaseKey) {
      case 'engajamento':
        fases[phase.phaseKey] = `Prof., a ideia aqui é começar pela **ativação do conhecimento prévio** dos alunos sobre **${temaLimpo}**. ${count > 1 ? 'Essas atividades se complementam para criar uma base sólida antes de avançar para o conteúdo principal.' : 'Essa atividade estabelece o ponto de partida para toda a sequência de aprendizado.'} Sugiro aplicar na **primeira aula** da sequência, dedicando os primeiros 15-20 minutos.`;
        break;
      case 'conteudo':
        fases[phase.phaseKey] = `Esse é o coração do roteiro sobre **${temaLimpo}**. ${count > 1 ? 'As atividades aqui trabalham os conceitos centrais de formas complementares — alternando entre formatos mantém o engajamento e reforça a compreensão.' : 'Essa atividade aborda os conceitos centrais de forma dinâmica e interativa.'} Recomendo aplicar após a introdução do tema, quando os alunos já tiverem contexto suficiente.`;
        break;
      case 'pratica':
        fases[phase.phaseKey] = `Prof., essas atividades funcionam melhor a partir da **segunda aula**, quando os conceitos iniciais sobre **${temaLimpo}** já foram apresentados. ${count > 1 ? 'Recomendo alternar entre exercícios individuais e em dupla — a troca entre pares ajuda na fixação e cobre lacunas que a explicação sozinha não resolve.' : 'Pode ser aplicada individualmente ou em duplas, dependendo do perfil da turma.'}`;
        break;
      case 'avaliacao':
        fases[phase.phaseKey] = `Use ${count > 1 ? 'essas ferramentas' : 'essa ferramenta'} como **avaliação formativa** — ${count > 1 ? 'juntas, elas dão um mapa completo do aprendizado da turma sobre **' + temaLimpo + '**' : 'ela mostra em tempo real quais conceitos a turma dominou sobre **' + temaLimpo + '**'}, permitindo ajustar o ritmo antes de avançar. Aplique preferencialmente no final da sequência ou como fechamento de aula.`;
        break;
      case 'complementos':
        if (count >= 3) {
          fases[phase.phaseKey] = `Prof., além das atividades, preparei **${count} documentos complementares** que antecipam suas próximas necessidades: desde orientações práticas de aplicação em sala até comunicação pronta para pais e documentação formal para a coordenação. Cada documento sobre **${temaLimpo}** está pronto para usar — é só abrir, revisar e aplicar, sem precisar redigir nada do zero.`;
        } else if (count === 2) {
          fases[phase.phaseKey] = `Prof., preparei **2 documentos complementares** sobre **${temaLimpo}** que resolvem tarefas que viriam depois: orientações práticas de aplicação e comunicação pronta para enviar. Ambos estão prontos para uso — é só abrir e aplicar.`;
        } else {
          fases[phase.phaseKey] = `Este material reúne orientações práticas de aplicação sobre **${temaLimpo}**, incluindo sugestões de adaptação para turmas com diferentes níveis de domínio no conteúdo.`;
        }
        break;
    }
  }

  const encerramento = `Prof., esse roteiro cobre desde a **introdução** até a **avaliação** sobre **${temaLimpo}**, o que significa que você pode usar essas atividades ao longo de várias aulas sem precisar montar nada do zero. Se quiser, posso criar uma **avaliação diagnóstica** para aplicar antes de começar, ou adaptar esse roteiro para outra turma com um perfil diferente. O que prefere?

> 💡 Dica: aplique as atividades de fixação na aula seguinte à introdução como *revisão ativa* — os alunos absorvem melhor quando praticam logo após o primeiro contato com o conteúdo.`;

  return { abertura, fases, encerramento };
}

function isValidAiResponse(response: string, items: CollectedItemsInput): boolean {
  const hasMarkers = response.includes('[[ATIVIDADE:') || response.includes('[[ATIVIDADES]]') || response.includes('[[ARQUIVO:');
  if (!hasMarkers) return false;

  if (containsRawJson(response)) return false;

  if (response.length < 200) return false;

  const totalItems = items.activities.length + items.artifacts.length;
  if (totalItems >= 3) {
    const hasFases = response.includes('[[FASE:');
    if (!hasFases) return false;
  }

  return true;
}

function repairAiResponse(
  rawResponse: string,
  items: CollectedItemsInput,
  phases: PhaseGroup[],
  contexto: ContextoMacro,
): string | null {
  if (!rawResponse || rawResponse.length < 100) return null;

  const totalItems = items.activities.length + items.artifacts.length;
  const hasMarkers = rawResponse.includes('[[ATIVIDADE:') || rawResponse.includes('[[ARQUIVO:');
  const hasFases = rawResponse.includes('[[FASE:');

  if (hasMarkers && !hasFases && totalItems >= 3) {
    const paragraphs = rawResponse.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length < 2) return null;

    const abertura = paragraphs[0].trim();
    const restText = paragraphs.slice(1).join('\n\n');

    const lines: string[] = [];
    lines.push(abertura);
    lines.push('');

    for (const phase of phases) {
      lines.push(`[[FASE:${phase.phaseTitle}|${phase.phaseDescription}]]`);
      lines.push('');

      for (const activity of phase.activities) {
        const markerRegex = new RegExp(`\\[\\[ATIVIDADE:${activity.titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\]`);
        const beforeMarker = restText.match(new RegExp(`([^\\[\\n]+)\\s*${markerRegex.source}`, 'i'));
        if (beforeMarker && beforeMarker[1] && beforeMarker[1].trim().length > 20 && !beforeMarker[1].includes('[[')) {
          lines.push(beforeMarker[1].trim());
          lines.push('');
        }
      }

      for (const activity of phase.activities) {
        lines.push(`[[ATIVIDADE:${activity.titulo}]]`);
      }
      for (const artifact of phase.artifacts) {
        const titulo = artifact.metadata?.titulo || 'Documento';
        lines.push(`[[ARQUIVO:${titulo}]]`);
      }
      lines.push('');
    }

    const lastParagraphs = paragraphs.filter(p => !p.includes('[[ATIVIDADE:') && !p.includes('[[ARQUIVO:') && !p.includes('[[FASE:'));
    if (lastParagraphs.length > 0) {
      lines.push(lastParagraphs[lastParagraphs.length - 1].trim());
    }

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  return null;
}

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
  collectedItems?: CollectedItemsInput
): Promise<FinalResponseResult> {
  console.log(`🏁 [FinalResponse v2.1] Gerando resposta final para sessão: ${sessionId}`);

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

  const items: CollectedItemsInput = collectedItems || { activities: [], artifacts: [] };
  const totalActivities = items.activities.length;
  const totalArtifacts = items.artifacts.length;
  const totalItems = totalActivities + totalArtifacts;

  if (totalItems === 0) {
    const fallbackResponse = gerarRespostaFallback(contexto);
    contextManager.finalizarSessao();
    return {
      resposta: fallbackResponse,
      resumo: buildResumo(contexto),
      collectedItems,
      sucesso: true,
    };
  }

  const usePhases = totalItems >= 3;
  const phases = usePhases ? groupItemsByPhase(items) : [];

  console.log(`📊 [FinalResponse v2.1] ${totalActivities} atividades, ${totalArtifacts} documentos, ${phases.length} fases, usePhases=${usePhases}`);
  if (usePhases) {
    phases.forEach(p => {
      console.log(`  📁 Fase "${p.phaseKey}": ${p.activities.length} atividades, ${p.artifacts.length} documentos`);
    });
  }

  const { fullContext, createdItems } = buildContextForPrompt(contexto, items, phases);

  const prompt = FINAL_RESPONSE_PROMPT
    .replace('{full_context}', fullContext)
    .replace('{created_items}', createdItems);

  let resposta: string | null = null;

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`📝 [FinalResponse v2.1] ${status}`),
      systemPrompt: FINAL_RESPONSE_SYSTEM_PROMPT,
    });

    if (result.success && result.data) {
      const rawResponse = result.data.trim();

      if (containsRawJson(rawResponse)) {
        console.warn('⚠️ [FinalResponse v2.1] Resposta contém JSON, sanitizando...');
        const sanitized = sanitizeAiOutput(rawResponse, {
          etapaTitulo: 'Resposta Final',
          expectedType: 'narrative',
        });
        const sanitizedText = sanitized.sanitized;

        if (isValidAiResponse(sanitizedText, items)) {
          resposta = sanitizedText;
          console.log('✅ [FinalResponse v2.1] Resposta sanitizada válida');
        }
      } else if (isValidAiResponse(rawResponse, items)) {
        resposta = rawResponse;
        console.log('✅ [FinalResponse v2.1] Resposta da IA válida, usando diretamente');
      } else {
        console.warn('⚠️ [FinalResponse v2.1] Resposta da IA inválida (sem marcadores ou fases), tentando reparar...');
        const repaired = repairAiResponse(rawResponse, items, phases, contexto);
        if (repaired) {
          resposta = repaired;
          console.log('✅ [FinalResponse v2.1] Resposta reparada com fases injetadas');
        }
      }
    }
  } catch (error) {
    console.error('⚠️ [FinalResponse v2.1] Erro na chamada de IA:', error);
  }

  if (!resposta && usePhases) {
    console.log('🔄 [FinalResponse v2.1] Usando fallback determinístico completo');
    const fallbackParagraphs = generateFallbackParagraphs(phases, contexto, totalActivities, totalArtifacts);
    resposta = buildDeterministicStructure(phases, fallbackParagraphs.fases, fallbackParagraphs.abertura, fallbackParagraphs.encerramento);
  }

  if (!resposta) {
    const temaLimpo = contexto.resumoProgressivo?.dadosRelevantes?.tema_limpo || 'o conteúdo solicitado';
    const turma = contexto.resumoProgressivo?.dadosRelevantes?.turma_extraida || '';
    const turmaStr = turma ? ` para a turma **${turma}**` : '';
    const actMarkers = items.activities.map(a => `[[ATIVIDADE:${a.titulo}]]`).join('\n');
    const artMarkers = items.artifacts.map(a => `[[ARQUIVO:${a.metadata?.titulo || 'Documento'}]]`).join('\n');

    resposta = `Pronto! Criei **${totalItems} ${totalItems === 1 ? 'item' : 'itens'}** sobre **${temaLimpo}**${turmaStr}!

${actMarkers}
${artMarkers}

Se quiser, posso criar mais atividades ou adaptar essas para outra turma. O que prefere?`.trim();
  }

  contextManager.finalizarSessao();

  console.log(`✅ [FinalResponse v2.1] Resposta final montada: "${resposta.substring(0, 120)}..."`);

  return {
    resposta,
    resumo: buildResumo(contexto),
    collectedItems,
    sucesso: true,
  };
}

function buildResumo(contexto: ContextoMacro) {
  return {
    inputOriginal: contexto.inputOriginal.texto,
    objetivoGeral: contexto.objetivoGeral || '',
    etapasCompletas: contexto.resumoProgressivo.etapasCompletas,
    totalEtapas: contexto.resumoProgressivo.totalEtapas,
    atividadesCriadas: contexto.resumoProgressivo.atividadesCriadas,
    principaisResultados: [
      ...contexto.resumoProgressivo.principaisDescobertas,
      ...contexto.resumoProgressivo.principaisDecisoes,
    ],
  };
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
  _dadosAdicionais?: Record<string, any>
): Promise<string> {
  const totalAtividades = atividadesCriadas.length;

  if (totalAtividades === 0) {
    return 'Processo concluído com sucesso! Suas atividades estão prontas.';
  }

  const contextoSimplificado = `
PEDIDO ORIGINAL: "${inputOriginal}"
ATIVIDADES CRIADAS: ${atividadesCriadas.join(', ')}
TOTAL DE ATIVIDADES: ${atividadesCriadas.length}
`.trim();

  const prompt = FINAL_RESPONSE_PROMPT
    .replace('{full_context}', contextoSimplificado)
    .replace('{created_items}', `ATIVIDADES CRIADAS: ${atividadesCriadas.join(', ') || 'Nenhuma'}`);

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (status) => console.log(`📝 [QuickFinalResponse] ${status}`),
      systemPrompt: FINAL_RESPONSE_SYSTEM_PROMPT,
    });

    if (result.success && result.data) {
      const rawResponse = result.data.trim();

      if (containsRawJson(rawResponse)) {
        console.warn('⚠️ [QuickFinalResponse] Resposta contém JSON, sanitizando...');
        const sanitized = sanitizeAiOutput(rawResponse, {
          etapaTitulo: 'Resposta Final',
          expectedType: 'narrative',
        });
        return sanitized.sanitized;
      }

      return rawResponse;
    }
  } catch (error) {
    console.error('⚠️ [QuickFinalResponse] Erro:', error);
  }

  if (atividadesCriadas.length > 0) {
    return `Pronto! Criei ${atividadesCriadas.length} atividade(s): ${atividadesCriadas.slice(0, 3).join(', ')}. Tudo pronto para uso!`;
  }

  return 'Processo concluído com sucesso! Suas atividades estão prontas.';
}

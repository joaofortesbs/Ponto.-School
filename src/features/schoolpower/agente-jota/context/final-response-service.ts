/**
 * FINAL RESPONSE SERVICE v2.0 — Hybrid Deterministic + AI
 * 
 * Architecture:
 * 1. CODE builds the structure (phases, markers) — DETERMINISTIC, never fails
 * 2. AI generates ONLY strategic paragraphs per phase — creative, high-value
 * 3. Combined output = reliable structure + rich pedagogical insights
 * 
 * This solves the inconsistency where smaller LLMs (Groq/Gemini Flash)
 * sometimes failed to follow the ~200-line prompt correctly.
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
    title: 'Complementos',
    description: 'Material de apoio para o professor',
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

function buildCleanContext(
  contexto: ContextoMacro,
  items: CollectedItemsInput,
  phases: PhaseGroup[],
): string {
  const temaLimpo = contexto.resumoProgressivo?.dadosRelevantes?.tema_limpo
    || contexto.resumoProgressivo?.dadosRelevantes?.temas_extraidos
    || '';
  const disciplina = contexto.resumoProgressivo?.dadosRelevantes?.disciplina_extraida || '';
  const turma = contexto.resumoProgressivo?.dadosRelevantes?.turma_extraida || '';

  const fasesSummary = phases.map(p => {
    const actTitles = p.activities.map(a => `"${a.titulo}"`).join(', ');
    const artTitles = p.artifacts.map(a => `"${a.metadata?.titulo || 'Documento'}"`).join(', ');
    const allItems = [actTitles, artTitles].filter(Boolean).join(', ');
    return `- ${p.phaseTitle}: ${allItems}`;
  }).join('\n');

  return `
PEDIDO DO PROFESSOR: "${contexto.inputOriginal.texto}"
TEMA: ${temaLimpo || 'Extrair do pedido acima'}
DISCIPLINA: ${disciplina || 'Não especificada'}
TURMA/SÉRIE: ${turma || 'Não especificada'}
TOTAL DE ATIVIDADES: ${items.activities.length}
TOTAL DE DOCUMENTOS: ${items.artifacts.length}

ORGANIZAÇÃO POR FASE:
${fasesSummary}
`.trim();
}

const HYBRID_SYSTEM_PROMPT = `Você é o Jota, assistente pedagógico do Ponto School. Você é um consultor pedagógico experiente que orienta professores com insights práticos e estratégicos.

Sua linguagem é direta, acolhedora e profissional. Use "Prof." quando apropriado. Use **negrito** em temas, quantidades e dados importantes. Use *itálico* em termos pedagógicos (BNCC, metodologias ativas).`;

function buildHybridUserPrompt(
  cleanContext: string,
  phases: PhaseGroup[],
  totalActivities: number,
  totalArtifacts: number,
): string {
  const phasesDescription = phases.map(p => {
    const actNames = p.activities.map(a => `"${a.titulo}" (${a.tipo})`).join(', ');
    const artNames = p.artifacts.map(a => `"${a.metadata?.titulo || 'Documento'}"`).join(', ');
    const items = [actNames, artNames].filter(Boolean).join(', ');
    return `FASE "${p.phaseTitle}": ${items}`;
  }).join('\n');

  const totalItems = totalActivities + totalArtifacts;

  if (totalItems <= 2) {
    return `
${cleanContext}

TAREFA: Gere um JSON com esta estrutura exata:
{
  "abertura": "1-2 frases resumindo o que foi criado. Mencione quantidade, tema e turma/série com **negrito**.",
  "encerramento": "3-5 frases com opinião sobre o roteiro criado, sugira PRÓXIMOS PASSOS concretos que o professor pode pedir, feche com pergunta engajadora. Opcionalmente inclua uma linha com > 💡 e uma dica pedagógica prática."
}

REGRAS:
- Abertura: mencione dados concretos (quantidade, tema, turma)
- Encerramento: sugira próximos passos específicos ao tema
- Use **negrito** em temas, quantidades e dados importantes
- Use *itálico* em termos pedagógicos
- NUNCA repita nomes de atividades (os cards já mostram isso)
- Seja específico ao tema, NUNCA genérico
`.trim();
  }

  const phaseKeys = phases.map(p => `"${p.phaseKey}"`).join(', ');

  return `
${cleanContext}

FASES ORGANIZADAS:
${phasesDescription}

TAREFA: Gere um JSON com esta estrutura exata:
{
  "abertura": "1-2 frases resumindo o que foi criado. Mencione quantidade, tema e turma/série com **negrito**. Ex: Pronto! Organizei **7 atividades completas** sobre **tema** para a turma **X**...",
  "fases": {
    ${phases.map(p => `"${p.phaseKey}": "Parágrafo estratégico de 2-4 frases com insights pedagógicos RICOS e ESPECÍFICOS ao tema. Explique POR QUE essas atividades foram escolhidas, COMO aplicar na prática (tempo, individual vs grupo), QUANDO usar (momento da aula/sequência), e DICAS contextuais. NUNCA repita nomes das atividades — os cards já mostram. NUNCA use frases genéricas que servem pra qualquer tema."`).join(',\n    ')}
  },
  "encerramento": "3-5 frases com opinião sobre o roteiro criado, sugira PRÓXIMOS PASSOS concretos que o professor pode pedir (ex: avaliação diagnóstica, adaptação para outra turma), feche com pergunta engajadora. Opcionalmente inclua uma linha com > 💡 e uma dica pedagógica prática."
}

REGRAS PARA OS PARÁGRAFOS DE FASE:
- Cada parágrafo deve ter 2-4 frases (NUNCA 1 frase curta)
- Deve conter pelo menos 2 destes elementos: POR QUE, COMO aplicar, QUANDO usar, DICAS específicas ao tema, CONEXÕES entre atividades
- NUNCA repita nomes/tipos das atividades — os cards visuais já mostram isso
- NUNCA use frases genéricas como "Comece por aqui" ou "Atividades para praticar" — essas não têm valor
- Seja ESPECÍFICO ao tema e turma do professor
- Use **negrito** e *itálico* para destaque

EXEMPLO de parágrafo BOM para fase "Prática":
"Prof., essas atividades funcionam melhor a partir da **segunda aula**, quando os conceitos iniciais já foram apresentados. Recomendo alternar entre exercícios individuais e em dupla — a troca entre pares ajuda na fixação e cobre lacunas que a explicação sozinha não resolve. Use os **últimos 10 minutos** da aula para revisão rápida, reforçando a memorização sem monotonia."

EXEMPLO de parágrafo RUIM (NÃO faça):
"Criei uma lista de exercícios para praticar o conteúdo." (genérico, sem valor, repete nome da atividade)

RETORNE APENAS O JSON, sem markdown code blocks.
`.trim();
}

function parseAiResponse(rawResponse: string): {
  abertura: string;
  fases: Record<string, string>;
  encerramento: string;
} | null {
  try {
    let cleaned = rawResponse.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed.abertura === 'string' && typeof parsed.encerramento === 'string') {
      return {
        abertura: parsed.abertura,
        fases: parsed.fases || {},
        encerramento: parsed.encerramento,
      };
    }
  } catch {
    try {
      const aberturaMatch = rawResponse.match(/"abertura"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const encerramentoMatch = rawResponse.match(/"encerramento"\s*:\s*"((?:[^"\\]|\\.)*)"/);

      if (aberturaMatch && encerramentoMatch) {
        const fases: Record<string, string> = {};
        const faseRegex = /"(engajamento|conteudo|pratica|avaliacao|complementos)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
        let match;
        while ((match = faseRegex.exec(rawResponse)) !== null) {
          fases[match[1]] = match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }

        return {
          abertura: aberturaMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
          fases,
          encerramento: encerramentoMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
        };
      }
    } catch {
      // fallback below
    }
  }

  return null;
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
        fases[phase.phaseKey] = `${count > 1 ? 'Esses materiais reúnem orientações práticas' : 'Este material reúne orientações práticas'} de aplicação sobre **${temaLimpo}**, incluindo sugestões de adaptação para turmas com diferentes níveis de domínio no conteúdo.`;
        break;
    }
  }

  const encerramento = `Prof., esse roteiro cobre desde a **introdução** até a **avaliação** sobre **${temaLimpo}**, o que significa que você pode usar essas atividades ao longo de várias aulas sem precisar montar nada do zero. Se quiser, posso criar uma **avaliação diagnóstica** para aplicar antes de começar, ou adaptar esse roteiro para outra turma com um perfil diferente. O que prefere?

> 💡 Dica: aplique as atividades de fixação na aula seguinte à introdução como *revisão ativa* — os alunos absorvem melhor quando praticam logo após o primeiro contato com o conteúdo.`;

  return { abertura, fases, encerramento };
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
  console.log(`🏁 [FinalResponse v2.0] Gerando resposta final híbrida para sessão: ${sessionId}`);

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
  const cleanContext = buildCleanContext(contexto, items, phases);

  console.log(`📊 [FinalResponse v2.0] ${totalActivities} atividades, ${totalArtifacts} documentos, ${phases.length} fases, usePhases=${usePhases}`);
  if (usePhases) {
    phases.forEach(p => {
      console.log(`  📁 Fase "${p.phaseKey}": ${p.activities.length} atividades, ${p.artifacts.length} documentos`);
    });
  }

  const userPrompt = buildHybridUserPrompt(cleanContext, phases, totalActivities, totalArtifacts);

  let aiParagraphs: { abertura: string; fases: Record<string, string>; encerramento: string } | null = null;

  try {
    const result = await executeWithCascadeFallback(userPrompt, {
      onProgress: (status) => console.log(`📝 [FinalResponse v2.0] ${status}`),
      systemPrompt: HYBRID_SYSTEM_PROMPT,
    });

    if (result.success && result.data) {
      aiParagraphs = parseAiResponse(result.data);
      if (aiParagraphs) {
        console.log(`✅ [FinalResponse v2.0] IA gerou parágrafos com sucesso`);
      } else {
        console.warn(`⚠️ [FinalResponse v2.0] IA não retornou JSON válido, tentando extrair texto narrativo...`);
        aiParagraphs = tryExtractNarrativeFromRawResponse(result.data, phases, items, contexto);
      }
    }
  } catch (error) {
    console.error('⚠️ [FinalResponse v2.0] Erro na chamada de IA, usando fallback determinístico:', error);
  }

  if (!aiParagraphs) {
    console.log(`🔄 [FinalResponse v2.0] Usando parágrafos fallback determinísticos`);
    aiParagraphs = generateFallbackParagraphs(phases, contexto, totalActivities, totalArtifacts);
  }

  let resposta: string;

  if (usePhases) {
    resposta = buildDeterministicStructure(phases, aiParagraphs.fases, aiParagraphs.abertura, aiParagraphs.encerramento);
  } else {
    const lines: string[] = [];
    lines.push(aiParagraphs.abertura);
    lines.push('');

    for (const activity of items.activities) {
      lines.push(`[[ATIVIDADE:${activity.titulo}]]`);
    }
    for (const artifact of items.artifacts) {
      lines.push(`[[ARQUIVO:${artifact.metadata?.titulo || 'Documento'}]]`);
    }
    lines.push('');
    lines.push(aiParagraphs.encerramento);
    resposta = lines.join('\n').trim();
  }

  contextManager.finalizarSessao();

  console.log(`✅ [FinalResponse v2.0] Resposta final montada: "${resposta.substring(0, 120)}..."`);

  return {
    resposta,
    resumo: buildResumo(contexto),
    collectedItems,
    sucesso: true,
  };
}

function tryExtractNarrativeFromRawResponse(
  rawResponse: string,
  phases: PhaseGroup[],
  items: CollectedItemsInput,
  contexto: ContextoMacro,
): { abertura: string; fases: Record<string, string>; encerramento: string } | null {
  const hasMarkers = rawResponse.includes('[[FASE:') || rawResponse.includes('[[ATIVIDADE:');
  if (hasMarkers) {
    return null;
  }

  const cleaned = rawResponse.replace(/```(?:json)?\s*/gi, '').replace(/\s*```/gi, '').trim();

  if (cleaned.length > 100 && !cleaned.startsWith('{')) {
    const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 20);
    if (paragraphs.length >= 2) {
      const abertura = paragraphs[0].trim();
      const encerramento = paragraphs[paragraphs.length - 1].trim();
      const fases: Record<string, string> = {};

      const middleParagraphs = paragraphs.slice(1, -1);
      phases.forEach((phase, i) => {
        if (middleParagraphs[i]) {
          fases[phase.phaseKey] = middleParagraphs[i].trim();
        }
      });

      return { abertura, fases, encerramento };
    }
  }

  return null;
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

  const userPrompt = `
PEDIDO: "${inputOriginal}"
ATIVIDADES CRIADAS: ${atividadesCriadas.join(', ')}
TOTAL: ${totalAtividades}

Gere um JSON:
{
  "abertura": "1-2 frases resumindo o que foi criado com **negrito** nos dados importantes.",
  "encerramento": "2-3 frases com sugestão de próximo passo e pergunta engajadora."
}

RETORNE APENAS O JSON.
`.trim();

  try {
    const result = await executeWithCascadeFallback(userPrompt, {
      onProgress: (status) => console.log(`📝 [QuickFinalResponse] ${status}`),
      systemPrompt: HYBRID_SYSTEM_PROMPT,
    });

    if (result.success && result.data) {
      const parsed = parseAiResponse(result.data);
      if (parsed) {
        const lines: string[] = [];
        lines.push(parsed.abertura);
        lines.push('');
        lines.push('[[ATIVIDADES]]');
        lines.push('');
        lines.push(parsed.encerramento);
        return lines.join('\n').trim();
      }
    }
  } catch (error) {
    console.error('⚠️ [QuickFinalResponse] Erro:', error);
  }

  return `Pronto! Criei **${totalAtividades} atividade(s)**: ${atividadesCriadas.slice(0, 3).join(', ')}. Tudo pronto para uso!\n\n[[ATIVIDADES]]\n\nSe quiser, posso criar mais atividades ou adaptar essas para outra turma. O que prefere?`;
}

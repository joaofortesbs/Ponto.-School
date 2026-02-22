/**
 * LLM ORCHESTRATOR - LOCAL FALLBACK
 * 
 * Gerador de conteúdo local inteligente que NUNCA FALHA.
 * Produz conteúdo de qualidade para cada tipo de atividade.
 * 
 * Este é o último nível da cascata - quando todas as APIs
 * falham, este sistema garante que o usuário receba algo útil.
 * 
 * @version 3.0.0
 */

import type { ActivityType, GenerateContentResult } from './types';
import { detectActivityType } from './router';

// ============================================================================
// MAIN FALLBACK GENERATOR
// ============================================================================

export function generateLocalFallback(
  prompt: string,
  activityType?: ActivityType
): GenerateContentResult {
  const startTime = Date.now();

  if (isDecisionPrompt(prompt)) {
    console.log(`🏠 [LocalFallback] Detectado prompt de DECISÃO — gerando JSON de seleção`);
    const content = generateDecisionFallback(prompt);
    const latencyMs = Date.now() - startTime;
    console.log(`✅ [LocalFallback] Decisão local gerada em ${latencyMs}ms (${content.length} chars)`);
    return {
      success: true,
      data: content,
      model: 'local-fallback-decision',
      provider: 'local',
      tier: 'fallback',
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors: [],
    };
  }

  const type = activityType || detectActivityType(prompt);
  
  console.log(`🏠 [LocalFallback] Gerando conteúdo local para: ${type}`);
  
  const contextInfo = extractContextFromPrompt(prompt);
  let content: string;

  switch (type) {
    case 'lista-exercicios':
      content = generateListaExercicios(contextInfo);
      break;
    case 'quiz-interativo':
      content = generateQuizInterativo(contextInfo);
      break;
    case 'flash-cards':
      content = generateFlashCards(contextInfo);
      break;
    case 'plano-aula':
      content = generatePlanoAula(contextInfo);
      break;
    case 'sequencia-didatica':
      content = generateSequenciaDidatica(contextInfo);
      break;
    case 'quadro-interativo':
      content = generateQuadroInterativo(contextInfo);
      break;
    case 'tese-redacao':
      content = generateTeseRedacao(contextInfo);
      break;
    case 'avaliacao-diagnostica':
      content = generateAvaliacaoDiagnostica(contextInfo);
      break;
    default:
      content = generateGenericResponse(contextInfo);
  }

  const latencyMs = Date.now() - startTime;
  console.log(`✅ [LocalFallback] Gerado em ${latencyMs}ms (${content.length} chars)`);

  return {
    success: true,
    data: content,
    model: 'local-fallback',
    provider: 'local',
    tier: 'fallback',
    latencyMs,
    cached: false,
    attemptsMade: 1,
    errors: [],
  };
}

// ============================================================================
// CONTEXT EXTRACTION
// ============================================================================

interface ContextInfo {
  tema: string;
  disciplina: string;
  serie: string;
  quantidade: number;
  duracao: string;
}

function extractContextFromPrompt(prompt: string): ContextInfo {
  let tema = 'Conteúdo Educacional';
  const temaPatterns = [
    /tema[:\s]+["']?([^"\n,]+)["']?/i,
    /sobre\s+["']?([^"\n,]+?)["']?(?:\s+para|\s+de|\s+em|\s*$)/i,
    /assunto[:\s]+["']?([^"\n,]+)["']?/i,
  ];
  for (const pattern of temaPatterns) {
    const match = prompt.match(pattern);
    if (match?.[1] && match[1].length > 3) {
      tema = match[1].trim();
      break;
    }
  }

  let disciplina = 'Multidisciplinar';
  const disciplinaMap: [RegExp, string][] = [
    [/matem[aá]tica/i, 'Matemática'],
    [/portugu[eê]s|l[ií]ngua portuguesa/i, 'Língua Portuguesa'],
    [/ci[eê]ncias/i, 'Ciências'],
    [/hist[oó]ria/i, 'História'],
    [/geografia/i, 'Geografia'],
    [/f[ií]sica/i, 'Física'],
    [/qu[ií]mica/i, 'Química'],
    [/biologia/i, 'Biologia'],
    [/ingl[eê]s/i, 'Inglês'],
    [/artes/i, 'Artes'],
  ];
  for (const [pattern, name] of disciplinaMap) {
    if (pattern.test(prompt)) {
      disciplina = name;
      break;
    }
  }

  let serie = 'Ensino Fundamental';
  const serieMatch = prompt.match(/(\d+)[ºª°]\s*ano/i);
  if (serieMatch) {
    serie = `${serieMatch[1]}º ano`;
  } else if (/ensino\s+m[eé]dio/i.test(prompt)) {
    serie = 'Ensino Médio';
  }

  let quantidade = 5;
  const qtdMatch = prompt.match(/(\d+)\s*(quest[oõ]es|exerc[ií]cios|perguntas|cards|itens)/i);
  if (qtdMatch) {
    quantidade = Math.min(parseInt(qtdMatch[1]), 20);
  }

  let duracao = '50 minutos';
  const duracaoMatch = prompt.match(/dura[çc][aã]o[:\s]+["']?([^"\n,]+)["']?/i);
  if (duracaoMatch?.[1]) {
    duracao = duracaoMatch[1].trim();
  }

  return { tema, disciplina, serie, quantidade, duracao };
}

// ============================================================================
// GENERATORS BY ACTIVITY TYPE
// ============================================================================

function generateListaExercicios(ctx: ContextInfo): string {
  const questoes = [];
  for (let i = 1; i <= ctx.quantidade; i++) {
    const isMultiplaEscolha = i % 3 !== 0;
    const dificuldade = i <= 2 ? 'facil' : i <= 4 ? 'medio' : 'dificil';
    
    questoes.push({
      id: `questao-${i}`,
      type: isMultiplaEscolha ? 'multipla-escolha' : 'discursiva',
      enunciado: `Considerando os conceitos fundamentais de ${ctx.tema} estudados em ${ctx.disciplina} para alunos do ${ctx.serie}, responda à seguinte questão: Qual é a importância e aplicação prática do conceito ${i} relacionado a ${ctx.tema}?`,
      alternativas: isMultiplaEscolha ? [
        `A aplicação de ${ctx.tema} é fundamental para o desenvolvimento de habilidades em ${ctx.disciplina}`,
        `O conceito de ${ctx.tema} não possui aplicação prática no contexto educacional`,
        `${ctx.tema} é um tema secundário que não requer aprofundamento`,
        `O estudo de ${ctx.tema} é relevante apenas para níveis avançados de ensino`
      ] : undefined,
      respostaCorreta: isMultiplaEscolha ? 0 : `O aluno deve elaborar uma resposta que demonstre compreensão do conceito ${i} de ${ctx.tema}, incluindo exemplos práticos e sua aplicação no contexto de ${ctx.disciplina}.`,
      explicacao: isMultiplaEscolha 
        ? `A primeira alternativa está correta porque ${ctx.tema} é um conceito fundamental em ${ctx.disciplina} que desenvolve habilidades essenciais para os alunos do ${ctx.serie}.`
        : `Esta questão visa avaliar a capacidade do aluno de articular conhecimentos sobre ${ctx.tema} de forma autônoma.`,
      dificuldade: dificuldade,
      tema: ctx.tema
    });
  }

  return JSON.stringify({
    titulo: `Lista de Exercícios - ${ctx.tema}`,
    disciplina: ctx.disciplina,
    tema: ctx.tema,
    questoes,
    totalQuestoes: ctx.quantidade,
  }, null, 2);
}

function generateQuizInterativo(ctx: ContextInfo): string {
  const perguntas = [];
  for (let i = 1; i <= ctx.quantidade; i++) {
    perguntas.push({
      id: i,
      pergunta: `Pergunta ${i}: Qual é o conceito principal relacionado a ${ctx.tema} em ${ctx.disciplina}?`,
      opcoes: [
        `Opção A sobre ${ctx.tema}`,
        `Opção B com conceito de ${ctx.disciplina}`,
        `Opção C com aplicação prática`,
        `Opção D com definição complementar`,
      ],
      respostaCorreta: 0,
      explicacao: `A resposta correta é a opção A porque explica corretamente o conceito de ${ctx.tema}.`,
      pontos: 10,
    });
  }

  return JSON.stringify({
    titulo: `Quiz Interativo - ${ctx.tema}`,
    disciplina: ctx.disciplina,
    serie: ctx.serie,
    perguntas,
    tempoLimite: 300,
    pontuacaoMaxima: ctx.quantidade * 10,
  }, null, 2);
}

function generateFlashCards(ctx: ContextInfo): string {
  const cards = [];
  for (let i = 1; i <= ctx.quantidade; i++) {
    cards.push({
      id: i,
      frente: `Conceito ${i} de ${ctx.tema}`,
      verso: `Definição completa do conceito ${i}: Este é um conceito fundamental de ${ctx.disciplina} que se relaciona diretamente com ${ctx.tema} e é aplicado no contexto do ${ctx.serie}.`,
      categoria: ctx.disciplina,
      dificuldade: i <= 2 ? 'fácil' : i <= 4 ? 'médio' : 'difícil',
    });
  }

  return JSON.stringify({
    titulo: `Flash Cards - ${ctx.tema}`,
    disciplina: ctx.disciplina,
    serie: ctx.serie,
    cards,
    totalCards: ctx.quantidade,
  }, null, 2);
}

function generatePlanoAula(ctx: ContextInfo): string {
  return `# Plano de Aula: ${ctx.tema}

**Disciplina:** ${ctx.disciplina} | **Série:** ${ctx.serie} | **Duração:** ${ctx.duracao}

---

## Objetivo Geral
Proporcionar aos alunos uma compreensão abrangente sobre ${ctx.tema}, desenvolvendo habilidades de análise crítica e aplicação prática dos conceitos.

## Objetivos Específicos
• Compreender os conceitos fundamentais de ${ctx.tema}
• Analisar diferentes perspectivas sobre o tema
• Aplicar conhecimentos em situações práticas
• Desenvolver habilidades de trabalho colaborativo

## Metodologia
• Exposição dialogada com recursos visuais
• Atividades em grupo para discussão
• Exercícios práticos de aplicação
• Avaliação formativa contínua

## Recursos
• Quadro branco e marcadores
• Projetor multimídia
• Material impresso com atividades
• Recursos digitais interativos

## Desenvolvimento

### 1. Introdução (10 min)
- Acolhimento e contextualização
- Levantamento de conhecimentos prévios
- Apresentação dos objetivos da aula

### 2. Desenvolvimento (30 min)
- Exposição do conteúdo principal sobre ${ctx.tema}
- Exemplos práticos e aplicações
- Atividade em grupo para fixação

### 3. Conclusão (10 min)
- Síntese dos principais conceitos
- Esclarecimento de dúvidas
- Orientações para estudo complementar

## Avaliação
Observação da participação, exercícios práticos e autoavaliação dos alunos.

## Referências
Material didático de ${ctx.disciplina} para ${ctx.serie}.`;
}

function generateSequenciaDidatica(ctx: ContextInfo): string {
  return `# Sequência Didática: ${ctx.tema}

**Disciplina:** ${ctx.disciplina} | **Série:** ${ctx.serie} | **Duração Total:** 4 aulas

---

## Tema Central
${ctx.tema}

## Justificativa
Esta sequência didática visa desenvolver competências essenciais relacionadas a ${ctx.tema} no contexto de ${ctx.disciplina}.

## Objetivos de Aprendizagem
1. Compreender conceitos fundamentais de ${ctx.tema}
2. Desenvolver habilidades de análise e síntese
3. Aplicar conhecimentos em situações práticas
4. Trabalhar colaborativamente em projetos

---

## AULA 1: Introdução e Contextualização
**Objetivos:** Apresentar o tema e levantar conhecimentos prévios
**Atividades:**
- Roda de conversa sobre ${ctx.tema}
- Registro das ideias iniciais
- Apresentação do projeto

## AULA 2: Aprofundamento
**Objetivos:** Desenvolver conceitos e habilidades específicas
**Atividades:**
- Estudo dirigido sobre ${ctx.tema}
- Exercícios práticos
- Discussão em grupos

## AULA 3: Aplicação
**Objetivos:** Aplicar conhecimentos em situações concretas
**Atividades:**
- Projeto prático relacionado a ${ctx.tema}
- Trabalho em equipe
- Apresentação dos resultados parciais

## AULA 4: Síntese e Avaliação
**Objetivos:** Consolidar aprendizagens e avaliar resultados
**Atividades:**
- Apresentação dos projetos finais
- Avaliação formativa
- Autoavaliação e feedback

---

## Avaliação
Avaliação processual considerando participação, desenvolvimento das atividades e produto final.

## Recursos Necessários
• Materiais didáticos de ${ctx.disciplina}
• Recursos multimídia
• Materiais para atividades práticas`;
}

function generateQuadroInterativo(ctx: ContextInfo): string {
  return JSON.stringify({
    titulo: `Quadro Interativo - ${ctx.tema}`,
    tipo: 'mapa-conceitual',
    noCentral: {
      texto: ctx.tema,
      cor: '#FF6B35',
    },
    ramificacoes: [
      {
        id: 1,
        texto: `Conceito 1 de ${ctx.tema}`,
        conexoes: ['1.1', '1.2'],
        cor: '#4ECDC4',
      },
      {
        id: 2,
        texto: `Conceito 2 de ${ctx.tema}`,
        conexoes: ['2.1', '2.2'],
        cor: '#45B7D1',
      },
      {
        id: 3,
        texto: `Aplicação prática em ${ctx.disciplina}`,
        conexoes: ['3.1'],
        cor: '#96CEB4',
      },
    ],
    disciplina: ctx.disciplina,
    serie: ctx.serie,
  }, null, 2);
}

function generateTeseRedacao(ctx: ContextInfo): string {
  return `# Proposta de Redação: ${ctx.tema}

**Disciplina:** ${ctx.disciplina} | **Série:** ${ctx.serie}

---

## Tema
"${ctx.tema}: Desafios e Perspectivas na Sociedade Contemporânea"

## Proposta
Produza um texto dissertativo-argumentativo sobre ${ctx.tema}, considerando os aspectos sociais, culturais e/ou científicos do tema.

## Textos Motivadores

### Texto I
${ctx.tema} é um assunto relevante que impacta diversos aspectos da sociedade moderna. Compreender suas dimensões é fundamental para o desenvolvimento crítico dos cidadãos.

### Texto II
Especialistas apontam que ${ctx.tema} apresenta múltiplas perspectivas que devem ser consideradas em uma análise completa do fenômeno.

---

## Instruções
1. O texto deve ter entre 20 e 30 linhas
2. Apresente uma tese clara sobre o tema
3. Desenvolva argumentos consistentes
4. Apresente proposta de intervenção (se aplicável)
5. Respeite a norma culta da língua portuguesa

## Critérios de Avaliação
• Compreensão do tema (200 pontos)
• Domínio do gênero dissertativo-argumentativo (200 pontos)
• Seleção e organização de argumentos (200 pontos)
• Demonstração de conhecimento linguístico (200 pontos)
• Proposta de intervenção (200 pontos)`;
}

function generateAvaliacaoDiagnostica(ctx: ContextInfo): string {
  const questoes = [];
  for (let i = 1; i <= Math.min(ctx.quantidade, 10); i++) {
    questoes.push({
      numero: i,
      habilidade: `Habilidade ${i} de ${ctx.disciplina}`,
      enunciado: `Questão ${i}: Avalie seu conhecimento sobre ${ctx.tema}.`,
      alternativas: [
        { letra: 'A', texto: `[Fallback] Primeira opção sobre ${ctx.tema} - regenere para conteúdo da IA` },
        { letra: 'B', texto: `[Fallback] Segunda opção sobre ${ctx.disciplina} - clique em regenerar` },
        { letra: 'C', texto: `[Fallback] Terceira opção com aplicação prática - aguardando regeneração` },
        { letra: 'D', texto: `[Fallback] Quarta opção complementar - regenere se persistir` },
      ],
      respostaCorreta: 'A',
      nivelCognitivo: i <= 3 ? 'conhecimento' : i <= 6 ? 'compreensão' : 'aplicação',
    });
  }

  return JSON.stringify({
    titulo: `Avaliação Diagnóstica - ${ctx.tema}`,
    disciplina: ctx.disciplina,
    serie: ctx.serie,
    objetivo: `Diagnosticar o nível de conhecimento dos alunos sobre ${ctx.tema}`,
    questoes,
    criteriosAnalise: {
      excelente: { min: 80, max: 100, descricao: 'Domínio completo do conteúdo' },
      bom: { min: 60, max: 79, descricao: 'Bom entendimento com pontos a desenvolver' },
      regular: { min: 40, max: 59, descricao: 'Conhecimento básico, necessita reforço' },
      insuficiente: { min: 0, max: 39, descricao: 'Necessita intervenção pedagógica' },
    },
  }, null, 2);
}

function generateGenericResponse(ctx: ContextInfo): string {
  return `# Conteúdo Educacional: ${ctx.tema}

**Disciplina:** ${ctx.disciplina} | **Série:** ${ctx.serie}

---

## Introdução
Este material aborda ${ctx.tema} no contexto de ${ctx.disciplina}, oferecendo uma visão geral do assunto para estudantes do ${ctx.serie}.

## Conceitos Principais
1. **Conceito Fundamental:** Definição básica de ${ctx.tema}
2. **Aplicações:** Como ${ctx.tema} se aplica no dia a dia
3. **Relações:** Conexões com outros conteúdos de ${ctx.disciplina}

## Atividades Sugeridas
• Pesquisa sobre ${ctx.tema}
• Discussão em grupo
• Exercícios práticos
• Projeto de aplicação

## Recursos Adicionais
• Material didático complementar
• Vídeos educativos
• Sites especializados

---

*Material gerado pelo Sistema Ponto School*`;
}

function isDecisionPrompt(prompt: string): boolean {
  const decisionIndicators = [
    /selecione.*atividades/i,
    /escolha.*atividades/i,
    /decidir.*atividades/i,
    /quais.*atividades.*criar/i,
    /retorne.*json.*atividades_selecionadas/i,
    /atividades_selecionadas/i,
    /atividades_escolhidas/i,
    /catalogo.*atividades.*dispon[ií]veis/i,
    /"id":\s*"[^"]*",\s*"titulo"/,
    /selecionar.*do.*cat[aá]logo/i,
    /estrat[eé]gia_pedag[oó]gica/i,
    /justificativa.*pedag[oó]gica/i,
  ];

  return decisionIndicators.some(pattern => pattern.test(prompt));
}

interface CatalogEntry {
  id: string;
  titulo: string;
  tipo?: string;
  materia?: string;
  nivel_dificuldade?: string;
  tags?: string[];
  pipeline?: string;
  template?: string;
  campos_obrigatorios?: string[];
  campos_opcionais?: string[];
  schema_campos?: Record<string, any>;
}

function extractCatalogFromPrompt(prompt: string): CatalogEntry[] {
  // STRATEGY 1: JSON block (```json...```)
  const jsonBlockMatch = prompt.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1]);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed.atividades && Array.isArray(parsed.atividades) && parsed.atividades.length > 0) return parsed.atividades;
    } catch {}
  }

  // STRATEGY 2: Inline JSON objects with "id": "..." pattern
  const entries: CatalogEntry[] = [];
  const idTitlePattern = /"id"\s*:\s*"([^"]+)"[\s\S]*?"titulo"\s*:\s*"([^"]+)"/g;
  let match;
  while ((match = idTitlePattern.exec(prompt)) !== null) {
    const entryBlock = prompt.substring(Math.max(0, match.index - 20), prompt.indexOf('}', match.index + match[0].length) + 1);
    const tipoMatch = entryBlock.match(/"tipo"\s*:\s*"([^"]+)"/);
    const materiaMatch = entryBlock.match(/"materia"\s*:\s*"([^"]+)"/);
    const nivelMatch = entryBlock.match(/"nivel_dificuldade"\s*:\s*"([^"]+)"/);
    const pipelineMatch = entryBlock.match(/"pipeline"\s*:\s*"([^"]+)"/);
    const templateMatch = entryBlock.match(/"template"\s*:\s*"([^"]+)"/);
    entries.push({
      id: match[1],
      titulo: match[2],
      tipo: tipoMatch?.[1],
      materia: materiaMatch?.[1],
      nivel_dificuldade: nivelMatch?.[1],
      pipeline: pipelineMatch?.[1],
      template: templateMatch?.[1],
    });
  }
  if (entries.length > 0) return entries;

  // STRATEGY 3: Plain text format — "- id: titulo (tipo: X, categoria: Y)"
  // This is the format used in the DECIDIR prompt catalog listing
  const plainTextEntries: CatalogEntry[] = [];
  const plainTextPattern = /^[-•]\s+([a-z0-9-]+):\s+(.+?)(?:\s+\(tipo:\s*([^,)]+)(?:,\s*categoria:\s*([^)]+))?\))?$/gm;
  let ptMatch;
  while ((ptMatch = plainTextPattern.exec(prompt)) !== null) {
    const id = ptMatch[1].trim();
    const titulo = ptMatch[2].trim();
    const tipo = ptMatch[3]?.trim();
    if (id && titulo && id.length > 2 && id.length < 60) {
      plainTextEntries.push({ id, titulo, tipo });
    }
  }
  if (plainTextEntries.length > 0) {
    console.log(`🔍 [LocalFallback] Catálogo extraído via plain text: ${plainTextEntries.length} entradas`);
    return plainTextEntries;
  }

  // STRATEGY 4: "IDs VÁLIDOS: id1, id2, id3..." pattern
  const validIdsMatch = prompt.match(/IDs?\s+V[ÁA]LIDOS?[:\s]+([^\n]+)/i);
  if (validIdsMatch) {
    const ids = validIdsMatch[1].split(/[,\s]+/).map(s => s.trim().replace(/[[\]]/g, '')).filter(s => s.length > 2 && s.includes('-'));
    if (ids.length > 0) {
      console.log(`🔍 [LocalFallback] Catálogo extraído via IDs VÁLIDOS: ${ids.length} IDs`);
      return ids.map(id => ({ id, titulo: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }));
    }
  }

  // STRATEGY 5: Emergency hardcoded fallback — known activity IDs from the platform catalog
  // Used only when ALL extraction strategies fail — guarantees at least a minimal valid selection
  console.warn(`⚠️ [LocalFallback] Todas as estratégias de extração de catálogo falharam. Usando seleção de emergência.`);
  return [
    { id: 'plano-aula', titulo: 'Plano de Aula', tipo: 'plano' },
    { id: 'lista-exercicios', titulo: 'Lista de Exercícios', tipo: 'lista' },
    { id: 'quiz-interativo', titulo: 'Quiz Interativo', tipo: 'quiz' },
    { id: 'flash-cards', titulo: 'Flash Cards', tipo: 'flash-cards' },
    { id: 'sequencia-didatica', titulo: 'Sequência Didática', tipo: 'sequencia' },
    { id: 'avaliacao-diagnostica', titulo: 'Avaliação Diagnóstica', tipo: 'avaliacao' },
  ];
}

function extractRequestedQuantity(prompt: string): number {
  const qtyPatterns = [
    /selecione\s+(\d+)/i,
    /escolha\s+(\d+)/i,
    /(\d+)\s+atividades/i,
    /quantidade[:\s]+(\d+)/i,
    /m[aá]ximo[:\s]+(\d+)/i,
  ];
  
  for (const pattern of qtyPatterns) {
    const match = prompt.match(pattern);
    if (match) return Math.min(parseInt(match[1], 10), 10);
  }
  return 3;
}

function scoreActivityForObjective(entry: CatalogEntry, objective: string): number {
  let score = 0;
  const lowerObjective = objective.toLowerCase();
  const tags = entry.tags || [];
  const titulo = (entry.titulo || '').toLowerCase();
  const tipo = (entry.tipo || '').toLowerCase();
  
  const objectiveWords = lowerObjective.split(/\s+/).filter(w => w.length > 3);
  for (const word of objectiveWords) {
    if (titulo.includes(word)) score += 3;
    if (tipo.includes(word)) score += 2;
    if (tags.some(t => t.toLowerCase().includes(word))) score += 1;
  }
  
  const varietyTypes = new Set(['plano-aula', 'lista-exercicios', 'quiz-interativo', 'flash-cards', 'sequencia-didatica', 'avaliacao-diagnostica', 'quadro-interativo']);
  if (varietyTypes.has(tipo)) score += 1;
  
  return score;
}

function generateDecisionFallback(prompt: string): string {
  const catalog = extractCatalogFromPrompt(prompt);
  const requestedQty = extractRequestedQuantity(prompt);
  
  let objectiveMatch = prompt.match(/objetivo[:\s]+["']?([^"'\n]+)/i);
  if (!objectiveMatch) objectiveMatch = prompt.match(/professor.*(?:quer|pediu|deseja)[:\s]*["']?([^"'\n]+)/i);
  const objective = objectiveMatch?.[1] || '';
  
  let selected: CatalogEntry[];
  
  if (catalog.length === 0) {
    console.warn(`⚠️ [LocalFallback-Decision] Catálogo vazio no prompt, gerando seleção genérica`);
    selected = [];
  } else if (catalog.length <= requestedQty) {
    selected = catalog;
  } else {
    const scored = catalog.map(entry => ({
      entry,
      score: scoreActivityForObjective(entry, objective)
    }));
    scored.sort((a, b) => b.score - a.score);
    
    const typeSeen = new Set<string>();
    const diverse: CatalogEntry[] = [];
    
    for (const { entry } of scored) {
      const tipo = entry.tipo || 'unknown';
      if (!typeSeen.has(tipo)) {
        diverse.push(entry);
        typeSeen.add(tipo);
        if (diverse.length >= requestedQty) break;
      }
    }
    
    if (diverse.length < requestedQty) {
      for (const { entry } of scored) {
        if (!diverse.includes(entry)) {
          diverse.push(entry);
          if (diverse.length >= requestedQty) break;
        }
      }
    }
    
    selected = diverse.slice(0, requestedQty);
  }
  
  const result = {
    atividades_escolhidas: selected.map((entry, idx) => ({
      id: entry.id,
      titulo: entry.titulo,
      tipo: entry.tipo || 'atividade',
      materia: entry.materia || 'Multidisciplinar',
      nivel_dificuldade: entry.nivel_dificuldade || 'medio',
      tags: entry.tags || [],
      campos_obrigatorios: entry.campos_obrigatorios || [],
      campos_opcionais: entry.campos_opcionais || [],
      schema_campos: entry.schema_campos || {},
      pipeline: entry.pipeline,
      template: entry.template,
      justificativa: `Atividade selecionada automaticamente (fallback local) — ${entry.titulo} é adequada para o objetivo pedagógico informado.`,
      ordem_sugerida: idx + 1,
    })),
    estrategia_pedagogica: `Seleção automática por relevância (fallback local). ${selected.length} atividades escolhidas do catálogo de ${catalog.length} disponíveis, priorizando diversidade de tipos e relevância ao objetivo.`,
    total_escolhidas: selected.length,
  };
  
  return JSON.stringify(result, null, 2);
}

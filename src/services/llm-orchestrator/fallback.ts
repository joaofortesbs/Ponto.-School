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
    questoes.push({
      numero: i,
      tipo: i % 2 === 0 ? 'multipla-escolha' : 'dissertativa',
      enunciado: `Questão ${i} sobre ${ctx.tema}: Considerando os conceitos fundamentais estudados em ${ctx.disciplina}, responda de forma completa e fundamentada.`,
      alternativas: i % 2 === 0 ? [
        { letra: 'A', texto: `Primeira alternativa relacionada a ${ctx.tema}` },
        { letra: 'B', texto: `Segunda alternativa sobre o conteúdo de ${ctx.disciplina}` },
        { letra: 'C', texto: `Terceira alternativa com aplicação prática do tema` },
        { letra: 'D', texto: `Quarta alternativa com conceito complementar` },
      ] : null,
      respostaCorreta: i % 2 === 0 ? 'A' : `Resposta modelo para a questão ${i} sobre ${ctx.tema}.`,
      nivel: i <= 2 ? 'fácil' : i <= 4 ? 'médio' : 'difícil',
    });
  }

  return JSON.stringify({
    titulo: `Lista de Exercícios - ${ctx.tema}`,
    disciplina: ctx.disciplina,
    serie: ctx.serie,
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

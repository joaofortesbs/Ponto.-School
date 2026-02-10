/**
 * QUALITY PROMPT TEMPLATES - Templates de Qualidade Pedagógica
 * 
 * Sistema de Execution Prompt Templates especializados por tipo de atividade.
 * Inspirado em:
 * - MagicSchool AI: Templates especializados com standards alignment
 * - Eduaide: 100+ resource types com diferenciação automática
 * - ChatGPT O3: Structured outputs + few-shot examples
 * - Anthropic Claude: Exemplos > Regras (few-shot learning)
 * 
 * PRINCÍPIOS:
 * 1. Cada tipo de atividade tem requirements pedagógicos específicos
 * 2. BNCC alignment é obrigatório (não opcional)
 * 3. Progressão de dificuldade (Bloom) é built-in
 * 4. Instruções para o professor são obrigatórias
 * 5. Gabarito/rubrica é obrigatório quando aplicável
 * 6. Few-shot examples garantem qualidade consistente
 */

import { formatBNCCForPrompt, getBNCCHabilidades } from './bncc-reference';

export interface QualityContext {
  tema: string;
  disciplina: string;
  anoSerie: string;
  objetivo?: string;
  solicitacaoOriginal?: string;
  batchIndex?: number;
  batchTotal?: number;
}

const BLOOM_TAXONOMY_PT = `
TAXONOMIA DE BLOOM (USE PARA PROGRESSÃO DE DIFICULDADE):
Nível 1 - LEMBRAR: Reconhecer, listar, identificar, nomear
Nível 2 - COMPREENDER: Explicar, resumir, interpretar, classificar
Nível 3 - APLICAR: Resolver, demonstrar, calcular, usar
Nível 4 - ANALISAR: Comparar, diferenciar, examinar, questionar
Nível 5 - AVALIAR: Julgar, argumentar, justificar, criticar
Nível 6 - CRIAR: Elaborar, projetar, inventar, propor soluções
`;

const QUALITY_STANDARDS = `
PADRÕES DE QUALIDADE OBRIGATÓRIOS:
1. CONTEXTUALIZAÇÃO: Relacione o conteúdo com situações reais do cotidiano dos alunos
2. DIVERSIDADE: Inclua exemplos que representem a diversidade cultural brasileira
3. INTERDISCIPLINARIDADE: Quando possível, conecte com outras áreas do conhecimento
4. LINGUAGEM: Adequada à faixa etária, clara, sem ambiguidades
5. ACESSIBILIDADE: Considere diferentes estilos de aprendizagem (visual, auditivo, cinestésico)
6. ENGAJAMENTO: Use elementos que motivem e despertem curiosidade
`;

const TEACHER_INSTRUCTIONS_BLOCK = `
INSTRUÇÕES PARA O PROFESSOR (OBRIGATÓRIO):
Inclua um campo "instrucoes_professor" com:
- Orientações de aplicação (como usar o material em sala)
- Tempo estimado de execução
- Sugestões de adaptação para alunos com dificuldades
- Possíveis extensões para alunos avançados
- Dicas para avaliação formativa durante a atividade
`;

export function getQualityPromptForQuiz(ctx: QualityContext): string {
  const bnccBlock = formatBNCCForPrompt(ctx.disciplina, ctx.anoSerie);
  const habilidades = getBNCCHabilidades(ctx.disciplina, ctx.anoSerie, 3);
  const bnccCodes = habilidades.map(h => h.codigo).join(', ') || 'Selecione as habilidades adequadas';

  return `
DIRETRIZES DE QUALIDADE PEDAGÓGICA PARA QUIZ
═══════════════════════════════════════════════════════════════

${bnccBlock}

${BLOOM_TAXONOMY_PT}

REGRAS DE QUALIDADE PARA QUESTÕES DE QUIZ:

1. PROGRESSÃO DE DIFICULDADE OBRIGATÓRIA:
   - Primeiras 30% das questões: Nível LEMBRAR/COMPREENDER (fácil)
   - Próximas 40% das questões: Nível APLICAR/ANALISAR (médio)
   - Últimas 30% das questões: Nível AVALIAR/CRIAR (difícil)
   
2. DESIGN DE ALTERNATIVAS (DISTRATORES PEDAGÓGICOS):
   - A alternativa correta deve ser inequivocamente correta
   - Cada distrator deve representar um ERRO CONCEITUAL COMUM que alunos realmente cometem
   - Evite distratores absurdos ou obviamente errados
   - Evite "todas as anteriores" ou "nenhuma das anteriores"
   - Alternativas devem ter comprimento similar

3. FEEDBACK EDUCATIVO OBRIGATÓRIO:
   Para cada questão, o campo "feedback" DEVE conter:
   - POR QUE a alternativa correta está certa (explicação conceitual)
   - POR QUE cada distrator está errado (identificação do erro conceitual)
   - Uma dica de estudo para aprofundamento

4. CONTEXTUALIZAÇÃO:
   - Use situações reais do cotidiano brasileiro
   - Inclua textos-base, imagens descritas, ou cenários quando relevante
   - Questões devem exigir reflexão, não apenas memorização

5. HABILIDADES BNCC:
   Cada questão deve indicar qual habilidade BNCC trabalha:
   Códigos disponíveis: ${bnccCodes}

EXEMPLO DE QUESTÃO BEM ELABORADA (MODELO):
{
  "id": 1,
  "texto": "Uma fábrica produz 450 peças por hora. Se aumentar sua produção em 20%, quantas peças produzirá em 3 horas?",
  "alternativas": [
    "1.620 peças",
    "1.350 peças",
    "540 peças",
    "1.500 peças"
  ],
  "resposta_correta": 0,
  "dificuldade": "medio",
  "habilidade_bncc": "EF07MA12",
  "nivel_bloom": "Aplicar",
  "feedback": "Correto! Primeiro calculamos o aumento: 450 × 0,20 = 90 peças a mais por hora. Nova produção: 450 + 90 = 540 peças/hora. Em 3 horas: 540 × 3 = 1.620 peças. O erro comum na alternativa B (1.350) é esquecer de aplicar o aumento. O erro na alternativa C (540) é calcular apenas 1 hora. O erro na D (1.500) é calcular 20% incorretamente."
}

${TEACHER_INSTRUCTIONS_BLOCK}

${QUALITY_STANDARDS}
`;
}

export function getQualityPromptForExerciseList(ctx: QualityContext): string {
  const bnccBlock = formatBNCCForPrompt(ctx.disciplina, ctx.anoSerie);
  const habilidades = getBNCCHabilidades(ctx.disciplina, ctx.anoSerie, 3);
  const bnccCodes = habilidades.map(h => h.codigo).join(', ') || 'Selecione as habilidades adequadas';

  return `
DIRETRIZES DE QUALIDADE PEDAGÓGICA PARA LISTA DE EXERCÍCIOS
═══════════════════════════════════════════════════════════════

${bnccBlock}

${BLOOM_TAXONOMY_PT}

REGRAS DE QUALIDADE PARA EXERCÍCIOS:

1. PROGRESSÃO DE DIFICULDADE OBRIGATÓRIA:
   - Primeiras questões: FÁCIL (recordar/compreender) para ativar conhecimentos prévios
   - Questões intermediárias: MÉDIO (aplicar/analisar) para consolidar aprendizagem
   - Questões finais: DIFÍCIL (avaliar/criar) para desafiar e aprofundar
   Cada questão deve indicar seu nível no campo "dificuldade": "facil", "medio" ou "dificil"

2. VARIEDADE DE FORMATOS:
   - Inclua questões de diferentes tipos quando o modelo for "Misto":
     * Múltipla escolha com 4 alternativas
     * Verdadeiro/Falso com justificativa
     * Dissertativa com resposta esperada e critérios
   - Mesmo em listas só de múltipla escolha, varie os formatos de enunciado:
     * Situação-problema contextualizada
     * Análise de texto/dado/tabela/gráfico (descrito)
     * Completar lacunas conceituais
     * Associação de colunas

3. GABARITO COMPLETO COM RESOLUÇÃO (OBRIGATÓRIO):
   Cada questão DEVE ter:
   - "respostaCorreta": A resposta certa (índice para MC, texto para dissertativa)
   - "explicacao": Resolução passo a passo detalhada
   - Para dissertativas: critérios de avaliação e resposta modelo

4. CABEÇALHO DA LISTA:
   Inclua campos:
   - "cabecalho": Texto para o topo da lista impressa com nome da escola, disciplina, turma
   - "instrucoes_aluno": Instruções claras para o aluno (tempo, material permitido, formato de resposta)

5. HABILIDADES BNCC:
   Cada questão deve indicar qual habilidade BNCC trabalha:
   Códigos disponíveis: ${bnccCodes}

EXEMPLO DE QUESTÃO BEM ELABORADA (MODELO):
{
  "id": "questao-1",
  "type": "multipla-escolha",
  "enunciado": "Leia o texto a seguir:\\n\\"O Rio Amazonas é o maior rio do mundo em volume de água. Sua bacia hidrográfica abrange cerca de 7 milhões de km².\\"\\nCom base no texto, qual é a principal característica que torna o Rio Amazonas relevante para o equilíbrio ambiental?",
  "alternativas": [
    "Seu volume de água contribui significativamente para o ciclo hidrológico global e a regulação climática",
    "Sua extensão permite a navegação comercial entre todos os países da América do Sul",
    "Sua profundidade torna impossível a construção de pontes, preservando a floresta",
    "Sua temperatura elevada impede a formação de gelo nos polos terrestres"
  ],
  "respostaCorreta": 0,
  "explicacao": "A alternativa A está correta porque o volume de água do Rio Amazonas é fundamental para o ciclo hidrológico, contribuindo com cerca de 20% da água doce que chega aos oceanos. A alternativa B está incorreta pois, embora navegável, o rio não conecta todos os países sul-americanos. A alternativa C apresenta informação falsa. A alternativa D não tem relação causal comprovada.",
  "dificuldade": "medio",
  "habilidade_bncc": "EF06GE11",
  "nivel_bloom": "Analisar",
  "tema": "Bacia Amazônica"
}

${TEACHER_INSTRUCTIONS_BLOCK}

${QUALITY_STANDARDS}
`;
}

export function getQualityPromptForLessonPlan(ctx: QualityContext): string {
  const bnccBlock = formatBNCCForPrompt(ctx.disciplina, ctx.anoSerie);

  return `
DIRETRIZES DE QUALIDADE PEDAGÓGICA PARA PLANO DE AULA
═══════════════════════════════════════════════════════════════

${bnccBlock}

REGRAS DE QUALIDADE PARA PLANOS DE AULA:

1. OBJETIVOS DE APRENDIZAGEM (SMART):
   - Específicos: O que exatamente o aluno deve aprender
   - Mensuráveis: Como verificar se aprendeu (verbo de ação observável)
   - Alcançáveis: Realistas para o nível da turma
   - Relevantes: Conectados ao currículo e à vida real
   - Temporais: Realizáveis no tempo disponível
   Use verbos da Taxonomia de Bloom: identificar, classificar, resolver, analisar, avaliar, criar

2. HABILIDADES BNCC REAIS:
   - Cada objetivo deve estar vinculado a pelo menos 1 habilidade BNCC específica com código
   - Use os códigos REAIS (ex: EF07MA17, não "BNCC aplicável")

3. METODOLOGIA ATIVA DETALHADA:
   Especifique COMO a metodologia será aplicada:
   - Aprendizagem Baseada em Problemas (PBL): Qual é o problema central?
   - Sala de Aula Invertida: O que o aluno faz antes da aula?
   - Gamificação: Quais elementos de jogo serão usados?
   - Rotação por Estações: Quais são as estações?
   - Peer Instruction: Como organizar os pares?

4. DESENVOLVIMENTO EM ETAPAS DETALHADAS:
   Para cada etapa da aula:
   - Tempo exato (ex: "10 minutos")
   - O que o PROFESSOR faz nesse momento
   - O que os ALUNOS fazem nesse momento
   - Recursos utilizados
   - Como avaliar se a etapa funcionou
   
5. AVALIAÇÃO FORMATIVA INTEGRADA:
   - Não apenas ao final: avalie durante toda a aula
   - Inclua "exit tickets" ou verificações rápidas
   - Sugira perguntas-chave para verificar compreensão
   - Indicadores observáveis de aprendizagem

6. DIFERENCIAÇÃO:
   - Adaptações para alunos com dificuldades (andaimes pedagógicos)
   - Extensões para alunos avançados (desafios extras)
   - Estratégias para alunos com necessidades especiais

${QUALITY_STANDARDS}
`;
}

export function getQualityPromptForFlashCards(ctx: QualityContext): string {
  const bnccBlock = formatBNCCForPrompt(ctx.disciplina, ctx.anoSerie);

  return `
DIRETRIZES DE QUALIDADE PEDAGÓGICA PARA FLASH CARDS
═══════════════════════════════════════════════════════════════

${bnccBlock}

REGRAS DE QUALIDADE PARA FLASH CARDS:

1. PROGRESSÃO COGNITIVA:
   - Primeiros 30% dos cards: DEFINIÇÕES e CONCEITOS básicos (Lembrar)
   - Próximos 30% dos cards: EXEMPLOS e APLICAÇÕES práticas (Compreender/Aplicar)
   - Próximos 20% dos cards: COMPARAÇÕES e RELAÇÕES entre conceitos (Analisar)
   - Últimos 20% dos cards: CASOS especiais e EXCEÇÕES (Avaliar)

2. FORMATO RICO PARA CADA CARD:
   FRENTE (pergunta/conceito):
   - Deve ser concisa mas clara
   - Use perguntas diretas, não afirmações para completar
   - Inclua contexto quando necessário
   
   VERSO (resposta/explicação):
   - Resposta principal em destaque
   - Explicação complementar breve
   - Um exemplo prático quando possível
   - Dica mnemônica quando aplicável

3. ORGANIZAÇÃO POR CATEGORIAS:
   - Agrupe cards por subtópico dentro do tema
   - Cada card deve ter um campo "category" com o subtópico
   - Indique o nível de dificuldade: "Fácil", "Médio", "Difícil"

4. TÉCNICAS DE MEMORIZAÇÃO:
   - Use associações visuais (descreva imagens mentais)
   - Inclua analogias com o cotidiano
   - Crie connections entre cards (referencie outros conceitos do mesmo deck)

${QUALITY_STANDARDS}
`;
}

export function getQualityPromptForSequenciaDidatica(ctx: QualityContext): string {
  const bnccBlock = formatBNCCForPrompt(ctx.disciplina, ctx.anoSerie);

  return `
DIRETRIZES DE QUALIDADE PEDAGÓGICA PARA SEQUÊNCIA DIDÁTICA
═══════════════════════════════════════════════════════════════

${bnccBlock}

REGRAS DE QUALIDADE PARA SEQUÊNCIAS DIDÁTICAS:

1. PROGRESSÃO PEDAGÓGICA OBRIGATÓRIA:
   As aulas devem seguir uma progressão lógica:
   - Aula 1-2: SENSIBILIZAÇÃO e DIAGNÓSTICO (levantar conhecimentos prévios)
   - Aulas intermediárias: DESENVOLVIMENTO (explorar, experimentar, construir conhecimento)
   - Penúltima aula: SISTEMATIZAÇÃO (organizar e consolidar aprendizagens)
   - Última aula: AVALIAÇÃO e AUTOAVALIAÇÃO (verificar e refletir sobre a aprendizagem)

2. CADA AULA DEVE CONTER:
   - Objetivo específico mensurável (verbo de ação + conteúdo + contexto)
   - Habilidade BNCC específica trabalhada (código real)
   - Metodologia ativa detalhada (não apenas o nome, mas COMO aplicar)
   - Recursos concretos e acessíveis (considerar realidade de escola pública)
   - Avaliação formativa integrada (como saber se os alunos aprenderam)
   - Tempo estimado realista

3. DIAGNÓSTICOS:
   - Devem ter instrumentos CLAROS e PRÁTICOS
   - Inclua critérios observáveis de avaliação
   - Sugira como registrar e usar os resultados
   - Proponha intervenções baseadas nos possíveis resultados

4. AVALIAÇÕES:
   - Critérios de avaliação ESPECÍFICOS e MENSURÁVEIS
   - Rubrica detalhada com níveis de desempenho
   - Instrumentos variados (não apenas prova escrita)
   - Possibilidade de autoavaliação e avaliação entre pares

5. ARTICULAÇÃO CURRICULAR:
   - Conexões interdisciplinares explícitas
   - Relação com competências gerais da BNCC
   - Contextualização com a realidade local dos alunos

${QUALITY_STANDARDS}
`;
}

export function getQualityPromptForGenericActivity(ctx: QualityContext): string {
  const bnccBlock = formatBNCCForPrompt(ctx.disciplina, ctx.anoSerie);

  return `
DIRETRIZES DE QUALIDADE PEDAGÓGICA (ATIVIDADE GERAL)
═══════════════════════════════════════════════════════════════

${bnccBlock}

${BLOOM_TAXONOMY_PT}

PADRÕES OBRIGATÓRIOS PARA QUALQUER ATIVIDADE:

1. OBJETIVOS CLAROS: Defina o que o aluno deve aprender ao final
2. BNCC: Indique pelo menos 1 habilidade BNCC trabalhada
3. CONTEXTUALIZAÇÃO: Relacione com a realidade dos alunos brasileiros
4. PROGRESSÃO: Se houver múltiplas partes, organize em ordem crescente de dificuldade
5. INSTRUÇÕES CLARAS: O professor deve conseguir usar sem explicação adicional
6. AVALIAÇÃO: Inclua critérios para o professor avaliar o desempenho

${QUALITY_STANDARDS}
`;
}

export function getQualityEnhancementForType(
  activityType: string, 
  ctx: QualityContext
): string {
  switch (activityType) {
    case 'quiz-interativo':
      return getQualityPromptForQuiz(ctx);
    case 'lista-exercicios':
      return getQualityPromptForExerciseList(ctx);
    case 'plano-aula':
      return getQualityPromptForLessonPlan(ctx);
    case 'flash-cards':
      return getQualityPromptForFlashCards(ctx);
    case 'sequencia-didatica':
      return getQualityPromptForSequenciaDidatica(ctx);
    default:
      return getQualityPromptForGenericActivity(ctx);
  }
}

export function getBatchProgressionPrompt(
  batchIndex: number,
  batchTotal: number,
  previousTypes: string[]
): string {
  if (batchTotal <= 1) return '';

  const progressionPhase = getProgressionPhase(batchIndex, batchTotal);
  const avoidTypes = previousTypes.length > 0 
    ? `\nTIPOS JÁ USADOS (EVITE REPETIR FORMATO): ${previousTypes.join(', ')}` 
    : '';

  return `
PROGRESSÃO EM LOTE (Atividade ${batchIndex + 1} de ${batchTotal}):
═══════════════════════════════════════════════════════════════
FASE PEDAGÓGICA DESTA ATIVIDADE: ${progressionPhase.nome}
OBJETIVO DESTA FASE: ${progressionPhase.objetivo}
NÍVEL DE BLOOM PREDOMINANTE: ${progressionPhase.bloomLevel}
TIPO DE ATIVIDADE SUGERIDO: ${progressionPhase.tipoSugerido}
${avoidTypes}

REGRA DE VARIEDADE: Em lotes, NUNCA repita o mesmo formato de atividade consecutivamente.
Alterne entre: Quiz, Exercícios, Dinâmica em Grupo, Pesquisa, Jogo, Produção Textual, Debate, Mapa Mental.
`;
}

interface ProgressionPhase {
  nome: string;
  objetivo: string;
  bloomLevel: string;
  tipoSugerido: string;
}

function getProgressionPhase(index: number, total: number): ProgressionPhase {
  const position = index / Math.max(total - 1, 1);

  if (position <= 0.2) {
    return {
      nome: 'ATIVAÇÃO (Aquecimento)',
      objetivo: 'Ativar conhecimentos prévios, despertar curiosidade, diagnosticar nível da turma',
      bloomLevel: 'Lembrar / Compreender',
      tipoSugerido: 'Quiz diagnóstico, brainstorm guiado, mapa mental inicial, roda de conversa'
    };
  } else if (position <= 0.5) {
    return {
      nome: 'EXPLORAÇÃO (Construção)',
      objetivo: 'Apresentar novo conteúdo, explorar conceitos, construir entendimento',
      bloomLevel: 'Compreender / Aplicar',
      tipoSugerido: 'Aula dialogada com exercícios, experimento, estudo de caso, rotação por estações'
    };
  } else if (position <= 0.75) {
    return {
      nome: 'APROFUNDAMENTO (Prática)',
      objetivo: 'Aplicar conhecimentos em situações novas, resolver problemas, conectar com outras áreas',
      bloomLevel: 'Aplicar / Analisar',
      tipoSugerido: 'Lista de exercícios progressiva, projeto em grupo, pesquisa dirigida, debate'
    };
  } else if (position < 1.0) {
    return {
      nome: 'CONSOLIDAÇÃO (Desafio)',
      objetivo: 'Desafiar com problemas complexos, promover reflexão crítica, sintetizar aprendizagens',
      bloomLevel: 'Analisar / Avaliar',
      tipoSugerido: 'Desafio em grupo, produção textual, apresentação, jogo pedagógico avançado'
    };
  } else {
    return {
      nome: 'AVALIAÇÃO (Verificação)',
      objetivo: 'Verificar aprendizagem, celebrar conquistas, planejar próximos passos',
      bloomLevel: 'Avaliar / Criar',
      tipoSugerido: 'Avaliação formativa, autoavaliação, prova, portfólio, apresentação final'
    };
  }
}

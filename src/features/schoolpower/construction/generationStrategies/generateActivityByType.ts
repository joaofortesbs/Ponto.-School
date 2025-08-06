import { ActivityFormData, GeneratedActivity, ActivityType } from '../types/ActivityTypes';

// Gerar questão de múltipla escolha
const generateMultipleChoiceQuestion = (questionNumber: number, data: ActivityFormData) => {
  const difficultyTemplates = {
    'Básico': [
      `Sobre ${data.theme} em ${data.subject}, qual das alternativas está correta?`,
      `Em relação ao tema ${data.theme}, identifique a afirmação verdadeira:`,
      `Considerando o conteúdo de ${data.theme}, qual opção apresenta informação correta?`
    ],
    'Intermediário': [
      `Analise as características de ${data.theme} em ${data.subject} e identifique a alternativa correta:`,
      `Com base no estudo de ${data.theme}, qual das seguintes afirmações demonstra compreensão adequada?`,
      `Aplicando os conceitos de ${data.theme}, escolha a alternativa que melhor representa o tema:`
    ],
    'Avançado': [
      `Realize uma análise crítica sobre ${data.theme} em ${data.subject} e determine qual alternativa apresenta a interpretação mais adequada:`,
      `Considerando os aspectos complexos de ${data.theme}, qual alternativa demonstra domínio avançado do conteúdo?`,
      `Avalie criticamente os elementos de ${data.theme} e selecione a alternativa que melhor sintetiza o conhecimento:`
    ]
  };

  const templates = difficultyTemplates[data.difficultyLevel as keyof typeof difficultyTemplates] || difficultyTemplates['Básico'];
  const questionText = templates[questionNumber % templates.length];

  return {
    id: `q${questionNumber}`,
    type: 'multiple-choice',
    number: questionNumber,
    text: questionText,
    difficulty: data.difficultyLevel,
    points: calculateQuestionPoints(data.difficultyLevel),
    options: [
      { id: 'a', text: `Primeira alternativa sobre ${data.theme}`, isCorrect: true },
      { id: 'b', text: `Segunda alternativa sobre ${data.theme}`, isCorrect: false },
      { id: 'c', text: `Terceira alternativa sobre ${data.theme}`, isCorrect: false },
      { id: 'd', text: `Quarta alternativa sobre ${data.theme}`, isCorrect: false }
    ]
  };
};

// Gerar questão dissertativa
const generateEssayQuestion = (questionNumber: number, data: ActivityFormData) => {
  const difficultyTemplates = {
    'Básico': [
      `Explique com suas palavras o que você entende sobre ${data.theme}.`,
      `Descreva as principais características de ${data.theme} em ${data.subject}.`,
      `Cite exemplos práticos relacionados ao tema ${data.theme}.`
    ],
    'Intermediário': [
      `Analise a importância de ${data.theme} no contexto de ${data.subject} e apresente argumentos fundamentados.`,
      `Compare e contraste diferentes aspectos de ${data.theme}, justificando sua resposta.`,
      `Desenvolva uma explicação detalhada sobre como ${data.theme} se aplica na prática.`
    ],
    'Avançado': [
      `Elabore uma análise crítica sobre ${data.theme}, considerando múltiplas perspectivas e fundamentando com ${data.sources || 'fontes acadêmicas'}.`,
      `Desenvolva uma dissertação sobre os impactos e implicações de ${data.theme} em ${data.subject}, utilizando argumentação consistente.`,
      `Construa uma reflexão aprofundada sobre ${data.theme}, estabelecendo conexões com outros temas da disciplina.`
    ]
  };

  const templates = difficultyTemplates[data.difficultyLevel as keyof typeof difficultyTemplates] || difficultyTemplates['Básico'];
  const questionText = templates[questionNumber % templates.length];

  return {
    id: `q${questionNumber}`,
    type: 'essay',
    number: questionNumber,
    text: questionText,
    difficulty: data.difficultyLevel,
    points: calculateQuestionPoints(data.difficultyLevel),
    expectedLength: data.difficultyLevel === 'Básico' ? '3-5 linhas' : data.difficultyLevel === 'Intermediário' ? '5-8 linhas' : '8-12 linhas'
  };
};

// Gerar questão verdadeiro/falso
const generateTrueFalseQuestion = (questionNumber: number, data: ActivityFormData) => {
  const statements = [
    `O tema ${data.theme} é fundamental para o entendimento de ${data.subject}.`,
    `Em ${data.subject}, ${data.theme} apresenta características específicas que devem ser consideradas.`,
    `O estudo de ${data.theme} contribui para o desenvolvimento acadêmico em ${data.subject}.`,
    `As aplicações práticas de ${data.theme} são limitadas ao contexto teórico de ${data.subject}.`,
    `${data.theme} pode ser compreendido completamente sem conhecimento prévio em ${data.subject}.`
  ];

  const statement = statements[questionNumber % statements.length];
  const isTrue = questionNumber % 2 === 1; // Alternar entre verdadeiro e falso

  return {
    id: `q${questionNumber}`,
    type: 'true-false',
    number: questionNumber,
    text: statement,
    difficulty: data.difficultyLevel,
    points: calculateQuestionPoints(data.difficultyLevel),
    correctAnswer: isTrue
  };
};

// Calcular pontos baseado na dificuldade
const calculateQuestionPoints = (difficulty: string): number => {
  switch (difficulty) {
    case 'Básico': return 1;
    case 'Intermediário': return 2;
    case 'Avançado': return 3;
    default: return 1;
  }
};

export const generateTest = (data: ActivityFormData): string => {
  return `
# ${data.title}

## Instruções Gerais
${data.instructions || `
1. Leia todas as questões antes de começar a responder
2. Responda com clareza e objetividade
3. Gerencie seu tempo adequadamente
4. Revise suas respostas antes de entregar
`}

## Questões
### Parte I - Questões Objetivas (${Math.floor(parseInt(data.numberOfQuestions || '10') * 0.6)} pontos)

**Questão 1** (10 pontos)
Sobre os conceitos fundamentais de ${data.subject} relacionados ao tema ${data.theme}, assinale a alternativa correta:

a) Primeira alternativa
b) Segunda alternativa  
c) Terceira alternativa
d) Quarta alternativa

**Questão 2** (10 pontos)
Analise as afirmações abaixo sobre ${data.theme} e marque V para verdadeiro e F para falso:

( ) Primeira afirmação sobre o tema
( ) Segunda afirmação sobre o tema
( ) Terceira afirmação sobre o tema
( ) Quarta afirmação sobre o tema

### Parte II - Questões Dissertativas (${Math.floor(parseInt(data.numberOfQuestions || '10') * 0.4)} pontos)

**Questão 3** (20 pontos)
Explique detalhadamente o conceito de ${data.theme} em ${data.subject} e sua aplicação prática no contexto do ${data.schoolYear}.

**Questão 4** (20 pontos)
Desenvolva uma análise crítica sobre ${data.theme}, apresentando argumentos fundamentados baseados em ${data.sources || 'fontes confiáveis'}.

## Critérios de Avaliação
${data.evaluation || `
- Objetivas: Resposta correta = pontuação total
- Dissertativas: Conteúdo (60%), Organização (25%), Clareza (15%)
`}

## Materiais de Apoio
${data.materials || 'Material didático padrão da disciplina'}

## Objetivos de Aprendizagem
${data.objectives || `Avaliar o conhecimento dos estudantes sobre ${data.theme}`}
  `;
};

export const generateExerciseList = (data: ActivityFormData): string => {
  // Gerar questões baseadas nos dados do usuário
  const questions = generateQuestionsBasedOnUserData(data);

  return JSON.stringify({
    title: data.title,
    description: data.description,
    subject: data.subject,
    theme: data.theme,
    schoolYear: data.schoolYear,
    numberOfQuestions: parseInt(data.numberOfQuestions || '10'),
    difficultyLevel: data.difficultyLevel,
    questionModel: data.questionModel,
    sources: data.sources,
    questions: questions,
    metadata: {
      generatedAt: new Date().toISOString(),
      activityType: 'lista-exercicios'
    }
  }, null, 2);
};

// Função para gerar questões baseadas nos dados do usuário - apenas 3 tipos válidos
const generateQuestionsBasedOnUserData = (data: ActivityFormData) => {
  const questions = [];
  const numberOfQuestions = parseInt(data.numberOfQuestions || '10');

  // Apenas 3 tipos de questão permitidos
  const validQuestionTypes = ['multipla-escolha', 'discursiva', 'verdadeiro-falso'] as const;
  type ValidQuestionType = typeof validQuestionTypes[number];

  for (let i = 1; i <= numberOfQuestions; i++) {
    // Determinar tipo de questão baseado no modelo selecionado
    let questionType: ValidQuestionType = 'multipla-escolha';

    const modeloLower = (data.questionModel || '').toLowerCase();

    if (modeloLower.includes('discursiva') || modeloLower.includes('dissertativa')) {
      questionType = 'discursiva';
    } else if (modeloLower.includes('verdadeiro') || modeloLower.includes('falso')) {
      questionType = 'verdadeiro-falso';
    } else if (modeloLower.includes('mista') || modeloLower.includes('misto')) {
      // Para questões mistas, alterna entre os 3 tipos
      questionType = validQuestionTypes[Math.floor(Math.random() * validQuestionTypes.length)];
    } else {
      // Default para múltipla escolha
      questionType = 'multipla-escolha';
    }

    const question = {
      id: `questao-${i}`,
      type: questionType,
      enunciado: `Questão ${i} sobre ${data.theme}`,
      alternativas: questionType === 'multipla-escolha' ? [
        'Alternativa A',
        'Alternativa B',
        'Alternativa C',
        'Alternativa D'
      ] : questionType === 'verdadeiro-falso' ? ['Verdadeiro', 'Falso'] : undefined,
      respostaCorreta: 0,
      dificuldade: data.difficultyLevel?.toLowerCase() || 'medio',
      tema: data.theme
    };

    questions.push(question);
  }

  return questions;
};


export const generateGame = (data: ActivityFormData): string => {
  return `
# ${data.title}

## Descrição do Jogo
${data.description}

## Informações do Jogo
- **Disciplina:** ${data.subject}
- **Tema:** ${data.theme}
- **Ano de Escolaridade:** ${data.schoolYear}
- **Nível de Dificuldade:** ${data.difficultyLevel}

## Objetivos de Aprendizagem
${data.objectives || `Promover o aprendizado de ${data.theme} em ${data.subject} de forma lúdica e interativa.`}

## Materiais Necessários
${data.materials || `• Cartas ou fichas sobre ${data.theme}\n• Tabuleiro temático\n• Dados ou marcadores\n• Cronômetro`}

## Número de Participantes
Ideal para: 2 a 6 jogadores do ${data.schoolYear}

## Regras do Jogo

### Preparação
1. Organize os materiais sobre ${data.theme} conforme especificado
2. Explique as regras relacionadas ao tema ${data.theme} para todos os participantes
3. Defina a ordem de jogada

### Desenvolvimento
1. **Rodada Inicial:** Cada jogador recebe cartas sobre ${data.theme}
2. **Turnos:** Os jogadores alternam jogadas aplicando conceitos de ${data.subject}
3. **Desafios:** Resolução de questões sobre ${data.theme} durante o jogo
4. **Pontuação:** Sistema de pontos baseado no conhecimento de ${data.theme}

### Finalização
O jogo termina quando todos os conceitos de ${data.theme} foram explorados e o vencedor é determinado pelo maior domínio do tema.

## Variações do Jogo
- **Modo Cooperativo:** Todos trabalham juntos para dominar ${data.theme}
- **Modo Competitivo:** Cada jogador compete individualmente
- **Modo Equipes:** Divisão em grupos para competição sobre ${data.theme}

## Avaliação Durante o Jogo
${data.evaluation || `
- Participação ativa: 30%
- Compreensão de ${data.theme}: 40%
- Colaboração e fair play: 30%
`}

## Fontes de Referência
${data.sources || `Material didático de ${data.subject} sobre ${data.theme}`}
  `;
};

export const generateVideo = (data: ActivityFormData): string => {
  return `
# Roteiro: ${data.title}

## Informações do Vídeo
- **Disciplina:** ${data.subject}
- **Tema:** ${data.theme}
- **Público-alvo:** ${data.schoolYear}
- **Nível de Dificuldade:** ${data.difficultyLevel}

## Descrição
${data.description}

## Objetivos do Vídeo
${data.objectives || `Explicar de forma visual e didática os conceitos de ${data.theme} em ${data.subject}.`}

## Roteiro Detalhado

### Introdução (0:00 - 1:00)
**Narração:** "Olá! Hoje vamos explorar ${data.theme} em ${data.subject}..."
**Recursos Visuais:** Slides com título e objetivos
**Música:** Trilha introdutória suave

### Desenvolvimento Principal (1:00 - 8:00)
**Tópico 1:** Conceitos básicos de ${data.theme}
- Explicação teórica
- Exemplos práticos
- Animações explicativas

**Tópico 2:** Aplicações de ${data.theme} no ${data.schoolYear}
- Casos reais
- Demonstrações visuais
- Gráficos e diagramas

**Tópico 3:** Exercícios práticos sobre ${data.theme}
- Resolução passo a passo
- Dicas importantes
- Verificação de entendimento

### Fechamento (8:00 - 9:00)
**Narração:** "Recapitulando os pontos principais sobre ${data.theme}..."
**Recursos Visuais:** Resumo visual dos conceitos
**Call-to-action:** Sugestão de prática adicional

## Recursos Técnicos Necessários
${data.materials || `• Software de edição de vídeo\n• Imagens sobre ${data.theme}\n• Trilha sonora adequada\n• Slides educativos`}

## Sugestões de Imagens/Recursos Visuais
- Diagramas explicativos sobre ${data.theme}
- Gráficos relevantes para ${data.subject}
- Animações conceituais
- Exemplos visuais do cotidiano

## Sugestões de Trilha Sonora
- Música de fundo instrumental suave
- Efeitos sonoros para transições
- Narração clara e pausada

## Avaliação do Aprendizado
${data.evaluation || `Questionário pós-vídeo sobre ${data.theme} para verificar compreensão`}

## Fontes de Referência
${data.sources || `Bibliografia recomendada sobre ${data.theme} em ${data.subject}`}
  `;
};

function generateQuestionStatement(data: ActivityFormData, questionNumber: number): string {
  const subject = data.subject || 'conteúdo';
  const theme = data.theme || 'tema proposto';
  const schoolYear = data.schoolYear || 'série';

  return `Questão ${questionNumber} sobre ${theme}: Desenvolva uma questão de ${subject} para ${schoolYear} que explore os conceitos fundamentais relacionados ao tema "${theme}". Esta questão deve avaliar a compreensão do estudante sobre os aspectos mais importantes do conteúdo estudado.`;
}

function generateDefaultActivity(data: ActivityFormData): string {
  return `Atividade: ${data.title || 'Atividade Educacional'}

Disciplina: ${data.subject || 'Não especificada'}
Tema: ${data.theme || 'Não especificado'}
Ano de Escolaridade: ${data.schoolYear || 'Não especificado'}

Descrição: ${data.description || 'Atividade educacional personalizada'}

Objetivos: ${data.objectives || 'Não especificados'}
Materiais: ${data.materials || 'Não especificados'}
Instruções: ${data.instructions || 'Não especificadas'}`;
}

export const generateActivityByType = (type: ActivityType, data: ActivityFormData): GeneratedActivity => {
  let content: string;

  switch (type) {
    case 'prova':
      content = generateTest(data);
      break;
    case 'lista-exercicios':
      const numberOfQuestions = parseInt(data.numberOfQuestions) || 5;
      const questions = [];

      // Gerar questões baseadas no tema e disciplina
      for (let i = 1; i <= numberOfQuestions; i++) {
        // Definir tipo de questão alternadamente
        const questionTypes = ['multipla-escolha', 'discursiva', 'verdadeiro-falso'];
        const questionType = questionTypes[(i - 1) % 3];

        const question = {
          id: `questao-${i}`,
          type: questionType,
          enunciado: generateQuestionStatement(data, i),
          dificuldade: data.difficultyLevel?.toLowerCase() || 'medio',
          tema: data.theme || 'Tema geral',
        };

        // Adicionar campos específicos por tipo
        if (questionType === 'multipla-escolha') {
          question.alternativas = [
            `Alternativa A relacionada ao tema ${data.theme || 'proposto'}`,
            `Alternativa B relacionada ao tema ${data.theme || 'proposto'}`,
            `Alternativa C relacionada ao tema ${data.theme || 'proposto'}`,
            `Alternativa D relacionada ao tema ${data.theme || 'proposto'}`
          ];
          question.respostaCorreta = 0;
          question.explicacao = `Explicação detalhada para a questão ${i} sobre ${data.theme || 'o tema'}.`;
        } else if (questionType === 'verdadeiro-falso') {
          question.resposta = true;
          question.explicacao = `Explicação para a questão ${i} de verdadeiro/falso sobre ${data.theme || 'o tema'}.`;
        } else if (questionType === 'discursiva') {
          question.criteriosAvaliacao = [
            'Demonstra conhecimento do tema',
            'Apresenta argumentação clara',
            'Usa exemplos adequados'
          ];
          question.respostaEsperada = `Resposta esperada para a questão ${i} sobre ${data.theme || 'o tema'}.`;
        }

        questions.push(question);
      }

      content = JSON.stringify({
        titulo: data.title || 'Lista de Exercícios',
        disciplina: data.subject || 'Disciplina geral',
        tema: data.theme || 'Tema geral',
        tipoQuestoes: 'misto',
        numeroQuestoes: numberOfQuestions,
        dificuldade: data.difficultyLevel?.toLowerCase() || 'medio',
        objetivos: data.objectives || '',
        conteudoPrograma: data.theme || '',
        observacoes: data.sources || '',
        questoes: questions,
        isGeneratedByAI: true,
        descricao: data.description || 'Exercícios práticos para fixação do conteúdo'
      }, null, 2);
      break;
    case 'jogo':
      content = generateGame(data);
      break;
    case 'video':
      content = generateVideo(data);
      break;
    case 'mapa-mental':
      content = `# Mapa Mental: ${data.title}\n\nEstrutura conceitual sobre ${data.theme} em ${data.subject} será desenvolvida...`;
      break;
    case 'apresentacao':
      content = `# Apresentação: ${data.title}\n\nSlides sobre ${data.theme} em ${data.subject} serão criados...`;
      break;
    default:
      content = generateDefaultActivity(data);
      break;
  }

  return {
    content,
    metadata: {
      estimatedTime: '45 minutos',
      difficulty: data.difficultyLevel || 'Médio',
      format: 'Texto estruturado',
      type: type
    }
  };
};
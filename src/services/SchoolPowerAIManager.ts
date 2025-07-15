
import { GeminiClient, GeminiRequest, GeminiResponse } from '@/utils/api/geminiClient';
import { ClaudeClient, ClaudeRequest, ClaudeResponse } from '@/utils/api/claudeClient';

// Interface padrão para respostas da IA
export interface AIResponse {
  success: boolean;
  result: string;
  estimatedTokens: number;
  estimatedPowerCost: number;
  executionTime: number;
  model: 'claude' | 'gemini';
  error?: string;
}

// Tipos para dados de entrada das funções
export interface BaseData {
  subject?: string;
  grade?: string;
  topic?: string;
  objectives?: string[];
  duration?: string;
}

export interface LessonPlanData extends BaseData {
  methodology?: string;
  resources?: string[];
  assessment?: string;
}

export interface ExamData extends BaseData {
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: ('multiple_choice' | 'essay' | 'true_false')[];
}

export interface AdaptationData extends BaseData {
  studentNeeds?: string[];
  accessibility?: string[];
  learningDifficulties?: string[];
}

export interface VideoData {
  videoUrl: string;
  context?: string;
  query?: string;
}

export interface TextData {
  text: string;
  targetAudience?: string;
  style?: 'formal' | 'casual' | 'academic' | 'simple';
}

// Mapeamento de modelos por grupo funcional
const MODEL_MAPPING = {
  // Grupo A - Criação de Conteúdo Didático (Claude)
  contentCreation: 'claude',
  // Grupo B - Adaptação e Inclusão (Claude)
  adaptation: 'claude',
  // Grupo C - Correção e Avaliação (Claude)
  evaluation: 'claude',
  // Grupo D - Suporte ao Professor (Gemini)
  teacherSupport: 'gemini',
  // Grupo E - Conteúdo Multimodal (Gemini)
  multimodal: 'gemini',
  // Grupo F - Atividades e Jogos (Gemini)
  activities: 'gemini',
  // Grupo G - Resumos e Textos (Gemini)
  textSummary: 'gemini',
} as const;

export class SchoolPowerAIManager {
  private claudeClient: ClaudeClient;
  private geminiClient: GeminiClient;

  constructor() {
    this.claudeClient = new ClaudeClient();
    this.geminiClient = new GeminiClient();
  }

  // =============================================================================
  // GRUPO A - CRIAÇÃO DE CONTEÚDO DIDÁTICO (Claude Sonnet)
  // =============================================================================

  /**
   * Gera um plano de aula completo
   */
  async generateLessonPlan(data: LessonPlanData): Promise<AIResponse> {
    const prompt = `
Crie um plano de aula detalhado com as seguintes especificações:

**Disciplina:** ${data.subject || 'Não especificada'}
**Série/Ano:** ${data.grade || 'Não especificada'}
**Tópico:** ${data.topic || 'Não especificado'}
**Duração:** ${data.duration || '50 minutos'}

**Objetivos:**
${data.objectives?.map(obj => `- ${obj}`).join('\n') || 'Definir objetivos específicos'}

**Metodologia:** ${data.methodology || 'Aula expositiva e participativa'}

Estruture o plano incluindo:
1. Objetivos específicos de aprendizagem
2. Conhecimentos prévios necessários
3. Metodologia detalhada
4. Recursos necessários
5. Desenvolvimento da aula (introdução, desenvolvimento, conclusão)
6. Atividades práticas
7. Avaliação
8. Referências e materiais complementares

Formate de forma clara e profissional para uso pedagógico.
    `;

    return this.executeRequest('contentCreation', prompt);
  }

  /**
   * Gera uma sequência didática
   */
  async generateDidacticSequence(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie uma sequência didática para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Tópico:** ${data.topic}
**Duração total:** ${data.duration || '4 aulas'}

A sequência deve incluir:
1. Planejamento geral (objetivos, competências)
2. Aula 1: Introdução e sensibilização
3. Aula 2: Desenvolvimento do conteúdo
4. Aula 3: Aprofundamento e prática
5. Aula 4: Síntese e avaliação
6. Recursos necessários para cada aula
7. Critérios de avaliação
8. Atividades diferenciadas

Formate de maneira didática e aplicável.
    `;

    return this.executeRequest('contentCreation', prompt);
  }

  /**
   * Gera uma prova/exame
   */
  async generateExam(data: ExamData): Promise<AIResponse> {
    const prompt = `
Crie uma prova/exame para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Tópico:** ${data.topic}
**Número de questões:** ${data.questionCount || 10}
**Dificuldade:** ${data.difficulty || 'medium'}

Tipos de questões: ${data.questionTypes?.join(', ') || 'mistas'}

Inclua:
1. Cabeçalho da prova
2. Instruções para o aluno
3. Questões variadas e bem estruturadas
4. Gabarito comentado
5. Critérios de avaliação
6. Distribuição de pontos
7. Tempo estimado para resolução

Formate profissionalmente para aplicação educacional.
    `;

    return this.executeRequest('contentCreation', prompt);
  }

  /**
   * Gera um simulado
   */
  async generateSimulationTest(data: ExamData): Promise<AIResponse> {
    const prompt = `
Crie um simulado preparatório para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Contexto:** ${data.topic || 'Preparação para avaliações'}
**Questões:** ${data.questionCount || 20}

O simulado deve:
1. Simular formato de provas oficiais
2. Incluir questões de diferentes níveis
3. Abordar competências e habilidades essenciais
4. Ter cronometragem sugerida
5. Incluir gabarito explicativo
6. Fornecer feedback pedagógico
7. Sugerir estudos complementares

Formate como um simulado real e aplicável.
    `;

    return this.executeRequest('contentCreation', prompt);
  }

  /**
   * Gera lista de exercícios
   */
  async generateExerciseList(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie uma lista de exercícios para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Tópico:** ${data.topic}

A lista deve conter:
1. 15-20 exercícios progressivos
2. Exercícios básicos, intermediários e avançados
3. Diferentes tipos de questões
4. Gabarito com resoluções detalhadas
5. Dicas de estudo
6. Exercícios extras para reforço
7. Indicação de tempo para cada exercício

Organize de forma didática e gradual.
    `;

    return this.executeRequest('contentCreation', prompt);
  }

  /**
   * Gera proposta de redação
   */
  async generateEssayPrompt(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie uma proposta de redação para:

**Série/Ano:** ${data.grade}
**Tema:** ${data.topic}
**Tipo:** Dissertativo-argumentativo

Inclua:
1. Contextualização do tema
2. Textos motivadores (2-3 textos)
3. Proposta clara de redação
4. Instruções específicas
5. Critérios de avaliação
6. Competências avaliadas
7. Exemplo de estrutura
8. Dicas de desenvolvimento

Formate como proposta oficial de redação.
    `;

    return this.executeRequest('contentCreation', prompt);
  }

  /**
   * Gera projeto de vida
   */
  async generateLifeProject(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie um projeto de vida para estudantes:

**Série/Ano:** ${data.grade}
**Foco:** ${data.topic || 'Desenvolvimento pessoal e profissional'}

O projeto deve incluir:
1. Autoconhecimento e reflexão pessoal
2. Identificação de valores e interesses
3. Mapeamento de competências
4. Definição de objetivos de curto, médio e longo prazo
5. Planejamento de ações concretas
6. Cronograma de desenvolvimento
7. Métodos de acompanhamento
8. Recursos e apoios necessários

Estruture de forma motivadora e prática.
    `;

    return this.executeRequest('contentCreation', prompt);
  }

  /**
   * Gera projeto passo a passo
   */
  async generateStepByStepProject(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie um projeto passo a passo para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Projeto:** ${data.topic}
**Duração:** ${data.duration || '1 mês'}

O projeto deve ter:
1. Objetivo geral e específicos
2. Justificativa e relevância
3. Metodologia detalhada
4. Cronograma semanal
5. Etapas bem definidas
6. Recursos necessários
7. Critérios de avaliação
8. Produto final esperado
9. Apresentação dos resultados

Organize de forma clara e executável.
    `;

    return this.executeRequest('contentCreation', prompt);
  }

  // =============================================================================
  // GRUPO B - ADAPTAÇÃO E INCLUSÃO (Claude Sonnet)
  // =============================================================================

  /**
   * Gera plano de recuperação
   */
  async generateRecoveryPlan(data: AdaptationData): Promise<AIResponse> {
    const prompt = `
Crie um plano de recuperação para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Conteúdo:** ${data.topic}
**Dificuldades identificadas:** ${data.learningDifficulties?.join(', ') || 'Gerais'}

O plano deve incluir:
1. Diagnóstico das dificuldades
2. Objetivos de recuperação
3. Estratégias diferenciadas
4. Atividades de reforço
5. Cronograma de recuperação
6. Materiais adaptados
7. Avaliação formativa
8. Acompanhamento do progresso

Foque em estratégias eficazes e inclusivas.
    `;

    return this.executeRequest('adaptation', prompt);
  }

  /**
   * Gera tarefa adaptada
   */
  async generateAdaptedTask(data: AdaptationData): Promise<AIResponse> {
    const prompt = `
Adapte uma tarefa para estudantes com necessidades específicas:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Conteúdo:** ${data.topic}
**Necessidades especiais:** ${data.studentNeeds?.join(', ') || 'Não especificadas'}

Adaptações necessárias:
1. Simplificação da linguagem
2. Recursos visuais adequados
3. Tempo estendido se necessário
4. Formatos alternativos
5. Critérios de avaliação flexíveis
6. Apoios específicos
7. Tecnologias assistivas

Mantenha os objetivos pedagógicos originais.
    `;

    return this.executeRequest('adaptation', prompt);
  }

  /**
   * Gera atividade acessível
   */
  async generateAccessibleActivity(data: AdaptationData): Promise<AIResponse> {
    const prompt = `
Crie uma atividade totalmente acessível para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Tema:** ${data.topic}
**Acessibilidade:** ${data.accessibility?.join(', ') || 'Universal'}

A atividade deve ser:
1. Inclusiva para diferentes deficiências
2. Com múltiplas formas de representação
3. Variadas formas de expressão
4. Diferentes formas de engajamento
5. Uso de tecnologias assistivas
6. Materiais em formatos alternativos
7. Critérios flexíveis de avaliação

Aplique princípios do Desenho Universal.
    `;

    return this.executeRequest('adaptation', prompt);
  }

  /**
   * Reescreve texto para acessibilidade
   */
  async rewriteTextForAccessibility(data: TextData): Promise<AIResponse> {
    const prompt = `
Reescreva o seguinte texto tornando-o mais acessível:

**Texto original:**
${data.text}

**Público-alvo:** ${data.targetAudience || 'Estudantes com necessidades específicas'}

Adaptações:
1. Linguagem clara e simples
2. Frases curtas e diretas
3. Evitar jargões técnicos
4. Estrutura organizada
5. Uso de marcadores visuais
6. Definição de termos complexos
7. Exemplos práticos

Mantenha o conteúdo essencial intacto.
    `;

    return this.executeRequest('adaptation', prompt);
  }

  /**
   * Avalia acessibilidade de texto
   */
  async assessTextAccessibility(data: TextData): Promise<AIResponse> {
    const prompt = `
Avalie a acessibilidade do seguinte texto:

**Texto para análise:**
${data.text}

Faça uma análise considerando:
1. Nível de complexidade linguística
2. Estrutura e organização
3. Uso de termos técnicos
4. Clareza das instruções
5. Adequação ao público
6. Barreiras de compreensão
7. Sugestões de melhoria

Forneça uma avaliação detalhada e recomendações.
    `;

    return this.executeRequest('adaptation', prompt);
  }

  /**
   * Sugere aulas acessíveis
   */
  async suggestAccessibleLessons(data: AdaptationData): Promise<AIResponse> {
    const prompt = `
Sugira estratégias para tornar as aulas mais acessíveis:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Conteúdo:** ${data.topic}
**Necessidades:** ${data.studentNeeds?.join(', ') || 'Diversas'}

Forneça:
1. Estratégias de ensino inclusivas
2. Recursos didáticos adaptados
3. Tecnologias assistivas
4. Metodologias diferenciadas
5. Ambiente de aprendizagem
6. Comunicação acessível
7. Avaliação inclusiva

Foque em práticas eficazes e implementáveis.
    `;

    return this.executeRequest('adaptation', prompt);
  }

  /**
   * Sugere avaliações inclusivas
   */
  async suggestInclusiveAssessments(data: AdaptationData): Promise<AIResponse> {
    const prompt = `
Sugira métodos de avaliação inclusiva para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Conteúdo:** ${data.topic}
**Necessidades específicas:** ${data.studentNeeds?.join(', ') || 'Variadas'}

Inclua:
1. Múltiplas formas de avaliação
2. Critérios flexíveis
3. Adaptações necessárias
4. Tecnologias de apoio
5. Tempo adequado
6. Formatos alternativos
7. Feedback construtivo

Garanta equidade na avaliação.
    `;

    return this.executeRequest('adaptation', prompt);
  }

  // =============================================================================
  // GRUPO C - CORREÇÃO E AVALIAÇÃO (Claude Sonnet)
  // =============================================================================

  /**
   * Corrige exame
   */
  async correctExam(data: any): Promise<AIResponse> {
    const prompt = `
Corrija e avalie o seguinte exame:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Respostas do aluno:**
${data.studentAnswers || 'Fornecer respostas para correção'}

**Gabarito:**
${data.answerKey || 'Fornecer gabarito oficial'}

Forneça:
1. Correção questão por questão
2. Pontuação obtida
3. Feedback específico
4. Áreas de melhoria
5. Pontos fortes identificados
6. Sugestões de estudo
7. Nota final e conceito

Seja construtivo e pedagógico na correção.
    `;

    return this.executeRequest('evaluation', prompt);
  }

  /**
   * Corrige redação
   */
  async correctEssay(data: any): Promise<AIResponse> {
    const prompt = `
Corrija e avalie a seguinte redação:

**Tema:** ${data.topic}
**Tipo:** ${data.essayType || 'Dissertativo-argumentativo'}
**Texto do aluno:**
${data.studentText || 'Fornecer texto para correção'}

Avalie segundo critérios:
1. Adequação ao tema
2. Estrutura textual
3. Argumentação
4. Coesão e coerência
5. Linguagem e gramática
6. Proposta de intervenção (se aplicável)
7. Criatividade e originalidade

Forneça nota, feedback e sugestões de melhoria.
    `;

    return this.executeRequest('evaluation', prompt);
  }

  /**
   * Corrige questões abertas
   */
  async correctOpenQuestions(data: any): Promise<AIResponse> {
    const prompt = `
Corrija as seguintes questões abertas:

**Disciplina:** ${data.subject}
**Questões e respostas:**
${data.questionsAndAnswers || 'Fornecer questões e respostas do aluno'}

**Critérios de avaliação:**
${data.criteria || 'Aplicar critérios padrão'}

Para cada resposta, avalie:
1. Compreensão do conceito
2. Completude da resposta
3. Correção conceitual
4. Clareza na exposição
5. Uso de exemplos
6. Conexões estabelecidas
7. Nota parcial e justificativa

Seja detalhado e educativo.
    `;

    return this.executeRequest('evaluation', prompt);
  }

  /**
   * Gera relatório de desempenho
   */
  async generatePerformanceReport(data: any): Promise<AIResponse> {
    const prompt = `
Gere um relatório de desempenho para:

**Estudante:** ${data.studentName || 'Não identificado'}
**Disciplina:** ${data.subject}
**Período:** ${data.period || 'Bimestre atual'}
**Notas obtidas:** ${data.grades || 'Não fornecidas'}
**Atividades realizadas:** ${data.activities || 'Não especificadas'}

O relatório deve incluir:
1. Análise do desempenho geral
2. Pontos fortes identificados
3. Áreas que precisam de atenção
4. Progresso ao longo do período
5. Recomendações específicas
6. Estratégias de melhoria
7. Metas para próximo período

Formate profissionalmente para comunicação com família.
    `;

    return this.executeRequest('evaluation', prompt);
  }

  // =============================================================================
  // GRUPO D - SUPORTE AO PROFESSOR (Gemini Flash)
  // =============================================================================

  /**
   * Gera questões
   */
  async generateQuestions(data: BaseData): Promise<AIResponse> {
    const prompt = `
Gere questões diversificadas para:

**Disciplina:** ${data.subject}
**Série/Ano:** ${data.grade}
**Tópico:** ${data.topic}

Crie 10 questões sendo:
- 3 múltipla escolha
- 3 verdadeiro/falso
- 2 dissertativas
- 2 questões práticas

Inclua gabarito e justificativas.
    `;

    return this.executeRequest('teacherSupport', prompt);
  }

  /**
   * Gera questões baseadas na Taxonomia de Bloom
   */
  async generateBloomQuestions(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie questões baseadas na Taxonomia de Bloom para:

**Disciplina:** ${data.subject}
**Tópico:** ${data.topic}
**Série:** ${data.grade}

Gere 2 questões para cada nível:
1. Lembrar
2. Compreender
3. Aplicar
4. Analisar
5. Avaliar
6. Criar

Identifique claramente o nível cognitivo de cada questão.
    `;

    return this.executeRequest('teacherSupport', prompt);
  }

  /**
   * Gera critérios de avaliação
   */
  async generateEvaluationCriteria(data: BaseData): Promise<AIResponse> {
    const prompt = `
Desenvolva critérios de avaliação para:

**Disciplina:** ${data.subject}
**Atividade:** ${data.topic}
**Série:** ${data.grade}

Crie:
1. Rubrica detalhada
2. Descritores de desempenho
3. Pontuação por critério
4. Exemplos de cada nível
5. Orientações para aplicação
    `;

    return this.executeRequest('teacherSupport', prompt);
  }

  /**
   * Gera objetivos de aprendizagem
   */
  async generateLearningObjectives(data: BaseData): Promise<AIResponse> {
    const prompt = `
Formule objetivos de aprendizagem para:

**Disciplina:** ${data.subject}
**Conteúdo:** ${data.topic}
**Série:** ${data.grade}

Crie objetivos:
1. Específicos e mensuráveis
2. Alinhados à BNCC
3. Com verbos de ação adequados
4. Progressivos em complexidade
5. Focados no estudante
    `;

    return this.executeRequest('teacherSupport', prompt);
  }

  /**
   * Melhora relevância do conteúdo
   */
  async improveContentRelevance(data: BaseData): Promise<AIResponse> {
    const prompt = `
Sugira formas de tornar mais relevante o conteúdo:

**Disciplina:** ${data.subject}
**Tópico:** ${data.topic}
**Série:** ${data.grade}

Forneça:
1. Conexões com o cotidiano
2. Aplicações práticas
3. Exemplos atuais
4. Interdisciplinaridade
5. Contextualização social
    `;

    return this.executeRequest('teacherSupport', prompt);
  }

  /**
   * Sugere intervenções pedagógicas
   */
  async suggestInterventions(data: any): Promise<AIResponse> {
    const prompt = `
Sugira intervenções pedagógicas para:

**Dificuldade identificada:** ${data.difficulty || 'Baixo rendimento'}
**Disciplina:** ${data.subject}
**Série:** ${data.grade}

Recomende:
1. Estratégias específicas
2. Atividades de reforço
3. Recursos alternativos
4. Cronograma de ação
5. Formas de acompanhamento
    `;

    return this.executeRequest('teacherSupport', prompt);
  }

  // =============================================================================
  // GRUPO E - CONTEÚDO MULTIMODAL (Gemini Flash)
  // =============================================================================

  /**
   * Resume vídeo
   */
  async summarizeVideo(data: VideoData): Promise<AIResponse> {
    const prompt = `
Crie um resumo estruturado para o vídeo:

**URL:** ${data.videoUrl}
**Contexto:** ${data.context || 'Educacional'}

Como não posso acessar o vídeo diretamente, forneça um template para resumo que inclua:
1. Informações básicas (título, duração)
2. Principais tópicos abordados
3. Conceitos-chave
4. Sequência de conteúdo
5. Aplicações práticas
6. Pontos de destaque
7. Recursos complementares
    `;

    return this.executeRequest('multimodal', prompt);
  }

  /**
   * Consulta conteúdo de vídeo
   */
  async queryVideoContent(data: VideoData): Promise<AIResponse> {
    const prompt = `
Oriente sobre como extrair informações específicas do vídeo:

**URL:** ${data.videoUrl}
**Pergunta específica:** ${data.query || 'Informação geral'}

Forneça orientações para:
1. Pontos do vídeo mais relevantes
2. Timestamps estimados
3. Conceitos relacionados
4. Metodologia de análise
5. Questões de compreensão
    `;

    return this.executeRequest('multimodal', prompt);
  }

  /**
   * Cria apresentação de slides
   */
  async createSlidePresentation(data: any): Promise<AIResponse> {
    const prompt = `
Crie o conteúdo para uma apresentação sobre:

**Tema:** ${data.topic}
**Disciplina:** ${data.subject}
**Público:** ${data.audience || 'Estudantes'}
**Número de slides:** ${data.slideCount || 10}

Para cada slide, forneça:
1. Título
2. Pontos principais
3. Imagens sugeridas
4. Notas do apresentador
5. Transições
    `;

    return this.executeRequest('multimodal', prompt);
  }

  /**
   * Gera mapa mental
   */
  async generateMindMap(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie a estrutura para um mapa mental sobre:

**Tema central:** ${data.topic}
**Disciplina:** ${data.subject}
**Nível:** ${data.grade}

Organize:
1. Tema central
2. Ramos principais (6-8)
3. Sub-ramos para cada principal
4. Palavras-chave
5. Cores sugeridas
6. Ícones/símbolos
7. Conexões entre conceitos
    `;

    return this.executeRequest('multimodal', prompt);
  }

  // =============================================================================
  // GRUPO F - ATIVIDADES, DINÂMICAS E JOGOS (Gemini Flash)
  // =============================================================================

  /**
   * Sugere jogos para sala de aula
   */
  async suggestClassroomGames(data: BaseData): Promise<AIResponse> {
    const prompt = `
Sugira jogos educativos para sala de aula:

**Disciplina:** ${data.subject}
**Conteúdo:** ${data.topic}
**Série:** ${data.grade}
**Duração da aula:** ${data.duration || '50 minutos'}

Para cada jogo, inclua:
1. Nome e descrição
2. Objetivos pedagógicos
3. Materiais necessários
4. Regras detalhadas
5. Tempo de execução
6. Variações possíveis
7. Critérios de avaliação
    `;

    return this.executeRequest('activities', prompt);
  }

  /**
   * Sugere jogos educacionais
   */
  async suggestEducationalGames(data: BaseData): Promise<AIResponse> {
    const prompt = `
Recomende jogos educacionais digitais e físicos para:

**Disciplina:** ${data.subject}
**Conteúdo:** ${data.topic}
**Idade:** ${data.grade}

Categorize por:
1. Jogos digitais/apps
2. Jogos de tabuleiro
3. Jogos de cartas
4. Jogos ao ar livre
5. Jogos de raciocínio
6. Jogos colaborativos

Inclua objetivos pedagógicos de cada um.
    `;

    return this.executeRequest('activities', prompt);
  }

  /**
   * Sugere experimentos científicos
   */
  async suggestScientificExperiments(data: BaseData): Promise<AIResponse> {
    const prompt = `
Proponha experimentos científicos para:

**Área:** ${data.subject}
**Conceito:** ${data.topic}
**Série:** ${data.grade}

Para cada experimento:
1. Objetivo científico
2. Hipótese
3. Materiais (facilmente acessíveis)
4. Procedimento passo a passo
5. Resultados esperados
6. Explicação científica
7. Variações e adaptações
8. Medidas de segurança
    `;

    return this.executeRequest('activities', prompt);
  }

  /**
   * Gera atividades com contos de fada
   */
  async generateFairyTaleActivities(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie atividades educativas usando contos de fada:

**Disciplina:** ${data.subject}
**Conceito a ensinar:** ${data.topic}
**Idade:** ${data.grade}

Desenvolva:
1. Conto adaptado ao conceito
2. Personagens educativos
3. Atividades de compreensão
4. Jogos relacionados
5. Atividades de expressão
6. Valores trabalhados
7. Extensões interdisciplinares
    `;

    return this.executeRequest('activities', prompt);
  }

  /**
   * Sugere atividades lúdicas infantis
   */
  async suggestChildPlayActivities(data: BaseData): Promise<AIResponse> {
    const prompt = `
Sugira atividades lúdicas para crianças:

**Faixa etária:** ${data.grade}
**Objetivo educativo:** ${data.topic}
**Contexto:** ${data.subject || 'Multidisciplinar'}

Organize por categorias:
1. Brincadeiras tradicionais adaptadas
2. Atividades sensoriais
3. Jogos de movimento
4. Atividades artísticas
5. Brincadeiras de faz de conta
6. Jogos cooperativos

Inclua desenvolvimento esperado em cada atividade.
    `;

    return this.executeRequest('activities', prompt);
  }

  /**
   * Gera músicas educativas
   */
  async generateEducationalSongs(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie músicas educativas sobre:

**Tema:** ${data.topic}
**Disciplina:** ${data.subject}
**Idade:** ${data.grade}

Para cada música:
1. Letra completa
2. Melodia sugerida (conhecida)
3. Movimentos/coreografia
4. Objetivos pedagógicos
5. Momentos de uso na aula
6. Extensões da atividade
7. Instrumentos simples para acompanhar
    `;

    return this.executeRequest('activities', prompt);
  }

  // =============================================================================
  // GRUPO G - RESUMOS E TEXTOS (Gemini Flash)
  // =============================================================================

  /**
   * Resume tópico
   */
  async summarizeTopic(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie um resumo abrangente sobre:

**Tema:** ${data.topic}
**Disciplina:** ${data.subject}
**Nível:** ${data.grade}

O resumo deve incluir:
1. Definições principais
2. Conceitos fundamentais
3. Exemplos práticos
4. Aplicações
5. Conexões com outros temas
6. Pontos importantes
7. Dicas de memorização
    `;

    return this.executeRequest('textSummary', prompt);
  }

  /**
   * Resume texto
   */
  async summarizeText(data: TextData): Promise<AIResponse> {
    const prompt = `
Resuma o seguinte texto de forma didática:

**Texto:**
${data.text}

**Público-alvo:** ${data.targetAudience || 'Estudantes'}

Crie:
1. Resumo executivo
2. Pontos principais
3. Conceitos-chave
4. Ideias secundárias
5. Conclusões
6. Aplicações práticas
    `;

    return this.executeRequest('textSummary', prompt);
  }

  /**
   * Gera texto de apoio
   */
  async generateSupportText(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie um texto de apoio sobre:

**Tema:** ${data.topic}
**Disciplina:** ${data.subject}
**Público:** ${data.grade}

O texto deve ser:
1. Didático e claro
2. Bem estruturado
3. Com exemplos práticos
4. Linguagem adequada à idade
5. Atividades de fixação
6. Bibliografia sugerida
    `;

    return this.executeRequest('textSummary', prompt);
  }

  /**
   * Gera lista de vocabulário
   */
  async generateVocabularyList(data: BaseData): Promise<AIResponse> {
    const prompt = `
Crie uma lista de vocabulário para:

**Tema:** ${data.topic}
**Disciplina:** ${data.subject}
**Série:** ${data.grade}

Para cada termo:
1. Definição clara
2. Contexto de uso
3. Exemplos práticos
4. Sinônimos
5. Termos relacionados
6. Dicas de memorização
7. Exercícios de fixação
    `;

    return this.executeRequest('textSummary', prompt);
  }

  /**
   * Gera reflexão sobre incidentes
   */
  async generateIncidentReflection(data: any): Promise<AIResponse> {
    const prompt = `
Crie uma reflexão pedagógica sobre o incidente:

**Situação:** ${data.incident || 'Não especificada'}
**Contexto:** ${data.context || 'Escolar'}
**Envolvidos:** ${data.involved || 'Estudantes'}

A reflexão deve abordar:
1. Análise da situação
2. Causas possíveis
3. Impactos educacionais
4. Oportunidades de aprendizagem
5. Estratégias de prevenção
6. Ações educativas
7. Acompanhamento necessário
    `;

    return this.executeRequest('textSummary', prompt);
  }

  // =============================================================================
  // MÉTODOS DE APOIO
  // =============================================================================

  /**
   * Executa requisição para o modelo apropriado
   */
  private async executeRequest(group: keyof typeof MODEL_MAPPING, prompt: string): Promise<AIResponse> {
    const model = MODEL_MAPPING[group];
    
    try {
      if (model === 'claude') {
        const response = await this.claudeClient.generate({
          prompt,
          temperature: 0.7,
          maxTokens: 4096,
        });

        return {
          ...response,
          model: 'claude',
        };
      } else {
        const response = await this.geminiClient.generate({
          prompt,
          temperature: 0.7,
          maxTokens: 2048,
        });

        return {
          ...response,
          model: 'gemini',
        };
      }
    } catch (error) {
      return {
        success: false,
        result: '',
        estimatedTokens: 0,
        estimatedPowerCost: 0,
        executionTime: 0,
        model,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Atualiza chave da API Claude
   */
  updateClaudeApiKey(newKey: string): void {
    this.claudeClient.updateApiKey(newKey);
  }

  /**
   * Atualiza chave da API Gemini
   */
  updateGeminiApiKey(newKey: string): void {
    this.geminiClient.updateApiKey(newKey);
  }

  /**
   * Obtém estatísticas de uso e mapeamento
   */
  getSystemInfo(): any {
    return {
      modelMapping: MODEL_MAPPING,
      supportedGroups: Object.keys(MODEL_MAPPING),
      totalFunctions: Object.getOwnPropertyNames(SchoolPowerAIManager.prototype)
        .filter(name => name.startsWith('generate') || name.startsWith('suggest') || name.startsWith('create') || name.startsWith('correct') || name.startsWith('assess') || name.startsWith('rewrite') || name.startsWith('summarize') || name.startsWith('query'))
        .length,
    };
  }
}

// Instância singleton para uso global
export const schoolPowerAI = new SchoolPowerAIManager();

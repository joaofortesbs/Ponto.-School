/**
 * content-helpers.ts
 * Funções utilitárias puras e constantes de geração de conteúdo.
 */

export const MAX_RETRIES = 2;
export const EXPONENTIAL_BACKOFF_BASE_MS = 1000;

export function truncateForDebug(value: any, maxLength: number = 150): string {
  if (value === null || value === undefined) return 'null';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + `... [+${str.length - maxLength} chars]`;
}

export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function inferSubjectFromObjective(objective: string): string {
  if (!objective) return 'Não especificada';

  const lowercaseObj = objective.toLowerCase();

  const subjectPatterns: Record<string, string[]> = {
    'Matemática': ['matemática', 'matemat', 'cálculo', 'álgebra', 'geometria', 'equação', 'fração', 'número', 'conta', 'porcentagem'],
    'Língua Portuguesa': ['português', 'redação', 'gramática', 'texto', 'leitura', 'escrita', 'literatura', 'ortografia', 'verbo', 'substantivo'],
    'Ciências': ['ciência', 'biologia', 'física', 'química', 'natureza', 'experimento', 'célula', 'átomo', 'energia'],
    'História': ['história', 'histórico', 'revolução', 'guerra', 'período', 'civilização', 'século', 'era'],
    'Geografia': ['geografia', 'geográfico', 'mapa', 'país', 'continente', 'clima', 'relevo', 'população'],
    'Arte': ['arte', 'artístico', 'pintura', 'música', 'desenho', 'escultura', 'teatro'],
    'Educação Física': ['educação física', 'esporte', 'exercício', 'movimento', 'jogo', 'atividade física'],
    'Inglês': ['inglês', 'english', 'vocabulary', 'grammar']
  };

  for (const [subject, patterns] of Object.entries(subjectPatterns)) {
    if (patterns.some(p => lowercaseObj.includes(p))) {
      return subject;
    }
  }

  return 'Não especificada';
}

export function generateThemeFromObjective(objective: string, subject: string): string {
  if (!objective || objective.length < 5) {
    const defaultThemes: Record<string, string> = {
      'Matemática': 'Operações com Números Inteiros',
      'Língua Portuguesa': 'Interpretação de Textos',
      'Ciências': 'O Corpo Humano e seus Sistemas',
      'História': 'As Grandes Civilizações Antigas',
      'Geografia': 'Aspectos Físicos do Brasil',
      'Arte': 'Expressão Artística Contemporânea',
      'Educação Física': 'Jogos Cooperativos',
      'Inglês': 'Basic Vocabulary and Expressions',
      'Marketing': 'Estratégias de Marketing Digital',
      'Tráfego Pago': 'Campanhas de Anúncios Online',
      'Negócios': 'Gestão e Planejamento Empresarial'
    };
    return defaultThemes[subject] || 'Tema a ser definido';
  }

  let cleaned = objective;
  cleaned = cleaned
    .replace(/[.,;!]\s*(?:considere|lembre|use|utilize|tenha|aplique|adote|faça|foque|priorize|inclua)\s+.*/gi, '')
    .replace(/[.,;!]\s*(?:a abordagem|abordagem|o método|o foco|a metodologia)\s+.*/gi, '')
    .replace(/[.,;!]\s*(?:ao finalizar|no final|depois|após|em seguida|por favor)\s+.*/gi, '')
    .replace(/[.,;!]\s*(?:organize|coloque|coloca|agende|marque)\s+.*(?:calendário|calendario|agenda)\s*.*/gi, '')
    .replace(/\d+\s*aulas?\s*(?:disponíveis|por semana|semanais|na semana)?/gi, '')
    .replace(/(?:considere\s+que\s+)?tenho\s+\d+\s*aulas?/gi, '')
    .replace(/(?:use|utilize|com)\s+(?:uma?\s+)?abordagem\s+(?:focada?\s+(?:em|no|na)\s+)?[\w\sãõéêíóúâô]+/gi, '')
    .replace(/turma\s+\w+/gi, '')
    .replace(/para\s+(?:a\s+)?turma\s+\w+/gi, '')
    .replace(/\d+[º°ª]\s*(?:ano|série|serie)/gi, '')
    .replace(/ensino\s+(?:fundamental|médio|medio)/gi, '')
    .trim();

  const sobreMatch = cleaned.match(/(?:sobre|de|tema[s]?\s*(?::|é|são)?)\s+([^.,;!]+?)(?:\s+(?:para|com|dentro|que|considere|organize|ao finalizar|use|utilize|lembre|tenho|turma)\b|[.,;!]|$)/i);
  if (sobreMatch && sobreMatch[1] && sobreMatch[1].trim().length >= 3) {
    let theme = sobreMatch[1].trim();
    theme = theme.replace(/\s+(para|com|que|dentro|ao|no|na)\s*$/i, '').trim();
    if (theme.length >= 3 && theme.length <= 120) {
      return theme.charAt(0).toUpperCase() + theme.slice(1);
    }
  }

  let theme = cleaned
    .replace(/^(preciso|quero|gostaria de|criar|fazer|desenvolver|crie|gere|monte|elabore|prepare|planeje)\s+/gi, '')
    .replace(/^(algumas?|alguns?|as|os|a|o|um|uma|uns|umas)\s+/gi, '')
    .replace(/^(atividades?|exercícios?|plano|planos|aulas?|materiais?|conteúdos?)\s+(de|sobre|para|com)\s+/gi, '')
    .replace(/^próximas?\s+atividades?\s+(de|sobre|para)\s+/gi, '')
    .replace(/^(sobre|para|com|de)\s+/gi, '')
    .replace(/^(como|o que é|quais são|quando|onde)\s+/gi, '')
    .trim();

  const MAX_THEME_LENGTH = 80;
  if (theme.length > MAX_THEME_LENGTH) {
    const words = theme.split(/\s+/);
    const keyWords: string[] = [];
    let charCount = 0;

    for (const word of words) {
      const skipWords = ['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
        'para', 'por', 'com', 'sem', 'sob', 'sobre', 'entre', 'até',
        'que', 'como', 'quando', 'onde', 'quais', 'qual', 'dentro'];
      if (skipWords.includes(word.toLowerCase()) && keyWords.length === 0) continue;

      if (charCount + word.length + 1 <= MAX_THEME_LENGTH) {
        keyWords.push(word);
        charCount += word.length + 1;
      } else {
        break;
      }
    }

    theme = keyWords.join(' ');
  }

  theme = theme.replace(/\.\.\.$/, '').replace(/\.$/, '').trim();

  if (!theme || theme.length < 3) {
    const defaultThemes: Record<string, string> = {
      'Matemática': 'Conceitos Matemáticos',
      'Língua Portuguesa': 'Produção Textual',
      'Ciências': 'Fenômenos Naturais',
      'História': 'Estudos Históricos',
      'Geografia': 'Estudos Geográficos',
      'Marketing': 'Estratégias de Marketing',
      'Tráfego Pago': 'Campanhas de Anúncios',
      'Negócios': 'Gestão Empresarial'
    };
    return defaultThemes[subject] || `Estudo de ${subject}`;
  }

  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

export function generateDefaultObjectives(theme: string, subject: string): string {
  return `• Compreender os conceitos fundamentais de ${theme}
• Aplicar os conhecimentos adquiridos em situações práticas do cotidiano
• Desenvolver habilidades de análise crítica e resolução de problemas em ${subject}
• Relacionar os conteúdos aprendidos com outras áreas do conhecimento
• Participar ativamente das atividades propostas, demonstrando engajamento e colaboração`;
}

export function generateDefaultMaterials(subject: string): string {
  const baseMaterials = '• Quadro branco e marcadores\n• Projetor multimídia\n• Material impresso (atividades)';

  const subjectSpecificMaterials: Record<string, string> = {
    'Matemática': '• Calculadora\n• Régua e compasso\n• Material concreto (blocos lógicos)',
    'Língua Portuguesa': '• Livros didáticos\n• Dicionários\n• Textos complementares',
    'Ciências': '• Materiais para experimentos\n• Modelos anatômicos\n• Lupas e microscópios',
    'História': '• Mapas históricos\n• Imagens e documentos de época\n• Linha do tempo',
    'Geografia': '• Mapas e globo terrestre\n• Atlas geográfico\n• Imagens de satélite',
    'Arte': '• Materiais de desenho e pintura\n• Instrumentos musicais\n• Recursos audiovisuais',
    'Educação Física': '• Bolas e equipamentos esportivos\n• Cones e marcadores\n• Colchonetes'
  };

  const specific = subjectSpecificMaterials[subject] || '• Recursos audiovisuais\n• Material de apoio complementar';

  return `${baseMaterials}\n${specific}`;
}

export function generateDefaultEvaluation(theme: string): string {
  return `Avaliação contínua através de:
• Participação e engajamento durante as atividades
• Exercícios práticos sobre ${theme}
• Trabalho em grupo com apresentação oral
• Avaliação escrita ao final da unidade
• Auto-avaliação reflexiva pelos alunos`;
}

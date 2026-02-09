/**
 * DEEP INTENT ANALYZER - Analisador Profundo de Intenção do Professor
 * 
 * Inspirado em:
 * - Google Research (Two-Stage Intent Decomposition, EMNLP 2025)
 * - Manus AI (structured entity extraction before planning)
 * - OpenAI GPT-5 (analyze intent FIRST, cover multiple interpretations)
 * - Teachy (BNCC-trained entity recognition)
 * 
 * PROBLEMA QUE RESOLVE:
 * O Intent Classifier detecta SE o professor quer executar algo,
 * mas NÃO extrai O QUÊ ele quer. O planner recebe texto bruto
 * e interpreta literalmente → literalismo.
 * 
 * SOLUÇÃO:
 * Two-Stage Decomposition:
 * Stage 1: Extrai entidades estruturadas (turma, série, temas, cronograma)
 * Stage 2: Infere intenção real e modo de execução
 * 
 * O resultado é um JSON estruturado que alimenta o planner com dados
 * limpos, eliminando ambiguidade e forçando execução.
 */

export interface DeepIntentEntities {
  turma: string | null;
  serie: string | null;
  componente: string | null;
  temas: string[];
  cronograma: CronogramaInfo | null;
  quantidade_atividades: number | null;
  nivel_ensino: 'fundamental_1' | 'fundamental_2' | 'medio' | null;
  faixa_etaria: string | null;
  diferenciacao: boolean;
  bncc_habilidades: string[];
  palavras_chave_pedagogicas: string[];
}

export interface CronogramaInfo {
  tipo: 'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'bimestral' | 'semestral' | 'anual' | 'personalizado';
  dias: number | null;
  periodo: string | null;
  detalhes: string | null;
}

export interface DeepIntentResult {
  entities: DeepIntentEntities;
  intencao_real: string;
  modo: 'EXECUTIVO' | 'CONSULTIVO' | 'CONVERSACIONAL';
  complexidade: 'simples' | 'media' | 'complexa' | 'massiva';
  tipo_entrega: 'atividade_interativa' | 'atividade_textual' | 'documento' | 'pacote_completo' | 'pesquisa' | 'conversa';
  contexto_suficiente: boolean;
  informacoes_faltantes: string[];
  role_assignment: string;
  sugestao_proativa: string | null;
  raw_message: string;
  confidence: number;
}

const SERIE_PATTERNS: Array<{ pattern: RegExp; serie: string; nivel: 'fundamental_1' | 'fundamental_2' | 'medio' }> = [
  { pattern: /\b1[ºo°]\s*ano\b/i, serie: '1º ano', nivel: 'fundamental_1' },
  { pattern: /\b2[ºo°]\s*ano\b/i, serie: '2º ano', nivel: 'fundamental_1' },
  { pattern: /\b3[ºo°]\s*ano\b/i, serie: '3º ano', nivel: 'fundamental_1' },
  { pattern: /\b4[ºo°]\s*ano\b/i, serie: '4º ano', nivel: 'fundamental_1' },
  { pattern: /\b5[ºo°]\s*ano\b/i, serie: '5º ano', nivel: 'fundamental_1' },
  { pattern: /\b6[ºo°]\s*ano\b/i, serie: '6º ano', nivel: 'fundamental_2' },
  { pattern: /\b7[ºo°]\s*ano\b/i, serie: '7º ano', nivel: 'fundamental_2' },
  { pattern: /\b8[ºo°]\s*ano\b/i, serie: '8º ano', nivel: 'fundamental_2' },
  { pattern: /\b9[ºo°]\s*ano\b/i, serie: '9º ano', nivel: 'fundamental_2' },
  { pattern: /\b1[ºo°]\s*(?:série|serie)\s*(?:do\s*)?(?:ensino\s*)?m[ée]dio\b/i, serie: '1ª série EM', nivel: 'medio' },
  { pattern: /\b2[ºo°]\s*(?:série|serie)\s*(?:do\s*)?(?:ensino\s*)?m[ée]dio\b/i, serie: '2ª série EM', nivel: 'medio' },
  { pattern: /\b3[ºo°]\s*(?:série|serie)\s*(?:do\s*)?(?:ensino\s*)?m[ée]dio\b/i, serie: '3ª série EM', nivel: 'medio' },
  { pattern: /\b1[ºo°]\s*ano\s*(?:do\s*)?(?:ensino\s*)?m[ée]dio\b/i, serie: '1º ano EM', nivel: 'medio' },
  { pattern: /\b2[ºo°]\s*ano\s*(?:do\s*)?(?:ensino\s*)?m[ée]dio\b/i, serie: '2º ano EM', nivel: 'medio' },
  { pattern: /\b3[ºo°]\s*ano\s*(?:do\s*)?(?:ensino\s*)?m[ée]dio\b/i, serie: '3º ano EM', nivel: 'medio' },
  { pattern: /\bensino\s*m[ée]dio\b/i, serie: 'Ensino Médio', nivel: 'medio' },
  { pattern: /\bfundamental\s*(?:1|I|i)\b/i, serie: 'Fundamental I', nivel: 'fundamental_1' },
  { pattern: /\bfundamental\s*(?:2|II|ii)\b/i, serie: 'Fundamental II', nivel: 'fundamental_2' },
  { pattern: /\benem\b/i, serie: 'ENEM', nivel: 'medio' },
  { pattern: /\bpré[\s-]?escola\b/i, serie: 'Pré-escola', nivel: 'fundamental_1' },
  { pattern: /\beducação\s*infantil\b/i, serie: 'Educação Infantil', nivel: 'fundamental_1' },
];

const TURMA_PATTERNS = [
  /\bturma\s+([A-Za-z0-9]+)\b/i,
  /\b(\d[ºo°]\s*ano)\s+([A-H])\b/i,
  /\bano\s+([A-H])\b/i,
  /\bsala\s+(\d+)\b/i,
];

const COMPONENTE_MAP: Array<{ patterns: RegExp[]; componente: string }> = [
  { patterns: [/\bportugu[êe]s\b/i, /\bl[íi]ngua\s*portuguesa\b/i, /\bleitura\b/i, /\breda[çc][ãa]o\b/i, /\binterpreta[çc][ãa]o\s*de\s*texto\b/i, /\bgramática\b/i, /\bortografia\b/i], componente: 'Língua Portuguesa' },
  { patterns: [/\bmatem[áa]tica\b/i, /\bfra[çc][õo]es\b/i, /\bequa[çc][õo]es\b/i, /\bgeometria\b/i, /\b[áa]lgebra\b/i, /\bfun[çc][õo]es\b/i, /\bcálculo\b/i, /\bprobabilidade\b/i, /\bestatística\b/i], componente: 'Matemática' },
  { patterns: [/\bci[êe]ncias\b/i, /\bbiologia\b/i, /\bf[íi]sica\b/i, /\bqu[íi]mica\b/i, /\becossistema\b/i, /\bc[ée]lula\b/i, /\bfotoss[íi]ntese\b/i, /\bsistema\s*solar\b/i], componente: 'Ciências' },
  { patterns: [/\bhist[óo]ria\b/i, /\bcoloniza[çc][ãa]o\b/i, /\bimperalismo\b/i, /\brevolução\b/i, /\bguerra\b/i, /\bimpério\b/i], componente: 'História' },
  { patterns: [/\bgeografia\b/i, /\brelevo\b/i, /\bclima\b/i, /\bbacia\s*hidrogr[áa]fica\b/i, /\bbioma\b/i, /\burbaniza[çc][ãa]o\b/i], componente: 'Geografia' },
  { patterns: [/\barte\b/i, /\bartes\b/i, /\bm[úu]sica\b/i, /\bdan[çc]a\b/i, /\bteatro\b/i, /\bpintura\b/i], componente: 'Arte' },
  { patterns: [/\bed(?:uca[çc][ãa]o)?\s*f[íi]sica\b/i, /\besporte\b/i, /\bginástica\b/i], componente: 'Educação Física' },
  { patterns: [/\bingl[êe]s\b/i, /\benglish\b/i, /\bl[íi]ngua\s*inglesa\b/i], componente: 'Inglês' },
  { patterns: [/\bsociologia\b/i], componente: 'Sociologia' },
  { patterns: [/\bfilosofia\b/i], componente: 'Filosofia' },
  { patterns: [/\bensino\s*religioso\b/i], componente: 'Ensino Religioso' },
];

const CRONOGRAMA_PATTERNS: Array<{ pattern: RegExp; tipo: CronogramaInfo['tipo']; extractor?: (match: RegExpMatchArray) => Partial<CronogramaInfo> }> = [
  { 
    pattern: /\bsemana\s*(?:inteira|toda|completa)?\b/i, 
    tipo: 'semanal',
    extractor: () => ({ dias: 5, periodo: 'segunda a sexta' }),
  },
  {
    pattern: /\bsegunda\s*(?:a|até)\s*sexta\b/i,
    tipo: 'semanal',
    extractor: () => ({ dias: 5, periodo: 'segunda a sexta' }),
  },
  {
    pattern: /\b(\d+)\s*(?:dias?|aulas?)\s*(?:por|na|da)?\s*semana\b/i,
    tipo: 'semanal',
    extractor: (m) => ({ dias: parseInt(m[1]), periodo: `${m[1]} dias por semana` }),
  },
  {
    pattern: /\b(\d+)\s*aulas?\b/i,
    tipo: 'personalizado',
    extractor: (m) => ({ dias: parseInt(m[1]), detalhes: `${m[1]} aulas solicitadas` }),
  },
  {
    pattern: /\bplanejamento\s*(?:semanal|da\s*semana)\b/i,
    tipo: 'semanal',
    extractor: () => ({ dias: 5, periodo: 'semana completa' }),
  },
  {
    pattern: /\bplanejamento\s*mensal\b/i,
    tipo: 'mensal',
    extractor: () => ({ dias: 20, periodo: 'mês completo' }),
  },
  {
    pattern: /\bplanejamento\s*bimestral\b/i,
    tipo: 'bimestral',
    extractor: () => ({ dias: 40, periodo: 'bimestre completo' }),
  },
  {
    pattern: /\bplanejamento\s*(?:semestral|do\s*semestre)\b/i,
    tipo: 'semestral',
    extractor: () => ({ periodo: 'semestre completo' }),
  },
  {
    pattern: /\bplanejamento\s*anual\b/i,
    tipo: 'anual',
    extractor: () => ({ periodo: 'ano letivo completo' }),
  },
  {
    pattern: /\bpara\s*(?:a\s*)?semana\b/i,
    tipo: 'semanal',
    extractor: () => ({ dias: 5, periodo: 'semana' }),
  },
  {
    pattern: /\bdi[áa]rio\b/i,
    tipo: 'diario',
    extractor: () => ({ dias: 1 }),
  },
];

const QUANTIDADE_PATTERNS = [
  /\b(\d+)\s*atividades?\b/i,
  /\b(\d+)\s*exerc[íi]cios?\b/i,
  /\b(\d+)\s*quest[õo]es?\b/i,
  /\b(\d+)\s*provas?\b/i,
  /\b(\d+)\s*aulas?\b/i,
  /\b(\d+)\s*planos?\b/i,
  /\b(\d+)\s*materiais?\b/i,
];

const DIFERENCIACAO_KEYWORDS = [
  /\bdiferencia[çc][ãa]o\b/i,
  /\binclusão\b/i,
  /\binclusivo\b/i,
  /\badaptad[ao]\b/i,
  /\bn[íi]veis?\s*diferent/i,
  /\bn[íi]vel\s*(?:b[áa]sico|intermedi[áa]rio|avan[çc]ado)\b/i,
  /\bdiferentes\s*n[íi]veis\b/i,
  /\balunos?\s*com\s*dificuldade/i,
  /\bnee\b/i,
  /\bpcd\b/i,
  /\bespeciais\b/i,
  /\bsuperdotad/i,
  /\baltas\s*habilidades/i,
];

const BNCC_PATTERN = /\b(EF\d{2}[A-Z]{2}\d{2})\b/g;

const PEDAGOGICAL_KEYWORDS = [
  { pattern: /\bgamifica[çc][ãa]o\b/i, keyword: 'gamificação' },
  { pattern: /\bmetodologia\s*ativa\b/i, keyword: 'metodologia ativa' },
  { pattern: /\baprendizagem\s*baseada\s*em\s*projetos?\b/i, keyword: 'ABP' },
  { pattern: /\bpbl\b/i, keyword: 'PBL' },
  { pattern: /\bsala\s*invertida\b/i, keyword: 'sala invertida' },
  { pattern: /\bsteam?\b/i, keyword: 'STEM/STEAM' },
  { pattern: /\bbloom\b/i, keyword: 'Bloom' },
  { pattern: /\bsocr[áa]tic[ao]\b/i, keyword: 'método socrático' },
  { pattern: /\bcompet[êe]ncia/i, keyword: 'competências' },
  { pattern: /\bhabilidade/i, keyword: 'habilidades' },
  { pattern: /\bavalia[çc][ãa]o\s*formativa\b/i, keyword: 'avaliação formativa' },
  { pattern: /\bavalia[çc][ãa]o\s*diagn[óo]stica\b/i, keyword: 'avaliação diagnóstica' },
  { pattern: /\binterdisciplinar\b/i, keyword: 'interdisciplinar' },
  { pattern: /\btransversal\b/i, keyword: 'transversal' },
  { pattern: /\bcollaborativ[ao]\b/i, keyword: 'colaborativo' },
  { pattern: /\blúdic[ao]\b/i, keyword: 'lúdico' },
  { pattern: /\bcontextualiz/i, keyword: 'contextualização' },
];

// ═══════════════════════════════════════════════════════════════════
// STAGE 1: Extração de Entidades (Entity Extraction)
// ═══════════════════════════════════════════════════════════════════

function extractEntities(message: string): DeepIntentEntities {
  const entities: DeepIntentEntities = {
    turma: null,
    serie: null,
    componente: null,
    temas: [],
    cronograma: null,
    quantidade_atividades: null,
    nivel_ensino: null,
    faixa_etaria: null,
    diferenciacao: false,
    bncc_habilidades: [],
    palavras_chave_pedagogicas: [],
  };

  for (const { pattern, serie, nivel } of SERIE_PATTERNS) {
    if (pattern.test(message)) {
      entities.serie = serie;
      entities.nivel_ensino = nivel;
      entities.faixa_etaria = inferFaixaEtaria(nivel, serie);
      break;
    }
  }

  for (const tp of TURMA_PATTERNS) {
    const match = message.match(tp);
    if (match) {
      entities.turma = match[0].trim();
      break;
    }
  }

  for (const { patterns, componente } of COMPONENTE_MAP) {
    if (patterns.some(p => p.test(message))) {
      entities.componente = componente;
      break;
    }
  }

  entities.temas = extractTemas(message, entities.componente);

  for (const { pattern, tipo, extractor } of CRONOGRAMA_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const extra = extractor ? extractor(match) : {};
      entities.cronograma = { tipo, dias: null, periodo: null, detalhes: null, ...extra };
      break;
    }
  }

  for (const qp of QUANTIDADE_PATTERNS) {
    const match = message.match(qp);
    if (match) {
      entities.quantidade_atividades = parseInt(match[1]);
      break;
    }
  }

  entities.diferenciacao = DIFERENCIACAO_KEYWORDS.some(p => p.test(message));

  const bnccMatches = message.match(BNCC_PATTERN);
  if (bnccMatches) {
    entities.bncc_habilidades = [...new Set(bnccMatches)];
  }

  for (const { pattern, keyword } of PEDAGOGICAL_KEYWORDS) {
    if (pattern.test(message)) {
      entities.palavras_chave_pedagogicas.push(keyword);
    }
  }

  return entities;
}

function extractTemas(message: string, componente: string | null): string[] {
  const temas: string[] = [];

  const TEMA_EXTRACTORS = [
    /\bsobre\s+(.+?)(?:\s+para\b|\s+do\b|\s+da\b|\s+com\b|\s*[,.]|\s*$)/i,
    /\btema[s]?\s*:?\s*(.+?)(?:\s+para\b|\s*[,.]|\s*$)/i,
    /\bconteúdo[s]?\s*:?\s*(.+?)(?:\s+para\b|\s*[,.]|\s*$)/i,
    /\bassunto[s]?\s*:?\s*(.+?)(?:\s+para\b|\s*[,.]|\s*$)/i,
  ];

  for (const pattern of TEMA_EXTRACTORS) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const rawTemas = match[1]
        .split(/\s*(?:,|;|e\s)\s*/)
        .map(t => t.trim())
        .filter(t => t.length > 2 && t.length < 100);
      temas.push(...rawTemas);
      break;
    }
  }

  if (temas.length === 0 && componente) {
    const SUBJECT_TOPICS: Record<string, Array<{ pattern: RegExp; tema: string }>> = {
      'Matemática': [
        { pattern: /\bfra[çc][õo]es\b/i, tema: 'Frações' },
        { pattern: /\bequa[çc][õo]es?\b/i, tema: 'Equações' },
        { pattern: /\bfun[çc][õo]es?\s*(?:quadr[áa]tic|do\s*[12][ºo°]\s*grau|afim|linear|exponencial)/i, tema: 'Funções' },
        { pattern: /\bgeometria\b/i, tema: 'Geometria' },
        { pattern: /\b[áa]rea\b/i, tema: 'Área e Perímetro' },
        { pattern: /\bprobabilidade\b/i, tema: 'Probabilidade' },
        { pattern: /\bestat[íi]stica\b/i, tema: 'Estatística' },
        { pattern: /\bporcentagem\b/i, tema: 'Porcentagem' },
        { pattern: /\braz[ãa]o\s*e\s*propor[çc][ãa]o\b/i, tema: 'Razão e Proporção' },
        { pattern: /\bpotencia[çc][ãa]o\b/i, tema: 'Potenciação' },
        { pattern: /\bradicia[çc][ãa]o\b/i, tema: 'Radiciação' },
        { pattern: /\bnúmeros?\s*(?:inteiros|racionais|irracionais|reais|naturais)\b/i, tema: 'Conjuntos Numéricos' },
      ],
      'Língua Portuguesa': [
        { pattern: /\bverbo\b/i, tema: 'Verbos' },
        { pattern: /\bsubstantivo\b/i, tema: 'Substantivos' },
        { pattern: /\badjetivo\b/i, tema: 'Adjetivos' },
        { pattern: /\bpronome\b/i, tema: 'Pronomes' },
        { pattern: /\bpara[gf]rafo\b/i, tema: 'Estrutura de Parágrafo' },
        { pattern: /\bnarrat/i, tema: 'Gênero Narrativo' },
        { pattern: /\bpoesia\b/i, tema: 'Poesia' },
        { pattern: /\bcrônica\b/i, tema: 'Crônica' },
        { pattern: /\borgumentati/i, tema: 'Texto Argumentativo' },
        { pattern: /\binterpreta[çc][ãa]o/i, tema: 'Interpretação de Texto' },
      ],
      'Ciências': [
        { pattern: /\bc[ée]lula/i, tema: 'Células' },
        { pattern: /\becossistema/i, tema: 'Ecossistemas' },
        { pattern: /\bsistema\s*solar/i, tema: 'Sistema Solar' },
        { pattern: /\bcorpo\s*humano/i, tema: 'Corpo Humano' },
        { pattern: /\bfotoss[íi]ntese/i, tema: 'Fotossíntese' },
        { pattern: /\b[áa]gua/i, tema: 'Água' },
        { pattern: /\benergia/i, tema: 'Energia' },
        { pattern: /\bmat[ée]ria/i, tema: 'Matéria' },
        { pattern: /\bevolução/i, tema: 'Evolução' },
        { pattern: /\bgenética/i, tema: 'Genética' },
      ],
      'História': [
        { pattern: /\bcoloniza[çc][ãa]o/i, tema: 'Colonização' },
        { pattern: /\brevolução\s*(?:francesa|industrial|russa)/i, tema: 'Revoluções' },
        { pattern: /\bguerra\s*(?:mundial|fria)/i, tema: 'Guerras' },
        { pattern: /\bescravid[ãa]o/i, tema: 'Escravidão' },
        { pattern: /\bindependência/i, tema: 'Independência' },
        { pattern: /\bimperialismo/i, tema: 'Imperialismo' },
        { pattern: /\brepública/i, tema: 'República' },
      ],
      'Geografia': [
        { pattern: /\brelevo/i, tema: 'Relevo' },
        { pattern: /\bclima/i, tema: 'Clima' },
        { pattern: /\bbioma/i, tema: 'Biomas' },
        { pattern: /\burbaniza[çc][ãa]o/i, tema: 'Urbanização' },
        { pattern: /\bglobaliza[çc][ãa]o/i, tema: 'Globalização' },
        { pattern: /\bmigra[çc][ãa]o/i, tema: 'Migração' },
        { pattern: /\bpopula[çc][ãa]o/i, tema: 'População' },
      ],
    };

    const topicPatterns = SUBJECT_TOPICS[componente] || [];
    for (const { pattern, tema } of topicPatterns) {
      if (pattern.test(message)) {
        temas.push(tema);
      }
    }
  }

  return [...new Set(temas)];
}

function inferFaixaEtaria(nivel: string | null, serie: string): string | null {
  if (!nivel) return null;
  const yearMatch = serie.match(/(\d)/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[1]);

  switch (nivel) {
    case 'fundamental_1': return `${year + 5}-${year + 6} anos`;
    case 'fundamental_2': return `${year + 5}-${year + 6} anos`;
    case 'medio': return `${year + 14}-${year + 15} anos`;
    default: return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 2: Inferência de Intenção Real (Intent Inference)
// ═══════════════════════════════════════════════════════════════════

function inferIntencaoReal(message: string, entities: DeepIntentEntities): Pick<DeepIntentResult, 'intencao_real' | 'modo' | 'complexidade' | 'tipo_entrega' | 'contexto_suficiente' | 'informacoes_faltantes' | 'sugestao_proativa' | 'confidence'> {
  const normalized = message.toLowerCase();

  const temTurmaOuSerie = !!(entities.turma || entities.serie);
  const temTemas = entities.temas.length > 0;
  const temComponente = !!entities.componente;
  const temCronograma = !!entities.cronograma;
  const temQuantidade = !!entities.quantidade_atividades;

  let modo: DeepIntentResult['modo'] = 'EXECUTIVO';
  let tipo_entrega: DeepIntentResult['tipo_entrega'] = 'atividade_interativa';
  let complexidade: DeepIntentResult['complexidade'] = 'simples';
  let confidence = 0.5;

  const CONVERSATIONAL_STARTERS = [/^(?:oi|olá|bom\s*dia|boa\s*(?:tarde|noite)|como\s*vai|tudo\s*bem)/i, /^(?:obrigad|valeu|legal|ok|entendi|perfeito)/i];
  const isConversational = CONVERSATIONAL_STARTERS.some(p => p.test(message.trim()));

  if (isConversational && message.trim().length < 30) {
    return {
      intencao_real: 'Conversa casual com o professor',
      modo: 'CONVERSACIONAL',
      complexidade: 'simples',
      tipo_entrega: 'conversa',
      contexto_suficiente: true,
      informacoes_faltantes: [],
      sugestao_proativa: null,
      confidence: 0.9,
    };
  }

  const INTERACTIVE_KEYWORDS = /\b(?:quiz|flash\s*card|exerc[íi]cio\s*interativo|lista\s*de\s*exerc[íi]cio)\b/i;
  const TEXT_ACTIVITY_KEYWORDS = /\b(?:prova|simulado|caça[\s-]*palavras?|cruzadinha|bingo|rubrica|mapa\s*mental|exit\s*ticket|debate|estudo\s*de\s*caso|gabarito|apostila)\b/i;
  const DOCUMENT_KEYWORDS = /\b(?:documento|roteiro|dossiê|relatório|resumo|artigo|texto\s*sobre|explica[çc][ãa]o|plano\s*de\s*aula|arquivo)\b/i;
  const RESEARCH_KEYWORDS = /\b(?:quais|o\s*que\s*(?:eu|já)|mostrar?|listar?|buscar?|pesquisar?|procurar?|cadê)\b/i;

  if (INTERACTIVE_KEYWORDS.test(message)) {
    tipo_entrega = 'atividade_interativa';
  } else if (TEXT_ACTIVITY_KEYWORDS.test(message)) {
    tipo_entrega = 'atividade_textual';
  } else if (DOCUMENT_KEYWORDS.test(message)) {
    tipo_entrega = 'documento';
  } else if (RESEARCH_KEYWORDS.test(message) && !(/\b(?:cri[ae]|fa[çc]a|mont|elabor|prepar|ger[ae])\b/i.test(message))) {
    tipo_entrega = 'pesquisa';
    modo = 'CONSULTIVO';
  } else if (/\b(?:cri[ae]|fa[çc]a|mont|elabor|prepar|ger[ae]|desenvolv)\b/i.test(message)) {
    tipo_entrega = temTemas ? 'atividade_interativa' : 'atividade_interativa';
  }

  if (temCronograma && (temQuantidade || (entities.cronograma?.dias && entities.cronograma.dias >= 3))) {
    tipo_entrega = 'pacote_completo';
    complexidade = 'complexa';
  }

  const quantidadeEfetiva = entities.quantidade_atividades || entities.cronograma?.dias || 0;
  if (quantidadeEfetiva >= 10) {
    complexidade = 'massiva';
  } else if (quantidadeEfetiva >= 5 || temCronograma) {
    complexidade = 'complexa';
  } else if (quantidadeEfetiva >= 2 || (temTemas && entities.temas.length >= 2)) {
    complexidade = 'media';
  }

  const informacoes_faltantes: string[] = [];
  if (!temComponente && !temTemas) {
    informacoes_faltantes.push('componente curricular ou tema');
  }
  if (!temTurmaOuSerie) {
    informacoes_faltantes.push('série/ano da turma');
  }

  const contexto_suficiente = informacoes_faltantes.length === 0 || 
    (temTemas && tipo_entrega !== 'pacote_completo') ||
    (temComponente && tipo_entrega !== 'pacote_completo');

  if (modo === 'EXECUTIVO' && (temTemas || temComponente)) {
    confidence = 0.7;
    if (temTurmaOuSerie) confidence += 0.1;
    if (temCronograma) confidence += 0.05;
    if (temQuantidade) confidence += 0.05;
    if (temTemas) confidence += 0.05;
  } else if (modo === 'CONSULTIVO') {
    confidence = 0.8;
  }

  let sugestao_proativa: string | null = null;
  if (tipo_entrega === 'pacote_completo' && !entities.diferenciacao) {
    sugestao_proativa = 'Posso incluir versões diferenciadas (básico/intermediário/avançado) para atender diferentes níveis da turma.';
  } else if (complexidade === 'simples' && temTemas && entities.temas.length === 1) {
    sugestao_proativa = `Além da atividade principal, posso criar materiais complementares sobre "${entities.temas[0]}" para reforço.`;
  }

  const parts: string[] = [];
  if (tipo_entrega === 'pacote_completo') {
    parts.push(`GERAR pacote completo de ${quantidadeEfetiva} materiais`);
  } else if (tipo_entrega === 'atividade_interativa' || tipo_entrega === 'atividade_textual') {
    parts.push(`GERAR ${quantidadeEfetiva > 1 ? quantidadeEfetiva + ' ' : ''}${tipo_entrega === 'atividade_textual' ? 'atividade(s) textual(is)' : 'atividade(s) interativa(s)'} pronta(s)`);
  } else if (tipo_entrega === 'documento') {
    parts.push('GERAR documento completo');
  } else if (tipo_entrega === 'pesquisa') {
    parts.push('CONSULTAR dados existentes');
  } else {
    parts.push('EXECUTAR pedido');
  }

  if (temTemas) parts.push(`sobre ${entities.temas.join(', ')}`);
  if (temTurmaOuSerie) parts.push(`para ${entities.serie || entities.turma}`);
  if (temComponente) parts.push(`(${entities.componente})`);
  if (temCronograma) parts.push(`— ${entities.cronograma!.periodo || entities.cronograma!.tipo}`);

  parts.push('— NÃO explicar como fazer, ENTREGAR pronto');

  return {
    intencao_real: parts.join(' '),
    modo,
    complexidade,
    tipo_entrega,
    contexto_suficiente,
    informacoes_faltantes,
    sugestao_proativa,
    confidence: Math.min(0.95, confidence),
  };
}

// ═══════════════════════════════════════════════════════════════════
// ROLE ASSIGNMENT (inspirado em Eduaide e OpenAI)
// ═══════════════════════════════════════════════════════════════════

function buildRoleAssignment(entities: DeepIntentEntities): string {
  const parts: string[] = ['Você é um professor brasileiro experiente'];

  if (entities.componente) {
    parts[0] += ` de ${entities.componente}`;
  }

  if (entities.nivel_ensino === 'fundamental_1') {
    parts.push('especialista em ensino para crianças dos anos iniciais');
    parts.push('usando linguagem lúdica, visual e acessível');
  } else if (entities.nivel_ensino === 'fundamental_2') {
    parts.push('especialista em adolescentes do ensino fundamental II');
    parts.push('usando exemplos do cotidiano e conexões com o mundo dos jovens');
  } else if (entities.nivel_ensino === 'medio') {
    parts.push('especialista em ensino médio e preparação para vestibulares');
    parts.push('usando abordagem crítica e contextualizada');
  }

  if (entities.faixa_etaria) {
    parts.push(`criando conteúdo adequado para alunos de ${entities.faixa_etaria}`);
  }

  if (entities.diferenciacao) {
    parts.push('com experiência em educação inclusiva e diferenciação pedagógica');
  }

  if (entities.palavras_chave_pedagogicas.length > 0) {
    parts.push(`aplicando: ${entities.palavras_chave_pedagogicas.join(', ')}`);
  }

  return parts.join(', ') + '.';
}

// ═══════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL: analyzeDeepIntent
// ═══════════════════════════════════════════════════════════════════

export function analyzeDeepIntent(message: string): DeepIntentResult {
  console.log(`🔬 [DeepIntentAnalyzer] Analisando: "${message.substring(0, 100)}..."`);

  const entities = extractEntities(message);

  const inference = inferIntencaoReal(message, entities);

  const role_assignment = buildRoleAssignment(entities);

  const result: DeepIntentResult = {
    entities,
    intencao_real: inference.intencao_real,
    modo: inference.modo,
    complexidade: inference.complexidade,
    tipo_entrega: inference.tipo_entrega,
    contexto_suficiente: inference.contexto_suficiente,
    informacoes_faltantes: inference.informacoes_faltantes,
    role_assignment,
    sugestao_proativa: inference.sugestao_proativa,
    raw_message: message,
    confidence: inference.confidence,
  };

  console.log(`🔬 [DeepIntentAnalyzer] Resultado:`, {
    modo: result.modo,
    tipo_entrega: result.tipo_entrega,
    complexidade: result.complexidade,
    serie: entities.serie,
    componente: entities.componente,
    temas: entities.temas,
    cronograma: entities.cronograma?.tipo,
    quantidade: entities.quantidade_atividades,
    confidence: result.confidence,
    intencao_real: result.intencao_real.substring(0, 120),
  });

  return result;
}

export function formatDeepIntentForPlanner(intent: DeepIntentResult): string {
  const sections: string[] = [];

  sections.push(`═══ ANÁLISE PROFUNDA DE INTENÇÃO ═══`);
  sections.push(`INTENÇÃO REAL: ${intent.intencao_real}`);
  sections.push(`MODO: ${intent.modo} | COMPLEXIDADE: ${intent.complexidade} | TIPO: ${intent.tipo_entrega}`);

  if (intent.entities.serie || intent.entities.turma) {
    sections.push(`TURMA/SÉRIE: ${intent.entities.serie || ''} ${intent.entities.turma || ''}`);
  }
  if (intent.entities.componente) {
    sections.push(`COMPONENTE: ${intent.entities.componente}`);
  }
  if (intent.entities.temas.length > 0) {
    sections.push(`TEMAS: ${intent.entities.temas.join(', ')}`);
  }
  if (intent.entities.cronograma) {
    sections.push(`CRONOGRAMA: ${intent.entities.cronograma.tipo}${intent.entities.cronograma.dias ? ` (${intent.entities.cronograma.dias} dias)` : ''} — ${intent.entities.cronograma.periodo || ''}`);
  }
  if (intent.entities.quantidade_atividades) {
    sections.push(`QUANTIDADE: ${intent.entities.quantidade_atividades} materiais solicitados`);
  }
  if (intent.entities.diferenciacao) {
    sections.push(`⚡ DIFERENCIAÇÃO SOLICITADA`);
  }
  if (intent.entities.bncc_habilidades.length > 0) {
    sections.push(`BNCC: ${intent.entities.bncc_habilidades.join(', ')}`);
  }
  if (intent.entities.palavras_chave_pedagogicas.length > 0) {
    sections.push(`PEDAGOGIA: ${intent.entities.palavras_chave_pedagogicas.join(', ')}`);
  }

  sections.push(`\nROLE ASSIGNMENT: ${intent.role_assignment}`);

  if (intent.modo === 'EXECUTIVO') {
    sections.push(`\n🔴 PROTOCOLO EXECUTIVO ATIVADO:`);
    sections.push(`- Contexto suficiente: ${intent.contexto_suficiente ? 'SIM → EXECUTAR IMEDIATAMENTE' : 'PARCIAL → executar com o que tem, NÃO perguntar'}`);
    if (intent.informacoes_faltantes.length > 0) {
      sections.push(`- Info faltante (inferir automaticamente): ${intent.informacoes_faltantes.join(', ')}`);
    }
    sections.push(`- REGRA: Gere TODO o conteúdo solicitado. NÃO pare no meio. NÃO explique como fazer.`);
  }

  if (intent.sugestao_proativa) {
    sections.push(`\n💡 SUGESTÃO PROATIVA: ${intent.sugestao_proativa}`);
  }

  return sections.join('\n');
}

export default analyzeDeepIntent;

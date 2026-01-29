/**
 * CONTROLE DE APIs GERAIS - SCHOOL POWER
 * 
 * v2.0 - INTEGRADO COM LLM ORCHESTRATOR v3.0 ENTERPRISE
 * 
 * Este módulo agora é um WRAPPER do LLM Orchestrator v3.0, mantendo
 * a mesma API pública para compatibilidade com os 16+ arquivos que o importam.
 * 
 * Arquitetura Unificada:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ LLM ORCHESTRATOR v3.0 ENTERPRISE                            │
 * ├─────────────────────────────────────────────────────────────┤
 * │ TIER 1 (Ultra-Fast): llama-3.1-8b, gemma2-9b               │
 * │ TIER 2 (Fast): llama-3.3-70b, mixtral-8x7b, llama3-70b     │
 * │ TIER 3 (Balanced): llama-3-tool-use, llama-4-scout         │
 * │ TIER 4 (Powerful): gemini-2.5-flash, gemini-2.0-flash      │
 * │ TIER 5 (Local): Fallback local que NUNCA FALHA             │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Sistemas de Proteção:
 * - Circuit Breaker por modelo (threshold: 5, cooldown: 60s)
 * - Rate Limiter por provider (Groq: 30/min, Gemini: 15/min)
 * - Retry com backoff exponencial (3 tentativas)
 * - Cache in-memory (TTL: 5min, max: 200 entradas)
 */

import { geminiLogger } from '@/utils/geminiDebugLogger';
import { 
  generateContent, 
  getOrchestratorStats,
  getCacheStats as getOrchestratorCacheStats,
  clearCache as clearOrchestratorCache,
  getActiveModels as getOrchestratorModels,
  LLM_MODELS,
  type GenerateContentOptions,
} from '@/services/llm-orchestrator';

// ============================================================================
// CONFIGURAÇÃO DE APIs
// ============================================================================

export interface APIModel {
  id: string;
  name: string;
  provider: 'groq' | 'gemini' | 'local';
  endpoint: string;
  maxTokens: number;
  contextWindow: number;
  priority: number;
  isActive: boolean;
}

export const API_MODELS_CASCADE: APIModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 128000,
    priority: 1,
    isActive: true,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 128000,
    priority: 2,
    isActive: true,
  },
  {
    id: 'llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 128000,
    priority: 3,
    isActive: true,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    maxTokens: 8192,
    contextWindow: 1000000,
    priority: 4,
    isActive: true,
  },
];

// ============================================================================
// CONFIGURAÇÃO GLOBAL
// ============================================================================

export const API_CONFIG = {
  timeout: 30000,
  maxRetriesPerModel: 2,
  retryDelay: 1000,
  exponentialBackoff: true,
};

// ============================================================================
// SISTEMA DE CACHE IN-MEMORY - Performance Engineering
// ============================================================================

interface CacheEntry {
  data: string;
  model: string;
  provider: string;
  timestamp: number;
  hitCount: number;
}

const CACHE_CONFIG = {
  MAX_ENTRIES: 100,
  TTL_MS: 5 * 60 * 1000,
  MIN_PROMPT_LENGTH_FOR_CACHE: 50,
};

const responseCache = new Map<string, CacheEntry>();

function generateCacheKey(prompt: string): string {
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `cache_${hash.toString(36)}`;
}

function getCachedResponse(prompt: string): CacheEntry | null {
  if (prompt.length < CACHE_CONFIG.MIN_PROMPT_LENGTH_FOR_CACHE) return null;
  
  const key = generateCacheKey(prompt);
  const entry = responseCache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_CONFIG.TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  
  entry.hitCount++;
  console.log(`⚡ [CACHE] Hit para query (${entry.hitCount}x usado)`);
  return entry;
}

function setCacheResponse(prompt: string, data: string, model: string, provider: string): void {
  if (prompt.length < CACHE_CONFIG.MIN_PROMPT_LENGTH_FOR_CACHE) return;
  if (!data || data.length < 10) return;
  
  if (responseCache.size >= CACHE_CONFIG.MAX_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  
  const key = generateCacheKey(prompt);
  responseCache.set(key, {
    data,
    model,
    provider,
    timestamp: Date.now(),
    hitCount: 0,
  });
  console.log(`💾 [CACHE] Resposta armazenada (${responseCache.size} entradas)`);
}

// ============================================================================
// CLASSIFICADOR DE COMPLEXIDADE - Roteamento Inteligente
// ============================================================================

type QueryComplexity = 'simple' | 'moderate' | 'complex';

function classifyQueryComplexity(prompt: string): QueryComplexity {
  const wordCount = prompt.split(/\s+/).length;
  const hasCodeKeywords = /\b(código|code|implementar|algoritmo|função|class|script)\b/i.test(prompt);
  const hasComplexKeywords = /\b(analise|análise|compare|avalie|profundo|detalhado|completo|extenso)\b/i.test(prompt);
  const hasSimpleKeywords = /\b(o que é|defina|liste|enumere|quanto|quando|onde|quem)\b/i.test(prompt);
  
  if (hasSimpleKeywords && wordCount < 30 && !hasComplexKeywords) {
    return 'simple';
  }
  
  if (hasCodeKeywords || hasComplexKeywords || wordCount > 150) {
    return 'complex';
  }
  
  return 'moderate';
}

function getOptimalModelForComplexity(complexity: QueryComplexity): string[] {
  switch (complexity) {
    case 'simple':
      return ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];
    case 'moderate':
      return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    case 'complex':
      return ['llama-3.3-70b-versatile', 'gemini-2.0-flash'];
  }
}

// ============================================================================
// VALIDAÇÃO DE INPUT - Proteção e Sanitização
// ============================================================================

const INPUT_CONFIG = {
  MAX_PROMPT_LENGTH: 8000,
};

function validateAndSanitizePrompt(prompt: string): { valid: boolean; sanitized: string; error?: string } {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, sanitized: '', error: 'Prompt inválido' };
  }
  
  const trimmed = prompt.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'Prompt vazio' };
  }
  
  if (trimmed.length > INPUT_CONFIG.MAX_PROMPT_LENGTH) {
    return {
      valid: true,
      sanitized: trimmed.substring(0, INPUT_CONFIG.MAX_PROMPT_LENGTH) + '...[truncado]',
    };
  }
  
  return { valid: true, sanitized: trimmed };
}

// ============================================================================
// TIPOS
// ============================================================================

export interface APICallResult {
  success: boolean;
  data: string | null;
  model: string;
  provider: string;
  error?: string;
  latency?: number;
  tokensUsed?: number;
}

export interface CascadeResult {
  success: boolean;
  data: string | null;
  modelUsed: string;
  providerUsed: string;
  attemptsMade: number;
  errors: Array<{ model: string; error: string }>;
  totalLatency: number;
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function getGroqApiKey(): string {
  return (import.meta.env.VITE_GROQ_API_KEY || '').trim();
}

function getGeminiApiKey(): string {
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

function validateApiKey(key: string, provider: string): boolean {
  if (!key) return false;
  if (provider === 'groq') return key.startsWith('gsk_') && key.length > 10;
  if (provider === 'gemini') return key.length > 10;
  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CHAMADAS ESPECÍFICAS POR PROVIDER
// ============================================================================

async function callGroqAPI(
  model: APIModel,
  prompt: string,
  apiKey: string
): Promise<APICallResult> {
  const startTime = Date.now();
  
  console.log(`🚀 [GROQ] Tentando modelo: ${model.name}`);
  
  try {
    const response = await fetch(model.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: Math.min(model.maxTokens, 7000),
      }),
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [GROQ] ${model.name} falhou: ${response.status}`);
      
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'groq',
        error: `HTTP ${response.status}: ${errorText}`,
        latency,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'groq',
        error: 'Resposta vazia da API',
        latency,
      };
    }

    console.log(`✅ [GROQ] ${model.name} respondeu em ${latency}ms`);

    return {
      success: true,
      data: content,
      model: model.id,
      provider: 'groq',
      latency,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [GROQ] ${model.name} erro: ${errorMessage}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'groq',
      error: errorMessage,
      latency,
    };
  }
}

async function callGeminiAPI(
  model: APIModel,
  prompt: string,
  apiKey: string
): Promise<APICallResult> {
  const startTime = Date.now();
  
  console.log(`🚀 [GEMINI] Tentando modelo: ${model.name}`);
  
  try {
    const url = `${model.endpoint}?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: model.maxTokens,
        },
      }),
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [GEMINI] ${model.name} falhou: ${response.status}`);
      
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'gemini',
        error: `HTTP ${response.status}: ${errorText}`,
        latency,
      };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'gemini',
        error: 'Resposta vazia da API',
        latency,
      };
    }

    console.log(`✅ [GEMINI] ${model.name} respondeu em ${latency}ms`);

    return {
      success: true,
      data: content,
      model: model.id,
      provider: 'gemini',
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [GEMINI] ${model.name} erro: ${errorMessage}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'gemini',
      error: errorMessage,
      latency,
    };
  }
}

// ============================================================================
// FALLBACK LOCAL (NUNCA FALHA)
// ============================================================================

/**
 * Detecta se o prompt é para uma atividade de texto (plano-aula, sequencia-didatica, tese-redacao)
 * e extrai informações contextuais do prompt
 */
function detectTextVersionPrompt(prompt: string): {
  isTextVersion: boolean;
  activityType: 'plano-aula' | 'sequencia-didatica' | 'tese-redacao' | null;
  tema: string;
  disciplina: string;
  serie: string;
  duracao: string;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  // Detectar tipo de atividade
  let activityType: 'plano-aula' | 'sequencia-didatica' | 'tese-redacao' | null = null;
  if (lowerPrompt.includes('plano de aula') || lowerPrompt.includes('plano-aula') || 
      lowerPrompt.includes('criar um plano') || lowerPrompt.includes('plano detalhado')) {
    activityType = 'plano-aula';
  } else if (lowerPrompt.includes('sequência didática') || lowerPrompt.includes('sequencia didatica') ||
             lowerPrompt.includes('sequencia-didatica')) {
    activityType = 'sequencia-didatica';
  } else if (lowerPrompt.includes('tese') || lowerPrompt.includes('redação') || lowerPrompt.includes('redacao') ||
             lowerPrompt.includes('tese-redacao')) {
    activityType = 'tese-redacao';
  }
  
  // Extrair tema - procurar padrões comuns
  let tema = 'Tema não especificado';
  const temaPatterns = [
    /tema[:\s]+["']?([^"\n,]+)["']?/i,
    /tema central[:\s]+["']?([^"\n,]+)["']?/i,
    /sobre\s+["']?([^"\n,]+?)["']?(?:\s+para|\s+de|\s+em|\s*$)/i,
    /assunto[:\s]+["']?([^"\n,]+)["']?/i,
  ];
  for (const pattern of temaPatterns) {
    const match = prompt.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      tema = match[1].trim();
      break;
    }
  }
  
  // Extrair disciplina
  let disciplina = 'Não especificada';
  const disciplinaPatterns: { pattern: RegExp; name: string }[] = [
    { pattern: /matem[aá]tica/i, name: 'Matemática' },
    { pattern: /portugu[eê]s/i, name: 'Português' },
    { pattern: /l[ií]ngua portuguesa/i, name: 'Língua Portuguesa' },
    { pattern: /ci[eê]ncias/i, name: 'Ciências' },
    { pattern: /hist[oó]ria/i, name: 'História' },
    { pattern: /geografia/i, name: 'Geografia' },
    { pattern: /f[ií]sica/i, name: 'Física' },
    { pattern: /qu[ií]mica/i, name: 'Química' },
    { pattern: /biologia/i, name: 'Biologia' },
    { pattern: /ingl[eê]s/i, name: 'Inglês' },
    { pattern: /educa[çc][aã]o f[ií]sica/i, name: 'Educação Física' },
    { pattern: /artes/i, name: 'Artes' },
    { pattern: /filosofia/i, name: 'Filosofia' },
    { pattern: /sociologia/i, name: 'Sociologia' },
    { pattern: /literatura/i, name: 'Literatura' },
  ];
  for (const { pattern, name } of disciplinaPatterns) {
    if (pattern.test(prompt)) {
      disciplina = name;
      break;
    }
  }
  
  // Também verificar campo explícito de disciplina
  const disciplinaMatch = prompt.match(/disciplina[:\s]+["']?([^"\n,]+)["']?/i);
  if (disciplinaMatch && disciplinaMatch[1] && disciplinaMatch[1].length > 2) {
    disciplina = disciplinaMatch[1].trim();
  }
  
  // Extrair série
  let serie = 'Não especificada';
  const seriePatterns = [
    /(\d+)[ºª°]\s*ano/i,
    /ensino\s+(fundamental|m[eé]dio)/i,
    /s[eé]rie[:\s]+["']?([^"\n,]+)["']?/i,
    /ano[:\s]+["']?(\d+[ºª°]?\s*(?:ano)?)/i,
  ];
  for (const pattern of seriePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      if (match[1] && /^\d+$/.test(match[1])) {
        serie = `${match[1]}º ano`;
      } else if (match[1]) {
        serie = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      }
      break;
    }
  }
  
  // Extrair duração
  let duracao = '50 minutos';
  const duracaoMatch = prompt.match(/dura[çc][aã]o[:\s]+["']?([^"\n,]+)["']?/i);
  if (duracaoMatch && duracaoMatch[1]) {
    duracao = duracaoMatch[1].trim();
  }
  
  return {
    isTextVersion: activityType !== null,
    activityType,
    tema,
    disciplina,
    serie,
    duracao
  };
}

/**
 * Gera um plano de aula local completo e detalhado
 */
function generateLocalPlanoAula(tema: string, disciplina: string, serie: string, duracao: string): string {
  console.log(`📝 [LOCAL] Gerando plano de aula local para: ${tema}`);
  
  return `# Plano de Aula: ${tema} (${serie})

**Disciplina:** ${disciplina} | **Série/Ano:** ${serie} | **Duração:** ${duracao}

---

## Objetivo Geral

Proporcionar aos alunos uma compreensão abrangente sobre ${tema}, desenvolvendo habilidades de análise crítica, interpretação e aplicação prática dos conceitos fundamentais relacionados ao tema, promovendo a construção ativa do conhecimento e a participação engajada durante todo o processo de aprendizagem.

## Objetivos Específicos

• Compreender os conceitos fundamentais relacionados a ${tema} e sua importância no contexto educacional
• Analisar as diferentes perspectivas e abordagens sobre o tema proposto
• Aplicar os conhecimentos adquiridos na resolução de situações-problema contextualizadas
• Desenvolver habilidades de trabalho colaborativo e comunicação efetiva
• Relacionar o conteúdo estudado com situações do cotidiano dos alunos
• Construir argumentos fundamentados para discussões sobre o tema

## Metodologia

A aula será conduzida utilizando uma abordagem ativa de ensino-aprendizagem, combinando:

• **Exposição dialogada:** Apresentação dos conceitos com constante interação e questionamentos
• **Aprendizagem colaborativa:** Atividades em pequenos grupos para discussão e construção coletiva
• **Resolução de problemas:** Situações-problema contextualizadas para aplicação prática
• **Uso de recursos visuais:** Apresentações, vídeos e materiais de apoio para facilitar a compreensão

## Recursos e Materiais

• Quadro branco ou lousa e marcadores/giz
• Projetor multimídia e computador
• Apresentação de slides sobre ${tema}
• Material impresso com atividades e exercícios
• Folhas de papel sulfite para anotações
• Canetas, lápis e borracha
• Materiais específicos relacionados ao tema

## Plano de Aula Detalhado

### 1. Introdução e Contextualização (10 minutos)

**Acolhimento e motivação inicial:**
Inicie a aula cumprimentando os alunos e criando um ambiente receptivo. Faça perguntas motivadoras para despertar o interesse:

• "O que vocês já sabem sobre ${tema}?"
• "Onde vocês já viram ou ouviram falar sobre esse assunto?"
• "Por que vocês acham que é importante estudar ${tema}?"

**Levantamento de conhecimentos prévios:**
Registre as respostas dos alunos no quadro, criando um mapa conceitual inicial. Isso ajuda a identificar o que já sabem e o que precisam aprender, além de valorizar as experiências prévias dos estudantes.

**Apresentação dos objetivos:**
Explique claramente o que será estudado na aula e quais são os objetivos de aprendizagem esperados. Isso ajuda os alunos a compreenderem o propósito da aula e aumenta o engajamento.

### 2. Desenvolvimento do Conteúdo (25 minutos)

**Exposição dialogada (15 minutos):**

Apresente os conceitos principais relacionados a ${tema} de forma clara e organizada:

• Inicie pelos conceitos mais básicos, construindo gradualmente para os mais complexos
• Utilize exemplos concretos e próximos da realidade dos alunos
• Faça pausas estratégicas para verificar a compreensão
• Incentive perguntas e comentários dos alunos

**Pontos-chave a abordar sobre ${tema}:**

1. Definição e conceitos fundamentais do tema
2. Contexto histórico e evolução do conhecimento sobre o assunto
3. Principais características e elementos importantes
4. Relações com outros conteúdos já estudados
5. Aplicações práticas no cotidiano

**Exemplos práticos e analogias:**

• Apresente situações reais que exemplifiquem os conceitos teóricos
• Use comparações com elementos familiares aos alunos
• Demonstre a aplicabilidade do conteúdo em diferentes contextos

**Atividade interativa (10 minutos):**

Divida a turma em pequenos grupos (3-4 alunos) e proponha uma atividade de discussão:

• Cada grupo recebe um tema relacionado a ${tema} para discussão
• Os grupos devem registrar suas principais conclusões
• Ao final, cada grupo apresenta brevemente suas ideias

### 3. Atividade Prática (10 minutos)

**Exercício de aplicação:**

Distribua uma folha de atividades com exercícios práticos sobre ${tema}:

• Questões de múltipla escolha para verificar compreensão básica
• Questões discursivas para desenvolvimento de argumentação
• Situações-problema para aplicação dos conceitos

**Orientações para a atividade:**

• Explique claramente as instruções antes de iniciar
• Circule pela sala auxiliando os alunos com dificuldades
• Incentive a colaboração entre colegas
• Observe as principais dúvidas para esclarecimento posterior

### 4. Discussão e Conclusão (5 minutos)

**Correção coletiva:**
Corrija as principais questões da atividade com participação da turma, esclarecendo dúvidas e reforçando conceitos importantes.

**Síntese do conteúdo:**
Recapitule os principais pontos abordados na aula, destacando:

• Os conceitos fundamentais sobre ${tema}
• As conexões com o cotidiano dos alunos
• A importância do tema para o desenvolvimento acadêmico

**Encerramento:**
Finalize a aula respondendo dúvidas finais e apresentando uma prévia do próximo conteúdo a ser estudado.

## Avaliação

A avaliação será contínua e formativa, considerando:

• **Participação:** Engajamento nas discussões e atividades propostas (30%)
• **Atividade prática:** Resolução dos exercícios e situações-problema (40%)
• **Trabalho em grupo:** Colaboração e contribuição nas atividades coletivas (30%)

**Instrumentos de avaliação:**
• Observação direta durante as atividades
• Correção das atividades escritas
• Autoavaliação dos alunos sobre seu aprendizado

## Observações e Dicas para o Professor

• Adapte o ritmo da aula conforme a resposta da turma
• Prepare materiais extras para alunos que terminarem as atividades antes
• Considere as diferentes formas de aprendizagem dos alunos
• Mantenha um ambiente acolhedor que incentive a participação
• Utilize exemplos atuais e relevantes para o contexto dos alunos
• Tenha um plano B caso os recursos tecnológicos falhem

**Sugestões de adaptação:**
• Para turmas com mais tempo: inclua uma atividade de pesquisa adicional
• Para turmas com menos tempo: foque nos conceitos essenciais
• Para alunos com dificuldades: ofereça materiais de apoio simplificados

---
*Plano de aula gerado automaticamente. Adapte conforme necessário para sua turma.*`;
}

function generateLocalFallback(prompt: string): string {
  console.log('🔄 [LOCAL] Gerando fallback local...');
  
  // DETECTAR SE É UMA ATIVIDADE DE TEXTO (plano-aula, sequencia-didatica, tese-redacao)
  const detection = detectTextVersionPrompt(prompt);
  
  if (detection.isTextVersion && detection.activityType === 'plano-aula') {
    console.log('📝 [LOCAL] Detectado prompt de PLANO DE AULA - gerando Markdown');
    console.log('📝 [LOCAL] Contexto extraído:', {
      tema: detection.tema,
      disciplina: detection.disciplina,
      serie: detection.serie,
      duracao: detection.duracao
    });
    
    return generateLocalPlanoAula(
      detection.tema,
      detection.disciplina,
      detection.serie,
      detection.duracao
    );
  }
  
  // Para outros tipos de texto, retornar formato compatível
  if (detection.isTextVersion && detection.activityType === 'sequencia-didatica') {
    console.log('📝 [LOCAL] Detectado prompt de SEQUÊNCIA DIDÁTICA');
    // Retornar JSON compatível para sequencia-didatica (não modificar fluxo)
  }
  
  if (detection.isTextVersion && detection.activityType === 'tese-redacao') {
    console.log('📝 [LOCAL] Detectado prompt de TESE/REDAÇÃO');
    // Retornar JSON compatível para tese-redacao (não modificar fluxo)
  }
  
  // Fallback padrão para outras atividades
  const defaultActivities = [
    {
      id: 'lista-exercicios',
      title: 'Lista de Exercícios Personalizada',
      description: 'Lista de exercícios baseada no contexto fornecido.',
      duration: '30 min',
      difficulty: 'Médio',
      category: 'Exercícios',
      type: 'activity',
    },
    {
      id: 'resumo',
      title: 'Resumo do Conteúdo',
      description: 'Resumo estruturado do tema solicitado.',
      duration: '20 min',
      difficulty: 'Fácil',
      category: 'Resumo',
      type: 'activity',
    },
    {
      id: 'mapa-mental',
      title: 'Mapa Mental',
      description: 'Organização visual dos conceitos principais.',
      duration: '25 min',
      difficulty: 'Médio',
      category: 'Organização',
      type: 'activity',
    },
    {
      id: 'flash-cards',
      title: 'Flash Cards para Revisão',
      description: 'Cards de memorização para estudo.',
      duration: '15 min',
      difficulty: 'Fácil',
      category: 'Revisão',
      type: 'activity',
    },
    {
      id: 'quiz-interativo',
      title: 'Quiz Interativo',
      description: 'Questionário gamificado para fixação.',
      duration: '20 min',
      difficulty: 'Médio',
      category: 'Avaliação',
      type: 'activity',
    },
  ];

  return JSON.stringify(defaultActivities);
}

// ============================================================================
// FUNÇÃO PRINCIPAL: CASCATA DE FALLBACK
// ============================================================================

/**
 * Executa chamada com fallback em cascata usando LLM Orchestrator v3.0 Enterprise.
 * 
 * Esta função agora é um WRAPPER do LLM Orchestrator v3.0, mantendo
 * a mesma API pública para compatibilidade com os 16+ arquivos que a importam.
 * 
 * O Orchestrator v3.0 oferece:
 * - 10 modelos em 5 tiers de fallback
 * - Circuit breaker por modelo
 * - Rate limiter por provider
 * - Cache in-memory otimizado
 * - Smart routing por complexidade
 * - Fallback local que NUNCA FALHA
 */
export async function executeWithCascadeFallback(
  prompt: string,
  options?: {
    skipModels?: string[];
    maxAttempts?: number;
    onProgress?: (status: string) => void;
    userId?: string;
    bypassCache?: boolean;
    activityType?: 'general' | 'lista-exercicios' | 'quiz-interativo' | 'flash-cards' | 'plano-aula' | 'sequencia-didatica' | 'tese-redacao' | 'quadro-interativo';
  }
): Promise<CascadeResult> {
  const startTime = Date.now();
  
  // DEPRECATED OPTIONS LOG - estas opções agora são gerenciadas pelo orchestrator
  if (options?.skipModels?.length) {
    console.warn('⚠️ [CASCADE v2.0] DEPRECATED: skipModels não é mais suportado. O orchestrator gerencia modelos automaticamente.');
  }
  if (options?.maxAttempts) {
    console.warn('⚠️ [CASCADE v2.0] DEPRECATED: maxAttempts não é mais suportado. O orchestrator usa todos os tiers disponíveis.');
  }
  
  console.log('🎯 [CASCADE v2.0] Delegando para LLM Orchestrator v3.0 Enterprise...');
  
  // Log para debug com userId se fornecido
  geminiLogger.logRequest(prompt, { 
    cascade: true, 
    orchestrator: 'v3.0',
    activityType: options?.activityType || 'general',
    userId: options?.userId,
  });

  try {
    // Delegar para o LLM Orchestrator v3.0
    const orchestratorOptions: GenerateContentOptions = {
      activityType: options?.activityType || 'general',
      onProgress: options?.onProgress,
      skipCache: options?.bypassCache,
    };

    const result = await generateContent(prompt, orchestratorOptions);

    // Log de sucesso
    geminiLogger.logResponse({ 
      model: result.model, 
      success: result.success,
      provider: result.provider,
    }, Date.now() - startTime);

    // Converter resultado do orchestrator para CascadeResult
    return {
      success: result.success,
      data: result.data,
      modelUsed: result.model,
      providerUsed: result.provider,
      attemptsMade: result.attemptsMade,
      errors: result.errors.map(e => ({ model: e.model, error: e.error })),
      totalLatency: Date.now() - startTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ [CASCADE v2.0] Erro inesperado:', errorMessage);
    
    // Fallback de emergência (nunca deveria chegar aqui)
    const localData = generateLocalFallback(prompt);
    
    return {
      success: true,
      data: localData,
      modelUsed: 'local-emergency-fallback',
      providerUsed: 'local',
      attemptsMade: 0,
      errors: [{ model: 'orchestrator', error: errorMessage }],
      totalLatency: Date.now() - startTime,
    };
  }
}

// ============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

/**
 * Gera plano de ação educacional com fallback garantido.
 */
export async function generateEducationalPlan(
  prompt: string,
  onProgress?: (status: string) => void
): Promise<{ data: string; model: string; provider: string }> {
  const result = await executeWithCascadeFallback(prompt, { onProgress });
  
  return {
    data: result.data || '[]',
    model: result.modelUsed,
    provider: result.providerUsed,
  };
}

/**
 * Gera conteúdo de atividade específica com fallback garantido.
 */
export async function generateActivityContent(
  prompt: string,
  onProgress?: (status: string) => void
): Promise<{ data: string; model: string; provider: string }> {
  const result = await executeWithCascadeFallback(prompt, { onProgress });
  
  return {
    data: result.data || '',
    model: result.modelUsed,
    provider: result.providerUsed,
  };
}

/**
 * Verifica status das APIs disponíveis.
 * Agora usa dados do LLM Orchestrator v3.0 para consistência.
 */
export function getAPIStatus(): {
  groq: { configured: boolean; modelsAvailable: number };
  gemini: { configured: boolean };
  totalModels: number;
  orchestratorVersion: string;
} {
  const groqKey = getGroqApiKey();
  const geminiKey = getGeminiApiKey();
  
  // Usar modelos do orchestrator
  const orchestratorModels = getOrchestratorModels();
  const groqModels = orchestratorModels.filter(m => m.provider === 'groq');
  const geminiModels = orchestratorModels.filter(m => m.provider === 'gemini');
  
  return {
    groq: {
      configured: validateApiKey(groqKey, 'groq'),
      modelsAvailable: groqModels.length,
    },
    gemini: {
      configured: validateApiKey(geminiKey, 'gemini'),
    },
    totalModels: orchestratorModels.length,
    orchestratorVersion: '3.0',
  };
}

/**
 * Lista modelos disponíveis ordenados por prioridade.
 * Retorna modelos do LLM Orchestrator v3.0 convertidos para formato legado APIModel.
 * 
 * NOTA: Esta função agora reflete a configuração real do orchestrator,
 * não mais a lista estática API_MODELS_CASCADE.
 */
export function getAvailableModels(): APIModel[] {
  const orchestratorModels = getOrchestratorModels();
  
  // Mapear modelos do orchestrator para formato legado APIModel
  return orchestratorModels
    .filter(m => m.isActive)
    .map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider as 'groq' | 'gemini' | 'local',
      endpoint: m.endpoint,
      maxTokens: m.maxTokens,
      contextWindow: m.contextWindow,
      priority: m.priority,
      isActive: m.isActive,
    }))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Lista modelos do LLM Orchestrator v3.0 (formato novo com tier e bestFor).
 */
export function getOrchestratorAvailableModels() {
  return getOrchestratorModels();
}

/**
 * @deprecated Use getAvailableModels() que agora usa dados do orchestrator.
 * Mantido apenas para referência legacy.
 */
export const LEGACY_API_MODELS_CASCADE = API_MODELS_CASCADE;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

/**
 * Retorna estatísticas do cache para monitoramento.
 * Combina cache local e cache do orchestrator.
 */
export function getCacheStats(): {
  entries: number;
  maxEntries: number;
  ttlMs: number;
  orchestratorCache: ReturnType<typeof getOrchestratorCacheStats>;
} {
  return {
    entries: responseCache.size,
    maxEntries: CACHE_CONFIG.MAX_ENTRIES,
    ttlMs: CACHE_CONFIG.TTL_MS,
    orchestratorCache: getOrchestratorCacheStats(),
  };
}

/**
 * Limpa o cache manualmente (útil para debug).
 * Limpa tanto o cache local quanto o cache do orchestrator.
 */
export function clearCache(): void {
  responseCache.clear();
  clearOrchestratorCache();
  console.log('🧹 [CACHE] Cache local e orchestrator limpos manualmente');
}

export default {
  executeWithCascadeFallback,
  generateEducationalPlan,
  generateActivityContent,
  getAPIStatus,
  getAvailableModels,
  getOrchestratorAvailableModels,
  getCacheStats,
  clearCache,
  // Legacy exports (deprecated - usar getAvailableModels() que agora usa orchestrator)
  API_MODELS_CASCADE,
  LEGACY_API_MODELS_CASCADE,
  API_CONFIG,
  CACHE_CONFIG,
  INPUT_CONFIG,
};

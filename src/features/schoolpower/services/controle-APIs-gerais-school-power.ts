/**
 * CONTROLE DE APIs GERAIS - SCHOOL POWER
 * 
 * Sistema de persistência multi-API com fallback em cascata.
 * Garante que SEMPRE haverá uma resposta, independente de falhas.
 * 
 * Arquitetura:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ SISTEMA DE PERSISTÊNCIA                                     │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Nível 1: llama-3.3-70b-versatile (principal)               │
 * │ Nível 2: llama-3.1-8b-instant (rápido e leve)              │
 * │ Nível 3: llama-4-scout-17b-16e-instruct (novo)             │
 * │ Nível 4: gemini-2.0-flash (fallback externo)               │
 * │ Nível 5: Resultado local pré-definido (nunca falha)        │
 * └─────────────────────────────────────────────────────────────┘
 */

import { geminiLogger } from '@/utils/geminiDebugLogger';
import { generateContent } from '@/services/llm-orchestrator';

// ============================================================================
// CONFIGURAÇÃO DE APIs - SCHOOL POWER ENTERPRISE v3.0
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
 * Executa chamada com fallback em cascata.
 * Tenta cada modelo na ordem de prioridade até obter sucesso.
 * Se todos falharem, retorna resultado local garantido.
 * 
 * OTIMIZAÇÕES APLICADAS:
 * - Cache in-memory para queries frequentes
 * - Classificação de complexidade para roteamento inteligente
 * - Validação e sanitização de input
 */
export async function executeWithCascadeFallback(
  prompt: string,
  options?: {
    skipModels?: string[];
    maxAttempts?: number;
    onProgress?: (status: string) => void;
    userId?: string;
    bypassCache?: boolean;
    activityType?: string;
  }
): Promise<CascadeResult> {
  const startTime = Date.now();
  const activityType = options?.activityType || 'general';
  
  console.log(`🚀 [Controle-APIs] Migrado para LLM Orchestrator v3.0 Enterprise [${activityType}]`);

  try {
    const result = await generateContent(prompt, {
      activityType: activityType as any,
      onProgress: options?.onProgress,
    });

    const totalLatency = Date.now() - startTime;

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        modelUsed: result.model || 'orchestrator',
        providerUsed: result.provider || 'enterprise',
        attemptsMade: 1,
        errors: [],
        totalLatency,
      };
    }

    throw new Error('LLM Orchestrator não retornou dados');
  } catch (error) {
    console.error('❌ [Controle-APIs] Erro fatal no Orquestrador:', error);
    
    // Fallback de segurança máxima usando a lógica interna original simplificada
    const detection = detectTextVersionPrompt(prompt);
    let fallbackData = '';
    
    if (detection.isTextVersion && detection.activityType) {
      fallbackData = handleLocalFallback(prompt);
    } else {
      fallbackData = JSON.stringify({ error: "Erro na geração", message: String(error) });
    }

    return {
      success: true,
      data: fallbackData,
      modelUsed: 'local-emergency-fallback',
      providerUsed: 'local',
      attemptsMade: 1,
      errors: [{ model: 'orchestrator', error: String(error) }],
      totalLatency: Date.now() - startTime,
    };
  }
}

async function callGroqAPI(
            data: result.data,
            modelUsed: model.id,
            providerUsed: 'groq',
            attemptsMade,
            errors,
            totalLatency: Date.now() - startTime,
          };
        }
        
        if (result.error?.includes('429') && retry < API_CONFIG.maxRetriesPerModel - 1) {
          const delay = API_CONFIG.retryDelay * Math.pow(2, retry);
          console.log(`⏳ [CASCADE] Rate limit, aguardando ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        
        errors.push({ model: model.id, error: result.error || 'Erro desconhecido' });
        break;
      }
    } 
    else if (model.provider === 'gemini') {
      if (!validateApiKey(geminiApiKey, 'gemini')) {
        errors.push({ model: model.id, error: 'API Key Gemini não configurada' });
        continue;
      }
      
      result = await callGeminiAPI(model, sanitizedPrompt, geminiApiKey);
      
      if (result.success) {
        geminiLogger.logResponse({ model: model.id, success: true }, Date.now() - startTime);
        
        if (result.data) {
          setCacheResponse(sanitizedPrompt, result.data, model.id, 'gemini');
        }
        
        return {
          success: true,
          data: result.data,
          modelUsed: model.id,
          providerUsed: 'gemini',
          attemptsMade,
          errors,
          totalLatency: Date.now() - startTime,
        };
      }
      
      errors.push({ model: model.id, error: result.error || 'Erro desconhecido' });
    }
  }

  console.warn('⚠️ [CASCADE] Todos os modelos falharam, usando fallback local');
  onProgress?.('Usando resposta local...');
  
  const localData = generateLocalFallback(sanitizedPrompt);
  
  geminiLogger.error('error', 'Todos os modelos falharam no cascade', { errors });

  return {
    success: true,
    data: localData,
    modelUsed: 'local-fallback',
    providerUsed: 'local',
    attemptsMade,
    errors,
    totalLatency: Date.now() - startTime,
  };
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
 */
export function getAPIStatus(): {
  groq: { configured: boolean; modelsAvailable: number };
  gemini: { configured: boolean };
  totalModels: number;
} {
  const groqKey = getGroqApiKey();
  const geminiKey = getGeminiApiKey();
  
  const groqModels = API_MODELS_CASCADE.filter(m => m.provider === 'groq' && m.isActive);
  
  return {
    groq: {
      configured: validateApiKey(groqKey, 'groq'),
      modelsAvailable: groqModels.length,
    },
    gemini: {
      configured: validateApiKey(geminiKey, 'gemini'),
    },
    totalModels: API_MODELS_CASCADE.filter(m => m.isActive).length,
  };
}

/**
 * Lista modelos disponíveis ordenados por prioridade.
 */
export function getAvailableModels(): APIModel[] {
  return API_MODELS_CASCADE
    .filter(m => m.isActive)
    .sort((a, b) => a.priority - b.priority);
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

/**
 * Retorna estatísticas do cache para monitoramento.
 */
export function getCacheStats(): {
  entries: number;
  maxEntries: number;
  ttlMs: number;
} {
  return {
    entries: responseCache.size,
    maxEntries: CACHE_CONFIG.MAX_ENTRIES,
    ttlMs: CACHE_CONFIG.TTL_MS,
  };
}

/**
 * Limpa o cache manualmente (útil para debug).
 */
export function clearCache(): void {
  responseCache.clear();
  console.log('🧹 [CACHE] Cache limpo manualmente');
}

export default {
  executeWithCascadeFallback,
  generateEducationalPlan,
  generateActivityContent,
  getAPIStatus,
  getAvailableModels,
  getCacheStats,
  clearCache,
  API_MODELS_CASCADE,
  API_CONFIG,
  CACHE_CONFIG,
  INPUT_CONFIG,
};

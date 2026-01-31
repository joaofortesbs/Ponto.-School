// ============================================================================
// UNIFIED QUIZ PIPELINE v1.0.0 - Quiz Interativo Enterprise
// Solução robusta de 6 camadas para carregamento, normalização e validação
// Modelado em unified-exercise-pipeline.ts (Lista de Exercícios)
// ============================================================================

import { useChosenActivitiesStore } from '../../interface-chat-producao/stores/ChosenActivitiesStore';

// ============================================================================
// CAMADA 1 - INTERFACES E TIPOS UNIFICADOS
// ============================================================================

export interface UnifiedQuizQuestion {
  id: number;
  question: string;
  type: 'multipla-escolha' | 'verdadeiro-falso';
  options: string[];
  correctAnswer: string;
  explanation?: string;
  _source?: string;
  _validated?: boolean;
}

export interface UnifiedQuizResponse {
  success: boolean;
  title: string;
  description: string;
  questions: UnifiedQuizQuestion[];
  metadata: {
    totalQuestions: number;
    validQuestions: number;
    invalidQuestions: number;
    extractionMethod: string;
    timestamp: number;
    processingTimeMs?: number;
    theme?: string;
    subject?: string;
    schoolYear?: string;
    isFallback?: boolean;
  };
  errors?: string[];
  warnings?: string[];
}

export interface QuizLoadResult {
  data: any;
  source: 'localStorage' | 'store' | 'database' | 'fallback' | null;
  confidence: number;
}

// ============================================================================
// CAMADA 2 - CAMPOS RECONHECIDOS (Aliases em PT e EN)
// ============================================================================

const QUESTION_TEXT_FIELDS = ['question', 'texto', 'pergunta', 'text', 'enunciado'];
const OPTIONS_FIELDS = ['options', 'alternativas', 'alternatives', 'choices'];
const CORRECT_ANSWER_FIELDS = ['correctAnswer', 'resposta_correta', 'correct_answer', 'answer', 'respostaCorreta'];
const EXPLANATION_FIELDS = ['explanation', 'feedback', 'explicacao', 'explicação'];

// ============================================================================
// CAMADA 3 - UTILITÁRIOS DE EXTRAÇÃO E VALIDAÇÃO
// ============================================================================

function extractField(obj: any, fields: string[]): any {
  for (const field of fields) {
    if (obj && obj[field] !== undefined && obj[field] !== null && obj[field] !== '') {
      return obj[field];
    }
  }
  return undefined;
}

function isValidQuestion(q: any): boolean {
  if (!q || typeof q !== 'object') return false;
  
  const text = extractField(q, QUESTION_TEXT_FIELDS);
  const options = extractField(q, OPTIONS_FIELDS);
  const correct = extractField(q, CORRECT_ANSWER_FIELDS);
  
  if (!text || typeof text !== 'string' || text.trim().length < 5) return false;
  
  if (options && Array.isArray(options) && options.length >= 2) {
    return true;
  }
  
  if (q.type === 'verdadeiro-falso' && correct !== undefined) {
    return true;
  }
  
  return false;
}

function normalizeCorrectAnswer(answer: any, options: string[]): string {
  if (typeof answer === 'number') {
    if (answer >= 0 && answer < options.length) {
      return options[answer];
    }
    if (answer >= 1 && answer <= options.length) {
      return options[answer - 1];
    }
    return options[0] || 'A';
  }
  
  if (typeof answer === 'string') {
    const letterMatch = answer.match(/^[a-dA-D]$/);
    if (letterMatch) {
      const index = answer.toUpperCase().charCodeAt(0) - 65;
      if (index >= 0 && index < options.length) {
        return options[index];
      }
    }
    
    const found = options.find(opt => 
      opt.toLowerCase().includes(answer.toLowerCase()) ||
      answer.toLowerCase().includes(opt.toLowerCase())
    );
    if (found) return found;
    
    return answer;
  }
  
  return options[0] || 'A';
}

// ============================================================================
// CAMADA 4 - NORMALIZADOR DE QUESTÕES
// ============================================================================

export class QuizQuestionNormalizer {
  static normalize(rawQuestion: any, index: number, source: string): UnifiedQuizQuestion | null {
    try {
      const text = extractField(rawQuestion, QUESTION_TEXT_FIELDS);
      const rawOptions = extractField(rawQuestion, OPTIONS_FIELDS);
      const rawCorrect = extractField(rawQuestion, CORRECT_ANSWER_FIELDS);
      const explanation = extractField(rawQuestion, EXPLANATION_FIELDS);
      
      if (!text || typeof text !== 'string') {
        console.warn(`[QuizNormalizer] Questão ${index}: texto inválido`);
        return null;
      }
      
      const options = Array.isArray(rawOptions) 
        ? rawOptions.map(o => String(o).trim()).filter(o => o.length > 0)
        : [];
      
      const isVF = rawQuestion.type === 'verdadeiro-falso' || 
                   text.toLowerCase().includes('verdadeiro ou falso');
      
      const type = isVF ? 'verdadeiro-falso' : 'multipla-escolha';
      
      const correctAnswer = type === 'verdadeiro-falso'
        ? String(rawCorrect || 'verdadeiro')
        : normalizeCorrectAnswer(rawCorrect, options);
      
      return {
        id: rawQuestion.id || (index + 1),
        question: text.trim(),
        type,
        options: options.length > 0 ? options : ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
        correctAnswer,
        explanation: explanation ? String(explanation).trim() : undefined,
        _source: source,
        _validated: true
      };
    } catch (error) {
      console.error(`[QuizNormalizer] Erro ao normalizar questão ${index}:`, error);
      return null;
    }
  }
  
  static normalizeAll(questions: any[], source: string): UnifiedQuizQuestion[] {
    if (!Array.isArray(questions)) {
      console.warn('[QuizNormalizer] Input não é array');
      return [];
    }
    
    const normalized: UnifiedQuizQuestion[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!isValidQuestion(q)) {
        console.warn(`[QuizNormalizer] Questão ${i} inválida, pulando`);
        continue;
      }
      
      const normalizedQ = this.normalize(q, i, source);
      if (normalizedQ) {
        normalized.push(normalizedQ);
      }
    }
    
    console.log(`[QuizNormalizer] ${normalized.length}/${questions.length} questões normalizadas de ${source}`);
    return normalized;
  }
}

// ============================================================================
// CAMADA 5 - CARREGADOR UNIFICADO COM FALLBACKS
// ============================================================================

export class QuizDataLoader {
  static load(activityId: string): QuizLoadResult {
    console.log(`📦 [QuizDataLoader] Iniciando carregamento para: ${activityId}`);
    
    const result = this.tryLocalStorage(activityId);
    if (result.data) {
      console.log(`✅ [QuizDataLoader] Encontrado em localStorage (confiança: ${result.confidence})`);
      return result;
    }
    
    const storeResult = this.tryZustandStore(activityId);
    if (storeResult.data) {
      console.log(`✅ [QuizDataLoader] Encontrado em Zustand store (confiança: ${storeResult.confidence})`);
      return storeResult;
    }
    
    console.warn(`⚠️ [QuizDataLoader] Nenhuma fonte válida encontrada para ${activityId}`);
    return { data: null, source: null, confidence: 0 };
  }
  
  private static tryLocalStorage(activityId: string): QuizLoadResult {
    const keys = [
      `constructed_quiz-interativo_${activityId}`,
      `activity_${activityId}`
    ];
    
    for (const key of keys) {
      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        
        const parsed = JSON.parse(stored);
        const data = parsed.data || parsed;
        
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          return {
            data,
            source: 'localStorage',
            confidence: parsed.isFallback ? 0.5 : 0.9
          };
        }
      } catch (e) {
        console.warn(`[QuizDataLoader] Erro ao ler ${key}:`, e);
      }
    }
    
    return { data: null, source: null, confidence: 0 };
  }
  
  private static tryZustandStore(activityId: string): QuizLoadResult {
    try {
      const storeData = useChosenActivitiesStore.getState().getActivityById(activityId);
      if (!storeData) return { data: null, source: null, confidence: 0 };
      
      const paths = [
        storeData.dados_construidos?.generated_fields,
        storeData.dados_construidos,
        storeData.campos_preenchidos
      ];
      
      for (const path of paths) {
        if (path?.questions && Array.isArray(path.questions) && path.questions.length > 0) {
          return {
            data: path,
            source: 'store',
            confidence: 0.8
          };
        }
      }
    } catch (e) {
      console.warn('[QuizDataLoader] Erro ao ler Zustand store:', e);
    }
    
    return { data: null, source: null, confidence: 0 };
  }
}

// ============================================================================
// CAMADA 6 - PIPELINE UNIFICADO PRINCIPAL
// ============================================================================

export function processQuizWithUnifiedPipeline(
  activityId: string,
  originalData?: any
): UnifiedQuizResponse {
  const startTime = Date.now();
  console.log(`🔄 [UnifiedQuizPipeline] Processando quiz: ${activityId}`);
  
  const loadResult = QuizDataLoader.load(activityId);
  let rawQuestions: any[] = [];
  let source = loadResult.source || 'unknown';
  let title = 'Quiz Interativo';
  let description = 'Atividade de quiz';
  let metadata: any = {};
  
  if (loadResult.data) {
    rawQuestions = loadResult.data.questions || [];
    title = loadResult.data.title || loadResult.data.titulo || title;
    description = loadResult.data.description || description;
    metadata = {
      theme: loadResult.data.theme,
      subject: loadResult.data.subject,
      schoolYear: loadResult.data.schoolYear,
      isFallback: loadResult.data.isFallback
    };
  }
  
  if (rawQuestions.length === 0 && originalData) {
    console.log('[UnifiedQuizPipeline] Usando originalData como fallback');
    const dbData = originalData.campos || originalData;
    if (dbData?.questions && Array.isArray(dbData.questions)) {
      rawQuestions = dbData.questions;
      source = 'database';
      title = dbData.title || originalData.titulo || title;
      description = dbData.description || description;
    }
  }
  
  const normalizedQuestions = QuizQuestionNormalizer.normalizeAll(rawQuestions, source);
  
  const processingTime = Date.now() - startTime;
  
  const response: UnifiedQuizResponse = {
    success: normalizedQuestions.length > 0,
    title,
    description,
    questions: normalizedQuestions,
    metadata: {
      totalQuestions: rawQuestions.length,
      validQuestions: normalizedQuestions.length,
      invalidQuestions: rawQuestions.length - normalizedQuestions.length,
      extractionMethod: source,
      timestamp: Date.now(),
      processingTimeMs: processingTime,
      ...metadata
    },
    warnings: normalizedQuestions.length < rawQuestions.length 
      ? [`${rawQuestions.length - normalizedQuestions.length} questões inválidas foram filtradas`]
      : undefined
  };
  
  console.log(`✅ [UnifiedQuizPipeline] Concluído em ${processingTime}ms:`, {
    questions: normalizedQuestions.length,
    source,
    success: response.success
  });
  
  return response;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  extractField,
  isValidQuestion,
  normalizeCorrectAnswer
};

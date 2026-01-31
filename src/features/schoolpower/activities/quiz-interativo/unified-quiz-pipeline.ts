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
    
    // Aliases que podem conter as questões (IA pode retornar em diferentes formatos)
    const questionsAliases = ['questions', 'questoes', 'perguntas', 'quiz'];
    
    for (const key of keys) {
      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        
        const parsed = JSON.parse(stored);
        const data = parsed.data || parsed;
        
        console.log(`📦 [QuizDataLoader] Verificando ${key}:`, {
          hasData: !!data,
          dataKeys: data ? Object.keys(data) : [],
          hasQuestions: !!data?.questions,
          hasQuestoes: !!data?.questoes,
          hasPerguntas: !!data?.perguntas
        });
        
        // Buscar questões em qualquer alias reconhecido
        let questionsArray: any[] | null = null;
        let foundAlias = '';
        
        for (const alias of questionsAliases) {
          const value = data?.[alias];
          if (value && Array.isArray(value) && value.length > 0) {
            questionsArray = value;
            foundAlias = alias;
            break;
          }
          // Também verificar nested (ex: data.quiz.perguntas)
          if (alias === 'quiz' && value?.perguntas && Array.isArray(value.perguntas)) {
            questionsArray = value.perguntas;
            foundAlias = 'quiz.perguntas';
            break;
          }
          if (alias === 'quiz' && value?.questions && Array.isArray(value.questions)) {
            questionsArray = value.questions;
            foundAlias = 'quiz.questions';
            break;
          }
        }
        
        if (questionsArray && questionsArray.length > 0) {
          console.log(`✅ [QuizDataLoader] Encontrado ${questionsArray.length} questões via '${foundAlias}' em ${key}`);
          
          // Normalizar para o formato padrão (sempre 'questions')
          const normalizedData = {
            ...data,
            questions: questionsArray,
            _originalAlias: foundAlias,
            _loadedFrom: key
          };
          
          return {
            data: normalizedData,
            source: 'localStorage',
            confidence: parsed.isFallback ? 0.5 : 0.9
          };
        }
      } catch (e) {
        console.warn(`[QuizDataLoader] Erro ao ler ${key}:`, e);
      }
    }
    
    console.warn(`⚠️ [QuizDataLoader] Nenhuma questão encontrada no localStorage para ${activityId}`);
    return { data: null, source: null, confidence: 0 };
  }
  
  private static tryZustandStore(activityId: string): QuizLoadResult {
    const questionsAliases = ['questions', 'questoes', 'perguntas'];
    
    try {
      const storeData = useChosenActivitiesStore.getState().getActivityById(activityId);
      if (!storeData) {
        console.log(`📦 [QuizDataLoader] Store: Nenhum dado encontrado para ${activityId}`);
        return { data: null, source: null, confidence: 0 };
      }
      
      const paths = [
        { data: storeData.dados_construidos?.generated_fields, name: 'generated_fields' },
        { data: storeData.dados_construidos, name: 'dados_construidos' },
        { data: storeData.campos_preenchidos, name: 'campos_preenchidos' }
      ];
      
      for (const { data: path, name: pathName } of paths) {
        if (!path) continue;
        
        // Verificar cada alias possível
        for (const alias of questionsAliases) {
          const value = path[alias];
          if (value && Array.isArray(value) && value.length > 0) {
            console.log(`✅ [QuizDataLoader] Store: Encontrado ${value.length} questões via '${alias}' em ${pathName}`);
            
            // Normalizar para 'questions'
            const normalizedData = {
              ...path,
              questions: value,
              _originalAlias: alias,
              _loadedFrom: `store.${pathName}`
            };
            
            return {
              data: normalizedData,
              source: 'store',
              confidence: 0.8
            };
          }
        }
        
        // Verificar quiz.perguntas ou quiz.questions aninhado
        if (path.quiz?.perguntas && Array.isArray(path.quiz.perguntas) && path.quiz.perguntas.length > 0) {
          console.log(`✅ [QuizDataLoader] Store: Encontrado ${path.quiz.perguntas.length} questões via 'quiz.perguntas' em ${pathName}`);
          return {
            data: { ...path, questions: path.quiz.perguntas, _originalAlias: 'quiz.perguntas' },
            source: 'store',
            confidence: 0.8
          };
        }
        if (path.quiz?.questions && Array.isArray(path.quiz.questions) && path.quiz.questions.length > 0) {
          console.log(`✅ [QuizDataLoader] Store: Encontrado ${path.quiz.questions.length} questões via 'quiz.questions' em ${pathName}`);
          return {
            data: { ...path, questions: path.quiz.questions, _originalAlias: 'quiz.questions' },
            source: 'store',
            confidence: 0.8
          };
        }
      }
      
      console.log(`⚠️ [QuizDataLoader] Store: Dados encontrados mas sem questões válidas para ${activityId}`);
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
    
    // Reconhecer aliases também no banco de dados
    const dbAliases = ['questions', 'questoes', 'perguntas'];
    let foundQuestions: any[] | null = null;
    let foundAlias = '';
    
    for (const alias of dbAliases) {
      const value = dbData?.[alias];
      if (value && Array.isArray(value) && value.length > 0) {
        foundQuestions = value;
        foundAlias = alias;
        break;
      }
    }
    
    // Também verificar quiz.perguntas aninhado
    if (!foundQuestions && dbData?.quiz?.perguntas && Array.isArray(dbData.quiz.perguntas)) {
      foundQuestions = dbData.quiz.perguntas;
      foundAlias = 'quiz.perguntas';
    }
    if (!foundQuestions && dbData?.quiz?.questions && Array.isArray(dbData.quiz.questions)) {
      foundQuestions = dbData.quiz.questions;
      foundAlias = 'quiz.questions';
    }
    
    if (foundQuestions && foundQuestions.length > 0) {
      console.log(`✅ [UnifiedQuizPipeline] Banco de dados: ${foundQuestions.length} questões via '${foundAlias}'`);
      rawQuestions = foundQuestions;
      source = 'database';
      title = dbData.title || dbData.titulo || originalData.titulo || title;
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

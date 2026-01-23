import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Settings, FileText, Play, Download, Edit3, Copy, Save, BookOpen, GamepadIcon, PenTool, Calculator, Beaker, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { ConstructionActivity } from './types';
import { ActivityFormData } from './types/ActivityTypes';
import { useGenerateActivity } from './hooks/useGenerateActivity';
import { useActivityAutoLoad } from './hooks/useActivityAutoLoad';
import { getActivityCustomFields } from './utils/activityFieldMapping';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '@/features/schoolpower/activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuadroInterativoPreview from '@/features/schoolpower/activities/quadro-interativo/QuadroInterativoPreview';
import QuizInterativoPreview from '@/features/schoolpower/activities/quiz-interativo/QuizInterativoPreview';
import FlashCardsPreview from '@/features/schoolpower/activities/flash-cards/FlashCardsPreview';
import TeseRedacaoPreview from '@/features/schoolpower/activities/tese-redacao/TeseRedacaoPreview';
import { CheckCircle2 } from 'lucide-react';
import * as profileService from "@/services/profileService";
import * as activitiesApi from "@/services/activitiesApiService";
import {
  DefaultEditActivity,
  PlanoAulaEditActivity,
  SequenciaDidaticaEditActivity,
  ListaExerciciosEditActivity,
  TeseRedacaoEditActivity,
  FlashCardsEditActivity,
  QuizInterativoEditActivity,
  QuadroInterativoEditActivity
} from './components/EditFields';


/**
 * COMPONENTES DE EDIÇÃO ESPECÍFICOS
 * Extraídos para: src/features/schoolpower/construction/components/EditFields/
 * 
 * - DefaultEditActivity
 * - QuizInterativoEditActivity
 * - QuadroInterativoEditActivity
 * - SequenciaDidaticaEditActivity
 * - FlashCardsEditActivity
 * - TeseRedacaoEditActivity (em src/features/schoolpower/activities/tese-redacao/)
 */

export interface EditActivityModalHandle {
  open: (activityId: string, activityType: string, customFields?: Record<string, any>) => void;
  setFields: (formData: Record<string, any>) => void;
  build: () => Promise<{ success: boolean; result?: any; error?: string; storageKeys?: string[] }>;
  close: () => void;
  isOpen: () => boolean;
}

// Função para processar dados da lista de exercícios
const processExerciseListData = (formData: ActivityFormData, generatedContent: any) => {
  console.log('📋 [processExerciseListData] ====== INÍCIO DO PROCESSAMENTO ======');
  console.log('📋 [processExerciseListData] generatedContent recebido:', JSON.stringify(generatedContent, null, 2)?.substring(0, 1000));
  
  // PASSO 1: Extrair dados do wrapper { success, data } se existir
  let content = generatedContent;
  if (generatedContent?.success && generatedContent?.data) {
    console.log('📋 [processExerciseListData] Detectado wrapper { success, data }, extraindo...');
    content = generatedContent.data;
  } else if (generatedContent?.data) {
    console.log('📋 [processExerciseListData] Detectado .data sem success, extraindo...');
    content = generatedContent.data;
  }
  
  console.log('📋 [processExerciseListData] Conteúdo após extração:', {
    hasQuestoes: !!content?.questoes,
    questoesLength: content?.questoes?.length,
    hasQuestions: !!content?.questions,
    questionsLength: content?.questions?.length,
    hasContentQuestoes: !!content?.content?.questoes,
    isGeneratedByAI: content?.isGeneratedByAI
  });
  
  // PASSO 2: Buscar questões em múltiplos locais possíveis (prioridade para arrays não vazios)
  let questoes: any[] = [];
  
  // Tentar content.questoes primeiro
  if (Array.isArray(content?.questoes) && content.questoes.length > 0) {
    questoes = content.questoes;
    console.log('📋 [processExerciseListData] Questões encontradas em content.questoes:', questoes.length);
  }
  // Tentar content.questions
  else if (Array.isArray(content?.questions) && content.questions.length > 0) {
    questoes = content.questions;
    console.log('📋 [processExerciseListData] Questões encontradas em content.questions:', questoes.length);
  }
  // Tentar content.content.questoes (nested)
  else if (Array.isArray(content?.content?.questoes) && content.content.questoes.length > 0) {
    questoes = content.content.questoes;
    console.log('📋 [processExerciseListData] Questões encontradas em content.content.questoes:', questoes.length);
  }
  // Tentar content.content.questions (nested)
  else if (Array.isArray(content?.content?.questions) && content.content.questions.length > 0) {
    questoes = content.content.questions;
    console.log('📋 [processExerciseListData] Questões encontradas em content.content.questions:', questoes.length);
  }
  
  // PASSO 3: Validar que as questões têm conteúdo real (não são placeholders)
  const questoesValidas = questoes.filter((q: any) => {
    const enunciado = q?.enunciado || q?.statement || q?.question || '';
    const isPlaceholder = enunciado.includes('[Conteúdo será gerado pela IA]') || 
                          enunciado.includes('Questão simulada') ||
                          !enunciado.trim();
    if (isPlaceholder) {
      console.log('⚠️ [processExerciseListData] Questão placeholder detectada:', enunciado?.substring(0, 50));
    }
    return !isPlaceholder;
  });
  
  console.log('📋 [processExerciseListData] Questões válidas após filtro:', questoesValidas.length, 'de', questoes.length);
  
  // Se tivermos questões válidas, usar elas; senão usar todas (incluindo placeholders para mostrar algo)
  const questoesFinais = questoesValidas.length > 0 ? questoesValidas : questoes;
  
  // PASSO 4: Log detalhado da primeira questão para debug
  if (questoesFinais.length > 0) {
    console.log('📋 [processExerciseListData] Primeira questão:', JSON.stringify(questoesFinais[0], null, 2));
  }
  
  const resultado = {
    titulo: content?.titulo || formData.title,
    title: content?.titulo || formData.title,
    descricao: content?.descricao || formData.description,
    description: content?.descricao || formData.description,
    disciplina: content?.disciplina || formData.subject,
    subject: content?.disciplina || formData.subject,
    tema: content?.tema || formData.theme,
    theme: content?.tema || formData.theme,
    anoEscolaridade: content?.anoEscolaridade || formData.schoolYear,
    schoolYear: content?.anoEscolaridade || formData.schoolYear,
    numeroQuestoes: questoesFinais.length || content?.numeroQuestoes || formData.numberOfQuestions,
    numberOfQuestions: questoesFinais.length || content?.numeroQuestoes || formData.numberOfQuestions,
    dificuldade: content?.dificuldade || formData.difficultyLevel,
    difficultyLevel: content?.dificuldade || formData.difficultyLevel,
    tipoQuestoes: content?.tipoQuestoes || formData.questionModel,
    questionModel: content?.tipoQuestoes || formData.questionModel,
    objetivos: content?.objetivos || formData.objectives,
    objectives: content?.objetivos || formData.objectives,
    sources: formData.sources,
    materials: formData.materials,
    instructions: formData.instructions,
    evaluation: formData.evaluation,
    timeLimit: formData.timeLimit,
    context: formData.context,
    questoes: questoesFinais,
    questions: questoesFinais,
    content: {
      questoes: questoesFinais,
      questions: questoesFinais
    },
    isGeneratedByAI: content?.isGeneratedByAI !== undefined ? content.isGeneratedByAI : questoesValidas.length > 0,
    generatedAt: content?.generatedAt || new Date().toISOString()
  };
  
  console.log('📋 [processExerciseListData] ====== RESULTADO FINAL ======');
  console.log('📋 [processExerciseListData] Questões retornadas:', resultado.questoes.length);
  console.log('📋 [processExerciseListData] isGeneratedByAI:', resultado.isGeneratedByAI);
  
  return resultado;
};

interface EditActivityModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
  onSave: (activityData: any) => void;
  onUpdateActivity?: (activity: any) => Promise<void>;
}

interface ActivityFieldsProps {
  formData: ActivityFormData;
  onFieldChange: (field: keyof ActivityFormData, value: string) => void;
}

/**
 * Helper para converter valores para string antes de chamar .trim()
 * Resolve erros como "formData.quantidadeAulas?.trim is not a function"
 * quando campos numéricos são passados pela geração de conteúdo
 */
const safeToString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return String(value);
};

/**
 * Valida se um campo tem valor preenchido (funciona com strings e números)
 */
const hasValue = (value: any): boolean => {
  return safeToString(value).trim().length > 0;
};

// Função para obter ícone baseado no tipo de atividade
const getActivityIcon = (activityId: string) => {
  if (activityId.includes('lista-exercicios')) return BookOpen;
  if (activityId.includes('prova')) return FileText;
  if (activityId.includes('jogo')) return GamepadIcon;
  if (activityId.includes('apresentacao')) return Play;
  if (activityId.includes('redacao')) return PenTool;
  if (activityId.includes('matematica')) return Calculator;
  if (activityId.includes('ciencias')) return Beaker;
  if (activityId.includes('quadro-interativo')) return Settings;
  return GraduationCap;
};

/**
 * Modal de Edição de Atividades com Agente Interno de Execução
 * 
 * MODAL BRIDGE INTEGRATION:
 * Este componente expõe métodos via forwardRef para que o BuildController
 * possa acionar o modal programaticamente através do ModalBridge.
 */
const EditActivityModal = forwardRef<EditActivityModalHandle, EditActivityModalProps>(({
  isOpen,
  activity,
  onClose,
  onSave,
  onUpdateActivity
}, ref) => {
  const [programmaticActivity, setProgrammaticActivity] = useState<ConstructionActivity | null>(null);
  const [isProgrammaticOpen, setIsProgrammaticOpen] = useState(false);
  const buildPromiseRef = useRef<{
    resolve: (result: { success: boolean; result?: any; error?: string; storageKeys?: string[] }) => void;
    reject: (error: Error) => void;
  } | null>(null);
  
  const effectiveActivity = programmaticActivity || activity;
  const effectiveIsOpen = isProgrammaticOpen || isOpen;
  
  const buildFnRef = useRef<(() => Promise<any>) | null>(null);

  const collectLocalStorageKeys = useCallback((activityId: string, activityType: string): string[] => {
    const keys: string[] = [];
    const keysToCheck = [
      `constructed_${activityType}_${activityId}`,
      `activity_${activityId}`,
      `constructedActivities`,
      `quadro_interativo_data_${activityId}`
    ];
    keysToCheck.forEach(key => {
      if (key === 'constructedActivities') {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed[activityId]) {
              keys.push(`constructedActivities[${activityId}]`);
            }
          } catch {}
        }
      } else if (localStorage.getItem(key)) {
        keys.push(key);
      }
    });
    return keys;
  }, []);

  const injectFieldsIntoForm = useCallback((fields: Record<string, any>) => {
    console.log('📝 [EditActivityModal] SET_FIELDS chamado via ModalBridge:', Object.keys(fields));
    setFormData(prev => ({
      ...prev,
      title: fields.title || fields.titulo || prev.title,
      description: fields.description || fields.descricao || prev.description,
      subject: fields.subject || fields.disciplina || prev.subject,
      theme: fields.theme || fields.tema || fields.temaRedacao || prev.theme,
      schoolYear: fields.schoolYear || fields.anoSerie || fields.anoEscolaridade || prev.schoolYear,
      numberOfQuestions: fields.numberOfQuestions || fields.quantidadeQuestoes || prev.numberOfQuestions,
      difficultyLevel: fields.difficultyLevel || fields.nivelDificuldade || prev.difficultyLevel,
      questionModel: fields.questionModel || fields.formato || prev.questionModel,
      sources: fields.sources || fields.fontes || prev.sources,
      objectives: fields.objectives || fields.objetivo || fields.objetivosAprendizagem || prev.objectives,
      materials: fields.materials || fields.materiais || prev.materials,
      instructions: fields.instructions || fields.instrucoes || prev.instructions,
      evaluation: fields.evaluation || fields.avaliacao || prev.evaluation,
      timeLimit: fields.timeLimit || fields.tempoLimite || prev.timeLimit,
      context: fields.context || fields.contexto || prev.context,
      competencies: fields.competencies || fields.competencias || fields.bnccCompetencias || prev.competencies,
      tituloTemaAssunto: fields.tituloTemaAssunto || fields.theme || prev.tituloTemaAssunto,
      anoSerie: fields.anoSerie || fields.schoolYear || prev.anoSerie,
      disciplina: fields.disciplina || fields.subject || prev.disciplina,
      bnccCompetencias: fields.bnccCompetencias || fields.competencies || prev.bnccCompetencias,
      publicoAlvo: fields.publicoAlvo || prev.publicoAlvo,
      objetivosAprendizagem: fields.objetivosAprendizagem || fields.objectives || prev.objetivosAprendizagem,
      quantidadeAulas: fields.quantidadeAulas || prev.quantidadeAulas,
      quantidadeDiagnosticos: fields.quantidadeDiagnosticos || prev.quantidadeDiagnosticos,
      quantidadeAvaliacoes: fields.quantidadeAvaliacoes || prev.quantidadeAvaliacoes,
      cronograma: fields.cronograma || prev.cronograma,
      quadroInterativoCampoEspecifico: fields.quadroInterativoCampoEspecifico || fields.atividadeMostrada || prev.quadroInterativoCampoEspecifico,
      format: fields.format || fields.formato || prev.format,
      timePerQuestion: fields.timePerQuestion || prev.timePerQuestion,
      centralTheme: fields.centralTheme || fields.theme || prev.centralTheme,
      mainCategories: fields.mainCategories || prev.mainCategories,
      generalObjective: fields.generalObjective || fields.objectives || prev.generalObjective,
      evaluationCriteria: fields.evaluationCriteria || prev.evaluationCriteria,
      topicos: fields.topicos || prev.topicos,
      numberOfFlashcards: fields.numberOfFlashcards || prev.numberOfFlashcards,
      temaRedacao: fields.temaRedacao || fields.theme || prev.temaRedacao,
      objetivo: fields.objetivo || fields.objectives || prev.objetivo,
      nivelDificuldade: fields.nivelDificuldade || fields.difficultyLevel || prev.nivelDificuldade,
      competenciasENEM: fields.competenciasENEM || prev.competenciasENEM,
      contextoAdicional: fields.contextoAdicional || fields.context || prev.contextoAdicional
    }));
    console.log('✅ [EditActivityModal] Campos injetados no formulário');
  }, []);

  useImperativeHandle(ref, () => ({
    open: (activityId: string, activityType: string, customFields?: Record<string, any>) => {
      console.log('🌉 [EditActivityModal] OPEN chamado via ModalBridge:', activityId, activityType);
      const syntheticActivity: ConstructionActivity = {
        id: activityId,
        title: customFields?.title || activityId,
        personalizedTitle: customFields?.title || activityId,
        description: customFields?.description || '',
        personalizedDescription: customFields?.description || '',
        categoryId: activityType,
        categoryName: activityType,
        icon: 'FileText',
        tags: [],
        difficulty: customFields?.difficultyLevel || 'medium',
        estimatedTime: customFields?.timeLimit || '30 min',
        customFields: customFields || {},
        type: activityType,
        preenchidoAutomaticamente: true
      };
      setProgrammaticActivity(syntheticActivity);
      setIsProgrammaticOpen(true);
      console.log('📖 [EditActivityModal] Modal aberto programaticamente');
    },
    setFields: injectFieldsIntoForm,
    build: () => {
      console.log('🔨 [EditActivityModal] BUILD chamado via ModalBridge - acionando handleBuildActivity');
      return new Promise((resolve) => {
        buildPromiseRef.current = { resolve, reject: () => {} };
        setTimeout(() => {
          if (buildFnRef.current) {
            buildFnRef.current()
              .then(result => {
                console.log('✅ [EditActivityModal] Build programático concluído:', result ? 'sucesso' : 'sem resultado');
                const storageKeys = collectLocalStorageKeys(effectiveActivity?.id || '', effectiveActivity?.type || effectiveActivity?.id || '');
                resolve({ success: true, result, storageKeys });
              })
              .catch(error => {
                console.error('❌ [EditActivityModal] Erro no build programático:', error);
                resolve({ success: false, error: error.message });
              });
          } else {
            console.error('❌ [EditActivityModal] buildFnRef não disponível');
            resolve({ success: false, error: 'Função de build não inicializada' });
          }
        }, 100);
      });
    },
    close: () => {
      console.log('🔒 [EditActivityModal] CLOSE chamado via ModalBridge');
      setIsProgrammaticOpen(false);
      setProgrammaticActivity(null);
      buildPromiseRef.current = null;
    },
    isOpen: () => effectiveIsOpen
  }), [effectiveActivity, effectiveIsOpen, injectFieldsIntoForm, collectLocalStorageKeys]);

  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState<'editar' | 'preview'>('editar');

  // Estados do formulário
  // NOTA: Não inicializamos campos específicos como temaRedacao, objetivo, etc.
  // O hook useActivityAutoLoad irá preencher automaticamente quando os dados estiverem disponíveis
  const [formData, setFormData] = useState<ActivityFormData>({
    title: activity?.title || activity?.personalizedTitle || '',
    description: activity?.description || activity?.personalizedDescription || '',
    subject: activity?.customFields?.disciplina || '',
    theme: activity?.customFields?.tema || activity?.personalizedTitle || activity?.title || '',
    schoolYear: activity?.customFields?.anoEscolaridade || '',
    numberOfQuestions: activity?.customFields?.nivelDificuldade?.toLowerCase() || 'medium',
    difficultyLevel: activity?.customFields?.tempoLimite || '',
    questionModel: '',
    sources: '',
    objectives: activity?.description || activity?.personalizedDescription || '',
    materials: activity?.customFields?.fontes || '',
    instructions: activity?.customFields?.contextoAplicacao || '',
    evaluation: activity?.customFields?.modeloQuestoes || '',
    timeLimit: '',
    context: '',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: '',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: '',
    associatedExercises: '',
    knowledgeArea: '',
    complexityLevel: '',
    // Campos específicos para sequencia-didatica
    tituloTemaAssunto: '',
    anoSerie: '',
    disciplina: '',
    bnccCompetencias: '',
    publicoAlvo: '',
    objetivosAprendizagem: '',
    quantidadeAulas: '',
    quantidadeDiagnosticos: '',
    quantidadeAvaliacoes: '',
    cronograma: '',
    // Campos específicos para quadro-interativo
    quadroInterativoCampoEspecifico: activity?.customFields?.quadroInterativoCampoEspecifico || '',
    // Campos específicos para quiz-interativo
    format: '',
    timePerQuestion: '',
    // Campos específicos para mapa-mental
    centralTheme: '',
    mainCategories: '',
    generalObjective: '',
    evaluationCriteria: '',
    // Campos específicos para Flash Cards (novo)
    topicos: '',
    numberOfFlashcards: '10',
    // Campos específicos para Tese da Redação (SERÃO PREENCHIDOS PELO HOOK useActivityAutoLoad)
    temaRedacao: '',
    objetivo: '',
    nivelDificuldade: '',
    competenciasENEM: '',
    contextoAdicional: ''
  });

  // Estado para conteúdo gerado
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [quizInterativoContent, setQuizInterativoContent] = useState<any>(null);
  const [flashCardsContent, setFlashCardsContent] = useState<any>(null); // New state for Flash Cards content
  const [teseRedacaoContent, setTeseRedacaoContent] = useState<any>(null); // New state for Tese de Redação content
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Estado para controle de construção da atividade
  const [buildingStatus, setBuildingStatus] = useState({
    isBuilding: false,
    progress: 0,
    currentStep: ''
  });

  // Estado para uso interno da função generateActivityContent
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [builtContent, setBuiltContent] = useState<any>(null);

  const { toast } = useToast();

  // Hook para geração de atividades
  const {
    generateActivity,
    loadSavedContent,
    clearContent,
    isGenerating: isGeneratingDefault, // Renomeado para evitar conflito
  } = useGenerateActivity({
    activityId: activity?.id || '',
    activityType: activity?.id || ''
  });

  // Hook para carregamento automático de dados do localStorage
  const { formData: autoLoadedData, isLoading: isAutoLoading, error: autoLoadError } = useActivityAutoLoad(
    activity?.id || null,
    isOpen
  );

  // useEffect para aplicar dados carregados automaticamente ao formData
  useEffect(() => {
    if (autoLoadedData && !isAutoLoading && Object.keys(autoLoadedData).length > 0) {
      console.log('%c🔥 [MODAL] Aplicando dados do hook useActivityAutoLoad', 'background: #E91E63; color: white; font-size: 14px; padding: 5px; font-weight: bold; border-radius: 3px;', autoLoadedData);
      console.log('%c🔍 [MODAL] Estado ANTERIOR do formData:', 'background: #FF9800; color: white; font-size: 12px; padding: 5px;', formData);
      
      setFormData(prev => {
        const newFormData = {
          ...prev,
          ...autoLoadedData,
          // Garantir que campos vazios sejam sobrescritos
          ...(autoLoadedData.temaRedacao && { temaRedacao: autoLoadedData.temaRedacao }),
          ...(autoLoadedData.objetivo && { objetivo: autoLoadedData.objetivo }),
          ...(autoLoadedData.nivelDificuldade && { nivelDificuldade: autoLoadedData.nivelDificuldade }),
          ...(autoLoadedData.competenciasENEM && { competenciasENEM: autoLoadedData.competenciasENEM }),
          ...(autoLoadedData.contextoAdicional && { contextoAdicional: autoLoadedData.contextoAdicional })
        };
        
        console.log('%c📝 [MODAL] Estado NOVO do formData após merge:', 'background: #2196F3; color: white; font-size: 12px; padding: 5px;', newFormData);
        
        // Log específico para Tese de Redação
        if (activity?.id === 'tese-redacao') {
          console.log('%c📚 [MODAL - TESE] Campos da Tese de Redação aplicados:', 'background: #9C27B0; color: white; font-size: 14px; padding: 5px; font-weight: bold;');
          console.table({
            'Tema da Redação': newFormData.temaRedacao,
            'Objetivo': newFormData.objetivo,
            'Nível de Dificuldade': newFormData.nivelDificuldade,
            'Competências ENEM': newFormData.competenciasENEM,
            'Contexto Adicional': newFormData.contextoAdicional
          });
        }
        
        return newFormData;
      });
      
      console.log('%c✅ [MODAL] formData atualizado com dados auto-carregados!', 'background: #4CAF50; color: white; font-size: 14px; padding: 5px; font-weight: bold; border-radius: 3px;');
    }

    if (autoLoadError) {
      console.error('%c❌ [MODAL] Erro no auto-load:', 'color: red; font-weight: bold;', autoLoadError);
    }
  }, [autoLoadedData, isAutoLoading, autoLoadError, activity?.id]);

  // --- Estados e Funções para o Modal de Edição ---
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [isInQuestionView, setIsInQuestionView] = useState(false);

  // REMOVIDO: useEffect duplicado - a lógica de carregamento agora está centralizada no hook useActivityAutoLoad

  // useEffect para escutar eventos de dados salvos (Tese da Redação)
  useEffect(() => {
    if (activity?.id === 'tese-redacao') {
      const handleDataSaved = (event: CustomEvent) => {
        console.log('🔔 [MODAL] Evento de dados salvos recebido:', event.detail);

        const { formData: savedFormData } = event.detail;

        if (savedFormData) {
          setFormData(prev => ({
            ...prev,
            temaRedacao: savedFormData.temaRedacao || prev.temaRedacao,
            objetivo: savedFormData.objetivo || prev.objetivo,
            nivelDificuldade: savedFormData.nivelDificuldade || prev.nivelDificuldade,
            competenciasENEM: savedFormData.competenciasENEM || prev.competenciasENEM,
            contextoAdicional: savedFormData.contextoAdicional || prev.contextoAdicional
          }));

          console.log('✅ [MODAL] Form data atualizado com dados do evento');
        }
      };

      window.addEventListener('tese-redacao-data-saved', handleDataSaved as EventListener);

      return () => {
        window.removeEventListener('tese-redacao-data-saved', handleDataSaved as EventListener);
      };
    }
  }, [activity?.id]);

  // useEffect para escutar campos gerados pela capability gerar_conteudo_atividades
  useEffect(() => {
    const handleFieldsGenerated = (event: CustomEvent) => {
      const { activity_id, activity_type, fields, validation } = event.detail;
      
      // Verificar se o evento é para esta atividade
      if (activity_id !== activity?.id) return;
      
      console.log('%c🎯 [MODAL] Campos gerados recebidos para:', 'background: #4CAF50; color: white; padding: 2px 5px;', activity_id);
      console.log('   📋 Campos:', fields);
      console.log('   ✅ Validação:', validation);
      
      if (fields && typeof fields === 'object') {
        setFormData(prev => {
          const newFormData = { ...prev };
          
          // Mapear campos gerados para o formData (já sincronizados pelo gerar-conteudo-atividades)
          Object.entries(fields).forEach(([key, value]) => {
            if (key in newFormData && value !== undefined && value !== null && value !== '') {
              (newFormData as any)[key] = value;
            }
          });
          
          console.log('%c📝 [MODAL] FormData atualizado:', 'color: #2196F3;', newFormData);
          
          return newFormData;
        });
        
        // Mostrar toast de sucesso se campos foram preenchidos
        if (validation?.filledFields?.length > 0) {
          toast({
            title: "Campos preenchidos automaticamente",
            description: `${validation.filledFields.length} campo(s) preenchido(s) com sucesso`,
          });
        }
        
        console.log('✅ [MODAL] Form data atualizado com campos gerados automaticamente');
      }
    };

    window.addEventListener('agente-jota-fields-generated', handleFieldsGenerated as EventListener);

    return () => {
      window.removeEventListener('agente-jota-fields-generated', handleFieldsGenerated as EventListener);
    };
  }, [activity?.id, toast]);

  // Use isGeneratingDefault for the generic generate activity call
  const isGenerating = isGeneratingDefault;

  // Função para validar se o formulário está pronto para construção
  // Usa hasValue() para lidar corretamente com valores numéricos
  const isFormValidForBuild = useCallback(() => {
    const activityType = activity?.id || '';

    if (activityType === 'lista-exercicios') {
      return hasValue(formData.title) &&
             hasValue(formData.description) &&
             hasValue(formData.subject) &&
             hasValue(formData.theme) &&
             hasValue(formData.schoolYear) &&
             hasValue(formData.numberOfQuestions) &&
             hasValue(formData.difficultyLevel) &&
             hasValue(formData.questionModel);
    } else if (activityType === 'plano-aula') {
      return hasValue(formData.title) &&
             hasValue(formData.description) &&
             hasValue(formData.theme) &&
             hasValue(formData.schoolYear) &&
             hasValue(formData.subject) &&
             hasValue(formData.objectives) &&
             hasValue(formData.materials);
    } else if (activityType === 'sequencia-didatica') {
      return hasValue(formData.tituloTemaAssunto) &&
             hasValue(formData.anoSerie) &&
             hasValue(formData.disciplina) &&
             hasValue(formData.publicoAlvo) &&
             hasValue(formData.objetivosAprendizagem) &&
             hasValue(formData.quantidadeAulas) &&
             hasValue(formData.quantidadeDiagnosticos) &&
             hasValue(formData.quantidadeAvaliacoes);
    } else if (activityType === 'quiz-interativo') {
      const isValid = hasValue(formData.title) &&
                     hasValue(formData.description) &&
                     hasValue(formData.numberOfQuestions) &&
                     hasValue(formData.theme) &&
                     hasValue(formData.subject) &&
                     hasValue(formData.schoolYear) &&
                     hasValue(formData.difficultyLevel) &&
                     hasValue(formData.questionModel);

      console.log('🔍 Validação do Quiz Interativo:', {
        title: hasValue(formData.title),
        description: hasValue(formData.description),
        numberOfQuestions: hasValue(formData.numberOfQuestions),
        theme: hasValue(formData.theme),
        subject: hasValue(formData.subject),
        schoolYear: hasValue(formData.schoolYear),
        difficultyLevel: hasValue(formData.difficultyLevel),
        questionModel: hasValue(formData.questionModel),
        isValid
      });

      return isValid;
    } else if (activityType === 'quadro-interativo') {
      const isValid = hasValue(formData.title) &&
                     hasValue(formData.description) &&
                     hasValue(formData.subject) &&
                     hasValue(formData.schoolYear) &&
                     hasValue(formData.theme) &&
                     hasValue(formData.objectives) &&
                     hasValue(formData.difficultyLevel) &&
                     hasValue(formData.quadroInterativoCampoEspecifico);

      console.log('🔍 Validação do Quadro Interativo:', {
        title: hasValue(formData.title),
        description: hasValue(formData.description),
        subject: hasValue(formData.subject),
        schoolYear: hasValue(formData.schoolYear),
        theme: hasValue(formData.theme),
        objectives: hasValue(formData.objectives),
        difficultyLevel: hasValue(formData.difficultyLevel),
        quadroInterativoCampoEspecifico: hasValue(formData.quadroInterativoCampoEspecifico),
        isValid
      });

      return isValid;
    } else if (activityType === 'mapa-mental') {
      return hasValue(formData.title) &&
             hasValue(formData.centralTheme) &&
             hasValue(formData.mainCategories) &&
             hasValue(formData.generalObjective) &&
             hasValue(formData.evaluationCriteria);
    } else if (activityType === 'flash-cards') {
      const isValid = hasValue(formData.title) &&
                     hasValue(formData.theme) &&
                     hasValue(formData.topicos) &&
                     hasValue(formData.numberOfFlashcards);

      console.log('🔍 Validação do Flash Cards:', {
        title: hasValue(formData.title),
        theme: hasValue(formData.theme),
        topicos: hasValue(formData.topicos),
        numberOfFlashcards: hasValue(formData.numberOfFlashcards),
        isValid
      });

      return isValid;
    } else if (activityType === 'tese-redacao') {
      const isValid = hasValue(formData.title) &&
                     hasValue(formData.temaRedacao) &&
                     hasValue(formData.objetivo) &&
                     hasValue(formData.nivelDificuldade) &&
                     hasValue(formData.competenciasENEM);

      console.log('🔍 Validação da Tese da Redação:', {
        title: hasValue(formData.title),
        temaRedacao: hasValue(formData.temaRedacao),
        objetivo: hasValue(formData.objetivo),
        nivelDificuldade: hasValue(formData.nivelDificuldade),
        competenciasENEM: hasValue(formData.competenciasENEM),
        isValid
      });

      return isValid;
    }
    else {
      return hasValue(formData.title) &&
             hasValue(formData.description) &&
             hasValue(formData.objectives);
    }
  }, [formData, activity?.id]);

  // --- Funções de Geração Específicas ---

  // Função para gerar conteúdo do Quiz Interativo
  const handleGenerateQuizInterativo = async () => {
    try {
      setIsGeneratingQuiz(true);
      setGenerationError(null);

      console.log('🎯 Iniciando geração real do Quiz Interativo');
      console.log('📋 FormData completo:', formData);

      // Validar dados obrigatórios (usando safeToString para lidar com números)
      if (!hasValue(formData.title)) {
        throw new Error('Título é obrigatório');
      }
      if (!hasValue(formData.theme)) {
        throw new Error('Tema é obrigatório');
      }
      if (!hasValue(formData.subject)) {
        throw new Error('Disciplina é obrigatória');
      }

      // Importar o gerador do Quiz Interativo
      const { QuizInterativoGenerator } = await import('@/features/schoolpower/activities/quiz-interativo/QuizInterativoGenerator');

      // Preparar dados estruturados para o gerador (usando safeToString para conversão segura)
      const quizData = {
        subject: safeToString(formData.subject).trim() || 'Matemática',
        schoolYear: safeToString(formData.schoolYear).trim() || '6º Ano - Ensino Fundamental',
        theme: safeToString(formData.theme).trim() || safeToString(formData.title).trim() || 'Tema Geral',
        objectives: safeToString(formData.objectives).trim() || safeToString(formData.description).trim() || `Avaliar o conhecimento sobre ${formData.theme}`,
        difficultyLevel: safeToString(formData.difficultyLevel).trim() || 'Médio',
        format: safeToString(formData.questionModel).trim() || 'Múltipla Escolha',
        numberOfQuestions: safeToString(formData.numberOfQuestions).trim() || '10',
        timePerQuestion: safeToString(formData.timePerQuestion).trim() || '60',
        instructions: safeToString(formData.instructions).trim() || 'Leia cada questão com atenção e selecione a resposta correta.',
        evaluation: safeToString(formData.evaluation).trim() || 'Avaliação baseada no número de respostas corretas.'
      };

      console.log('🎯 Dados estruturados para o Gemini:', quizData);
      console.log('📝 Estado atual do formData:', {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        theme: formData.theme,
        schoolYear: formData.schoolYear,
        numberOfQuestions: formData.numberOfQuestions,
        difficultyLevel: formData.difficultyLevel,
        questionModel: formData.questionModel,
        timePerQuestion: formData.timePerQuestion
      });


      // Validar campos críticos
      const requiredFields = ['subject', 'theme', 'numberOfQuestions'];
      for (const field of requiredFields) {
        if (!quizData[field as keyof typeof quizData]) {
          throw new Error(`Campo obrigatório não preenchido: ${field}`);
        }
      }

      // Criar instância do gerador e gerar conteúdo
      const generator = new QuizInterativoGenerator();
      const generatedContent = await generator.generateQuizContent(quizData);

      console.log('✅ Conteúdo gerado pela API Gemini:', generatedContent);

      // Validar conteúdo gerado
      if (!generatedContent.questions || generatedContent.questions.length === 0) {
        console.warn('⚠️ Conteúdo gerado sem questões, usando fallback');
        throw new Error('Nenhuma questão foi gerada pela API');
      }

      // Preparar conteúdo final com dados do formulário - ESTRUTURA CORRIGIDA
      const finalContent = {
        title: formData.title || generatedContent.title,
        description: formData.description || generatedContent.description,
        questions: generatedContent.questions, // CRÍTICO: Garantir que as questões sejam transferidas
        timePerQuestion: generatedContent.timePerQuestion || parseInt(quizData.timePerQuestion) || 60,
        totalQuestions: generatedContent.questions.length,
        subject: quizData.subject,
        schoolYear: quizData.schoolYear,
        theme: quizData.theme,
        format: quizData.format,
        difficultyLevel: quizData.difficultyLevel,
        objectives: quizData.objectives,
        instructions: quizData.instructions,
        evaluation: quizData.evaluation,
        generatedByAI: true,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: generatedContent.isGeneratedByAI || true,
        isFallback: false,
        formDataUsed: quizData
      };

      console.log('📦 Conteúdo final preparado:', finalContent);
      console.log('📝 Questões incluídas (CRÍTICO):', finalContent.questions);
      console.log('🔢 Total de questões:', finalContent.questions.length);

      // Salvar no localStorage com estrutura consistente
      const quizStorageKey = `constructed_quiz-interativo_${activity?.id}`;
      const storageData = {
        success: true,
        data: finalContent
      };

      localStorage.setItem(quizStorageKey, JSON.stringify(storageData));
      console.log('💾 Quiz Interativo salvo no localStorage:', quizStorageKey);

      // SINCRONIZAÇÃO ADICIONAL: Salvar também no cache de atividades construídas para modal de visualização
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity?.id] = {
        generatedContent: finalContent,
        timestamp: new Date().toISOString(),
        activityType: 'quiz-interativo'
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      console.log('💾 Quiz Interativo sincronizado com cache de atividades construídas');

      // SINCRONIZAÇÃO CRÍTICA: Atualizar todos os estados
      setQuizInterativoContent(finalContent);
      setGeneratedContent(finalContent); // Also update generic content for preview fallback
      setIsContentLoaded(true);

      // Validação detalhada da estrutura
      const validation = {
        hasQuestions: !!(finalContent.questions && finalContent.questions.length > 0),
        questionsCount: finalContent.questions?.length || 0,
        allQuestionsValid: finalContent.questions?.every(q =>
          q.question && q.options && q.options.length > 0 && q.correctAnswer
        ) || false,
        hasTitle: !!finalContent.title,
        hasTimePerQuestion: !!finalContent.timePerQuestion
      };

      console.log('🔍 Validação da estrutura final:', validation);

      if (!validation.hasQuestions || !validation.allQuestionsValid) {
        console.error('❌ Estrutura de dados inválida detectada:', finalContent);
        throw new Error('Dados gerados pela API estão incompletos ou malformados');
      }

      // Force update para garantir reatividade
      setTimeout(() => {
        console.log('🔄 Verificação de sincronização:', {
          quizInterativoContent: !!quizInterativoContent,
          generatedContent: !!generatedContent,
          questionsCount: finalContent.questions.length,
          validation,
          actualQuestions: finalContent.questions
        });

        // Force update com deep clone para garantir reatividade
        setQuizInterativoContent(JSON.parse(JSON.stringify(finalContent)));
        setGeneratedContent(JSON.parse(JSON.stringify(finalContent)));

        // Atualizar aba para mostrar preview
        setActiveTab('preview');
      }, 100);

      toast({
        title: "Quiz Gerado com Sucesso!",
        description: `${finalContent.questions.length} questões foram geradas pela IA do Gemini.`,
      });

    } catch (error) {
      console.error('❌ Erro ao gerar Quiz Interativo:', error);
      setGenerationError(`Erro ao gerar o conteúdo do quiz: ${error.message}`);

      // Criar conteúdo de fallback em caso de erro
      const fallbackContent = {
        title: formData.title || `Quiz: ${formData.theme}`,
        description: formData.description || `Quiz sobre ${formData.theme} (Modo Demonstração)`,
        questions: Array.from({ length: parseInt(formData.numberOfQuestions) || 5 }, (_, index) => ({
          id: index + 1,
          question: `Questão ${index + 1}: Sobre ${formData.theme} em ${formData.subject}, qual conceito é mais importante para o ${formData.schoolYear}?`,
          type: 'multipla-escolha' as const,
          options: [
            `A) Conceito básico de ${formData.theme}`,
            `B) Aplicação prática de ${formData.theme}`,
            `C) Teoria avançada de ${formData.theme}`,
            `D) Exercícios sobre ${formData.theme}`
          ],
          correctAnswer: `A) Conceito básico de ${formData.theme}`,
          explanation: `O conceito básico de ${formData.theme} é essencial para o entendimento em ${formData.subject} no ${formData.schoolYear}.`
        })),
        timePerQuestion: parseInt(formData.timePerQuestion) || 60,
        totalQuestions: parseInt(formData.numberOfQuestions) || 5,
        subject: formData.subject,
        schoolYear: formData.schoolYear,
        theme: formData.theme,
        format: formData.questionModel,
        difficultyLevel: formData.difficultyLevel,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false,
        isFallback: true
      };

      console.log('🛡️ Usando conteúdo de fallback:', fallbackContent);

      setQuizInterativoContent(fallbackContent);
      setGeneratedContent(fallbackContent); // Also update generic content for preview fallback
      setIsContentLoaded(true);
      setActiveTab('preview');

      toast({
        title: "Quiz Criado (Modo Demonstração)",
        description: "Foi criado um quiz de exemplo. Verifique a configuração da API para gerar conteúdo personalizado.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Função para gerar conteúdo de Flash Cards
  const handleGenerateFlashCards = useCallback(async () => {
    if (isBuilding) return; // Evitar múltiplas execuções simultâneas

    try {
      setIsBuilding(true);
      setGenerationError(null);
      setBuildProgress(0);

      console.log('🃏 Iniciando geração de Flash Cards...');

      // Validação de campos obrigatórios com mensagens mais claras (usando hasValue para tipos mistos)
      if (!hasValue(formData.theme)) {
        throw new Error('Tema é obrigatório para gerar Flash Cards');
      }

      if (!hasValue(formData.topicos)) {
        throw new Error('Tópicos são obrigatórios para gerar Flash Cards');
      }

      const numberOfCards = parseInt(safeToString(formData.numberOfFlashcards) || '10') || 10;
      if (numberOfCards <= 0 || numberOfCards > 50) {
        throw new Error('Número de Flash Cards deve estar entre 1 e 50');
      }

      // Progress timer
      const progressTimer = setInterval(() => {
        setBuildProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        // Importar o gerador de Flash Cards
        const { FlashCardsGenerator } = await import('@/features/schoolpower/activities/flash-cards/FlashCardsGenerator');

        // Preparar dados estruturados para o gerador com validação (usando safeToString para conversão segura)
        const flashCardData = {
          title: safeToString(formData.title).trim(),
          theme: safeToString(formData.theme).trim(),
          subject: safeToString(formData.subject).trim() || 'Geral',
          schoolYear: safeToString(formData.schoolYear).trim() || 'Ensino Médio',
          topicos: safeToString(formData.topicos).trim(),
          numberOfFlashcards: numberOfCards.toString(),
          contextoUso: safeToString(formData.contextoUso).trim() || safeToString(formData.context).trim() || 'Estudos e revisão',
          difficultyLevel: safeToString(formData.difficultyLevel).trim() || 'Médio',
          objectives: safeToString(formData.objectives).trim() || `Facilitar o aprendizado sobre ${safeToString(formData.theme).trim()}`,
          instructions: safeToString(formData.instructions).trim() || 'Use os flash cards para estudar e revisar o conteúdo',
          evaluation: safeToString(formData.evaluation).trim() || 'Avalie o conhecimento através da prática com os cards'
        };

        console.log('🃏 Dados preparados para geração:', flashCardData);

        // Criar instância do gerador e gerar conteúdo
        const generator = new FlashCardsGenerator();
        const generatedContent = await generator.generateFlashCardsContent(flashCardData);

        clearInterval(progressTimer);
        setBuildProgress(100);

        console.log('✅ Conteúdo gerado pela API Gemini:', generatedContent);

        // Validar conteúdo gerado
        if (!generatedContent?.cards || !Array.isArray(generatedContent.cards) || generatedContent.cards.length === 0) {
          throw new Error('Nenhum card válido foi gerado');
        }

        // Preparar conteúdo final
        const finalContent = {
          ...generatedContent,
          title: generatedContent.title || formData.title,
          description: generatedContent.description || formData.description || `Flash cards sobre ${formData.theme}`,
          generatedByAI: true,
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
          isFallback: false,
          formDataUsed: flashCardData
        };

        console.log('📦 Conteúdo final preparado:', finalContent);

        // Salvar no localStorage
        const flashCardsStorageKey = `constructed_flash-cards_${activity?.id}`;
        const storageData = {
          success: true,
          data: finalContent,
          timestamp: new Date().toISOString(),
          activityId: activity?.id
        };

        localStorage.setItem(flashCardsStorageKey, JSON.stringify(storageData));
        console.log('💾 Flash Cards salvos no localStorage:', flashCardsStorageKey);

        // Sincronização com cache de atividades
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity?.id || ''] = {
          generatedContent: finalContent,
          timestamp: new Date().toISOString(),
          activityType: 'flash-cards'
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

        // Atualizar estados de forma controlada
        setFlashCardsContent(finalContent);
        setGeneratedContent(finalContent);
        setBuiltContent(finalContent);
        setIsContentLoaded(true);

        // Ir para preview com delay
        setTimeout(() => {
          setActiveTab('preview');
        }, 100);

        toast({
          title: "Flash Cards Gerados com Sucesso!",
          description: `${finalContent.cards.length} flash cards foram gerados pela IA do Gemini.`,
        });

      } catch (apiError) {
        clearInterval(progressTimer);
        console.warn('⚠️ Erro na API, gerando fallback:', apiError);

        // Gerar conteúdo de fallback
        const topicos = formData.topicos?.split('\n').filter(t => t.trim()) || [];
        const maxCards = Math.min(numberOfCards, Math.max(topicos.length, 5));

        const fallbackCards = [];
        for (let i = 0; i < maxCards; i++) {
          const topic = topicos[i % topicos.length] || `Conceito ${i + 1} de ${formData.theme}`;

          fallbackCards.push({
            id: i + 1,
            front: `O que é ${topic.trim()}?`,
            back: `${topic.trim()} é um conceito importante em ${formData.subject || 'Geral'} que deve ser compreendido por estudantes do ${formData.schoolYear || 'ensino médio'}.`,
            category: formData.subject || 'Geral',
            difficulty: formData.difficultyLevel || 'Médio'
          });
        }

        const fallbackContent = {
          title: formData.title || `Flash Cards: ${formData.theme}`,
          description: formData.description || `Flash cards sobre ${formData.theme} (Modo Demonstração)`,
          cards: fallbackCards,
          totalCards: fallbackCards.length,
          theme: formData.theme,
          subject: formData.subject || 'Geral',
          schoolYear: formData.schoolYear || 'Ensino Médio',
          topicos: formData.topicos,
          numberOfFlashcards: fallbackCards.length,
          context: formData.context || 'Estudos e revisão',
          difficultyLevel: formData.difficultyLevel || 'Médio',
          objectives: formData.objectives || `Facilitar o aprendizado sobre ${formData.theme}`,
          instructions: formData.instructions || 'Use os flash cards para estudar e revisar o conteúdo',
          evaluation: formData.evaluation || 'Avalie o conhecimento através da prática com os cards',
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: false,
          isFallback: true
        };

        // Salvar fallback
        const flashCardsStorageKey = `constructed_flash-cards_${activity?.id}`;
        const storageData = {
          success: true,
          data: fallbackContent,
          timestamp: new Date().toISOString(),
          activityId: activity?.id,
          isFallback: true
        };

        localStorage.setItem(flashCardsStorageKey, JSON.stringify(storageData));

        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity?.id || ''] = {
          generatedContent: fallbackContent,
          timestamp: new Date().toISOString(),
          activityType: 'flash-cards'
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

        setFlashCardsContent(fallbackContent);
        setGeneratedContent(fallbackContent);
        setBuiltContent(fallbackContent);
        setIsContentLoaded(true);
        setActiveTab('preview');

        toast({
          title: "Flash Cards Criados (Modo Demonstração)",
          description: `Foi criado um conjunto de ${fallbackCards.length} flash cards de exemplo.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ Erro crítico ao gerar Flash Cards:', error);
      setGenerationError(`Erro ao gerar os flash cards: ${error.message}`);

      toast({
        title: "Erro na Geração",
        description: `Não foi possível gerar os flash cards: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsBuilding(false);
      setBuildProgress(0);
    }
  }, [formData, activity?.id, isBuilding, toast]);


  // Chamada genérica de geração (para outros tipos de atividade)
  const handleGenerate = async () => {
    if (!activity || isGenerating) return;

    const activityType = activity.type || activity.id || activity.categoryId;
    console.log(`🚀 Iniciando geração genérica para ${activityType}:`, formData);

    try {
      setIsGenerating(true);
      setError(null);
      setBuildProgress(0);

      const progressTimer = setInterval(() => {
        setBuildProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await generateActivity(formData); // Assuming generateActivity handles generic generation

      clearInterval(progressTimer);
      setBuildProgress(100);

      console.log('✅ Geração genérica concluída:', result);

      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = {
        generatedContent: result,
        timestamp: new Date().toISOString(),
        activityType: activityType
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      setGeneratedContent(result);
      setBuiltContent(result);
      setIsContentLoaded(true);
      setActiveTab('preview');

      toast({
        title: "Atividade Gerada!",
        description: "Sua atividade foi gerada com sucesso pela IA.",
      });

    } catch (error) {
      console.error('❌ Erro na geração genérica:', error);
      setError(`Erro ao gerar atividade: ${error.message}`);
      toast({
        title: "Erro na Geração",
        description: "Houve um problema ao gerar sua atividade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setBuildProgress(0);
    }
  };


  // Regenerar conteúdo específico para lista de exercícios
  const handleRegenerateContent = async () => {
    if (activity?.id === 'lista-exercicios') {
      try {
        const newContent = await generateActivity(formData); // Use the hook's generateActivity
        setGeneratedContent(newContent);
      } catch (error) {
        console.error('Erro ao regenerar conteúdo:', error);
        toast({
          title: "Erro ao regenerar",
          description: "Não foi possível regenerar o conteúdo. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  // Função para sincronizar dados instantaneamente
  const syncDataToStorage = useCallback((activityId: string, data: any) => {
    console.log('🔄 [SYNC] Sincronizando dados para:', activityId);
    
    // Salvar em múltiplas chaves para garantir acesso
    const storageKeys = [
      `activity_${activityId}`,
      `activity_${activityId}_fields`,
      `constructed_${activityId.split('_')[0]}_${activityId}`,
      `constructedActivities`
    ];

    storageKeys.forEach(key => {
      if (key === 'constructedActivities') {
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        existing[activityId] = {
          ...existing[activityId],
          ...data,
          lastSync: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(existing));
      } else {
        localStorage.setItem(key, JSON.stringify(data));
      }
    });

    // Disparar evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('activity-data-updated', {
      detail: { activityId, data }
    }));

    console.log('✅ [SYNC] Dados sincronizados com sucesso');
  }, []);

  // Sincronizar dados a cada alteração no formData
  useEffect(() => {
    if (!activity?.id || !isOpen) return;

    const syncTimeout = setTimeout(() => {
      const dataToSync = {
        title: formData.title,
        description: formData.description,
        customFields: {
          ...activity.customFields,
          ...formData
        },
        formData,
        lastUpdate: new Date().toISOString()
      };

      syncDataToStorage(activity.id, dataToSync);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(syncTimeout);
  }, [formData, activity?.id, isOpen, syncDataToStorage]);

  // Função para sincronizar dados instantaneamente com o modal de visualização
  const syncToViewModal = useCallback((data: any) => {
    const storageKey = `activity_${activity?.id}`;
    const viewSyncKey = `activity_view_sync_${activity?.id}`;
    
    // Salvar dados no localStorage
    localStorage.setItem(storageKey, JSON.stringify({
      ...data,
      lastSync: new Date().toISOString()
    }));
    
    // Disparar evento customizado para sincronização instantânea
    window.dispatchEvent(new CustomEvent('activity-data-sync', {
      detail: {
        activityId: activity?.id,
        data: data,
        timestamp: Date.now()
      }
    }));
    
    console.log('🔄 [SYNC] Dados sincronizados instantaneamente para modal de visualização');
  }, [activity?.id]);

  // Sincronizar dados sempre que formData ou conteúdo gerado mudar
  useEffect(() => {
    if (!activity?.id || !isOpen) return;

    const syncTimeout = setTimeout(() => {
      const dataToSync = {
        title: formData.title,
        description: formData.description,
        customFields: {
          ...activity.customFields,
          ...formData
        },
        generatedContent: generatedContent || quizInterativoContent || flashCardsContent || teseRedacaoContent,
        formData,
        lastUpdate: new Date().toISOString()
      };

      syncToViewModal(dataToSync);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(syncTimeout);
  }, [formData, generatedContent, quizInterativoContent, flashCardsContent, teseRedacaoContent, activity?.id, isOpen, syncToViewModal]);

  // Função para salvar alterações
  const handleSave = async () => {
    if (!activity) return;

    try {
      console.log('💾 Salvando alterações da atividade:', activity.id);
      console.log('📊 Dados do formulário:', formData);

      // Preparar dados da atividade atualizada
      const updatedActivity = {
        ...activity,
        title: formData.title,
        description: formData.description,
        customFields: {
          ...activity.customFields,
          // Mapear campos específicos baseado no tipo de atividade
          ...(activity.id === 'sequencia-didatica' && {
            'Título do Tema / Assunto': formData.tituloTemaAssunto,
            'Ano / Série': formData.anoSerie,
            'Disciplina': formData.disciplina,
            'BNCC / Competências': formData.bnccCompetencias,
            'Público-alvo': formData.publicoAlvo,
            'Objetivos de Aprendizagem': formData.objetivosAprendizagem,
            'Quantidade de Aulas': formData.quantidadeAulas,
            'Quantidade de Diagnósticos': formData.quantidadeDiagnosticos,
            'Quantidade de Avaliações': formData.quantidadeAvaliacoes,
            'Cronograma': formData.cronograma
          }),
          ...(activity.id === 'plano-aula' && {
            'Componente Curricular': formData.subject,
            'Tema ou Tópico Central': formData.theme,
            'Ano/Série Escolar': formData.schoolYear,
            'Habilidades BNCC': formData.competencies,
            'Objetivo Geral': formData.objectives,
            'Materiais/Recursos': formData.materials,
            'Perfil da Turma': formData.context,
            'Carga Horária': formData.timeLimit,
            'Tipo de Aula': formData.difficultyLevel,
            'Observações do Professor': formData.evaluation
          }),
          ...(activity.id === 'quiz-interativo' && {
            'Número de Questões': formData.numberOfQuestions,
            'Tema': formData.theme,
            'Disciplina': formData.subject,
            'Ano de Escolaridade': formData.schoolYear,
            'Nível de Dificuldade': formData.difficultyLevel,
            'Formato': formData.questionModel,
            'Objetivos': formData.objectives,
            'Tempo por Questão': formData.timePerQuestion
          }),
          ...(activity.id === 'quadro-interativo' && {
            'Disciplina / Área de conhecimento': formData.subject,
            'Ano / Série': formData.schoolYear,
            'Tema ou Assunto da aula': formData.theme,
            'Objetivo de aprendizagem da aula': formData.objectives,
            'Nível de Dificuldade': formData.difficultyLevel,
            'Atividade mostrada': formData.quadroInterativoCampoEspecifico
          }),
          ...(activity.id === 'flash-cards' && {
            'Tema dos Flash Cards': formData.theme,
            'Tópicos Principais': formData.topicos,
            'Número de Flash Cards': formData.numberOfFlashcards,
            'Contexto de Uso': formData.contextoUso
          }),
          ...(activity.id === 'mapa-mental' && {
            'Tema Central': formData.centralTheme,
            'Categorias Principais': formData.mainCategories,
            'Objetivo Geral': formData.generalObjective,
            'Critérios de Avaliação': formData.evaluationCriteria
          }),
          ...(activity.id === 'tese-redacao' && { // Mapeamento para Tese da Redação
            'Tema da Redação': formData.temaRedacao,
            'Objetivos': formData.objetivo,
            'Nível de Dificuldade': formData.nivelDificuldade,
            'Competências ENEM': formData.competenciasENEM,
            'Contexto Adicional': formData.contextoAdicional
          })
        },
        lastModified: new Date().toISOString()
      };

      // Salvar conteúdo gerado se existir
      const finalActivityData = {
        ...updatedActivity,
        ...(generatedContent && { generatedContent }),
        ...(quizInterativoContent && { quizInterativoContent }),
        ...(flashCardsContent && { flashCardsContent }),
        ...(teseRedacaoContent && { teseRedacaoContent })
      };

      // NOVA FUNCIONALIDADE: Salvar diretamente no banco Neon
      const profile = await profileService.getCurrentUserProfile();
      if (profile?.id) {
        console.log('🏦 Salvando atividade no banco Neon...');

        try {
          // Verificar se já existe no banco
          const existingActivities = await activitiesApi.getUserActivities(profile.id);
          let saveResult;

          if (existingActivities.success && existingActivities.data) {
            const existingActivity = existingActivities.data.find(
              act => act.tipo === activity.id
            );

            if (existingActivity) {
              // Atualizar atividade existente
              saveResult = await activitiesApi.updateActivity(existingActivity.codigo_unico, {
                titulo: finalActivityData.title,
                descricao: finalActivityData.description,
                conteudo: finalActivityData
              });
            } else {
              // Criar nova atividade
              saveResult = await activitiesApi.migrateFromLocalStorage(
                profile.id,
                finalActivityData,
                activity.id
              );
            }
          } else {
            // Criar nova atividade (primeira vez)
            saveResult = await activitiesApi.migrateFromLocalStorage(
              profile.id,
              finalActivityData,
              activity.id
            );
          }

          if (saveResult && saveResult.success) {
            console.log('✅ Atividade salva no banco Neon com sucesso');

            // Marcar como sincronizada no localStorage
            const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
            constructedActivities[activity.id] = {
              ...constructedActivities[activity.id],
              syncedToNeon: true,
              neonSyncAt: new Date().toISOString()
            };
            localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

          } else {
            console.warn('⚠️ Erro ao salvar no banco Neon, mantendo apenas no localStorage');
          }
        } catch (neonError) {
          console.error('❌ Erro na sincronização com Neon:', neonError);
          console.log('💾 Mantendo salvamento no localStorage como fallback');
        }
      }

      // Chamar função de callback para salvar (localStorage)
      if (onSave) {
        await onSave(finalActivityData);
      }

      // Atualizar atividade se a função estiver disponível
      if (onUpdateActivity) {
        await onUpdateActivity(finalActivityData);
      }

      toast({
        title: "Alterações Salvas!",
        description: "As modificações da atividade foram salvas com sucesso.",
      });

      console.log('✅ Atividade salva com sucesso:', finalActivityData);

    } catch (error) {
      console.error('❌ Erro ao salvar atividade:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Carregar conteúdo construído quando o modal abrir
  useEffect(() => {
    if (activity && isOpen) {
      console.log(`🔍 Verificando conteúdo construído para atividade: ${activity.id}`);
      console.log(`📋 Dados da atividade recebida:`, activity);

      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const savedContent = localStorage.getItem(`activity_${activity.id}`);
      const planoAulaSavedContent = localStorage.getItem(`constructed_plano-aula_${activity.id}`);
      const sequenciaDidaticaSavedContent = localStorage.getItem(`constructed_sequencia-didatica_${activity.id}`);
      const quadroInterativoSavedContent = localStorage.getItem(`constructed_quadro-interativo_${activity.id}`);
      const quadroInterativoSpecificData = localStorage.getItem(`quadro_interativo_data_${activity.id}`);
      const quizInterativoSavedContent = localStorage.getItem(`constructed_quiz-interativo_${activity.id}`);
      const flashCardsSavedContent = localStorage.getItem(`constructed_flash-cards_${activity.id}`);
      const teseRedacaoSavedContent = localStorage.getItem(`constructed_tese-redacao_${activity.id}`);

      let contentToLoad = null;
      if (activity.id === 'sequencia-didatica' && sequenciaDidaticaSavedContent) {
        try {
          contentToLoad = JSON.parse(sequenciaDidaticaSavedContent);
          console.log(`✅ Conteúdo específico da Sequência Didática encontrado para: ${activity.id}`);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico da Sequência Didática:', error);
        }
      } else if (activity.id === 'plano-aula' && planoAulaSavedContent) {
        try {
          contentToLoad = JSON.parse(planoAulaSavedContent);
          console.log(`✅ Conteúdo específico do plano-aula encontrado para: ${activity.id}`);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do plano-aula:', error);
        }
      } else if (activity.id === 'quadro-interativo' && (quadroInterativoSavedContent || quadroInterativoSpecificData)) {
        try {
          // Priorizar conteúdo construído específico
          if (quadroInterativoSavedContent) {
            contentToLoad = JSON.parse(quadroInterativoSavedContent);
            console.log(`✅ Conteúdo específico do quadro-interativo encontrado para: ${activity.id}`);
          } else if (quadroInterativoSpecificData) {
            contentToLoad = JSON.parse(quadroInterativoSpecificData);
            console.log(`✅ Dados específicos do quadro-interativo encontrados para: ${activity.id}`);
          }
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do Quadro Interativo:', error);
        }
      } else if (activity.id === 'quiz-interativo' && quizInterativoSavedContent) { // Check for Quiz Interativo content
        try {
          const parsedContent = JSON.parse(quizInterativoSavedContent);
          contentToLoad = parsedContent.data || parsedContent; // Handle both wrapped and direct data

          // Validar se o conteúdo tem questões
          if (contentToLoad && contentToLoad.questions && contentToLoad.questions.length > 0) {
            console.log(`✅ Conteúdo específico do Quiz Interativo encontrado para: ${activity.id}`, contentToLoad);
            console.log(`📝 ${contentToLoad.questions.length} questões carregadas`);
            setQuizInterativoContent(contentToLoad); // Set the specific state for Quiz Interativo
          } else {
            console.warn('⚠️ Conteúdo do Quiz encontrado mas sem questões válidas');
            contentToLoad = null;
          }
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico do Quiz Interativo:', error);
          contentToLoad = null;
        }
      } else if (activity.id === 'flash-cards' && flashCardsSavedContent) { // Check for Flash Cards content
        try {
          const parsedContent = JSON.parse(flashCardsSavedContent);
          contentToLoad = parsedContent.data || parsedContent;

          console.log('🃏 Flash Cards - Conteúdo parseado:', contentToLoad);

          // Validar se o conteúdo tem cards válidos
          const hasValidCards = contentToLoad &&
                               contentToLoad.cards &&
                               Array.isArray(contentToLoad.cards) &&
                               contentToLoad.cards.length > 0 &&
                               contentToLoad.cards.every(card =>
                                 card && card.front && card.back
                               );

          if (hasValidCards) {
            console.log(`✅ Conteúdo específico de Flash Cards encontrado para: ${activity.id}`, contentToLoad);
            console.log(`🃏 ${contentToLoad.cards.length} cards carregados`);
            setFlashCardsContent(contentToLoad); // Set the specific state for Flash Cards
          } else {
            console.warn('⚠️ Conteúdo de Flash Cards encontrado mas sem cards válidos:', {
              hasCards: !!(contentToLoad && contentToLoad.cards),
              isArray: Array.isArray(contentToLoad?.cards),
              cardsLength: contentToLoad?.cards?.length || 0,
              firstCard: contentToLoad?.cards?.[0]
            });
            contentToLoad = null;
          }
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico de Flash Cards:', error);
          contentToLoad = null;
        }
      } else if (activity.id === 'tese-redacao' && teseRedacaoSavedContent) { // Check for Tese de Redação content
        try {
          const parsedContent = JSON.parse(teseRedacaoSavedContent);
          contentToLoad = parsedContent.data || parsedContent;

          console.log('📝 Tese de Redação - Conteúdo parseado:', contentToLoad);

          // Validar se o conteúdo tem a estrutura esperada
          const hasValidContent = contentToLoad &&
                                 (contentToLoad.temaRedacao || contentToLoad.etapa1_intro);

          if (hasValidContent) {
            console.log(`✅ Conteúdo específico da Tese de Redação encontrado para: ${activity.id}`, contentToLoad);
            setTeseRedacaoContent(contentToLoad); // Set the specific state for Tese de Redação
            setIsContentLoaded(true);
          } else {
            console.warn('⚠️ Conteúdo da Tese de Redação encontrado mas sem estrutura válida:', contentToLoad);
            contentToLoad = null;
          }
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo específico da Tese de Redação:', error);
          contentToLoad = null;
        }
      } else if (constructedActivities[activity.id]?.generatedContent) {
        console.log(`✅ Conteúdo construído encontrado no cache para: ${activity.id}`);
        contentToLoad = constructedActivities[activity.id].generatedContent;
      } else if (savedContent) {
        console.log(`✅ Conteúdo salvo encontrado para: ${activity.id}`);
        try {
          contentToLoad = JSON.parse(savedContent);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo salvo:', error);
          contentToLoad = null;
        }
      }

      setGeneratedContent(contentToLoad);
      setIsContentLoaded(!!contentToLoad);
    }
  }, [activity, isOpen]);

  useEffect(() => {
    const loadActivityData = async () => {
      if (activity && isOpen) {
        console.log('🔄 Modal aberto, carregando dados para atividade:', activity.id);

        const autoDataKey = `auto_activity_data_${activity.id}`;
        const autoData = localStorage.getItem(autoDataKey);

        if (autoData) {
          try {
            const {
              formData: autoFormData,
              customFields: autoCustomFields,
              originalActivity,
              actionPlanActivity
            } = JSON.parse(autoData);

            console.log('📋 Carregando dados automáticos para:', activity.title);

            const consolidatedData = {
              ...activity,
              ...originalActivity,
              ...actionPlanActivity
            };

            const consolidatedCustomFields = {
              ...activity?.customFields,
              ...autoCustomFields,
              ...originalActivity?.customFields,
              ...actionPlanActivity?.customFields
            } || {};

            const customFields = consolidatedCustomFields || {};

            let enrichedFormData: ActivityFormData;

            if (activity?.id === 'plano-aula') {
              console.log('📚 Processando dados específicos de Plano de Aula');

              enrichedFormData = {
                ...formData,
                title: consolidatedData.personalizedTitle || consolidatedData.title || activity.personalizedTitle || activity.title || '',
                description: consolidatedData.personalizedDescription || consolidatedData.description || activity.personalizedDescription || activity.description || '',
                subject: consolidatedCustomFields['Componente Curricular'] ||
                         consolidatedCustomFields['disciplina'] ||
                         consolidatedCustomFields['Disciplina'] ||
                         'Matemática',
                theme: consolidatedCustomFields['Tema ou Tópico Central'] ||
                       consolidatedCustomFields['Tema Central'] ||
                       consolidatedCustomFields['tema'] ||
                       consolidatedCustomFields['Tema'] || '',
                schoolYear: consolidatedCustomFields['Ano/Série Escolar'] ||
                           consolidatedCustomFields['Público-Alvo'] ||
                           consolidatedCustomFields['anoEscolaridade'] ||
                           consolidatedCustomFields['Ano de Escolaridade'] || '',
                numberOfQuestions: '1',
                difficultyLevel: consolidatedCustomFields['Tipo de Aula'] ||
                                consolidatedCustomFields['Metodologia'] ||
                                consolidatedCustomFields['tipoAula'] || 'Expositiva',
                questionModel: '',
                sources: consolidatedCustomFields['Fontes'] ||
                        consolidatedCustomFields['Referencias'] ||
                        consolidatedCustomFields['fontes'] || '',
                objectives: consolidatedCustomFields['Objetivo Geral'] ||
                           consolidatedCustomFields['Objetivos de Aprendizagem'] ||
                           consolidatedCustomFields['Objetivo Principal'] ||
                           consolidatedCustomFields['objetivos'] || '',
                materials: consolidatedCustomFields['Materiais/Recursos'] ||
                          consolidatedCustomFields['Recursos'] ||
                          consolidatedCustomFields['Materiais Necessários'] ||
                          consolidatedCustomFields['materiais'] || '',
                instructions: consolidatedCustomFields['Instruções'] ||
                             consolidatedCustomFields['Metodologia'] ||
                             consolidatedCustomFields['instrucoes'] || '',
                evaluation: consolidatedCustomFields['Observações do Professor'] ||
                           consolidatedCustomFields['Observações'] ||
                           consolidatedCustomFields['Avaliação'] ||
                           consolidatedCustomFields['observacoes'] || '',
                timeLimit: consolidatedCustomFields['Carga Horária'] ||
                          consolidatedCustomFields['Tempo Estimado'] ||
                          consolidatedCustomFields['tempoLimite'] || '',
                context: consolidatedCustomFields['Perfil da Turma'] ||
                        consolidatedCustomFields['Contexto'] ||
                        consolidatedCustomFields['contexto'] || '',
                textType: '',
                textGenre: '',
                textLength: '',
                associatedQuestions: '',
                competencies: consolidatedCustomFields['Habilidades BNCC'] ||
                             consolidatedCustomFields['Competências'] ||
                             consolidatedCustomFields['competencias'] || '',
                readingStrategies: '',
                visualResources: '',
                practicalActivities: '',
                wordsIncluded: '',
                gridFormat: '',
                providedHints: '',
                vocabularyContext: '',
                language: '',
                associatedExercises: '',
                knowledgeArea: '',
                complexityLevel: '',
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || '',
                disciplina: consolidatedCustomFields['Disciplina'] || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || '',
                cronograma: consolidatedCustomFields['Cronograma'] || '',
                quadroInterativoCampoEspecifico: consolidatedCustomFields['quadroInterativoCampoEspecifico'] || '',
              };

              console.log('✅ Dados do Plano de Aula processados:', enrichedFormData);
            } else if (activity?.id === 'sequencia-didatica') {
              console.log('📚 Processando dados específicos de Sequência Didática');

              enrichedFormData = {
                ...formData,
                title: consolidatedData.title || autoFormData.title || activity.title || '',
                description: consolidatedData.description || autoFormData.description || activity.description || '',
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || autoFormData.tituloTemaAssunto || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || autoFormData.anoSerie || '',
                disciplina: consolidatedCustomFields['Disciplina'] || autoFormData.disciplina || activity?.customFields?.disciplina || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || autoFormData.bnccCompetencias || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || autoFormData.publicoAlvo || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || autoFormData.objetivosAprendizagem || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || autoFormData.quantidadeAulas || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || autoFormData.quantidadeDiagnosticos || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || autoFormData.quantidadeAvaliacoes || '',
                cronograma: consolidatedCustomFields['Cronograma'] || autoFormData.cronograma || '',
                subject: consolidatedCustomFields['Disciplina'] || autoFormData.subject || activity?.customFields?.disciplina || 'Português',
                theme: consolidatedCustomFields['Tema'] || autoFormData.theme || activity?.theme || '',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || autoFormData.schoolYear || activity?.schoolYear || '',
                competencies: consolidatedCustomFields['Competências'] || autoFormData.competencies || '',
                objectives: consolidatedCustomFields['Objetivos'] || autoFormData.objectives || activity?.objectives || '',
                materials: consolidatedCustomFields['Materiais'] || autoFormData.materials || activity?.materials || '',
                context: consolidatedCustomFields['Contexto de Aplicação'] || autoFormData.context || '',
                evaluation: consolidatedCustomFields['Critérios de Avaliação'] || autoFormData.evaluation || '',
                quadroInterativoCampoEspecifico: consolidatedCustomFields['quadroInterativoCampoEspecifico'] || autoFormData.quadroInterativoCampoEspecifico || '',
              };

              console.log('✅ Dados da Sequência Didática processados:', enrichedFormData);
            } else if (activity?.id === 'quiz-interativo') {
              console.log('🎯 Processando dados específicos de Quiz Interativo');

              enrichedFormData = {
                ...formData,
                title: consolidatedData.title || autoFormData.title || activity.title || '',
                description: consolidatedData.description || autoFormData.description || activity.description || '',
                numberOfQuestions: consolidatedCustomFields['Número de Questões'] || autoFormData.numberOfQuestions || '10',
                theme: consolidatedCustomFields['Tema'] || autoFormData.theme || activity.theme || '',
                subject: consolidatedCustomFields['Disciplina'] || autoFormData.subject || 'Matemática',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || autoFormData.schoolYear || '6º Ano - Ensino Fundamental',
                difficultyLevel: consolidatedCustomFields['Nível de Dificuldade'] || autoFormData.difficultyLevel || 'Médio',
                questionModel: consolidatedCustomFields['Formato'] || autoFormData.questionModel || 'Múltipla Escolha',
                objectives: consolidatedCustomFields['Objetivos'] || autoFormData.objectives || '',
                materials: consolidatedCustomFields['Materiais'] || autoFormData.materials || '',
                instructions: consolidatedCustomFields['Instruções'] || autoFormData.instructions || '',
                evaluation: consolidatedCustomFields['Critérios de Avaliação'] || autoFormData.evaluation || '',
                timeLimit: consolidatedCustomFields['Tempo Limite'] || autoFormData.timeLimit || '',
                context: consolidatedCustomFields['Contexto de Aplicação'] || autoFormData.context || '',
                format: consolidatedCustomFields['Formato do Quiz'] || autoFormData.format || '', // New field
                timePerQuestion: consolidatedCustomFields['Tempo por Questão'] || autoFormData.timePerQuestion || '', // New field
                quadroInterativoCampoEspecifico: consolidatedCustomFields['quadroInterativoCampoEspecifico'] || autoFormData.quadroInterativoCampoEspecifico || '',
              };

              console.log('🎯 Dados finais do Quiz Interativo processados:', enrichedFormData);

            } else if (activity?.id === 'quadro-interativo') {
              console.log('🖼️ Processando dados específicos de Quadro Interativo');

              // Importar o processador específico do Quadro Interativo
              const { prepareQuadroInterativoDataForModal } = await import('../activities/quadro-interativo/quadroInterativoProcessor');

              // Preparar dados consolidados para o processador
              const activityForProcessor = {
                ...activity,
                ...consolidatedData,
                customFields: {
                  ...activity.customFields,
                  ...consolidatedCustomFields,
                  ...autoCustomFields
                }
              };

              console.log('📋 Dados para processador do Quadro Interativo:', activityForProcessor);

              // Usar o processador específico para preparar os dados
              const processedQuadroData = prepareQuadroInterativoDataForModal(activityForProcessor);

              // Aplicar dados automáticos por cima se existirem
              enrichedFormData = {
                ...processedQuadroData,

                // Sobrescrever com dados automáticos se existirem e forem válidos
                ...(autoFormData.title && { title: autoFormData.title }),
                ...(autoFormData.description && { description: autoFormData.description }),
                ...(autoFormData.subject && autoFormData.subject !== 'Matemática' && { subject: autoFormData.subject }),
                ...(autoFormData.schoolYear && autoFormData.schoolYear !== '6º ano' && { schoolYear: autoFormData.schoolYear }),
                ...(autoFormData.theme && autoFormData.theme !== 'Conteúdo Geral' && { theme: autoFormData.theme }),
                ...(autoFormData.objectives && { objectives: autoFormData.objectives }),
                ...(autoFormData.difficultyLevel && autoFormData.difficultyLevel !== 'Intermediário' && { difficultyLevel: autoFormData.difficultyLevel }),
                ...(autoFormData.quadroInterativoCampoEspecifico && { quadroInterativoCampoEspecifico: autoFormData.quadroInterativoCampoEspecifico }),
                ...(autoFormData.materials && { materials: autoFormData.materials }),
                ...(autoFormData.instructions && { instructions: autoFormData.instructions }),
                ...(autoFormData.evaluation && { evaluation: autoFormData.evaluation }),
                ...(autoFormData.timeLimit && { timeLimit: autoFormData.timeLimit }),
                ...(autoFormData.context && { context: autoFormData.context })
              };

              console.log('🖼️ Dados finais do Quadro Interativo processados:', enrichedFormData);

            }
            else if (activity?.id === 'mapa-mental') {
              console.log('🧠 Processando dados específicos de Mapa Mental');
              enrichedFormData = {
                ...formData,
                title: activityData.title || autoFormData.title || customFields['Título'] || 'Mapa Mental',
                description: activityData.description || autoFormData.description || customFields['Descrição'] || '',
                centralTheme: customFields['Tema Central'] || autoFormData.centralTheme || '',
                mainCategories: customFields['Categorias Principais'] || autoFormData.mainCategories || '',
                generalObjective: customFields['Objetivo Geral'] || autoFormData.generalObjective || '',
                evaluationCriteria: customFields['Critérios de Avaliação'] || autoFormData.evaluationCriteria || '',
              };
              console.log('🧠 Dados do Mapa Mental processados:', enrichedFormData);
            }
            else if (activity?.id === 'flash-cards') { // Preenchimento direto para Flash Cards
              console.log('🃏 Processando dados específicos de Flash Cards');
              enrichedFormData = {
                ...formData,
                title: activityData.title || autoFormData.title || customFields['Título'] || 'Flash Cards',
                description: activityData.description || autoFormData.description || customFields['Descrição'] || '',
                theme: customFields['Tema'] || customFields['tema'] || customFields['Tema dos Flash Cards'] || autoFormData.theme || '',
                topicos: customFields['Tópicos Principais'] || customFields['Tópicos'] || customFields['topicos'] || customFields['tópicos'] || autoFormData.topicos || '',
                numberOfFlashcards: customFields['Número de Flash Cards'] || customFields['numeroFlashcards'] || customFields['Quantidade de Flash Cards'] || autoFormData.numberOfFlashcards || '10',
                contextoUso: customFields['Contexto de Uso'] || customFields['Contexto'] || customFields['contexto'] || autoFormData.contextoUso || autoFormData.context || '',
                subject: consolidatedCustomFields['Disciplina'] || consolidatedCustomFields['disciplina'] || autoFormData.subject || 'Geral',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || consolidatedCustomFields['anoEscolaridade'] || autoFormData.schoolYear || 'Ensino Médio',
                difficultyLevel: consolidatedCustomFields['Nível de Dificuldade'] || consolidatedCustomFields['nivelDificuldade'] || autoFormData.difficultyLevel || 'Médio',
                objectives: consolidatedCustomFields['Objetivos'] || autoFormData.objectives || `Facilitar o aprendizado sobre ${customFields['Tema'] || customFields['tema'] || 'o tema'}`,
                instructions: consolidatedCustomFields['Instruções'] || autoFormData.instructions || 'Use os flash cards para estudar e revisar o conteúdo',
                evaluation: consolidatedCustomFields['Critérios de Avaliação'] || autoFormData.evaluation || 'Avalie o conhecimento através da prática com os cards',
              };
              console.log('🃏 Dados do Flash Cards processados:', enrichedFormData);
            }
            else if (activity?.id === 'tese-redacao') {
              console.log('📝 Processando dados específicos de Tese da Redação');

              // Importar o processador específico
              const { prepareTeseRedacaoDataForModal } = await import('../activities/tese-redacao/teseRedacaoProcessor');

              // Preparar dados consolidados para o processador
              const activityForProcessor = {
                ...activity,
                ...consolidatedData,
                customFields: {
                  ...activity.customFields,
                  ...consolidatedCustomFields,
                  ...autoCustomFields
                }
              };

              console.log('📋 Dados para processador de Tese da Redação:', activityForProcessor);

              // Usar o processador específico
              const processedTeseData = prepareTeseRedacaoDataForModal(activityForProcessor);

              // Aplicar dados automáticos por cima se existirem
              enrichedFormData = {
                ...processedTeseData,

                // Sobrescrever com dados automáticos se existirem e forem válidos
                ...(autoFormData.title && { title: autoFormData.title }),
                ...(autoFormData.description && { description: autoFormData.description }),
                ...(autoFormData.temaRedacao && { temaRedacao: autoFormData.temaRedacao }),
                ...(autoFormData.objetivo && { objetivo: autoFormData.objetivo }),
                ...(autoFormData.nivelDificuldade && { nivelDificuldade: autoFormData.nivelDificuldade }),
                ...(autoFormData.competenciasENEM && { competenciasENEM: autoFormData.competenciasENEM }),
                ...(autoFormData.contextoAdicional && { contextoAdicional: autoFormData.contextoAdicional })
              };

              console.log('✅ Dados finais da Tese da Redação processados:', enrichedFormData);

            }
            else {
              enrichedFormData = {
                title: activityData.title || autoFormData.title || '',
                description: activityData.description || autoFormData.description || '',
                subject: consolidatedCustomFields['Disciplina'] || consolidatedCustomFields['disciplina'] || autoFormData.subject || 'Português',
                theme: consolidatedCustomFields['Tema'] || consolidatedCustomFields['tema'] || consolidatedCustomFields['Tema das Palavras'] || consolidatedCustomFields['Tema do Vocabulário'] || autoFormData.theme || '',
                schoolYear: consolidatedCustomFields['Ano de Escolaridade'] || consolidatedCustomFields['anoEscolaridade'] || consolidatedCustomFields['ano'] || autoFormData.schoolYear || '',
                numberOfQuestions: consolidatedCustomFields['Quantidade de Questões'] || consolidatedCustomFields['quantidadeQuestoes'] || consolidatedCustomFields['Quantidade de Palavras'] || autoFormData.numberOfQuestions || '10',
                difficultyLevel: consolidatedCustomFields['Nível de Dificuldade'] || consolidatedCustomFields['nivelDificuldade'] || consolidatedCustomFields['dificuldade'] || autoFormData.difficultyLevel || 'Médio',
                questionModel: consolidatedCustomFields['Modelo de Questões'] || consolidatedCustomFields['modeloQuestoes'] || consolidatedCustomFields['Tipo de Avaliação'] || autoFormData.questionModel || '',
                sources: consolidatedCustomFields['Fontes'] || consolidatedCustomFields['fontes'] || consolidatedCustomFields['Referencias'] || autoFormData.sources || '',
                objectives: consolidatedCustomFields['Objetivos'] || consolidatedCustomFields['objetivos'] || consolidatedCustomFields['Competências Trabalhadas'] || autoFormData.objectives || '',
                materials: consolidatedCustomFields['Materiais'] || consolidatedCustomFields['materiais'] || consolidatedCustomFields['Recursos Visuais'] || autoFormData.materials || '',
                instructions: consolidatedCustomFields['Instruções'] || consolidatedCustomFields['instrucoes'] || consolidatedCustomFields['Estratégias de Leitura'] || consolidatedCustomFields['Atividades Práticas'] || autoFormData.instructions || '',
                evaluation: consolidatedCustomFields['Critérios de Correção'] || consolidatedCustomFields['Critérios de Avaliação'] || consolidatedCustomFields['criteriosAvaliacao'] || autoFormData.evaluation || '',
                timeLimit: consolidatedCustomFields['Tempo de Prova'] || consolidatedCustomFields['Tempo Limite'] || consolidatedCustomFields['tempoLimite'] || autoFormData.timeLimit || '',
                context: consolidatedCustomFields['Contexto de Aplicação'] || consolidatedCustomFields['Contexto de Uso'] || consolidatedCustomFields['contexto'] || autoFormData.context || '',
                textType: '',
                textGenre: '',
                textLength: '',
                associatedQuestions: '',
                competencies: '',
                readingStrategies: '',
                visualResources: '',
                practicalActivities: '',
                wordsIncluded: '',
                gridFormat: '',
                providedHints: '',
                vocabularyContext: '',
                language: '',
                associatedExercises: '',
                knowledgeArea: '',
                complexityLevel: '',
                tituloTemaAssunto: consolidatedCustomFields['Título do Tema / Assunto'] || autoFormData.tituloTemaAssunto || '',
                anoSerie: consolidatedCustomFields['Ano / Série'] || autoFormData.anoSerie || '',
                disciplina: consolidatedCustomFields['Disciplina'] || autoFormData.disciplina || '',
                bnccCompetencias: consolidatedCustomFields['BNCC / Competências'] || autoFormData.bnccCompetencias || '',
                publicoAlvo: consolidatedCustomFields['Público-alvo'] || autoFormData.publicoAlvo || '',
                objetivosAprendizagem: consolidatedCustomFields['Objetivos de Aprendizagem'] || autoFormData.objetivosAprendizagem || '',
                quantidadeAulas: consolidatedCustomFields['Quantidade de Aulas'] || autoFormData.quantidadeAulas || '',
                quantidadeDiagnosticos: consolidatedCustomFields['Quantidade de Diagnósticos'] || autoFormData.quantidadeDiagnosticos || '',
                quantidadeAvaliacoes: consolidatedCustomFields['Quantidade de Avaliações'] || autoFormData.quantidadeAvaliacoes || '',
                cronograma: consolidatedCustomFields['Cronograma'] || autoFormData.cronograma || '',
                quadroInterativoCampoEspecifico: consolidatedCustomFields['quadroInterativoCampoEspecifico'] || autoFormData.quadroInterativoCampoEspecifico || '',
              };
            }

            console.log('✅ Formulário será preenchido com:', enrichedFormData);
            setFormData(enrichedFormData);

            if (onUpdateActivity) {
              const activityWithAutoFlag = {
                ...activity,
                preenchidoAutomaticamente: true,
                dataSource: activity?.id === 'plano-aula' ? 'action-plan-plano-aula' : 'action-plan-generic'
              };
              onUpdateActivity(activityWithAutoFlag);
              console.log('🏷️ Atividade marcada como preenchida automaticamente');

              if (activity?.id === 'plano-aula') {
                console.log('📚 Plano de Aula configurado com dados específicos do Action Plan');
              }
            }

            setTimeout(() => {
              localStorage.removeItem(autoDataKey);
              console.log('🗑️ Dados automáticos limpos do localStorage');
            }, 1000);

          } catch (error) {
            console.error('❌ Erro ao carregar dados automáticos:', error);

            const fallbackData = {
              title: activity.title || activity.originalData?.title || '',
              description: activity.description || activity.originalData?.description || '',
              subject: activity.originalData?.customFields?.['Disciplina'] || 'Português',
              theme: activity.originalData?.customFields?.['Tema'] || '',
              schoolYear: activity.originalData?.customFields?.['Ano de Escolaridade'] || '',
              numberOfQuestions: activity.originalData?.customFields?.['Quantidade de Questões'] || '10',
              difficultyLevel: activity.originalData?.customFields?.['Nível de Dificuldade'] || 'Médio',
              questionModel: activity.originalData?.customFields?.['Modelo de Questões'] || '',
              sources: activity.originalData?.customFields?.['Fontes'] || '',
              objectives: '',
              materials: '',
              instructions: '',
              evaluation: '',
              timeLimit: '',
              context: '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              tituloTemaAssunto: '',
              anoSerie: '',
              disciplina: '',
              bnccCompetencias: '',
              publicoAlvo: '',
              objetivosAprendizagem: '',
              quantidadeAulas: '',
              quantidadeDiagnosticos: '',
              quantidadeAvaliacoes: '',
              cronograma: '',
              quadroInterativoCampoEspecifico: '',
            };

            setFormData(fallbackData);
            console.log('🔧 Usando dados de fallback:', fallbackData);
          }
        } else {
          console.log('⚠️ Nenhum dado automático encontrado, usando dados da atividade');

          const activityData = activity.originalData || activity;
          const customFields = activityData.customFields || {};

          console.log('📊 Dados da atividade para preenchimento:', activityData);
          console.log('🗂️ Custom fields disponíveis:', customFields);

          let directFormData: ActivityFormData;

          if (activity?.id === 'plano-aula') {
            console.log('📚 Processando dados diretos de Plano de Aula');

            directFormData = {
              ...formData,
              title: activityData.personalizedTitle || activityData.title || '',
              description: activityData.personalizedDescription || activityData.description || '',
              subject: customFields['Componente Curricular'] ||
                       customFields['disciplina'] ||
                       customFields['Disciplina'] ||
                       'Matemática',
              theme: customFields['Tema ou Tópico Central'] ||
                     customFields['Tema Central'] ||
                     customFields['tema'] ||
                     customFields['Tema'] || '',
              schoolYear: customFields['Ano/Série Escolar'] ||
                         customFields['Público-Alvo'] ||
                         customFields['anoEscolaridade'] ||
                         customFields['Ano de Escolaridade'] || '',
              numberOfQuestions: '1',
              difficultyLevel: customFields['Tipo de Aula'] ||
                              customFields['Metodologia'] ||
                              customFields['tipoAula'] || 'Expositiva',
              questionModel: '',
              sources: customFields['Fontes'] || customFields['fontes'] || '',
              objectives: customFields['Objetivo Geral'] ||
                         customFields['Objetivos de Aprendizagem'] ||
                         customFields['Objetivo Principal'] ||
                         customFields['objetivos'] || '',
              materials: customFields['Materiais/Recursos'] ||
                        customFields['Recursos'] ||
                        customFields['Materiais Necessários'] ||
                        customFields['materiais'] || '',
              instructions: customFields['Instruções'] ||
                           customFields['Metodologia'] ||
                           customFields['instrucoes'] || '',
              evaluation: customFields['Observações do Professor'] ||
                         customFields['Observações'] ||
                         customFields['Avaliação'] ||
                         customFields['observacoes'] || '',
              timeLimit: customFields['Carga Horária'] ||
                        customFields['Tempo Estimado'] ||
                        customFields['tempoLimite'] || '',
              context: customFields['Perfil da Turma'] ||
                      customFields['Contexto'] ||
                      customFields['contexto'] || '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: customFields['Habilidades BNCC'] ||
                           customFields['Competências'] ||
                           customFields['competencias'] || '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
              anoSerie: customFields['Ano / Série'] || '',
              disciplina: customFields['Disciplina'] || '',
              bnccCompetencias: customFields['BNCC / Competências'] || '',
              publicoAlvo: customFields['Público-alvo'] || '',
              objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: customFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
              cronograma: customFields['Cronograma'] || '',
              quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
            };

            console.log('📝 Dados diretos processados para plano-aula:', directFormData);
          } else if (activity?.id === 'sequencia-didatica') {
            console.log('📚 Processando dados diretos de Sequência Didática');

            directFormData = {
              ...formData,
              title: activityData.title || '',
              description: activityData.description || '',
              tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
              anoSerie: customFields['Ano / Série'] || '',
              disciplina: customFields['Disciplina'] || '',
              bnccCompetencias: customFields['BNCC / Competências'] || '',
              publicoAlvo: customFields['Público-alvo'] || '',
              objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: customFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
              cronograma: customFields['Cronograma'] || '',
              subject: customFields['Disciplina'] || 'Português',
              theme: customFields['Tema'] || '',
              schoolYear: customFields['Ano de Escolaridade'] || '',
              competencies: customFields['Competências'] || '',
              objectives: customFields['Objetivos'] || '',
              materials: customFields['Materiais'] || '',
              context: customFields['Contexto de Aplicação'] || '',
              evaluation: customFields['Critérios de Avaliação'] || '',
              quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
            };

            console.log('✅ Dados da Sequência Didática processados:', directFormData);
          } else if (activity?.id === 'quiz-interativo') {
            console.log('🎯 Processando dados diretos de Quiz Interativo');

            directFormData = {
              ...formData,
              title: activityData.title || '',
              description: activityData.description || '',
              numberOfQuestions: customFields['Número de Questões'] || customFields['quantidadeQuestoes'] || '10',
              theme: customFields['Tema'] || customFields['tema'] || '',
              subject: customFields['Disciplina'] || customFields['disciplina'] || 'Matemática',
              schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || '6º Ano - Ensino Fundamental',
              difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || 'Médio',
              questionModel: customFields['Formato'] || customFields['formato'] || customFields['Modelo de Questões'] || 'Múltipla Escolha',
              objectives: customFields['Objetivos'] || customFields['objetivos'] || '',
              materials: customFields['Materiais'] || customFields['materiais'] || '',
              instructions: customFields['Instruções'] || customFields['instrucoes'] || '',
              evaluation: customFields['Critérios de Avaliação'] || customFields['criteriosAvaliacao'] || '',
              timeLimit: customFields['Tempo Limite'] || customFields['tempoLimite'] || '',
              context: customFields['Contexto de Aplicação'] || customFields['contexto'] || '',
              format: customFields['Formato do Quiz'] || '', // New field
              timePerQuestion: customFields['Tempo por Questão'] || '', // New field
              quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
            };

            console.log('🎯 Dados diretos do Quiz Interativo processados:', directFormData);
          } else if (activity?.id === 'quadro-interativo') {
            console.log('🖼️ Processando dados diretos de Quadro Interativo');

            // Usar o processador específico para dados diretos também
            const { prepareQuadroInterativoDataForModal } = await import('../activities/quadro-interativo/quadroInterativoProcessor');

            const processedDirectData = prepareQuadroInterativoDataForModal({
              ...activityData,
              customFields: customFields
            });

            directFormData = {
              ...processedDirectData,
              // Garantir mapeamento completo dos custom fields
              title: activityData.personalizedTitle || activityData.title || processedDirectData.title,
              description: activityData.personalizedDescription || activityData.description || processedDirectData.description,

              subject: customFields['Disciplina / Área de conhecimento'] ||
                       customFields['disciplina'] ||
                       customFields['Disciplina'] ||
                       customFields['Componente Curricular'] ||
                       customFields['Matéria'] ||
                       processedDirectData.subject ||
                       'Matemática',

              schoolYear: customFields['Ano / Série'] ||
                         customFields['anoSerie'] ||
                         customFields['Ano de Escolaridade'] ||
                         customFields['Público-Alvo'] ||
                         customFields['Ano'] ||
                         customFields['Série'] ||
                         processedDirectData.schoolYear ||
                         '6º Ano',

              theme: customFields['Tema ou Assunto da aula'] ||
                     customFields['tema'] ||
                     customFields['Tema'] ||
                     customFields['Assunto'] ||
                     customFields['Tópico'] ||
                     customFields['Tema Central'] ||
                     processedDirectData.theme ||
                     activityData.title ||
                     'Tema da Aula',

              objectives: customFields['Objetivo de aprendizagem da aula'] ||
                          customFields['objetivos'] ||
                          customFields['Objetivos'] ||
                          customFields['Objetivo'] ||
                          customFields['Objetivo Principal'] ||
                          customFields['Objetivos de Aprendizagem'] ||
                          processedDirectData.objectives ||
                          activityData.description ||
                          'Objetivos de aprendizagem',

              difficultyLevel: customFields['Nível de Dificuldade'] ||
                              customCustomFields['nivelDificuldade'] ||
                              customFields['dificuldade'] ||
                              customFields['Dificuldade'] ||
                              customFields['Nível'] ||
                              customFields['Complexidade'] ||
                              processedDirectData.difficultyLevel ||
                              'Intermediário',

              quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] ||
                                              customFields['atividadeMostrada'] ||
                                              customFields['quadroInterativoCampoEspecifico'] ||
                                              customFields['Campo Específico do Quadro Interativo'] ||
                                              customFields['Atividade'] ||
                                              customFields['Atividades'] ||
                                              customFields['Tipo de Atividade'] ||
                                              customFields['Interatividade'] ||
                                              customFields['Campo Específico'] ||
                                              processedDirectData.quadroInterativoCampoEspecifico ||
                                              'Atividade interativa no quadro',

              materials: customFields['Materiais'] ||
                        customFields['Materiais Necessários'] ||
                        customFields['Recursos'] ||
                        customFields['materials'] ||
                        processedDirectData.materials ||
                        '',

              instructions: customFields['Instruções'] ||
                           customFields['Metodologia'] ||
                           customFields['instructions'] ||
                           processedDirectData.instructions ||
                           '',

              evaluation: customFields['Avaliação'] ||
                         customFields['Critérios de Avaliação'] ||
                         customFields['evaluation'] ||
                         processedDirectData.evaluation ||
                         '',

              timeLimit: customFields['Tempo Estimado'] ||
                        customFields['Duração'] ||
                        customFields['timeLimit'] ||
                        processedDirectData.timeLimit ||
                        '',

              context: customFields['Contexto'] ||
                      customFields['Aplicação'] ||
                      customFields['context'] ||
                      processedDirectData.context ||
                      ''
            };

            console.log('🖼️ Dados diretos do Quadro Interativo processados:', directFormData);
          }
          else if (activity?.id === 'mapa-mental') { // Preenchimento direto para Mapa Mental
            console.log('🧠 Processando dados diretos de Mapa Mental');
            directFormData = {
              ...formData,
              title: activityData.title || customFields['Título'] || 'Mapa Mental',
              description: activityData.description || customFields['Descrição'] || '',
              centralTheme: customFields['Tema Central'] || '',
              mainCategories: customFields['Categorias Principais'] || '',
              generalObjective: customFields['Objetivo Geral'] || '',
              evaluationCriteria: customFields['Critérios de Avaliação'] || '',
            };
            console.log('🧠 Dados diretos do Mapa Mental processados:', directFormData);
          }
          else if (activity?.id === 'tese-redacao') { // Preenchimento direto para Tese de Redação
              console.log('📝 Processando dados diretos de Tese de Redação');
              directFormData = {
                ...formData,
                title: activityData.title || customFields['Título'] || 'Tese da Redação',
                description: activityData.description || customFields['Descrição'] || '',
                temaRedacao: customFields['Tema da Redação'] || customFields['temaRedacao'] || customFields['Tema'] || '',
                objetivo: customFields['Objetivos'] || customFields['Objetivo'] || customFields['objetivo'] || '',
                nivelDificuldade: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || 'Médio',
                competenciasENEM: customFields['Competências ENEM'] || customFields['competenciasENEM'] || customFields['Competências'] || '',
                contextoAdicional: customFields['Contexto Adicional'] || customFields['contextoAdicional'] || customFields['Contexto'] || '',
              };
              console.log('📝 Dados diretos da Tese de Redação processados:', directFormData);
            }
          else if (activity?.id === 'flash-cards') { // Preenchimento direto para Flash Cards
              console.log('🃏 Processando dados diretos de Flash Cards');
              directFormData = {
                ...formData,
                title: activityData.title || customFields['Título'] || 'Flash Cards',
                description: activityData.description || customFields['Descrição'] || '',
                theme: customFields['Tema'] || customFields['tema'] || customFields['Tema dos Flash Cards'] || '',
                topicos: customFields['Tópicos Principais'] || customFields['Tópicos'] || customFields['topicos'] || customFields['tópicos'] || '',
                numberOfFlashcards: customFields['Número de Flash Cards'] || customFields['numeroFlashcards'] || customFields['Quantidade de Flash Cards'] || '10',
                contextoUso: customFields['Contexto de Uso'] || customFields['Contexto'] || customFields['contexto'] || '',
              };
              console.log('🃏 Dados diretos do Flash Cards processados:', directFormData);
            }
          else {
            directFormData = {
              title: activityData.title || '',
              description: activityData.description || '',
              subject: customFields['Disciplina'] || customFields['disciplina'] || 'Português',
              theme: customFields['Tema'] || customFields['tema'] || '',
              schoolYear: customFields['Ano de Escolaridade'] || customFields['anoEscolaridade'] || '',
              numberOfQuestions: customFields['Quantidade de Questões'] || customFields['quantidadeQuestoes'] || '10',
              difficultyLevel: customFields['Nível de Dificuldade'] || customFields['nivelDificuldade'] || 'Médio',
              questionModel: customFields['Modelo de Questões'] || customFields['modeloQuestoes'] || '',
              sources: customFields['Fontes'] || customFields['fontes'] || '',
              objectives: customFields['Objetivos'] || customFields['objetivos'] || '',
              materials: customFields['Materiais'] || customFields['materiais'] || '',
              instructions: customFields['Instruções'] || customFields['instrucoes'] || '',
              evaluation: customFields['Critérios de Correção'] || customFields['Critérios de Avaliação'] || '',
              timeLimit: customFields['Tempo Limite'] || '',
              context: customFields['Contexto de Aplicação'] || '',
              textType: '',
              textGenre: '',
              textLength: '',
              associatedQuestions: '',
              competencies: '',
              readingStrategies: '',
              visualResources: '',
              practicalActivities: '',
              wordsIncluded: '',
              gridFormat: '',
              providedHints: '',
              vocabularyContext: '',
              language: '',
              associatedExercises: '',
              knowledgeArea: '',
              complexityLevel: '',
              tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
              anoSerie: customFields['Ano / Série'] || '',
              disciplina: customFields['Disciplina'] || '',
              bnccCompetencias: customFields['BNCC / Competências'] || '',
              publicoAlvo: customFields['Público-alvo'] || '',
              objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
              quantidadeAulas: customFields['Quantidade de Aulas'] || '',
              quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
              quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
              cronograma: customFields['Cronograma'] || '',
              quadroInterativoCampoEspecifico: customFields['quadroInterativoCampoEspecifico'] || '',
            };
          }

          setFormData(directFormData);
          console.log('📝 Formulário preenchido com dados diretos:', directFormData);
        }
      }
    };

    loadActivityData();
  }, [activity, isOpen]);

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    // Log crítico para Tese da Redação
    if (activity?.id === 'tese-redacao') {
      console.log(`🔧 [TESE REDAÇÃO] Campo "${field}" alterado para:`, value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para construir a atividade
  const handleBuildActivity = useCallback(async () => {
    if (!activity || isBuilding) return;

    console.log('🚀 Iniciando construção da atividade:', activity.title);
    console.log('📊 Dados do formulário:', formData);

    setIsBuilding(true);
    setError(null);
    setBuildProgress(0);

    try {
      const progressTimer = setInterval(() => {
        setBuildProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const activityType = activity.type || activity.id || activity.categoryId;
      console.log('🎯 Tipo de atividade determinado:', activityType);

      // Determine which generation function to call based on activity type
      let result;
      if (activityType === 'quiz-interativo') {
        result = await handleGenerateQuizInterativo();
      } else if (activityType === 'flash-cards') {
        result = await handleGenerateFlashCards();
      } else {
        // Use the generic generateActivity for other types
        result = await generateActivity(formData);
      }

      // Check if generation was successful before proceeding
      if (result === undefined) {
         console.warn("Generation function did not return a value, skipping further processing.");
         // Optionally handle this case, maybe by setting an error or returning early
         // For now, we'll assume it means an error occurred or it was handled internally
         throw new Error("Generation process did not complete successfully.");
      }


      clearInterval(progressTimer);
      setBuildProgress(100);

      console.log('✅ Atividade construída com sucesso:', result);

      // Salvar no localStorage para persistência
      const storageKey = `constructed_${activityType}_${activity?.id}`;
      localStorage.setItem(storageKey, JSON.stringify(result));
      console.log('💾 Dados da sequência didática salvos para visualização:', storageKey);

      // Trigger específico para Quadro Interativo
      if (activityType === 'quadro-interativo') {
        console.log('🎯 Disparando evento de construção para Quadro Interativo');

        // Salvar dados específicos do Quadro Interativo
        const quadroData = {
          ...result.data || result,
          isBuilt: true,
          builtAt: new Date().toISOString(),
          generatedByModal: true
        };

        localStorage.setItem(`quadro_interativo_data_${activity?.id}`, JSON.stringify(quadroData));

        // Disparar evento customizado para notificar o Preview
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('quadro-interativo-auto-build', {
            detail: { activityId: activity?.id, data: quadroData }
          }));
          console.log('📡 Evento de auto-build disparado para Quadro Interativo');
        }, 100);
      }

      // Trigger específico para Quiz Interativo
      if (activityType === 'quiz-interativo') {
        console.log('🎯 Processamento específico concluído para Quiz Interativo');

        // Garantir que o conteúdo específico também seja definido
        const quizData = result.data || result;
        setQuizInterativoContent(quizData);

        console.log('💾 Quiz Interativo processado e salvo:', quizData);
      }
       // Trigger específico para Flash Cards
       if (activityType === 'flash-cards') {
        console.log('🃏 Processamento específico concluído para Flash Cards');

        const flashCardsData = result.data || result;
        setFlashCardsContent(flashCardsData);

        console.log('💾 Flash Cards processados e salvos:', flashCardsData);
      }

      // Trigger específico para Tese de Redação
      if (activityType === 'tese-redacao') {
        console.log('📝 Processamento específico concluído para Tese de Redação');

        const teseRedacaoData = result.data || result;
        setTeseRedacaoContent(teseRedacaoData);
        setIsContentLoaded(true);

        console.log('💾 Tese de Redação processada e salva:', teseRedacaoData);
      }

      // Trigger específico para Lista de Exercícios
      if (activityType === 'lista-exercicios') {
        console.log('📚 ====== PROCESSAMENTO LISTA DE EXERCÍCIOS ======');
        
        // Log completo do resultado para debug
        console.log('📚 [Lista Exercícios] Resultado bruto:', JSON.stringify(result, null, 2)?.substring(0, 2000));
        
        // Verificar estrutura do resultado
        const questoes = result?.questoes || result?.questions || result?.data?.questoes || [];
        console.log('📚 [Lista Exercícios] Questões encontradas:', questoes.length);
        
        if (questoes.length > 0) {
          console.log('📚 [Lista Exercícios] Primeira questão:', JSON.stringify(questoes[0], null, 2));
        }
        
        // Salvar no localStorage para persistência
        localStorage.setItem(`lista_exercicios_data_${activity?.id}`, JSON.stringify(result));
        
        console.log('💾 Lista de Exercícios salva no localStorage');
      }

      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = {
        generatedContent: result,
        timestamp: new Date().toISOString(),
        activityType: activityType
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      setGeneratedContent(result);
      setBuiltContent(result);
      setIsContentLoaded(true);
      setActiveTab('preview');

      // Sincronizar dados instantaneamente após construção
      syncToViewModal({
        title: formData.title,
        description: formData.description,
        generatedContent: result,
        customFields: { ...activity.customFields, ...formData },
        isBuilt: true,
        lastUpdate: new Date().toISOString()
      });

      toast({
        title: "Atividade construída!",
        description: "Sua atividade foi gerada com sucesso pela IA do Gemini.",
      });

    } catch (error) {
      console.error('❌ Erro na construção:', error);
      setError(`Erro ao construir atividade: ${error.message}`);

      toast({
        title: "Erro na construção",
        description: "Houve um problema ao gerar sua atividade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsBuilding(false);
      setBuildProgress(0);
    }
  }, [activity, formData, isBuilding, toast, generateActivity, handleGenerateQuizInterativo, handleGenerateFlashCards]);

  const handleBuildActivityProgrammatic = useCallback(async (): Promise<any> => {
    const targetActivity = effectiveActivity;
    if (!targetActivity) {
      throw new Error('Nenhuma atividade disponível para construção');
    }

    console.log('🌉 [Programmatic] Iniciando construção programática:', targetActivity.id);
    console.log('📊 [Programmatic] Dados do formulário:', formData);

    setIsBuilding(true);
    setError(null);

    try {
      const activityType = targetActivity.type || targetActivity.id || targetActivity.categoryId;
      console.log('🎯 [Programmatic] Tipo de atividade:', activityType);

      let result;
      if (activityType === 'quiz-interativo') {
        result = await handleGenerateQuizInterativo();
      } else if (activityType === 'flash-cards') {
        result = await handleGenerateFlashCards();
      } else {
        result = await generateActivity(formData);
      }

      if (result === undefined) {
        throw new Error('Geração não retornou resultado');
      }

      console.log('✅ [Programmatic] Atividade construída:', result);

      const storageKey = `constructed_${activityType}_${targetActivity.id}`;
      localStorage.setItem(storageKey, JSON.stringify(result));
      console.log('💾 [Programmatic] Salvo em:', storageKey);

      if (activityType === 'quadro-interativo') {
        const quadroData = {
          ...result.data || result,
          isBuilt: true,
          builtAt: new Date().toISOString(),
          generatedByModal: true
        };
        localStorage.setItem(`quadro_interativo_data_${targetActivity.id}`, JSON.stringify(quadroData));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('quadro-interativo-auto-build', {
            detail: { activityId: targetActivity.id, data: quadroData }
          }));
        }, 100);
      }

      if (activityType === 'quiz-interativo') {
        setQuizInterativoContent(result.data || result);
      }
      if (activityType === 'flash-cards') {
        setFlashCardsContent(result.data || result);
      }
      if (activityType === 'tese-redacao') {
        setTeseRedacaoContent(result.data || result);
      }

      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[targetActivity.id] = {
        generatedContent: result,
        timestamp: new Date().toISOString(),
        activityType
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      setGeneratedContent(result);
      setBuiltContent(result);
      setIsContentLoaded(true);

      const activityStorageKey = `activity_${targetActivity.id}`;
      localStorage.setItem(activityStorageKey, JSON.stringify({
        title: formData.title,
        description: formData.description,
        customFields: { ...targetActivity.customFields, ...formData },
        generatedContent: result,
        formData,
        lastSync: new Date().toISOString()
      }));

      window.dispatchEvent(new CustomEvent('activity-data-sync', {
        detail: {
          activityId: targetActivity.id,
          data: { title: formData.title, description: formData.description, generatedContent: result, formData },
          timestamp: Date.now()
        }
      }));

      console.log('🌉 [Programmatic] Build concluído com sucesso');
      return result;

    } catch (error) {
      console.error('❌ [Programmatic] Erro:', error);
      throw error;
    } finally {
      setIsBuilding(false);
    }
  }, [effectiveActivity, formData, generateActivity, handleGenerateQuizInterativo, handleGenerateFlashCards]);

  useEffect(() => {
    buildFnRef.current = handleBuildActivityProgrammatic;
  }, [handleBuildActivityProgrammatic]);

  // Agente Interno de Execução - Automação da Construção de Atividades
  useEffect(() => {
    if (!activity || !isOpen) return;

    const customFields = activity.customFields || {};

    const preenchidoPorIA = activity.preenchidoAutomaticamente === true ||
                           Object.keys(customFields).length > 0;

    const isFormValid = isFormValidForBuild();

    // Verificação específica para Quadro Interativo
    const isQuadroInterativo = activity.id === 'quadro-interativo';
    const hasQuadroInterativoData = isQuadroInterativo && (
      (formData.subject && formData.subject !== 'Matemática') ||
      (formData.schoolYear && formData.schoolYear !== '6º Ano') ||
      (formData.theme && formData.theme !== '') ||
      (formData.objectives && formData.objectives !== '') ||
      (formData.difficultyLevel && formData.difficultyLevel !== 'Intermediário') ||
      (formData.quadroInterativoCampoEspecifico && formData.quadroInterativoCampoEspecifico !== '')
    );

    // Verificação específica para Quiz Interativo
    const isQuizInterativo = activity.id === 'quiz-interativo';
    const hasQuizInterativoData = isQuizInterativo && (
      (formData.subject && formData.subject !== 'Matemática') ||
      (formData.schoolYear && formData.schoolYear !== '6º Ano - Ensino Fundamental') ||
      (formData.theme && formData.theme !== '') ||
      (formData.numberOfQuestions && formData.numberOfQuestions !== '10') ||
      (formData.difficultyLevel && formData.difficultyLevel !== 'Médio') ||
      (formData.questionModel && formData.questionModel !== 'Múltipla Escolha') ||
      (formData.format && formData.format !== '') || // Check new fields
      (formData.timePerQuestion && formData.timePerQuestion !== '') // Check new fields
    );

    // Verificação específica para Flash Cards
    const isFlashCards = activity.id === 'flash-cards';
    const hasFlashCardsData = isFlashCards && (
      (formData.theme && formData.theme !== '') ||
      (formData.topicos && formData.topicos !== '') ||
      (formData.numberOfFlashcards && formData.numberOfFlashcards !== '10') ||
      (formData.context && formData.context !== '')
    );

    // Verificação específica para Mapa Mental
    const isMapaMental = activity.id === 'mapa-mental';
    const hasMapaMentalData = isMapaMental && (
      (formData.centralTheme && formData.centralTheme !== '') ||
      (formData.mainCategories && formData.mainCategories !== '') ||
      (formData.generalObjective && formData.generalObjective !== '') ||
      (formData.evaluationCriteria && formData.evaluationCriteria !== '')
    );

    if (isFormValid && preenchidoPorIA && !activity.isBuilt) {
      console.log('🤖 Agente Interno de Execução: Detectados campos preenchidos pela IA e formulário válido');

      if (isFlashCards) {
        console.log('🃏 Processamento específico para Flash Cards detectado');
        console.log('📊 Estado dos dados de Flash Cards:', {
          theme: formData.theme,
          topicos: formData.topicos,
          numberOfFlashcards: formData.numberOfFlashcards,
          context: formData.context,
          hasFlashCardsData
        });
      } else if (isQuadroInterativo) {
        console.log('🖼️ Processamento específico para Quadro Interativo detectado');
        console.log('📊 Estado dos dados do Quadro Interativo:', {
          subject: formData.subject,
          schoolYear: formData.schoolYear,
          theme: formData.theme,
          objectives: formData.objectives,
          difficultyLevel: formData.difficultyLevel,
          quadroInterativoCampoEspecifico: formData.quadroInterativoCampoEspecifico,
          hasQuadroInterativoData
        });
      } else if (isQuizInterativo) {
        console.log('🎯 Processamento específico para Quiz Interativo detectado');
        console.log('📊 Estado dos dados do Quiz Interativo:', {
          subject: formData.subject,
          schoolYear: formData.schoolYear,
          theme: formData.theme,
          numberOfQuestions: formData.numberOfQuestions,
          difficultyLevel: formData.difficultyLevel,
          questionModel: formData.questionModel,
          format: formData.format,
          timePerQuestion: formData.timePerQuestion,
          hasQuizInterativoData
        });
      } else if (isMapaMental) {
        console.log('🧠 Processamento específico para Mapa Mental detectado');
        console.log('📊 Estado dos dados do Mapa Mental:', {
          centralTheme: formData.centralTheme,
          mainCategories: formData.mainCategories,
          generalObjective: formData.generalObjective,
          evaluationCriteria: formData.evaluationCriteria,
          hasMapaMentalData
        });
      }

      console.log('🎯 Acionando construção automática da atividade...');

      const timer = setTimeout(async () => {
          await handleBuildActivity(); // This will now call the appropriate handler internally
          console.log('✅ Atividade construída automaticamente pelo agente interno');
        }, isQuizInterativo ? 800 : (isFlashCards ? 800 : (isQuadroInterativo ? 500 : (isMapaMental ? 300 : 300)) )); // Increased delay for Flash Cards for API call

      return () => clearTimeout(timer);
    }
  }, [
    activity?.id,
    isOpen,
    formData.theme,
    formData.topicos,
    formData.numberOfFlashcards,
    formData.context,
    formData.subject,
    formData.schoolYear,
    formData.objectives,
    formData.difficultyLevel,
    formData.numberOfQuestions,
    formData.questionModel,
    formData.quadroInterativoCampoEspecifico,
    formData.centralTheme,
    formData.mainCategories,
    formData.generalObjective,
    formData.evaluationCriteria,
    activity?.preenchidoAutomaticamente,
    activity?.isBuilt,
    isFormValidForBuild, // Include dependency
    handleBuildActivity // Include dependency
  ]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-7xl w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              {(() => {
                  const ActivityIcon = getActivityIcon(activity?.id || '');
                  return <ActivityIcon className="w-6 h-6" />;
                })()}
                <div>
                  <h2 className="text-xl font-bold">Editar Materiais - {activity?.title}</h2>
                  <p className="text-orange-100 text-sm">Configure os materiais e gere o conteúdo da atividade</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('editar')}
                  className={`text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'editar' ? 'bg-white/20 shadow-md' : ''
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="font-medium text-sm">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  className={`text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'preview' ? 'bg-white/20 shadow-md' : ''
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium text-sm">Pré-visualização</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 h-[calc(800px-180px)] overflow-hidden">
            {activeTab === 'editar' && (
            <div className="flex gap-6 h-full">
              <div className="flex flex-col space-y-4 overflow-y-auto flex-1 pr-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[#FF6B00]" />
                      Informações da Atividade
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-sm">Título da Atividade</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Digite o título da atividade"
                          className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Descreva a atividade..."
                          className="mt-1 min-h-[80px] text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      {/* Renderização condicional dos componentes de edição */}
                      {(() => {
                        const activityType = activity?.id || '';

                        return (
                          <>
                            {/* Campos Genéricos */}
                            {(activityType !== 'sequencia-didatica' && activityType !== 'plano-aula' && activityType !== 'quadro-interativo' && activityType !== 'quiz-interativo' && activityType !== 'mapa-mental' && activityType !== 'flash-cards' && activityType !== 'tese-redacao') && (
                              <DefaultEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Sequência Didática */}
                            {activityType === 'sequencia-didatica' && (
                              <SequenciaDidaticaEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Plano de Aula */}
                            {activityType === 'plano-aula' && (
                              <PlanoAulaEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Quiz Interativo */}
                            {activityType === 'quiz-interativo' && (
                              <QuizInterativoEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Quadro Interativo */}
                            {activityType === 'quadro-interativo' && (
                              <QuadroInterativoEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Lista de Exercícios */}
                            {activityType === 'lista-exercicios' && (
                              <ListaExerciciosEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Mapa Mental */}
                            {activityType === 'mapa-mental' && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="centralTheme" className="text-sm">Tema Central *</Label>
                                  <Input
                                    id="centralTheme"
                                    value={formData.centralTheme}
                                    onChange={(e) => handleInputChange('centralTheme', e.target.value)}
                                    placeholder="Digite o tema central do mapa mental"
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="mainCategories" className="text-sm">Categorias Principais *</Label>
                                  <Textarea
                                    id="mainCategories"
                                    value={formData.mainCategories}
                                    onChange={(e) => handleInputChange('mainCategories', e.target.value)}
                                    placeholder="Liste as categorias principais (uma por linha)..."
                                    rows={3}
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="generalObjective" className="text-sm">Objetivo Geral *</Label>
                                  <Textarea
                                    id="generalObjective"
                                    value={formData.generalObjective}
                                    onChange={(e) => handleInputChange('generalObjective', e.target.value)}
                                    placeholder="Descreva o objetivo geral do mapa mental..."
                                    rows={2}
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="evaluationCriteria" className="text-sm">Critérios de Avaliação *</Label>
                                  <Textarea
                                    id="evaluationCriteria"
                                    value={formData.evaluationCriteria}
                                    onChange={(e) => handleInputChange('evaluationCriteria', e.target.value)}
                                    placeholder="Como o mapa mental será avaliado..."
                                    rows={2}
                                    required
                                    className="mt-1 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Campos Específicos Flash Cards */}
                            {activityType === 'flash-cards' && (
                              <FlashCardsEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}

                            {/* Campos Específicos Tese da Redação */}
                            {activityType === 'tese-redacao' && (
                              <TeseRedacaoEditActivity formData={formData} onFieldChange={handleInputChange} />
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  id="build-activity-button"
                  data-testid="build-activity-button"
                  onClick={() => {
                    const activityType = activity?.id || '';
                    if (activityType === 'quiz-interativo') {
                      handleGenerateQuizInterativo();
                    } else if (activityType === 'flash-cards') {
                      handleGenerateFlashCards();
                    } else {
                      handleBuildActivity();
                    }
                  }}
                  disabled={isBuilding || isGeneratingQuiz}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuilding || isGeneratingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isGeneratingQuiz ? 'Gerando Quiz...' : (activity?.id === 'quiz-interativo' ? 'Gerando Quiz...' : 'Gerando Atividade...')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {activity?.id === 'quiz-interativo' ? 'Gerar Quiz com IA' : (activity?.id === 'flash-cards' ? 'Gerar Flash Cards' : 'Construir Atividade')}
                    </>
                  )}
                </Button>
              </div>
            </div>
            )}

            {activeTab === 'preview' && (
              <div className="h-full">
                <div className="border rounded-lg h-full overflow-hidden bg-white dark:bg-gray-800">
                  {(isContentLoaded && (generatedContent || quizInterativoContent || flashCardsContent || teseRedacaoContent)) ? (
                    activity?.id === 'plano-aula' ? (
                      <PlanoAulaPreview
                        data={generatedContent}
                        activityData={activity}
                      />
                    ) : activity?.id === 'lista-exercicios' ? (
                      <ExerciseListPreview
                        data={processExerciseListData(formData, generatedContent)}
                        content={generatedContent}
                        activityData={activity}
                        onRegenerateContent={handleRegenerateContent}
                      />
                    ) : activity?.id === 'sequencia-didatica' ? (
                      <SequenciaDidaticaPreview
                        data={generatedContent || formData}
                      />
                    ) : activity?.id === 'quadro-interativo' ? (
                      <QuadroInterativoPreview
                        data={generatedContent?.data || generatedContent || formData}
                        activityData={activity}
                      />
                    ) : activity?.id === 'quiz-interativo' ? (
                      <QuizInterativoPreview // Use the specific preview component for Quiz Interativo
                        content={quizInterativoContent || generatedContent}
                        isLoading={isGeneratingQuiz}
                      />
                    ) : activity?.id === 'mapa-mental' ? ( // Preview para Mapa Mental
                      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                        <FileText className="h-16 w-16 text-gray-400 mb-4" />
                        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Mapa Mental Gerado
                        </h4>
                        <div className="text-left space-y-2 text-gray-700 dark:text-gray-300">
                          <p><strong>Título:</strong> {generatedContent?.title || formData.title}</p>
                          <p><strong>Descrição:</strong> {generatedContent?.description || formData.description}</p>
                          <p><strong>Tema Central:</strong> {generatedContent?.centralTheme || formData.centralTheme}</p>
                          <p><strong>Categorias Principais:</strong> {generatedContent?.mainCategories.split('\n').map((line: string, i: number) => <span key={i}>{line}<br/></span>)}</p>
                          <p><strong>Objetivo Geral:</strong> {generatedContent?.generalObjective || formData.generalObjective}</p>
                          <p><strong>Critérios de Avaliação:</strong> {generatedContent?.evaluationCriteria || formData.evaluationCriteria}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                          Esta é uma pré-visualização textual. A representação visual do Mapa Mental será gerada em uma ferramenta específica.
                        </p>
                      </div>
                    ) : activity?.id === 'flash-cards' ? ( // Preview para Flash Cards
                      <FlashCardsPreview // Use the specific preview component for Flash Cards
                        content={flashCardsContent || generatedContent}
                        isLoading={isBuilding}
                      />
                    ) : activity?.id === 'tese-redacao' ? ( // Preview para Tese da Redação
                      <TeseRedacaoPreview // Use the specific preview component for Tese de Redação
                        content={teseRedacaoContent || generatedContent}
                        isLoading={isBuilding}
                      />
                    ) : (
                      <ActivityPreview
                        content={generatedContent || formData}
                        activityData={activity}
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Nenhuma atividade gerada ainda
                      </h4>
                      <p className="text-gray-500 dark:text-gray-500 mb-4">
                        Preencha os campos na aba "Editar" e clique em "Construir Atividade" para gerar o conteúdo
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('editar')}
                        className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
                      >
                        Ir para Edição
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating || isGeneratingQuiz}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
            {(generatedContent || quizInterativoContent || flashCardsContent || teseRedacaoContent) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const contentToCopy = teseRedacaoContent || flashCardsContent || quizInterativoContent || generatedContent;
                      navigator.clipboard.writeText(JSON.stringify(contentToCopy, null, 2));
                      toast({
                        title: "Conteúdo copiado!",
                        description: "O conteúdo da pré-visualização foi copiado para a área de transferência.",
                      });
                    }}
                    className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copiar Conteúdo
                  </Button>
                </>
              )}
             {(generatedContent || quizInterativoContent || flashCardsContent || teseRedacaoContent) && (
              <Button
                variant="outline"
                onClick={() => {
                  clearContent(); // Clear generic content
                  setQuizInterativoContent(null); // Clear specific quiz content
                  setFlashCardsContent(null); // Clear specific flashcards content
                  setTeseRedacaoContent(null); // Clear specific tese redação content
                  setIsContentLoaded(false); // Reset content loaded state
                  toast({
                    title: "Conteúdo Limpo",
                    description: "Todo o conteúdo gerado foi removido.",
                  });
                }}
                className="px-4 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Limpar Conteúdo
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="px-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Usar Portal para renderizar o modal no body, garantindo que fique por cima de todos os componentes
  return createPortal(modalContent, document.body);
});

EditActivityModal.displayName = 'EditActivityModal';

export default EditActivityModal;
export { EditActivityModal };
export type { EditActivityModalHandle };
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, BookOpen, ChevronLeft, ChevronRight, FileText, Clock, Star, Users, Calendar, GraduationCap, Info, Target, Award } from "lucide-react"; // Import Eye component
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '@/features/schoolpower/activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuadroInterativoPreview from '@/features/schoolpower/activities/quadro-interativo/QuadroInterativoPreview';

// Helper function to get activity icon (assuming it's defined elsewhere or needs to be added)
// This is a placeholder, replace with actual implementation if needed.
const getActivityIcon = (activityId: string) => {
  // Example: return an icon component based on activityId
  return ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c0-1.707.833-3.123 2.12-4.119C15.387 2.507 17.017 2 19 2s3.613.507 4.88-1.881C24.833 1.707 24 3.123 24 5v10a2 2 0 01-2 2H2a2 2 0 01-2-2V5c0-1.877.847-3.293 2.12-4.119C4.167 0.507 5.993 0 8 0s3.833.507 5.12 1.881C14.833 1.707 14 3.123 14 5v10z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v16M8 20h8" />
    </svg>
  );
};


interface ActivityViewModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
}

export function ActivityViewModal({ isOpen, activity, onClose }: ActivityViewModalProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [questoesExpandidas, setQuestoesExpandidas] = useState<{ [key: string]: boolean }>({});
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isInQuestionView, setIsInQuestionView] = useState<boolean>(false);
  const isLightMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const [activeSection, setActiveSection] = useState('informacoes-basicas'); // Default to basic info

  // Placeholder for getTargetAudience - replace with actual logic if needed
  const getTargetAudience = () => {
    return activity?.customFields?.publicoAlvo || 'Todos os alunos';
  };

  // Placeholder for sections array - replace with actual logic if needed
  const sections = [
    { id: 'informacoes-basicas', title: 'Informações Básicas', icon: Info },
    { id: 'detalhes-atividade', title: 'Detalhes da Atividade', icon: Target },
    { id: 'objetivos-aprendizagem', title: 'Objetivos de Aprendizagem', icon: Award },
  ];

  // Função específica para carregar dados do Plano de Aula
  const loadPlanoAulaData = (activityId: string) => {
    console.log('🔍 ActivityViewModal: Carregando dados específicos do Plano de Aula para:', activityId);

    const cacheKeys = [
      `constructed_plano-aula_${activity.id}`, // Use activity.id for specificity
      `schoolpower_plano-aula_content`,
      `activity_${activity.id}`,
      `activity_fields_${activity.id}`
    ];

    for (const key of cacheKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          console.log(`✅ Dados encontrados em ${key}:`, parsedData);
          return parsedData;
        } catch (error) {
          console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
        }
      }
    }

    console.log('⚠️ Nenhum dado específico encontrado para plano-aula');
    return null;
  };

  // Resetar estado do sidebar quando o modal abre
  React.useEffect(() => {
    if (isOpen) {
      setShowSidebar(false);
      setSelectedQuestionId(null);
      setSelectedQuestionIndex(null);
      setIsInQuestionView(false);

      // If it's a Plano de Aula, try to load specific data
      if (activity?.type === 'plano-aula' || activity?.id === 'plano-aula') {
        const planoData = loadPlanoAulaData(activity.id);
        if (planoData) {
          console.log('📚 Plano de aula data loaded successfully:', planoData);
        }
      }
    }
  }, [isOpen, activity]);

  if (!isOpen || !activity) return null;

  // Function to handle question selection
  const handleQuestionSelect = (questionIndex: number, questionId: string) => {
    setSelectedQuestionIndex(questionIndex);
    setSelectedQuestionId(questionId);
    setIsInQuestionView(true);
  };

  // Function to scroll to a specific question
  const scrollToQuestion = (questionId: string, questionIndex?: number) => {
    setSelectedQuestionId(questionId);
    if (questionIndex !== undefined) {
      setSelectedQuestionIndex(questionIndex);
      setIsInQuestionView(true);
    }
    const questionElement = document.getElementById(`question-${questionId}`);
    if (questionElement && contentRef.current) {
      questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  // Get questions for the sidebar
  const getQuestionsForSidebar = () => {
    const activityType = activity.originalData?.type || activity.categoryId || activity.type || 'lista-exercicios';

    if (activityType !== 'lista-exercicios') return [];

    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');

    const previewData = {
      ...activity.originalData,
      ...storedData,
      customFields: {
        ...activity.customFields,
        ...JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}')
      }
    };

    // Fetch questions from different possible locations
    let questoes = [];
    if (previewData.questoes && Array.isArray(previewData.questoes)) {
      questoes = previewData.questoes;
    } else if (previewData.questions && Array.isArray(previewData.questions)) {
      questoes = previewData.questions;
    } else if (previewData.content && previewData.content.questoes) {
      questoes = previewData.content.questoes;
    } else if (previewData.content && previewData.content.questions) {
      questoes = previewData.content.questions;
    }

    // Apply exclusion filter
    try {
      const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
      if (deletedQuestionsJson) {
        const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
        questoes = questoes.filter(questao => !deletedQuestionIds.includes(questao.id || `questao-${questoes.indexOf(questao) + 1}`));
        console.log(`🔍 Sidebar: Filtered questions for navigation. ${questoes.length} questions remaining after exclusions`);
      }
    } catch (error) {
      console.warn('⚠️ Error applying exclusions filter in sidebar:', error);
    }

    return questoes.map((questao, index) => ({
      id: questao.id || `questao-${index + 1}`,
      numero: index + 1,
      dificuldade: (questao.dificuldade || questao.difficulty || 'medio').toLowerCase(),
      tipo: questao.type || questao.tipo || 'multipla-escolha',
      completed: false, // Can be expanded to track progress
      enunciado: questao.enunciado || questao.statement || 'Sem enunciado' // Added for sidebar display
    }));
  };

  const questionsForSidebar = getQuestionsForSidebar();
  const isExerciseList = (activity.originalData?.type || activity.categoryId || activity.type) === 'lista-exercicios';

  // Determine activity type CORRECTLY
    const activityType = activity.type || 
                        activity.originalData?.type || 
                        activity.id?.includes('quadro-interativo') ? 'quadro-interativo' :
                        activity.id?.includes('lista') ? 'lista-exercicios' :
                        activity.id?.includes('sequencia') ? 'sequencia-didatica' :
                        activity.id?.includes('plano') ? 'plano-aula' :
                        'default';

  // Function to get the activity title
  const getActivityTitle = () => {
    if (activityType === 'plano-aula') {
      const planoTitle = localStorage.getItem(`activity_${activity.id}`) ? JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.titulo || JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.title || activity.title || activity.personalizedTitle || 'Plano de Aula' : activity.title || activity.personalizedTitle || 'Plano de Aula';
      const tema = localStorage.getItem(`activity_${activity.id}`) ? JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.tema || JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.['Tema ou Tópico Central'] || '' : '';
      return tema ? `${planoTitle}: ${tema}` : planoTitle;
    }
    return activity.title || activity.personalizedTitle || 'Atividade';
  };

  // Function to get additional Plano de Aula information for the header
  const getPlanoAulaHeaderInfo = () => {
    if (activityType !== 'plano-aula') return null;

    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');

    const disciplina = storedData?.disciplina || storedData?.['Componente Curricular'] || 'Matemática';
    const anoEscolar = storedData?.ano_escolar || storedData?.['Ano Escolar'] || '6° ano';
    const duracao = storedData?.duracao || storedData?.['Duração da Aula'] || '2 aulas de 50 minutos';

    return {
      disciplina,
      anoEscolar,
      duracao
    };
  };

  const getDifficultyColor = (dificuldade: string) => {
    switch (dificuldade.toLowerCase()) {
      case 'facil':
      case 'fácil':
      case 'básico':
      case 'basico':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'medio':
      case 'médio':
      case 'intermediário':
      case 'intermediario':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'dificil':
      case 'difícil':
      case 'avançado':
      case 'avancado':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const renderActivityPreview = () => {
    // Attempt to retrieve data from localStorage if not available
    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}');

    console.log('💾 ActivityViewModal: Stored data:', storedData);
    console.log('🗂️ ActivityViewModal: Stored fields:', storedFields);

    // Prepare data for preview EXACTLY as in the edit modal
    let previewData = {
      ...activity.originalData,
      ...storedData,
      title: activity.personalizedTitle || activity.title || storedData.title,
      description: activity.personalizedDescription || activity.description || storedData.description,
      customFields: {
        ...activity.customFields,
        ...storedFields
      },
      type: activityType,
      // Include all fields that might be in originalData
      exercicios: activity.originalData?.exercicios || storedData.exercicios,
      questions: activity.originalData?.questions || storedData.questions,
      content: activity.originalData?.content || storedData.content
    };

    // For exercise lists, apply exclusion filters
      if (activityType === 'lista-exercicios') {
        try {
          const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
          if (deletedQuestionsJson) {
            const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
            console.log(`🔍 ActivityViewModal: Applying exclusion filter. Excluded IDs:`, deletedQuestionIds);

            // Filter out excluded questions in all possible locations
            if (previewData.questoes && Array.isArray(previewData.questoes)) {
              previewData.questoes = previewData.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
              console.log(`🗑️ Filtered questions in root: ${previewData.questoes.length} remaining`);
            }

            if (previewData.content?.questoes && Array.isArray(previewData.content.questoes)) {
              previewData.content.questoes = previewData.content.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
              console.log(`🗑️ Filtered questions in content: ${previewData.content.questoes.length} remaining`);
            }

            if (previewData.questions && Array.isArray(previewData.questions)) {
              previewData.questions = previewData.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
              console.log(`🗑️ Filtered questions: ${previewData.questions.length} remaining`);
            }

            if (previewData.content?.questions && Array.isArray(previewData.content.questions)) {
              previewData.content.questions = previewData.content.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
              console.log(`🗑️ Filtered content questions: ${previewData.content.questions.length} remaining`);
            }

            // Add excluded IDs to the data for reference
            previewData.deletedQuestionIds = deletedQuestionIds;
          }
        } catch (error) {
          console.warn('⚠️ Error applying exclusions filter in ActivityViewModal:', error);
        }
      }

      // For Sequência Didática, load specific AI data
      if (activityType === 'sequencia-didatica') {
        console.log('📚 ActivityViewModal: Processing Sequência Didática');

        // Check multiple data sources in order of priority
        const sequenciaCacheKeys = [
          `constructed_sequencia-didatica_${activity.id}`,
          `schoolpower_sequencia-didatica_content`,
          `activity_${activity.id}`,
          `activity_fields_${activity.id}`
        ];

        let sequenciaContent = null;
        for (const key of sequenciaCacheKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              // Check if it has a valid structure for didactic sequence
              if (parsedData.sequenciaDidatica || 
                  parsedData.aulas || 
                  parsedData.diagnosticos || 
                  parsedData.avaliacoes ||
                  parsedData.data?.sequenciaDidatica ||
                  parsedData.success) {
                sequenciaContent = parsedData;
                console.log(`✅ Didactic Sequence data found in ${key}:`, parsedData);
                break;
              }
            } catch (error) {
              console.warn(`⚠️ Error parsing data from ${key}:`, error);
            }
          }
        }

        if (sequenciaContent) {
          // Process data according to the found structure
          let processedData = sequenciaContent;

          // If data is within 'data' (API result)
          if (sequenciaContent.data) {
            processedData = sequenciaContent.data;
          }

          // If it has success and structured data
          if (sequenciaContent.success && sequenciaContent.data) {
            processedData = sequenciaContent.data;
          }

          // Merge didactic sequence data with existing data
          previewData = {
            ...previewData,
            ...processedData,
            id: activity.id,
            type: activityType,
            title: processedData.sequenciaDidatica?.titulo || 
                   processedData.titulo || 
                   processedData.title || 
                   previewData.title,
            description: processedData.sequenciaDidatica?.descricaoGeral || 
                        processedData.descricaoGeral || 
                        processedData.description || 
                        previewData.description,
            // Ensure complete structure for visualization
            sequenciaDidatica: processedData.sequenciaDidatica || processedData,
            metadados: processedData.metadados || {
              totalAulas: processedData.aulas?.length || 0,
              totalDiagnosticos: processedData.diagnosticos?.length || 0,
              totalAvaliacoes: processedData.avaliacoes?.length || 0,
              isGeneratedByAI: true,
              generatedAt: processedData.generatedAt || new Date().toISOString()
            }
          };
          console.log('📚 Processed didactic sequence data for visualization:', previewData);
        } else {
          console.log('⚠️ No specific didactic sequence content found');
          // Create basic structure from form data
          previewData = {
            ...previewData,
            sequenciaDidatica: {
              titulo: previewData.title || 'Sequência Didática',
              descricaoGeral: previewData.description || 'Descrição da sequência didática',
              aulas: [],
              diagnosticos: [],
              avaliacoes: []
            },
            metadados: {
              totalAulas: 0,
              totalDiagnosticos: 0,
              totalAvaliacoes: 0,
              isGeneratedByAI: false,
              generatedAt: new Date().toISOString()
            }
          };
        }
      }

      // For Quadro Interativo, load specific AI data and return ONLY the content, no cards
      if (activityType === 'quadro-interativo') {
        console.log('🖼️ ActivityViewModal: Processing Quadro Interativo');

        // Check multiple data sources in order of priority
        const quadroKeys = [
          `constructed_quadro-interativo_${activity.id}`,
          `activity_content_${activity.id}`,
          `schoolpower_quadro-interativo_content`
        ];

        let quadroContent = null;
        for (const key of quadroKeys) {
          const content = localStorage.getItem(key);
          if (content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed && (parsed.titulo || parsed.conteudo || parsed.data || parsed.introducao)) {
                quadroContent = parsed.data || parsed;
                console.log(`✅ Quadro Interativo data found in ${key}:`, parsed);
                break;
              }
            } catch (error) {
              console.warn(`⚠️ Error parsing data from ${key}:`, error);
            }
          }
        }

        if (quadroContent) {
          // Process data according to the found structure
          let processedData = quadroContent;

          // If data is within 'data' (API result)
          if (quadroContent.data) {
            processedData = quadroContent.data;
          }

          // If it has success and structured data
          if (quadroContent.success && quadroContent.data) {
            processedData = quadroContent.data;
          }

          // Merge quadro data with existing data
          previewData = {
            ...previewData,
            ...processedData,
            id: activity.id,
            type: activityType,
            title: processedData.titulo || 
                   processedData.title || 
                   previewData.title,
            description: processedData.descricao || 
                        processedData.description || 
                        previewData.description,
            // Ensure complete structure for visualization
            conteudo: processedData.conteudo || processedData,
            introducao: processedData.introducao,
            conceitosPrincipais: processedData.conceitosPrincipais,
            exemplosPraticos: processedData.exemplosPraticos,
            atividadesPraticas: processedData.atividadesPraticas,
            resumo: processedData.resumo,
            proximosPassos: processedData.proximosPassos,
            metadados: processedData.metadados || {
              isGeneratedByAI: true,
              generatedAt: processedData.generatedAt || new Date().toISOString()
            }
          };
          console.log('🖼️ Processed quadro interativo data for visualization:', previewData);
        } else {
          console.log('⚠️ No specific quadro interativo content found');
          // Create basic structure from form data
          previewData = {
            ...previewData,
            conteudo: {
              titulo: previewData.title || 'Quadro Interativo',
              descricao: previewData.description || 'Conteúdo do quadro interativo',
              introducao: 'Conteúdo será carregado quando gerado pela IA',
              conceitosPrincipais: [],
              exemplosPraticos: [],
              atividadesPraticas: [],
              resumo: '',
              proximosPassos: []
            },
            metadados: {
              isGeneratedByAI: false,
              generatedAt: new Date().toISOString()
            }
          };
        }
      }

    console.log('📊 ActivityViewModal: Final data for preview:', previewData);

    switch (activityType) {
      case 'lista-exercicios':
        return (
          <ExerciseListPreview
            data={previewData}
            customFields={previewData.customFields}
            onQuestionSelect={handleQuestionSelect}
          />
        );

      case 'plano-aula':
        console.log('📚 Rendering PlanoAulaPreview with data:', previewData);
        return (
          <PlanoAulaPreview
            data={previewData}
            activityData={activity}
          />
        );

      case 'sequencia-didatica':
        console.log('📚 Rendering SequenciaDidaticaPreview with data:', previewData);
        return (
          <SequenciaDidaticaPreview
            data={previewData}
            activityData={activity}
          />
        );

      case 'quadro-interativo':
        console.log('🖼️ Rendering Quadro Interativo preview:', previewData);
        return (
          <QuadroInterativoPreview
            data={previewData}
            activityData={activity}
          />
        );

      default:
        return (
          <ActivityPreview
            data={previewData}
            activityType={activityType}
            customFields={previewData.customFields}
          />
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          className={`${activityType === 'plano-aula' ? 'max-w-7xl' : 'max-w-6xl'} w-full max-h-[90vh] ${isLightMode ? 'bg-white' : 'bg-gray-800'} rounded-lg shadow-xl overflow-hidden flex flex-col`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Apply orange background to header when it's a Plano de Aula */}
          <style jsx>{`
            .modal-header {
              background: ${activityType === 'plano-aula'
                ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%)'
                : 'transparent'
              };
            }
          `}</style>

          {/* Header with Close button */}
          {isExerciseList && (
            <div className="bg-orange-50 dark:bg-gray-800/50 border-b border-orange-200 dark:border-gray-700 px-6 py-4 mb-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    {isInQuestionView && selectedQuestionIndex !== null ? (
                      <span className="text-white font-bold text-sm">
                        {selectedQuestionIndex + 1}
                      </span>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    {isInQuestionView && selectedQuestionIndex !== null ? (
                      <>
                        <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                          Questão {selectedQuestionIndex + 1} de {questionsForSidebar.length}
                        </h2>
                        <p className="text-orange-700 dark:text-orange-300 text-sm">
                          {activity?.personalizedTitle || activity?.title || 'Lista de Exercícios'} - {activity?.originalData?.tema || 'Nível Introdutório'}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                          {activity?.personalizedTitle || activity?.title || 'Lista de Exercícios'}
                        </h2>
                        <p className="text-orange-700 dark:text-orange-300 text-sm">
                          {activity?.personalizedDescription || activity?.description || 'Exercícios práticos para fixação do conteúdo'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Tags and Info */}
                  <div className="flex flex-wrap gap-2">
                    {activity?.originalData?.disciplina && (
                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {activity.originalData.disciplina}
                      </Badge>
                    )}
                    {activity?.originalData?.tema && (
                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2v5a2 2 0 002 2h6a2 2 0 002-2v-5h2a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-6M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m4-8h6m0 0v6m0-6l-6 6" />
                        </svg>
                        {activity.originalData.tema}
                      </Badge>
                    )}
                    {questionsForSidebar.length > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        {questionsForSidebar.length} questões
                      </Badge>
                    )}

                  </div>
                </div>

                {/* Close button - positioned in the extreme right */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Non-Exercise List Header */}
          {!isExerciseList && (
            <div className="modal-header flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                  activityType === 'plano-aula'
                    ? 'bg-orange-100'
                    : isLightMode ? 'bg-blue-100' : 'bg-blue-900/30'
                }`}>
                  <BookOpen className={`h-6 w-6 ${
                    activityType === 'plano-aula'
                      ? 'text-orange-600'
                      : isLightMode ? 'text-blue-600' : 'text-blue-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl font-semibold ${
                    activityType === 'plano-aula' ? 'text-white' : ''
                  }`}>
                    {getActivityTitle()}
                  </h2>
                  {activityType === 'plano-aula' ? (
                    <div className="flex items-center gap-4 mt-1">
                      {(() => {
                        const headerInfo = getPlanoAulaHeaderInfo();
                        return headerInfo ? (
                          <>
                            <div className="flex items-center gap-1 text-white/90 text-sm">
                              <BookOpen className="h-4 w-4" />
                              <span>{headerInfo.disciplina} (Integrado com Português)</span>
                            </div>
                            <div className="flex items-center gap-1 text-white/90 text-sm">
                              <GraduationCap className="h-4 w-4" />
                              <span>{headerInfo.anoEscolar}</span>
                            </div>
                            <div className="flex items-center gap-1 text-white/90 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>{headerInfo.duracao}</span>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {activity.description || activity.personalizedDescription || 'Visualizar atividade'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activityType === 'plano-aula' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Simular Aula
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className={`${
                    activityType === 'plano-aula'
                      ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      : isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
                  }`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}


          {/* Content Layout */}
          <div className="flex flex-1 overflow-hidden" style={{ height: isExerciseList ? 'calc(100% - 140px)' : 'calc(100% - 100px)' }}>
            {/* Question Navigation Sidebar - Only for Exercise Lists and when showSidebar is true */}
            {isExerciseList && questionsForSidebar.length > 0 && showSidebar && (
              <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto flex-shrink-0">
                <div className="p-4 space-y-4">
                  {/* Summary Card */}
                  <Card className="bg-white dark:bg-gray-700 shadow-sm">
                    <CardContent className="p-3">
                      <div className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">Questões:</span>
                          <span className="font-semibold dark:text-white">{questionsForSidebar.length}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-600 dark:text-gray-300">Total de pontos:</span>
                          <span className="font-semibold dark:text-white">{questionsForSidebar.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Questions List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Navegação</h4>
                    {questionsForSidebar.map((question, index) => (
                      <button
                        key={question.id}
                        onClick={() => scrollToQuestion(question.id, index)}
                        className={`w-full text-left p-2 text-xs rounded transition-colors ${
                          selectedQuestionId === question.id
                            ? 'bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 font-medium text-orange-800 dark:text-orange-200'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="font-medium dark:text-white">Questão {index + 1}</div>
                        <div className="text-gray-500 dark:text-gray-400 truncate mt-1">
                          {question.enunciado?.substring(0, 40)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area - Full Width */}
            <div className="flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)] bg-white dark:bg-gray-900" ref={contentRef}>
                {renderActivityPreview()}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Default export for compatibility
export default ActivityViewModal;
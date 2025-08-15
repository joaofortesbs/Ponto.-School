import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, BookOpen, ChevronLeft, ChevronRight, FileText, Clock, Star, Users, Calendar, GraduationCap } from "lucide-react"; // Import Eye component
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '@/features/schoolpower/activities/sequencia-didatica/SequenciaDidaticaPreview';

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

      // Se for plano-aula, tentar carregar dados específicos
      if (activity?.type === 'plano-aula' || activity?.id === 'plano-aula') {
        const planoData = loadPlanoAulaData(activity.id);
        if (planoData) {
          console.log('📚 Dados do plano-aula carregados com sucesso:', planoData);
        }
      }
    }
  }, [isOpen, activity]);

  if (!isOpen || !activity) return null;

  // Função para lidar com seleção de questão
  const handleQuestionSelect = (questionIndex: number, questionId: string) => {
    setSelectedQuestionIndex(questionIndex);
    setSelectedQuestionId(questionId);
    setIsInQuestionView(true);
  };

  // Função para rolar para uma questão específica
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

  // Obter questões para o sidebar
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

    // Buscar questões em diferentes possíveis localizações
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

    // Aplicar filtro de exclusões
    try {
      const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
      if (deletedQuestionsJson) {
        const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
        questoes = questoes.filter(questao => !deletedQuestionIds.includes(questao.id || `questao-${questoes.indexOf(questao) + 1}`));
        console.log(`🔍 Sidebar: Questões filtradas para navegação. ${questoes.length} questões restantes após exclusões`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao aplicar filtro de exclusões no sidebar:', error);
    }

    return questoes.map((questao, index) => ({
      id: questao.id || `questao-${index + 1}`,
      numero: index + 1,
      dificuldade: (questao.dificuldade || questao.difficulty || 'medio').toLowerCase(),
      tipo: questao.type || questao.tipo || 'multipla-escolha',
      completed: false, // Pode ser expandido para rastrear progresso
      enunciado: questao.enunciado || questao.statement || 'Sem enunciado' // Adicionado para exibição no sidebar
    }));
  };

  const questionsForSidebar = getQuestionsForSidebar();
  const isExerciseList = (activity.originalData?.type || activity.categoryId || activity.type) === 'lista-exercicios';
  const activityType = activity.originalData?.type || activity.categoryId || activity.type || 'lista-exercicios';

  // Função para obter o título da atividade
  const getActivityTitle = () => {
    if (activityType === 'plano-aula') {
      const planoTitle = localStorage.getItem(`activity_${activity.id}`) ? JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.titulo || JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.title || activity.title || activity.personalizedTitle || 'Plano de Aula' : activity.title || activity.personalizedTitle || 'Plano de Aula';
      const tema = localStorage.getItem(`activity_${activity.id}`) ? JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.tema || JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.['Tema ou Tópico Central'] || '' : '';
      return tema ? `${planoTitle}: ${tema}` : planoTitle;
    }
    return activity.title || activity.personalizedTitle || 'Atividade';
  };

  // Função para obter informações adicionais do Plano de Aula para o cabeçalho
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
    // Tentar recuperar dados do localStorage se não estiverem disponíveis
    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}');

    console.log('💾 ActivityViewModal: Dados armazenados:', storedData);
    console.log('🗂️ ActivityViewModal: Campos armazenados:', storedFields);

    // Preparar dados para o preview EXATAMENTE como no modal de edição
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
      // Incluir todos os campos que podem estar no originalData
      exercicios: activity.originalData?.exercicios || storedData.exercicios,
      questions: activity.originalData?.questions || storedData.questions,
      content: activity.originalData?.content || storedData.content
    };

    // Para lista de exercícios, aplicar filtros de exclusão
      if (activityType === 'lista-exercicios') {
        try {
          const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
          if (deletedQuestionsJson) {
            const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
            console.log(`🔍 ActivityViewModal: Aplicando filtro de exclusões. IDs excluídos:`, deletedQuestionIds);

            // Filtrar questões excluídas em todas as possíveis localizações
            if (previewData.questoes && Array.isArray(previewData.questoes)) {
              previewData.questoes = previewData.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
              console.log(`🗑️ Questões filtradas na raiz: ${previewData.questoes.length} restantes`);
            }

            if (previewData.content?.questoes && Array.isArray(previewData.content.questoes)) {
              previewData.content.questoes = previewData.content.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
              console.log(`🗑️ Questões filtradas no content: ${previewData.content.questoes.length} restantes`);
            }

            if (previewData.questions && Array.isArray(previewData.questions)) {
              previewData.questions = previewData.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
              console.log(`🗑️ Questions filtradas: ${previewData.questions.length} restantes`);
            }

            if (previewData.content?.questions && Array.isArray(previewData.content.questions)) {
              previewData.content.questions = previewData.content.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
              console.log(`🗑️ Content questions filtradas: ${previewData.content.questions.length} restantes`);
            }

            // Adicionar os IDs excluídos aos dados para referência
            previewData.deletedQuestionIds = deletedQuestionIds;
          }
        } catch (error) {
          console.warn('⚠️ Erro ao aplicar filtro de exclusões no ActivityViewModal:', error);
        }
      }

      // Para Sequência Didática, carregar dados específicos da IA
      if (activityType === 'sequencia-didatica') {
        console.log('📚 ActivityViewModal: Processando Sequência Didática');

        // Verificar múltiplas fontes de dados em ordem de prioridade
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
              // Verificar se tem estrutura válida de sequência didática
              if (parsedData.sequenciaDidatica || 
                  parsedData.aulas || 
                  parsedData.diagnosticos || 
                  parsedData.avaliacoes ||
                  parsedData.data?.sequenciaDidatica ||
                  parsedData.success) {
                sequenciaContent = parsedData;
                console.log(`✅ Dados da Sequência Didática encontrados em ${key}:`, parsedData);
                break;
              }
            } catch (error) {
              console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
            }
          }
        }

        if (sequenciaContent) {
          // Processar dados de acordo com a estrutura encontrada
          let processedData = sequenciaContent;
          
          // Se os dados estão dentro de 'data' (resultado da API)
          if (sequenciaContent.data) {
            processedData = sequenciaContent.data;
          }
          
          // Se tem sucesso e dados estruturados
          if (sequenciaContent.success && sequenciaContent.data) {
            processedData = sequenciaContent.data;
          }

          // Mesclar dados da sequência didática com dados existentes
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
            // Garantir estrutura completa para visualização
            sequenciaDidatica: processedData.sequenciaDidatica || processedData,
            metadados: processedData.metadados || {
              totalAulas: processedData.aulas?.length || 0,
              totalDiagnosticos: processedData.diagnosticos?.length || 0,
              totalAvaliacoes: processedData.avaliacoes?.length || 0,
              isGeneratedByAI: true,
              generatedAt: processedData.generatedAt || new Date().toISOString()
            }
          };
          console.log('📚 Dados da Sequência Didática processados para visualização:', previewData);
        } else if (activityType === 'quadro-interativo') {
          console.log('🖼️ Processando dados específicos do Quadro Interativo');
          
          // Buscar dados do localStorage para quadro-interativo
          const quadroContent = localStorage.getItem(`schoolpower_quadro-interativo_content`);
          let processedData = {};
          
          if (quadroContent) {
            try {
              const parsedContent = JSON.parse(quadroContent);
              processedData = parsedContent;
              console.log('🖼️ Dados do Quadro Interativo encontrados:', processedData);
            } catch (error) {
              console.error('❌ Erro ao parsear dados do Quadro Interativo:', error);
            }
          }

          // Mesclar dados do quadro interativo com dados existentes
          previewData = {
            ...previewData,
            ...processedData,
            id: activity.id,
            type: activityType,
            title: processedData.title || previewData.title,
            description: processedData.description || previewData.description,
            quadroInterativoContent: processedData
          };
          console.log('🖼️ Dados do Quadro Interativo processados para visualização:', previewData);
        } else {
          console.log('⚠️ Nenhum conteúdo específico da Sequência Didática encontrado');
          // Criar estrutura básica a partir dos dados do formulário
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

    console.log('📊 ActivityViewModal: Dados finais para preview:', previewData);

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
        console.log('📚 Renderizando PlanoAulaPreview com dados:', previewData);
        return (
          <PlanoAulaPreview
            data={previewData}
            activityData={activity}
          />
        );

      case 'sequencia-didatica':
        console.log('📚 Renderizando SequenciaDidaticaPreview com dados:', previewData);
        return (
          <SequenciaDidaticaPreview
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
          {/* Aplicar background laranja no cabeçalho quando for Plano de Aula */}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m4-8h6m0 0v6m0-6l-6 6" />
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

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-240px)] bg-white dark:bg-gray-900" ref={contentRef}>
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
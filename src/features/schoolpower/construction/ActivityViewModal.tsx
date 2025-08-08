import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react'; // Import Eye component
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';

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
  // Estados sempre definidos primeiro
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [questoesExpandidas, setQuestoesExpandidas] = useState<{ [key: string]: boolean }>({});
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isInQuestionView, setIsInQuestionView] = useState<boolean>(false);

  // Ref sempre definida
  const contentRef = useRef<HTMLDivElement>(null);

  // Determinar tipo de atividade - sempre calculado
  const activityType = activity?.originalData?.type || activity?.categoryId || activity?.type || 'lista-exercicios';
  const isExerciseList = activityType === 'lista-exercicios';
  const isPlanoAula = activityType === 'plano-aula';

  // Função específica para carregar dados do Plano de Aula - sempre definida
  const loadPlanoAulaData = React.useCallback((activityId: string) => {
    if (!activityId) return null;

    console.log('🔍 ActivityViewModal: Carregando dados específicos do Plano de Aula para:', activityId);

    const cacheKeys = [
      `constructed_plano-aula_${activityId}`,
      `schoolpower_plano-aula_content`,
      `activity_${activityId}`,
      `activity_fields_${activityId}`
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
  }, []); // Dependências vazias para garantir que a função não mude

  // Resetar estado do sidebar quando o modal abre
  React.useEffect(() => {
    if (isOpen) {
      setShowSidebar(false);
      setSelectedQuestionId(null);
      setSelectedQuestionIndex(null);
      setIsInQuestionView(false);

      // Se for plano-aula, tentar carregar dados específicos
      if (isPlanoAula && activity?.id) {
        loadPlanoAulaData(activity.id); // Chamada da função carregada com useCallback
      }
    }
  }, [isOpen, activity, isPlanoAula, loadPlanoAulaData]); // Adicionado isPlanoAula e loadPlanoAulaData às dependências

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
  const getQuestionsForSidebar = React.useCallback(() => { // Usando useCallback para otimização
    const activityTypeForQuestions = activity.originalData?.type || activity.categoryId || activity.type || 'lista-exercicios';

    if (activityTypeForQuestions !== 'lista-exercicios') return [];

    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');

    const previewData = {
      ...activity.originalData,
      ...storedData,
      customFields: {
        ...activity.customFields,
        ...JSON.parse(localStorage.getItem(`activity_fields_${activity.id}`) || '{}')
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
  }, [activity]); // Adicionado 'activity' como dependência

  const questionsForSidebar = getQuestionsForSidebar();
  // const isExerciseList = activityType === 'lista-exercicios'; // Já definida anteriormente

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

  const renderActivityPreview = React.useCallback(() => { // Usando useCallback para otimização
    // activityType e isExerciseList já estão disponíveis no escopo da função principal
    console.log('🎭 ActivityViewModal: Renderizando preview para tipo:', activityType);
    console.log('🎭 ActivityViewModal: Dados da atividade:', activity);

    // Tentar recuperar dados do localStorage se não estiverem disponíveis
    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_fields_${activity.id}`) || '{}');

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
    if (isExerciseList) {
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

    // Tratamento específico para Plano de Aula - buscar em múltiplas fontes
    if (isPlanoAula) {
      console.log('📚 ActivityViewModal: Processando Plano de Aula');

      // Prioridade 1: Cache específico do plano-aula construído
      const constructedPlanoKey = `constructed_plano-aula_${activity.id}`;
      const constructedPlanoContent = localStorage.getItem(constructedPlanoKey);

      // Prioridade 2: Cache geral do plano-aula
      const generalCacheKey = `schoolpower_plano-aula_content`;
      const generalCachedContent = localStorage.getItem(generalCacheKey);

      // Prioridade 3: Cache da atividade específica
      const activityCacheKey = `activity_${activity.id}`;
      const activityCachedContent = localStorage.getItem(activityCacheKey);

      console.log('🔍 ActivityViewModal: Verificando caches de plano-aula:', {
        constructedExists: !!constructedPlanoContent,
        generalExists: !!generalCachedContent,
        activityExists: !!activityCachedContent
      });

      let planoContent = null;

      // Tentar carregar o conteúdo construído específico primeiro
      if (constructedPlanoContent) {
        try {
          planoContent = JSON.parse(constructedPlanoContent);
          console.log('✅ Conteúdo específico do plano-aula carregado:', planoContent);
        } catch (error) {
          console.error('❌ Erro ao carregar conteúdo específico do plano-aula:', error);
        }
      }

      // Se não encontrou, tentar o cache geral
      if (!planoContent && generalCachedContent) {
        try {
          planoContent = JSON.parse(generalCachedContent);
          console.log('✅ Conteúdo geral do plano-aula carregado:', planoContent);
        } catch (error) {
          console.error('❌ Erro ao carregar conteúdo geral do plano-aula:', error);
        }
      }

      // Se não encontrou, tentar o cache da atividade
      if (!planoContent && activityCachedContent) {
        try {
          const activityContent = JSON.parse(activityCachedContent);
          if (activityContent && typeof activityContent === 'object') {
            planoContent = activityContent;
            console.log('✅ Conteúdo da atividade do plano-aula carregado:', planoContent);
          }
        } catch (error) {
          console.error('❌ Erro ao carregar conteúdo da atividade do plano-aula:', error);
        }
      }

      // Se encontrou conteúdo, mesclar com os dados existentes
      if (planoContent) {
        console.log('🔀 Mesclando conteúdo do plano-aula com dados existentes');
        previewData = {
          ...previewData,
          ...planoContent,
          // Garantir que os dados essenciais sejam preservados
          id: activity.id,
          type: activityType,
          title: planoContent.titulo || planoContent.title || previewData.title,
          description: planoContent.descricao || planoContent.description || previewData.description
        };
      } else {
        console.log('⚠️ Nenhum conteúdo de plano-aula encontrado nos caches');

        // Como fallback, criar uma estrutura completa baseada nos dados da atividade
        const customFields = activity.customFields || {};

        previewData = {
          ...previewData,
          titulo: activity.title || activity.personalizedTitle || 'Plano de Aula',
          descricao: activity.description || activity.personalizedDescription || 'Descrição do plano de aula',
          disciplina: customFields['Componente Curricular'] || customFields['disciplina'] || 'Matemática',
          tema: customFields['Tema ou Tópico Central'] || customFields['tema'] || 'Tema da Aula',
          serie: customFields['Ano/Série Escolar'] || customFields['serie'] || '9º Ano',
          tempo: customFields['Carga Horária'] || customFields['tempo'] || '50 minutos',
          metodologia: customFields['Tipo de Aula'] || customFields['metodologia'] || 'Aula Expositiva',
          recursos: customFields['Materiais/Recursos'] ? [customFields['Materiais/Recursos']] : ['Quadro', 'Livro didático'],
          objetivos: customFields['Objetivo Geral'] || customFields['objetivos'] || 'Compreender o conteúdo proposto',
          materiais: customFields['Materiais/Recursos'] || customFields['materiais'] || 'Material didático',
          observacoes: customFields['Observações do Professor'] || customFields['observacoes'] || 'Observações do professor',
          competencias: customFields['Habilidades BNCC'] || customFields['competencias'] || 'Competências da BNCC',
          contexto: customFields['Perfil da Turma'] || customFields['contexto'] || 'Turma regular',
          // Adicionar estrutura completa do plano
          visao_geral: {
            disciplina: customFields['Componente Curricular'] || customFields['disciplina'] || 'Matemática',
            tema: customFields['Tema ou Tópico Central'] || customFields['tema'] || 'Tema da Aula',
            serie: customFields['Ano/Série Escolar'] || customFields['serie'] || '9º Ano',
            tempo: customFields['Carga Horária'] || customFields['tempo'] || '50 minutos',
            metodologia: customFields['Tipo de Aula'] || customFields['metodologia'] || 'Aula Expositiva',
            recursos: customFields['Materiais/Recursos'] ? [customFields['Materiais/Recursos']] : ['Quadro', 'Livro didático'],
            sugestoes_ia: ['Plano de aula baseado nas informações fornecidas']
          }
        };
        console.log('🔄 Usando dados de fallback completos para plano-aula:', previewData);
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
            activityData={activity} // Passa a atividade original para o preview
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
  }, [activity, activityType, isExerciseList, isPlanoAula, handleQuestionSelect, loadPlanoAulaData]); // Adicionando dependências necessárias


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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl dark:shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
          style={{
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
          }}
        >

          {/* Header Conditional Rendering */}
          {isExerciseList ? (
            // Header for List of Exercises
            <div className="bg-orange-50 dark:bg-gray-800/50 border-b border-orange-200 dark:border-gray-700 px-6 py-4 mb-0 z-10 flex items-center justify-between">
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
          ) : isPlanoAula ? (
            // Header for Plano de Aula - Using the Modal's main header structure
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-gray-800/50 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg">
                  {/* Icon for Plano de Aula */}
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-6-4v6m0-6l-6-6m6 6l6-6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-orange-900 dark:text-white">
                    {activity?.personalizedTitle || activity?.title || 'Plano de Aula'}
                  </h2>
                  <p className="text-sm text-orange-700 dark:text-gray-300">
                    {activity?.personalizedDescription || activity?.description || 'Detalhes da atividade de plano de aula'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          ) : (
            // Default Header for other activity types
            <div className="flex justify-end p-6 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-gray-800/50 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-orange-900 dark:text-white">
                    Visualizar Atividade
                  </h2>
                  <p className="text-sm text-orange-700 dark:text-gray-300">
                    {activity?.title || 'Atividade Gerada'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
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
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Wrench, Target, CheckSquare, Filter } from "lucide-react";
import { ContextualizationData } from "../contextualization/ContextualizationCard";
import { ActionPlanItem } from "../actionplan/ActionPlanCard";

export interface ContextualizationData {
  materias: string;
  publicoAlvo: string;
  restricoes: string;
  datasImportantes?: string;
  observacoes?: string;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  type: string;
}

interface CardDeConstrucaoProps {
  step:
    | "contextualization"
    | "actionPlan"
    | "generating"
    | "generatingActivities";
  contextualizationData?: ContextualizationData | null;
  actionPlan?: ActionPlanItem[] | null;
  onSubmitContextualization?: (data: ContextualizationData) => void;
  onApproveActionPlan?: (approvedItems: ActionPlanItem[]) => void;
  onResetFlow?: () => void;
  isLoading?: boolean;
}

export function CardDeConstrucao({
  step,
  contextualizationData,
  actionPlan,
  onSubmitContextualization,
  onApproveActionPlan,
  onResetFlow,
  isLoading = false,
}: CardDeConstrucaoProps): JSX.Element {
  // Form data for contextualization
  const [formData, setFormData] = useState<ContextualizationData>({
    materias: "",
    publicoAlvo: "",
    restricoes: "",
    datasImportantes: "",
    observacoes: "",
  });

  // Selected activities for action plan
  const [selectedActivities, setSelectedActivities] = useState<
    ActionPlanItem[]
  >([]);

  // Filter state for action plan
  const [filterState, setFilterState] = useState<'all' | 'selected'>('all');

  // View mode state (list or grid)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Load existing data when component mounts
  useEffect(() => {
    if (contextualizationData) {
      setFormData(contextualizationData);
    }
  }, [contextualizationData]);

  // Handle form input changes
  const handleInputChange = (
    field: keyof ContextualizationData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle contextualization form submission
  const handleSubmitContextualization = () => {
    if (onSubmitContextualization) {
      onSubmitContextualization(formData);
    }
  };

  // Handle activity selection toggle
  const handleActivityToggle = (activity: ActionPlanItem) => {
    setSelectedActivities((prev) => {
      const isSelected = prev.some((item) => item.id === activity.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== activity.id);
      } else {
        return [...prev, { ...activity, approved: true }];
      }
    });
  };

  // Handle action plan approval
  const handleApproveActionPlan = () => {
    if (onApproveActionPlan && selectedActivities.length > 0) {
      onApproveActionPlan(selectedActivities);
    }
  };

  // Check if contextualization form is valid
  const isContextualizationValid =
    formData.materias.trim() && formData.publicoAlvo.trim();

  // Grid Toggle Component
  const GridToggleComponent = ({ viewMode, onToggle }: {
    viewMode: 'list' | 'grid';
    onToggle: () => void;
  }) => {
    return (
      <button
        onClick={onToggle}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 hover:from-[#FF6B00]/5 hover:to-[#FF9248]/5 dark:hover:from-[#FF6B00]/10 dark:hover:to-[#FF9248]/10 border border-gray-200 dark:border-gray-600 hover:border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md"
        title={viewMode === 'list' ? 'Visualização em Grade' : 'Visualização em Lista'}
      >
        {viewMode === 'list' ? (
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        )}
      </button>
    );
  };

  // Filter Component
  const FilterComponent = ({ activities, selectedActivities, onFilterApply }: {
    activities: ActionPlanItem[];
    selectedActivities: ActionPlanItem[];
    onFilterApply: (filterType: string) => void;
  }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
          setIsFilterOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 hover:from-[#FF6B00]/5 hover:to-[#FF9248]/5 dark:hover:from-[#FF6B00]/10 dark:hover:to-[#FF9248]/10 border border-gray-200 dark:border-gray-600 hover:border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md"
          title="Filtros e Ações"
        >
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] transition-colors duration-200" />
        </button>

        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden z-50 backdrop-blur-sm"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.95) 0%, 
                  rgba(248, 250, 252, 0.98) 100%
                )
              `,
              ...(typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? {
                    background: `
                  linear-gradient(135deg, 
                    rgba(31, 41, 55, 0.95) 0%, 
                    rgba(17, 24, 39, 0.98) 100%
                  )
                `,
                  }
                : {}),
            }}
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#FF6B00]" />
                  Filtros e Ações
                </h3>
              </div>

              <div className="py-1 space-y-1">
                <button
                  onClick={() => {
                    onFilterApply('selectAll');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#FF6B00]/10 hover:to-[#FF9248]/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <CheckSquare className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Selecionar todos</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('selectRecommended');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#FF6B00]/10 hover:to-[#FF9248]/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-[#FF6B00] group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Selecionar recomendações</span>
                </button>

                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

                <button
                  onClick={() => {
                    onFilterApply('viewSelected');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Ver apenas selecionados</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('clearSelected');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Tirar selecionados</span>
                </button>

                <button
                  onClick={() => {
                    onFilterApply('viewAll');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-gray-600/5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                >
                  <svg className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Ver todas</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Handle filter actions
  const handleFilterApply = (filterType: string) => {
    if (!actionPlan) return;

    switch (filterType) {
      case 'selectAll':
        setSelectedActivities([...actionPlan]);
        setFilterState('all');
        break;
      case 'selectRecommended':
        // Seleciona as 3 primeiras atividades como "recomendadas"
        const recommended = actionPlan.slice(0, Math.min(3, actionPlan.length));
        setSelectedActivities(recommended);
        setFilterState('all');
        break;
      case 'viewSelected':
        setFilterState('selected');
        break;
      case 'clearSelected':
        setSelectedActivities([]);
        setFilterState('all');
        break;
      case 'viewAll':
        setFilterState('all');
        break;
      default:
        break;
    }
  };

  const getIconByActivityId = (activityId: string) => {
    // Implemente a lógica para retornar o ícone com base no ID da atividade
    // Este é apenas um exemplo, substitua com sua própria lógica
    switch (activityId) {
      case '1':
        return Wrench;
      case '2':
        return Target;
      case '3':
        return CheckSquare;
      default:
        return Wrench; // Ícone padrão
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className="relative backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-[#FF6B00]/30 dark:border-[#FF6B00]/30"
      style={{
        width: "1153px",
        height: "700px",
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(248, 250, 252, 0.98) 100%
          ),
          radial-gradient(circle at 20% 20%, rgba(255,107,0,0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,146,72,0.06) 0%, transparent 50%)
        `,
        ...(typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? {
              background: `
            linear-gradient(135deg, rgba(10,10,23,0.90) 0%, rgba(15,15,30,0.95) 100%),
            radial-gradient(circle at 20% 20%, rgba(255,107,0,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,146,72,0.10) 0%, transparent 50%)
          `,
            }
          : {}),
      }}
      data-theme="adaptive"
    >
      {/* Cabeçalho Persistente Fixo */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-[#FF6B00] to-[#FF9248] rounded-t-2xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            {step === "contextualization" ? (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : step === "actionPlan" ? (
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">
              {step === "contextualization"
                ? "Quiz de Contextualização"
                : step === "actionPlan"
                  ? "Plano de Ação"
                  : step === "generating"
                    ? "Gerando Conteúdo..."
                    : "School Power"}
            </h1>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-between w-44">
            {/* Background progress line */}
            <div className="absolute top-1/2 transform -translate-y-1/2 h-1.5 bg-white/30 rounded-full z-0" style={{ left: '16px', right: '16px' }}></div>

            {/* Active progress line */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 h-1.5 bg-white rounded-full z-0 transition-all duration-500 ease-out"
              style={{ 
                left: '16px',
                width: `${
                  step === "contextualization" ? "0%" :
                  step === "actionPlan" ? "50%" :
                  (step === "generating" || step === "generatingActivities") ? "100%" : "0%"
                }`
              }}
            ></div>

            {/* Step indicators */}
            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              step === "contextualization" ? 'bg-white border-white text-[#FF6B00]' : 'bg-[#FF6B00] border-white text-white'
            }`}>
              {step === "contextualization" ? (
                <span className="text-sm font-semibold">1</span>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              step === "actionPlan" ? 'bg-white border-white text-[#FF6B00]' :
              (step === "generating" || step === "generatingActivities") ? 'bg-[#FF6B00] border-white text-white' :
              'bg-white/20 border-white/30 text-white'
            }`}>
              {step === "actionPlan" ? (
                <span className="text-sm font-semibold">2</span>
              ) : (step === "generating" || step === "generatingActivities") ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">2</span>
              )}
            </div>

            <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              (step === "generating" || step === "generatingActivities") ? 'bg-white border-white text-[#FF6B00]' : 'bg-white/20 border-white/30 text-white'
            }`}>
              <span className="text-sm font-semibold">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorativo */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#FF6B00]/10 to-[#FF9248]/5 dark:from-[#FF6B00]/20 dark:to-[#FF9248]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-[#FF9248]/10 to-[#FF6B00]/5 dark:from-[#FF9248]/20 dark:to-[#FF6B00]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Renderização condicional baseada no step */}
      {step === "generating" || step === "generatingActivities" ? (
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-transparent animate-pulse"></div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {step === "generating"
              ? "🤖 Analisando com IA Gemini"
              : "🎯 Gerando Atividades"}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-lg text-sm sm:text-base">
            {step === "generating"
              ? "A IA está processando sua mensagem e contexto para criar um plano de ação personalizado..."
              : "As atividades aprovadas estão sendo geradas automaticamente pelo School Power..."}
          </p>
          <div className="bg-gradient-to-r from-[#FF6B00]/10 to-orange-100/20 dark:to-[#29335C]/10 rounded-lg p-3 sm:p-4 mb-4 border border-[#FF6B00]/20 max-w-md w-full">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {step === "generating" ? (
                <>
                  ✨ Consultando 137 atividades disponíveis
                  <br />
                  🎯 Personalizando para seu contexto específico
                  <br />
                  📝 Gerando sugestões inteligentes
                  <br />
                  🔍 Validando compatibilidade das atividades
                </>
              ) : (
                <>
                  ✅ Personalizando conteúdo das atividades
                  <br />
                  🎨 Criando materiais visuais
                  <br />
                  📝 Formatando atividades finais
                  <br />
                  🚀 Preparando download
                </>
              )}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            {onResetFlow && (
              <button
                onClick={onResetFlow}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-400 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="relative z-10 h-full flex flex-col pt-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
<div className="text-center mb-4 sm:mb-6"></div>

          {step === "contextualization" ? (
            <motion.div
              key="contextualization-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div
                className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 pr-1 sm:pr-2"
                style={{
                  maxHeight: "calc(100% - 80px)",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#FF6B00 rgba(255,107,0,0.1)",
                }}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    📚 Quais matérias e temas serão trabalhados? *
                  </label>
                  <textarea
                    value={formData.materias}
                    onChange={(e) =>
                      handleInputChange("materias", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 bg-white/80 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    rows={2}
                    placeholder="Descreva as matérias e temas que você quer estudar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    🎯 Qual o público-alvo? *
                  </label>
                  <input
                    type="text"
                    value={formData.publicoAlvo}
                    onChange={(e) =>
                      handleInputChange("publicoAlvo", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 bg-white/80 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    placeholder="Ex: Ensino Médio, 3º ano, vestibular..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    ⚠️ Quais restrições ou preferências específicas? *
                  </label>
                  <textarea
                    value={formData.restricoes}
                    onChange={(e) =>
                      handleInputChange("restricoes", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 bg-white/80 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    rows={2}
                    placeholder="Descreva limitações de tempo, dificuldades específicas, etc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    📅 Período de entrega ou datas importantes
                  </label>
                  <input
                    type="text"
                    value={formData.datasImportantes}
                    onChange={(e) =>
                      handleInputChange("datasImportantes", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 bg-white/80 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    placeholder="Ex: Prova em 2 semanas, ENEM em novembro..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    📝 Outras observações importantes
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      handleInputChange("observacoes", e.target.value)
                    }
                    className="w-full p-2 sm:p-3 border-2 border-[#FF6B00]/30 bg-white/80 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    rows={2}
                    placeholder="Informações adicionais que podem ajudar..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-700">
                <button
                  onClick={handleSubmitContextualization}
                  disabled={!isContextualizationValid || isLoading}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isLoading ? "Processando..." : "Gerar Plano de Aula"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actionplan-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Atividades Sugeridas
                </h3>
                <div className="flex items-center gap-2">
                  <div className="bg-[#FF6B00]/10 text-[#FF6B00] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {selectedActivities.length} selecionada
                    {selectedActivities.length !== 1 ? "s" : ""}
                  </div>
                  <GridToggleComponent 
                    viewMode={viewMode}
                    onToggle={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  />
                  <FilterComponent 
                    activities={actionPlan || []}
                    selectedActivities={selectedActivities}
                    onFilterApply={(filterType) => handleFilterApply(filterType)}
                  />
                </div>
              </div>

              <div
                className={`flex-1 overflow-y-auto mb-3 sm:mb-4 pr-1 sm:pr-2 ${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-min' 
                    : 'space-y-2 sm:space-y-3'
                }`}
                style={{
                  maxHeight: "calc(100% - 80px)",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#FF6B00 rgba(255,107,0,0.1)",
                }}
              >
                {(filterState === 'selected' 
                  ? selectedActivities 
                  : actionPlan || []
                )?.map((activity, index) => {
                  const isSelected = selectedActivities.some(
                    (item) => item.id === activity.id,
                  );

                  return (
                    <motion.div
                      key={activity.id}
                      className={`relative p-6 border-2 transition-all duration-300 cursor-pointer ${
                        viewMode === 'grid' ? 'rounded-[32px]' : 'rounded-[32px] mb-4'
                      } ${
                        isSelected
                          ? 'border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 shadow-lg transform scale-[1.02]'
                          : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-[#FF6B00]/50 hover:shadow-md'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => handleActivityToggle(activity)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox customizado */}
                        <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-[#FF6B00] bg-[#FF6B00] shadow-md'
                            : 'border-gray-300 dark:border-gray-600 hover:border-[#FF6B00]/50'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* Conteúdo da atividade */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {/* Ícone animado da atividade */}
                            <div 
                              className={`icon-container ${isSelected ? 'active' : ''}`}
                              style={{
                                width: '40px',
                                height: '40px',
                                minWidth: '40px',
                                minHeight: '40px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isSelected 
                                  ? 'linear-gradient(135deg, #FF6E06, #FF8A39)' 
                                  : 'rgba(255, 110, 6, 0.1)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                boxShadow: isSelected 
                                  ? '0 6px 12px rgba(255, 110, 6, 0.3)' 
                                  : 'none',
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                              }}
                            >
                              {React.createElement(getIconByActivityId(activity.id), {
                                className: `w-5 h-5 transition-all duration-300 relative z-10`,
                                style: {
                                  color: isSelected ? 'white' : '#FF6E06'
                                }
                              })}
                              <div 
                                className="icon-glow"
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  width: '20px',
                                  height: '20px',
                                  background: 'radial-gradient(circle, rgba(255, 110, 6, 0.5), transparent)',
                                  borderRadius: '50%',
                                  transform: isSelected 
                                    ? 'translate(-50%, -50%) scale(2.2)' 
                                    : 'translate(-50%, -50%) scale(0)',
                                  transition: 'transform 0.3s ease'
                                }}
                              />
                            </div>

                            {/* Título da atividade */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                              {activity.title}
                            </h3>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-3">
                            {activity.description}
                          </p>

                          {/* Metadados da atividade */}
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                              {activity.duration || '30 min'}
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                              {activity.difficulty || 'Médio'}
                            </span>
                            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                              {activity.category || 'Geral'}
                            </span>
                          </div>

                          {/* ID da atividade (para debug) */}
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                              ID: {activity.id}
                            </span>
                          </div>
                        </div>

                        {/* Indicador visual de seleção */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-[#FF6B00] rounded-full animate-pulse shadow-md"></div>
                          </div>
                        )}
                      </div>

                      {/* Borda animada para item selecionado */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-[32px] border-2 border-[#FF6B00] animate-pulse opacity-50 pointer-events-none"></div>
                      )}
                    </motion.div>
                  );
                })}

                {filterState === 'selected' && selectedActivities.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Nenhuma atividade selecionada
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      Selecione algumas atividades primeiro para vê-las aqui
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-700">
                <button
                  onClick={handleApproveActionPlan}
                  disabled={selectedActivities.length === 0 || isLoading}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                >
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isLoading
                    ? "Processando..."
                    : `Aprovar Plano (${selectedActivities.length})`}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
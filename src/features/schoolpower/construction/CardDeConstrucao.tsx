"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Target, CheckSquare } from 'lucide-react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

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
  step: 'contextualization' | 'actionPlan' | 'generating' | 'generatingActivities';
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
  isLoading = false
}: CardDeConstrucaoProps): JSX.Element {
  // Form data for contextualization
  const [formData, setFormData] = useState<ContextualizationData>({
    materias: '',
    publicoAlvo: '',
    restricoes: '',
    datasImportantes: '',
    observacoes: ''
  });

  // Selected activities for action plan
  const [selectedActivities, setSelectedActivities] = useState<ActionPlanItem[]>([]);

  // Load existing data when component mounts
  useEffect(() => {
    if (contextualizationData) {
      setFormData(contextualizationData);
    }
  }, [contextualizationData]);

  // Handle form input changes
  const handleInputChange = (field: keyof ContextualizationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
    setSelectedActivities(prev => {
      const isSelected = prev.some(item => item.id === activity.id);
      if (isSelected) {
        return prev.filter(item => item.id !== activity.id);
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
  const isContextualizationValid = formData.materias.trim() && formData.publicoAlvo.trim();

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
        damping: 15
      }}
      className="relative backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-[#FF6B00]/30 dark:border-[#FF6B00]/30"
      style={{
        width: '1153px',
        height: '700px',
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(248, 250, 252, 0.98) 100%
          ),
          radial-gradient(circle at 20% 20%, rgba(255,107,0,0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,146,72,0.06) 0%, transparent 50%)
        `,
        ...(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? {
          background: `
            linear-gradient(135deg, rgba(10,10,23,0.90) 0%, rgba(15,15,30,0.95) 100%),
            radial-gradient(circle at 20% 20%, rgba(255,107,0,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,146,72,0.10) 0%, transparent 50%)
          `
        } : {})
      }}
      data-theme="adaptive"
    >
      {/* Cabeçalho Persistente Fixo */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#FF6B00] to-[#FF9248] rounded-t-2xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">School Power</h1>
            <p className="text-white/80 text-xs">
              {step === 'contextualization' ? 'Contextualização' :
               step === 'actionPlan' ? 'Plano de Ação' :
               step === 'generating' ? 'Gerando...' : 'Processando...'}
            </p>
          </div>
        </div>
        
        {/* Indicador de Progresso */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className={`w-2 h-2 rounded-full ${step === 'contextualization' ? 'bg-white' : 'bg-white/40'}`}></div>
            <div className={`w-2 h-2 rounded-full ${step === 'actionPlan' ? 'bg-white' : 'bg-white/40'}`}></div>
            <div className={`w-2 h-2 rounded-full ${(step === 'generating' || step === 'generatingActivities') ? 'bg-white animate-pulse' : 'bg-white/40'}`}></div>
          </div>
          <span className="text-white/80 text-xs ml-2">
            {step === 'contextualization' ? '1/3' :
             step === 'actionPlan' ? '2/3' :
             (step === 'generating' || step === 'generatingActivities') ? '3/3' : ''}
          </span>
        </div>
      </div>

      {/* Background decorativo */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#FF6B00]/10 to-[#FF9248]/5 dark:from-[#FF6B00]/20 dark:to-[#FF9248]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-[#FF9248]/10 to-[#FF6B00]/5 dark:from-[#FF9248]/20 dark:to-[#FF6B00]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Renderização condicional baseada no step */}
      {(step === 'generating' || step === 'generatingActivities') ? (
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
            {step === 'generating' ? '🤖 Analisando com IA Gemini' : '🎯 Gerando Atividades'}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-lg text-sm sm:text-base">
            {step === 'generating' 
              ? 'A IA está processando sua mensagem e contexto para criar um plano de ação personalizado...'
              : 'As atividades aprovadas estão sendo geradas automaticamente pelo School Power...'
            }
          </p>
          <div className="bg-gradient-to-r from-[#FF6B00]/10 to-orange-100/20 dark:to-[#29335C]/10 rounded-lg p-3 sm:p-4 mb-4 border border-[#FF6B00]/20 max-w-md w-full">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {step === 'generating' ? (
                <>
                  ✨ Consultando 137 atividades disponíveis<br/>
                  🎯 Personalizando para seu contexto específico<br/>
                  📝 Gerando sugestões inteligentes<br/>
                  🔍 Validando compatibilidade das atividades
                </>
              ) : (
                <>
                  ✅ Personalizando conteúdo das atividades<br/>
                  🎨 Criando materiais visuais<br/>
                  📝 Formatando atividades finais<br/>
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
        <div className="text-center mb-4 sm:mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#FF6B00] to-[#FF9248] rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.div>

            <motion.h2 
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {step === 'contextualization' ? 'Quiz de Contextualização' : 'Plano de Ação'}
            </motion.h2>

            <motion.p 
              className="text-gray-600 dark:text-gray-300 text-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {step === 'contextualization' 
                ? 'Responda algumas perguntas para personalizar sua experiência'
                : 'Selecione as atividades que deseja incluir no seu plano'
              }
            </motion.p>
          </div>

        {step === 'contextualization' ? (
            <motion.div
              key="contextualization-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 pr-1 sm:pr-2"
                style={{ 
                  maxHeight: 'calc(100% - 80px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#FF6B00 rgba(255,107,0,0.1)'
                }}
              >
            <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-2">
                    📚 Quais matérias e temas serão trabalhados? *
                  </label>
                  <textarea
                    value={formData.materias}
                    onChange={(e) => handleInputChange('materias', e.target.value)}
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
                    onChange={(e) => handleInputChange('publicoAlvo', e.target.value)}
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
                    onChange={(e) => handleInputChange('restricoes', e.target.value)}
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
                    onChange={(e) => handleInputChange('datasImportantes', e.target.value)}
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
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
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
                  {isLoading ? 'Processando...' : 'Gerar Plano de Aula'}
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
                <div className="bg-[#FF6B00]/10 text-[#FF6B00] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {selectedActivities.length} selecionada{selectedActivities.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 mb-3 sm:mb-4 pr-1 sm:pr-2"
                style={{ 
                  maxHeight: 'calc(100% - 80px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#FF6B00 rgba(255,107,0,0.1)'
                }}
              >
              {actionPlan?.map((activity) => {
                const isSelected = selectedActivities.some(item => item.id === activity.id);

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-[#FF6B00] bg-[#FF6B00]/20 shadow-lg shadow-[#FF6B00]/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-gray-100/80 dark:bg-gray-800/50'
                      }
                      hover:border-[#FF6B00] hover:bg-[#FF6B00]/10
                    `}
                    onClick={() => handleActivityToggle(activity)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-colors duration-200
                        ${isSelected 
                          ? 'border-[#FF6B00] bg-[#FF6B00]' 
                          : 'border-gray-400'
                        }
                      `}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                          {activity.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {activity.description}
                        </p>
                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 rounded border border-blue-200 dark:border-blue-600/30">
                            {activity.duration}
                          </span>
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded border border-green-200 dark:border-green-600/30">
                            {activity.difficulty}
                          </span>
                          <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 rounded border border-purple-200 dark:border-purple-600/30">
                            {activity.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

              <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-700">
                <button
                  onClick={handleApproveActionPlan}
                  disabled={selectedActivities.length === 0 || isLoading}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                >
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isLoading ? 'Processando...' : `Aprovar Plano (${selectedActivities.length})`}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
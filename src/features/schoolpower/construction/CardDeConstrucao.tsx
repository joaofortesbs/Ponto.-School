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
      className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-[#FF6B00]/30"
      style={{
        width: '900px',
        height: '600px',
        background: `
          linear-gradient(135deg, rgba(10,10,23,0.90) 0%, rgba(15,15,30,0.95) 100%),
          radial-gradient(circle at 20% 20%, rgba(255,107,0,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,146,72,0.10) 0%, transparent 50%)
        `,
      }}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF9248]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-[#FF9248]/20 to-[#FF6B00]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Renderização condicional baseada no step */}
      {(step === 'generating' || step === 'generatingActivities') ? (
        <motion.div 
          className="relative z-10 flex flex-col items-center justify-center h-full text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-transparent animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            {step === 'generating' ? '🤖 Analisando com IA Gemini' : '🎯 Gerando Atividades'}
          </h3>
          <p className="text-gray-300 mb-4 max-w-lg">
            {step === 'generating' 
              ? 'A IA está processando sua mensagem e contexto para criar um plano de ação personalizado...'
              : 'As atividades aprovadas estão sendo geradas automaticamente pelo School Power...'
            }
          </p>
          <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#29335C]/10 rounded-lg p-4 mb-6 border border-[#FF6B00]/20 max-w-md">
            <p className="text-sm text-gray-300">
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
                className="px-6 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="relative z-10 h-full flex flex-col"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
        <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B00] to-[#FF9248] rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.div>

            <motion.h2 
              className="text-2xl font-bold text-white mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {step === 'contextualization' ? 'Quiz de Contextualização' : 'Plano de Ação'}
            </motion.h2>

            <motion.p 
              className="text-gray-300 text-sm"
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
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2"
                style={{ 
                  maxHeight: 'calc(100% - 120px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#FF6B00 transparent'
                }}
              >
            <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    📚 Quais matérias e temas serão trabalhados? *
                  </label>
                  <textarea
                    value={formData.materias}
                    onChange={(e) => handleInputChange('materias', e.target.value)}
                    className="w-full p-3 border-2 border-[#FF6B00]/30 bg-gray-800/50 text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    rows={2}
                    placeholder="Descreva as matérias e temas que você quer estudar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    🎯 Qual o público-alvo? *
                  </label>
                  <input
                    type="text"
                    value={formData.publicoAlvo}
                    onChange={(e) => handleInputChange('publicoAlvo', e.target.value)}
                    className="w-full p-3 border-2 border-[#FF6B00]/30 bg-gray-800/50 text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Ex: Ensino Médio, 3º ano, vestibular..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    ⚠️ Quais restrições ou preferências específicas? *
                  </label>
                  <textarea
                    value={formData.restricoes}
                    onChange={(e) => handleInputChange('restricoes', e.target.value)}
                    className="w-full p-3 border-2 border-[#FF6B00]/30 bg-gray-800/50 text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    rows={2}
                    placeholder="Descreva limitações de tempo, dificuldades específicas, etc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    📅 Período de entrega ou datas importantes
                  </label>
                  <input
                    type="text"
                    value={formData.datasImportantes}
                    onChange={(e) => handleInputChange('datasImportantes', e.target.value)}
                    className="w-full p-3 border-2 border-[#FF6B00]/30 bg-gray-800/50 text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Ex: Prova em 2 semanas, ENEM em novembro..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    📝 Outras observações importantes
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    className="w-full p-3 border-2 border-[#FF6B00]/30 bg-gray-800/50 text-white rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    rows={2}
                    placeholder="Informações adicionais que podem ajudar..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-700">
                <button
                  onClick={handleSubmitContextualization}
                  disabled={!isContextualizationValid || isLoading}
                  className="px-6 py-3 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Atividades Sugeridas
                </h3>
                <div className="bg-[#FF6B00]/10 text-[#FF6B00] px-3 py-1 rounded-full text-sm font-medium">
                  {selectedActivities.length} selecionada{selectedActivities.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2"
                style={{ 
                  maxHeight: 'calc(100% - 120px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#FF6B00 transparent'
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
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-[#FF6B00] bg-[#FF6B00]/20 shadow-lg shadow-[#FF6B00]/20' 
                        : 'border-gray-600 bg-gray-800/50'
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
                        <h4 className="font-semibold text-white mb-1">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-300 mb-2">
                          {activity.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="px-2 py-1 text-xs bg-blue-900/50 text-blue-200 rounded border border-blue-600/30">
                            {activity.duration}
                          </span>
                          <span className="px-2 py-1 text-xs bg-green-900/50 text-green-200 rounded border border-green-600/30">
                            {activity.difficulty}
                          </span>
                          <span className="px-2 py-1 text-xs bg-purple-900/50 text-purple-200 rounded border border-purple-600/30">
                            {activity.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

              <div className="flex justify-end pt-4 border-t border-gray-700">
                <button
                  onClick={handleApproveActionPlan}
                  disabled={selectedActivities.length === 0 || isLoading}
                  className="px-6 py-3 bg-[#FF6B00] hover:bg-[#D65A00] text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Target className="w-5 h-5" />
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
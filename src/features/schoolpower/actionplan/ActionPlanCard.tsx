
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  approved: boolean;
}

interface ActionPlanCardProps {
  actionPlan: ActionPlanItem[];
  onApprove: (approvedItems: ActionPlanItem[]) => void;
  onUpdateItem?: (id: string, updates: Partial<ActionPlanItem>) => void;
  isLoading?: boolean;
}

export function ActionPlanCard({ 
  actionPlan, 
  onApprove, 
  onUpdateItem, 
  isLoading = false 
}: ActionPlanCardProps) {
  const [localActionPlan, setLocalActionPlan] = useState<ActionPlanItem[]>(actionPlan);

  useEffect(() => {
    setLocalActionPlan(actionPlan);
  }, [actionPlan]);

  const handleItemToggle = (itemId: string) => {
    const updatedPlan = localActionPlan.map(item =>
      item.id === itemId ? { ...item, approved: !item.approved } : item
    );
    
    setLocalActionPlan(updatedPlan);
    
    // Chamar callback se fornecido
    if (onUpdateItem) {
      const updatedItem = updatedPlan.find(item => item.id === itemId);
      if (updatedItem) {
        onUpdateItem(itemId, { approved: updatedItem.approved });
      }
    }
  };

  const handleApprove = () => {
    const approvedItems = localActionPlan.filter(item => item.approved);
    console.log('✅ Atividades aprovadas pelo usuário:', approvedItems);
    onApprove(approvedItems);
  };

  const approvedCount = localActionPlan.filter(item => item.approved).length;
  const totalCount = localActionPlan.length;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full shadow-2xl border border-white/20 dark:border-gray-700/50"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Gerando Plano de Ação
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            A IA Gemini está analisando suas informações e criando atividades personalizadas...
          </p>
        </div>
      </motion.div>
    );
  }

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
      className="relative bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full shadow-2xl border border-white/20 dark:border-gray-700/50"
      style={{
        background: `
          linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.95) 100%),
          radial-gradient(circle at 20% 20%, rgba(255,107,0,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,146,72,0.1) 0%, transparent 50%)
        `,
      }}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF9248]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-[#FF9248]/20 to-[#FF6B00]/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B00] to-[#FF9248] rounded-2xl flex items-center justify-center shadow-lg"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </motion.div>

          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Plano de Ação Personalizado
          </motion.h2>

          <motion.p 
            className="text-gray-600 dark:text-gray-400 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Selecione as atividades que deseja gerar
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{approvedCount} de {totalCount} atividades selecionadas</span>
          </motion.div>
        </div>

        <motion.div 
          className="space-y-4 mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <AnimatePresence>
            {localActionPlan.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
                  item.approved
                    ? 'border-[#FF6B00] bg-gradient-to-r from-[#FF6B00]/10 to-[#FF9248]/5 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:border-[#FF6B00]/50 hover:shadow-md'
                }`}
                onClick={() => handleItemToggle(item.id)}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      item.approved
                        ? 'border-[#FF6B00] bg-[#FF6B00] shadow-lg'
                        : 'border-gray-300 dark:border-gray-500 group-hover:border-[#FF6B00]'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.approved && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
                      item.approved 
                        ? 'text-[#FF6B00] dark:text-[#FF9248]' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Indicador visual de seleção */}
                {item.approved && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-3 h-3 bg-[#FF6B00] rounded-full shadow-lg"
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="flex justify-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button
            onClick={handleApprove}
            disabled={approvedCount === 0}
            className={`px-8 py-4 rounded-xl font-semibold text-lg min-w-[250px] transition-all duration-300 ${
              approvedCount > 0
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF9248] text-white hover:shadow-2xl transform hover:scale-105 active:scale-95'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {approvedCount > 0 ? (
              <div className="flex items-center gap-3 justify-center">
                <span>Gerar {approvedCount} Atividade{approvedCount > 1 ? 's' : ''}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            ) : (
              'Selecione ao menos 1 atividade'
            )}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}


"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, ArrowRight } from "lucide-react";

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  approved: boolean;
}

interface ActionPlanCardProps {
  actionPlan: ActionPlanItem[];
  onApprove: (approvedItems: ActionPlanItem[]) => void;
  isLoading?: boolean;
}

export function ActionPlanCard({ actionPlan, onApprove, isLoading = false }: ActionPlanCardProps) {
  const [items, setItems] = useState<ActionPlanItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza os items quando actionPlan muda
  useEffect(() => {
    if (actionPlan && actionPlan.length > 0) {
      setItems(actionPlan.map(item => ({ ...item, approved: false })));
    }
  }, [actionPlan]);

  const handleToggleApproval = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, approved: !item.approved } : item
      )
    );
  };

  const handleApprove = async () => {
    const approvedItems = items.filter(item => item.approved);
    
    if (approvedItems.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onApprove(approvedItems);
    } catch (error) {
      console.error("Erro ao aprovar plano:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedCount = items.filter(item => item.approved).length;
  const totalItems = items.length;

  if (isLoading || (!actionPlan || actionPlan.length === 0)) {
    return (
      <motion.div
        className="w-full max-w-2xl mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Gerando Plano de Ação
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            A IA está criando um plano personalizado baseado nas suas respostas...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8736] p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Plano de Ação Gerado</h2>
        </div>
        <p className="text-white/90 text-sm">
          Revise o plano abaixo e marque as atividades que deseja gerar automaticamente.
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Progress Indicator */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              Atividades selecionadas:
            </span>
            <span className="font-semibold text-[#FF6B00]">
              {approvedCount} de {totalItems}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8736] h-2 rounded-full transition-all duration-300"
              style={{ width: totalItems > 0 ? `${(approvedCount / totalItems) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                item.approved
                  ? "border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() => handleToggleApproval(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <motion.div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.approved
                        ? "bg-[#FF6B00] border-[#FF6B00]"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {item.approved && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    item.approved 
                      ? "text-[#FF6B00] dark:text-[#FF8736]" 
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <ArrowRight className={`h-4 w-4 transition-colors ${
                  item.approved 
                    ? "text-[#FF6B00]" 
                    : "text-gray-400"
                }`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={handleApprove}
            disabled={approvedCount === 0 || isSubmitting}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
              approvedCount === 0 || isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FF6B00] to-[#FF8736] hover:from-[#FF8736] hover:to-[#FF6B00] transform hover:scale-105 active:scale-95"
            }`}
            whileHover={approvedCount > 0 && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={approvedCount > 0 && !isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                Gerando Atividades...
              </div>
            ) : (
              `Aprovar Plano (${approvedCount} atividades)`
            )}
          </motion.button>
        </div>

        {approvedCount === 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
            Selecione pelo menos uma atividade para continuar
          </p>
        )}
      </div>
    </motion.div>
  );
}

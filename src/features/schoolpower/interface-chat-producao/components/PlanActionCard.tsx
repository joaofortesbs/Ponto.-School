import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Circle, Play, Edit3, Loader2 } from 'lucide-react';
import type { PlanCardData } from '../types/message-types';

interface PlanActionCardProps {
  cardId: string;
  data: PlanCardData;
  isStatic?: boolean;
  onApplyPlan?: () => void;
}

export function PlanActionCard({ cardId, data, isStatic = true, onApplyPlan }: PlanActionCardProps) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPlan = () => {
    if (isApplying) {
      console.log('⚠️ [PlanActionCard] Click ignorado - já está aplicando');
      return;
    }
    console.log('✅ [PlanActionCard] Aplicando plano...');
    setIsApplying(true);
    onApplyPlan?.();
  };

  if (!data) return null;

  return (
    <motion.div
      layout={isStatic}
      className="w-full max-w-2xl my-2"
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg">Plano de Ação</h3>
        </div>

        <p className="text-gray-300 text-sm mb-4">{data.objetivo}</p>

        <div className="space-y-3 mb-5">
          {data.etapas.map((etapa) => (
            <div key={etapa.ordem} className="flex items-center gap-3 text-gray-200">
              <Circle size={18} className="text-orange-400 flex-shrink-0" />
              <span className="text-sm">{etapa.titulo}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleApplyPlan}
            disabled={isApplying}
            className={`flex-1 flex items-center justify-center gap-2 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md ${
              isApplying 
                ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg'
            }`}
          >
            {isApplying ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {isApplying ? 'APLICANDO...' : 'APLICAR PLANO'}
          </button>
          <button
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2.5 px-4 rounded-lg transition-all duration-200"
          >
            <Edit3 size={16} />
            EDITAR
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default PlanActionCard;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Loader2, ChevronRight } from 'lucide-react';
import type { PlanCardData } from '../types/message-types';

interface PlanActionCardProps {
  cardId: string;
  data: PlanCardData;
  isStatic?: boolean;
  onApplyPlan?: () => void;
}

export function PlanActionCard({ cardId, data, isStatic = true, onApplyPlan }: PlanActionCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

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
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-2xl my-3"
    >
      <div 
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 107, 53, 0.15)',
          boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
        }}
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(255, 107, 53, 0.15) 0%, transparent 50%)',
          }}
        />

        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-5">
            <motion.div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-white font-semibold text-base tracking-tight">Plano de Ação</h3>
              <p className="text-gray-400 text-xs">{data.etapas.length} etapas para executar</p>
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-5 leading-relaxed">{data.objetivo}</p>

          <div className="space-y-2 mb-6">
            {data.etapas.map((etapa, index) => (
              <motion.div 
                key={etapa.ordem}
                className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-default"
                style={{
                  background: hoveredStep === index 
                    ? 'rgba(255, 107, 53, 0.1)' 
                    : 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid',
                  borderColor: hoveredStep === index 
                    ? 'rgba(255, 107, 53, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
              >
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    background: hoveredStep === index 
                      ? 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)'
                      : 'rgba(255, 107, 53, 0.15)',
                    boxShadow: hoveredStep === index 
                      ? '0 2px 8px rgba(255, 107, 53, 0.3)'
                      : 'none',
                  }}
                >
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    hoveredStep === index ? 'text-white' : 'text-orange-400'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <span className="text-sm text-gray-200 flex-1">{etapa.titulo}</span>
                <ChevronRight 
                  className={`w-4 h-4 transition-all duration-300 ${
                    hoveredStep === index 
                      ? 'text-orange-400 translate-x-0 opacity-100' 
                      : 'text-gray-600 -translate-x-2 opacity-0'
                  }`}
                />
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={handleApplyPlan}
            disabled={isApplying}
            className="w-full relative overflow-hidden group"
            whileHover={!isApplying ? { scale: 1.01 } : {}}
            whileTap={!isApplying ? { scale: 0.99 } : {}}
          >
            <div 
              className={`
                flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl
                font-medium text-sm transition-all duration-300
                ${isApplying 
                  ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                  : 'text-white'
                }
              `}
              style={!isApplying ? {
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF5722 100%)',
                boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              } : {}}
            >
              {isApplying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Aplicando plano...</span>
                </>
              ) : (
                <>
                  <Play size={18} className="fill-current" />
                  <span>Aplicar Plano</span>
                </>
              )}
            </div>
            
            {!isApplying && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                }}
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '100%', opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default PlanActionCard;

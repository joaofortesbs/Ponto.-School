/**
 * CARD SUPERIOR SUAS CRIAÇÕES - Mostra o plano de ação atual
 * 
 * Componente que fica acima da caixa de input no chat do Jota
 * Exibe o passo atual do plano de execução
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import type { ExecutionPlan } from '../types';

interface CardSuperiorSuasCriacoesProps {
  plan: ExecutionPlan | null;
  currentStep: number | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function CardSuperiorSuasCriacoes({ 
  plan, 
  currentStep,
  isExpanded = false,
  onToggleExpand 
}: CardSuperiorSuasCriacoesProps) {
  if (!plan) return null;

  const totalSteps = plan.etapas.length;
  const currentStepIndex = currentStep !== null ? currentStep : 0;
  const currentEtapa = plan.etapas.find(e => e.ordem === currentStepIndex) || plan.etapas[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full mb-3"
    >
      <div className="card-superior-container">
        <div className="card-superior-inner">
          <div className="card-superior-content">
            <div className="icon-container">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            
            <div className="plan-text">
              <span className="plan-description">
                {currentEtapa?.descricao || plan.objetivo}
              </span>
            </div>
            
            <div className="step-indicator">
              <span className="step-count">{currentStepIndex + 1} / {totalSteps}</span>
              <button 
                onClick={onToggleExpand}
                className="expand-button"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .card-superior-container {
          position: relative;
          background: transparent;
          border-radius: 20px;
          padding: 2px;
          width: 100%;
          height: 44px;
        }

        .card-superior-inner {
          position: relative;
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          border-radius: 18px;
          height: 100%;
          width: 100%;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.3);
        }

        .card-superior-content {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 12px;
          gap: 12px;
          background: #09122b;
          border-radius: 16px;
          border: 1px solid #192038;
        }

        .icon-container {
          width: 32px;
          height: 32px;
          background: linear-gradient(145deg, #ff6b35, #f7931e);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
        }

        .plan-text {
          flex: 1;
          overflow: hidden;
        }

        .plan-description {
          color: #e0e0e0;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .step-count {
          color: #ff6b35;
          font-size: 14px;
          font-weight: 600;
        }

        .expand-button {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #ff6b35;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
        }

        .expand-button:hover {
          background: rgba(255, 107, 53, 0.1);
          transform: scale(1.1);
        }
      `}</style>
    </motion.div>
  );
}

export default CardSuperiorSuasCriacoes;

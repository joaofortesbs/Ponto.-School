/**
 * CARD SUPERIOR SUAS CRIAÇÕES - Mostra o plano de ação atual
 * 
 * Componente que fica acima da caixa de input no chat do Jota
 * Exibe o passo atual do plano de execução
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronUp, ChevronDown, Database, CheckCircle2, Circle } from 'lucide-react';
import type { ExecutionPlan } from '../types';

interface CardSuperiorSuasCriacoesProps {
  plan: ExecutionPlan | null;
  currentStep: number | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onOpenContext?: () => void;
}

export function CardSuperiorSuasCriacoes({ 
  plan, 
  currentStep,
  isExpanded = false,
  onToggleExpand,
  onOpenContext
}: CardSuperiorSuasCriacoesProps) {
  if (!plan) return null;

  const totalSteps = plan.etapas.length;
  const currentStepIndex = currentStep !== null ? currentStep : 0;
  const currentEtapa = plan.etapas.find(e => e.ordem === currentStepIndex) || plan.etapas[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        height: isExpanded ? 'auto' : '44px'
      }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full mb-3 overflow-hidden cursor-pointer"
      onClick={() => !isExpanded && onToggleExpand?.()}
    >
      <div className="card-superior-container">
        <div className="card-superior-inner">
          <div className="card-superior-content-wrapper">
            {/* Header / Collapsed View */}
            <div className="card-superior-header">
              <div className="icon-container">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              
              <div className="plan-text">
                <span className="plan-description">
                  {isExpanded ? "Plano de Execução Detalhado" : (currentEtapa?.descricao || plan.objetivo)}
                </span>
              </div>
              
              <div className="step-indicator">
                {isExpanded && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenContext?.();
                    }}
                    className="context-button-trigger"
                    title="Ver Contexto de Trabalho"
                  >
                    <Database className="w-4 h-4" />
                  </button>
                )}
                <span className="step-count">{currentStepIndex + 1} / {totalSteps}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand?.();
                  }}
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

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card-expanded-body"
                >
                  <div className="steps-list">
                    {plan.etapas.map((etapa, idx) => {
                      const isCompleted = idx < currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      
                      return (
                        <div 
                          key={etapa.id || idx} 
                          className={`step-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                        >
                          <div className="step-status-icon">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : isCurrent ? (
                              <div className="current-dot animate-pulse" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div className="step-info">
                            <span className="step-title">{etapa.titulo}</span>
                            <p className="step-desc">{etapa.descricao}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
        }

        .card-superior-inner {
          position: relative;
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          border-radius: 18px;
          width: 100%;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.3);
          overflow: hidden;
        }

        .card-superior-content-wrapper {
          background: #09122b;
          border-radius: 16px;
          border: 1px solid #192038;
          display: flex;
          flex-direction: column;
        }

        .card-superior-header {
          display: flex;
          align-items: center;
          height: 40px;
          padding: 0 12px;
          gap: 12px;
        }

        .icon-container {
          width: 28px;
          height: 28px;
          background: linear-gradient(145deg, #ff6b35, #f7931e);
          border-radius: 6px;
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
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .context-button-trigger {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          color: #ff6b35;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .context-button-trigger:hover {
          background: rgba(255, 107, 53, 0.2);
          transform: translateY(-1px);
        }

        .step-count {
          color: #ff6b35;
          font-size: 13px;
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

        .card-expanded-body {
          padding: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          max-height: 300px;
          overflow-y: auto;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .step-item {
          display: flex;
          gap: 12px;
          padding: 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.2s ease;
        }

        .step-item.current {
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.1);
        }

        .step-status-icon {
          flex-shrink: 0;
          padding-top: 2px;
        }

        .current-dot {
          width: 8px;
          height: 8px;
          background: #ff6b35;
          border-radius: 50%;
          margin: 4px;
          box-shadow: 0 0 8px #ff6b35;
        }

        .step-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-title {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        .step-desc {
          font-size: 12px;
          color: #999;
          line-height: 1.4;
        }

        .step-item.completed .step-title {
          color: #999;
          text-decoration: line-through;
        }
      `}</style>
    </motion.div>
  );
}

export default CardSuperiorSuasCriacoes;

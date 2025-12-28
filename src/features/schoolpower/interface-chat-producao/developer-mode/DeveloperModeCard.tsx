/**
 * DEVELOPER MODE CARD - Card de Modo Desenvolvedor
 * 
 * Exibe em tempo real o progresso de execução do plano de ação,
 * mostrando cada etapa sendo processada e as capabilities acionadas.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  Check, 
  Circle, 
  Loader2, 
  Lock, 
  ChevronDown,
  ChevronRight,
  Zap,
  Clock
} from 'lucide-react';
import type { ExecutionPlan, ExecutionStep, CapabilityCall } from '../types';

interface DeveloperModeCardProps {
  plan: ExecutionPlan;
  currentStep: number | null;
  onStepUpdate?: (stepIndex: number, status: string) => void;
}

export function DeveloperModeCard({ 
  plan, 
  currentStep,
  onStepUpdate 
}: DeveloperModeCardProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="developer-mode-card"
    >
      <div className="dev-mode-header">
        <div className="header-icon">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <h3>MODO DESENVOLVEDOR</h3>
        <div className="header-badge">
          <Zap className="w-3 h-3" />
          <span>Em execução</span>
        </div>
      </div>

      <div className="execution-steps">
        <AnimatePresence mode="sync">
          {plan.etapas.map((etapa, idx) => (
            <ExecutionStepItem
              key={idx}
              etapa={etapa}
              stepIndex={idx}
              isActive={etapa.status === 'executando'}
              isCompleted={etapa.status === 'concluida'}
              isPending={etapa.status === 'pendente'}
              currentStep={currentStep}
            />
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .developer-mode-card {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
          border-radius: 16px;
          border: 1px solid rgba(255, 107, 53, 0.3);
          overflow: hidden;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .dev-mode-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(90deg, rgba(255, 107, 53, 0.1), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dev-mode-header .header-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(145deg, #ff6b35, #f7931e);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dev-mode-header h3 {
          color: #ff6b35;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          flex: 1;
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          color: #10b981;
          font-size: 11px;
          font-weight: 600;
        }

        .execution-steps {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </motion.div>
  );
}

interface ExecutionStepItemProps {
  etapa: ExecutionStep;
  stepIndex: number;
  isActive: boolean;
  isCompleted: boolean;
  isPending: boolean;
  currentStep: number | null;
}

function ExecutionStepItem({
  etapa,
  stepIndex,
  isActive,
  isCompleted,
  isPending,
  currentStep
}: ExecutionStepItemProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);

  useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [isActive]);

  const getStatusIcon = () => {
    if (isCompleted) return <Check className="w-4 h-4 text-emerald-500" />;
    if (isActive) return <div className="active-dot" />;
    return <Circle className="w-4 h-4 text-gray-600" />;
  };

  return (
    <motion.div
      layout
      className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''}`}
    >
      <div 
        className="step-header"
        onClick={() => (isCompleted || isActive) && setIsExpanded(!isExpanded)}
      >
        <div className="step-connector">
          <div className="connector-line top" />
          <div className="step-icon">
            {getStatusIcon()}
          </div>
          <div className="connector-line bottom" />
        </div>

        <div className="step-content">
          <p className="step-title">{etapa.titulo || etapa.descricao}</p>
          
          {isPending && (
            <span className="status-badge locked">
              <Lock className="w-3 h-3" />
              Bloqueado
            </span>
          )}

          {isActive && (
            <span className="status-badge executing">
              <Loader2 className="w-3 h-3 animate-spin" />
              Executando...
            </span>
          )}

          {isCompleted && (
            <span className="status-badge completed">
              <Check className="w-3 h-3" />
              Concluído
            </span>
          )}
        </div>

        {(isCompleted || isActive) && (
          <button className="expand-btn">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (isActive || isCompleted) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="capabilities-container"
          >
            <div className="capabilities-list">
              {etapa.capabilities && etapa.capabilities.length > 0 ? (
                etapa.capabilities.map((capability, capIdx) => (
                  <CapabilityItem 
                    key={capability.id || capIdx} 
                    capability={capability} 
                  />
                ))
              ) : (
                <div className="capability-item executing">
                  <div className="cap-icon">
                    <Zap className="w-3 h-3" />
                  </div>
                  <div className="cap-content">
                    <span className="cap-name">{etapa.funcao}</span>
                    <span className="cap-status">
                      {isActive ? 'Processando...' : 'Executado'}
                    </span>
                  </div>
                  {isActive && <Loader2 className="w-4 h-4 animate-spin text-orange-400" />}
                  {isCompleted && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .step-item {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .step-item.active {
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.2);
        }

        .step-item.completed {
          background: rgba(16, 185, 129, 0.03);
        }

        .step-item.pending {
          opacity: 0.6;
        }

        .step-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 12px;
          cursor: pointer;
        }

        .step-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .connector-line {
          width: 2px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
        }

        .step-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .step-item.active .step-icon {
          background: rgba(255, 107, 53, 0.2);
          border-color: #ff6b35;
        }

        .step-item.completed .step-icon {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
        }

        .active-dot {
          width: 8px;
          height: 8px;
          background: #ff6b35;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 10px #ff6b35;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .step-title {
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
          width: fit-content;
        }

        .status-badge.locked {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }

        .status-badge.executing {
          background: rgba(255, 107, 53, 0.2);
          color: #ff6b35;
        }

        .status-badge.completed {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .expand-btn {
          background: transparent;
          border: none;
          color: #ff6b35;
          cursor: pointer;
          padding: 4px;
        }

        .capabilities-container {
          overflow: hidden;
        }

        .capabilities-list {
          padding: 0 16px 16px 52px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .capability-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .capability-item.executing {
          border-color: rgba(255, 107, 53, 0.3);
          background: rgba(255, 107, 53, 0.05);
        }

        .capability-item.completed {
          border-color: rgba(16, 185, 129, 0.3);
          border-style: solid;
        }

        .cap-icon {
          width: 24px;
          height: 24px;
          background: rgba(255, 107, 53, 0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff6b35;
        }

        .cap-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .cap-name {
          color: #fff;
          font-size: 13px;
          font-weight: 500;
        }

        .cap-status {
          color: #9ca3af;
          font-size: 11px;
        }
      `}</style>
    </motion.div>
  );
}

interface CapabilityItemProps {
  capability: CapabilityCall;
}

function CapabilityItem({ capability }: CapabilityItemProps) {
  const isExecuting = capability.status === 'executing';
  const isCompleted = capability.status === 'completed';
  const isPending = capability.status === 'pending';
  const hasFailed = capability.status === 'failed';

  return (
    <div className={`capability-item ${isExecuting ? 'executing' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="cap-icon">
        <Zap className="w-3 h-3" />
      </div>
      <div className="cap-content">
        <span className="cap-name">{capability.displayName || capability.nome}</span>
        <span className="cap-status">
          {isExecuting && 'Executando...'}
          {isCompleted && capability.duracao && `Concluído em ${capability.duracao}ms`}
          {isCompleted && !capability.duracao && 'Concluído'}
          {isPending && 'Aguardando...'}
          {hasFailed && 'Falhou'}
        </span>
      </div>
      {isExecuting && <Loader2 className="w-4 h-4 animate-spin text-orange-400" />}
      {isCompleted && <Check className="w-4 h-4 text-emerald-500" />}
      {isPending && <Clock className="w-4 h-4 text-gray-500" />}
    </div>
  );
}

export default DeveloperModeCard;

/**
 * PLAN ACTION CARD - Card de Plano de Ação
 * 
 * Exibe o plano de ação inicial com checkboxes e botões de ação
 * conforme o design do Agente Jota
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Circle, Edit3, Play } from 'lucide-react';
import type { ExecutionPlan } from '../types';

interface PlanActionCardProps {
  plan: ExecutionPlan;
  onApply: () => void;
  onEdit?: () => void;
}

export function PlanActionCard({ plan, onApply, onEdit }: PlanActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="plan-action-card"
    >
      <div className="plan-steps">
        {plan.etapas.map((etapa, idx) => (
          <div key={idx} className="plan-step-item">
            <div className="step-checkbox">
              <Circle className="w-5 h-5 text-orange-400" />
            </div>
            <span className="step-text">{etapa.titulo || etapa.descricao}</span>
          </div>
        ))}
      </div>

      <div className="plan-actions">
        <button className="action-btn primary" onClick={onApply}>
          <Play className="w-4 h-4" />
          APLICAR PLANO
        </button>
        {onEdit && (
          <button className="action-btn secondary" onClick={onEdit}>
            <Edit3 className="w-4 h-4" />
            EDITAR PLANO
          </button>
        )}
      </div>

      <style>{`
        .plan-action-card {
          background: rgba(15, 23, 42, 0.8);
          border-radius: 16px;
          border: 1px solid rgba(255, 107, 53, 0.3);
          padding: 20px;
          backdrop-filter: blur(12px);
        }

        .plan-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .plan-step-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .step-checkbox {
          flex-shrink: 0;
        }

        .step-text {
          color: #fff;
          font-size: 15px;
          font-weight: 400;
        }

        .plan-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.primary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
        }

        .action-btn.primary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .action-btn.secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </motion.div>
  );
}

export default PlanActionCard;

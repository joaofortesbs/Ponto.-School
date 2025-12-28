import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Circle, Play, Edit3 } from 'lucide-react';
import { useChatState } from '../state/chatState';
import type { PlanCardData, EtapaState } from '../types/message-types';

interface PlanActionCardProps {
  cardId: string;
  data: PlanCardData;
  isStatic?: boolean;
  onApplyPlan?: () => void;
}

export function PlanActionCard({ cardId, data, isStatic = true, onApplyPlan }: PlanActionCardProps) {
  const { addTextMessage, addDevModeCard, setExecuting } = useChatState();

  const handleApplyPlan = () => {
    addTextMessage('assistant', 'Vou executar o seu plano de ação agora');

    const devModeData = {
      plano: data,
      status: 'executando' as const,
      etapaAtual: 0,
      etapas: data.etapas.map((e, idx): EtapaState => ({
        ordem: e.ordem,
        titulo: e.titulo,
        descricao: e.descricao,
        status: idx === 0 ? 'executando' : 'pendente',
        capabilities: []
      }))
    };

    addDevModeCard(devModeData);
    setExecuting(true);

    onApplyPlan?.();
  };

  if (!data) return null;

  return (
    <motion.div
      layout={isStatic}
      className="w-full max-w-2xl mx-auto my-2"
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
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Play size={16} />
            APLICAR PLANO
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

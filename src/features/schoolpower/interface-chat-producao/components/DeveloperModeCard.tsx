import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useChatState } from '../state/chatState';
import { ProgressiveExecutionCard, ObjectiveItem, CapabilityItem } from './ProgressiveExecutionCard';
import type { DevModeCardData, CapabilityState } from '../types/message-types';

interface DeveloperModeCardProps {
  cardId: string;
  data: DevModeCardData;
  isStatic?: boolean;
}

export function DeveloperModeCard({ cardId, data, isStatic = true }: DeveloperModeCardProps) {
  const { updateCardData, updateCapabilityStatus, updateEtapaStatus, addTextMessage, addCapabilityToEtapa } = useChatState();

  useEffect(() => {
    const handleProgress = (event: CustomEvent) => {
      const update = event.detail;

      if (update.type === 'capability:apareceu') {
        const novaCapability: CapabilityState = {
          id: `cap-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          nome: update.capability_name,
          displayName: update.displayName,
          status: 'pendente'
        };
        addCapabilityToEtapa(cardId, update.stepIndex, novaCapability);
      }

      if (update.type === 'capability:iniciou') {
        updateCapabilityStatus(cardId, update.stepIndex, update.capability_id, 'executando');
      }

      if (update.type === 'capability:concluiu') {
        updateCapabilityStatus(cardId, update.stepIndex, update.capability_id, 'concluido');
        if (update.mensagem) {
          addTextMessage('assistant', update.mensagem);
        }
      }

      if (update.type === 'execution:step:started') {
        updateEtapaStatus(cardId, update.stepIndex, 'executando');
      }

      if (update.type === 'execution:step:completed') {
        updateEtapaStatus(cardId, update.stepIndex, 'concluido');
        addTextMessage('assistant', `Etapa "${update.stepTitle}" concluída com sucesso!`);
      }

      if (update.type === 'execution:completed') {
        updateCardData(cardId, { status: 'concluido' });
      }
    };

    window.addEventListener('agente-jota-progress', handleProgress as EventListener);

    return () => {
      window.removeEventListener('agente-jota-progress', handleProgress as EventListener);
    };
  }, [cardId, updateCardData, updateCapabilityStatus, updateEtapaStatus, addTextMessage, addCapabilityToEtapa]);

  const objectivesForProgressiveCard = useMemo((): ObjectiveItem[] => {
    if (!data?.etapas) return [];

    return data.etapas.map((etapa, idx) => {
      let objectiveStatus: 'pending' | 'active' | 'completed' = 'pending';
      if (etapa.status === 'concluido') objectiveStatus = 'completed';
      else if (etapa.status === 'executando') objectiveStatus = 'active';

      const capabilities: CapabilityItem[] = etapa.capabilities.map((cap) => {
        let capStatus: 'hidden' | 'pending' | 'executing' | 'completed' | 'error' = 'pending';
        if (cap.status === 'executando') capStatus = 'executing';
        else if (cap.status === 'concluido') capStatus = 'completed';
        else if (cap.status === 'erro') capStatus = 'error';
        else if (cap.status === 'pendente') capStatus = 'pending';

        return {
          id: cap.id,
          nome: cap.nome,
          displayName: cap.displayName,
          status: capStatus,
        };
      });

      return {
        ordem: idx,
        titulo: etapa.titulo,
        descricao: etapa.descricao,
        status: objectiveStatus,
        capabilities,
      };
    });
  }, [data?.etapas]);

  if (!data) return null;

  return (
    <motion.div
      layout={isStatic}
      className="w-full max-w-2xl mx-auto my-2"
    >
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/95 border border-[#FF6B35]/30 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm p-5">
        <ProgressiveExecutionCard
          objectives={objectivesForProgressiveCard}
          onObjectiveComplete={(index) => {
            console.log(`📍 [DeveloperModeCard] Objetivo ${index} concluído`);
          }}
          onAllComplete={() => {
            console.log('✅ [DeveloperModeCard] Todos os objetivos concluídos');
          }}
        />
      </div>
    </motion.div>
  );
}

export default DeveloperModeCard;

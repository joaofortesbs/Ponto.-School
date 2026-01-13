import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useChatState } from '../state/chatState';
import { ProgressiveExecutionCard, ObjectiveItem, CapabilityItem, ObjectiveReflection } from './ProgressiveExecutionCard';
import type { DevModeCardData, CapabilityState } from '../types/message-types';
import type { ActivityToBuild } from '../construction-interface';

interface DeveloperModeCardProps {
  cardId: string;
  data: DevModeCardData;
  isStatic?: boolean;
}

export function DeveloperModeCard({ cardId, data, isStatic = true }: DeveloperModeCardProps) {
  const { updateCardData, updateCapabilityStatus, updateEtapaStatus, addCapabilityToEtapa } = useChatState();
  const [reflections, setReflections] = useState<Map<number, ObjectiveReflection>>(new Map());
  const [loadingReflections, setLoadingReflections] = useState<Set<number>>(new Set());
  const [activitiesToBuild, setActivitiesToBuild] = useState<ActivityToBuild[]>([]);
  const [isBuildingActivities, setIsBuildingActivities] = useState(false);

  const handleBuildActivities = useCallback(() => {
    console.log('🔨 [DeveloperModeCard] Iniciando construção de atividades');
    setIsBuildingActivities(true);
    window.dispatchEvent(new CustomEvent('agente-jota-build-activities', {
      detail: { activities: activitiesToBuild }
    }));
  }, [activitiesToBuild]);

  useEffect(() => {
    const handleProgress = (event: CustomEvent) => {
      const update = event.detail;

      console.log(`🔔 [DeveloperModeCard] Evento recebido: ${update.type}`, {
        stepIndex: update.stepIndex,
        capability_id: update.capability_id,
      });

      if (update.type === 'capability:apareceu') {
        const novaCapability: CapabilityState = {
          id: update.capability_id || `cap-${update.stepIndex}-${update.capability_name}`,
          nome: update.capability_name,
          displayName: update.displayName,
          status: 'pendente'
        };
        addCapabilityToEtapa(cardId, update.stepIndex, novaCapability);
      }

      if (update.type === 'capability:iniciou') {
        console.log(`▶️ [DeveloperModeCard] Iniciando capability: ${update.capability_id} na etapa ${update.stepIndex}`);
        updateCapabilityStatus(cardId, update.stepIndex, update.capability_id, 'executando');
      }

      if (update.type === 'capability:concluiu') {
        console.log(`✅ [DeveloperModeCard] Concluindo capability: ${update.capability_id} na etapa ${update.stepIndex}`);
        updateCapabilityStatus(cardId, update.stepIndex, update.capability_id, 'concluido');
      }

      if (update.type === 'capability:erro') {
        console.log(`❌ [DeveloperModeCard] Erro na capability: ${update.capability_id} na etapa ${update.stepIndex}`);
        updateCapabilityStatus(cardId, update.stepIndex, update.capability_id, 'erro');
      }

      if (update.type === 'execution:step:started') {
        console.log(`🚀 [DeveloperModeCard] Iniciando etapa: ${update.stepIndex}`);
        updateEtapaStatus(cardId, update.stepIndex, 'executando');
      }

      if (update.type === 'execution:step:completed') {
        console.log(`🏁 [DeveloperModeCard] Concluindo etapa: ${update.stepIndex}`);
        updateEtapaStatus(cardId, update.stepIndex, 'concluido');
      }

      if (update.type === 'reflection:loading') {
        console.log(`💭 [DeveloperModeCard] Carregando reflexão para etapa: ${update.stepIndex}`);
        setLoadingReflections(prev => new Set([...prev, update.stepIndex]));
      }

      if (update.type === 'reflection:ready') {
        console.log(`💡 [DeveloperModeCard] Reflexão pronta para etapa: ${update.stepIndex}`, update.reflection);
        setLoadingReflections(prev => {
          const next = new Set(prev);
          next.delete(update.stepIndex);
          return next;
        });
        
        if (update.reflection) {
          setReflections(prev => {
            const next = new Map(prev);
            next.set(update.stepIndex, {
              id: update.reflection.id,
              objectiveTitle: update.reflection.objectiveTitle,
              narrative: update.reflection.narrative,
              tone: update.reflection.tone,
              highlights: update.reflection.highlights || [],
            });
            return next;
          });
        }
      }

      if (update.type === 'execution:completed') {
        console.log(`🎉 [DeveloperModeCard] Execução completa!`);
        updateCardData(cardId, { status: 'concluido' });
        setIsBuildingActivities(false);
      }

      if (update.type === 'construction:activities_ready') {
        console.log(`🏗️ [DeveloperModeCard] Atividades para construir:`, update.activities);
        setActivitiesToBuild(update.activities || []);
      }

      if (update.type === 'construction:activity_progress') {
        console.log(`📊 [DeveloperModeCard] Progresso da atividade:`, update.activityId, update.progress);
        setActivitiesToBuild(prev => prev.map(a => 
          a.id === update.activityId 
            ? { ...a, status: 'building' as const, progress: update.progress }
            : a
        ));
      }

      if (update.type === 'construction:activity_completed') {
        console.log(`✅ [DeveloperModeCard] Atividade concluída:`, update.activityId);
        setActivitiesToBuild(prev => prev.map(a => 
          a.id === update.activityId 
            ? { ...a, status: 'completed' as const, progress: 100, built_data: update.data }
            : a
        ));
      }

      if (update.type === 'construction:activity_error') {
        console.log(`❌ [DeveloperModeCard] Erro na atividade:`, update.activityId, update.error);
        setActivitiesToBuild(prev => prev.map(a => 
          a.id === update.activityId 
            ? { ...a, status: 'error' as const, error_message: update.error }
            : a
        ));
      }

      if (update.type === 'construction:all_completed') {
        console.log(`🎉 [DeveloperModeCard] Todas as atividades construídas!`);
        setIsBuildingActivities(false);
      }
    };

    window.addEventListener('agente-jota-progress', handleProgress as EventListener);

    return () => {
      window.removeEventListener('agente-jota-progress', handleProgress as EventListener);
    };
  }, [cardId, updateCardData, updateCapabilityStatus, updateEtapaStatus, addCapabilityToEtapa]);

  // Listener para receber atividades decididas pela capability decidir_atividades_criar
  useEffect(() => {
    const handleActivitiesDecided = (event: CustomEvent) => {
      const { activities, total, estrategia } = event.detail;
      console.log(`🎯 [DeveloperModeCard] Atividades decididas recebidas: ${total}`);
      console.log(`   📋 Estratégia: ${estrategia}`);
      console.log(`   📋 Atividades:`, activities);
      
      if (activities && Array.isArray(activities) && activities.length > 0) {
        setActivitiesToBuild(activities);
        console.log(`✅ [DeveloperModeCard] activitiesToBuild atualizado com ${activities.length} atividades`);
      }
    };

    window.addEventListener('agente-jota-activities-decided', handleActivitiesDecided as EventListener);

    return () => {
      window.removeEventListener('agente-jota-activities-decided', handleActivitiesDecided as EventListener);
    };
  }, []);


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
          reflections={reflections}
          loadingReflections={loadingReflections}
          activitiesToBuild={activitiesToBuild}
          onBuildActivities={handleBuildActivities}
          isBuildingActivities={isBuildingActivities}
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

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChatState } from '../state/chatState';
import { ProgressiveExecutionCard, ObjectiveItem, CapabilityItem, ObjectiveReflection } from './ProgressiveExecutionCard';
import type { DevModeCardData, CapabilityState } from '../types/message-types';
import type { ActivityToBuild } from '../construction-interface';
import { useChosenActivitiesStore } from '../stores/ChosenActivitiesStore';
import { useReflectionsStore, saveReflectionFromEvent } from '../stores/ReflectionsStore';

interface DeveloperModeCardProps {
  cardId: string;
  data: DevModeCardData;
  isStatic?: boolean;
}

export function DeveloperModeCard({ cardId, data, isStatic = true }: DeveloperModeCardProps) {
  const { updateCardData, updateCapabilityStatus, updateEtapaStatus, addCapabilityToEtapa, addEtapaToCard } = useChatState();
  const [reflections, setReflections] = useState<Map<number, ObjectiveReflection>>(new Map());
  const [loadingReflections, setLoadingReflections] = useState<Set<number>>(new Set());
  const [activitiesToBuild, setActivitiesToBuild] = useState<ActivityToBuild[]>([]);
  const [isBuildingActivities, setIsBuildingActivities] = useState(false);
  
  const getActivitiesForConstruction = useChosenActivitiesStore(state => state.getActivitiesForConstruction);
  const chosenActivitiesHydrated = useChosenActivitiesStore(state => state._hasHydrated);
  const chosenActivitiesCount = useChosenActivitiesStore(state => state.chosenActivities.length);
  
  const getCardReflections = useReflectionsStore(state => state.getCardReflections);
  const reflectionsHydrated = useReflectionsStore(state => state._hasHydrated);
  
  const hasRestoredFromStoreRef = useRef(false);
  const hasRestoredReflectionsRef = useRef(false);
  
  const activitiesToBuildRef = useRef<ActivityToBuild[]>([]);
  const dataRef = useRef<DevModeCardData>(data);

  useEffect(() => {
    activitiesToBuildRef.current = activitiesToBuild;
  }, [activitiesToBuild]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (reflectionsHydrated && !hasRestoredReflectionsRef.current) {
      hasRestoredReflectionsRef.current = true;
      const storedReflections = getCardReflections(cardId);
      
      if (storedReflections.size > 0) {
        console.log(`🔄 [DeveloperModeCard] Restaurando ${storedReflections.size} reflexões persistidas para card ${cardId}`);
        
        const restoredMap = new Map<number, ObjectiveReflection>();
        storedReflections.forEach((stored) => {
          const targetIndex = stored.objectiveIndex;
          restoredMap.set(targetIndex, {
            id: stored.id,
            objectiveTitle: stored.objectiveTitle,
            narrative: stored.narrative,
            tone: stored.tone,
            highlights: stored.highlights || [],
          });
          console.log(`   ✅ Reflexão restaurada: objetivo ${targetIndex} - "${stored.objectiveTitle.substring(0, 30)}..."`);
        });
        
        setReflections(restoredMap);
        console.log(`✅ [DeveloperModeCard] ${restoredMap.size} reflexões restauradas com sucesso`);
      }
    }
  }, [reflectionsHydrated, cardId, getCardReflections]);

  useEffect(() => {
    if (
      chosenActivitiesHydrated && 
      chosenActivitiesCount > 0 && 
      activitiesToBuild.length === 0 &&
      !hasRestoredFromStoreRef.current
    ) {
      hasRestoredFromStoreRef.current = true;
      const restoredActivities = getActivitiesForConstruction();
      console.log('🔄 [DeveloperModeCard] Restaurando atividades do store persistido:', restoredActivities.length);
      setActivitiesToBuild(restoredActivities);
    }
  }, [chosenActivitiesHydrated, chosenActivitiesCount, activitiesToBuild.length, getActivitiesForConstruction]);

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
        const currentData = dataRef.current;
        const etapas = currentData?.etapas || [];
        const targetEtapa = etapas[update.stepIndex];
        const capExists = targetEtapa?.capabilities?.some((c: any) => c.id === update.capability_id);
        if (!capExists && targetEtapa) {
          const novaCapability: CapabilityState = {
            id: update.capability_id || `cap-auto-${Date.now()}`,
            nome: update.capability_name || 'capability',
            displayName: update.displayName || update.capability_name || update.stepTitle,
            status: 'pendente'
          };
          addCapabilityToEtapa(cardId, update.stepIndex, novaCapability);
        }
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
          const reflectionData = {
            id: update.reflection.id,
            objectiveIndex: update.stepIndex,
            objectiveTitle: update.reflection.objectiveTitle,
            narrative: update.reflection.narrative,
            tone: update.reflection.tone,
            highlights: update.reflection.highlights || [],
          };
          
          setReflections(prev => {
            const next = new Map(prev);
            next.set(update.stepIndex, reflectionData);
            return next;
          });
          
          saveReflectionFromEvent(cardId, update.stepIndex, reflectionData);
          console.log(`💾 [DeveloperModeCard] Reflexão persistida para card ${cardId}, etapa ${update.stepIndex}`);
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
        console.log(`📊 [DeveloperModeCard] Progresso da atividade:`, update.activityId, update.progress, update.fields_completed);
        setActivitiesToBuild(prev => prev.map(a => 
          a.id === update.activityId || a.activity_id === update.activityId
            ? { 
                ...a, 
                status: 'building' as const, 
                progress: update.progress,
                // CORREÇÃO: Atualizar contagem de campos se disponível
                fields_completed: update.fields_completed ?? a.fields_completed
              }
            : a
        ));
      }

      if (update.type === 'construction:activity_completed') {
        // CORREÇÃO CRÍTICA: Calcular campos a partir de update.data.fields
        const fields = update.data?.fields || {};
        const fieldsCompleted = update.data?.fields_completed ?? Object.keys(fields).filter((k: string) => 
          fields[k] !== undefined && fields[k] !== ''
        ).length;
        
        // Calcular total - usar o existente ou o número de campos preenchidos (não defaultar para 5)
        const fieldsTotal = Object.keys(fields).length;
        
        console.log(`✅ [DeveloperModeCard] Atividade concluída:`, update.activityId, `- ${fieldsCompleted}/${fieldsTotal || 'N/A'} campos`);
        
        setActivitiesToBuild(prev => prev.map(a => 
          a.id === update.activityId || a.activity_id === update.activityId
            ? { 
                ...a, 
                status: 'completed' as const, 
                progress: 100, 
                built_data: update.data,
                // CORREÇÃO: Incluir contagem de campos correta (sem fallback para 5)
                fields_completed: fieldsCompleted,
                fields_total: a.fields_total || fieldsTotal || fieldsCompleted
              }
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
        console.log(`   📋 Atividades do update: ${update.activities?.length || 0}`);
        console.log(`   📋 Atividades locais (ref): ${activitiesToBuildRef.current.length}`);
        setIsBuildingActivities(false);
        
        // Persistir atividades completadas para uso posterior
        const activitiesForGeneration = (update.activities && update.activities.length > 0) 
          ? update.activities 
          : activitiesToBuildRef.current;
        setCompletedActivities(activitiesForGeneration);
      }

      if (update.type === 'flow:etapa_added') {
        console.log(`🌊 [DeveloperModeCard] Ponto Flow: Nova etapa adicionada`);
        addEtapaToCard(cardId, {
          titulo: update.flowTitle || 'Preparando pacote completo',
          descricao: update.flowDescription || 'Gerando documentos complementares',
          status: 'executando',
          capabilities: (update.flowCapabilities || []).map((cap: any) => ({
            id: cap.id,
            nome: cap.nome,
            displayName: cap.displayName,
            status: 'pendente' as const,
          })),
        });
      }

      if (update.type === 'flow:capability_started') {
        const etapas = dataRef.current?.etapas || [];
        const flowEtapaIndex = etapas.length - 1;
        if (flowEtapaIndex >= 0) {
          updateCapabilityStatus(cardId, flowEtapaIndex, update.capability_id, 'executando');
        }
      }

      if (update.type === 'flow:capability_completed') {
        const etapas = dataRef.current?.etapas || [];
        const flowEtapaIndex = etapas.length - 1;
        if (flowEtapaIndex >= 0) {
          updateCapabilityStatus(cardId, flowEtapaIndex, update.capability_id, 'concluido');
        }
      }

      if (update.type === 'flow:capability_error') {
        const etapas = dataRef.current?.etapas || [];
        const flowEtapaIndex = etapas.length - 1;
        if (flowEtapaIndex >= 0) {
          updateCapabilityStatus(cardId, flowEtapaIndex, update.capability_id, 'erro');
        }
      }

      if (update.type === 'flow:completed') {
        const etapas = dataRef.current?.etapas || [];
        const flowEtapaIndex = etapas.length - 1;
        if (flowEtapaIndex >= 0) {
          updateEtapaStatus(cardId, flowEtapaIndex, 'concluido');
        }
      }

      // Handler para erro no pipeline - MANTER cards visíveis com status de erro
      if (update.type === 'construction:pipeline_error') {
        console.log(`⚠️ [DeveloperModeCard] Pipeline error - mantendo cards visíveis:`, update.error);
        setIsBuildingActivities(false);
        
        // Marcar todas as atividades pendentes/building como erro, mas NÃO limpar a lista
        // ActivityBuildStatus é 'waiting' | 'building' | 'completed' | 'error'
        setActivitiesToBuild(prev => prev.map(a => 
          a.status === 'waiting' || a.status === 'building'
            ? { ...a, status: 'error' as const, error_message: update.error || 'Erro ao salvar atividade' }
            : a
        ));
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

  // CORREÇÃO CRÍTICA: Listener para atualizar contagem de campos quando gerar_conteudo_atividades emite campos gerados
  useEffect(() => {
    const handleFieldsGenerated = (event: CustomEvent) => {
      const { activity_id, fields, validation, fields_completed, fields_total } = event.detail;
      
      // Usar contagens explícitas do evento, ou calcular a partir dos campos
      const finalFieldsCount = fields_completed ?? Object.keys(fields || {}).filter((k: string) => 
        fields[k] !== undefined && fields[k] !== ''
      ).length;
      
      // Usar fields_total do evento, ou validation.required_count, ou campos preenchidos
      const finalFieldsTotal = fields_total ?? validation?.required_count ?? finalFieldsCount;
      
      console.log(`📝 [DeveloperModeCard] Campos gerados para ${activity_id}: ${finalFieldsCount}/${finalFieldsTotal} campos`);
      
      setActivitiesToBuild(prev => prev.map(a => 
        a.id === activity_id || a.activity_id === activity_id
          ? { 
              ...a, 
              fields_completed: finalFieldsCount,
              fields_total: finalFieldsTotal || a.fields_total,
              // CORREÇÃO: Preservar estrutura existente de built_data, adicionar generated_fields
              built_data: { 
                ...(a.built_data || {}), 
                generated_fields: fields 
              }
            }
          : a
      ));
    };

    window.addEventListener('agente-jota-fields-generated', handleFieldsGenerated as EventListener);

    return () => {
      window.removeEventListener('agente-jota-fields-generated', handleFieldsGenerated as EventListener);
    };
  }, []);

  const [completedActivities, setCompletedActivities] = useState<ActivityToBuild[]>([]);

  const [packageCoherence, setPackageCoherence] = useState<{
    coherence_score: number;
    coherence_issues: string[];
    sequence_ok: boolean;
    verified_count?: number;
    flagged_count?: number;
  } | null>(null);

  useEffect(() => {
    const handleCoherenceCompleted = (event: CustomEvent) => {
      const { coherence_score, coherence_issues, sequence_ok, verified_count, flagged_count } = event.detail;
      setPackageCoherence({ coherence_score, coherence_issues: coherence_issues || [], sequence_ok, verified_count, flagged_count });
    };
    window.addEventListener('package:coherence:completed', handleCoherenceCompleted as EventListener);
    return () => {
      window.removeEventListener('package:coherence:completed', handleCoherenceCompleted as EventListener);
    };
  }, []);


  const objectivesForProgressiveCard = useMemo((): ObjectiveItem[] => {
    if (!data?.etapas) return [];

    const baseObjectives = data.etapas.map((etapa, idx) => {
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

    return baseObjectives;
  }, [data?.etapas]);

  if (!data) return null;

  return (
    <motion.div
      layout={isStatic}
      className="w-full max-w-2xl my-2"
      style={{ marginLeft: '52px' }}
    >
      <div className="rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm p-5" style={{ backgroundColor: '#040b2a', borderWidth: '1px', borderStyle: 'solid', borderColor: '#1e2440' }}>
        <ProgressiveExecutionCard
          objectives={objectivesForProgressiveCard}
          reflections={reflections}
          loadingReflections={loadingReflections}
          activitiesToBuild={activitiesToBuild}
          completedActivities={completedActivities}
          onBuildActivities={handleBuildActivities}
          isBuildingActivities={isBuildingActivities}
          onObjectiveComplete={(index) => {
            console.log(`📍 [DeveloperModeCard] Objetivo ${index} concluído`);
          }}
          onAllComplete={() => {
            console.log('✅ [DeveloperModeCard] Todos os objetivos concluídos');
          }}
        />
        {packageCoherence && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">Coerência do Pacote</span>
              <div className="flex items-center gap-2">
                {packageCoherence.verified_count !== undefined && (
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">
                    {packageCoherence.verified_count} verificadas
                  </span>
                )}
                {packageCoherence.flagged_count !== undefined && packageCoherence.flagged_count > 0 && (
                  <span className="text-xs text-yellow-400 bg-yellow-400/10 rounded-full px-2 py-0.5">
                    {packageCoherence.flagged_count} sinalizadas
                  </span>
                )}
                <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${packageCoherence.coherence_score >= 7 ? 'text-emerald-400 bg-emerald-400/10' : packageCoherence.coherence_score >= 5 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {packageCoherence.coherence_score}/10
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs ${packageCoherence.sequence_ok ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {packageCoherence.sequence_ok ? '✓ Sequência pedagógica OK' : '⚠ Sequência a revisar'}
              </span>
            </div>
            {packageCoherence.coherence_issues.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {packageCoherence.coherence_issues.slice(0, 3).map((issue, i) => (
                  <li key={i} className="text-xs text-white/50 flex items-start gap-1">
                    <span className="text-yellow-400 mt-0.5">·</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default DeveloperModeCard;

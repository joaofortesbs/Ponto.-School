import { useState, useCallback } from 'react';
import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { autoBuildActivities, AutoBuildProgress } from '../auto/autoBuildActivities';
import { modalBinderEngine, ModalBinderConfig } from '../modalBinder';
import { generateActivityData } from '../api/generateActivity';

export const useAutoActivityBuilder = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState<AutoBuildProgress | null>(null);
  const [builtActivities, setBuiltActivities] = useState<Set<string>>(new Set());

  const buildActivities = useCallback(async (planData: ActionPlanItem[], contextualizationData?: any): Promise<boolean> => {
    if (isBuilding) {
      console.warn('⚠️ Construção já em andamento');
      return false;
    }

    setIsBuilding(true);
    setProgress({
      total: planData.length,
      completed: 0,
      current: 'Iniciando...',
      errors: []
    });

    let allSuccess = true;
    const results = [];

    try {
        for (const activity of planData) {
            try {
                console.log(`🏗️ Construindo atividade: ${activity.title}`);

                // 1. Gerar dados da atividade via IA
                const iaResponse = await generateActivityData(activity, contextualizationData);

                if (!iaResponse) {
                    throw new Error('Falha na geração dos dados via IA');
                }

                // 2. Configurar ModalBinderEngine
                const binderConfig: ModalBinderConfig = {
                    activityId: activity.id,
                    type: activity.id, // Usar o ID como tipo de atividade
                    iaRawOutput: iaResponse,
                    contextualizationData
                };

                // 3. Executar sincronização automática
                const success = await modalBinderEngine(binderConfig);

                if (success) {
                    console.log(`✅ Atividade construída automaticamente: ${activity.title}`);
                    results.push({ activity: activity.title, status: 'success' });
                     // Adicionar atividade construída ao conjunto
                    const newBuiltActivities = new Set(builtActivities);
                    newBuiltActivities.add(activity.id);
                    setBuiltActivities(newBuiltActivities);
                } else {
                    throw new Error('Falha na sincronização automática');
                }

            } catch (error) {
                console.error(`❌ Erro ao construir atividade ${activity.title}:`, error);
                allSuccess = false;
                results.push({ activity: activity.title, status: 'error', error: error.message });
                setProgress(prevProgress => ({
                  ...prevProgress,
                  errors: [...prevProgress.errors, `Erro em ${activity.title}: ${error.message}`]
                }));
            }
        }
        console.log('🎯 Resultados da construção automática:', results);
        return allSuccess;

    } catch (error) {
      console.error('❌ Erro durante construção automática:', error);
      return false;
    } finally {
      setIsBuilding(false);
      // Limpar progresso após um delay
      setTimeout(() => setProgress(null), 3000);
    }
  }, [isBuilding, builtActivities]);

  const isActivityBuilt = useCallback((activityId: string): boolean => {
    return builtActivities.has(activityId) || 
           localStorage.getItem(`generated_content_${activityId}`) !== null;
  }, [builtActivities]);

  const resetBuildStatus = useCallback(() => {
    setBuiltActivities(new Set());
    setProgress(null);
  }, []);

  return {
    buildActivities,
    isBuilding,
    progress,
    isActivityBuilt,
    resetBuildStatus
  };
};
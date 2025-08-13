import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { fillActivityModalFields } from '../api/fillActivityModalFields';
import { getActivityDataFromPlan } from '../utils/getActivityDataFromPlan';

export interface AutoBuildProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
}

export type AutoBuildCallback = (progress: AutoBuildProgress) => void;

export const autoBuildActivities = async (
  planData: ActionPlanItem[],
  onProgress?: AutoBuildCallback
): Promise<boolean> => {
  console.log('🤖 Iniciando construção automática de atividades:', planData);

  const totalActivities = planData.length;
  let completedActivities = 0;
  const errors: string[] = [];

  const updateProgress = (currentActivity: string) => {
    if (onProgress) {
      onProgress({
        total: totalActivities,
        completed: completedActivities,
        current: currentActivity,
        errors: [...errors]
      });
    }
  };

  for (const activity of planData) {
    try {
      console.log(`🔄 Processando atividade: ${activity.title}`);
      updateProgress(activity.title);

      // Extrair dados da atividade do plano
      const activityData = getActivityDataFromPlan(activity);

      if (!activityData) {
        throw new Error('Dados da atividade não encontrados no plano');
      }

      console.log(`🔄 Construindo atividade: ${activity.id} - ${activity.title}`);

      // Tratamento específico para Sequência Didática
      if (activity.id === 'sequencia-didatica') {
        console.log('🎯 Construindo Sequência Didática automaticamente...');
        
        // Importar o builder específico
        const { SequenciaDidaticaBuilder } = await import('../../activities/sequencia-didatica/SequenciaDidaticaBuilder');
        
        // Mapear dados do plano para os campos da sequência didática
        const sequenciaData = {
          tituloTemaAssunto: activity.personalizedTitle || activity.title,
          disciplina: activityData.subject || 'Não especificada',
          anoSerie: activityData.schoolYear || '6º Ano',
          objetivosAprendizagem: activity.personalizedDescription || activity.description,
          publicoAlvo: `Estudantes do ${activityData.schoolYear || '6º Ano'}`,
          bnccCompetencias: 'Competências específicas da disciplina',
          quantidadeAulas: '4',
          quantidadeDiagnosticos: '2',
          quantidadeAvaliacoes: '2'
        };

        // Construir a sequência didática
        const sequenciaCompleta = await SequenciaDidaticaBuilder.buildSequenciaDidatica(sequenciaData);
        
        console.log('✅ Sequência Didática construída:', sequenciaCompleta);
        
      } else {
        // Lógica para outras atividades
        await fillActivityModalFields(activity.id, activityData);
      }

      // Marcar como construída
      markActivityAsBuilt(activity.id);

      completedActividades++;
      console.log(`✅ Atividade construída: ${activity.title}`);

      // Adicionar à lista de atividades construídas
      let constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '[]');
      if (!constructedActivities.includes(activity.id)) {
        constructedActivities.push(activity.id);
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      }

    } catch (error) {
      const errorMessage = `Erro ao construir atividade "${activity.title}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error('❌', errorMessage);
      errors.push(errorMessage);
      completedActivities++; // Incrementa mesmo com erro para manter o progresso
    }
  }

  // Progresso final
  updateProgress('Finalizando...');

  const success = errors.length === 0;
  console.log(success ? '🎉 Todas as atividades foram construídas com sucesso!' : '⚠️ Algumas atividades falharam na construção');

  return success;
};

// Função para marcar atividade como construída (adicionar badge visual)
const markActivityAsBuilt = (activityId: string) => {
  // Dispara evento personalizado para atualizar UI
  const event = new CustomEvent('activityBuilt', { 
    detail: { activityId } 
  });
  window.dispatchEvent(event);
};
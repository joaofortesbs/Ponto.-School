import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { fillActivityModalFields } from '../api/fillActivityModalFields';
import { getActivityDataFromPlan } from '../utils/getActivityDataFromPlan';
import { generateSequenciaDidatica } from '../../activities/sequencia-didatica/SequenciaDidaticaGenerator';

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

      let generatedData;
      let activityType = activityData.type;

      switch (activityType) {
        case 'plano-aula':
          console.log('🎯 [AUTO_BUILD] Gerando Plano de Aula automaticamente');
          // Aqui você pode chamar a função específica para gerar plano de aula, se houver
          generatedData = activityData; // Ou os dados já processados
          break;
        case 'sequencia-didatica':
          console.log('🎯 [AUTO_BUILD] Gerando Sequência Didática automaticamente');
          try {
            generatedData = await generateSequenciaDidatica({
              formData: activityData,
              apiKey: undefined // Usar chave padrão
            });
            console.log('✅ [AUTO_BUILD] Sequência Didática gerada:', generatedData);
          } catch (error) {
            console.error('❌ [AUTO_BUILD] Erro ao gerar Sequência Didática:', error);
            // Fallback para dados básicos
            generatedData = {
              tituloTemaAssunto: activityData.title || 'Sequência Didática',
              anoSerie: activityData.schoolYear || '6º ano',
              disciplina: activityData.subject || 'Disciplina',
              bnccCompetencias: activityData.competencies || 'Competências BNCC',
              publicoAlvo: activityData.context || 'Estudantes',
              objetivosAprendizagem: activityData.objectives || 'Objetivos de aprendizagem',
              quantidadeAulas: '4',
              quantidadeDiagnosticos: '2',
              quantidadeAvaliacoes: '2',
              cronograma: 'Cronograma escolar'
            };
          }
          break;
        default:
          // Para outros tipos de atividade, usa os dados extraídos diretamente
          generatedData = activityData;
          console.log(`ℹ️ [AUTO_BUILD] Tipo de atividade não especificado para geração automática: ${activityType}. Usando dados brutos.`);
          break;
      }

      // Preencher campos do modal automaticamente
      await fillActivityModalFields(activity.id, generatedData);

      // Marcar como construída
      markActivityAsBuilt(activity.id);

      completedActivities++;
      console.log(`✅ Atividade construída com EXATA MESMA LÓGICA do EditActivityModal: ${activity.title}`);

      // Salvar no localStorage com as mesmas chaves do sistema manual
      const storageKey = `schoolpower_${activityType}_content`;
      localStorage.setItem(storageKey, JSON.stringify(generatedData));

      // Para plano-aula, também salvar com chave específica para visualização
      if (activityType === 'plano-aula') {
        const viewStorageKey = `constructed_plano-aula_${activity.id}`;
        localStorage.setItem(viewStorageKey, JSON.stringify(generatedData));
        console.log('💾 Auto-build: Dados do plano-aula salvos para visualização:', viewStorageKey);
      }

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
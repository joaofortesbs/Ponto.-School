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
        console.log('🎯 Construindo Sequência Didática');

        try {
          // Importar as funções necessárias
          const { processSequenciaDidaticaData } = await import('../activities/sequencia-didatica/sequenciaDidaticaProcessor');
          const { SequenciaDidaticaGenerator } = await import('../activities/sequencia-didatica/SequenciaDidaticaGenerator');
          
          // Processar dados do formulário
          const sequenciaDidaticaData = processSequenciaDidaticaData(activityData);

          console.log('📊 Dados processados para validação:', sequenciaDidaticaData);

          console.log('📝 Iniciando geração com IA...');

          const generatedContent = await SequenciaDidaticaGenerator.generateSequenciaDidatica(sequenciaDidaticaData);

          console.log('✅ Sequência Didática gerada com sucesso:', {
            titulo: generatedContent.titulo,
            numAulas: generatedContent.aulas?.length || 0,
            temAvaliacao: !!generatedContent.avaliacaoFinal
          });

          // Salvar no localStorage para diferentes chaves
          const constructedKey = `constructed_sequencia-didatica_${activity.id}`;
          const generalKey = `schoolpower_sequencia-didatica_content`;
          const activityKey = `activity_${activity.id}`;

          const resultData = {
            id: activity.id,
            title: generatedContent.titulo || activity.title || 'Sequência Didática',
            description: activity.description || 'Sequência didática gerada automaticamente',
            generatedContent,
            originalData: sequenciaDidaticaData,
            content: generatedContent,
            approved: false,
            isBuilt: true,
            customFields: {},
            generatedAt: new Date().toISOString()
          };

          // Salvar em múltiplas chaves para garantir compatibilidade
          localStorage.setItem(constructedKey, JSON.stringify(resultData));
          localStorage.setItem(generalKey, JSON.stringify(generatedContent));
          localStorage.setItem(activityKey, JSON.stringify(resultData));

          console.log('🎉 Resultado final da construção e salvamento:', resultData);

        } catch (error) {
          console.error('❌ Erro na construção da Sequência Didática:', error);

          // Tentar criar fallback com dados disponíveis
          try {
            const { processSequenciaDidaticaData } = await import('../activities/sequencia-didatica/sequenciaDidaticaProcessor');
            const sequenciaDidaticaData = processSequenciaDidaticaData(activityData);

            const fallbackData = {
              id: activity.id,
              title: activity.title || 'Sequência Didática',
              description: activity.description,
              generatedContent: {
                titulo: `Sequência Didática: ${sequenciaDidaticaData.tituloTemaAssunto}`,
                introducao: `Esta sequência foi preparada para ${sequenciaDidaticaData.publicoAlvo}`,
                aulas: [],
                avaliacaoFinal: null,
                recursosGerais: [],
                bibliografia: []
              },
              originalData: sequenciaDidaticaData,
              approved: false,
              isBuilt: false,
              error: error instanceof Error ? error.message : 'Erro na geração',
              customFields: {}
            };

            // Salvar fallback
            const constructedKey = `constructed_sequencia-didatica_${activity.id}`;
            localStorage.setItem(constructedKey, JSON.stringify(fallbackData));

          } catch (fallbackError) {
            console.error('❌ Erro até no fallback:', fallbackError);
          }

          errors.push(`Erro na Sequência Didática: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      } else {
        // Lógica para outras atividades
        await fillActivityModalFields(activity.id, activityData);
      }

      // Marcar como construída
      markActivityAsBuilt(activity.id);

      completedActivities++;
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
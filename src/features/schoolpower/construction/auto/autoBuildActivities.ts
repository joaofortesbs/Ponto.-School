import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { fillActivityModalFields } from '../api/fillActivityModalFields';
import { getActivityDataFromPlan } from '../utils/getActivityDataFromPlan';
import { SequenciaDidaticaBuilder } from '../../activities/sequencia-didatica/SequenciaDidaticaBuilder';
import { processSequenciaDidaticaData } from '../../activities/sequencia-didatica/sequenciaDidaticaProcessor';

export interface AutoBuildProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
}

export type AutoBuildCallback = (progress: AutoBuildProgress) => void;

// Função auxiliar para construir atividades por tipo
async function buildActivityByType(activity: any): Promise<any> {
  console.log(`🔧 [BUILD_BY_TYPE] Construindo atividade tipo: ${activity.id}`);

  // Implementar lógica para outros tipos de atividade conforme necessário
  switch (activity.id) {
    case 'lista-exercicios':
      // Implementar construção de lista de exercícios
      console.log('📝 [BUILD_BY_TYPE] Lista de exercícios em desenvolvimento');
      return null;

    case 'plano-aula':
      // Implementar construção de plano de aula
      console.log('📋 [BUILD_BY_TYPE] Plano de aula em desenvolvimento');
      return null;

    default:
      console.log(`⚠️ [BUILD_BY_TYPE] Tipo de atividade não suportado: ${activity.id}`);
      return null;
  }
}


export const autoBuildActivities = async (
  planData: ActionPlanItem[],
  onProgress?: AutoBuildCallback
): Promise<boolean> => {
  console.log('🤖 Iniciando construção automática de atividades:', planData);

  const totalActivities = planData.length;
  let completedActivities = 0;
  const errors: string[] = [];
  const builtActivities: any[] = []; // Array para armazenar atividades construídas para retorno

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

      let builtActivity = null;

      // Lógica específica para Sequência Didática
      if (activity.id === 'sequencia-didatica') {
        console.log('📚 [AUTO_BUILD] Detectada Sequência Didática - iniciando construção especializada');

        // Preparar dados do formulário a partir da atividade aprovada
        const formData = {
          title: activity.title || 'Sequência Didática',
          description: activity.description || '',
          tituloTemaAssunto: activity.customFields?.['Título do Tema / Assunto'] || activity.title || 'Sequência Didática',
          disciplina: activity.customFields?.['Disciplina'] || activity.customFields?.disciplina || 'Educação Geral',
          anoSerie: activity.customFields?.['Ano / Série'] || activity.customFields?.anoSerie || '6º Ano',
          bnccCompetencias: activity.customFields?.['BNCC / Competências'] || activity.customFields?.bnccCompetencias || 'Competências gerais da BNCC',
          publicoAlvo: activity.customFields?.['Público-alvo'] || activity.customFields?.publicoAlvo || 'Estudantes do Ensino Fundamental',
          objetivosAprendizagem: activity.customFields?.['Objetivos de Aprendizagem'] || activity.customFields?.objetivosAprendizagem || 'Desenvolver competências educacionais',
          quantidadeAulas: activity.customFields?.['Quantidade de Aulas'] || activity.customFields?.quantidadeAulas || '4',
          quantidadeDiagnosticos: activity.customFields?.['Quantidade de Diagnósticos'] || activity.customFields?.quantidadeDiagnosticos || '1',
          quantidadeAvaliacoes: activity.customFields?.['Quantidade de Avaliações'] || activity.customFields?.quantidadeAvaliacoes || '2',
          cronograma: activity.customFields?.['Cronograma'] || activity.customFields?.cronograma || 'Cronograma flexível'
        };

        console.log('📝 [AUTO_BUILD] Dados preparados para Sequência Didática:', formData);

        // Validar dados antes de construir
        const processedData = processSequenciaDidaticaData(formData);

        if (!processedData.isComplete) {
          console.error('❌ [AUTO_BUILD] Dados incompletos para Sequência Didática:', processedData.validationErrors);
          throw new Error(`Dados incompletos: ${processedData.validationErrors.join(', ')}`);
        }

        console.log('✅ [AUTO_BUILD] Dados validados, iniciando construção...');

        // Construir usando o SequenciaDidaticaBuilder
        const builder = SequenciaDidaticaBuilder.getInstance();
        builtActivity = await builder.buildSequenciaDidatica(formData);

        console.log('🎯 [AUTO_BUILD] Sequência Didática construída:', builtActivity);

      } else {
        // Lógica para outros tipos de atividade utilizando a função auxiliar
        builtActivity = await buildActivityByType(activity);
      }

      if (builtActivity) {
        // Preencher campos do modal automaticamente (se aplicável e necessário para o fluxo)
        // await fillActivityModalFields(activity.id, activityData); // Considerar se este passo é necessário aqui ou se o builder já cuida disso

        // Marcar como construída (adicionar badge visual)
        markActivityAsBuilt(activity.id);

        completedActivities++;
        console.log(`✅ Atividade construída com EXATA MESMA LÓGICA do EditActivityModal: ${activity.title}`);

        // Salvar no localStorage com as mesmas chaves do sistema manual
        // Nota: A chave de armazenamento precisa ser mais específica, talvez incluindo o ID da atividade
        const storageKey = `schoolpower_${activity.id}_content`; // Adaptação para incluir ID
        localStorage.setItem(storageKey, JSON.stringify(builtActivity)); // Usando builtActivity que contém os dados gerados

        // Para plano-aula, também salvar com chave específica para visualização
        // Se `activity.id` puder ser `plano-aula` e também ter um `activity.id` único, ajustar lógica.
        // Assumindo que 'plano-aula' pode ser um tipo e `activity.id` é o identificador único.
        if (activity.id === 'plano-aula') { // Ajuste para usar o tipo correto
          const viewStorageKey = `constructed_plano-aula_${activity.id}`;
          localStorage.setItem(viewStorageKey, JSON.stringify(builtActivity));
          console.log('💾 Auto-build: Dados do plano-aula salvos para visualização:', viewStorageKey);
        }

        // Adicionar à lista de atividades construídas
        let constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '[]');
        if (!constructedActivities.includes(activity.id)) {
          constructedActivities.push(activity.id);
          localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
        }
        builtActivities.push({ // Adicionar ao array de retorno
          activityId: activity.id,
          activityType: activity.id === 'sequencia-didatica' ? 'sequencia-didatica' : 'other', // Ajustar tipo se necessário
          title: activity.title,
          isBuilt: true,
          buildTimestamp: new Date().toISOString(),
          data: builtActivity,
          originalActivity: activity
        });
      } else {
        console.warn(`⚠️ [AUTO_BUILD] Nenhuma atividade construída para: ${activity.id}`);
        // Se buildActivityByType retornar null, podemos considerar como um erro ou apenas pular
        // Por enquanto, apenas logamos um aviso.
      }

    } catch (error) {
      const errorMessage = `Erro ao construir atividade "${activity.title}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error('❌', errorMessage);
      errors.push(errorMessage);
      // Incrementa `completedActivities` mesmo com erro para que o progresso não fique travado
      // e a barra de progresso avance. Considerar se este é o comportamento desejado.
      completedActivities++;
      console.error(`🔍 [AUTO_BUILD] Stack trace:`, error.stack);
      console.error(`📊 [AUTO_BUILD] Dados da atividade com erro:`, activity);
    }
  }

  // Progresso final
  updateProgress('Finalizando...');

  const success = errors.length === 0;
  console.log(success ? '🎉 Todas as atividades foram construídas com sucesso!' : `⚠️ Algumas atividades falharam na construção. Total de erros: ${errors.length}`);

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
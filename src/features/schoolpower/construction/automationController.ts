import { getFieldMap, modalBinderEngine } from './modalBinder';
import { fillActivityModalFields } from './api/fillActivityModalFields';
import { ActivityFormData } from './types/ActivityTypes';
import { getActivityDataFromPlan } from './utils/getActivityDataFromPlan';
import { generateActivity } from './api/generateActivity';
import { waitForElement } from './utils/waitForElement';
import ConstructionSync from './utils/constructionSync';

export async function buildActivities(approvedActivities: any[], contextData: any): Promise<boolean> {
  console.log('🏗️ Iniciando construção automática de atividades:', approvedActivities);

  if (!approvedActivities || approvedActivities.length === 0) {
    console.warn('⚠️ Nenhuma atividade aprovada fornecida');
    return false;
  }

  let successCount = 0;

  for (let i = 0; i < approvedActivities.length; i++) {
    const activity = approvedActivities[i];
    console.log(`🎯 Processando atividade ${i + 1}/${approvedActivities.length}:`, activity);

    try {
      // Preparar dados da atividade para preenchimento
      const activityData = {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        personalizedTitle: activity.personalizedTitle || activity.title,
        personalizedDescription: activity.personalizedDescription || activity.description,
        type: activity.type,

        // Dados de contexto
        ...contextData,

        // Campos customizados se existirem
        ...(activity.customFields || {}),

        // Campos padrão baseados no contexto
        disciplina: contextData?.materias || 'Não especificado',
        tema: activity.personalizedTitle || activity.title,
        anoEscolaridade: contextData?.publicoAlvo || 'Não especificado',
        numeroQuestoes: '10',
        nivelDificuldade: 'Médio',
        modeloQuestoes: 'Múltipla Escolha, Dissertativa, Mista',
        fontes: 'Digite as fontes de referência...',
        tempoLimite: 'Ex: 50 minutos, 1 hora...',
        contextoAplicacao: contextData?.observacoes || 'Ex: Produção textual, Sala de aula...'
      };

      console.log('📊 Dados preparados para atividade:', activityData);

      // Usar o ModalBinderEngine para preencher automaticamente
      const success = await modalBinderEngine(activity.id, activityData);

      if (success) {
        successCount++;
        console.log(`✅ Atividade ${activity.title} processada com sucesso`);
      } else {
        console.warn(`⚠️ Falha ao processar atividade ${activity.title}`);
      }

      // Aguardar entre processamentos para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Erro ao processar atividade ${activity.title}:`, error);
    }
  }

  const successRate = successCount / approvedActivities.length;
  console.log(`📈 Resultado final: ${successCount}/${approvedActivities.length} atividades processadas (${Math.round(successRate * 100)}%)`);

  return successRate >= 0.5; // Considerar sucesso se pelo menos 50% das atividades foram processadas
}

interface ActivityData {
  id: string;
  type: string;
  title: string;
  description: string;
  [key: string]: any;
}

interface AutomationResult {
  activityId: string;
  activityTitle: string;
  success: boolean;
  error?: string;
  generatedContent?: string;
}

export default class AutomationController {
  private static instance: AutomationController;
  private isRunning = false;

  static getInstance(): AutomationController {
    if (!AutomationController.instance) {
      AutomationController.instance = new AutomationController();
    }
    return AutomationController.instance;
  }

  async autoBuildMultipleActivities(activities: any[]): Promise<AutomationResult[]> {
    if (this.isRunning) {
      console.warn('⚠️ Automação já está em execução');
      return [];
    }

    this.isRunning = true;
    const results: AutomationResult[] = [];
    const sync = ConstructionSync.getInstance();

    console.log(`🤖 Iniciando construção automática de ${activities.length} atividades...`);

    // Notificar início da construção
    sync.notifyConstructionStarted(activities.map(a => ({ id: a.id, title: a.title })));

    try {
      // Processar todas as atividades em paralelo (com limite de concorrência)
      const batchSize = 2; // Processar 2 atividades por vez
      for (let i = 0; i < activities.length; i += batchSize) {
        const batch = activities.slice(i, i + batchSize);

        const batchPromises = batch.map(async (activity) => {
          console.log(`🔄 Processando atividade: ${activity.title}`);

          try {
            const result = await this.buildSingleActivity(activity);
            const activityResult = {
              activityId: activity.id,
              activityTitle: activity.title,
              success: result.success,
              error: result.error,
              generatedContent: result.generatedContent
            };

            // Notificar construção individual
            sync.notifyActivityBuilt(
              activity.id, 
              activity.title, 
              result.success, 
              result.generatedContent, 
              result.error
            );

            return activityResult;
          } catch (error) {
            console.error(`❌ Erro ao construir atividade ${activity.title}:`, error);
            const activityResult = {
              activityId: activity.id,
              activityTitle: activity.title,
              success: false,
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            };

            // Notificar erro na construção
            sync.notifyActivityBuilt(
              activity.id, 
              activity.title, 
              false, 
              undefined, 
              activityResult.error
            );

            return activityResult;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Aguardar entre batches
        if (i + batchSize < activities.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      this.isRunning = false;
    }

    console.log('🎯 Construção automática finalizada:', results);

    // Notificar conclusão do lote
    sync.notifyBatchCompleted(results.map(r => ({
      activityId: r.activityId,
      activityTitle: r.activityTitle,
      success: r.success,
      content: r.generatedContent,
      error: r.error
    })));

    // Disparar evento personalizado para compatibilidade
    window.dispatchEvent(new CustomEvent('activitiesAutoBuilt', {
      detail: { results }
    }));

    return results;
  }

  private async buildSingleActivity(activity: any): Promise<{ success: boolean; error?: string; generatedContent?: string }> {
    try {
      console.log(`🏗️ Construindo atividade: ${activity.title}`);

      // Verificar se a atividade já foi construída
      if (this.isActivityBuilt(activity.id)) {
        console.log(`✅ Atividade ${activity.title} já foi construída anteriormente`);
        return { 
          success: true, 
          generatedContent: this.getGeneratedContent(activity.id) || undefined 
        };
      }

      // Obter dados da atividade do plano aprovado
      const activityData = getActivityDataFromPlan(activity);
      console.log('📊 Dados da atividade obtidos:', activityData);

      // Preencher campos do formulário com base nos dados do plano
      const formData = await fillActivityModalFields(activity.id, activityData);
      console.log('📝 Campos preenchidos:', formData);

      // Validar se os campos obrigatórios estão preenchidos
      if (!this.validateFormData(formData, activity.id)) {
        throw new Error('Dados insuficientes para gerar a atividade');
      }

      // Gerar atividade usando a API apropriada
      const generatedContent = await generateActivity(activity.id, formData);

      if (!generatedContent) {
        throw new Error('Falha na geração do conteúdo da atividade');
      }

      console.log('✅ Conteúdo gerado com sucesso para:', activity.title);

      // Salvar no localStorage para persistência e sincronização
      const storageKey = `generated_activity_${activity.id}`;
      const storageData = {
        content: generatedContent,
        timestamp: Date.now(),
        activityId: activity.id,
        activityTitle: activity.title,
        formData,
        originalActivity: activity,
        autoGenerated: true
      };

      localStorage.setItem(storageKey, JSON.stringify(storageData));

      // Salvar também uma versão para o hook useGenerateActivity
      const hookStorageKey = `activity_content_${activity.id}`;
      localStorage.setItem(hookStorageKey, generatedContent);

      // Marcar como construída
      this.markActivityAsBuilt(activity.id, generatedContent);

      return { 
        success: true, 
        generatedContent 
      };

    } catch (error) {
      console.error(`❌ Erro na construção da atividade ${activity.title}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  private validateFormData(formData: ActivityFormData, activityId: string): boolean {
    // Validação básica - campos obrigatórios
    if (!formData.title?.trim() || !formData.description?.trim()) {
      return false;
    }

    // Validação específica para lista de exercícios
    if (activityId === 'lista-exercicios') {
      return !!(
        formData.subject?.trim() &&
        formData.theme?.trim() &&
        formData.schoolYear?.trim() &&
        formData.numberOfQuestions?.trim() &&
        formData.difficultyLevel?.trim()
      );
    }

    return true;
  }

  private markActivityAsBuilt(activityId: string, content: string): void {
    const builtKey = `activity_built_${activityId}`;
    localStorage.setItem(builtKey, JSON.stringify({
      built: true,
      timestamp: Date.now(),
      hasContent: !!content
    }));
  }

  // Método para verificar se uma atividade já foi construída
  public isActivityBuilt(activityId: string): boolean {
    const storageKey = `generated_activity_${activityId}`;
    const builtKey = `activity_built_${activityId}`;

    const stored = localStorage.getItem(storageKey);
    const built = localStorage.getItem(builtKey);

    return !!(stored || built);
  }

  // Método para obter conteúdo gerado de uma atividade
  public getGeneratedContent(activityId: string): string | null {
    // Tentar primeira opção
    const storageKey = `generated_activity_${activityId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.content || null;
      } catch (error) {
        console.error('Erro ao recuperar conteúdo gerado:', error);
      }
    }

    // Tentar segunda opção (hook storage)
    const hookStorageKey = `activity_content_${activityId}`;
    const hookStored = localStorage.getItem(hookStorageKey);

    return hookStored || null;
  }

  // Método para limpar dados de construção
  public clearActivityData(activityId: string): void {
    const keys = [
      `generated_activity_${activityId}`,
      `activity_content_${activityId}`,
      `activity_built_${activityId}`
    ];

    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Método para obter estatísticas de construção
  public getConstructionStats(activities: any[]): { built: number; total: number; percentage: number } {
    const total = activities.length;
    const built = activities.filter(activity => this.isActivityBuilt(activity.id)).length;
    const percentage = total > 0 ? Math.round((built / total) * 100) : 0;

    return { built, total, percentage };
  }
}
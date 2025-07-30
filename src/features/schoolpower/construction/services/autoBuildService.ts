import { ActionPlanItem } from '../CardDeConstrucao';
import { activityGenerationService } from './activityGenerationService';
import { generateExerciseList, generateExam, generateGuidedReview, generateEducationalGames, generateDidacticSequence } from '../generationStrategies/generateActivityByType';

interface BuildResult {
  success: boolean;
  message: string;
  activityId: string;
  content?: any;
}

export class AutoBuildService {
  async buildActivity(activity: ActionPlanItem): Promise<BuildResult> {
    try {
      console.log('🔨 Iniciando construção automática da atividade:', activity);

      if (!activity.type) {
        console.error('❌ Tipo de atividade não definido:', activity);
        return {
          success: false,
          message: 'Tipo de atividade não definido',
          activityId: activity.id
        };
      }

      // Preparar dados para geração
      const formData = {
        title: activity.title,
        description: activity.description,
        type: activity.type,
        customFields: activity.customFields || {}
      };

      let generatedContent: any;

      // Gerar conteúdo baseado no tipo
      switch (activity.type) {
        case 'lista-exercicios':
          console.log('📝 Gerando Lista de Exercícios...');
          generatedContent = generateExerciseList(formData);
          break;

        case 'prova':
          console.log('📋 Gerando Prova...');
          generatedContent = generateExam(formData);
          break;

        case 'revisao-guiada':
          console.log('📚 Gerando Revisão Guiada...');
          generatedContent = generateGuidedReview(formData);
          break;

        case 'jogos-educativos':
          console.log('🎮 Gerando Jogo Educativo...');
          generatedContent = generateEducationalGames(formData);
          break;

        case 'sequencia-didatica':
          console.log('📖 Gerando Sequência Didática...');
          generatedContent = generateDidacticSequence(formData);
          break;

        default:
          console.log('📄 Gerando atividade padrão...');
          generatedContent = activityGenerationService.generateActivityContent(activity.type, formData);
      }

      if (!generatedContent) {
        console.error('❌ Falha na geração de conteúdo para:', activity.type);
        return {
          success: false,
          message: 'Falha na geração de conteúdo',
          activityId: activity.id
        };
      }

      console.log('✅ Conteúdo gerado com sucesso:', {
        type: activity.type,
        contentType: typeof generatedContent,
        hasQuestions: generatedContent.questions ? generatedContent.questions.length : 'N/A'
      });

      // Armazenar o conteúdo gerado
      const activityKey = `activity_${activity.id}`;
      localStorage.setItem(activityKey, JSON.stringify(generatedContent));

      return {
        success: true,
        message: 'Atividade construída com sucesso',
        activityId: activity.id,
        content: generatedContent
      };

    } catch (error) {
      console.error('❌ Erro na construção automática:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        activityId: activity.id
      };
    }
  }

  async buildAllActivities(activities: ActionPlanItem[]): Promise<BuildResult[]> {
    console.log('🚀 Iniciando construção automática de todas as atividades:', activities.length);

    const results: BuildResult[] = [];

    for (const activity of activities) {
      if (activity.approved && !activity.isBuilt) {
        const result = await this.buildActivity(activity);
        results.push(result);

        // Simular delay para melhor UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Construção automática concluída: ${successCount}/${results.length} atividades construídas`);

    return results;
  }

  getActivityContent(activityId: string): any {
    try {
      const activityKey = `activity_${activityId}`;
      const storedContent = localStorage.getItem(activityKey);

      if (storedContent) {
        const content = JSON.parse(storedContent);
        console.log('📖 Conteúdo recuperado para atividade:', activityId, content);
        return content;
      }

      console.warn('⚠️ Nenhum conteúdo encontrado para atividade:', activityId);
      return null;
    } catch (error) {
      console.error('❌ Erro ao recuperar conteúdo da atividade:', error);
      return null;
    }
  }

  clearActivityContent(activityId: string): void {
    try {
      const activityKey = `activity_${activityId}`;
      localStorage.removeItem(activityKey);
      console.log('🗑️ Conteúdo limpo para atividade:', activityId);
    } catch (error) {
      console.error('❌ Erro ao limpar conteúdo da atividade:', error);
    }
  }
}

export const autoBuildService = new AutoBuildService();
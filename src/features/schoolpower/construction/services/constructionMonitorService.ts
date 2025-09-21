
import { activitiesService } from '@/services/activitiesService';

class ConstructionMonitorService {
  private static instance: ConstructionMonitorService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  static getInstance(): ConstructionMonitorService {
    if (!ConstructionMonitorService.instance) {
      ConstructionMonitorService.instance = new ConstructionMonitorService();
    }
    return ConstructionMonitorService.instance;
  }

  /**
   * Iniciar monitoramento de atividades construídas
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    console.log('🔍 [MONITOR] Iniciando monitoramento de atividades construídas');
    this.isMonitoring = true;

    // Verificar imediatamente
    this.checkAndSaveConstructedActivities();

    // Verificar a cada 30 segundos
    this.monitoringInterval = setInterval(() => {
      this.checkAndSaveConstructedActivities();
    }, 30000);
  }

  /**
   * Parar monitoramento
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 [MONITOR] Monitoramento interrompido');
  }

  /**
   * Verificar e salvar atividades construídas que ainda não foram salvas
   */
  private async checkAndSaveConstructedActivities(): Promise<void> {
    try {
      console.log('🔍 [MONITOR] Verificando atividades construídas...');

      // Obter todas as atividades construídas
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const keys = Object.keys(localStorage);
      
      // Buscar atividades construídas por diferentes padrões
      const activityKeys = keys.filter(key => 
        key.startsWith('activity_') || 
        key.startsWith('constructed_') ||
        key.startsWith('auto_activity_data_')
      );

      console.log(`🔍 [MONITOR] Encontradas ${activityKeys.length} chaves de atividades`);

      for (const key of activityKeys) {
        try {
          let activityId = '';
          
          if (key.startsWith('activity_')) {
            activityId = key.replace('activity_', '');
          } else if (key.startsWith('constructed_')) {
            activityId = key.replace('constructed_', '').replace('quadro-interativo_', '');
          } else if (key.startsWith('auto_activity_data_')) {
            activityId = key.replace('auto_activity_data_', '');
          }

          if (!activityId) continue;

          // Verificar se já foi salva no Neon
          const savedChecks = [
            `neon_saved_${activityId}`,
            `neon_auto_saved_${activityId}`,
            `neon_grid_saved_${activityId}`,
            `neon_hook_saved_${activityId}`
          ];

          const alreadySaved = savedChecks.some(checkKey => 
            localStorage.getItem(checkKey) !== null
          );

          if (alreadySaved) {
            console.log(`ℹ️ [MONITOR] Atividade ${activityId} já salva`);
            continue;
          }

          // Verificar se tem dados válidos para salvar
          const activityData = localStorage.getItem(key);
          if (!activityData) continue;

          console.log(`🔄 [MONITOR] Processando atividade não salva: ${activityId}`);
          await this.saveActivityToNeon(activityId, key, activityData);

        } catch (error) {
          console.error(`❌ [MONITOR] Erro ao processar chave ${key}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ [MONITOR] Erro no monitoramento:', error);
    }
  }

  /**
   * Salvar atividade específica no Neon
   */
  private async saveActivityToNeon(activityId: string, storageKey: string, activityData: string): Promise<void> {
    try {
      const userId = localStorage.getItem('user_id') || 
                     localStorage.getItem('current_user_id') || 
                     localStorage.getItem('neon_user_id') ||
                     'anonymous';

      // Tentar fazer parse dos dados
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(activityData);
      } catch (e) {
        console.warn(`⚠️ [MONITOR] Erro ao fazer parse dos dados de ${activityId}`);
        return;
      }

      // Extrair informações da atividade
      const title = parsedData.title || 
                   parsedData.formData?.title || 
                   parsedData.activity?.title ||
                   `Atividade ${activityId}`;

      const type = parsedData.type || 
                  parsedData.activityType ||
                  activityId;

      const activityCode = `sp-monitor-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      // Preparar dados para salvar
      const saveData = {
        user_id: userId,
        activity_code: activityCode,
        type: type,
        title: title,
        content: {
          originalData: parsedData.originalData || parsedData.customFields || {},
          formData: parsedData.formData || {},
          generatedContent: parsedData.generatedContent || parsedData,
          constructionData: parsedData.constructionData || {},
          schoolPowerMetadata: {
            constructedAt: parsedData.generatedAt || parsedData.builtAt || new Date().toISOString(),
            autoSaved: true,
            activityId: activityId,
            isBuilt: true,
            source: 'construction_monitor',
            storageKey: storageKey,
            saveAttempt: new Date().toISOString()
          }
        }
      };

      console.log(`💾 [MONITOR] Salvando atividade monitorada: ${title}`);

      const result = await activitiesService.saveActivity(saveData);

      if (result && result.success) {
        console.log(`✅ [MONITOR] Atividade salva: ${activityCode}`);

        // Marcar como salva
        localStorage.setItem(`neon_monitor_saved_${activityId}`, JSON.stringify({
          activityCode,
          savedAt: new Date().toISOString(),
          title: title,
          type: type,
          neonSaved: true,
          userId: userId,
          source: 'monitor'
        }));

        // Atualizar lista global
        const savedActivities = JSON.parse(localStorage.getItem('school_power_saved_activities') || '[]');
        savedActivities.push({
          activityCode,
          savedAt: new Date().toISOString(),
          title: title,
          type: type,
          activityId: activityId,
          neonSaved: true,
          source: 'construction_monitor'
        });
        localStorage.setItem('school_power_saved_activities', JSON.stringify(savedActivities));

      } else {
        console.error(`❌ [MONITOR] Falha ao salvar: ${result?.error}`);
      }

    } catch (error) {
      console.error(`❌ [MONITOR] Erro ao salvar atividade ${activityId}:`, error);
    }
  }

  /**
   * Obter estatísticas do monitoramento
   */
  getStats(): any {
    const savedActivities = JSON.parse(localStorage.getItem('school_power_saved_activities') || '[]');
    const monitorSaved = savedActivities.filter((item: any) => item.source === 'construction_monitor');
    
    return {
      isMonitoring: this.isMonitoring,
      totalSaved: savedActivities.length,
      monitorSaved: monitorSaved.length
    };
  }
}

export const constructionMonitorService = ConstructionMonitorService.getInstance();
export default constructionMonitorService;

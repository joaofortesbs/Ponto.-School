
// Serviço de monitoramento automático para salvar atividades no banco Neon
// Detecta quando atividades são construídas e as salva automaticamente

import activitiesApi from '@/services/activitiesApiService';
import { profileService } from '@/services/profileService';

interface MonitoredActivity {
  id: string;
  timestamp: string;
  saved: boolean;
}

class AutoSaveMonitor {
  private static instance: AutoSaveMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;
  private lastCheck: string = '';
  private processedActivities: Set<string> = new Set();

  static getInstance(): AutoSaveMonitor {
    if (!AutoSaveMonitor.instance) {
      AutoSaveMonitor.instance = new AutoSaveMonitor();
    }
    return AutoSaveMonitor.instance;
  }

  // Iniciar monitoramento automático
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('🔍 [AUTO-SAVE-MONITOR] Monitoramento já está ativo');
      return;
    }

    console.log('🚀 [AUTO-SAVE-MONITOR] Iniciando monitoramento automático...');
    this.isMonitoring = true;
    this.lastCheck = new Date().toISOString();

    // Verificar a cada 5 segundos
    this.monitoringInterval = setInterval(() => {
      this.checkForNewActivities();
    }, 5000);

    // Verificar imediatamente
    this.checkForNewActivities();
  }

  // Parar monitoramento
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('⏹️ [AUTO-SAVE-MONITOR] Monitoramento parado');
  }

  // Verificar se há novas atividades construídas
  private async checkForNewActivities() {
    try {
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const currentCheck = new Date().toISOString();

      for (const [activityId, activityInfo] of Object.entries(constructedActivities)) {
        const info = activityInfo as any;
        
        // Verificar se é uma atividade nova construída
        if (info.isBuilt && info.builtAt > this.lastCheck && !this.processedActivities.has(activityId)) {
          console.log('🔍 [AUTO-SAVE-MONITOR] Nova atividade detectada:', activityId);
          
          // Verificar se já foi salva automaticamente
          const autoSaveInfo = localStorage.getItem(`auto_saved_${activityId}`);
          if (!autoSaveInfo) {
            console.log('💾 [AUTO-SAVE-MONITOR] Salvando atividade no banco:', activityId);
            await this.saveActivityToDatabase(activityId);
          } else {
            console.log('✅ [AUTO-SAVE-MONITOR] Atividade já salva anteriormente:', activityId);
          }
          
          this.processedActivities.add(activityId);
        }
      }

      this.lastCheck = currentCheck;

    } catch (error) {
      console.error('❌ [AUTO-SAVE-MONITOR] Erro durante verificação:', error);
    }
  }

  // Salvar atividade específica no banco de dados
  private async saveActivityToDatabase(activityId: string) {
    try {
      console.log('💾 [AUTO-SAVE-MONITOR] Iniciando salvamento para:', activityId);

      // 1. Obter perfil do usuário
      const profile = await profileService.getCurrentUserProfile();
      if (!profile || !profile.id) {
        console.error('❌ [AUTO-SAVE-MONITOR] Usuário não encontrado');
        return;
      }

      // 2. Obter dados da atividade do localStorage
      const activityData = localStorage.getItem(`activity_${activityId}`);
      if (!activityData) {
        console.warn('⚠️ [AUTO-SAVE-MONITOR] Dados da atividade não encontrados:', activityId);
        return;
      }

      const parsedData = JSON.parse(activityData);
      const codigoUnico = activitiesApi.generateUniqueCode();

      // 3. Preparar dados para a API
      const apiData = {
        user_id: profile.id,
        codigo_unico: codigoUnico,
        tipo: activityId,
        titulo: parsedData.title || parsedData.titulo || `Atividade ${activityId}`,
        descricao: parsedData.description || parsedData.descricao || 'Atividade criada automaticamente',
        conteudo: {
          ...parsedData,
          autoSaved: true,
          autoSavedAt: new Date().toISOString(),
          autoSaveSource: 'monitor-service',
          monitorDetected: true
        }
      };

      // 4. Salvar no banco
      const response = await activitiesApi.createActivity(apiData);

      if (response.success) {
        console.log('✅ [AUTO-SAVE-MONITOR] Atividade salva com sucesso:', {
          activityId,
          codigoUnico: response.data?.codigo_unico,
          titulo: response.data?.titulo
        });

        // Marcar como salva automaticamente
        localStorage.setItem(`auto_saved_${activityId}`, JSON.stringify({
          saved: true,
          savedAt: new Date().toISOString(),
          codigoUnico: response.data?.codigo_unico,
          databaseId: response.data?.id,
          source: 'monitor'
        }));

        // Disparar evento para notificar outras partes da aplicação
        window.dispatchEvent(new CustomEvent('activity-auto-saved', {
          detail: { 
            activityId, 
            databaseId: response.data?.id,
            codigoUnico: response.data?.codigo_unico 
          }
        }));

      } else {
        console.error('❌ [AUTO-SAVE-MONITOR] Falha ao salvar:', response.error);
      }

    } catch (error) {
      console.error('❌ [AUTO-SAVE-MONITOR] Erro ao salvar atividade:', error);
    }
  }

  // Forçar verificação manual
  async forceCheck() {
    console.log('🔍 [AUTO-SAVE-MONITOR] Verificação manual forçada');
    await this.checkForNewActivities();
  }

  // Obter status do monitoramento
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      lastCheck: this.lastCheck,
      processedCount: this.processedActivities.size
    };
  }

  // Limpar cache de atividades processadas
  clearCache() {
    this.processedActivities.clear();
    console.log('🧹 [AUTO-SAVE-MONITOR] Cache limpo');
  }
}

export const autoSaveMonitor = AutoSaveMonitor.getInstance();
export default autoSaveMonitor;

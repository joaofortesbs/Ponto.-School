
import { supabase } from '@/lib/supabase';

interface XPEvent {
  type: 'flow_session' | 'task_completion' | 'daily_login' | 'achievement' | 'study_session';
  points: number;
  description: string;
}

class ExperienceService {
  // Valores de XP para diferentes ações
  private static XP_VALUES = {
    flow_session: 10,          // 10 XP por sessão de flow
    task_completion: 5,        // 5 XP por tarefa concluída
    daily_login: 2,            // 2 XP por login diário
    achievement: 20,           // 20 XP por conquista
    study_session: 15,         // 15 XP por sessão de estudo
    challenge_completion: 30,  // 30 XP por desafio concluído
    streak_bonus: 5,           // 5 XP de bônus por streak
  };

  // XP necessário para cada nível (progressivo)
  private static getXPForLevel(level: number): number {
    return level * 100; // 100 XP para nível 1, 200 para nível 2, etc.
  }

  // Adicionar XP ao usuário
  static async addXP(userId: string, event: XPEvent): Promise<{ newLevel: number; leveledUp: boolean; totalXP: number }> {
    try {
      // Buscar perfil atual do usuário
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('experience_points, level')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar perfil:', fetchError);
        throw fetchError;
      }

      const currentXP = profile?.experience_points || 0;
      const currentLevel = profile?.level || 1;
      const newXP = currentXP + event.points;

      // Calcular novo nível
      let newLevel = currentLevel;
      let leveledUp = false;

      // Verificar se subiu de nível
      while (newXP >= this.getXPForLevel(newLevel)) {
        newLevel++;
        leveledUp = true;
      }

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          experience_points: newXP,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erro ao atualizar XP:', updateError);
        throw updateError;
      }

      // Registrar evento de XP
      await this.logXPEvent(userId, event, newXP);

      return {
        newLevel,
        leveledUp,
        totalXP: newXP
      };
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
      throw error;
    }
  }

  // Registrar evento de XP no histórico
  private static async logXPEvent(userId: string, event: XPEvent, totalXP: number): Promise<void> {
    try {
      await supabase
        .from('xp_events')
        .insert([
          {
            user_id: userId,
            event_type: event.type,
            points_earned: event.points,
            description: event.description,
            total_xp_after: totalXP,
            created_at: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Erro ao registrar evento de XP:', error);
    }
  }

  // Obter XP necessário para próximo nível
  static getXPForNextLevel(currentLevel: number): number {
    return this.getXPForLevel(currentLevel);
  }

  // Obter progresso atual em porcentagem
  static getProgressPercentage(currentXP: number, currentLevel: number): number {
    const xpForCurrentLevel = this.getXPForLevel(currentLevel);
    const previousLevelXP = currentLevel > 1 ? this.getXPForLevel(currentLevel - 1) : 0;
    const xpInCurrentLevel = currentXP - previousLevelXP;
    const xpNeededForLevel = xpForCurrentLevel - previousLevelXP;

    if (currentLevel === 1 && currentXP === 0) return 0;
    
    return xpNeededForLevel > 0 ? Math.min(Math.round((xpInCurrentLevel / xpNeededForLevel) * 100), 100) : 0;
  }

  // Métodos de conveniência para diferentes tipos de eventos
  static async awardFlowSessionXP(userId: string, duration: number): Promise<any> {
    const bonusPoints = Math.floor(duration / 300) * 2; // 2 XP bonus a cada 5 minutos
    return this.addXP(userId, {
      type: 'flow_session',
      points: this.XP_VALUES.flow_session + bonusPoints,
      description: `Sessão de Flow completada (${Math.floor(duration / 60)} min)`
    });
  }

  static async awardTaskCompletionXP(userId: string, taskTitle: string): Promise<any> {
    return this.addXP(userId, {
      type: 'task_completion',
      points: this.XP_VALUES.task_completion,
      description: `Tarefa concluída: ${taskTitle}`
    });
  }

  static async awardDailyLoginXP(userId: string): Promise<any> {
    return this.addXP(userId, {
      type: 'daily_login',
      points: this.XP_VALUES.daily_login,
      description: 'Login diário realizado'
    });
  }

  static async awardStudySessionXP(userId: string, subject: string): Promise<any> {
    return this.addXP(userId, {
      type: 'study_session',
      points: this.XP_VALUES.study_session,
      description: `Sessão de estudo: ${subject}`
    });
  }

  static async awardAchievementXP(userId: string, achievementName: string): Promise<any> {
    return this.addXP(userId, {
      type: 'achievement',
      points: this.XP_VALUES.achievement,
      description: `Conquista desbloqueada: ${achievementName}`
    });
  }
}

export default ExperienceService;

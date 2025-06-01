
import { useState, useCallback } from 'react';
import ExperienceService from '@/services/experienceService';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

interface UseExperienceReturn {
  isLoading: boolean;
  awardFlowSessionXP: (duration: number) => Promise<void>;
  awardTaskCompletionXP: (taskTitle: string) => Promise<void>;
  awardDailyLoginXP: () => Promise<void>;
  awardStudySessionXP: (subject: string) => Promise<void>;
  awardAchievementXP: (achievementName: string) => Promise<void>;
}

export const useExperience = (): UseExperienceReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const showLevelUpNotification = (newLevel: number, totalXP: number) => {
    toast({
      title: "🎉 Parabéns! Você subiu de nível!",
      description: `Você alcançou o nível ${newLevel} com ${totalXP} XP!`,
      duration: 5000,
    });
  };

  const showXPNotification = (points: number, description: string) => {
    toast({
      title: `+${points} XP`,
      description: description,
      duration: 3000,
    });
  };

  const awardFlowSessionXP = useCallback(async (duration: number) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await ExperienceService.awardFlowSessionXP(user.id, duration);
      
      if (result.leveledUp) {
        showLevelUpNotification(result.newLevel, result.totalXP);
      } else {
        const points = 10 + Math.floor(duration / 300) * 2;
        showXPNotification(points, `Sessão de Flow completada (${Math.floor(duration / 60)} min)`);
      }
    } catch (error) {
      console.error('Erro ao conceder XP de sessão de flow:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const awardTaskCompletionXP = useCallback(async (taskTitle: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await ExperienceService.awardTaskCompletionXP(user.id, taskTitle);
      
      if (result.leveledUp) {
        showLevelUpNotification(result.newLevel, result.totalXP);
      } else {
        showXPNotification(5, `Tarefa concluída: ${taskTitle}`);
      }
    } catch (error) {
      console.error('Erro ao conceder XP de conclusão de tarefa:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const awardDailyLoginXP = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await ExperienceService.awardDailyLoginXP(user.id);
      
      if (result.leveledUp) {
        showLevelUpNotification(result.newLevel, result.totalXP);
      } else {
        showXPNotification(2, 'Login diário realizado');
      }
    } catch (error) {
      console.error('Erro ao conceder XP de login diário:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const awardStudySessionXP = useCallback(async (subject: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await ExperienceService.awardStudySessionXP(user.id, subject);
      
      if (result.leveledUp) {
        showLevelUpNotification(result.newLevel, result.totalXP);
      } else {
        showXPNotification(15, `Sessão de estudo: ${subject}`);
      }
    } catch (error) {
      console.error('Erro ao conceder XP de sessão de estudo:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const awardAchievementXP = useCallback(async (achievementName: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await ExperienceService.awardAchievementXP(user.id, achievementName);
      
      if (result.leveledUp) {
        showLevelUpNotification(result.newLevel, result.totalXP);
      } else {
        showXPNotification(20, `Conquista desbloqueada: ${achievementName}`);
      }
    } catch (error) {
      console.error('Erro ao conceder XP de conquista:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    isLoading,
    awardFlowSessionXP,
    awardTaskCompletionXP,
    awardDailyLoginXP,
    awardStudySessionXP,
    awardAchievementXP,
  };
};

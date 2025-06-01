
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserExperience {
  totalXP: number;
  level: number;
  todayXP: number;
  weeklyXP: number;
  monthlyXP: number;
}

export function useExperience() {
  const [userExperience, setUserExperience] = useState<UserExperience>({
    totalXP: 0,
    level: 1,
    todayXP: 0,
    weeklyXP: 0,
    monthlyXP: 0,
  });

  const calculateLevel = (totalXP: number): number => {
    // Cada nível requer 1000 XP
    return Math.floor(totalXP / 1000) + 1;
  };

  const calculateProgress = (totalXP: number): number => {
    // Progresso dentro do nível atual
    const currentLevelXP = totalXP % 1000;
    return Math.round((currentLevelXP / 1000) * 100);
  };

  const addExperience = async (xpAmount: number, eventType: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Registrar evento de XP
      const { error: eventError } = await supabase
        .from('xp_events')
        .insert([
          {
            user_id: user.id,
            xp_amount: xpAmount,
            event_type: eventType,
            description: description || `Ganhou ${xpAmount} XP por ${eventType}`,
            created_at: new Date().toISOString()
          }
        ]);

      if (eventError) {
        console.error('Erro ao registrar evento de XP:', eventError);
        return;
      }

      // Atualizar XP total do usuário
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          experience_points: userExperience.totalXP + xpAmount,
          level: calculateLevel(userExperience.totalXP + xpAmount)
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Erro ao atualizar XP do perfil:', profileError);
        return;
      }

      // Atualizar estado local
      setUserExperience(prev => ({
        ...prev,
        totalXP: prev.totalXP + xpAmount,
        level: calculateLevel(prev.totalXP + xpAmount),
        todayXP: prev.todayXP + xpAmount,
        weeklyXP: prev.weeklyXP + xpAmount,
        monthlyXP: prev.monthlyXP + xpAmount,
      }));

    } catch (error) {
      console.error('Erro ao adicionar experiência:', error);
    }
  };

  const loadUserExperience = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar XP total do perfil
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('experience_points, level')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao carregar perfil:', profileError);
        return;
      }

      const totalXP = profile?.experience_points || 0;
      const level = profile?.level || 1;

      // Buscar XP de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayEvents, error: todayError } = await supabase
        .from('xp_events')
        .select('xp_amount')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      const todayXP = todayEvents?.reduce((sum, event) => sum + event.xp_amount, 0) || 0;

      // Buscar XP da semana
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: weekEvents, error: weekError } = await supabase
        .from('xp_events')
        .select('xp_amount')
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString());

      const weeklyXP = weekEvents?.reduce((sum, event) => sum + event.xp_amount, 0) || 0;

      // Buscar XP do mês
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: monthEvents, error: monthError } = await supabase
        .from('xp_events')
        .select('xp_amount')
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString());

      const monthlyXP = monthEvents?.reduce((sum, event) => sum + event.xp_amount, 0) || 0;

      setUserExperience({
        totalXP,
        level,
        todayXP,
        weeklyXP,
        monthlyXP,
      });

    } catch (error) {
      console.error('Erro ao carregar experiência do usuário:', error);
    }
  };

  useEffect(() => {
    loadUserExperience();
  }, []);

  return {
    userExperience,
    calculateLevel,
    calculateProgress,
    addExperience,
    loadUserExperience,
  };
}

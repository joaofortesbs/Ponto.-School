
import { supabase } from '@/lib/supabase';

export interface RegenerationData {
  user_id: string;
  date: string;
  regeneration_count: number;
  current_group: number;
  total_sps_spent: number;
}

export interface RegenerationCosts {
  [key: number]: number;
}

export class RegenerationService {
  // Custos de regeneração por nível
  static readonly REGENERATION_COSTS: RegenerationCosts = {
    0: 25,  // Primeira regeneração
    1: 50,  // Segunda regeneração
    2: 99,  // Terceira regeneração
  };

  // Máximo de regenerações por dia
  static readonly MAX_REGENERATIONS = 3;

  /**
   * Busca dados de regeneração do usuário para o dia atual
   */
  static async getUserRegenerationData(userId: string): Promise<RegenerationData | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_regenerations')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de regeneração:', error);
      return null;
    }
  }

  /**
   * Realiza uma regeneração de recompensas
   */
  static async performRegeneration(userId: string, currentSPs: number): Promise<{
    success: boolean;
    newRegenerationCount: number;
    newCurrentGroup: number;
    spsCost: number;
    remainingSPs: number;
    error?: string;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar dados atuais
      const currentData = await this.getUserRegenerationData(userId);
      const currentRegenCount = currentData?.regeneration_count || 0;
      const currentGroup = currentData?.current_group || 0;
      const totalSpent = currentData?.total_sps_spent || 0;

      // Verificar se pode regenerar
      if (currentRegenCount >= this.MAX_REGENERATIONS) {
        return {
          success: false,
          newRegenerationCount: currentRegenCount,
          newCurrentGroup: currentGroup,
          spsCost: 0,
          remainingSPs: currentSPs,
          error: 'Limite máximo de regenerações atingido para hoje'
        };
      }

      // Calcular custo
      const cost = this.REGENERATION_COSTS[currentRegenCount] || 0;
      
      if (currentSPs < cost) {
        return {
          success: false,
          newRegenerationCount: currentRegenCount,
          newCurrentGroup: currentGroup,
          spsCost: cost,
          remainingSPs: currentSPs,
          error: 'SPs insuficientes'
        };
      }

      // Novos valores
      const newRegenerationCount = currentRegenCount + 1;
      const newCurrentGroup = Math.min(currentGroup + 1, 3);
      const newTotalSpent = totalSpent + cost;
      const remainingSPs = currentSPs - cost;

      // Iniciar transação
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ school_points: remainingSPs })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Salvar dados de regeneração
      const { error: regenError } = await supabase
        .from('daily_regenerations')
        .upsert({
          user_id: userId,
          date: today,
          regeneration_count: newRegenerationCount,
          current_group: newCurrentGroup,
          total_sps_spent: newTotalSpent,
          updated_at: new Date().toISOString()
        });

      if (regenError) throw regenError;

      return {
        success: true,
        newRegenerationCount,
        newCurrentGroup,
        spsCost: cost,
        remainingSPs,
      };

    } catch (error) {
      console.error('Erro ao realizar regeneração:', error);
      return {
        success: false,
        newRegenerationCount: 0,
        newCurrentGroup: 0,
        spsCost: 0,
        remainingSPs: currentSPs,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Verifica se o usuário pode regenerar
   */
  static async canRegenerate(userId: string, currentSPs: number): Promise<{
    canRegenerate: boolean;
    cost: number;
    regenerationCount: number;
    reason?: string;
  }> {
    try {
      const data = await this.getUserRegenerationData(userId);
      const regenerationCount = data?.regeneration_count || 0;
      const cost = this.REGENERATION_COSTS[regenerationCount] || 0;

      if (regenerationCount >= this.MAX_REGENERATIONS) {
        return {
          canRegenerate: false,
          cost,
          regenerationCount,
          reason: 'Limite diário atingido'
        };
      }

      if (currentSPs < cost) {
        return {
          canRegenerate: false,
          cost,
          regenerationCount,
          reason: 'SPs insuficientes'
        };
      }

      return {
        canRegenerate: true,
        cost,
        regenerationCount
      };

    } catch (error) {
      console.error('Erro ao verificar regeneração:', error);
      return {
        canRegenerate: false,
        cost: 0,
        regenerationCount: 0,
        reason: 'Erro interno'
      };
    }
  }

  /**
   * Reseta as regenerações (executado automaticamente à meia-noite)
   */
  static async resetDailyRegenerations(): Promise<void> {
    try {
      // Esta função seria chamada por um cron job ou trigger
      // Por enquanto, apenas limpamos registros antigos
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { error } = await supabase
        .from('daily_regenerations')
        .delete()
        .lt('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (error) throw error;

      console.log('Limpeza de regenerações antigas realizada com sucesso');
    } catch (error) {
      console.error('Erro ao limpar regenerações antigas:', error);
    }
  }

  /**
   * Obtém estatísticas de regeneração do usuário
   */
  static async getUserRegenerationStats(userId: string, days: number = 30): Promise<{
    totalRegenerations: number;
    totalSPsSpent: number;
    averageRegenerationsPerDay: number;
    daysWithRegenerations: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('daily_regenerations')
        .select('regeneration_count, total_sps_spent, date')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0]);

      if (error) throw error;

      const totalRegenerations = data?.reduce((sum, record) => sum + record.regeneration_count, 0) || 0;
      const totalSPsSpent = data?.reduce((sum, record) => sum + record.total_sps_spent, 0) || 0;
      const daysWithRegenerations = data?.length || 0;
      const averageRegenerationsPerDay = daysWithRegenerations > 0 ? totalRegenerations / daysWithRegenerations : 0;

      return {
        totalRegenerations,
        totalSPsSpent,
        averageRegenerationsPerDay: Math.round(averageRegenerationsPerDay * 100) / 100,
        daysWithRegenerations
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalRegenerations: 0,
        totalSPsSpent: 0,
        averageRegenerationsPerDay: 0,
        daysWithRegenerations: 0
      };
    }
  }
}

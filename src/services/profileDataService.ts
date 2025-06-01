
import { supabase } from '@/lib/supabase';

export interface UserEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  description: string;
  grade?: string;
}

export interface UserSkill {
  id: string;
  name: string;
  level: number;
  category: string;
}

export interface UserInterest {
  id: string;
  name: string;
  category: string;
}

export class ProfileDataService {
  // Biografia
  static async getUserBio(): Promise<string | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('bio')
        .eq('id', userData.user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar biografia:', error);
        return null;
      }

      return data?.bio || null;
    } catch (error) {
      console.error('Erro ao buscar biografia:', error);
      return null;
    }
  }

  static async saveUserBio(bio: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({ bio, updated_at: new Date().toISOString() })
        .eq('id', userData.user.id);

      if (error) {
        console.error('Erro ao salvar biografia:', error);
        return { success: false, message: 'Erro ao salvar biografia' };
      }

      return { success: true, message: 'Biografia salva com sucesso!' };
    } catch (error) {
      console.error('Erro ao salvar biografia:', error);
      return { success: false, message: 'Erro ao salvar biografia' };
    }
  }

  // Educação
  static async getUserEducation(): Promise<UserEducation[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return [];

      const { data, error } = await supabase
        .from('user_education')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar educação:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar educação:', error);
      return [];
    }
  }

  static async addUserEducation(education: Omit<UserEducation, 'id'>): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('user_education')
        .insert([{ ...education, user_id: userData.user.id }]);

      if (error) {
        console.error('Erro ao adicionar educação:', error);
        return { success: false, message: 'Erro ao adicionar educação' };
      }

      return { success: true, message: 'Educação adicionada com sucesso!' };
    } catch (error) {
      console.error('Erro ao adicionar educação:', error);
      return { success: false, message: 'Erro ao adicionar educação' };
    }
  }

  static async removeUserEducation(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('user_education')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Erro ao remover educação:', error);
        return { success: false, message: 'Erro ao remover educação' };
      }

      return { success: true, message: 'Educação removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover educação:', error);
      return { success: false, message: 'Erro ao remover educação' };
    }
  }

  // Habilidades
  static async getUserSkills(): Promise<UserSkill[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return [];

      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar habilidades:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar habilidades:', error);
      return [];
    }
  }

  static async addUserSkill(skill: Omit<UserSkill, 'id'>): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('user_skills')
        .insert([{ ...skill, user_id: userData.user.id }]);

      if (error) {
        console.error('Erro ao adicionar habilidade:', error);
        return { success: false, message: 'Erro ao adicionar habilidade' };
      }

      return { success: true, message: 'Habilidade adicionada com sucesso!' };
    } catch (error) {
      console.error('Erro ao adicionar habilidade:', error);
      return { success: false, message: 'Erro ao adicionar habilidade' };
    }
  }

  static async removeUserSkill(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Erro ao remover habilidade:', error);
        return { success: false, message: 'Erro ao remover habilidade' };
      }

      return { success: true, message: 'Habilidade removida com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover habilidade:', error);
      return { success: false, message: 'Erro ao remover habilidade' };
    }
  }

  // Interesses
  static async getUserInterests(): Promise<UserInterest[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return [];

      const { data, error } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar interesses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar interesses:', error);
      return [];
    }
  }

  static async addUserInterest(interest: Omit<UserInterest, 'id'>): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('user_interests')
        .insert([{ ...interest, user_id: userData.user.id }]);

      if (error) {
        console.error('Erro ao adicionar interesse:', error);
        return { success: false, message: 'Erro ao adicionar interesse' };
      }

      return { success: true, message: 'Interesse adicionado com sucesso!' };
    } catch (error) {
      console.error('Erro ao adicionar interesse:', error);
      return { success: false, message: 'Erro ao adicionar interesse' };
    }
  }

  static async removeUserInterest(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, message: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Erro ao remover interesse:', error);
        return { success: false, message: 'Erro ao remover interesse' };
      }

      return { success: true, message: 'Interesse removido com sucesso!' };
    } catch (error) {
      console.error('Erro ao remover interesse:', error);
      return { success: false, message: 'Erro ao remover interesse' };
    }
  }
}

import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user-profile';
import { generateUserId } from '@/lib/generate-user-id';

// Função para obter o perfil do usuário
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  if (!userId) {
    throw new Error('ID de usuário não fornecido');
  }

  try {
    // Primeiro, tente buscar o perfil pelo ID do usuário
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Se ocorrer um erro, tente buscar pelo user_id
      console.warn('Erro ao buscar perfil pelo id, tentando pelo user_id:', error);

      const { data: dataByUserId, error: errorByUserId } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (errorByUserId) {
        console.error('Erro ao buscar perfil pelo user_id:', errorByUserId);

        // Se ainda não encontrou, verifique se o usuário existe na tabela auth.users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Usuário não encontrado:', userError);
          throw new Error('Perfil não encontrado');
        }

        // Se o usuário existe mas não tem perfil, crie um perfil padrão
        if (userData) {
          return createDefaultProfile(userId, userData.email);
        }

        // Caso contrário, lançar erro
        throw new Error('Perfil não encontrado');
      }

      return dataByUserId as UserProfile;
    }

    if (!data) {
      // Se não encontrar o perfil, retornar um modelo básico
      return createDefaultProfile(userId);
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);

    // Em caso de erro, tentar criar um perfil básico para não quebrar a UI
    try {
      const defaultProfile = createDefaultProfile(userId);

      // Tentar salvar este perfil padrão no banco
      await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select();

      return defaultProfile;
    } catch (saveError) {
      console.error('Erro ao salvar perfil padrão:', saveError);
      throw error; // Repassar o erro original
    }
  }
};

// Função para criar um perfil padrão
const createDefaultProfile = (userId: string, email?: string): UserProfile => {
  const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}-${Date.now()}`;

  return {
    id: userId,
    user_id: generateUserId(),
    displayName: 'Usuário',
    email: email || '',
    avatar: randomAvatar,
    coverImage: '',
    bio: '',
    location: '',
    website: '',
    joinedAt: new Date().toISOString(),
    following: 0,
    followers: 0,
    friends: 0,
    postsCount: 0,
    skills: [],
    interests: [],
    education: [],
    achievements: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Função para atualizar o perfil do usuário
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  if (!userId) {
    throw new Error('ID de usuário não fornecido');
  }

  try {
    // Verificar se o perfil existe
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (fetchError || !existingProfile) {
      console.log('Perfil não encontrado, criando novo perfil');

      // Se não existir, criar um novo perfil
      const newProfile = {
        ...createDefaultProfile(userId),
        ...profileData,
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select('*')
        .single();

      if (insertError) {
        console.error('Erro ao inserir novo perfil:', insertError);
        throw insertError;
      }

      return insertedData as UserProfile;
    }

    // Se existir, atualizar
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    throw error;
  }
};
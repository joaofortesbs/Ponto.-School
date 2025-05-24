import { supabase } from '@/lib/supabase';

/**
 * Faz o upload de uma imagem de perfil para o Supabase Storage
 * @param userId ID do usuário
 * @param file Arquivo de imagem para upload
 * @returns URL pública da imagem
 */
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  if (!userId) {
    throw new Error('ID do usuário não fornecido');
  }

  // Gerar nome de arquivo único com timestamp
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Fazer upload para o Supabase Storage
  const { data, error } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }

  // Obter URL pública da imagem
  const { data: urlData } = await supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error('Não foi possível obter URL pública da imagem');
  }

  // Atualizar o campo avatar_url do perfil do usuário
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', userId);

  if (updateError) {
    console.error('Erro ao atualizar perfil:', updateError);
    // Não falhar completamente, já que a imagem foi carregada
  }

  return urlData.publicUrl;
};

/**
 * Busca a URL da imagem de perfil do usuário
 * @param userId ID do usuário
 * @returns URL pública da imagem mais recente ou null
 */
export const getProfileImageUrl = async (userId: string): Promise<string | null> => {
  if (!userId) return null;

  try {
    // Verificar primeiro no perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (profileData?.avatar_url) {
      return profileData.avatar_url;
    }

    // Se não encontrou no perfil, buscar no storage
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .list(`${userId}`);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Pegar o arquivo mais recente
    const latestFile = data.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })[0];

    const { data: urlData } = await supabase.storage
      .from('profile-pictures')
      .getPublicUrl(`${userId}/${latestFile.name}`);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Erro ao buscar imagem de perfil:', error);
    return null;
  }
};

/**
 * Exclui uma imagem de perfil do Supabase Storage
 * @param userId ID do usuário
 * @param fileName Nome do arquivo a ser excluído
 * @returns true se a exclusão foi bem-sucedida
 */
export const deleteProfileImage = async (userId: string, fileName: string): Promise<boolean> => {
  if (!userId || !fileName) {
    throw new Error('ID do usuário ou nome do arquivo não fornecido');
  }

  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from('profile-pictures')
    .remove([filePath]);

  if (error) {
    console.error('Erro ao excluir imagem:', error);
    return false;
  }

  return true;
};
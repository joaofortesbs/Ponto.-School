
import { supabase } from '@/lib/supabase';

/**
 * Serviço para gerenciar o upload e atualização de fotos de perfil
 */
export const profileImageService = {
  /**
   * Faz upload de uma foto de perfil para o Supabase Storage
   * e atualiza o avatar_url do usuário no perfil
   * 
   * @param file Arquivo de imagem a ser enviado
   * @returns URL pública da imagem ou null em caso de erro
   */
  async uploadProfilePicture(file: File): Promise<string | null> {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return null;
      }

      // Definir o caminho da imagem no storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Otimizar imagem antes do upload (opcional)
      let fileToUpload = file;
      if (file.type.includes('image')) {
        // Se for uma imagem, podemos comprimí-la
        try {
          fileToUpload = await this.compressImage(file, 800); // Limitar a 800px de largura/altura
        } catch (e) {
          console.warn('Erro ao comprimir imagem, usando original:', e);
        }
      }

      // Fazer upload para o storage do Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600', // 1 hora de cache
          upsert: true // Sobrescrever arquivo se existir
        });

      if (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        return null;
      }

      // Obter a URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        console.error('Não foi possível obter a URL pública da imagem');
        return null;
      }

      // Atualizar o perfil do usuário com a URL da imagem
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar avatar_url do perfil:', updateError);
        return null;
      }

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Erro ao processar upload de foto de perfil:', error);
      return null;
    }
  },

  /**
   * Comprime uma imagem para reduzir seu tamanho
   * 
   * @param file Arquivo de imagem a ser comprimido
   * @param maxSize Tamanho máximo para largura ou altura
   * @returns Arquivo comprimido
   */
  async compressImage(file: File, maxSize: number = 800): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Redimensionar mantendo proporção
        if (width > height && width > maxSize) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width / height) * maxSize;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, { 
              type: 'image/jpeg', 
              lastModified: Date.now() 
            });
            resolve(optimizedFile);
          } else {
            resolve(file); // Fallback para o arquivo original
          }
        }, 'image/jpeg', 0.85); // Qualidade 85%
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Recupera a URL da foto de perfil do usuário atual
   * 
   * @returns URL da foto de perfil ou null
   */
  async getCurrentUserProfilePicture(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error || !data) return null;
      return data.avatar_url;
    } catch (error) {
      console.error('Erro ao obter foto de perfil:', error);
      return null;
    }
  },

  /**
   * Exclui a foto de perfil atual do usuário
   * 
   * @returns true se foi excluída com sucesso, false caso contrário
   */
  async deleteProfilePicture(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Obter a URL atual da foto de perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (!profileData?.avatar_url) return true; // Não há foto para excluir

      // Obter o caminho do arquivo a partir da URL
      const filePath = profileData.avatar_url.split('/').slice(-2).join('/');
      
      // Excluir o arquivo do storage
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove([filePath]);

      if (deleteError) {
        console.error('Erro ao excluir arquivo do storage:', deleteError);
      }

      // Atualizar o perfil removendo a URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir foto de perfil:', error);
      return false;
    }
  }
};

export default profileImageService;

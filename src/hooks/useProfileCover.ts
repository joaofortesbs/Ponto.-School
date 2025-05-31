
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useProfileCover = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return null;
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/cover.${fileExt}`;

      // Upload do arquivo para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-covers')
        .upload(fileName, file, {
          upsert: true // Substitui se já existir
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast.error('Erro ao fazer upload da imagem');
        return null;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('profile-covers')
        .getPublicUrl(fileName);

      // Atualizar perfil com a nova URL da capa
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        toast.error('Erro ao salvar a capa no perfil');
        return null;
      }

      toast.success('Capa de perfil atualizada com sucesso!');
      return publicUrl;

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao atualizar a capa');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeCoverImage = async (): Promise<boolean> => {
    try {
      setIsUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      // Remover arquivo do storage
      const fileName = `${user.id}/cover.jpg`; // Assume extensão padrão
      await supabase.storage
        .from('profile-covers')
        .remove([fileName]);

      // Atualizar perfil removendo a URL da capa
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: null })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao remover capa do perfil:', updateError);
        toast.error('Erro ao remover a capa do perfil');
        return false;
      }

      toast.success('Capa de perfil removida com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao remover a capa');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadCoverImage,
    removeCoverImage,
    isUploading
  };
};

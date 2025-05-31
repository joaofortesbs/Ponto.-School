
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useProfileCover = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
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
        toast({
          title: "Erro",
          description: "Erro ao fazer upload da imagem",
          variant: "destructive",
        });
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
        toast({
          title: "Erro",
          description: "Erro ao salvar a capa no perfil",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Capa de perfil atualizada com sucesso!",
      });
      return publicUrl;

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar a capa",
        variant: "destructive",
      });
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
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
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
        toast({
          title: "Erro",
          description: "Erro ao remover a capa do perfil",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Capa de perfil removida com sucesso!",
      });
      return true;

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover a capa",
        variant: "destructive",
      });
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

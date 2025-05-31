
import { supabase } from "@/integrations/supabase/client";

export interface ProfileCoverUpload {
  file: File;
  userId: string;
}

export const uploadProfileCover = async ({ file, userId }: ProfileCoverUpload): Promise<string | null> => {
  try {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/cover-${Date.now()}.${fileExt}`;

    console.log("Fazendo upload da capa de perfil:", fileName);

    // Upload do arquivo para o storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-covers')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Erro no upload da capa:", uploadError);
      return null;
    }

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('profile-covers')
      .getPublicUrl(fileName);

    const coverUrl = urlData.publicUrl;

    // Salvar URL da capa no perfil do usuário
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cover_url: coverUrl })
      .eq('id', userId);

    if (updateError) {
      console.error("Erro ao salvar URL da capa no perfil:", updateError);
      return null;
    }

    console.log("Capa de perfil salva com sucesso:", coverUrl);
    return coverUrl;
  } catch (error) {
    console.error("Erro ao fazer upload da capa de perfil:", error);
    return null;
  }
};

export const deleteProfileCover = async (userId: string, coverUrl?: string): Promise<boolean> => {
  try {
    if (coverUrl) {
      // Extrair o nome do arquivo da URL
      const fileName = coverUrl.split('/').pop();
      if (fileName) {
        // Deletar arquivo do storage
        const { error: deleteError } = await supabase.storage
          .from('profile-covers')
          .remove([`${userId}/${fileName}`]);

        if (deleteError) {
          console.error("Erro ao deletar arquivo do storage:", deleteError);
        }
      }
    }

    // Remover URL da capa do perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cover_url: null })
      .eq('id', userId);

    if (updateError) {
      console.error("Erro ao remover URL da capa do perfil:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar capa de perfil:", error);
    return false;
  }
};

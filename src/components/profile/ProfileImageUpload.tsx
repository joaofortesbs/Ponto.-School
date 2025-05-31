
import { useState } from "react";
import { Camera, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpdate?: (newImageUrl: string) => void;
  size?: number;
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  onImageUpdate, 
  size = 80 
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Erro ao fazer upload da imagem");
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        toast.error("Erro ao salvar imagem no perfil");
        return;
      }

      toast.success("Imagem de perfil atualizada com sucesso!");
      onImageUpdate?.(publicUrl);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro inesperado ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer" style={{ width: size, height: size }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isUploading}
      />
      
      <div 
        className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-0.5 transition-all duration-300 group-hover:scale-105"
        style={{ 
          background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FF4500 100%)',
          padding: '2px'
        }}
      >
        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          {currentImageUrl ? (
            <img 
              src={currentImageUrl} 
              alt="Perfil" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>
      </div>
      
      {/* Camera overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Camera className="w-6 h-6 text-white" />
      </div>
      
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

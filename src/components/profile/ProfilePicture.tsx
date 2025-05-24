import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Camera, RefreshCw, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadProfileImage } from '@/services/profileImageService';

interface ProfilePictureProps {
  userId: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onImageUpdated?: (url: string) => void;
  className?: string;
}

export function ProfilePicture({
  userId,
  avatarUrl,
  size = 'md',
  editable = false,
  onImageUpdated,
  className = '',
}: ProfilePictureProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(avatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dimensões baseadas no tamanho
  const sizes = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  const containerClass = `relative rounded-full overflow-hidden ${sizes[size]} ${className}`;

  useEffect(() => {
    if (avatarUrl) {
      setImageUrl(avatarUrl);
      setLoading(false);
    } else if (userId) {
      // Verificar se existe uma imagem de perfil
      const fetchProfileImage = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase.storage
            .from('profile-pictures')
            .list(`${userId}`);

          if (error) {
            throw error;
          }

          if (data && data.length > 0) {
            // Pegar o arquivo mais recente
            const latestFile = data.sort((a, b) => {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })[0];

            const { data: urlData } = await supabase.storage
              .from('profile-pictures')
              .getPublicUrl(`${userId}/${latestFile.name}`);

            if (urlData) {
              setImageUrl(urlData.publicUrl);
              if (onImageUpdated) onImageUpdated(urlData.publicUrl);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar imagem de perfil:', error);
          setError(true);
        } finally {
          setLoading(false);
        }
      };

      fetchProfileImage();
    } else {
      setLoading(false);
    }
  }, [userId, avatarUrl, onImageUpdated]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      setUploading(true);

      const newImageUrl = await uploadProfileImage(userId, file);

      setImageUrl(newImageUrl);
      if (onImageUpdated) onImageUpdated(newImageUrl);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setError(true);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <Skeleton className={containerClass} />;
  }

  return (
    <div className={containerClass}>
      <Avatar className="h-full w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Foto de perfil"
            className="h-full w-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10">
            <User className="h-1/2 w-1/2 text-primary/40" />
          </div>
        )}
      </Avatar>

      {editable && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
          <label 
            htmlFor={`profile-upload-${userId}`}
            className="cursor-pointer flex items-center justify-center w-full h-full"
          >
            {uploading ? (
              <RefreshCw className="h-1/3 w-1/3 text-white animate-spin" />
            ) : (
              <Camera className="h-1/3 w-1/3 text-white" />
            )}
            <input
              id={`profile-upload-${userId}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
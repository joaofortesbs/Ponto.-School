
import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Upload, Trash2, User } from "lucide-react";
import { profileImageService } from '@/services/profileImageService';
import { useToast } from "@/components/ui/use-toast";

interface ProfilePictureProps {
  avatarUrl?: string | null;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onImageUpdated?: (url: string | null) => void;
}

export function ProfilePicture({ 
  avatarUrl, 
  username, 
  size = 'md', 
  editable = false,
  onImageUpdated
}: ProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mapeamento de tamanhos
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  // Letra inicial do username para fallback
  const getInitials = () => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  // Manipular upload de nova imagem
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Verificar tipo e tamanho do arquivo
      if (!file.type.includes('image')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive"
        });
        return;
      }
      
      // Limite de 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter menos de 5MB.",
          variant: "destructive"
        });
        return;
      }

      const newAvatarUrl = await profileImageService.uploadProfilePicture(file);
      
      if (newAvatarUrl) {
        setCurrentAvatarUrl(newAvatarUrl);
        if (onImageUpdated) onImageUpdated(newAvatarUrl);
        
        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso."
        });
      } else {
        toast({
          title: "Erro ao atualizar foto",
          description: "Não foi possível atualizar sua foto de perfil.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua foto.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remover foto atual
  const handleRemovePhoto = async () => {
    try {
      setIsUploading(true);
      const success = await profileImageService.deleteProfilePicture();
      
      if (success) {
        setCurrentAvatarUrl(null);
        if (onImageUpdated) onImageUpdated(null);
        
        toast({
          title: "Foto removida",
          description: "Sua foto de perfil foi removida com sucesso."
        });
      }
    } catch (error) {
      console.error('Erro ao remover foto de perfil:', error);
      toast({
        title: "Erro ao remover foto",
        description: "Não foi possível remover sua foto de perfil.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className={`${sizeClasses[size]} ${editable ? 'group-hover:opacity-80' : ''} transition-opacity`}>
        <AvatarImage src={currentAvatarUrl || undefined} alt={username || "Avatar do usuário"} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {isUploading ? (
            <div className="animate-pulse">...</div>
          ) : (
            <User className={size === 'sm' ? 'h-5 w-5' : 'h-8 w-8'} />
          )}
        </AvatarFallback>
      </Avatar>
      
      {editable && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-white/20 hover:bg-white/40 text-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            {currentAvatarUrl && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 bg-white/20 hover:bg-white/40 text-white"
                onClick={handleRemovePhoto}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
}

export default ProfilePicture;

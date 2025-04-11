
import React, { useState } from "react";
import { UserProfile } from "@/types/user-profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, Camera, CheckCircle, Award, Star } from "lucide-react";
import { updateUserProfileField } from "@/services/profileService";
import { useToast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  profile: UserProfile | null;
  isOwnProfile?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  isOwnProfile = false 
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validação de tipo e tamanho
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 2MB.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Converter para Base64 para armazenamento
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        
        const { success, error } = await updateUserProfileField("avatar_url", base64String);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (success) {
          toast({
            title: "Avatar atualizado",
            description: "Seu avatar foi atualizado com sucesso.",
          });
        } else {
          toast({
            title: "Erro ao atualizar avatar",
            description: error || "Ocorreu um erro ao atualizar seu avatar.",
            variant: "destructive"
          });
        }
        
        // Resetar após um breve delay
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error("Erro ao fazer upload de avatar:", error);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Erro ao atualizar avatar",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = profile?.display_name || profile?.full_name || "Usuário";
  
  return (
    <Card className="bg-white dark:bg-gray-900/70 overflow-hidden relative">
      {/* Banner de fundo */}
      <div 
        className="h-32 md:h-48 bg-gradient-to-r from-[#FF6B00]/90 to-[#FF9500]/90 relative"
      >
        {isOwnProfile && (
          <Button 
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Editar Capa
          </Button>
        )}
      </div>
      
      {/* Conteúdo principal */}
      <div className="p-4 md:p-6 pt-0 md:pt-0 -mt-12 md:-mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* Avatar */}
          <div className="relative mb-4 md:mb-0">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-lg border-4 border-white dark:border-gray-900 shadow-lg profile-3d-avatar">
              {profile?.avatar_url ? (
                <AvatarImage 
                  src={profile.avatar_url} 
                  alt={displayName} 
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-2xl md:text-3xl bg-[#FF6B00]/10 text-[#FF6B00]">
                  {getInitials(displayName)}
                </AvatarFallback>
              )}
            </Avatar>
            
            {isOwnProfile && (
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 h-8 w-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105"
              >
                <Camera size={16} />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                <div className="w-4/5 bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Informações principais */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 profile-3d-text">
                  {displayName}
                  {profile?.role === "teacher" && (
                    <CheckCircle size={20} className="text-blue-500" />
                  )}
                </h1>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile?.role && (
                    <Badge variant="outline" className="capitalize text-[#FF6B00] border-[#FF6B00]/30 bg-[#FF6B00]/5">
                      {profile.role === "student" ? "Estudante" : 
                      profile.role === "teacher" ? "Professor" : 
                      profile.role === "admin" ? "Administrador" : 
                      profile.role}
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20">
                    <Star size={12} className="mr-1" /> Premium
                  </Badge>
                  
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    <Award size={12} className="mr-1" /> 2025
                  </Badge>
                </div>
              </div>
              
              {isOwnProfile && (
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white mt-2 md:mt-0">
                  <Edit2 size={16} className="mr-2" /> Editar Perfil
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;

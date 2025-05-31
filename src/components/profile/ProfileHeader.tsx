import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Camera, Edit, Settings, X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { uploadProfileCover, deleteProfileCover } from "@/services/profileCoverService";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile, onEditClick }) => {
  const { user } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(userProfile?.cover_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar coverImage quando userProfile mudar
  useEffect(() => {
    setCoverImage(userProfile?.cover_url || null);
  }, [userProfile?.cover_url]);

  const handleCoverImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadProfileCover({ file, userId: user.id });
      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
        console.log("Capa de perfil atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao fazer upload da capa:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!user) return;

    setIsUploading(true);
    try {
      const success = await deleteProfileCover(user.id, coverImage || undefined);
      if (success) {
        setCoverImage(null);
        console.log("Capa de perfil removida com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao remover capa:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const renderStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.min(level, 5)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Data não disponível";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      
      return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Obter o nome de usuário para exibição - este é o mesmo nome que aparece no cabeçalho
  const headerUsername = userProfile?.username || '';
  
  // Obter o nome para a parte principal da exibição
  let displayedName = '';
  
  // Prioridade de exibição: username > display_name > full_name > fallback
  if (headerUsername) {
    displayedName = headerUsername;
  } else if (userProfile?.display_name) {
    displayedName = userProfile.display_name;
  } else if (userProfile?.full_name) {
    // Se tiver nome completo, usar o primeiro nome
    displayedName = userProfile.full_name.split(' ')[0];
  } else {
    displayedName = "Usuário";
  }
  
  // Buscar username do localStorage (mesmo usado no cabeçalho)
  const storedUsername = localStorage.getItem('username');
  
  console.log("Dados do perfil para exibição de username:", {
    headerUsername: headerUsername,
    storedUsername: storedUsername,
    displayedName: displayedName,
    profile_username: userProfile?.username,
    profile_display_name: userProfile?.display_name,
    profile_full_name: userProfile?.full_name
  });

  // Usar o nome de usuário do cabeçalho (prioridade máxima)
  const usernameToDisplay = storedUsername || headerUsername || 'joaofortes';

  return (
    <Card className="relative overflow-hidden bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10 shadow-sm">
      {/* Cover Image Section */}
      <div 
        className="relative h-32 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] cursor-pointer group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleCoverImageClick}
      >
        {coverImage && (
          <img 
            src={coverImage} 
            alt="Capa do perfil" 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Overlay para hover */}
        <div className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'} flex items-center justify-center`}>
          {isUploading ? (
            <div className="flex items-center gap-2 text-white">
              <Upload className="h-5 w-5 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCoverImageClick();
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                {coverImage ? 'Alterar' : 'Adicionar'}
              </Button>
              {coverImage && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCover();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Input escondido para upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Edit button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-6 pb-4">
        {/* Profile Avatar and Basic Info */}
        <div className="flex items-start gap-4 -mt-16 relative z-10">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-white dark:border-[#0A2540] shadow-lg">
              <AvatarImage src={userProfile?.avatar_url || ""} />
              <AvatarFallback className="bg-[#FF6B00] text-white text-xl font-semibold">
                {getInitials(displayedName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white dark:border-[#0A2540]"></div>
          </div>

          <div className="flex-1 mt-12">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                {displayedName}
              </h2>
              <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">
                {userProfile?.plan_type || "Lite"}
              </Badge>
            </div>
            
            <p className="text-sm text-[#64748B] dark:text-white/60 mb-1">
              @{usernameToDisplay}
            </p>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {renderStars(userProfile?.level || 1)}
              </div>
              <span className="text-sm font-medium text-[#29335C] dark:text-white">
                Nível {userProfile?.level || 1}
              </span>
              <span className="text-xs text-[#64748B] dark:text-white/60">
                {userProfile?.rank || "Aprendiz"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B] dark:text-white/60">
                  Progresso para o próximo nível
                </span>
                <span className="text-xs font-medium text-[#29335C] dark:text-white">
                  75%
                </span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <div className="text-center">
            <div className="text-lg font-bold text-[#29335C] dark:text-white">152</div>
            <div className="text-xs text-[#64748B] dark:text-white/60">Atividades</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[#29335C] dark:text-white">1.2k</div>
            <div className="text-xs text-[#64748B] dark:text-white/60">XP Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[#29335C] dark:text-white">7</div>
            <div className="text-xs text-[#64748B] dark:text-white/60">Sequência</div>
          </div>
        </div>

        {/* Member Since */}
        <div className="mt-4 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
          <p className="text-xs text-[#64748B] dark:text-white/60">
            Membro desde {formatDate(userProfile?.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;

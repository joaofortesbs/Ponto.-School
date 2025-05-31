import React, { useState, useRef } from "react";
import { Camera, Edit2, MapPin, Calendar, Star, Trophy, Zap, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile?: UserProfile | null;
  coverUrl?: string | null;
  onEditClick?: () => void;
  onCoverUpload?: (file: File) => void;
  onCoverRemove?: () => void;
  isUploadingCover?: boolean;
}

export default function ProfileHeader({ 
  userProfile, 
  coverUrl,
  onEditClick,
  onCoverUpload,
  onCoverRemove,
  isUploadingCover = false
}: ProfileHeaderProps) {
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Buscar o nome de usuário do localStorage (usado no cabeçalho)
  const headerUsername2 = localStorage.getItem('username');
            
  // Usar o nome de usuário do cabeçalho (prioridade máxima)
  const usernameToDisplay = headerUsername2 || storedUsername || 'joaofortes';

  const handleCoverClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onCoverUpload) {
      onCoverUpload(file);
    }
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCoverRemove) {
      onCoverRemove();
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm">
      {/* Header com imagem de capa */}
      <div 
        className="relative h-32 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] cursor-pointer"
        onMouseEnter={() => setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
        onClick={handleCoverClick}
        style={{
          backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay para upload */}
        {(isHoveringCover || isUploadingCover) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {isUploadingCover ? (
              <div className="text-white text-sm">Carregando...</div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-white" />
                <span className="text-white text-sm">
                  {coverUrl ? 'Alterar capa' : 'Adicionar capa'}
                </span>
                {coverUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCover}
                    className="text-white hover:bg-white/20 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Botão de editar perfil */}
        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick?.();
            }}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Editar perfil
          </Button>
        </div>
      </div>

      {/* Conteúdo do cabeçalho */}
      <div className="p-6">
        {/* Avatar e informações principais */}
        <div className="flex items-start gap-4 -mt-16 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-[#0A2540] p-1 shadow-lg">
              <img
                src={userProfile?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {/* Indicador online */}
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-[#0A2540] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Informações do usuário */}
          <div className="flex-1 mt-8">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                João Fortes
              </h2>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm text-[#64748B] dark:text-white/60">4.9</span>
              </div>
            </div>
            
            <p className="text-[#64748B] dark:text-white/60 text-sm mb-2">
              @joaofortes • Estudante
            </p>
            
            <div className="flex items-center gap-4 text-xs text-[#64748B] dark:text-white/60 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>São Paulo, Brasil</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Membro desde 2024</span>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#29335C] dark:text-white">
                    Nível {userProfile?.level || 1}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-white/60">
                    {userProfile?.rank || "Aprendiz"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#29335C] dark:text-white">2.540</div>
                  <div className="text-xs text-[#64748B] dark:text-white/60">XP Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

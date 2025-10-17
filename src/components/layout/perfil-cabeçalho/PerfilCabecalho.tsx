
import React, { useState, useEffect } from "react";
import { ChevronDown, Diamond } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";

const PerfilCabecalho: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [sparks, setSchoolPoints] = useState<number>(300);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await profileService.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDark(darkMode);

    // Carregar imagem de perfil do localStorage (sincronizado com sidebar)
    const loadProfileImage = () => {
      const tempPreview = localStorage.getItem("tempAvatarPreview");
      const cachedAvatar = localStorage.getItem("userAvatarUrl");
      
      if (tempPreview) {
        setProfileImage(tempPreview);
      } else if (cachedAvatar) {
        setProfileImage(cachedAvatar);
      }
    };

    loadProfileImage();

    // Carregar Sparks
    const savedPoints = localStorage.getItem("sparks");
    if (savedPoints) {
      setSchoolPoints(parseInt(savedPoints));
    }

    // Listener para atualização de avatar
    const handleAvatarUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.avatarUrl) {
        setProfileImage(customEvent.detail.avatarUrl);
      }
    };

    // Listener para atualização de pontos
    const handlePointsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.points !== undefined) {
        setSchoolPoints(customEvent.detail.points);
        localStorage.setItem("sparks", customEvent.detail.points.toString());
      }
    };

    document.addEventListener("userAvatarUpdated", handleAvatarUpdate as EventListener);
    document.addEventListener("schoolPointsUpdated", handlePointsUpdate as EventListener);

    return () => {
      document.removeEventListener("userAvatarUpdated", handleAvatarUpdate as EventListener);
      document.removeEventListener("schoolPointsUpdated", handlePointsUpdate as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth_status');
      localStorage.removeItem('auth_checked');

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log("Usuário deslogado com sucesso");

      window.dispatchEvent(new CustomEvent('logout'));

      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      window.location.href = "/login";
    }
  };

  const isLightMode = !isDark;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-full bg-white dark:bg-[#0A2540] border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 dark:hover:border-[#FF6B00]/30 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md">
          {/* Avatar Circular */}
          <div className="relative">
            <Avatar className="w-9 h-9 border-2 border-transparent group-hover:border-[#FF6B00]/20 transition-all duration-300">
              <AvatarImage
                src={profileImage || userProfile?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username || "user"}`}
                alt={userProfile?.display_name || userProfile?.username || "Usuário"}
                className="w-full h-full object-cover scale-125"
              />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white text-xs font-bold">
                {userProfile?.display_name?.substring(0, 2) ||
                  userProfile?.username?.substring(0, 2) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Valor e Ícone */}
          <div className="flex items-center gap-0.5">
            <img 
              src={`/lovable-uploads/icone-powers.png?v=${Date.now()}`}
              alt="Powers" 
              className="w-4 h-4 object-contain"
              onError={(e) => {
                console.error('Erro ao carregar imagem icone-powers.png');
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm font-semibold text-[#FF6B00]">{sparks}</span>
            <ChevronDown className="h-4 w-4 text-[#64748B] dark:text-white/60 group-hover:text-[#FF6B00] dark:group-hover:text-[#FF6B00] transition-colors duration-300" />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-48 p-0 overflow-hidden border-0"
        style={{
          backgroundColor: isLightMode 
            ? 'rgba(254, 240, 231, 0.73)' 
            : '#0D1D2E',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255, 107, 0, 0.15)',
          borderRadius: '18px',
          boxShadow: isLightMode
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -8px rgba(255, 107, 0, 0.1), inset 0 1px 0 rgba(255, 107, 0, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 8px 16px -8px rgba(255, 107, 0, 0.15), inset 0 1px 0 rgba(255, 107, 0, 0.12)'
        }}
      >
        {/* Header minimalista */}
        <div 
          className="px-5 py-4 relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 140, 64, 0.04) 100%)',
            borderBottom: '1px solid rgba(255, 107, 0, 0.12)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/3 to-transparent" />
          <h3 className={`text-sm font-bold relative z-10 tracking-wide text-center ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
            Minha Conta
          </h3>
        </div>

        {/* Menu Items */}
        <div className="py-3 px-2">
          <DropdownMenuItem 
            className={`mx-2 my-1.5 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden hover:bg-white/5 hover:text-[#FF6B00] focus:bg-white/5 focus:text-[#FF6B00] border border-transparent hover:border-[#FF6B00] ${isLightMode ? 'text-gray-700' : 'text-white'}`}
            onClick={() => navigate('/profile')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <User className={`mr-3.5 h-4 w-4 relative z-10 group-hover:text-[#FF6B00] transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <span className="relative z-10 font-normal text-sm">Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className={`mx-2 my-1.5 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden hover:bg-white/5 hover:text-[#FF6B00] focus:bg-white/5 focus:text-[#FF6B00] border border-transparent hover:border-[#FF6B00] ${isLightMode ? 'text-gray-700' : 'text-white'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <HelpCircle className={`mr-3.5 h-4 w-4 relative z-10 group-hover:text-[#FF6B00] transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <span className="relative z-10 font-normal text-sm">Ajuda</span>
          </DropdownMenuItem>
        </div>

        {/* Separator */}
        <div 
          className="mx-4 my-2 h-px"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255, 107, 0, 0.15), transparent)'
          }}
        />

        {/* Logout */}
        <div className="pb-3 px-2">
          <DropdownMenuItem 
            className={`mx-2 my-1.5 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden hover:bg-red-500/10 hover:text-red-500 focus:bg-red-500/10 focus:text-red-500 border border-transparent hover:border-red-500/20 ${isLightMode ? 'text-gray-700' : 'text-white'}`}
            onClick={handleLogout}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <LogOut className={`mr-3.5 h-4 w-4 relative z-10 group-hover:text-red-500 transition-colors duration-300 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <span className="relative z-10 font-normal text-sm">Sair</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PerfilCabecalho;

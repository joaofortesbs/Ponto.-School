import React, { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { profileService } from "@/services/profileService";
import { MODAL_CONFIG } from "../SidebarModal";
import { UserProfile } from "@/types/user-profile";

export const PERFIL_CONFIG = {
  banner: {
    height: 160,
    borderRadius: 16,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f953c6 50%, #ff6b6b 75%, #ff8e53 100%)',
  },
  avatar: {
    size: 100,
    borderWidth: 4,
    borderColor: '#000822',
    offsetFromBanner: 50,
  },
  userInfo: {
    marginTop: 16,
  },
} as const;

export const PerfilSection: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const colors = MODAL_CONFIG.colors.dark;

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const profile = await profileService.getCurrentUserProfile();
        if (profile) {
          setUserProfile(profile);
          
          const tempPreview = localStorage.getItem("tempAvatarPreview");
          const cachedAvatar = localStorage.getItem("userAvatarUrl");
          
          if (tempPreview) {
            setProfileImage(tempPreview);
          } else if (cachedAvatar) {
            setProfileImage(cachedAvatar);
          } else if (profile.imagem_avatar) {
            setProfileImage(profile.imagem_avatar);
            localStorage.setItem("userAvatarUrl", profile.imagem_avatar);
          } else if (profile.profile_image) {
            setProfileImage(profile.profile_image);
            localStorage.setItem("userAvatarUrl", profile.profile_image);
          }
          
          const savedBanner = localStorage.getItem(`bannerImage_${profile.id}`);
          if (savedBanner) {
            setBannerImage(savedBanner);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    const handleAvatarUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.imageUrl) {
        setProfileImage(customEvent.detail.imageUrl);
      }
    };

    document.addEventListener("userAvatarUpdated", handleAvatarUpdate as EventListener);

    return () => {
      document.removeEventListener("userAvatarUpdated", handleAvatarUpdate as EventListener);
    };
  }, []);

  const handleBannerEditClick = () => {
    bannerInputRef.current?.click();
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setBannerImage(base64);
      
      try {
        const profile = await profileService.getCurrentUserProfile();
        if (profile?.id) {
          localStorage.setItem(`bannerImage_${profile.id}`, base64);
        }
      } catch (error) {
        console.error("Erro ao salvar banner:", error);
      }
    };
    reader.readAsDataURL(file);
  };

  const getDisplayName = (): string => {
    if (!userProfile) return "";
    return userProfile.nome_completo || userProfile.display_name || userProfile.username || "";
  };

  const getUsername = (): string => {
    if (!userProfile) return "";
    return userProfile.nome_usuario || userProfile.username || "";
  };

  const avatarSrc = profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getUsername() || "user"}`;

  return (
    <div className="h-full flex flex-col">
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerChange}
        className="hidden"
        aria-label="Selecionar imagem do banner"
      />
      
      <div className="relative" style={{ marginBottom: `${PERFIL_CONFIG.avatar.offsetFromBanner + 20}px` }}>
        <div
          style={{
            height: `${PERFIL_CONFIG.banner.height}px`,
            borderRadius: `${PERFIL_CONFIG.banner.borderRadius}px`,
            background: bannerImage ? `url(${bannerImage}) center/cover no-repeat` : PERFIL_CONFIG.banner.gradient,
          }}
        />
        
        <button
          onClick={handleBannerEditClick}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          aria-label="Editar imagem do banner"
          type="button"
        >
          <Pencil className="w-4 h-4 text-white" />
        </button>
        
        <div
          className="absolute flex items-center justify-center overflow-hidden"
          style={{
            width: `${PERFIL_CONFIG.avatar.size}px`,
            height: `${PERFIL_CONFIG.avatar.size}px`,
            borderRadius: '50%',
            border: `${PERFIL_CONFIG.avatar.borderWidth}px solid ${PERFIL_CONFIG.avatar.borderColor}`,
            bottom: `-${PERFIL_CONFIG.avatar.offsetFromBanner}px`,
            left: '24px',
            backgroundColor: colors.background,
          }}
        >
          {isLoading ? (
            <div className="w-full h-full bg-gray-700 animate-pulse rounded-full" />
          ) : (
            <img
              src={avatarSrc}
              alt="Avatar do usuário"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${getUsername() || "user"}`;
              }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col" style={{ marginTop: `${PERFIL_CONFIG.userInfo.marginTop}px`, marginLeft: '24px' }}>
        {isLoading ? (
          <>
            <div className="h-7 w-48 bg-gray-700 animate-pulse rounded mb-2" />
            <div className="h-5 w-32 bg-gray-700 animate-pulse rounded" />
          </>
        ) : (
          <>
            <h2 
              className="text-xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              {getDisplayName() || "Usuário"}
            </h2>
            <p 
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              {getUsername() || "@usuario"}
            </p>
          </>
        )}
      </div>

      <div className="flex-1 pt-6 px-6">
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Edição de perfil em desenvolvimento...
        </p>
      </div>
    </div>
  );
};

export default PerfilSection;

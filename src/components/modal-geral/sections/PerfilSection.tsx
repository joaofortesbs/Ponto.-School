import React, { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import { MODAL_CONFIG } from "../SidebarModal";

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
} as const;

export const PerfilSection: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const colors = MODAL_CONFIG.colors.dark;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const profile = await profileService.getCurrentUserProfile();
        if (profile) {
          setUserName(profile.username || profile.nome_usuario || "");
          
          const tempPreview = localStorage.getItem("tempAvatarPreview");
          const cachedAvatar = localStorage.getItem("userAvatarUrl");
          
          if (tempPreview) {
            setProfileImage(tempPreview);
          } else if (cachedAvatar) {
            setProfileImage(cachedAvatar);
          } else if (profile.profile_image || profile.imagem_avatar) {
            setProfileImage(profile.profile_image || profile.imagem_avatar);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      }
    };

    loadUserData();
  }, []);

  const avatarSrc = profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || "user"}`;

  return (
    <div className="h-full flex flex-col">
      <div className="relative" style={{ marginBottom: `${PERFIL_CONFIG.avatar.offsetFromBanner + 20}px` }}>
        <div
          style={{
            height: `${PERFIL_CONFIG.banner.height}px`,
            borderRadius: `${PERFIL_CONFIG.banner.borderRadius}px`,
            background: PERFIL_CONFIG.banner.gradient,
          }}
        />
        
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
          <img
            src={avatarSrc}
            alt="Avatar do usuário"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || "user"}`;
            }}
          />
        </div>
      </div>

      <div className="flex-1 pt-4">
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Edição de perfil em desenvolvimento...
        </p>
      </div>
    </div>
  );
};

export default PerfilSection;

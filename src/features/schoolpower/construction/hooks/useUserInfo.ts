
import { useState, useEffect } from 'react';
import { profileService } from '@/services/profileService';

interface UserInfo {
  name: string;
  avatar?: string;
  displayName?: string;
  isLoading: boolean;
}

export const useUserInfo = (): UserInfo => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Usuário',
    avatar: undefined,
    displayName: undefined,
    isLoading: true
  });

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // Primeiro, tentar cache rápido
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const profile = JSON.parse(cachedProfile);
            if (profile) {
              setUserInfo({
                name: profile.display_name || profile.full_name || profile.username || 'Usuário',
                avatar: profile.avatar_url,
                displayName: profile.display_name || profile.full_name,
                isLoading: false
              });
              return; // Usar cache e sair
            }
          } catch (e) {
            console.warn('Erro ao parsear perfil em cache:', e);
          }
        }

        // Se não tiver cache, carregar do profileService
        const profile = await profileService.getCurrentUserProfile();
        if (profile) {
          const userInfoData = {
            name: profile.display_name || profile.full_name || profile.username || 'Usuário',
            avatar: profile.avatar_url,
            displayName: profile.display_name || profile.full_name,
            isLoading: false
          };
          
          setUserInfo(userInfoData);
          
          // Atualizar cache para próximas execuções
          localStorage.setItem('userProfile', JSON.stringify(profile));
        } else {
          // Fallback se não conseguir carregar perfil
          setUserInfo({
            name: 'Usuário',
            avatar: undefined,
            displayName: undefined,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
        setUserInfo({
          name: 'Usuário',
          avatar: undefined,
          displayName: undefined,
          isLoading: false
        });
      }
    };

    loadUserInfo();

    // Escutar por atualizações de perfil
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.profile) {
        const profile = event.detail.profile;
        setUserInfo({
          name: profile.display_name || profile.full_name || profile.username || 'Usuário',
          avatar: profile.avatar_url,
          displayName: profile.display_name || profile.full_name,
          isLoading: false
        });
      }
    };

    const handleAvatarUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.url) {
        setUserInfo(prev => ({
          ...prev,
          avatar: event.detail.url
        }));
      }
    };

    // Eventos para escutar atualizações
    document.addEventListener('profile-updated', handleProfileUpdate as EventListener);
    document.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);

    return () => {
      document.removeEventListener('profile-updated', handleProfileUpdate as EventListener);
      document.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    };
  }, []);

  return userInfo;
};

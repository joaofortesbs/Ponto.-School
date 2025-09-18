
import { useState, useEffect } from 'react';

interface UserInfo {
  name: string;
  avatar?: string;
  displayName?: string;
}

export const useUserInfo = (): UserInfo => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Usuário',
    avatar: undefined,
    displayName: undefined
  });

  useEffect(() => {
    // Tentar obter informações do localStorage
    const profileData = localStorage.getItem('user_profile');
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        setUserInfo({
          name: profile.display_name || profile.username || 'Usuário',
          avatar: profile.avatar_url,
          displayName: profile.display_name
        });
      } catch (error) {
        console.warn('Erro ao carregar perfil do usuário:', error);
      }
    }

    // Tentar obter do sessionStorage
    const sessionProfile = sessionStorage.getItem('user_profile');
    if (sessionProfile) {
      try {
        const profile = JSON.parse(sessionProfile);
        setUserInfo({
          name: profile.display_name || profile.username || 'Usuário',
          avatar: profile.avatar_url,
          displayName: profile.display_name
        });
      } catch (error) {
        console.warn('Erro ao carregar perfil da sessão:', error);
      }
    }

    // Fallback: tentar obter do contexto global se disponível
    if (typeof window !== 'undefined' && window.userProfile) {
      const profile = window.userProfile;
      setUserInfo({
        name: profile.display_name || profile.username || 'Usuário',
        avatar: profile.avatar_url,
        displayName: profile.display_name
      });
    }
  }, []);

  return userInfo;
};

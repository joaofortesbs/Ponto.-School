
import { useState, useEffect } from 'react';

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
        // Buscar user_id do localStorage
        const userId = localStorage.getItem('user_id');
        
        if (!userId) {
          console.warn('⚠️ [useUserInfo] Usuário não autenticado');
          setUserInfo({
            name: 'Usuário',
            avatar: undefined,
            displayName: undefined,
            isLoading: false
          });
          return;
        }

        console.log('🔍 [useUserInfo] Buscando dados do usuário no Neon:', userId);

        // Buscar dados do banco Neon
        const response = await fetch(`/api/perfis?id=${encodeURIComponent(userId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const userData = result.data[0];
          
          const userInfoData = {
            name: userData.nome_completo || userData.nome_usuario || 'Usuário',
            avatar: userData.imagem_avatar,
            displayName: userData.nome_completo || userData.nome_usuario,
            isLoading: false
          };
          
          console.log('✅ [useUserInfo] Dados do usuário carregados do Neon:', userInfoData);
          setUserInfo(userInfoData);
          
          // Atualizar cache no localStorage
          localStorage.setItem('userProfile', JSON.stringify({
            full_name: userData.nome_completo,
            username: userData.nome_usuario,
            display_name: userData.nome_completo,
            avatar_url: userData.imagem_avatar
          }));
        } else {
          console.warn('⚠️ [useUserInfo] Dados do usuário não encontrados no Neon');
          setUserInfo({
            name: 'Usuário',
            avatar: undefined,
            displayName: undefined,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('❌ [useUserInfo] Erro ao carregar informações do usuário:', error);
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

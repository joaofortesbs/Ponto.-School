
import { useState, useEffect } from 'react';

interface UserInfo {
  name: string;
  avatar?: string;
  displayName?: string;
  isLoading: boolean;
}

export const useUserInfo = (): UserInfo => {
  // 🚀 CARREGAR CACHE IMEDIATAMENTE (SEM LOADING)
  const getCachedUserInfo = (): UserInfo => {
    try {
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);
        return {
          name: profile.full_name || profile.username || 'Usuário',
          avatar: profile.avatar_url,
          displayName: profile.display_name || profile.full_name,
          isLoading: false
        };
      }
    } catch (e) {
      console.warn('⚠️ [useUserInfo] Erro ao ler cache:', e);
    }
    
    return {
      name: 'Usuário',
      avatar: undefined,
      displayName: undefined,
      isLoading: false
    };
  };

  const [userInfo, setUserInfo] = useState<UserInfo>(getCachedUserInfo());

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // Buscar user_id do localStorage
        const userId = localStorage.getItem('user_id');
        
        if (!userId) {
          console.warn('⚠️ [useUserInfo] Usuário não autenticado');
          return;
        }

        console.log('🔍 [useUserInfo] Atualizando dados do usuário no Neon:', userId);

        // Buscar dados do banco Neon (com deduplicação)
        const { fetchProfileById } = await import('@/lib/profile-api');
        const result = await fetchProfileById(userId);

        if (result.success && result.data) {
          // result.data pode ser um array ou um objeto direto
          const userData = Array.isArray(result.data) ? result.data[0] : result.data;
          
          console.log('📋 [useUserInfo] Dados brutos recebidos do Neon:', userData);
          
          const userInfoData = {
            name: userData.nome_completo || userData.nome_usuario || 'Usuário',
            avatar: userData.imagem_avatar || userData.avatar_url,
            displayName: userData.nome_completo || userData.nome_usuario,
            isLoading: false
          };
          
          console.log('✅ [useUserInfo] Dados do usuário atualizados do Neon:', userInfoData);
          setUserInfo(userInfoData);
          
          // Atualizar cache no localStorage
          localStorage.setItem('userProfile', JSON.stringify({
            full_name: userData.nome_completo,
            username: userData.nome_usuario,
            display_name: userData.nome_completo,
            avatar_url: userData.imagem_avatar || userData.avatar_url
          }));
        } else {
          console.warn('⚠️ [useUserInfo] Dados do usuário não encontrados no Neon');
        }
      } catch (error) {
        console.error('❌ [useUserInfo] Erro ao carregar informações do usuário:', error);
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

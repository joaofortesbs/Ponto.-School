
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { profileService } from '@/services/profileService';

// Definir interface para o contexto
interface UsernameContextType {
  username: string;
  displayName: string;
  firstName: string;
  isLoading: boolean;
  refreshUsername: () => Promise<void>;
}

// Criar contexto
const UsernameContext = createContext<UsernameContextType>({
  username: '',
  displayName: '',
  firstName: '',
  isLoading: true,
  refreshUsername: async () => {}
});

// Hook para usar o contexto
export const useUsername = () => useContext(UsernameContext);

export const UsernameProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [username, setUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Função para verificar se um username é válido
  const isValidUsername = (name: string | null | undefined): boolean => {
    return !!name && 
           name !== 'Usuário' && 
           !name.startsWith('user_') && 
           name.length > 2;
  };

  // Função para carregar o username de todas as fontes disponíveis
  const loadUsername = async () => {
    try {
      setIsLoading(true);
      
      // 1. Verificar localStorage (mais rápido)
      const localUsername = localStorage.getItem('username');
      const localDisplayName = localStorage.getItem('userDisplayName');
      const localFirstName = localStorage.getItem('userFirstName');
      
      // Definir valores iniciais do localStorage para rápida exibição
      if (isValidUsername(localUsername)) {
        setUsername(localUsername as string);
      }
      
      if (localDisplayName) {
        setDisplayName(localDisplayName);
      }
      
      if (localFirstName) {
        setFirstName(localFirstName);
      }
      
      // 2. Verificar perfil do usuário no Supabase (fonte mais confiável)
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user?.email) {
        const email = sessionData.session.user.email;
        
        // Buscar perfil
        const profile = await profileService.getCurrentUserProfile();
        
        if (profile) {
          // Determinar melhor username
          let bestUsername = '';
          
          if (isValidUsername(profile.username)) {
            bestUsername = profile.username;
          } else if (isValidUsername(localUsername)) {
            bestUsername = localUsername as string;
          } else if (email) {
            // Usar email como fonte para username
            bestUsername = email.split('@')[0];
          }
          
          // Determinar melhor display_name
          const bestDisplayName = profile.display_name || 
                               localDisplayName || 
                               (profile.full_name ? profile.full_name.split(' ')[0] : '') || 
                               bestUsername || 
                               'Usuário';
                               
          // Determinar melhor firstName
          const bestFirstName = (profile.full_name ? profile.full_name.split(' ')[0] : '') || 
                             localFirstName || 
                             bestDisplayName || 
                             'Usuário';
          
          // Atualizar estados
          setUsername(bestUsername);
          setDisplayName(bestDisplayName);
          setFirstName(bestFirstName);
          
          // Sincronizar com localStorage
          localStorage.setItem('username', bestUsername);
          localStorage.setItem('userDisplayName', bestDisplayName);
          localStorage.setItem('userFirstName', bestFirstName);
          
          // Se o perfil tiver dados diferentes, atualizar
          if (profile.username !== bestUsername || 
              profile.display_name !== bestDisplayName) {
            
            await profileService.updateUserProfile({
              username: bestUsername,
              display_name: bestDisplayName,
              updated_at: new Date().toISOString()
            });
            
            console.log('Perfil atualizado com dados sincronizados');
          }
        }
      }
      
      // 3. Se ainda não temos um username válido, criar um
      if (!isValidUsername(username)) {
        const fallbackUsername = `user_${Date.now().toString().slice(-6)}`;
        setUsername(fallbackUsername);
        localStorage.setItem('username', fallbackUsername);
      }
      
    } catch (error) {
      console.error('Erro ao carregar username:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para atualizar forçadamente o username
  const refreshUsername = async () => {
    await loadUsername();
  };
  
  // Efeito para carregar username na montagem do componente
  useEffect(() => {
    loadUsername();
    
    // Listeners para eventos de atualização
    const handleUsernameUpdate = (e: CustomEvent) => {
      if (e.detail?.username) {
        setUsername(e.detail.username);
        localStorage.setItem('username', e.detail.username);
      }
      
      if (e.detail?.displayName) {
        setDisplayName(e.detail.displayName);
        localStorage.setItem('userDisplayName', e.detail.displayName);
      }
    };
    
    // Adicionar event listeners
    document.addEventListener('usernameUpdated', handleUsernameUpdate as EventListener);
    document.addEventListener('usernameSynchronized', handleUsernameUpdate as EventListener);
    
    return () => {
      // Remover listeners
      document.removeEventListener('usernameUpdated', handleUsernameUpdate as EventListener);
      document.removeEventListener('usernameSynchronized', handleUsernameUpdate as EventListener);
    };
  }, []);
  
  // Fornecer valores do contexto
  const contextValue: UsernameContextType = {
    username,
    displayName,
    firstName,
    isLoading,
    refreshUsername
  };
  
  return (
    <UsernameContext.Provider value={contextValue}>
      {children}
    </UsernameContext.Provider>
  );
};

export default UsernameProvider;

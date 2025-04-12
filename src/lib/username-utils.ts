
import { supabase } from './supabase';
import { profileService } from '@/services/profileService';

/**
 * Verifica se um nome de usuário é válido (não é nulo, indefinido ou um placeholder)
 */
export const isValidUsername = (username: string | null | undefined): boolean => {
  return !!username && 
         username !== 'Usuário' && 
         username !== 'user_undefined' &&
         !username.startsWith('user_') &&
         username.length > 2;
};

/**
 * Obtém o melhor nome de usuário disponível de todas as fontes
 */
export const getBestUsername = async (): Promise<string> => {
  try {
    // Ordem de prioridade para obtenção do username
    
    // 1. Verificar localStorage (usado pelo header)
    const localUsername = localStorage.getItem('username');
    if (isValidUsername(localUsername)) {
      return localUsername as string;
    }
    
    // 2. Verificar perfil do usuário no Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.email) {
      const email = sessionData.session.user.email;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, display_name, email')
        .eq('email', email)
        .single();
        
      if (profileData?.username && isValidUsername(profileData.username)) {
        // Salvar no localStorage para uso futuro
        localStorage.setItem('username', profileData.username);
        return profileData.username;
      }
      
      // 3. Verificar metadados da sessão atual
      const metadata = sessionData?.session?.user?.user_metadata;
      if (metadata?.username && isValidUsername(metadata.username)) {
        // Atualizar perfil e localStorage
        if (profileData) {
          await profileService.updateUserProfile({
            username: metadata.username,
            updated_at: new Date().toISOString()
          });
        }
        
        localStorage.setItem('username', metadata.username);
        return metadata.username;
      }
      
      // 4. Usar primeira parte do email como nome de usuário
      const emailUsername = email.split('@')[0];
      if (isValidUsername(emailUsername)) {
        // Atualizar perfil e localStorage
        if (profileData) {
          await profileService.updateUserProfile({
            username: emailUsername,
            updated_at: new Date().toISOString()
          });
        }
        
        localStorage.setItem('username', emailUsername);
        return emailUsername;
      }
    }
    
    // 5. Se tudo falhar, gerar um nome de usuário baseado em timestamp
    const generatedUsername = `user_${Date.now().toString().slice(-8)}`;
    localStorage.setItem('username', generatedUsername);
    
    // Atualizar o perfil se possível
    if (sessionData?.session?.user?.email) {
      await profileService.updateUserProfile({
        username: generatedUsername,
        updated_at: new Date().toISOString()
      });
    }
    
    return generatedUsername;
  } catch (error) {
    console.error('Erro ao obter melhor username:', error);
    const fallbackUsername = `user_${Date.now().toString().slice(-6)}`;
    localStorage.setItem('username', fallbackUsername);
    return fallbackUsername;
  }
};

/**
 * Sincroniza o nome de usuário entre todas as fontes (localStorage, Supabase, sessionStorage)
 */
export const synchronizeUsername = async (preferredUsername?: string): Promise<string> => {
  try {
    let finalUsername: string;
    
    if (preferredUsername && isValidUsername(preferredUsername)) {
      finalUsername = preferredUsername;
    } else {
      finalUsername = await getBestUsername();
    }
    
    // Garantir que o nome de usuário esteja atualizado em todos os lugares
    localStorage.setItem('username', finalUsername);
    sessionStorage.setItem('username', finalUsername);
    
    // Atualizar o perfil no Supabase
    await profileService.updateUserProfile({
      username: finalUsername,
      updated_at: new Date().toISOString()
    });
    
    return finalUsername;
  } catch (error) {
    console.error('Erro ao sincronizar username:', error);
    return localStorage.getItem('username') || 'user_default';
  }
};

/**
 * Inicializa o sistema de username, garantindo consistência entre fontes
 */
export const initializeUsernameSystem = async (): Promise<void> => {
  try {
    document.addEventListener('DOMContentLoaded', async () => {
      // Verificar se já existe um evento personalizado para isso
      if (!window.usernameInitialized) {
        window.usernameInitialized = true;
        
        // Sincronizar username entre todas as fontes
        const username = await synchronizeUsername();
        console.log('Sistema de username inicializado com sucesso:', username);
        
        // Disparar evento para componentes saberem que o username está pronto
        document.dispatchEvent(new CustomEvent('usernameReady', { 
          detail: { username } 
        }));
      }
    });
  } catch (error) {
    console.error('Erro ao inicializar sistema de username:', error);
  }
};

/**
 * Extensão da interface Window para incluir a flag de inicialização
 */
declare global {
  interface Window {
    usernameInitialized?: boolean;
  }
}

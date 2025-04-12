
import { supabase } from './supabase';
import { profileService } from '@/services/profileService';

/**
 * Sistema de inicialização que garante que o username está correto em todas as fontes
 */
class UsernameInitializer {
  private initialized = false;
  private syncInProgress = false;
  
  /**
   * Inicializa o sistema e sincroniza o username entre todas as fontes
   */
  async initialize(): Promise<void> {
    if (this.initialized || this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      console.log('Inicializando sistema de username...');
      
      // 1. Verificar todas as fontes de username
      const sources = await this.collectUsernameSources();
      console.log('Fontes de username coletadas:', sources);
      
      // 2. Determinar o melhor username
      const bestUsername = this.determineBestUsername(sources);
      console.log('Melhor username encontrado:', bestUsername);
      
      // 3. Sincronizar em todas as fontes
      await this.synchronizeUsername(bestUsername, sources.email);
      
      // 4. Disparar evento para notificar componentes
      document.dispatchEvent(new CustomEvent('usernameInitialized', { 
        detail: { username: bestUsername } 
      }));
      
      this.initialized = true;
      console.log('Sistema de username inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar sistema de username:', error);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Coleta todas as fontes possíveis de username
   */
  private async collectUsernameSources(): Promise<{
    localStorage: string | null;
    sessionStorage: string | null;
    profile: string | null;
    metadata: string | null;
    email: string | null;
  }> {
    // Fontes de localStorage/sessionStorage (mais rápidas)
    const localStorage = window.localStorage.getItem('username');
    let sessionStorage = null;
    try {
      sessionStorage = window.sessionStorage.getItem('username');
    } catch (e) {
      console.warn('Erro ao acessar sessionStorage:', e);
    }
    
    // Verificar fonte do Supabase
    let profile = null;
    let metadata = null;
    let email = null;
    
    try {
      // Verificar sessão atual
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user) {
        // Extrair email e metadados da sessão
        email = sessionData.session.user.email || null;
        metadata = sessionData.session.user.user_metadata?.username || null;
        
        // Buscar perfil se tiver email
        if (email) {
          const userProfile = await profileService.getCurrentUserProfile();
          if (userProfile) {
            profile = userProfile.username || null;
          }
        }
      }
    } catch (e) {
      console.error('Erro ao buscar fontes do Supabase:', e);
    }
    
    return {
      localStorage,
      sessionStorage,
      profile,
      metadata,
      email
    };
  }
  
  /**
   * Determina qual é o melhor username entre todas as fontes
   */
  private determineBestUsername(sources: {
    localStorage: string | null;
    sessionStorage: string | null;
    profile: string | null;
    metadata: string | null;
    email: string | null;
  }): string {
    // Função para verificar se um username é válido
    const isValidUsername = (username: string | null): boolean => {
      return !!username && 
             username !== 'Usuário' && 
             !username.startsWith('user_') && 
             username.length > 2;
    };
    
    // Verificar todas as fontes em ordem de prioridade
    if (isValidUsername(sources.profile)) {
      return sources.profile as string;
    }
    
    if (isValidUsername(sources.localStorage)) {
      return sources.localStorage as string;
    }
    
    if (isValidUsername(sources.metadata)) {
      return sources.metadata as string;
    }
    
    if (isValidUsername(sources.sessionStorage)) {
      return sources.sessionStorage as string;
    }
    
    // Criar username do email se possível
    if (sources.email && sources.email.includes('@')) {
      const emailUsername = sources.email.split('@')[0];
      if (isValidUsername(emailUsername)) {
        return emailUsername;
      }
    }
    
    // Último recurso: criar um username único baseado na data
    const date = new Date();
    const idParts = [
      date.getFullYear().toString().slice(-2),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0')
    ];
    
    return `user${idParts.join('')}`;
  }
  
  /**
   * Sincroniza o username em todas as fontes
   */
  private async synchronizeUsername(username: string, email: string | null): Promise<void> {
    // 1. Atualizar localStorage
    localStorage.setItem('username', username);
    
    // 2. Atualizar sessionStorage
    try {
      sessionStorage.setItem('username', username);
    } catch (e) {
      console.warn('Erro ao atualizar sessionStorage:', e);
    }
    
    // 3. Atualizar perfil no Supabase
    try {
      if (email) {
        // Verificar se o perfil existe
        const currentProfile = await profileService.getCurrentUserProfile();
        
        if (currentProfile) {
          // Atualizar se o username for diferente
          if (currentProfile.username !== username) {
            await profileService.updateUserProfile({
              username: username,
              updated_at: new Date().toISOString()
            });
            console.log('Perfil atualizado com username:', username);
          }
        } else {
          // Criar perfil com este username
          await profileService.createUserProfile(
            supabase.auth.getUser().then(data => data.data.user?.id || 'auto'),
            email
          );
          console.log('Novo perfil criado com username:', username);
        }
      }
    } catch (e) {
      console.error('Erro ao atualizar perfil no Supabase:', e);
    }
  }
}

// Exportar uma instância única
export const usernameInitializer = new UsernameInitializer();

// Inicializar automaticamente quando o script for carregado
document.addEventListener('DOMContentLoaded', () => {
  // Pequeno delay para garantir que outros scripts foram carregados
  setTimeout(() => usernameInitializer.initialize(), 100);
});

// Inicializar quando a autenticação mudar
window.addEventListener('auth-state-changed', () => {
  usernameInitializer.initialize();
});

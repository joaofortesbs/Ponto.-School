
import { supabase } from '@/lib/supabase';
import { aiChatDatabase } from './aiChatDatabaseService';

/**
 * Serviço para manter o banco de dados da IA de chat atualizado com as mudanças da plataforma
 */
export const aiChatSyncService = {
  /**
   * Inicializa os listeners de atualização do banco de dados
   */
  initialize: async () => {
    try {
      console.log('Inicializando serviço de sincronização da IA de chat...');
      
      // Armazenar cache local de dados
      const cache = {
        platformSections: [],
        lastUpdate: new Date().getTime()
      };

      // Monitorar mudanças na tabela de perfis
      const profilesSubscription = supabase
        .channel('profiles-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'profiles' 
        }, async (payload) => {
          console.log('Detectada mudança em perfil:', payload.eventType);
          // Limpar cache quando houver alterações
          await aiChatDatabase.clearProfileCache();
        })
        .subscribe();

      // Monitorar mudanças na tabela de configurações da plataforma
      const platformSettingsSubscription = supabase
        .channel('settings-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'platform_settings' 
        }, async (payload) => {
          console.log('Detectada mudança nas configurações da plataforma:', payload.eventType);
          // Atualizar seções da plataforma
          await aiChatSyncService.syncPlatformSections();
        })
        .subscribe();

      // Monitorar mudanças na tabela de turmas
      const classesSubscription = supabase
        .channel('classes-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'classes' 
        }, () => {
          console.log('Detectada mudança em turmas');
          aiChatSyncService.syncClassesData();
        })
        .subscribe();

      // Monitorar mudanças em notificações
      const notificationsSubscription = supabase
        .channel('notifications-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, () => {
          console.log('Detectada mudança em notificações');
          aiChatSyncService.syncNotificationsData();
        })
        .subscribe();

      // Sincronizar dados iniciais
      await aiChatSyncService.syncAllData();

      // Configurar sincronização periódica a cada 30 minutos
      setInterval(async () => {
        await aiChatSyncService.syncAllData();
      }, 30 * 60 * 1000);

      return {
        profilesSubscription,
        platformSettingsSubscription,
        classesSubscription,
        notificationsSubscription
      };
    } catch (error) {
      console.error('Erro ao inicializar serviço de sincronização da IA:', error);
      return null;
    }
  },

  /**
   * Sincroniza todos os dados relevantes para a IA
   */
  syncAllData: async () => {
    try {
      console.log('Sincronizando todos os dados para a IA de chat...');
      
      // Sincronizar seções da plataforma
      await aiChatSyncService.syncPlatformSections();
      
      // Sincronizar dados de turmas
      await aiChatSyncService.syncClassesData();
      
      // Sincronizar dados de séries
      await aiChatSyncService.syncSeriesData();
      
      // Sincronizar notificações
      await aiChatSyncService.syncNotificationsData();
      
      // Sincronizar outros dados relevantes
      await aiChatSyncService.syncOtherPlatformData();
      
      console.log('Sincronização completa');
      return true;
    } catch (error) {
      console.error('Erro na sincronização completa:', error);
      return false;
    }
  },

  /**
   * Sincroniza as seções da plataforma a partir do banco de dados
   */
  syncPlatformSections: async () => {
    try {
      console.log('Sincronizando seções da plataforma...');
      
      // Buscar seções atualizadas no banco de dados
      const { data: sectionsData, error } = await supabase
        .from('platform_sections')
        .select('*')
        .order('section', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (sectionsData && sectionsData.length > 0) {
        // Formatar dados para o formato esperado pela IA
        const formattedSections = sectionsData.map(section => ({
          section: section.section_group || 'general',
          name: section.name,
          description: section.description,
          path: section.path
        }));
        
        // Atualizar no serviço da IA
        aiChatDatabase.updatePlatformSections(formattedSections);
        console.log(`${formattedSections.length} seções sincronizadas com sucesso`);
      } else {
        console.log('Nenhuma seção encontrada, mantendo dados padrão');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar seções da plataforma:', error);
      return false;
    }
  },

  /**
   * Sincroniza dados de turmas
   */
  syncClassesData: async () => {
    try {
      console.log('Sincronizando dados de turmas...');
      
      // Buscar turmas ativas no banco de dados
      const { data: classesData, error } = await supabase
        .from('classes')
        .select('*')
        .eq('status', 'active');
      
      if (error) {
        throw error;
      }
      
      if (classesData && classesData.length > 0) {
        // Atualizar o cache global de turmas para uso da IA
        aiChatDatabase.updateGlobalClassesData(classesData);
        console.log(`${classesData.length} turmas sincronizadas com sucesso`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar dados de turmas:', error);
      return false;
    }
  },

  /**
   * Sincroniza dados de séries
   */
  syncSeriesData: async () => {
    try {
      console.log('Sincronizando dados de séries...');
      
      // Buscar séries disponíveis no banco de dados
      const { data: seriesData, error } = await supabase
        .from('series')
        .select('*')
        .eq('status', 'available');
      
      if (error) {
        throw error;
      }
      
      if (seriesData && seriesData.length > 0) {
        // Atualizar o cache global de séries para uso da IA
        aiChatDatabase.updateGlobalSeriesData(seriesData);
        console.log(`${seriesData.length} séries sincronizadas com sucesso`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar dados de séries:', error);
      return false;
    }
  },

  /**
   * Sincroniza dados de notificações
   */
  syncNotificationsData: async () => {
    try {
      console.log('Sincronizando dados de notificações...');
      
      // Buscar notificações globais ativas
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_global', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      if (notificationsData && notificationsData.length > 0) {
        // Atualizar o cache de notificações globais para uso da IA
        aiChatDatabase.updateGlobalNotificationsData(notificationsData);
        console.log(`${notificationsData.length} notificações sincronizadas com sucesso`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar dados de notificações:', error);
      return false;
    }
  },

  /**
   * Sincroniza outros dados relevantes da plataforma
   */
  syncOtherPlatformData: async () => {
    try {
      console.log('Sincronizando outros dados da plataforma...');
      
      // Buscar estatísticas globais da plataforma
      const { data: statsData, error } = await supabase
        .from('platform_stats')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignora erro de nenhum resultado
        throw error;
      }
      
      if (statsData) {
        // Atualizar estatísticas globais
        aiChatDatabase.updatePlatformStats(statsData);
        console.log('Estatísticas da plataforma sincronizadas com sucesso');
      }
      
      // Buscar novidades recentes
      const { data: newsData, error: newsError } = await supabase
        .from('platform_news')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (newsError) {
        throw newsError;
      }
      
      if (newsData && newsData.length > 0) {
        // Atualizar novidades para uso da IA
        aiChatDatabase.updatePlatformNews(newsData);
        console.log(`${newsData.length} novidades sincronizadas com sucesso`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar outros dados da plataforma:', error);
      return false;
    }
  }
};

export default aiChatSyncService;

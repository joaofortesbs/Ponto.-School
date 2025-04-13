import { UserProfile } from '@/types/user-profile';
import { supabase } from '@/lib/supabase';

// Interface for platform knowledge base
interface PlatformInfo {
  section: string;
  name: string;
  description: string;
  path: string;
}

// Database for AI chat knowledge and context enhancement
export const aiChatDatabase = {
  // Platform sections information for navigation and explanations with comprehensive knowledge
  platformSections: [
    {
      section: 'general',
      name: 'Portal de Estudos',
      description: 'Centro de materiais didáticos organizados por disciplina e tópico.',
      path: '/portal'
    },
    {
      section: 'general',
      name: 'Agenda',
      description: 'Visualize e gerencie seus compromissos, eventos e prazos de entrega.',
      path: '/agenda'
    },
    {
      section: 'general',
      name: 'Turmas',
      description: 'Acesse suas turmas e grupos de estudo.',
      path: '/turmas'
    },
    {
      section: 'general',
      name: 'Biblioteca',
      description: 'Acervo de recursos didáticos e materiais complementares.',
      path: '/biblioteca'
    },
    {
      section: 'profile',
      name: 'Perfil',
      description: 'Visualize e edite suas informações pessoais.',
      path: '/profile'
    },
    {
      section: 'settings',
      name: 'Configurações',
      description: 'Ajuste as configurações da sua conta e preferências.',
      path: '/configuracoes'
    },
    {
      section: 'ai',
      name: 'Epictus IA',
      description: 'Assistente de estudos pessoal para auxiliar em seu aprendizado.',
      path: '/epictus-ia'
    },
    {
      section: 'ai',
      name: 'Mentor IA',
      description: 'Mentoria personalizada para objetivos educacionais específicos.',
      path: '/mentor-ia'
    },
    {
      section: 'study',
      name: 'Planos de Estudo',
      description: 'Crie e gerencie planos de estudo personalizados.',
      path: '/planos-estudo'
    },
    {
      section: 'achievements',
      name: 'Conquistas',
      description: 'Visualize seus progressos e conquistas na plataforma.',
      path: '/conquistas'
    },
    {
      section: 'finance',
      name: 'Carteira',
      description: 'Gerencie seus pontos e recursos na plataforma.',
      path: '/carteira'
    },
    {
      section: 'marketplace',
      name: 'Mercado',
      description: 'Adquira materiais e recursos com seus pontos.',
      path: '/mercado'
    },
    {
      section: 'organization',
      name: 'Organização',
      description: 'Ferramentas para organizar seus estudos e tarefas.',
      path: '/organizacao'
    },
    {
      section: 'social',
      name: 'Comunidades',
      description: 'Participe de comunidades de interesse.',
      path: '/comunidades'
    }
  ],

  // Function to fetch complete user profile information
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      // First try to get current session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        console.log('No active session found for profile access');
        return null;
      }

      // Get full profile with all fields
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  // Function to get user's classes
  getUserClasses: async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('user_classes')
        .select('*, class:classes(*)')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user classes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserClasses:', error);
      return [];
    }
  },

  // Function to get user's series
  getUserSeries: async (userId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('user_series')
        .select('*, serie:series(*)')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user series:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserSeries:', error);
      return [];
    }
  },

  // Function to get followers count
  getFollowersCount: async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact' })
        .eq('followed_id', userId);

      if (error) {
        console.error('Error fetching followers count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getFollowersCount:', error);
      return 0;
    }
  },

  // Get complete user context with all required information
  getUserContext: async (): Promise<any> => {
    try {
      const profile = await aiChatDatabase.getUserProfile();
      if (!profile) {
        return {
          isAuthenticated: false,
          username: 'Visitante'
        };
      }

      // Gather all relevant user information
      const userId = profile.id;
      const classes = await aiChatDatabase.getUserClasses(userId);
      const series = await aiChatDatabase.getUserSeries(userId);
      const followersCount = await aiChatDatabase.getFollowersCount(userId);

      return {
        isAuthenticated: true,
        userId: profile.user_id || userId,
        email: profile.email,
        fullName: profile.full_name,
        displayName: profile.display_name || profile.username,
        username: profile.username,
        createdAt: profile.created_at,
        planType: profile.plan_type || 'lite',
        userLevel: profile.level || 1,
        bio: profile.bio,
        followersCount,
        classes,
        series,
        profile
      };
    } catch (error) {
      console.error('Error getting complete user context:', error);
      return {
        isAuthenticated: false,
        username: 'Visitante'
      };
    }
  },

  // Format user profile information for display with enhanced styling
  // Função melhorada para obter dados completos do perfil para uso avançado do assistente
  getDetailedUserProfile: async (userId?: string): Promise<UserProfile | null> => {
    try {
      // Se não for fornecido ID, pegar da sessão atual
      if (!userId) {
        const { data: sessionData } = await supabase.auth.getSession();
        userId = sessionData?.session?.user?.id;
        
        if (!userId) {
          console.log('Nenhum ID de usuário fornecido ou encontrado na sessão');
          return null;
        }
      }
      
      // Buscar perfil completo com todos os campos
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          classes:user_classes(
            id,
            class_id,
            joined_at,
            status,
            class:classes(*)
          ),
          series:user_series(
            id,
            serie_id,
            progress,
            status,
            serie:series(*)
          ),
          achievements:user_achievements(
            id,
            achievement_id,
            acquired_at,
            achievement:achievements(*)
          ),
          study_stats:user_study_stats(
            id,
            total_minutes,
            streak_days,
            last_activity,
            focus_score
          )
        `)
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar perfil detalhado:', error);
        return null;
      }
      
      // Buscar dados de seguidores
      const { count: followersCount } = await supabase
        .from('user_followers')
        .select('id', { count: 'exact' })
        .eq('followed_id', userId);
        
      // Buscar contagem de materiais consumidos
      const { count: materialsCount } = await supabase
        .from('user_materials')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
      
      // Enriquecer o perfil com dados adicionais
      const enrichedProfile = {
        ...profile,
        followersCount: followersCount || 0,
        materialsCount: materialsCount || 0,
        hasRecentActivity: profile?.study_stats?.[0]?.last_activity ? 
          (new Date().getTime() - new Date(profile.study_stats[0].last_activity).getTime() < 86400000 * 3) : false,
        totalStudyHours: profile?.study_stats?.[0]?.total_minutes ? 
          Math.floor(profile.study_stats[0].total_minutes / 60) : 0
      };
      
      return enrichedProfile;
    } catch (error) {
      console.error('Erro ao obter perfil detalhado:', error);
      return null;
    }
  },

  formatUserProfile: (profileData: any): string => {
    if (!profileData) return 'Informações de perfil não disponíveis.';

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('pt-BR');
      } catch (e) {
        return dateString;
      }
    };

    // Determinar nível de progresso para visualização
    const levelProgress = Math.min(100, (profileData.userLevel || 1) * 10);
    const planTypeFormatted = profileData.planType ? 
      profileData.planType.charAt(0).toUpperCase() + profileData.planType.slice(1) : 
      'Lite (Padrão)';

    // Emojis específicos para cada tipo de plano
    const planEmoji = {
      'premium': '✨ Premium',
      'lite': '🔹 Lite',
      'full': '⭐ Full',
      'pro': '💎 Pro',
      'standard': '📚 Standard'
    }[profileData.planType?.toLowerCase()] || '📚 ' + planTypeFormatted;

    // Construir informações sobre conquistas
    let achievementsInfo = '';
    if (profileData.achievements && profileData.achievements.length > 0) {
      const achievements = profileData.achievements.map((a: any) => 
        a.achievement?.name || 'Conquista Desconhecida').join(', ');
      achievementsInfo = `\n\n**🏆 Conquistas Recentes:** ${achievements}`;
    } else {
      achievementsInfo = '\n\n**🏆 Conquistas:** Nenhuma conquista ainda. Continue estudando para desbloquear!';
    }

    // Construir informações de estatísticas
    let statsInfo = '';
    if (profileData.study_stats && profileData.study_stats.length > 0) {
      const stats = profileData.study_stats[0];
      statsInfo = `\n\n**📊 Estatísticas de Estudo:**
- Total de horas estudadas: ${Math.floor((stats.total_minutes || 0) / 60)}h ${(stats.total_minutes || 0) % 60}min
- Sequência atual: ${stats.streak_days || 0} dias
- Pontuação de foco: ${stats.focus_score || 0}/100
- Última atividade: ${formatDate(stats.last_activity) || 'Não disponível'}`;
    }

    // Construir tabela das turmas e séries
    let classesTable = '';
    if (profileData.classes && profileData.classes.length > 0) {
      classesTable = '\n\n**Turmas Atuais:**\n| Nome | Tipo | Status |\n|------|------|--------|\n';
      profileData.classes.forEach((c: any) => {
        const className = c.class?.name || c.class_id || 'N/A';
        const classType = c.class?.type || 'Regular';
        const classStatus = c.status || 'Ativo';
        classesTable += `| ${className} | ${classType} | ${classStatus} |\n`;
      });
    } else {
      classesTable = '\n\n**Turmas Atuais:** Nenhuma turma inscrita';
    }

    let seriesTable = '';
    if (profileData.series && profileData.series.length > 0) {
      seriesTable = '\n\n**Séries Atuais:**\n| Nome | Progresso | Status |\n|------|-----------|--------|\n';
      profileData.series.forEach((s: any) => {
        const serieName = s.serie?.name || s.serie_id || 'N/A';
        const progress = s.progress || '0';
        const status = s.status || 'Em andamento';
        seriesTable += `| ${serieName} | ${progress}% | ${status} |\n`;
      });
    } else {
      seriesTable = '\n\n**Séries Atuais:** Nenhuma série inscrita';
    }

    return `
**📊 Perfil do Usuário**

[IMPORTANTE]
Estas são as informações da sua conta na plataforma Ponto.School:
- ID: ${profileData.user_id || profileData.id || 'Não disponível'}
- Email: ${profileData.email || 'Não disponível'}
- Data de criação: ${formatDate(profileData.created_at || profileData.createdAt) || 'Não disponível'}
- Nome completo: ${profileData.full_name || profileData.fullName || 'Não disponível'}
- Nome de exibição: ${profileData.display_name || profileData.displayName || 'Não disponível'}
- Plano: ${planEmoji}
- Nível: ${profileData.level || profileData.userLevel || '1'} (${levelProgress}% para o próximo nível)
- Seguidores: ${profileData.followersCount || '0'}
- Materiais acessados: ${profileData.materialsCount || '0'}
[/IMPORTANTE]

**🧠 Sobre mim**
${profileData.bio || 'Nenhuma descrição disponível. Você pode adicionar uma bio no seu perfil!'}
${achievementsInfo}
${statsInfo}
${classesTable}
${seriesTable}

[DICA]
Você pode atualizar suas informações de perfil na seção "Perfil" do menu lateral.
[/DICA]
`;
  },
  
  // Função para verificar permissões do usuário para ações de sistema
  checkUserPermissions: async (userId: string): Promise<{ 
    canModifyProfile: boolean, 
    canAccessAdmin: boolean,
    canManageUsers: boolean
  }> => {
    try {
      // Buscar informações de perfil do usuário
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao verificar permissões:', error);
        return {
          canModifyProfile: true, // Por padrão pode modificar próprio perfil
          canAccessAdmin: false,
          canManageUsers: false
        };
      }
      
      const isAdmin = profileData?.role === 'admin';
      const isStaff = profileData?.role === 'staff' || isAdmin;
      const isPremiumUser = profileData?.role === 'premium' || isStaff;
      
      return {
        canModifyProfile: true, // Todos podem modificar próprio perfil
        canAccessAdmin: isAdmin,
        canManageUsers: isStaff
      };
      
    } catch (error) {
      console.error('Erro ao verificar permissões do usuário:', error);
      return {
        canModifyProfile: true,
        canAccessAdmin: false,
        canManageUsers: false
      };
    }
  }
};

export default aiChatDatabase;
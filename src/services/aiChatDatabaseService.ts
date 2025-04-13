
import { UserProfile } from '@/types/user-profile';
import { supabase } from '@/lib/supabase';

// Interface for platform knowledge base
interface PlatformInfo {
  section: string;
  name: string;
  description: string;
  path: string;
}

// Database for AI chat knowledge
export const aiChatDatabase = {
  // Platform sections information for navigation and explanations
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

  // Format user profile information for display
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

    return `
**📋 Informações do Perfil**

**Dados Pessoais:**
- **Nome Completo:** ${profileData.fullName || 'Não informado'}
- **Nome de Usuário:** ${profileData.username || 'Não definido'}
- **Nome de Exibição:** ${profileData.displayName || 'Não definido'}
- **E-mail:** ${profileData.email || 'Não informado'}
- **ID do Usuário:** ${profileData.userId || 'Não disponível'}
- **Data de Criação:** ${formatDate(profileData.createdAt)}

**Detalhes da Conta:**
- **Plano:** ${profileData.planType || 'Básico'}
- **Nível:** ${profileData.userLevel || '1'}
- **Seguidores:** ${profileData.followersCount || '0'}

**Biografia:**
${profileData.bio || 'Você ainda não adicionou uma biografia.'}

**Educação:**
- **Turmas:** ${profileData.classes && profileData.classes.length > 0 
  ? profileData.classes.map((c: any) => c.class?.name || 'Turma').join(', ') 
  : 'Nenhuma turma registrada'}
- **Séries:** ${profileData.series && profileData.series.length > 0 
  ? profileData.series.map((s: any) => s.serie?.name || 'Série').join(', ') 
  : 'Nenhuma série registrada'}
`;
  }
};

export default aiChatDatabase;

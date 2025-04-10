
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user-profile";
import { generateSimpleUserId } from "@/lib/generate-user-id";

// Função para buscar o perfil do usuário
export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    // Primeiro, tentar buscar do Supabase
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn("Erro ao buscar perfil do Supabase:", error.message);
      // Caso haja erro, gerar um perfil fictício
      return createMockProfile(userId);
    }

    if (data) {
      return {
        id: data.user_id,
        name: data.full_name || 'Usuário',
        username: data.username || 'usuario' + userId.substring(0, 4),
        avatar: data.avatar_url || '/images/tempo-image-20250329T020819629Z.png',
        bio: data.bio || 'Estudante dedicado usando a plataforma para aprimorar conhecimentos.',
        coverImage: data.cover_image || '/images/tempo-image-20250329T044458419Z.png',
        location: data.location || 'Brasil',
        email: data.email || 'usuario@exemplo.com',
        phone: data.phone || '+55 11 98765-4321',
        website: data.website || 'https://meuportfolio.com',
        skills: data.skills || ['Matemática', 'Física', 'Química', 'Programação'],
        interests: data.interests || ['Tecnologia', 'Ciência', 'Leitura', 'Música'],
        education: data.education || [
          {
            institution: 'Universidade Federal',
            degree: 'Bacharelado em Ciências da Computação',
            startYear: 2020,
            endYear: 2024,
          }
        ],
        achievements: data.achievements || [
          {
            title: '100 dias de estudo',
            description: 'Completou 100 dias consecutivos de estudo',
            date: '2023-12-15',
            icon: '🏆',
          },
          {
            title: 'Mestre em Matemática',
            description: 'Completou todos os desafios avançados de matemática',
            date: '2023-11-20',
            icon: '🔢',
          }
        ],
        joinDate: data.join_date || '2023-10-01',
        lastActive: data.last_active || new Date().toISOString().split('T')[0],
        plan: data.plan || 'Premium',
        isVerified: data.is_verified || true,
        userId: data.user_id,
      };
    }

    // Se chegou aqui, não encontrou dados no Supabase
    return createMockProfile(userId);
  } catch (err) {
    console.error("Erro ao buscar perfil do usuário:", err);
    return createMockProfile(userId);
  }
}

// Função para criar um perfil fictício
function createMockProfile(userId: string): UserProfile {
  return {
    id: userId,
    name: 'Estudante Epictus',
    username: 'epictus' + userId.substring(0, 4),
    avatar: '/images/tempo-image-20250329T020819629Z.png',
    bio: 'Estudante dedicado usando a plataforma para aprimorar conhecimentos.',
    coverImage: '/images/tempo-image-20250329T044458419Z.png',
    location: 'Brasil',
    email: 'estudante@exemplo.com',
    phone: '+55 11 98765-4321',
    website: 'https://meuportfolio.com',
    skills: ['Matemática', 'Física', 'Química', 'Programação'],
    interests: ['Tecnologia', 'Ciência', 'Leitura', 'Música'],
    education: [
      {
        institution: 'Universidade Federal',
        degree: 'Bacharelado em Ciências da Computação',
        startYear: 2020,
        endYear: 2024,
      }
    ],
    achievements: [
      {
        title: '100 dias de estudo',
        description: 'Completou 100 dias consecutivos de estudo',
        date: '2023-12-15',
        icon: '🏆',
      },
      {
        title: 'Mestre em Matemática',
        description: 'Completou todos os desafios avançados de matemática',
        date: '2023-11-20',
        icon: '🔢',
      }
    ],
    joinDate: '2023-10-01',
    lastActive: new Date().toISOString().split('T')[0],
    plan: 'Premium',
    isVerified: true,
    userId: userId,
  };
}

// Função para atualizar o perfil do usuário
export async function updateUserProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; error?: any }> {
  try {
    if (!profile.userId) {
      return { success: false, error: 'ID de usuário não fornecido' };
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: profile.userId,
        full_name: profile.name,
        username: profile.username,
        avatar_url: profile.avatar,
        bio: profile.bio,
        cover_image: profile.coverImage,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        skills: profile.skills,
        interests: profile.interests,
        education: profile.education,
        achievements: profile.achievements,
        plan: profile.plan,
        is_verified: profile.isVerified,
        last_active: new Date().toISOString(),
      });

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return { success: false, error: err };
  }
}

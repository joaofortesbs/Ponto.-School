export interface UserProfile {
  id: string;
  user_id?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt?: string;
  following?: number;
  followers?: number;
  friends?: number;
  postsCount?: number;
  skills?: string[];
  interests?: string[];
  education?: EducationItem[];
  achievements?: AchievementItem[];
  created_at?: string;
  updated_at?: string;
  phone?: string;
  tagline?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface AchievementItem {
  title: string;
  date: string;
  description: string;
  icon?: string;
}

// Valores padrão para perfil do usuário
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: crypto.randomUUID(),
  user_id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
  full_name: "Usuário Demonstração",
  display_name: "Usuário",
  email: "usuario@exemplo.com",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
  bio: "Estudante utilizando a plataforma Epictus",
  level: 1,
  plan_type: "lite",
  skills: ["Aprendizado", "Organização"],
  interests: ["Educação", "Tecnologia"],
  education: [
    {
      institution: "Epictus Academy",
      degree: "Curso Online",
      years: "2024-Presente"
    }
  ],
  contact_info: {
    phone: "",
    address: "",
    social: {
      twitter: "",
      linkedin: "",
      github: ""
    }
  },
  coins: 100,
  rank: "Iniciante"
};
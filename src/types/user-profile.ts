
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  display_name: string;
  email: string;
  avatar_url: string;
  website?: string;
  bio?: string;
  level: number;
  plan_type: string;
  created_at?: string;
  updated_at?: string;
  skills?: string[];
  interests?: string[];
  education?: {
    institution: string;
    degree: string;
    years: string;
  }[];
  contact_info?: {
    phone?: string;
    address?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  coins?: number;
  rank?: string;
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

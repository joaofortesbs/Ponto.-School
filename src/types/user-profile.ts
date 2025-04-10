export interface Education {
  institution: string;
  degree: string;
  startYear: number;
  endYear?: number;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  coverImage?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  skills?: string[];
  interests?: string[];
  education?: Education[];
  achievements?: Achievement[];
  joinDate?: string;
  lastActive?: string;
  plan?: string;
  isVerified?: boolean;
  userId: string;
}

// Valores padrão para perfil do usuário
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: crypto.randomUUID(),
  userId: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
  name: "Usuário Demonstração",
  username: "Usuário",
  email: "usuario@exemplo.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
  bio: "Estudante utilizando a plataforma Epictus",
  skills: ["Aprendizado", "Organização"],
  interests: ["Educação", "Tecnologia"],
  education: [
    {
      institution: "Epictus Academy",
      degree: "Curso Online",
      startYear: 2024,
    }
  ],
  joinDate: new Date().toISOString(), // Added joinDate
  plan: "lite", // Added plan

};
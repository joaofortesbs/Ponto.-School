
/**
 * Interface representando um perfil de usuário completo
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher' | 'admin' | string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  user_id: string | null;
  
  // Campos opcionais adicionais
  about_me?: string;
  contact_info?: ContactInfo;
  education?: Education[];
  skills?: Skill[];
  interests?: string[];
  achievements?: Achievement[];
  experience?: Experience[];
  preferences?: UserPreferences;
}

export interface ContactInfo {
  phone?: string;
  address?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  other_social?: Record<string, string>;
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string | null;
  description?: string;
  is_current?: boolean;
}

export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  endorsements?: number;
}

export interface Achievement {
  title: string;
  description?: string;
  date_achieved?: string;
  icon?: string;
  link?: string;
}

export interface Experience {
  company: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    push: boolean;
    updates: boolean;
    reminders: boolean;
  };
  privacy?: {
    show_profile: boolean;
    show_achievements: boolean;
    show_activity: boolean;
  };
}

/**
 * Interface para atualizações parciais de perfil
 */
export type UserProfileUpdate = Partial<UserProfile>;

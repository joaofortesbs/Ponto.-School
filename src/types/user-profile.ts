
// Interface para representar o perfil do usuário
export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  display_name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  institution?: string;
  birth_date?: string;
  plan_type?: string;
  level?: number;
  rank?: string;
  balance?: number;
  expert_balance?: number;
  skills?: string[] | null;
  interests?: string[] | null;
  education?: EducationRecord[] | null;
  contact_info?: ContactInfo | null;
  phone?: string;
  location?: string;
  achievements?: Achievement[] | null;
}

interface EducationRecord {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  current?: boolean;
  description?: string;
}

interface ContactInfo {
  email: string;
  phone?: string;
  location?: string;
  website?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  date_earned: string;
  icon?: string;
}

// Interface para o controle de IDs de usuário
export interface UserIdControl {
  uf: string;
  ano_mes: string;
  tipo_conta: number;
  next_id: number;
}

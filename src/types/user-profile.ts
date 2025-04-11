
export interface UserProfile {
  id: string;
  full_name: string;
  display_name: string;
  username?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  balance?: number;
  expert_balance?: number;
  level?: number;
  rank?: string;
  phone?: string;
  location?: string;
  birth_date?: string;
  plan_type?: string;
  institution?: string;
  created_at?: string;
  updated_at?: string;
}

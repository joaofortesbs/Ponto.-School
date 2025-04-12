export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  website?: string | null;
  bio?: string | null;
  role?: string;
  level?: number;
  rank?: string;
  birth_date?: string | null;
  institution?: string | null;
  course?: string | null;
  plan_type?: string;
  user_id?: string;
  phone?: string | null;
  location?: string | null;
  state?: string | null;
  created_at?: string;
  updated_at?: string;
}
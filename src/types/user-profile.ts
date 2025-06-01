export interface UserProfile {
  id?: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  username?: string;
  display_name?: string;
  institution?: string;
  birth_date?: string;
  plan_type?: string;
  role?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  state?: string;
  student_title?: string;
  website?: string;
  level?: number;
  rank?: string;
  experience_points?: number;
  followers_count?: number;
  following_count?: number;
  classes_count?: number;
  achievements_count?: number;
  achievements?: Array<{
    id: number;
    title: string;
    description: string;
    date: string;
    rarity: string;
    progress: number;
    icon_type: string;
  }>;
  created_at?: string;
  updated_at?: string;
}
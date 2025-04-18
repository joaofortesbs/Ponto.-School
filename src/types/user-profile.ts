export interface UserProfile {
  id: string;
  full_name: string;
  display_name: string;
  username?: string;
  email: string;
  avatar_url?: string;
  role?: string;
  balance?: number;
  expert_balance?: number;
}
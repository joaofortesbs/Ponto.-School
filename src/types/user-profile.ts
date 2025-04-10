
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

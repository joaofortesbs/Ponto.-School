
export interface User {
  id: string;
  username?: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  followers_count?: number;
  following_count?: number;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export type FriendshipStatus = 'none' | 'sent' | 'received' | 'friends';

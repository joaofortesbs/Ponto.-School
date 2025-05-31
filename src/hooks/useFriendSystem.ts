
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  cover_url?: string;
  followers_count?: number;
  following_count?: number;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export const useFriendSystem = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const searchUsers = async (searchTerm: string): Promise<User[]> => {
    if (!searchTerm.trim() || !currentUserId) return [];

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, cover_url')
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .neq('id', currentUserId)
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Erro ao buscar usuários');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getFriendshipStatus = async (userId: string): Promise<FriendshipStatus> => {
    if (!currentUserId) return 'none';

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return 'none';

      if (data.status === 'accepted') return 'friends';
      if (data.sender_id === currentUserId) return 'pending_sent';
      if (data.receiver_id === currentUserId) return 'pending_received';

      return 'none';
    } catch (error) {
      console.error('Error getting friendship status:', error);
      return 'none';
    }
  };

  const sendFriendRequest = async (receiverId: string): Promise<boolean> => {
    if (!currentUserId) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: currentUserId,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Erro ao enviar solicitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Erro ao aceitar solicitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setError('Erro ao recusar solicitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelFriendRequest = async (receiverId: string): Promise<boolean> => {
    if (!currentUserId) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('sender_id', currentUserId)
        .eq('receiver_id', receiverId)
        .eq('status', 'pending');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error canceling friend request:', error);
      setError('Erro ao cancelar solicitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUserId,
    loading,
    error,
    searchUsers,
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest
  };
};

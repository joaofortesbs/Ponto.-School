
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar usuários
  const searchUsers = async (searchTerm: string): Promise<User[]> => {
    if (!searchTerm.trim()) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, cover_url, followers_count, following_count')
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuários');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Verificar status de amizade
  const getFriendshipStatus = async (userId: string): Promise<FriendshipStatus> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'none';

      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return 'none';

      if (data.status === 'accepted') return 'friends';
      if (data.sender_id === user.id) return 'pending_sent';
      if (data.receiver_id === user.id) return 'pending_received';
      
      return 'none';
    } catch (err) {
      console.error('Erro ao verificar status de amizade:', err);
      return 'none';
    }
  };

  // Enviar solicitação de amizade
  const sendFriendRequest = async (receiverId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já existe uma solicitação
      const existingStatus = await getFriendshipStatus(receiverId);
      if (existingStatus !== 'none') {
        throw new Error('Já existe uma solicitação ou amizade com este usuário');
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar solicitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Aceitar solicitação de amizade
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aceitar solicitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Rejeitar solicitação de amizade
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar solicitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar/remover amizade
  const removeFriendship = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover amizade');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchUsers,
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriendship
  };
};

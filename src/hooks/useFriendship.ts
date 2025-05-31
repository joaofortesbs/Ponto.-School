
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, FriendRequest, FriendshipStatus } from '@/types/friendship';

export const useFriendship = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Buscar usuários
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, display_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar solicitações de amizade
  const loadFriendRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
        console.error('Erro ao carregar solicitações:', error);
        return;
      }

      setFriendRequests(data || []);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  // Verificar status de amizade
  const getFriendshipStatus = (userId: string): FriendshipStatus => {
    const currentUserId = supabase.auth.getUser().then(({ data }) => data.user?.id);
    
    const request = friendRequests.find(req => 
      (req.sender_id === userId || req.receiver_id === userId)
    );

    if (!request) return 'none';

    if (request.status === 'accepted') return 'friends';
    
    if (request.status === 'pending') {
      return request.sender_id === userId ? 'received' : 'sent';
    }

    return 'none';
  };

  // Enviar solicitação de amizade
  const sendFriendRequest = async (receiverId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) {
        console.error('Erro ao enviar solicitação:', error);
        return;
      }

      await loadFriendRequests();
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
    }
  };

  // Aceitar solicitação de amizade
  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) {
        console.error('Erro ao aceitar solicitação:', error);
        return;
      }

      await loadFriendRequests();
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
    }
  };

  // Recusar solicitação de amizade
  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        console.error('Erro ao recusar solicitação:', error);
        return;
      }

      await loadFriendRequests();
    } catch (error) {
      console.error('Erro ao recusar solicitação:', error);
    }
  };

  // Cancelar solicitação de amizade
  const cancelFriendRequest = async (receiverId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('sender_id', user.id)
        .eq('receiver_id', receiverId)
        .eq('status', 'pending');

      if (error) {
        console.error('Erro ao cancelar solicitação:', error);
        return;
      }

      await loadFriendRequests();
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
    }
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return {
    users,
    friendRequests,
    loading,
    searchQuery,
    setSearchQuery,
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    loadFriendRequests
  };
};

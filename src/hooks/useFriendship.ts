import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, FriendRequest, FriendshipStatus } from '@/types/friendship';

export const useFriendship = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Obter ID do usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Função para contar parcerias ativas de um usuário
  const getPartnershipCount = async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('friend_requests')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted')
        .eq('categoria', 'Parceiro');

      if (error) {
        console.error('Erro ao contar parcerias:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Erro ao contar parcerias:', error);
      return 0;
    }
  };

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
        .select('id, full_name, display_name, avatar_url')
        .or(`full_name.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      // Mapear dados e buscar contagem real de parcerias para cada usuário
      const mappedUsers = await Promise.all((data || []).map(async (profile) => {
        const partnershipCount = await getPartnershipCount(profile.id);
        
        return {
          id: profile.id,
          username: profile.display_name || profile.full_name?.split(' ')[0] || 'usuario',
          full_name: profile.full_name,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          followers_count: partnershipCount, // Usando o campo existente para armazenar a contagem de parcerias
          following_count: 0 // Não usado mais, mas mantido para compatibilidade
        };
      }));

      setUsers(mappedUsers);
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
        .select('*, categoria')
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
    const request = friendRequests.find(req => 
      (req.sender_id === currentUserId && req.receiver_id === userId) ||
      (req.sender_id === userId && req.receiver_id === currentUserId)
    );

    if (!request) return 'none';

    if (request.status === 'accepted') return 'friends';
    
    if (request.status === 'pending') {
      return request.sender_id === currentUserId ? 'sent' : 'received';
    }

    return 'none';
  };

  // Enviar solicitação de amizade
  const sendFriendRequest = async (receiverId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar se já existe uma solicitação
      const existingRequest = friendRequests.find(req => 
        (req.sender_id === user.id && req.receiver_id === receiverId) ||
        (req.sender_id === receiverId && req.receiver_id === user.id)
      );

      if (existingRequest) {
        console.log('Solicitação já existe');
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending',
          categoria: 'Parceiro'
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
        .update({ 
          status: 'accepted',
          categoria: 'Parceiro'
        })
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

  // Obter solicitações recebidas pendentes
  const getPendingReceivedRequests = () => {
    return friendRequests.filter(
      req => req.receiver_id === currentUserId && req.status === 'pending'
    );
  };

  // Obter parceiros atuais (amizades aceitas)
  const getCurrentPartners = () => {
    return friendRequests.filter(
      req => (req.receiver_id === currentUserId || req.sender_id === currentUserId) && req.status === 'accepted'
    );
  };

  // Obter ID da solicitação recebida
  const getReceivedRequestId = (userId: string) => {
    const request = friendRequests.find(
      req => req.sender_id === userId && req.receiver_id === currentUserId && req.status === 'pending'
    );
    return request?.id;
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
    currentUserId,
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    loadFriendRequests,
    getPendingReceivedRequests,
    getCurrentPartners,
    getReceivedRequestId
  };
};

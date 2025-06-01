
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

      // Mapear dados para incluir username do display_name
      const mappedUsers = (data || []).map(profile => ({
        id: profile.id,
        username: profile.display_name || profile.full_name?.split(' ')[0] || 'usuario',
        full_name: profile.full_name,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        followers_count: Math.floor(Math.random() * 100), // Temporário até ter dados reais
        following_count: Math.floor(Math.random() * 50)   // Temporário até ter dados reais
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

  // Atualizar categoria da parceria
  const updatePartnershipCategory = async (partnerId: string, newCategory: 'Parceiro' | 'Ex-Parceiro') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .update({ categoria: newCategory })
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .select();

      if (error) {
        console.error('Erro ao atualizar categoria:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhuma parceria encontrada para atualizar');
      }

      await loadFriendRequests();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar categoria da parceria:', error);
      throw error;
    }
  };

  // Obter solicitações recebidas pendentes
  const getPendingReceivedRequests = () => {
    return friendRequests.filter(
      req => req.receiver_id === currentUserId && req.status === 'pending'
    );
  };

  // Obter parceiros atuais por categoria
  const getPartnersByCategory = (categoria: 'Parceiro' | 'Ex-Parceiro') => {
    return friendRequests.filter(
      req => (req.receiver_id === currentUserId || req.sender_id === currentUserId) && 
             req.status === 'accepted' && 
             req.categoria === categoria
    );
  };

  // Obter todos os parceiros (mantendo compatibilidade)
  const getCurrentPartners = () => {
    return getPartnersByCategory('Parceiro');
  };

  // Obter categoria atual de um parceiro
  const getPartnerCategory = (partnerId: string): 'Parceiro' | 'Ex-Parceiro' | null => {
    const partnership = friendRequests.find(
      req => (req.receiver_id === currentUserId || req.sender_id === currentUserId) && 
             (req.receiver_id === partnerId || req.sender_id === partnerId) &&
             req.status === 'accepted'
    );
    return partnership?.categoria || null;
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
    updatePartnershipCategory,
    loadFriendRequests,
    getPendingReceivedRequests,
    getCurrentPartners,
    getPartnersByCategory,
    getPartnerCategory,
    getReceivedRequestId
  };
};

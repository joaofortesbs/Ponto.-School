
import { supabase } from "@/lib/supabase";

interface FriendRequest {
  id: number;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface Friendship {
  id: number;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

/**
 * Envia uma solicitação de amizade para outro usuário
 */
export const sendFriendRequest = async (receiverId: string): Promise<FriendRequest | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    const { data, error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao enviar solicitação de amizade:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao enviar solicitação de amizade:', error);
    return null;
  }
};

/**
 * Responde a uma solicitação de amizade (aceitar ou rejeitar)
 */
export const respondToFriendRequest = async (
  requestId: number, 
  status: 'accepted' | 'rejected'
): Promise<FriendRequest | null> => {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();
    
    if (error) {
      console.error(`Erro ao ${status === 'accepted' ? 'aceitar' : 'rejeitar'} solicitação:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao responder à solicitação:`, error);
    return null;
  }
};

/**
 * Obtém todas as solicitações de amizade pendentes para o usuário atual
 */
export const getPendingFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return [];
    }
    
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Erro ao buscar solicitações pendentes:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar solicitações pendentes:', error);
    return [];
  }
};

/**
 * Obtém todas as amizades do usuário atual
 */
export const getFriendships = async (): Promise<{friendship: Friendship, profile: any}[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado');
      return [];
    }
    
    // Buscar amizades onde o usuário é user1_id ou user2_id
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    
    if (error) {
      console.error('Erro ao buscar amizades:', error);
      return [];
    }
    
    // Para cada amizade, buscar o perfil do outro usuário
    const friendshipsWithProfiles = await Promise.all(
      (friendships || []).map(async (friendship) => {
        // Determinar o ID do amigo (o outro usuário na amizade)
        const friendId = friendship.user1_id === user.id 
          ? friendship.user2_id 
          : friendship.user1_id;
        
        // Buscar o perfil do amigo
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, username')
          .eq('id', friendId)
          .single();
        
        if (profileError) {
          console.error('Erro ao buscar perfil do amigo:', profileError);
          return { friendship, profile: null };
        }
        
        return { friendship, profile };
      })
    );
    
    return friendshipsWithProfiles.filter(item => item.profile !== null);
  } catch (error) {
    console.error('Erro ao buscar amizades:', error);
    return [];
  }
};

/**
 * Remove uma amizade existente
 */
export const removeFriendship = async (friendshipId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);
    
    if (error) {
      console.error('Erro ao remover amizade:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao remover amizade:', error);
    return false;
  }
};

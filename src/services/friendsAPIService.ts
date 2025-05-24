
import { supabase } from "@/lib/supabase";

// Detecta automaticamente a URL do servidor de amizades
const getAPIURL = () => {
  // Para ambiente local
  if (window.location.hostname === 'localhost') {
    return "http://localhost:3000/api";
  }
  
  // Para ambiente de produção no Replit
  // Mapeia o domínio principal para o domínio do serviço na porta 3000
  return `https://${window.location.hostname.replace('kirk.replit.dev', 'replit.dev')}-3000.${window.location.hostname.split('.').slice(1).join('.')}/api`;
};

const API_URL = getAPIURL();

/**
 * Obtém o token JWT atual do usuário
 */
const getAuthToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

/**
 * Busca usuários baseado em um termo de pesquisa
 */
export const searchUsers = async (query: string) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Usuário não autenticado');
      return [];
    }

    const response = await fetch(`${API_URL}/search-users?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao buscar usuários:', error);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
};

/**
 * Envia uma solicitação de amizade
 */
export const sendFriendRequest = async (receiverId: string) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Usuário não autenticado');
      return { success: false, error: "Usuário não autenticado" };
    }

    const response = await fetch(`${API_URL}/send-friend-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receiverId })
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar solicitação de amizade:', error);
    return { success: false, error: "Erro ao enviar solicitação" };
  }
};

/**
 * Aceita uma solicitação de amizade
 */
export const acceptFriendRequest = async (senderId: string) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Usuário não autenticado');
      return { success: false, error: "Usuário não autenticado" };
    }

    const response = await fetch(`${API_URL}/accept-friend-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ senderId })
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao aceitar solicitação de amizade:', error);
    return { success: false, error: "Erro ao aceitar solicitação" };
  }
};

/**
 * Rejeita uma solicitação de amizade
 */
export const rejectFriendRequest = async (senderId: string) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Usuário não autenticado');
      return { success: false, error: "Usuário não autenticado" };
    }

    const response = await fetch(`${API_URL}/reject-request`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ senderId })
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao rejeitar solicitação de amizade:', error);
    return { success: false, error: "Erro ao rejeitar solicitação" };
  }
};

/**
 * Verifica se há solicitações de amizade pendentes
 */
export const checkFriendRequests = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Usuário não autenticado');
      return { count: 0 };
    }

    const response = await fetch(`${API_URL}/check-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar solicitações pendentes:', error);
    return { count: 0 };
  }
};

/**
 * Obtém a lista de solicitações de amizade pendentes
 */
export const getFriendRequests = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Usuário não autenticado');
      return [];
    }

    const response = await fetch(`${API_URL}/get-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao obter solicitações pendentes:', error);
    return [];
  }
};

/**
 * Obtém a lista de amigos
 */
export const getFriends = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('Usuário não autenticado');
      return [];
    }

    const response = await fetch(`${API_URL}/friends`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Erro ao obter lista de amigos:', error);
    return [];
  }
};


import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  favorito?: boolean;
  privado?: boolean;
  categoria?: string;
  resumo?: string;
  user_id?: string;
  messages?: Message[];
}

// Recuperar conversas do usuário logado
export const getUserConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      console.error('Usuário não autenticado');
      return [];
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erro ao buscar conversas:', error);
      return [];
    }

    return data.map(conversation => ({
      ...conversation,
      timestamp: new Date(conversation.timestamp),
    }));
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    return [];
  }
};

// Recuperar mensagens de uma conversa específica
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }

    return data.map(message => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return [];
  }
};

// Criar uma nova conversa
export const createNewConversation = async (title: string = "Nova Conversa"): Promise<string | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      console.error('Usuário não autenticado');
      return null;
    }

    const newConversation = {
      id: uuidv4(),
      user_id: user.user.id,
      title,
      timestamp: new Date().toISOString(),
      privado: false,
      favorito: false,
      categoria: 'geral'
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert([newConversation])
      .select();

    if (error) {
      console.error('Erro ao criar conversa:', error);
      return null;
    }

    return data[0].id;
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    return null;
  }
};

// Adicionar mensagem a uma conversa
export const addMessageToConversation = async (
  conversationId: string,
  content: string,
  sender: 'user' | 'ai'
): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      console.error('Usuário não autenticado');
      return false;
    }

    const newMessage = {
      id: uuidv4(),
      conversation_id: conversationId,
      user_id: user.user.id,
      content,
      sender,
      timestamp: new Date().toISOString(),
    };

    const { error: messageError } = await supabase
      .from('messages')
      .insert([newMessage]);

    if (messageError) {
      console.error('Erro ao adicionar mensagem:', messageError);
      return false;
    }

    // Atualizar timestamp da conversa
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ timestamp: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Erro ao atualizar timestamp da conversa:', updateError);
    }

    return true;
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    return false;
  }
};

// Atualizar título da conversa
export const updateConversationTitle = async (conversationId: string, title: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) {
      console.error('Erro ao atualizar título da conversa:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar título da conversa:', error);
    return false;
  }
};

// Gerar resumo da conversa com base nas primeiras mensagens
export const generateConversationSummary = (messages: Message[]): string => {
  if (messages.length === 0) return "Conversa vazia";
  
  const firstUserMessage = messages.find(m => m.sender === 'user');
  if (firstUserMessage) {
    // Limita o resumo às primeiras 100 caracteres da mensagem do usuário
    const summary = firstUserMessage.content.substring(0, 100);
    return summary.length < firstUserMessage.content.length 
      ? `${summary}...` 
      : summary;
  }
  
  return "Nova conversa";
};

// Marcar/desmarcar conversa como favorita
export const toggleFavoriteConversation = async (conversationId: string, isFavorite: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ favorito: isFavorite })
      .eq('id', conversationId);

    if (error) {
      console.error('Erro ao atualizar status de favorito:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar status de favorito:', error);
    return false;
  }
};

// Marcar/desmarcar conversa como privada
export const togglePrivateConversation = async (conversationId: string, isPrivate: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ privado: isPrivate })
      .eq('id', conversationId);

    if (error) {
      console.error('Erro ao atualizar status de privacidade:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar status de privacidade:', error);
    return false;
  }
};

// Excluir conversa e suas mensagens
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // Primeiro exclui todas as mensagens da conversa
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Erro ao excluir mensagens da conversa:', messagesError);
      return false;
    }

    // Depois exclui a conversa
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (conversationError) {
      console.error('Erro ao excluir conversa:', conversationError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir conversa:', error);
    return false;
  }
};

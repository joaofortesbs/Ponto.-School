
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

export interface Conversa {
  id: string;
  titulo: string;
  timestamp: Date;
  favorito?: boolean;
  privado?: boolean;
  categoria?: string;
  resumo?: string;
  user_id?: string;
  messages?: {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
  }[];
}

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  conversation_id: string;
  user_id?: string;
}

// Função para criar uma nova conversa
export const createNewConversation = async (userId: string, titulo: string = "Nova Conversa"): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('conversas')
      .insert([
        { 
          id: uuidv4(),
          user_id: userId, 
          titulo, 
          criado_at: new Date().toISOString(),
          atualizado_at: new Date().toISOString(),
          privado: false,
          favorito: false
        }
      ])
      .select();

    if (error) {
      console.error("Erro ao criar nova conversa:", error);
      return null;
    }

    return data?.[0]?.id || null;
  } catch (error) {
    console.error("Erro ao criar conversa:", error);
    return null;
  }
};

// Função para atualizar o título de uma conversa
export const updateConversationTitle = async (conversationId: string, titulo: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversas')
      .update({ 
        titulo, 
        atualizado_at: new Date().toISOString() 
      })
      .eq('id', conversationId);

    if (error) {
      console.error("Erro ao atualizar título da conversa:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar título:", error);
    return false;
  }
};

// Função para atualizar dados da conversa (favorito, privado, etc)
export const updateConversationData = async (conversationId: string, data: Partial<Conversa>): Promise<boolean> => {
  try {
    const updateData = {
      ...data,
      atualizado_at: new Date().toISOString()
    };
    
    // Remover campos que não devem ser atualizados diretamente
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.messages;
    
    const { error } = await supabase
      .from('conversas')
      .update(updateData)
      .eq('id', conversationId);

    if (error) {
      console.error("Erro ao atualizar dados da conversa:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados:", error);
    return false;
  }
};

// Função para salvar uma mensagem na conversa
export const saveMessage = async (conversationId: string, userId: string, content: string, sender: "user" | "ai"): Promise<string | null> => {
  try {
    // Primeiro atualiza o timestamp da conversa
    const { error: updateError } = await supabase
      .from('conversas')
      .update({ atualizado_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) {
      console.error("Erro ao atualizar timestamp da conversa:", updateError);
    }

    // Depois salva a mensagem
    const messageId = uuidv4();
    const { error } = await supabase
      .from('mensagens')
      .insert([
        { 
          id: messageId,
          conversa_id: conversationId,
          user_id: userId,
          content,
          is_user: sender === 'user',
          criado_at: new Date().toISOString(),
          sender
        }
      ]);

    if (error) {
      console.error("Erro ao salvar mensagem:", error);
      return null;
    }

    return messageId;
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    return null;
  }
};

// Função para buscar todas as conversas do usuário
export const getUserConversations = async (userId: string): Promise<Conversa[]> => {
  try {
    const { data, error } = await supabase
      .from('conversas')
      .select('*')
      .eq('user_id', userId)
      .order('atualizado_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar conversas do usuário:", error);
      return [];
    }

    // Converter timestamps para objetos Date
    return data.map(conv => ({
      id: conv.id,
      titulo: conv.titulo,
      timestamp: new Date(conv.atualizado_at),
      favorito: conv.favorito,
      privado: conv.privado,
      categoria: conv.categoria,
      resumo: conv.resumo,
      user_id: conv.user_id
    }));
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    return [];
  }
};

// Função para buscar mensagens de uma conversa
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('conversa_id', conversationId)
      .order('criado_at', { ascending: true });

    if (error) {
      console.error("Erro ao buscar mensagens da conversa:", error);
      return [];
    }

    // Converter dados para o formato esperado
    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.is_user ? 'user' : 'ai',
      timestamp: new Date(msg.criado_at),
      conversation_id: msg.conversa_id,
      user_id: msg.user_id
    }));
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
};

// Função para excluir uma conversa e suas mensagens
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // Primeiro exclui as mensagens relacionadas
    const { error: msgError } = await supabase
      .from('mensagens')
      .delete()
      .eq('conversa_id', conversationId);

    if (msgError) {
      console.error("Erro ao excluir mensagens da conversa:", msgError);
      return false;
    }

    // Depois exclui a conversa
    const { error } = await supabase
      .from('conversas')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error("Erro ao excluir conversa:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao excluir conversa:", error);
    return false;
  }
};

// Função para gerar um resumo automático com base nas mensagens
export const generateConversationSummary = async (conversationId: string): Promise<string | null> => {
  try {
    // Buscar as primeiras mensagens para criar um resumo
    const { data, error } = await supabase
      .from('mensagens')
      .select('content')
      .eq('conversa_id', conversationId)
      .order('criado_at', { ascending: true })
      .limit(3);

    if (error) {
      console.error("Erro ao buscar mensagens para resumo:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Criar um resumo simples
    const firstMessage = data[0].content;
    // Limitar a um número razoável de caracteres
    const summary = firstMessage.length > 120 
      ? `${firstMessage.substring(0, 120)}...` 
      : firstMessage;

    // Atualizar o resumo na conversa
    const { error: updateError } = await supabase
      .from('conversas')
      .update({ resumo: summary })
      .eq('id', conversationId);

    if (updateError) {
      console.error("Erro ao atualizar resumo da conversa:", updateError);
    }

    return summary;
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return null;
  }
};

// Função para buscar conversas por termo de pesquisa
export const searchConversations = async (userId: string, searchTerm: string): Promise<Conversa[]> => {
  try {
    const { data, error } = await supabase
      .from('conversas')
      .select('*')
      .eq('user_id', userId)
      .ilike('titulo', `%${searchTerm}%`)
      .order('atualizado_at', { ascending: false });

    if (error) {
      console.error("Erro ao pesquisar conversas:", error);
      return [];
    }

    return data.map(conv => ({
      id: conv.id,
      titulo: conv.titulo,
      timestamp: new Date(conv.atualizado_at),
      favorito: conv.favorito,
      privado: conv.privado,
      categoria: conv.categoria,
      resumo: conv.resumo,
      user_id: conv.user_id
    }));
  } catch (error) {
    console.error("Erro ao pesquisar conversas:", error);
    return [];
  }
};

// Função para configurar favorito
export const toggleFavorite = async (conversationId: string, isFavorite: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversas')
      .update({ 
        favorito: isFavorite,
        atualizado_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      console.error("Erro ao atualizar favorito:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao configurar favorito:", error);
    return false;
  }
};

// Função para configurar privacidade
export const togglePrivate = async (conversationId: string, isPrivate: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversas')
      .update({ 
        privado: isPrivate,
        atualizado_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      console.error("Erro ao atualizar privacidade:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao configurar privacidade:", error);
    return false;
  }
};

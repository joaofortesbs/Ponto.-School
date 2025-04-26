
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  resumo?: string;
  favorito?: boolean;
  privado?: boolean;
  categoria?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isEdited?: boolean;
}

// Funções para gerenciar conversas
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversas')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar conversas:', error);
      return [];
    }

    return data.map(conv => ({
      ...conv,
      created_at: new Date(conv.created_at),
      updated_at: new Date(conv.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    return [];
  }
};

export const createConversation = async (userId: string, title: string = "Nova Conversa"): Promise<string | null> => {
  try {
    const conversationId = uuidv4();
    const now = new Date();
    
    const { error } = await supabase
      .from('conversas')
      .insert({
        id: conversationId,
        user_id: userId,
        title,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });

    if (error) {
      console.error('Erro ao criar conversa:', error);
      return null;
    }

    return conversationId;
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    return null;
  }
};

export const updateConversationTitle = async (conversationId: string, title: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversas')
      .update({ 
        title,
        updated_at: new Date().toISOString()
      })
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

export const updateConversationMetadata = async (
  conversationId: string, 
  metadata: {
    favorito?: boolean;
    privado?: boolean;
    categoria?: string;
    resumo?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversas')
      .update({ 
        ...metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Erro ao atualizar metadados da conversa:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar metadados da conversa:', error);
    return false;
  }
};

export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // Primeiro excluímos as mensagens associadas à conversa
    const { error: messagesError } = await supabase
      .from('mensagens')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Erro ao excluir mensagens da conversa:', messagesError);
      return false;
    }

    // Depois excluímos a conversa
    const { error } = await supabase
      .from('conversas')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Erro ao excluir conversa:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir conversa:', error);
    return false;
  }
};

// Funções para gerenciar mensagens
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }

    return data.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return [];
  }
};

export const addMessage = async (
  conversationId: string,
  content: string,
  sender: 'user' | 'ai',
  isEdited: boolean = false
): Promise<string | null> => {
  try {
    const messageId = uuidv4();
    const now = new Date();
    
    const { error } = await supabase
      .from('mensagens')
      .insert({
        id: messageId,
        conversation_id: conversationId,
        content,
        sender,
        timestamp: now.toISOString(),
        isEdited
      });

    if (error) {
      console.error('Erro ao adicionar mensagem:', error);
      return null;
    }

    // Atualiza o timestamp da conversa
    await supabase
      .from('conversas')
      .update({ updated_at: now.toISOString() })
      .eq('id', conversationId);

    return messageId;
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    return null;
  }
};

export const updateMessage = async (
  messageId: string,
  content: string,
  isEdited: boolean = true
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('mensagens')
      .update({ 
        content,
        isEdited
      })
      .eq('id', messageId);

    if (error) {
      console.error('Erro ao atualizar mensagem:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar mensagem:', error);
    return false;
  }
};

// Geração de resumo automático a partir das primeiras mensagens
export const generateConversationSummary = (messages: Message[], maxLength: number = 150): string => {
  if (messages.length === 0) return "";
  
  // Usa a primeira mensagem do usuário para gerar o título
  const firstUserMessage = messages.find(msg => msg.sender === 'user');
  
  if (!firstUserMessage) return "Nova Conversa";
  
  let summary = firstUserMessage.content;
  
  // Trunca e adiciona elipses se necessário
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength) + '...';
  }
  
  return summary;
};

// Determina uma categoria com base no conteúdo das mensagens
export const determineCategory = (messages: Message[]): string => {
  const allContent = messages.map(msg => msg.content.toLowerCase()).join(' ');
  
  const categories = [
    { name: 'tecnologia', keywords: ['programação', 'código', 'algoritmo', 'desenvolvimento', 'software', 'tecnologia', 'computador'] },
    { name: 'educação', keywords: ['escola', 'estudar', 'aula', 'professor', 'aluno', 'educação', 'aprendizado', 'ensino'] },
    { name: 'matemática', keywords: ['matemática', 'cálculo', 'equação', 'álgebra', 'geometria', 'número', 'estatística'] },
    { name: 'ciências', keywords: ['ciência', 'biologia', 'física', 'química', 'experimento', 'laboratório'] },
    { name: 'história', keywords: ['história', 'período', 'século', 'guerra', 'revolução', 'civilização', 'império'] },
    { name: 'literatura', keywords: ['livro', 'literatura', 'autor', 'romance', 'poesia', 'conto', 'narrativa'] },
    { name: 'ia', keywords: ['inteligência artificial', 'ia', 'machine learning', 'algoritmo', 'modelo', 'neural', 'rede neural'] }
  ];
  
  for (const category of categories) {
    if (category.keywords.some(keyword => allContent.includes(keyword))) {
      return category.name;
    }
  }
  
  return 'geral';
};

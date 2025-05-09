
import { supabase } from "@/lib/supabase";

// Tipos de dados
export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  balance: number;
  expertBalance?: number;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty?: "básico" | "intermediário" | "avançado";
  urgency?: boolean;
  status: "aberto" | "em_leilao" | "respondido" | "resolvido";
  userId: string;
  createdAt: string;
  tags?: string[];
  auction?: {
    currentBid: number;
    timeLeft: string;
    bidCount: number;
  };
}

export interface Response {
  id: string;
  requestId: string;
  expertId: string;
  content: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
  price: number;
  responseTime: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  requestId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Feedback {
  id: string;
  responseId: string;
  userId: string;
  rating: number;
  comment?: string;
  timestamp: string;
}

// Funções para usuários
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    name: data.display_name || data.full_name || "Usuário",
    avatar: data.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=current",
    email: data.email,
    balance: data.balance || 150,
    expertBalance: data.expert_balance || 320,
  };
};

export const updateUserBalance = async (
  userId: string,
  amount: number,
): Promise<User | null> => {
  const { data: profile, error: getError } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", userId)
    .single();
  
  if (getError || !profile) return null;
  
  const newBalance = (profile.balance || 0) + amount;
  
  const { data, error } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", userId)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return await getCurrentUser();
};

// Funções para pedidos
export const addRequest = async (
  requestData: Omit<Request, "id" | "createdAt">,
): Promise<Request | null> => {
  const { data, error } = await supabase
    .from("requests")
    .insert({
      ...requestData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    subject: data.subject,
    difficulty: data.difficulty,
    urgency: data.urgency,
    status: data.status,
    userId: data.user_id,
    createdAt: data.created_at,
    tags: data.tags,
    auction: data.auction,
  };
};

export const getRequestById = async (requestId: string): Promise<Request | null> => {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    subject: data.subject,
    difficulty: data.difficulty,
    urgency: data.urgency,
    status: data.status,
    userId: data.user_id,
    createdAt: data.created_at,
    tags: data.tags,
    auction: data.auction,
  };
};

export const updateRequestStatus = async (
  requestId: string,
  status: Request["status"],
): Promise<Request | null> => {
  const { data, error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", requestId)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    subject: data.subject,
    difficulty: data.difficulty,
    urgency: data.urgency,
    status: data.status,
    userId: data.user_id,
    createdAt: data.created_at,
    tags: data.tags,
    auction: data.auction,
  };
};

// Funções para respostas
export const addResponse = async (responseData: Omit<Response, "id">): Promise<Response | null> => {
  try {
    const { data, error } = await supabase
      .from("responses")
      .insert({
        request_id: responseData.requestId,
        expert_id: responseData.expertId,
        content: responseData.content,
        timestamp: responseData.timestamp || new Date().toISOString(),
        status: responseData.status,
        price: responseData.price,
        response_time: responseData.responseTime,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar resposta:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      requestId: data.request_id,
      expertId: data.expert_id,
      content: data.content,
      timestamp: data.timestamp,
      status: data.status,
      price: data.price,
      responseTime: data.response_time,
    };
  } catch (error) {
    console.error('Erro ao adicionar resposta:', error);
    return null;
  }
};

export const getResponsesByRequestId = async (requestId: string): Promise<Response[]> => {
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("request_id", requestId);
  
  if (error || !data) return [];
  
  return data.map(item => ({
    id: item.id,
    requestId: item.request_id,
    expertId: item.expert_id,
    content: item.content,
    timestamp: item.timestamp,
    status: item.status,
    price: item.price,
    responseTime: item.response_time,
  }));
};

export const getResponsesByExpertId = async (expertId: string): Promise<Response[]> => {
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("expert_id", expertId);
  
  if (error || !data) return [];
  
  return data.map(item => ({
    id: item.id,
    requestId: item.request_id,
    expertId: item.expert_id,
    content: item.content,
    timestamp: item.timestamp,
    status: item.status,
    price: item.price,
    responseTime: item.response_time,
  }));
};

export const acceptResponse = async (responseId: string): Promise<Response | null> => {
  // Primeiro, buscar a resposta para obter as informações necessárias
  const { data: responseData, error: responseError } = await supabase
    .from("responses")
    .select("*")
    .eq("id", responseId)
    .single();
  
  if (responseError || !responseData) return null;
  
  // Atualizar o status da resposta
  const { data: updatedResponse, error: updateError } = await supabase
    .from("responses")
    .update({ status: "accepted" })
    .eq("id", responseId)
    .select()
    .single();
  
  if (updateError || !updatedResponse) return null;
  
  // Atualizar o status do pedido
  await updateRequestStatus(updatedResponse.request_id, "respondido");
  
  // Obter usuário atual
  const currentUser = await getCurrentUser();
  if (currentUser) {
    // Debitar o valor da conta do usuário
    await updateUserBalance(currentUser.id, -updatedResponse.price);
  }
  
  return {
    id: updatedResponse.id,
    requestId: updatedResponse.request_id,
    expertId: updatedResponse.expert_id,
    content: updatedResponse.content,
    timestamp: updatedResponse.timestamp,
    status: updatedResponse.status,
    price: updatedResponse.price,
    responseTime: updatedResponse.response_time
  };
};

// Função para obter resposta por ID
export const getResponseById = async (responseId: string): Promise<Response | null> => {
  try {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("id", responseId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar resposta:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      requestId: data.request_id,
      expertId: data.expert_id,
      content: data.content,
      timestamp: data.timestamp,
      status: data.status,
      price: data.price,
      responseTime: data.response_time,
    };
  } catch (error) {
    console.error('Erro ao buscar resposta:', error);
    return null;
  }
};

// Funções para mensagens
export const addMessage = async (
  messageData: Omit<Message, "id" | "timestamp" | "read">,
): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: messageData.senderId,
        receiver_id: messageData.receiverId,
        request_id: messageData.requestId,
        content: messageData.content,
        timestamp: new Date().toISOString(),
        read: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar mensagem:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      requestId: data.request_id,
      content: data.content,
      timestamp: data.timestamp,
      read: data.read,
    };
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    return null;
  }
};

export const getMessagesByRequestId = async (requestId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("request_id", requestId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
    
    if (!data) return [];
    
    return data.map(item => ({
      id: item.id,
      senderId: item.sender_id,
      receiverId: item.receiver_id,
      requestId: item.request_id,
      content: item.content,
      timestamp: item.timestamp,
      read: item.readem.read,
  }));
};

// Funções para feedback
export const addFeedback = async (
  feedbackData: Omit<Feedback, "id" | "timestamp">,
): Promise<Feedback | null> => {
  const { data, error } = await supabase
    .from("feedback")
    .insert({
      response_id: feedbackData.responseId,
      user_id: feedbackData.userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    responseId: data.response_id,
    userId: data.user_id,
    rating: data.rating,
    comment: data.comment,
    timestamp: data.timestamp,
  };
};

export const getFeedbacksByResponseId = async (responseId: string): Promise<Feedback[]> => {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("response_id", responseId);
  
  if (error || !data) return [];
  
  return data.map(item => ({
    id: item.id,
    responseId: item.response_id,
    userId: item.user_id,
    rating: item.rating,
    comment: item.comment,
    timestamp: item.timestamp,
  }));
};

// Tipos para grupos de estudo
export interface GrupoEstudoUsuario {
  id: string;
  userId: string;
  nome: string;
  topico: string;
  disciplina: string;
  descricao?: string;
  membros: number;
  proximaReuniao?: string;
  progresso: number;
  nivel: string;
  imagem: string;
  tags?: string[];
  dataInicio: string;
  createdAt: string;
}

// Funções para grupos de estudo
export const createGrupoEstudo = async (
  grupoData: Omit<GrupoEstudoUsuario, "id" | "createdAt">
): Promise<GrupoEstudoUsuario | null> => {
  try {
    const { data, error } = await supabase
      .from("grupos_estudo")
      .insert({
        user_id: grupoData.userId,
        nome: grupoData.nome,
        topico: grupoData.topico,
        disciplina: grupoData.disciplina,
        descricao: grupoData.descricao,
        membros: grupoData.membros,
        proxima_reuniao: grupoData.proximaReuniao,
        progresso: grupoData.progresso,
        nivel: grupoData.nivel,
        imagem: grupoData.imagem,
        tags: grupoData.tags,
        data_inicio: grupoData.dataInicio,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar grupo de estudo:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      userId: data.user_id,
      nome: data.nome,
      topico: data.topico,
      disciplina: data.disciplina,
      descricao: data.descricao,
      membros: data.membros,
      proximaReuniao: data.proxima_reuniao,
      progresso: data.progresso,
      nivel: data.nivel,
      imagem: data.imagem,
      tags: data.tags,
      dataInicio: data.data_inicio,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Erro ao criar grupo de estudo:', error);
    return null;
  }
};

export const getGruposEstudoByUserId = async (userId: string): Promise<GrupoEstudoUsuario[]> => {
  try {
    const { data, error } = await supabase
      .from("grupos_estudo")
      .select("*")
      .eq("user_id", userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar grupos de estudo:', error);
      return [];
    }
    
    if (!data) return [];
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      nome: item.nome,
      topico: item.topico,
      disciplina: item.disciplina,
      descricao: item.descricao,
      membros: item.membros,
      proximaReuniao: item.proxima_reuniao,
      progresso: item.progresso,
      nivel: item.nivel,
      imagem: item.imagem,
      tags: item.tags,
      dataInicio: item.data_inicio,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Erro ao buscar grupos de estudo:', error);
    return [];
  }
};

export const updateGrupoEstudo = async (
  grupoId: string,
  grupoData: Partial<Omit<GrupoEstudoUsuario, "id" | "userId" | "createdAt">>
): Promise<GrupoEstudoUsuario | null> => {
  try {
    const updateData: any = {};
    
    if (grupoData.nome) updateData.nome = grupoData.nome;
    if (grupoData.topico) updateData.topico = grupoData.topico;
    if (grupoData.disciplina) updateData.disciplina = grupoData.disciplina;
    if (grupoData.descricao !== undefined) updateData.descricao = grupoData.descricao;
    if (grupoData.membros !== undefined) updateData.membros = grupoData.membros;
    if (grupoData.proximaReuniao !== undefined) updateData.proxima_reuniao = grupoData.proximaReuniao;
    if (grupoData.progresso !== undefined) updateData.progresso = grupoData.progresso;
    if (grupoData.nivel) updateData.nivel = grupoData.nivel;
    if (grupoData.imagem) updateData.imagem = grupoData.imagem;
    if (grupoData.tags !== undefined) updateData.tags = grupoData.tags;
    if (grupoData.dataInicio) updateData.data_inicio = grupoData.dataInicio;
    
    const { data, error } = await supabase
      .from("grupos_estudo")
      .update(updateData)
      .eq("id", grupoId)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar grupo de estudo:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      userId: data.user_id,
      nome: data.nome,
      topico: data.topico,
      disciplina: data.disciplina,
      descricao: data.descricao,
      membros: data.membros,
      proximaReuniao: data.proxima_reuniao,
      progresso: data.progresso,
      nivel: data.nivel,
      imagem: data.imagem,
      tags: data.tags,
      dataInicio: data.data_inicio,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Erro ao atualizar grupo de estudo:', error);
    return null;
  }
};

export const deleteGrupoEstudo = async (grupoId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("grupos_estudo")
      .delete()
      .eq("id", grupoId);
    
    if (error) {
      console.error('Erro ao excluir grupo de estudo:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir grupo de estudo:', error);
    return false;
  }
};

// Serviço para simular interações com o banco de dados

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

// Simulação de banco de dados local
let users: User[] = [
  {
    id: "current_user_id",
    name: "Usuário Atual",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current",
    balance: 150,
    expertBalance: 320,
  },
];

let requests: Request[] = [];
let responses: Response[] = [];
let messages: Message[] = [];
let feedbacks: Feedback[] = [];

// Funções auxiliares
const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Funções para usuários
export const getCurrentUser = (): User => {
  return users.find((user) => user.id === "current_user_id") || users[0];
};

export const updateUserBalance = (
  userId: string,
  amount: number,
): User | null => {
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    balance: users[userIndex].balance + amount,
  };

  return users[userIndex];
};

// Funções para pedidos
export const addRequest = (
  requestData: Omit<Request, "id" | "createdAt">,
): Request => {
  const newRequest = {
    ...requestData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  requests.push(newRequest);
  return newRequest;
};

export const getRequestById = (requestId: string): Request | null => {
  return requests.find((request) => request.id === requestId) || null;
};

export const updateRequestStatus = (
  requestId: string,
  status: Request["status"],
): Request | null => {
  const index = requests.findIndex((request) => request.id === requestId);
  if (index === -1) return null;

  requests[index] = {
    ...requests[index],
    status,
  };

  return requests[index];
};

// Funções para respostas
export const addResponse = (responseData: Omit<Response, "id">): Response => {
  const newResponse = {
    ...responseData,
    id: generateId(),
  };

  responses.push(newResponse);
  return newResponse;
};

export const getResponsesByRequestId = (requestId: string): Response[] => {
  return responses.filter((response) => response.requestId === requestId);
};

export const getResponsesByExpertId = (expertId: string): Response[] => {
  return responses.filter((response) => response.expertId === expertId);
};

export const acceptResponse = (responseId: string): Response | null => {
  const index = responses.findIndex((response) => response.id === responseId);
  if (index === -1) return null;

  // Atualizar status da resposta
  responses[index] = {
    ...responses[index],
    status: "accepted",
  };

  // Atualizar status do pedido
  const requestId = responses[index].requestId;
  updateRequestStatus(requestId, "respondido");

  // Debitar o valor da conta do usuário
  const currentUser = getCurrentUser();
  updateUserBalance(currentUser.id, -responses[index].price);

  return responses[index];
};

// Funções para mensagens
export const addMessage = (
  messageData: Omit<Message, "id" | "timestamp" | "read">,
): Message => {
  const newMessage = {
    ...messageData,
    id: generateId(),
    timestamp: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);
  return newMessage;
};

export const getMessagesByRequestId = (requestId: string): Message[] => {
  return messages.filter((message) => message.requestId === requestId);
};

// Funções para feedback
export const addFeedback = (
  feedbackData: Omit<Feedback, "id" | "timestamp">,
): Feedback => {
  const newFeedback = {
    ...feedbackData,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  feedbacks.push(newFeedback);
  return newFeedback;
};

export const getFeedbacksByResponseId = (responseId: string): Feedback[] => {
  return feedbacks.filter((feedback) => feedback.responseId === responseId);
};

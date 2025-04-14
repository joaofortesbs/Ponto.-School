// Serviço para gerenciar respostas e propostas

// Tipos para as respostas
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

// Simulação de banco de dados local
let responses: Response[] = [];

// Gerar ID único
const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Adicionar uma nova resposta
export const addResponse = (responseData: Omit<Response, "id">): Response => {
  const newResponse = {
    ...responseData,
    id: generateId(),
  };

  responses.push(newResponse);
  console.log("Resposta adicionada:", newResponse);
  return newResponse;
};

// Obter todas as respostas para um pedido específico
export const getResponsesByRequestId = (requestId: string): Response[] => {
  return responses.filter((response) => response.requestId === requestId);
};

// Obter todas as propostas feitas por um expert
export const getResponsesByExpertId = (expertId: string): Response[] => {
  return responses.filter((response) => response.expertId === expertId);
};

// Atualizar o status de uma resposta
export const updateResponseStatus = (
  responseId: string,
  status: "pending" | "accepted" | "rejected",
): Response | null => {
  const index = responses.findIndex((response) => response.id === responseId);

  if (index === -1) return null;

  responses[index] = {
    ...responses[index],
    status,
  };

  return responses[index];
};

// Aceitar uma proposta de expert
export const acceptExpertProposal = (responseId: string): Response | null => {
  return updateResponseStatus(responseId, "accepted");
};

// Rejeitar uma proposta de expert
export const rejectExpertProposal = (responseId: string): Response | null => {
  return updateResponseStatus(responseId, "rejected");
};

// Import typing control from aiChatService (assuming this file exists)
import { setPauseTyping, setCancelTyping } from './aiChatService';

// Function to generate a response for a given prompt
export const generateResponseForPrompt = async (
  prompt: string,
  options?: {
    intelligenceLevel?: 'basic' | 'normal' | 'advanced';
    languageStyle?: 'casual' | 'formal' | 'technical';
  }
): Promise<string> => {
  // Default response configuration
  const defaultOptions = {
    intelligenceLevel: 'normal',
    languageStyle: 'casual'
  };

  // Merge options with defaults
  const config = { ...defaultOptions, ...options };

  // For development/testing, simulate a delay based on prompt length
  const responseDelay = Math.min(2000, 500 + prompt.length * 5);
  await new Promise(resolve => setTimeout(resolve, responseDelay));

  // Generate different responses based on intelligence level
  let response = '';

  // Check if typing has been canceled
  if ((window as any).isTypingCancelled) {
    setCancelTyping(false);
    return "Resposta cancelada pelo usuário.";
  }

  // Wait for resume if paused
  while ((window as any).isTypingPaused) {
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check again if typing has been canceled while paused
    if ((window as any).isTypingCancelled) {
      setCancelTyping(false);
      return "Resposta cancelada pelo usuário.";
    }
  }

  if (config.intelligenceLevel === 'basic') {
    response = getBasicResponse(prompt);
  } else if (config.intelligenceLevel === 'advanced') {
    response = getAdvancedResponse(prompt, config.languageStyle);
  } else {
    // Normal intelligence level
    response = getNormalResponse(prompt, config.languageStyle);
  }

  return response;
};


// Placeholder functions -  These need actual implementations
const getBasicResponse = (prompt: string): string => {
  return `Basic response to: ${prompt}`;
};

const getNormalResponse = (prompt: string, style: string): string => {
  return `Normal ${style} response to: ${prompt}`;
};

const getAdvancedResponse = (prompt: string, style: string): string => {
  return `Advanced ${style} response to: ${prompt}`;
};
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

/**
 * Response service for processing and enhancing AI responses
 */

/**
 * Formats a message with rich styling
 * @param message Raw message text
 * @returns Formatted message with styling
 */
export const formatResponse = (message: string): string => {
  let formattedResponse = message;

  // Apply some basic formatting to the response
  formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedResponse = formattedResponse.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold mb-2 text-[#FF6B00]">$1</h1>');
  formattedResponse = formattedResponse.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold mb-2 text-[#FF6B00]">$1</h2>');
  formattedResponse = formattedResponse.replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold mb-2 text-[#FF6B00]">$1</h3>');

  // Format lists
  formattedResponse = formattedResponse.replace(/^\- (.*?)$/gm, '<li class="ml-4">• $1</li>');
  formattedResponse = formattedResponse.replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4"><span class="font-bold text-[#FF6B00]">$1.</span> $2</li>');

  return formattedResponse;
};

/**
 * Enhances a response with platform-specific recommendations
 * @param message Original response
 * @returns Enhanced response with platform-specific content
 */
export const enhanceWithPlatformSpecific = (message: string): string => {
  // This could be expanded with more sophisticated logic in the future
  return message;
};

export default {
  formatResponse,
  enhanceWithPlatformSpecific
};
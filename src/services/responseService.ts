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

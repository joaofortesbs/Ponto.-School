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
import { generateAIResponse } from "./aiChatService";

// Interface para controle de resposta
export interface ResponseControlOptions {
  onProgress?: (text: string) => void;
  onComplete?: (text: string) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

let isTypingCancelled = false;
let isTypingPaused = false;

/**
 * Função para gerar uma resposta da IA com controle de pausar e cancelar
 */
export const generateControlledResponse = async (
  message: string,
  sessionId: string,
  options?: {
    intelligenceLevel?: 'basic' | 'normal' | 'advanced';
    languageStyle?: 'casual' | 'formal' | 'technical';
  },
  controlOptions?: ResponseControlOptions
) => {
  // Resetar estados de controle
  isTypingCancelled = false;
  isTypingPaused = false;
  
  try {
    // Obter a resposta completa primeiro
    const fullResponse = await generateAIResponse(
      message,
      sessionId,
      options
    );
    
    // Se foi cancelado antes mesmo de receber a resposta
    if (isTypingCancelled) {
      controlOptions?.onCancel?.();
      return "";
    }
    
    // Simular a digitação gradual com controle
    let displayedContent = '';
    const words = fullResponse.split(' ');
    
    // Processar palavra por palavra
    for (let i = 0; i < words.length; i++) {
      // Verificar se foi cancelado
      if (isTypingCancelled) {
        controlOptions?.onCancel?.();
        return displayedContent;
      }
      
      // Verificar se está pausado
      if (isTypingPaused) {
        // Aguardar até ser retomado
        await new Promise<void>((resolve) => {
          const checkResume = () => {
            if (!isTypingPaused || isTypingCancelled) {
              resolve();
            } else {
              setTimeout(checkResume, 100);
            }
          };
          
          checkResume();
        });
        
        // Se foi cancelado durante a pausa
        if (isTypingCancelled) {
          controlOptions?.onCancel?.();
          return displayedContent;
        }
      }
      
      // Adicionar próxima palavra
      displayedContent += (i === 0 ? '' : ' ') + words[i];
      
      // Notificar progresso
      controlOptions?.onProgress?.(displayedContent);
      
      // Velocidade variável da digitação baseada no tamanho da palavra
      const typingSpeed = Math.min(100, Math.max(30, 70 - words[i].length * 5));
      await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }
    
    // Notificar conclusão
    controlOptions?.onComplete?.(displayedContent);
    return displayedContent;
    
  } catch (error) {
    controlOptions?.onError?.(error);
    throw error;
  }
};

// Funções de controle para exportação
export const cancelResponse = () => {
  isTypingCancelled = true;
};

export const pauseResponse = () => {
  isTypingPaused = true;
};

export const resumeResponse = () => {
  isTypingPaused = false;
};

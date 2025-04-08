import { supabase } from '@/lib/supabase';

// Tipos para as mensagens
export interface IAMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface IAConversation {
  id: string;
  title: string;
  messages: IAMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Configuração da API do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDaMGN00DG-3KHgV9b7Fm_SHGvfruuMdgM'; // Use a chave de ambiente se disponível
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Serviço principal
const epictusIAService = {
  // Gerar uma resposta utilizando a API do Gemini
  async getResponse(question: string): Promise<string> {
    try {
      // Preparar o corpo da requisição para a API do Gemini
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Você é o Epictus IA, um assistente de estudos para estudantes. 
                Responda a seguinte pergunta de forma educativa, clara e concisa: ${question}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      // Fazer a requisição para a API do Gemini
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta da API Gemini:', errorData);
        throw new Error(`Erro na API: ${response.status}`);
      }

      // Processar a resposta
      const data = await response.json();

      // Extrair o texto da resposta
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Formato de resposta inesperado:', data);
        throw new Error('Formato de resposta inesperado');
      }
    } catch (error) {
      console.error('Erro ao obter resposta do Gemini:', error);

      // Retornar uma mensagem de erro amigável em caso de falha
      return "Desculpe, estou enfrentando dificuldades para processar sua solicitação no momento. Por favor, tente novamente em alguns instantes.";
    }
  },

  // Salvar conversa no banco de dados (caso implementemos integração com Supabase)
  async saveConversation(userId: string, conversation: IAConversation): Promise<boolean> {
    try {
      // Aqui você pode implementar a lógica para salvar no Supabase
      // Por enquanto, apenas retornamos sucesso
      return true;
    } catch (error) {
      console.error('Erro ao salvar conversa:', error);
      return false;
    }
  },

  // Obter conversas do usuário do banco de dados
  async getUserConversations(userId: string): Promise<IAConversation[]> {
    try {
      // Aqui você pode implementar a lógica para buscar do Supabase
      // Por enquanto, retornamos um array vazio
      return [];
    } catch (error) {
      console.error('Erro ao obter conversas:', error);
      return [];
    }
  }
};

export default epictusIAService;
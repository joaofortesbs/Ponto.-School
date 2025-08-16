
import { useState, useRef } from "react";
import { generateAIResponse } from "@/services/aiChatService";

interface MessageFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  files?: MessageFile[];
  feedback?: 'positive' | 'negative';
  needsImprovement?: boolean;
  isEdited?: boolean;
}

const defaultMessages: ChatMessage[] = [
  {
    id: 1,
    content: "Oi! Sou o Assistente de Suporte da Ponto.School! 😊 Estou aqui para te ajudar com navegação na plataforma, dúvidas sobre funcionalidades, e também posso responder perguntas sobre conteúdos educacionais. Como posso te auxiliar hoje?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

export const useChatMessages = (sessionId: string, toast: any) => {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (inputMessage.trim() === "" && selectedFiles.length === 0) return;

    // Criar uma mensagem combinada com texto e informações sobre arquivos anexados
    let fullMessage = inputMessage.trim();

    // Se houver arquivos selecionados, adicionar informações sobre eles à mensagem
    if (selectedFiles.length > 0) {
      const fileInfos = selectedFiles.map(file => 
        `- ${file.name} (${(file.size / 1024).toFixed(2)} KB, tipo: ${file.type})`
      ).join('\n');

      if (fullMessage) {
        fullMessage += `\n\nArquivos anexados:\n${fileInfos}`;
      } else {
        fullMessage = `Arquivos anexados:\n${fileInfos}`;
      }
    }

    // Criar um objeto para a mensagem do usuário que inclui arquivos
    const userMessage: ChatMessage = {
      id: Date.now(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      files: selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(
        fullMessage,
        sessionId || 'default_session',
        {
          intelligenceLevel: 'normal',
          languageStyle: 'casual'
        }
      );

      // Criar ID único para a nova mensagem
      const messageId = Date.now() + 1;

      // Adicionar mensagem da IA
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: messageId, 
          content: aiResponse, 
          sender: 'assistant', 
          timestamp: new Date() 
        }
      ]);

      setIsTyping(false);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: Date.now() + 1, 
          content: 'Desculpe, estou enfrentando problemas no momento. Por favor, tente novamente mais tarde.', 
          sender: 'assistant', 
          timestamp: new Date() 
        }
      ]);
      setIsTyping(false);
    }
  };

  const handleMessageFeedback = (messageId: number, feedback: 'positive' | 'negative') => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, feedback };
        }
        return msg;
      });
    });
  };

  const reformulateMessage = async (messageId: number) => {
    try {
      const messageToReformulate = messages.find(msg => msg.id === messageId);
      if (!messageToReformulate) return;

      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, needsImprovement: true };
          }
          return msg;
        });
      });

      const reformulatedResponse = await generateAIResponse(
        `Reformule a seguinte resposta de forma mais detalhada e completa: "${messageToReformulate.content}"`,
        sessionId || 'default_session',
        {
          intelligenceLevel: 'advanced',
          languageStyle: 'formal'
        }
      );

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          content: reformulatedResponse,
          sender: 'assistant',
          timestamp: new Date(),
          feedback: undefined
        }
      ]);

    } catch (error) {
      console.error('Erro ao reformular resposta:', error);
      toast({
        title: "Erro ao reformular resposta",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const summarizeMessage = async (messageId: number) => {
    try {
      const messageToSummarize = messages.find(msg => msg.id === messageId);
      if (!messageToSummarize) return;

      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, needsImprovement: true };
          }
          return msg;
        });
      });

      const summarizedResponse = await generateAIResponse(
        `Resuma a seguinte resposta de forma concisa e direta: "${messageToSummarize.content}"`,
        sessionId || 'default_session',
        {
          intelligenceLevel: 'normal',
          languageStyle: 'casual'
        }
      );

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          content: summarizedResponse,
          sender: 'assistant',
          timestamp: new Date(),
          feedback: undefined
        }
      ]);

    } catch (error) {
      console.error('Erro ao resumir resposta:', error);
      toast({
        title: "Erro ao resumir resposta",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return {
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    inputMessage,
    setInputMessage,
    selectedFiles,
    setSelectedFiles,
    isLoading,
    setIsLoading,
    sendMessage,
    handleMessageFeedback,
    reformulateMessage,
    summarizeMessage
  };
};

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Brain, Send, User, ThumbsUp, ThumbsDown, Copy, Sparkles } from "lucide-react";
import epictusIAService, { IAMessage } from "@/services/epictusIAService";
import { v4 as uuidv4 } from 'uuid';

export default function ChatEpictus() {
  const { theme } = useTheme();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<IAMessage[]>([
    {
      id: uuidv4(),
      content: "Olá! Sou o Chat Epictus, seu assistente de conhecimento. Como posso ajudar você hoje?",
      role: "assistant",
      createdAt: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Scroll para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadedFiles(Array.from(e.target.files || []));
  };


  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    // Adicionar mensagem do usuário
    const userMessage: IAMessage = {
      id: uuidv4(),
      content: inputMessage,
      role: "user",
      createdAt: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })) : undefined
    };

    // Salvar a mensagem atual para enviar para API
    const currentMessage = inputMessage;
    let messageWithFiles = currentMessage;

    if (uploadedFiles.length > 0) {
      messageWithFiles +=  messageWithFiles ? `\n\n` : '';
      messageWithFiles += `Analisar os arquivos anexados (${uploadedFiles.length}):`;
      uploadedFiles.forEach((file, index) => {
        messageWithFiles += `\n${index + 1}. ${file.name} (${file.type})`;
      });
    }

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setUploadedFiles([]);
    setIsTyping(true);

    try {
      // Buscar resposta da IA usando a API do Gemini
      const aiResponse = await generateAIResponse(messageWithFiles); // Placeholder function

      // Adicionar resposta da IA
      const assistantMessage: IAMessage = {
        id: uuidv4(),
        content: aiResponse,
        role: "assistant",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao obter resposta da IA:", error);

      // Mensagem de erro caso falhe
      const errorMessage: IAMessage = {
        id: uuidv4(),
        content: "Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente em alguns instantes.",
        role: "assistant",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      // Focar no input após enviar a mensagem
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Função para formatar a data da mensagem
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Função para copiar o texto da mensagem
  const copyMessageToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui poderia adicionar um toast para feedback
  };

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          theme === "dark" ? "border-gray-800 bg-[#0A2540]" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2
              className={`font-medium ${
                theme === "dark" ? "text-white" : "text-[#29335C]"
              } flex items-center gap-2`}
            >
              Chat Epictus
              <Badge className="bg-[#FF6B00] text-white text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Gemini
              </Badge>
            </h2>
            <p
              className={`text-xs ${
                theme === "dark" ? "text-white/60" : "text-[#64748B]"
              }`}
            >
              Pergunte o que quiser e receba respostas instantâneas
            </p>
          </div>
        </div>
        <input type="file" multiple onChange={handleFileChange} style={{display: 'none'}} id="fileInput"/>
        <label htmlFor="fileInput" style={{cursor: 'pointer'}}>
          <Button>Enviar Arquivo</Button>
        </label>
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                } items-start gap-2`}
              >
                {message.role === "assistant" ? (
                  <Avatar className="mt-0.5 h-8 w-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white">
                    <Brain className="h-4 w-4" />
                  </Avatar>
                ) : (
                  <Avatar className="mt-0.5 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Sparkles className="h-4 w-4" />
                  </Avatar>
                )}

                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.role === "user"
                      ? `${
                          theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-[#29335C]"
                        }`
                      : `${
                          theme === "dark"
                            ? "bg-[#29335C]/60 text-white"
                            : "bg-gray-100 text-[#29335C]"
                        }`
                  }`}
                >
                  {message.content}
                  {message.files && (
                    <ul>
                      {message.files.map((file, index) => (
                        <li key={index}>{file.name} ({file.type}, {file.size} bytes)</li>
                      ))}
                    </ul>
                  )}
                  {message.role === "assistant" && (
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* A caixa de entrada de mensagens foi removida */}
    </div>
  );
}

// Placeholder for the actual AI response generation function
const generateAIResponse = async (message: string): Promise<string> => {
  // Replace this with your actual AI service call
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  return "Aqui está a resposta da IA para sua mensagem: " + message;
};
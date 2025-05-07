import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Brain, Send, User, ThumbsUp, ThumbsDown, Copy, Sparkles, File, Image, Video, Music, Download } from "lucide-react";
import epictusIAService, { IAMessage, ProcessedFile } from "@/services/epictusIAService";
import { v4 as uuidv4 } from 'uuid';
import EpictusMessageBox from "./message-box/EpictusMessageBox";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if ((inputMessage.trim() === "" && selectedFiles.length === 0) || isTyping) return;

    // Processar arquivos para criar URLs
    const processedFiles = selectedFiles.map(file => {
      // Criar objeto URL para cada arquivo
      const url = URL.createObjectURL(file);
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: url,
        lastModified: file.lastModified
      };
    });

    // Adicionar mensagem do usuário
    const userMessage: IAMessage = {
      id: uuidv4(),
      content: inputMessage,
      role: "user",
      createdAt: new Date(),
      files: processedFiles,
    };

    // Salvar a mensagem atual para enviar para API
    let currentMessage = inputMessage;
    if (selectedFiles.length > 0) {
      const filesList = selectedFiles.map(file => `- ${file.name} (${file.type})`).join('\n');
      currentMessage += `\n\nArquivos anexados:\n${filesList}`;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setSelectedFiles([]);
    setIsTyping(true);

    try {
      // Buscar resposta da IA usando a API do Gemini
      const aiResponse = await epictusIAService.getResponse(currentMessage);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...filesArray]);
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
        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple style={{ display: 'none' }} />
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
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Arquivos anexados:</p>
                      {message.files.map((file, index) => (
                        <div key={index} className="flex items-center p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <div className="flex-shrink-0 mr-2 w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                            {file.type?.startsWith('image/') ? (
                              <Image className="h-4 w-4 text-blue-300" />
                            ) : file.type?.startsWith('video/') ? (
                              <Video className="h-4 w-4 text-purple-300" />
                            ) : file.type?.startsWith('audio/') ? (
                              <Music className="h-4 w-4 text-green-300" />
                            ) : (
                              <File className="h-4 w-4 text-amber-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a 
                              href={file.url || URL.createObjectURL(file)} 
                              download={file.name} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
                            >
                              {file.name}
                            </a>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* Área de input com EpictusMessageBox */}
      <div className="p-4 border-t">
        <EpictusMessageBox
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          isTyping={isTyping}
          charCount={inputMessage.length}
          MAX_CHARS={500}
          handleKeyDown={handleKeyDown}
          handleButtonClick={() => {}}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />
      </div>
    </div>
  );
}
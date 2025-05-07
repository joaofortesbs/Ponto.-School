import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Brain, Send, User, ThumbsUp, ThumbsDown, Copy, Sparkles, FileText, X, Plus, Loader2 } from "lucide-react";
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

    // Processar arquivos para criar URLs e garantir que sejam acessíveis
    const processedFiles = selectedFiles.map(file => ({
      ...file,
      url: URL.createObjectURL(file),
      size: file.size,
      name: file.name,
      type: file.type
    }));

    // Adicionar mensagem do usuário com os arquivos
    const userMessage: IAMessage = {
      id: uuidv4(),
      content: inputMessage,
      role: "user",
      createdAt: new Date(),
      files: processedFiles,
    };

    // Preparar os conteúdos de arquivo para análise da IA
    // Em uma implementação completa, seria necessário ler o conteúdo dos arquivos
    // ou processá-los para extração de texto/dados
    let currentMessage = inputMessage;
    if (selectedFiles.length > 0) {
      // Adicionar informações detalhadas dos arquivos
      const filesList = selectedFiles.map(file => {
        return `- ${file.name} (Tipo: ${file.type}, Tamanho: ${(file.size / 1024).toFixed(2)} KB)`;
      }).join('\n');
      
      currentMessage += `\n\nArquivos anexados:\n${filesList}`;
      
      // Adicionar indicação de que arquivos foram incluídos para a IA processar
      currentMessage += `\n\nObs: Estes arquivos foram anexados à conversa. Por favor, considere-os na sua resposta.`;
    }

    // Adicionar mensagem do usuário ao histórico de mensagens
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    
    // Armazenar os arquivos para processamento
    const filesToProcess = [...selectedFiles];
    
    // Limpar arquivos selecionados após armazenar a cópia
    setSelectedFiles([]);
    setIsTyping(true);

    try {
      // Preparar os dados para envio
      // Criar objetos de arquivo processados para enviar para o serviço
      const processedFilesForAPI = processedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url
      }));
      
      // Enviar a mensagem com os arquivos para a API
      const aiResponse = await epictusIAService.getResponse(currentMessage, processedFilesForAPI);

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
                    <div className="mt-2 space-y-2">
                      <p className="text-xs font-medium opacity-70">Arquivos anexados:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.files.map((file, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20"
                          >
                            <FileText className="h-3 w-3" />
                            <a 
                              href={file.url || URL.createObjectURL(file)} 
                              download={file.name} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs hover:underline truncate max-w-[120px]"
                            >
                              {file.name}
                            </a>
                          </div>
                        ))}
                      </div>
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

      {/* Input area com suporte a arquivos */}
      <div className="p-4 border-t">
        <div className="flex flex-col gap-2">
          {/* Área de visualização dos arquivos selecionados */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border border-blue-500/20 rounded-lg bg-blue-500/10">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-1 bg-blue-500/20 rounded-lg px-2 py-1 text-xs"
                >
                  <div className="flex-shrink-0 w-4 h-4 bg-blue-500/30 rounded-full flex items-center justify-center">
                    <FileText size={10} className="text-blue-300" />
                  </div>
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:text-red-500"
                    onClick={() => {
                      const newFiles = [...selectedFiles];
                      newFiles.splice(index, 1);
                      setSelectedFiles(newFiles);
                    }}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Caixa de mensagem e botões */}
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Input
                placeholder="Digite sua mensagem..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                multiple 
                className="hidden" 
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={16} className="text-blue-500" />
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={isTyping}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send size={16} className="mr-2" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
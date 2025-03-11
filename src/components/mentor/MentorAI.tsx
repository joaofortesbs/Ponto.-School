import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Send,
  Clock,
  Lightbulb,
  BookOpen,
  FileText,
  Star,
  History,
  Bookmark,
  MessageSquare,
  Zap,
  HelpCircle,
  Rocket,
  Award,
  Search,
  Plus,
  Settings,
  Paperclip,
  Mic,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const MentorAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou o Mentor IA da Ponto.School. Como posso ajudar você hoje? Posso responder dúvidas sobre matérias, explicar conceitos ou ajudar com exercícios.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponses = [
        "Excelente pergunta! Vamos explorar esse conceito em detalhes. A ideia principal é que...",
        "Essa é uma dúvida comum. Para resolver esse tipo de problema, você precisa seguir estes passos...",
        "Posso explicar isso de forma simples. Pense no seguinte exemplo prático...",
        "Vamos dividir esse problema em partes menores para facilitar a compreensão...",
        "Esse é um tópico fascinante! Na ciência moderna, entendemos que...",
      ];

      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const suggestedQuestions = [
    "Como resolver equações diferenciais?",
    "Explique o princípio da incerteza de Heisenberg",
    "O que é fotossíntese e como funciona?",
  ];

  const relatedMaterials = [
    {
      title: "Guia de Cálculo Diferencial",
      type: "PDF",
      subject: "Matemática",
    },
    {
      title: "Física Quântica para Iniciantes",
      type: "Livro",
      subject: "Física",
    },
    { title: "Biologia Celular - Aula 3", type: "Vídeo", subject: "Biologia" },
  ];

  const recentConversations = [
    {
      title: "Equações Diferenciais",
      date: "Hoje, 10:30",
      subject: "Matemática",
    },
    { title: "Mecânica Quântica", date: "Ontem, 15:45", subject: "Física" },
    { title: "Genética Molecular", date: "20/06/2024", subject: "Biologia" },
  ];

  const aiCapabilities = [
    {
      title: "Resolução de Problemas",
      description: "Ajuda com exercícios e problemas matemáticos",
      icon: <Zap className="h-4 w-4 text-[#00FFFF]" />,
    },
    {
      title: "Explicação de Conceitos",
      description: "Explicações claras sobre temas complexos",
      icon: <Lightbulb className="h-4 w-4 text-[#00FFFF]" />,
    },
    {
      title: "Revisão de Conteúdo",
      description: "Resumos e revisões de matérias",
      icon: <BookOpen className="h-4 w-4 text-[#00FFFF]" />,
    },
    {
      title: "Preparação para Provas",
      description: "Dicas e estratégias para exames",
      icon: <Award className="h-4 w-4 text-[#00FFFF]" />,
    },
  ];

  return (
    <div className="flex h-full bg-[#F8F9FA] dark:bg-[#121212] text-[#29335C] dark:text-white overflow-hidden">
      {/* Left Column - Chat */}
      <div className="w-[30%] p-4 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Mentor IA</h2>
            <p className="text-sm text-muted-foreground">
              Seu assistente de estudos
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-[#E0E1DD] dark:border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-[#29335C] dark:text-white">
                  Mentor IA
                </h2>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Online
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${message.sender === "user" ? "bg-[#29335C] text-white" : "bg-[#E0E1DD]/30 dark:bg-[#1E293B] text-[#29335C] dark:text-white"}`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="text-xs opacity-70 mt-1 text-right flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {message.sender === "user" && (
                      <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                        <Avatar>
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
                          <Brain className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="max-w-[80%] rounded-lg px-4 py-3 bg-[#E0E1DD]/30 dark:bg-[#1E293B] text-[#29335C] dark:text-white">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#00FFFF] animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-[#00FFFF] animate-pulse delay-150" />
                        <div className="w-2 h-2 rounded-full bg-[#00FFFF] animate-pulse delay-300" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-[#E0E1DD] dark:border-white/10">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-[#778DA9]">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua dúvida ou pergunta..."
                  className="flex-1 bg-[#E0E1DD]/20 dark:bg-[#29335C]/20 border-[#E0E1DD] dark:border-[#29335C]/50"
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button variant="ghost" size="icon" className="text-[#778DA9]">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  className="bg-[#29335C] hover:bg-[#29335C]/90 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-[#64748B] dark:text-white/60 text-center">
                O Mentor IA está em constante aprendizado. Para melhores
                resultados, faça perguntas claras e específicas.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Tools */}
      <div className="w-[70%] border-l h-full flex flex-col">
        <div className="border-b p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Recursos
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <TabsContent value="chat" className="h-full m-0">
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-[#29335C] to-[#001427] rounded-xl text-white">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Olá, João Silva!</h2>
                  <p className="text-white/80">
                    Bem-vindo ao seu Mentor IA. Como posso ajudar você hoje?
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <p className="text-xs text-white/80">
                      Online - Pronto para ajudar
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Capacidades do Mentor IA
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {aiCapabilities.map((capability, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-[#29335C]/50 flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 flex items-center justify-center">
                        {capability.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{capability.title}</h4>
                        <p className="text-sm text-[#64748B] dark:text-white/60">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Sugestões de Perguntas
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 border-[#E0E1DD] dark:border-[#29335C]/50 hover:bg-[#E0E1DD]/20 dark:hover:bg-[#29335C]/20"
                      onClick={() => {
                        setInputMessage(question);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                    >
                      <Lightbulb className="h-4 w-4 mr-2 text-[#00FFFF]" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="h-full m-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Materiais Relacionados</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar materiais..."
                    className="pl-9 w-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {relatedMaterials.map((material, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-[#29335C]/50 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-[#778DA9]" />
                      </div>
                      <div>
                        <h4 className="font-medium">{material.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{material.subject}</Badge>
                          <Badge>{material.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Bookmark className="h-4 w-4" /> Salvar
                      </Button>
                      <Button size="sm" className="gap-1 bg-[#29335C]">
                        Abrir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Ver Mais Materiais
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="h-full m-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Histórico de Conversas</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar no histórico..."
                    className="pl-9 w-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {recentConversations.map((conversation, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-[#29335C]/50 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-[#778DA9]" />
                      </div>
                      <div>
                        <h4 className="font-medium">{conversation.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {conversation.subject}
                          </Badge>
                          <span className="text-xs text-[#64748B] dark:text-white/60">
                            {conversation.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="gap-1 bg-[#29335C]">
                      Continuar
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button variant="outline" className="gap-2">
                  <History className="h-4 w-4" /> Ver Histórico Completo
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default MentorAI;

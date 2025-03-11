import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Send,
  Clock,
  Sparkles,
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
  Moon,
  Sun,
  Globe,
  ChevronRight,
  PenTool,
  Timer,
  Languages,
  Compass,
  BarChart,
  Calendar,
  CheckCircle,
  Paperclip,
  Mic,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
}

interface RecommendedContent {
  id: string;
  title: string;
  type: string;
  subject: string;
  reason: string;
  rating?: number;
  action: string;
}

export default function SchoolIAInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou o School IA da Ponto.School. Como posso ajudar você hoje? Posso responder dúvidas sobre matérias, explicar conceitos ou ajudar com exercícios.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
    "Quais são as principais características do Modernismo?",
    "Como calcular a derivada de uma função composta?",
    "Explique a Lei de Coulomb e suas aplicações",
  ];

  const tools: Tool[] = [
    {
      id: "mapas-mentais",
      title: "Mapas Mentais",
      description:
        "Crie mapas mentais interativos para organizar e visualizar ideias.",
      icon: <Lightbulb className="h-8 w-8 text-[#778DA9]" />,
      action: "Criar Mapa Mental",
    },
    {
      id: "resumos",
      title: "Resumos Inteligentes",
      description: "Resuma textos, vídeos (YouTube) e PDFs em segundos.",
      icon: <FileText className="h-8 w-8 text-[#778DA9]" />,
      action: "Resumir",
    },
    {
      id: "escrita",
      title: "Assistente de Escrita",
      description:
        "Melhore sua escrita com sugestões de gramática, estilo e vocabulário.",
      icon: <PenTool className="h-8 w-8 text-[#778DA9]" />,
      action: "Escrever",
    },
    {
      id: "exercicios",
      title: "Gerador de Exercícios",
      description:
        "Crie exercícios personalizados para testar seus conhecimentos.",
      icon: <FileText className="h-8 w-8 text-[#778DA9]" />,
      action: "Gerar Exercícios",
    },
    {
      id: "simulador",
      title: "Simulador de Provas",
      description: "Prepare-se para as provas com simulados realistas.",
      icon: <Timer className="h-8 w-8 text-[#778DA9]" />,
      action: "Simular Prova",
    },
    {
      id: "tradutor",
      title: "Tradutor",
      description: "Traduza textos, documentos, áudios e vídeos em tempo real.",
      icon: <Languages className="h-8 w-8 text-[#778DA9]" />,
      action: "Traduzir",
    },
    {
      id: "exploracao",
      title: "Modo Exploração",
      description: "Mergulhe em um tema com o guia do School IA.",
      icon: <Compass className="h-8 w-8 text-[#778DA9]" />,
      action: "Explorar",
    },
    {
      id: "desempenho",
      title: "Desempenho do Aluno",
      description: "Analise seu progresso e identifique áreas para melhorar.",
      icon: <BarChart className="h-8 w-8 text-[#778DA9]" />,
      action: "Analisar",
    },
  ];

  const recommendedContent: RecommendedContent[] = [
    {
      id: "1",
      title: "Cálculo Diferencial - Módulo Avançado",
      type: "Curso",
      subject: "Matemática",
      reason: "Baseado no seu interesse em equações diferenciais",
      rating: 4.8,
      action: "Assistir",
    },
    {
      id: "2",
      title: "Física Quântica para Iniciantes",
      type: "E-book",
      subject: "Física",
      reason: "Complementa seus estudos recentes",
      rating: 4.5,
      action: "Ler",
    },
    {
      id: "3",
      title: "Grupo de Estudos - Matemática Avançada",
      type: "Grupo",
      subject: "Matemática",
      reason: "Conecte-se com outros estudantes de cálculo",
      action: "Participar",
    },
    {
      id: "4",
      title: "Revisão para a Prova de Física",
      type: "Atividade",
      subject: "Física",
      reason: "Sua prova está agendada para a próxima semana",
      action: "Revisar",
    },
  ];

  const aiCapabilities = [
    {
      title: "Resolução de Problemas",
      description: "Ajuda com exercícios e problemas matemáticos",
      icon: <Zap className="h-5 w-5 text-[#00FFFF]" />,
    },
    {
      title: "Explicação de Conceitos",
      description: "Explicações claras sobre temas complexos",
      icon: <Lightbulb className="h-5 w-5 text-[#00FFFF]" />,
    },
    {
      title: "Revisão de Conteúdo",
      description: "Resumos e revisões de matérias",
      icon: <BookOpen className="h-5 w-5 text-[#00FFFF]" />,
    },
    {
      title: "Preparação para Provas",
      description: "Dicas e estratégias para exames",
      icon: <Award className="h-5 w-5 text-[#00FFFF]" />,
    },
  ];

  const studyPlan = [
    {
      id: "1",
      task: "Estudar Cálculo Diferencial - Cap. 3",
      date: "Hoje, 14:00",
      status: "pendente",
      subject: "Matemática",
    },
    {
      id: "2",
      task: "Resolver exercícios de Física Quântica",
      date: "Hoje, 16:30",
      status: "pendente",
      subject: "Física",
    },
    {
      id: "3",
      task: "Revisar anotações de Química Orgânica",
      date: "Amanhã, 10:00",
      status: "pendente",
      subject: "Química",
    },
    {
      id: "4",
      task: "Preparar apresentação de Biologia",
      date: "25/06/2024, 09:00",
      status: "pendente",
      subject: "Biologia",
    },
  ];

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#00FFFF]" /> School IA
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Seu assistente de estudos pessoal com inteligência artificial
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Avançado
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
        {/* Coluna Esquerda - Chat */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex-1 flex flex-col bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-[#E0E1DD] dark:border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-[#29335C] dark:text-white">
                  School IA
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
                O School IA está em constante aprendizado. Para melhores
                resultados, faça perguntas claras e específicas.
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4">
            <h3 className="text-sm font-medium text-[#29335C] dark:text-white mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#00FFFF]" /> Sugestões de
              perguntas
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2 text-xs border-[#E0E1DD] dark:border-[#29335C]/50 hover:bg-[#E0E1DD]/20 dark:hover:bg-[#29335C]/20"
                  onClick={() => {
                    setInputMessage(question);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita - Conteúdo Dinâmico */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4">
            <div className="flex justify-between items-center mb-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="bg-[#E0E1DD]/30 dark:bg-[#29335C]/20">
                  <TabsTrigger
                    value="visao-geral"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                  >
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger
                    value="recomendacoes"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                  >
                    Recomendações
                  </TabsTrigger>
                  <TabsTrigger
                    value="plano-estudos"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                  >
                    Plano de Estudos
                  </TabsTrigger>
                  <TabsTrigger
                    value="ferramentas"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                  >
                    Ferramentas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 ml-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 h-4 w-4" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-9 w-40 h-9 bg-[#E0E1DD]/20 dark:bg-[#29335C]/20 border-[#E0E1DD] dark:border-[#29335C]/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-[#E0E1DD] dark:border-[#29335C]/50"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <TabsContent value="visao-geral" className="mt-0">
                <div className="space-y-6">
                  {/* Saudação e Avatar */}
                  <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-[#29335C] to-[#001427] rounded-xl text-white">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Olá, João Silva!</h2>
                      <p className="text-white/80">
                        Bem-vindo ao seu School IA. Como posso ajudar você hoje?
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <p className="text-xs text-white/80">
                          Online - Pronto para ajudar
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sugestões de Ações */}
                  <div>
                    <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
                      Sugestões de Ações
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tools.slice(0, 6).map((tool) => (
                        <div
                          key={tool.id}
                          className="bg-white dark:bg-[#29335C]/10 border border-[#E0E1DD] dark:border-[#29335C]/50 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 flex items-center justify-center flex-shrink-0">
                              {tool.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-[#29335C] dark:text-white">
                                {tool.title}
                              </h4>
                              <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                                {tool.description}
                              </p>
                              <Button className="mt-2 bg-[#778DA9] hover:bg-[#778DA9]/90 text-white text-xs h-8">
                                {tool.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="bg-white dark:bg-[#29335C]/10 border border-[#E0E1DD] dark:border-[#29335C]/50 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center justify-center">
                        <Button
                          variant="ghost"
                          className="text-[#778DA9] flex items-center gap-2"
                        >
                          <Plus className="h-5 w-5" /> Ver Mais Opções...
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Últimas Interações */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-[#29335C] dark:text-white">
                        Últimas Interações
                      </h3>
                      <Button
                        variant="ghost"
                        className="text-[#778DA9] text-xs flex items-center gap-1"
                      >
                        Ver Todas <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          title: "Resumo de Física Quântica",
                          time: "Hoje, 10:30",
                          type: "Resumo",
                        },
                        {
                          title: "Exercícios de Cálculo Diferencial",
                          time: "Ontem, 15:45",
                          type: "Exercícios",
                        },
                        {
                          title: "Plano de Estudos para o ENEM",
                          time: "22/06/2024",
                          type: "Plano",
                        },
                      ].map((interaction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-[#E0E1DD] dark:border-[#29335C]/50 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-[#29335C]/20 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 flex items-center justify-center">
                              {interaction.type === "Resumo" ? (
                                <FileText className="h-5 w-5 text-[#778DA9]" />
                              ) : interaction.type === "Exercícios" ? (
                                <BookOpen className="h-5 w-5 text-[#778DA9]" />
                              ) : (
                                <Calendar className="h-5 w-5 text-[#778DA9]" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-[#29335C] dark:text-white">
                                {interaction.title}
                              </h4>
                              <p className="text-xs text-[#64748B] dark:text-white/60">
                                {interaction.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-[#64748B] dark:text-white/60">
                            {interaction.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Capacidades do School IA */}
                  <div>
                    <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
                      Capacidades do School IA
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiCapabilities.map((capability, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-[#29335C]/50 flex items-start gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 flex items-center justify-center">
                            {capability.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-[#29335C] dark:text-white">
                              {capability.title}
                            </h4>
                            <p className="text-sm text-[#64748B] dark:text-white/60">
                              {capability.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recomendacoes" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
                    Recomendações Personalizadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedContent.map((content) => (
                      <div
                        key={content.id}
                        className="bg-white dark:bg-[#29335C]/10 border border-[#E0E1DD] dark:border-[#29335C]/50 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-[#778DA9] text-white">
                            {content.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-[#E0E1DD] dark:border-[#29335C]/50"
                          >
                            {content.subject}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-[#29335C] dark:text-white text-lg mb-1">
                          {content.title}
                        </h4>
                        <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
                          {content.reason}
                        </p>
                        {content.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(content.rating!) ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
                              />
                            ))}
                            <span className="text-xs text-[#64748B] dark:text-white/60 ml-1">
                              {content.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <Button className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white">
                            {content.action}
                          </Button>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-[#64748B] dark:text-white/60 h-8 w-8 p-0"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-[#64748B] dark:text-white/60 h-8 w-8 p-0"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-[#E0E1DD] dark:border-[#29335C]/50"
                  >
                    Ver Mais Recomendações
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="plano-estudos" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-[#29335C] dark:text-white">
                      Plano de Estudos
                    </h3>
                    <Button className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white">
                      <Plus className="h-4 w-4 mr-2" /> Criar Novo Plano
                    </Button>
                  </div>

                  <div className="bg-white dark:bg-[#29335C]/10 border border-[#E0E1DD] dark:border-[#29335C]/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-[#29335C] dark:text-white">
                          Plano Atual
                        </h4>
                        <p className="text-sm text-[#64748B] dark:text-white/60">
                          Semana de 24 a 30 de Junho
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#E0E1DD] dark:border-[#29335C]/50"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Tarefa
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {studyPlan.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border border-[#E0E1DD] dark:border-[#29335C]/50 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-[#29335C]/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-6 w-6">
                              <input
                                type="checkbox"
                                className="h-5 w-5 rounded-md border-[#E0E1DD] dark:border-[#29335C]/50 text-[#778DA9]"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-[#29335C] dark:text-white">
                                {item.task}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs border-[#E0E1DD] dark:border-[#29335C]/50"
                                >
                                  {item.subject}
                                </Badge>
                                <span className="text-xs text-[#64748B] dark:text-white/60">
                                  {item.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            {item.status === "concluido" ? (
                              <Badge className="bg-green-500 text-white">
                                Concluído
                              </Badge>
                            ) : (
                              <Badge className="bg-[#778DA9] text-white">
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#29335C]/10 border border-[#E0E1DD] dark:border-[#29335C]/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
                      Progresso Semanal
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[#29335C] dark:text-white">
                            Matemática
                          </span>
                          <span className="text-xs text-[#64748B] dark:text-white/60">
                            75%
                          </span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[#29335C] dark:text-white">
                            Física
                          </span>
                          <span className="text-xs text-[#64748B] dark:text-white/60">
                            60%
                          </span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[#29335C] dark:text-white">
                            Química
                          </span>
                          <span className="text-xs text-[#64748B] dark:text-white/60">
                            40%
                          </span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[#29335C] dark:text-white">
                            Biologia
                          </span>
                          <span className="text-xs text-[#64748B] dark:text-white/60">
                            25%
                          </span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ferramentas" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
                    Ferramentas Inteligentes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="bg-white dark:bg-[#29335C]/10 border border-[#E0E1DD] dark:border-[#29335C]/50 rounded-lg p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 flex items-center justify-center mb-4">
                          {tool.icon}
                        </div>
                        <h4 className="font-medium text-[#29335C] dark:text-white text-lg mb-2">
                          {tool.title}
                        </h4>
                        <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">
                          {tool.description}
                        </p>
                        <Button className="bg-[#778DA9] hover:bg-[#778DA9]/90 text-white w-full">
                          {tool.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  MessageCircle,
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

export default function MentorIA2Interface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Sou o Mentor IA da Ponto.School. Como posso ajudar você hoje?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("visao-geral");

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

  return (
    <div className="w-full h-full bg-[#1a1f36] p-0 flex">
      {/* Coluna Esquerda - Chat */}
      <div className="w-[30%] h-full flex flex-col border-r border-[#2a2f45]">
        <div className="p-4 border-b border-[#2a2f45] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#5046e4] flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-medium text-white flex items-center gap-2">
              Mentor IA{" "}
              <Badge className="bg-[#5046e4] text-white text-xs">
                Online • Pronto para ajudar você
              </Badge>
            </h2>
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
                      <AvatarFallback className="bg-[#5046e4] text-white">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${message.sender === "user" ? "bg-[#5046e4] text-white" : "bg-[#2a2f45] text-white"}`}
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
                    <AvatarFallback className="bg-[#5046e4] text-white">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-[#2a2f45] text-white">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#5046e4] animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-[#5046e4] animate-pulse delay-150" />
                    <div className="w-2 h-2 rounded-full bg-[#5046e4] animate-pulse delay-300" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#2a2f45]">
          <div className="flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite suas mensagens..."
              className="flex-1 bg-[#2a2f45] border-[#3a3f55] text-white"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              className="bg-[#5046e4] hover:bg-[#5046e4]/90 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Coluna Direita - Conteúdo */}
      <div className="w-[70%] h-full flex flex-col">
        <div className="p-4 border-b border-[#2a2f45] flex justify-between items-center">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-[#2a2f45] border-b border-[#3a3f55]">
              <TabsTrigger
                value="visao-geral"
                className="text-white data-[state=active]:bg-[#5046e4] data-[state=active]:text-white"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="recomendacoes"
                className="text-white data-[state=active]:bg-[#5046e4] data-[state=active]:text-white"
              >
                Recomendações
              </TabsTrigger>
              <TabsTrigger
                value="plano"
                className="text-white data-[state=active]:bg-[#5046e4] data-[state=active]:text-white"
              >
                Plano
              </TabsTrigger>
              <TabsTrigger
                value="ferramentas"
                className="text-white data-[state=active]:bg-[#5046e4] data-[state=active]:text-white"
              >
                Ferramentas
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <TabsContent value="visao-geral" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 bg-[#2a2f45] rounded-xl text-white">
                <div className="w-20 h-20 rounded-full bg-[#5046e4] flex items-center justify-center">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Mentor IA</h2>
                  <p className="text-white/80">
                    Seu assistente de aprendizado pessoal. Como posso ajudar
                    você hoje?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#2a2f45] p-4 rounded-xl text-white">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#5046e4]" /> Plano de
                    Estudos
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    Crie um plano personalizado
                  </p>
                  <Button className="bg-[#5046e4] hover:bg-[#5046e4]/90 text-white w-full">
                    Experimentar
                  </Button>
                </div>

                <div className="bg-[#2a2f45] p-4 rounded-xl text-white">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#5046e4]" /> Resumo
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    Resuma textos e conteúdos
                  </p>
                  <Button className="bg-[#5046e4] hover:bg-[#5046e4]/90 text-white w-full">
                    Experimentar
                  </Button>
                </div>

                <div className="bg-[#2a2f45] p-4 rounded-xl text-white">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-[#5046e4]" /> Mapas Mentais
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    Visualize conceitos complexos
                  </p>
                  <Button className="bg-[#5046e4] hover:bg-[#5046e4]/90 text-white w-full">
                    Experimentar
                  </Button>
                </div>

                <div className="bg-[#2a2f45] p-4 rounded-xl text-white">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-[#5046e4]" /> Desempenho
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    Analise seu progresso
                  </p>
                  <Button className="bg-[#5046e4] hover:bg-[#5046e4]/90 text-white w-full">
                    Experimentar
                  </Button>
                </div>
              </div>

              <div className="bg-[#2a2f45] p-4 rounded-xl text-white">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Compass className="h-5 w-5 text-[#5046e4]" /> Modo Exploração
                </h3>
                <p className="text-sm text-white/60 mb-3">
                  Explore novos temas de forma guiada com seu personal
                </p>
                <Button className="bg-[#5046e4] hover:bg-[#5046e4]/90 text-white">
                  Experimentar
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">
                  Últimas Interações
                </h3>
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
                      className="flex items-center justify-between p-3 bg-[#2a2f45] rounded-lg hover:bg-[#3a3f55] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3a3f55] flex items-center justify-center">
                          {interaction.type === "Resumo" ? (
                            <FileText className="h-5 w-5 text-[#5046e4]" />
                          ) : interaction.type === "Exercícios" ? (
                            <BookOpen className="h-5 w-5 text-[#5046e4]" />
                          ) : (
                            <Calendar className="h-5 w-5 text-[#5046e4]" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">
                            {interaction.title}
                          </h4>
                          <p className="text-xs text-white/60">
                            {interaction.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-white/60">
                        {interaction.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right">
                  <Button variant="ghost" className="text-[#5046e4] text-xs">
                    Ver todas
                  </Button>
                </div>
              </div>

              <div className="bg-[#2a2f45] p-4 rounded-xl text-white">
                <h3 className="text-lg font-medium mb-3">Novidades</h3>
                <div className="p-3 bg-[#3a3f55] rounded-lg">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#5046e4]" /> Modo
                    Exploração Lançado!
                  </h4>
                  <p className="text-sm text-white/60 mt-1 mb-3">
                    Experimente nosso novo modo Exploração que permite navegar
                    temas de forma interativa e aprofundada.
                  </p>
                  <Button
                    variant="ghost"
                    className="text-[#5046e4] text-xs px-0"
                  >
                    Saiba mais
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>

        <div className="p-4 border-t border-[#2a2f45] flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-white border-[#3a3f55] text-xs gap-1"
            >
              <Brain className="h-3 w-3" /> Crie um plano de estudos para o ENEM
            </Button>
            <Button
              variant="outline"
              className="text-white border-[#3a3f55] text-xs gap-1"
            >
              <FileText className="h-3 w-3" /> Resumo o capítulo sobre Revolução
              Industrial
            </Button>
          </div>
          <Button
            variant="outline"
            className="text-white border-[#3a3f55] text-xs gap-1"
          >
            <Star className="h-3 w-3" /> Avaliar meu desempenho nas últimas
            provas
          </Button>
        </div>
      </div>
    </div>
  );
}

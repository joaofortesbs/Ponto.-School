import React, { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "./ThemeToggle";
import PlanoEstudosInterface from "./PlanoEstudosInterface";
import EpictusChatInterface from "./EpictusChatInterface";
import ChatEpictus from "./ChatEpictus";
import {
  Brain,
  BookOpen,
  BarChart3,
  MessageSquare,
  FileText,
  Search,
  Settings,
  Sparkles,
  Send,
  Zap,
  Star,
  PlusCircle,
  Clock,
  ChevronRight,
  Lightbulb,
  Compass,
  ArrowRight,
  Rocket,
  Code,
  Globe,
  Sparkle,
} from "lucide-react";

export default function EpictusIAInterface() {
  const { theme } = useTheme();
  // Obter o parâmetro de URL 'tab' se existir
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "conversation");
  const [inputMessage, setInputMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  
  // Atualizar a URL quando a aba mudar
  const updateTab = (tab: string) => {
    setActiveTab(tab);
    // Verificar se tab é chat-epictus ou conversation para definir showChat
    if (tab === 'chat-epictus' || tab === 'conversation') {
      setShowChat(true);
    } else {
      setShowChat(false);
    }
    
    // Atualizar a URL sem recarregar a página
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  return (
    <div
      className={`w-full h-full ${theme === "dark" ? "bg-[#001427]" : "bg-[#f7f9fa]"} flex flex-col transition-colors duration-300`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${theme === "dark" ? "border-gray-800 bg-[#0A2540]" : "border-gray-200 bg-white"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2
              className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} flex items-center gap-2`}
            >
              Epictus IA
              <Badge className="bg-[#FF6B00] text-white text-xs">Online</Badge>
            </h2>
            <p
              className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
            >
              Seu assistente de estudos pessoal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className={`${theme === "dark" ? "text-white/60 hover:text-white hover:bg-[#29335C]/20" : "text-[#64748B] hover:text-[#29335C] hover:bg-gray-100"}`}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chat */}
        <div
          className={`w-[320px] border-r ${theme === "dark" ? "border-gray-800" : "border-gray-200"} flex flex-col`}
        >
          <div
            className={`p-4 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
          >
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} h-4 w-4`}
              />
              <Input
                placeholder="Buscar conversas..."
                className={`pl-9 ${theme === "dark" ? "bg-[#29335C]/20 border-gray-700 text-white" : "bg-white border-gray-200 text-[#29335C]"}`}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              <div
                className={`${theme === "dark" ? "bg-[#29335C]/20 hover:bg-[#29335C]/30 border-gray-800" : "bg-white hover:bg-gray-50 border-gray-200"} p-3 rounded-lg cursor-pointer transition-colors border`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
                  >
                    Plano de Estudos ENEM
                  </h3>
                  <span className="text-xs text-[#FF6B00]">Hoje</span>
                </div>
                <p
                  className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"} line-clamp-2`}
                >
                  Criação de um plano personalizado para o ENEM com foco em
                  ciências da natureza e matemática...
                </p>
              </div>

              <div
                className={`${theme === "dark" ? "bg-[#29335C]/20 hover:bg-[#29335C]/30 border-gray-800" : "bg-white hover:bg-gray-50 border-gray-200"} p-3 rounded-lg cursor-pointer transition-colors border`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
                  >
                    Resumo de Física
                  </h3>
                  <span
                    className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  >
                    Ontem
                  </span>
                </div>
                <p
                  className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"} line-clamp-2`}
                >
                  Resumo sobre termodinâmica e leis da física quântica para
                  revisão...
                </p>
              </div>

              <div
                className={`${theme === "dark" ? "bg-[#29335C]/20 hover:bg-[#29335C]/30 border-gray-800" : "bg-white hover:bg-gray-50 border-gray-200"} p-3 rounded-lg cursor-pointer transition-colors border`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
                  >
                    Dúvidas de Matemática
                  </h3>
                  <span
                    className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  >
                    3 dias atrás
                  </span>
                </div>
                <p
                  className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"} line-clamp-2`}
                >
                  Resolução de exercícios sobre funções trigonométricas e
                  cálculo diferencial...
                </p>
              </div>
            </div>
          </ScrollArea>

          <div
            className={`p-3 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
          >
            <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              <PlusCircle className="h-4 w-4 mr-2" /> Nova Conversa
            </Button>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div
              className={`border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"} p-2`}
            >
              <TabsList
                className={`${theme === "dark" ? "bg-[#29335C]/20" : "bg-gray-100"} p-1`}
              >
                <TabsTrigger
                  value="visao-geral"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("visao-geral")}
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="conversation"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("conversation")}
                >
                  Conversação
                </TabsTrigger>
                <TabsTrigger
                  value="chat-epictus"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("chat-epictus")}
                >
                  Chat Epictus
                </TabsTrigger>
                <TabsTrigger
                  value="plano-estudos"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("plano-estudos")}
                >
                  Plano de Estudos
                </TabsTrigger>
                <TabsTrigger
                  value="resumos"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("resumos")}
                >
                  Resumos
                </TabsTrigger>
                <TabsTrigger
                  value="desempenho"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("desempenho")}
                >
                  Desempenho
                </TabsTrigger>
                <TabsTrigger
                  value="modo-exploracao"
                  className={`data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                  onClick={() => updateTab("modo-exploracao")}
                >
                  Modo Exploração
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="conversation" className="h-full mt-0 flex-1 flex flex-col">
                <EpictusChatInterface />
              </TabsContent>
              
              <TabsContent value="chat-epictus" className="h-full mt-0 flex-1 flex flex-col">
                <ChatEpictus />
              </TabsContent>

              <TabsContent value="visao-geral" className="mt-0 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
                  >
                    Olá, João Silva!
                  </h2>
                  <Badge className="bg-[#FF6B00] text-white">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Versão Premium
                  </Badge>
                </div>

                <div
                  className={`${theme === "dark" ? "bg-[#0A2540] border-gray-800" : "bg-white border-gray-200"} rounded-xl p-6 border shadow-sm`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
                      >
                        Epictus IA
                      </h3>
                      <p
                        className={`${theme === "dark" ? "text-white/80" : "text-[#64748B]"} mb-4`}
                      >
                        Seu assistente de estudos pessoal. Como posso ajudar
                        você hoje?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer">
                          Tire suas dúvidas
                        </Badge>
                        <Badge
                          className={`${theme === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#29335C]/10 text-[#29335C] hover:bg-[#29335C]/20"} cursor-pointer`}
                        >
                          Crie planos de estudo
                        </Badge>
                        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer">
                          Resumos inteligentes
                        </Badge>
                        <Badge
                          className={`${theme === "dark" ? "bg-white/10 text-white hover:bg-white/20" : "bg-[#29335C]/10 text-[#29335C] hover:bg-[#29335C]/20"} cursor-pointer`}
                        >
                          Análise de desempenho
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div
                    className={`${theme === "dark" ? "bg-[#0A2540] border-gray-800" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <FileText className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-1`}
                      >
                        Resumos
                      </h3>
                      <p
                        className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
                      >
                        Resumos inteligentes de conteúdos
                      </p>
                      <Button
                        variant="ghost"
                        className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                      >
                        Acessar
                      </Button>
                    </div>
                  </div>

                  <div
                    className={`${theme === "dark" ? "bg-[#0A2540] border-gray-800" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-1`}
                      >
                        Plano de Estudos
                      </h3>
                      <p
                        className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
                      >
                        Planos personalizados para você
                      </p>
                      <Button
                        variant="ghost"
                        className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                      >
                        Acessar
                      </Button>
                    </div>
                  </div>

                  <div
                    className={`${theme === "dark" ? "bg-[#0A2540] border-gray-800" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <BarChart3 className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-1`}
                      >
                        Desempenho
                      </h3>
                      <p
                        className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
                      >
                        Análise do seu progresso
                      </p>
                      <Button
                        variant="ghost"
                        className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                      >
                        Acessar
                      </Button>
                    </div>
                  </div>

                  <div
                    className={`${theme === "dark" ? "bg-[#0A2540] border-gray-800" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <Compass className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3
                        className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-1`}
                      >
                        Modo Exploração
                      </h3>
                      <p
                        className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
                      >
                        Explore temas com um guia pessoal
                      </p>
                      <Button
                        variant="ghost"
                        className="text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                      >
                        Acessar
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
                    >
                      Últimas Interações
                    </h3>
                    <Button
                      variant="ghost"
                      className="text-[#FF6B00] text-xs flex items-center gap-1"
                    >
                      Ver Todas <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Plano de Estudos ENEM",
                        time: "Hoje, 10:30",
                        type: "Plano",
                        icon: <BookOpen className="h-5 w-5 text-[#FF6B00]" />,
                      },
                      {
                        title: "Resumo de Física Quântica",
                        time: "Ontem, 15:45",
                        type: "Resumo",
                        icon: <FileText className="h-5 w-5 text-[#FF6B00]" />,
                      },
                      {
                        title: "Dúvidas sobre Cálculo Diferencial",
                        time: "3 dias atrás",
                        type: "Dúvidas",
                        icon: (
                          <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
                        ),
                      },
                    ].map((interaction, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 ${theme === "dark" ? "bg-[#29335C]/20 hover:bg-[#29335C]/30 border-gray-800" : "bg-white hover:bg-gray-50 border-gray-200"} rounded-lg transition-colors cursor-pointer border`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${theme === "dark" ? "bg-[#29335C]/50" : "bg-gray-100"} flex items-center justify-center`}
                          >
                            {interaction.icon}
                          </div>
                          <div>
                            <h4
                              className={`font-medium ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
                            >
                              {interaction.title}
                            </h4>
                            <p
                              className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                            >
                              {interaction.type}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}
                        >
                          {interaction.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="plano-estudos" className="mt-0">
                <PlanoEstudosInterface />
              </TabsContent>

              <TabsContent value="resumos" className="mt-0 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-[#FF6B00]" />
                  </div>
                  <h2
                    className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Resumos Inteligentes
                  </h2>
                  <p
                    className={`${theme === "dark" ? "text-white/60" : "text-[#64748B]"} max-w-md mx-auto mb-6`}
                  >
                    Gere resumos inteligentes de qualquer conteúdo para estudar
                    de forma mais eficiente
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Criar Resumo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="desempenho" className="mt-0 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-[#FF6B00]" />
                  </div>
                  <h2
                    className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Análise de Desempenho
                  </h2>
                  <p
                    className={`${theme === "dark" ? "text-white/60" : "text-[#64748B]"} max-w-md mx-auto mb-6`}
                  >
                    Acompanhe seu progresso e identifique áreas para melhorar
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Ver Análises
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="modo-exploracao" className="mt-0 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                    <Compass className="h-8 w-8 text-[#FF6B00]" />
                  </div>
                  <h2
                    className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Modo Exploração
                  </h2>
                  <p
                    className={`${theme === "dark" ? "text-white/60" : "text-[#64748B]"} max-w-md mx-auto mb-6`}
                  >
                    Explore temas de forma guiada com o Epictus IA
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Iniciar Exploração
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Chat Input (apenas mostrado quando não estamos na tela de conversação) */}
          {!showChat && (
            <div
              className={`p-4 border-t ${theme === "dark" ? "border-gray-800 bg-[#0A2540]" : "border-gray-200 bg-white"}`}
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Digite suas mensagens..."
                  className={`flex-1 ${theme === "dark" ? "bg-[#29335C]/20 border-gray-700 text-white" : "bg-white border-gray-200 text-[#29335C]"}`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />
                <Button 
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  onClick={() => {
                    setShowChat(true);
                    setActiveTab("conversation");
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center mt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs ${theme === "dark" ? "text-white/60 border-gray-700 hover:bg-[#29335C]/20" : "text-[#64748B] border-gray-200 hover:bg-gray-100"}`}
                    onClick={() => {
                      setInputMessage("Crie um plano de estudos para o ENEM");
                      setShowChat(true);
                      setActiveTab("conversation");
                    }}
                  >
                    <Zap className="h-3 w-3 mr-1" /> Crie um plano de estudos para
                    o ENEM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs ${theme === "dark" ? "text-white/60 border-gray-700 hover:bg-[#29335C]/20" : "text-[#64748B] border-gray-200 hover:bg-gray-100"}`}
                    onClick={() => {
                      setInputMessage("Resumo o capítulo sobre Revolução Industrial");
                      setShowChat(true);
                      setActiveTab("conversation");
                    }}
                  >
                    <Star className="h-3 w-3 mr-1" /> Resumo o capítulo sobre
                    Revolução Industrial
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

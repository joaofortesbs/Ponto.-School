import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlanoEstudosInterface from "./PlanoEstudosInterface";
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
} from "lucide-react";

export default function EpictusIAInterface() {
  const [activeTab, setActiveTab] = useState("plano-estudos");
  const [inputMessage, setInputMessage] = useState("");

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A2540]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-medium text-[#29335C] dark:text-white flex items-center gap-2">
              Epictus IA
              <Badge className="bg-[#FF6B00] text-white text-xs">Online</Badge>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-white/60">
              Seu assistente de estudos pessoal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#29335C]/20"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-[320px] border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-9 bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700 text-[#29335C] dark:text-white"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              <div className="bg-white dark:bg-[#29335C]/20 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#29335C]/30 transition-colors border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-[#29335C] dark:text-white">
                    Plano de Estudos ENEM
                  </h3>
                  <span className="text-xs text-[#FF6B00]">Hoje</span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-white/60 line-clamp-2">
                  Criação de um plano personalizado para o ENEM com foco em
                  ciências da natureza e matemática...
                </p>
              </div>

              <div className="bg-white dark:bg-[#29335C]/20 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#29335C]/30 transition-colors border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-[#29335C] dark:text-white">
                    Resumo de Física
                  </h3>
                  <span className="text-xs text-[#64748B] dark:text-white/60">
                    Ontem
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-white/60 line-clamp-2">
                  Resumo sobre termodinâmica e leis da física quântica para
                  revisão...
                </p>
              </div>

              <div className="bg-white dark:bg-[#29335C]/20 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#29335C]/30 transition-colors border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-[#29335C] dark:text-white">
                    Dúvidas de Matemática
                  </h3>
                  <span className="text-xs text-[#64748B] dark:text-white/60">
                    3 dias atrás
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-white/60 line-clamp-2">
                  Resolução de exercícios sobre funções trigonométricas e
                  cálculo diferencial...
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
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
            <div className="border-b border-gray-200 dark:border-gray-800 p-2">
              <TabsList className="bg-gray-100 dark:bg-[#29335C]/20 p-1">
                <TabsTrigger
                  value="visao-geral"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="plano-estudos"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60"
                >
                  Plano de Estudos
                </TabsTrigger>
                <TabsTrigger
                  value="resumos"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60"
                >
                  Resumos
                </TabsTrigger>
                <TabsTrigger
                  value="desempenho"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60"
                >
                  Desempenho
                </TabsTrigger>
                <TabsTrigger
                  value="modo-exploracao"
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-[#64748B] dark:text-white/60"
                >
                  Modo Exploração
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="visao-geral" className="mt-0 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#29335C] dark:text-white">
                    Olá, João Silva!
                  </h2>
                  <Badge className="bg-[#FF6B00] text-white">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Versão Premium
                  </Badge>
                </div>

                <div className="bg-white dark:bg-[#0A2540] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#29335C] dark:text-white mb-2">
                        Epictus IA
                      </h3>
                      <p className="text-[#64748B] dark:text-white/80 mb-4">
                        Seu assistente de estudos pessoal. Como posso ajudar
                        você hoje?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer">
                          Tire suas dúvidas
                        </Badge>
                        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20 cursor-pointer">
                          Crie planos de estudo
                        </Badge>
                        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer">
                          Resumos inteligentes
                        </Badge>
                        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20 cursor-pointer">
                          Análise de desempenho
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#0A2540] p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <FileText className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                        Resumos
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
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

                  <div className="bg-white dark:bg-[#0A2540] p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                        Plano de Estudos
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
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

                  <div className="bg-white dark:bg-[#0A2540] p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <BarChart3 className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                        Desempenho
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
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

                  <div className="bg-white dark:bg-[#0A2540] p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <Compass className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                        Modo Exploração
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
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
                    <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
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
                        className="flex items-center justify-between p-3 bg-white dark:bg-[#29335C]/20 hover:bg-gray-50 dark:hover:bg-[#29335C]/30 rounded-lg transition-colors cursor-pointer border border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#29335C]/50 flex items-center justify-center">
                            {interaction.icon}
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
              </TabsContent>

              <TabsContent value="plano-estudos" className="mt-0">
                <PlanoEstudosInterface />
              </TabsContent>

              <TabsContent value="resumos" className="mt-0 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-[#FF6B00]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#29335C] dark:text-white mb-2">
                    Resumos Inteligentes
                  </h2>
                  <p className="text-[#64748B] dark:text-white/60 max-w-md mx-auto mb-6">
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
                  <h2 className="text-xl font-bold text-[#29335C] dark:text-white mb-2">
                    Análise de Desempenho
                  </h2>
                  <p className="text-[#64748B] dark:text-white/60 max-w-md mx-auto mb-6">
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
                  <h2 className="text-xl font-bold text-[#29335C] dark:text-white mb-2">
                    Modo Exploração
                  </h2>
                  <p className="text-[#64748B] dark:text-white/60 max-w-md mx-auto mb-6">
                    Explore temas de forma guiada com o Epictus IA
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Iniciar Exploração
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A2540]">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Digite suas mensagens..."
                className="flex-1 bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700 text-[#29335C] dark:text-white"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center mt-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-[#64748B] dark:text-white/60 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#29335C]/20"
                >
                  <Zap className="h-3 w-3 mr-1" /> Crie um plano de estudos para
                  o ENEM
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-[#64748B] dark:text-white/60 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#29335C]/20"
                >
                  <Star className="h-3 w-3 mr-1" /> Resumo o capítulo sobre
                  Revolução Industrial
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

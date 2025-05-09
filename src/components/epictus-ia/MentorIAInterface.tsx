import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeContext } from "@/components/ThemeProvider";
import {
  Brain,
  MessageSquare,
  Sparkles,
  Send,
  Search,
  FileText,
  BookOpen,
  Rocket,
  Star,
  ChevronRight,
  Zap,
  Settings,
  PlusCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Compass,
  ArrowRight,
  Database,
  Globe,
  Code,
} from "lucide-react";

export default function MentorIAInterface() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div
      className={`w-full h-full ${isDark ? "bg-[#121826]" : "bg-[#f7f9fa]"} flex flex-col`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${isDark ? "border-[#1e293b]" : "border-gray-200"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2
              className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"} flex items-center gap-2`}
            >
              Mentor IA
              <Badge className="bg-[#FF6B00] text-white text-xs">Online</Badge>
            </h2>
            <p
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Seu assistente de estudos pessoal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`${isDark ? "text-gray-400 hover:text-white hover:bg-[#1e293b]" : "text-gray-600 hover:text-[#29335C] hover:bg-gray-100"}`}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chat */}
        <div
          className={`w-[320px] border-r ${isDark ? "border-[#1e293b]" : "border-gray-200"} flex flex-col`}
        >
          <div
            className={`p-4 border-b ${isDark ? "border-[#1e293b]" : "border-gray-200"}`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                className={`pl-9 ${isDark ? "bg-[#1e293b] border-[#2d3748] text-white" : "bg-white border-gray-200 text-[#29335C]"}`}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              <div
                className={`${isDark ? "bg-[#1e293b]" : "bg-white border border-gray-200"} p-3 rounded-lg cursor-pointer ${isDark ? "hover:bg-[#2d3748]" : "hover:bg-gray-50"} transition-colors`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"}`}
                  >
                    Plano de Estudos ENEM
                  </h3>
                  <span
                    className={`text-xs ${isDark ? "text-[#FF6B00]" : "text-[#FF6B00]"}`}
                  >
                    Hoje
                  </span>
                </div>
                <p
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-2`}
                >
                  Criação de um plano personalizado para o ENEM com foco em
                  ciências da natureza e matemática...
                </p>
              </div>

              <div
                className={`${isDark ? "bg-[#1e293b]" : "bg-white border border-gray-200"} p-3 rounded-lg cursor-pointer ${isDark ? "hover:bg-[#2d3748]" : "hover:bg-gray-50"} transition-colors`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"}`}
                  >
                    Resumo de Física
                  </h3>
                  <span
                    className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Ontem
                  </span>
                </div>
                <p
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-2`}
                >
                  Resumo sobre termodinâmica e leis da física quântica para
                  revisão...
                </p>
              </div>

              <div
                className={`${isDark ? "bg-[#1e293b]" : "bg-white border border-gray-200"} p-3 rounded-lg cursor-pointer ${isDark ? "hover:bg-[#2d3748]" : "hover:bg-gray-50"} transition-colors`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"}`}
                  >
                    Dúvidas de Matemática
                  </h3>
                  <span
                    className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    3 dias atrás
                  </span>
                </div>
                <p
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-2`}
                >
                  Resolução de exercícios sobre funções trigonométricas e
                  cálculo diferencial...
                </p>
              </div>
            </div>
          </ScrollArea>

          <div
            className={`p-3 border-t ${isDark ? "border-[#1e293b]" : "border-gray-200"}`}
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
              className={`border-b ${isDark ? "border-[#1e293b]" : "border-gray-200"} p-2`}
            >
              <TabsList
                className={isDark ? "bg-[#1e293b] p-1" : "bg-gray-100 p-1"}
              >
                <TabsTrigger
                  value="visao-geral"
                  className={
                    isDark
                      ? "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-400"
                      : "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600"
                  }
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="plano-estudos"
                  className={
                    isDark
                      ? "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-400"
                      : "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600"
                  }
                >
                  Plano de Estudos
                </TabsTrigger>
                <TabsTrigger
                  value="resumos"
                  className={
                    isDark
                      ? "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-400"
                      : "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600"
                  }
                >
                  Resumos
                </TabsTrigger>
                <TabsTrigger
                  value="desempenho"
                  className={
                    isDark
                      ? "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-400"
                      : "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600"
                  }
                >
                  Desempenho
                </TabsTrigger>
                <TabsTrigger
                  value="modo-exploracao"
                  className={
                    isDark
                      ? "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-400"
                      : "data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600"
                  }
                >
                  Modo Exploração
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <TabsContent value="visao-geral" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#29335C]"}`}
                  >
                    Olá, João Silva!
                  </h2>
                  <Badge className="bg-[#FF6B00] text-white">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Versão Premium
                  </Badge>
                </div>

                <div
                  className={`${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} rounded-xl p-6 border`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${isDark ? "text-white" : "text-[#29335C]"} mb-2`}
                      >
                        Mentor IA
                      </h3>
                      <p
                        className={
                          isDark ? "text-gray-300 mb-4" : "text-gray-600 mb-4"
                        }
                      >
                        Seu assistente de estudos pessoal. Como posso ajudar
                        você hoje?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={
                            isDark
                              ? "bg-[#FF6B00]/20 text-[#FF6B00] hover:bg-[#FF6B00]/30 cursor-pointer"
                              : "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer"
                          }
                        >
                          Tire suas dúvidas
                        </Badge>
                        <Badge
                          className={
                            isDark
                              ? "bg-[#29335C]/20 text-gray-300 hover:bg-[#29335C]/30 cursor-pointer"
                              : "bg-[#29335C]/10 text-[#29335C] hover:bg-[#29335C]/20 cursor-pointer"
                          }
                        >
                          Crie planos de estudo
                        </Badge>
                        <Badge
                          className={
                            isDark
                              ? "bg-[#FF6B00]/20 text-[#FF6B00] hover:bg-[#FF6B00]/30 cursor-pointer"
                              : "bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer"
                          }
                        >
                          Resumos inteligentes
                        </Badge>
                        <Badge
                          className={
                            isDark
                              ? "bg-[#29335C]/20 text-gray-300 hover:bg-[#29335C]/30 cursor-pointer"
                              : "bg-[#29335C]/10 text-[#29335C] hover:bg-[#29335C]/20 cursor-pointer"
                          }
                        >
                          Análise de desempenho
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div
                    className={`${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <FileText className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3
                        className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"} mb-1`}
                      >
                        Resumos
                      </h3>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-3`}
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
                    className={`${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3
                        className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"} mb-1`}
                      >
                        Plano de Estudos
                      </h3>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-3`}
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
                    className={`${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <BarChart3 className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3
                        className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"} mb-1`}
                      >
                        Desempenho
                      </h3>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-3`}
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
                    className={`${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} p-4 rounded-xl border hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <Compass className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3
                        className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"} mb-1`}
                      >
                        Modo Exploração
                      </h3>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-3`}
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
                      className={`text-lg font-bold ${isDark ? "text-white" : "text-[#29335C]"}`}
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
                        className={`flex items-center justify-between p-3 ${isDark ? "bg-[#1e293b] hover:bg-[#2d3748]" : "bg-white border border-gray-200 hover:bg-gray-50"} rounded-lg transition-colors cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${isDark ? "bg-[#2d3748]" : "bg-[#FF6B00]/10"} flex items-center justify-center`}
                          >
                            {interaction.icon}
                          </div>
                          <div>
                            <h4
                              className={`font-medium ${isDark ? "text-white" : "text-[#29335C]"}`}
                            >
                              {interaction.title}
                            </h4>
                            <p
                              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {interaction.type}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {interaction.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="plano-estudos" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#29335C]"}`}
                  >
                    Plano de Estudos
                  </h2>
                  <Badge className="bg-[#FF6B00] text-white">Premium</Badge>
                </div>

                <div
                  className={`p-12 ${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} rounded-xl border flex flex-col items-center justify-center text-center`}
                >
                  <BookOpen
                    className={`h-16 w-16 ${isDark ? "text-gray-600" : "text-gray-300"} mb-4`}
                  />
                  <h3
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Planos de Estudo Personalizados
                  </h3>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6 max-w-md`}
                  >
                    Crie planos de estudo personalizados baseados em seus
                    objetivos e disponibilidade. Organize seu tempo de forma
                    eficiente.
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Criar Plano de Estudos
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="resumos" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#29335C]"}`}
                  >
                    Resumos
                  </h2>
                  <Badge className="bg-[#FF6B00] text-white">Premium</Badge>
                </div>

                <div
                  className={`p-12 ${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} rounded-xl border flex flex-col items-center justify-center text-center`}
                >
                  <FileText
                    className={`h-16 w-16 ${isDark ? "text-gray-600" : "text-gray-300"} mb-4`}
                  />
                  <h3
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Resumos Inteligentes
                  </h3>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6 max-w-md`}
                  >
                    Gere resumos inteligentes de qualquer conteúdo. Economize
                    tempo e aprenda de forma mais eficiente.
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Criar Resumo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="desempenho" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#29335C]"}`}
                  >
                    Desempenho
                  </h2>
                  <Badge className="bg-[#FF6B00] text-white">Premium</Badge>
                </div>

                <div
                  className={`p-12 ${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} rounded-xl border flex flex-col items-center justify-center text-center`}
                >
                  <BarChart3
                    className={`h-16 w-16 ${isDark ? "text-gray-600" : "text-gray-300"} mb-4`}
                  />
                  <h3
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Análise de Desempenho
                  </h3>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6 max-w-md`}
                  >
                    Acompanhe seu progresso e identifique áreas para melhorar.
                    Visualize seu desempenho com gráficos detalhados.
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Ver Análises
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="modo-exploracao" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#29335C]"}`}
                  >
                    Modo Exploração
                  </h2>
                  <Badge className="bg-[#FF6B00] text-white">Premium</Badge>
                </div>

                <div
                  className={`p-12 ${isDark ? "bg-[#1e293b] border-[#2d3748]" : "bg-white border-gray-200"} rounded-xl border flex flex-col items-center justify-center text-center`}
                >
                  <Compass
                    className={`h-16 w-16 ${isDark ? "text-gray-600" : "text-gray-300"} mb-4`}
                  />
                  <h3
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-[#29335C]"} mb-2`}
                  >
                    Exploração Guiada
                  </h3>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6 max-w-md`}
                  >
                    Explore temas de forma guiada com um assistente pessoal.
                    Aprofunde-se em qualquer assunto de forma interativa.
                  </p>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    Iniciar Exploração
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Chat Input */}
          <div
            className={`p-4 border-t ${isDark ? "border-[#1e293b]" : "border-gray-200"}`}
          >
            <div className="flex items-center gap-2">
              <Input
                placeholder="Digite suas mensagens..."
                className={`flex-1 ${isDark ? "bg-[#1e293b] border-[#2d3748] text-white" : "bg-white border-gray-200 text-[#29335C]"}`}
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
                  className={`text-xs ${isDark ? "text-gray-400 border-[#2d3748] hover:bg-[#2d3748]" : "text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                >
                  <Zap className="h-3 w-3 mr-1" /> Crie um plano de estudos para
                  o ENEM
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs ${isDark ? "text-gray-400 border-[#2d3748] hover:bg-[#2d3748]" : "text-gray-600 border-gray-200 hover:bg-gray-100"}`}
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

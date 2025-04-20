import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ModoExploracaoInterface from "./ModoExploracaoInterface";
import ResumosInterface from "./ResumosInterface";
import DesempenhoInterface from "./DesempenhoInterface";
import PlanoEstudosInterface from "./PlanoEstudosInterface";
import {
  Brain,
  FileText,
  BookOpen,
  BarChart3,
  MessageSquare,
  Sparkles,
  Send,
  Clock,
  ChevronRight,
  Search,
  PlusCircle,
  Compass,
  Zap,
  Settings,
  X,
} from "lucide-react";

export default function EpictusIANewInterface() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [inputMessage, setInputMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
      {showChat && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-10 z-50 bg-white dark:bg-[#121212] rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#FF6B00]" />
                <h2 className="text-xl font-semibold text-[#29335C] dark:text-white">
                  Chat com Epictus IA
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  <div className="bg-[#FF6B00]/10 p-4 rounded-lg max-w-[80%]">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[#29335C] dark:text-white">
                          Olá! Sou o Epictus IA, seu assistente de estudos
                          pessoal. Como posso ajudar você hoje?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-full">
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
            <Button
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              onClick={() => setShowChat(true)}
            >
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

            <div className="flex-1 overflow-hidden">
              <TabsContent value="visao-geral" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
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
                            onClick={() => setActiveTab("resumos")}
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
                            onClick={() => setActiveTab("plano-estudos")}
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
                            onClick={() => setActiveTab("desempenho")}
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
                            onClick={() => setActiveTab("modo-exploracao")}
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
                            icon: (
                              <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                            ),
                          },
                          {
                            title: "Resumo de Física Quântica",
                            time: "Ontem, 15:45",
                            type: "Resumo",
                            icon: (
                              <FileText className="h-5 w-5 text-[#FF6B00]" />
                            ),
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

                    <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-6 rounded-xl text-white">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                          <Zap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold mb-2">
                            Potencialize seus estudos com IA
                          </h2>
                          <p className="text-white/80 mb-4">
                            O Epictus IA utiliza inteligência artificial
                            avançada para personalizar sua experiência de
                            aprendizado, oferecendo resumos inteligentes, planos
                            de estudo adaptados às suas necessidades e análises
                            detalhadas do seu desempenho.
                          </p>
                          <Button
                            className="bg-white text-[#29335C] hover:bg-white/90"
                            onClick={() => setShowChat(true)}
                          >
                            Iniciar Conversa{" "}
                            <MessageSquare className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="plano-estudos" className="h-full">
                <PlanoEstudosInterface />
              </TabsContent>

              <TabsContent value="resumos" className="h-full">
                <ResumosInterface />
              </TabsContent>

              <TabsContent value="desempenho" className="h-full">
                <DesempenhoInterface />
              </TabsContent>

              <TabsContent value="modo-exploracao" className="h-full">
                <ModoExploracaoInterface />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

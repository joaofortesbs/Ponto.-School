import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

export default function DesignIA() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [inputMessage, setInputMessage] = useState("");

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#FF6B00]" /> Design IA
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Seu assistente de estudos pessoal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#FF6B00] text-white border-0 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Premium
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Column - Chat */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex-1 flex flex-col bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-[#E0E1DD] dark:border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-[#29335C] dark:text-white">
                  Design IA
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
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-[#FF6B00] flex items-center justify-center text-white">
                      <Brain className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="max-w-[80%] rounded-lg px-4 py-3 bg-[#E0E1DD]/30 dark:bg-[#1E293B] text-[#29335C] dark:text-white">
                    <p className="text-sm">
                      Olá! Sou o Design IA da Ponto.School. Como posso ajudar
                      você hoje?
                    </p>
                    <div className="text-xs opacity-70 mt-1 text-right flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-[#E0E1DD] dark:border-white/10">
              <div className="flex items-center gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua dúvida ou pergunta..."
                  className="flex-1 bg-[#E0E1DD]/20 dark:bg-[#29335C]/20 border-[#E0E1DD] dark:border-[#29335C]/50"
                />
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4">
            <h3 className="text-sm font-medium text-[#29335C] dark:text-white mb-3 flex items-center gap-2">
              Tire suas dúvidas
            </h3>
            <div className="space-y-2">
              {[
                "Como resolver equações diferenciais?",
                "Explique o princípio da incerteza de Heisenberg",
                "O que é fotossíntese e como funciona?",
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2 text-xs border-[#E0E1DD] dark:border-[#29335C]/50 hover:bg-[#E0E1DD]/20 dark:hover:bg-[#29335C]/20"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-8 flex flex-col gap-4">
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
                    value="plano-estudos"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                  >
                    Plano de Estudos
                  </TabsTrigger>
                  <TabsTrigger
                    value="resumos"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                  >
                    Resumos
                  </TabsTrigger>
                  <TabsTrigger
                    value="desempenho"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                  >
                    Desempenho
                  </TabsTrigger>
                  <TabsTrigger
                    value="modo-exploracao"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                  >
                    Modo Exploração
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <TabsContent value="visao-geral" className="mt-0">
                <div className="space-y-6">
                  {/* Main Features */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <FileText className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                        Resumos
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
                        Resumos inteligentes de conteúdos
                      </p>
                      <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        Acessar
                      </Button>
                    </div>

                    <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                        Plano de Estudos
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
                        Planos personalizados para você
                      </p>
                      <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        Acessar
                      </Button>
                    </div>

                    <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <BarChart3 className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                        Desempenho
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
                        Análise do seu progresso
                      </p>
                      <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        Acessar
                      </Button>
                    </div>

                    <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                        <MessageSquare className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                        Modo Exploração
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-white/60 mb-3">
                        Explore temas com um guia pessoal
                      </p>
                      <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        Acessar
                      </Button>
                    </div>
                  </div>

                  {/* Recent Interactions */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-[#29335C] dark:text-white">
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
                        },
                        {
                          title: "Resumo de Física Quântica",
                          time: "Ontem, 15:45",
                          type: "Resumo",
                        },
                        {
                          title: "Dúvidas sobre Cálculo Diferencial",
                          time: "3 dias atrás",
                          type: "Dúvidas",
                        },
                      ].map((interaction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white dark:bg-[#29335C]/10 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-[#29335C]/20 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#E0E1DD]/30 dark:bg-[#29335C]/30 flex items-center justify-center">
                              {interaction.type === "Resumo" ? (
                                <FileText className="h-5 w-5 text-[#FF6B00]" />
                              ) : interaction.type === "Plano" ? (
                                <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                              ) : (
                                <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
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
                </div>
              </TabsContent>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

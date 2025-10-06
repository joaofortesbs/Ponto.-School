import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ModoExploracao from "./ModoExploracao";
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

export default function MentorIA() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [inputMessage, setInputMessage] = useState("");

  return (
    <div className="w-full h-full bg-white p-0">
      <div className="flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-medium text-[#29335C]">Mentor IA</h2>
              <p className="text-xs text-[#64748B]">
                Seu assistente de estudos pessoal. Como posso ajudar você hoje?
              </p>
            </div>
            <Badge className="ml-2 bg-[#FF6B00] text-white border-0 px-2 py-1 text-xs">
              <Sparkles className="h-3 w-3 mr-1" /> Premium
            </Badge>
          </div>
        </div>

        <div className="flex h-[calc(100vh-56px)]">
          {/* Left Column - Chat */}
          <div className="w-[30%] border-r border-gray-200 p-4 flex flex-col">
            <div className="flex-1 overflow-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[#29335C]">
                    Tire suas dúvidas
                  </h3>
                </div>
                <div className="space-y-2">
                  {[
                    "Como resolver equações diferenciais?",
                    "Explique o princípio da incerteza de Heisenberg",
                    "O que é fotossíntese e como funciona?",
                  ].map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 text-xs border-gray-200 hover:bg-gray-50"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua dúvida ou pergunta..."
                  className="flex-1 border-gray-200"
                />
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="w-[70%] p-4 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="bg-gray-100 mb-4">
                <TabsTrigger
                  value="visao-geral"
                  className="data-[state=active]:bg-white"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="plano-estudos"
                  className="data-[state=active]:bg-white"
                >
                  Plano de Estudos
                </TabsTrigger>
                <TabsTrigger
                  value="resumos"
                  className="data-[state=active]:bg-white"
                >
                  Resumos
                </TabsTrigger>
                <TabsTrigger
                  value="desempenho"
                  className="data-[state=active]:bg-white"
                >
                  Desempenho
                </TabsTrigger>
                <TabsTrigger
                  value="modo-exploracao"
                  className="data-[state=active]:bg-white"
                >
                  Modo Exploração
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
                <TabsContent value="visao-geral" className="mt-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                          <FileText className="h-6 w-6 text-[#FF6B00]" />
                        </div>
                        <h3 className="font-medium text-[#29335C] mb-1">
                          Resumos
                        </h3>
                        <p className="text-xs text-[#64748B] mb-3">
                          Resumos inteligentes de conteúdos
                        </p>
                        <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                          Acessar
                        </Button>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                          <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                        </div>
                        <h3 className="font-medium text-[#29335C] mb-1">
                          Plano de Estudos
                        </h3>
                        <p className="text-xs text-[#64748B] mb-3">
                          Planos personalizados para você
                        </p>
                        <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                          Acessar
                        </Button>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                          <BarChart3 className="h-6 w-6 text-[#FF6B00]" />
                        </div>
                        <h3 className="font-medium text-[#29335C] mb-1">
                          Desempenho
                        </h3>
                        <p className="text-xs text-[#64748B] mb-3">
                          Análise do seu progresso
                        </p>
                        <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                          Acessar
                        </Button>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                          <MessageSquare className="h-6 w-6 text-[#FF6B00]" />
                        </div>
                        <h3 className="font-medium text-[#29335C] mb-1">
                          Modo Exploração
                        </h3>
                        <p className="text-xs text-[#64748B] mb-3">
                          Explore temas com um guia pessoal
                        </p>
                        <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                          Acessar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-[#29335C]">
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
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                {interaction.type === "Resumo" ? (
                                  <FileText className="h-5 w-5 text-[#FF6B00]" />
                                ) : interaction.type === "Plano" ? (
                                  <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                                ) : (
                                  <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-[#29335C]">
                                  {interaction.title}
                                </h4>
                                <p className="text-xs text-[#64748B]">
                                  {interaction.type}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-[#64748B]">
                              {interaction.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="plano-estudos" className="mt-0">
                  <div className="p-4 text-center">
                    <h2 className="text-xl font-medium text-[#29335C] mb-4">
                      Plano de Estudos ENEM
                    </h2>
                    <p className="text-[#64748B] mb-6">
                      Criação de um plano personalizado para o ENEM com foco em
                      ciências da natureza e matemática
                    </p>
                    <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                      Criar plano de estudos
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="resumos" className="mt-0">
                  <div className="p-4 text-center">
                    <h2 className="text-xl font-medium text-[#29335C] mb-4">
                      Resumos Inteligentes
                    </h2>
                    <p className="text-[#64748B] mb-6">
                      Gere resumos inteligentes de qualquer conteúdo para
                      estudar de forma mais eficiente
                    </p>
                    <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                      Criar resumo
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="desempenho" className="mt-0">
                  <div className="p-4 text-center">
                    <h2 className="text-xl font-medium text-[#29335C] mb-4">
                      Análise de Desempenho
                    </h2>
                    <p className="text-[#64748B] mb-6">
                      Acompanhe seu progresso e identifique áreas para melhorar
                    </p>
                    <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                      Ver análises
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="modo-exploracao" className="mt-0">
                  <ModoExploracao />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

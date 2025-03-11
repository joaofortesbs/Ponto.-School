import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Atom,
  Paperclip,
  Mic,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export default function EpictusRebrandedInterface() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inputMessage, setInputMessage] = useState("");

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <Atom className="h-8 w-8 text-[#FF6B00]" /> Epictus IA
            <Badge className="ml-2 bg-[#FF6B00] text-white border-0 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Premium
            </Badge>
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Inteligência artificial avançada para potencializar seus estudos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#29335C] flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#29335C] dark:text-white">
                Epictus IA
              </h2>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Versão Premium
              </p>
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeTab === "dashboard" ? "bg-[#FF6B00]/10 text-[#FF6B00]" : "text-[#29335C] dark:text-white hover:bg-[#FF6B00]/10"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Rocket className="h-5 w-5 mr-2" /> Dashboard
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeTab === "chat" ? "bg-[#FF6B00]/10 text-[#FF6B00]" : "text-[#29335C] dark:text-white hover:bg-[#FF6B00]/10"}`}
              onClick={() => setActiveTab("chat")}
            >
              <MessageSquare className="h-5 w-5 mr-2" /> Chat IA
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeTab === "tools" ? "bg-[#FF6B00]/10 text-[#FF6B00]" : "text-[#29335C] dark:text-white hover:bg-[#FF6B00]/10"}`}
              onClick={() => setActiveTab("tools")}
            >
              <Zap className="h-5 w-5 mr-2" /> Ferramentas
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeTab === "knowledge" ? "bg-[#FF6B00]/10 text-[#FF6B00]" : "text-[#29335C] dark:text-white hover:bg-[#FF6B00]/10"}`}
              onClick={() => setActiveTab("knowledge")}
            >
              <Database className="h-5 w-5 mr-2" /> Base de Conhecimento
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${activeTab === "analytics" ? "bg-[#FF6B00]/10 text-[#FF6B00]" : "text-[#29335C] dark:text-white hover:bg-[#FF6B00]/10"}`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 className="h-5 w-5 mr-2" /> Análises
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#29335C] to-[#001427] rounded-lg text-white">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-[#FF6B00]" /> Acesso Premium
            </h3>
            <p className="text-sm mb-3 text-white/80">
              Você tem acesso a todos os recursos premium do Epictus IA.
              Aproveite ao máximo!
            </p>
            <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              Explorar Recursos
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden flex flex-col shadow-sm">
          <div className="border-b border-[#E0E1DD] dark:border-white/10 p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="bg-[#E0E1DD]/30 dark:bg-[#29335C]/20">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                >
                  Chat IA
                </TabsTrigger>
                <TabsTrigger
                  value="tools"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                >
                  Ferramentas
                </TabsTrigger>
                <TabsTrigger
                  value="knowledge"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                >
                  Base de Conhecimento
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50"
                >
                  Análises
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="dashboard" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#29335C] dark:text-white">
                  Bem-vindo ao Epictus IA
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-green-500">Online</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <h3 className="font-medium text-[#29335C] dark:text-white">
                      Assistente Inteligente
                    </h3>
                  </div>
                  <p className="text-sm mb-3 text-[#64748B] dark:text-white/60">
                    Converse com a IA para obter respostas personalizadas e
                    assistência em tempo real.
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    onClick={() => setActiveTab("chat")}
                  >
                    Conversar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center">
                      <Compass className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <h3 className="font-medium text-[#29335C] dark:text-white">
                      Explorador de Conhecimento
                    </h3>
                  </div>
                  <p className="text-sm mb-3 text-[#64748B] dark:text-white/60">
                    Navegue por uma vasta base de conhecimento com visualizações
                    interativas.
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    onClick={() => setActiveTab("knowledge")}
                  >
                    Explorar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <h3 className="font-medium text-[#29335C] dark:text-white">
                      Ferramentas Avançadas
                    </h3>
                  </div>
                  <p className="text-sm mb-3 text-[#64748B] dark:text-white/60">
                    Acesse ferramentas poderosas para potencializar seus estudos
                    e projetos.
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    onClick={() => setActiveTab("tools")}
                  >
                    Acessar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#29335C] to-[#001427] rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Potencialize seus estudos com IA
                    </h3>
                    <p className="mb-4 text-white/80">
                      O Epictus IA combina tecnologia de ponta com metodologias
                      educacionais para oferecer uma experiência de aprendizado
                      personalizada e eficiente.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 cursor-pointer">
                        Aprendizado Adaptativo
                      </Badge>
                      <Badge className="bg-white/20 text-white hover:bg-white/30 cursor-pointer">
                        Análise de Desempenho
                      </Badge>
                      <Badge className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 cursor-pointer">
                        Geração de Conteúdo
                      </Badge>
                      <Badge className="bg-white/20 text-white hover:bg-white/30 cursor-pointer">
                        Tutoria Personalizada
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-[#29335C] dark:text-white">
                  Recursos Disponíveis
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      title: "Assistente de Aprendizado Adaptativo",
                      description:
                        "IA que se adapta ao seu estilo de aprendizado e ritmo",
                      progress: 100,
                      icon: <Brain className="h-5 w-5 text-[#FF6B00]" />,
                    },
                    {
                      title: "Gerador de Planos de Estudo",
                      description:
                        "Crie planos de estudo personalizados baseados em seus objetivos",
                      progress: 100,
                      icon: <BookOpen className="h-5 w-5 text-[#FF6B00]" />,
                    },
                    {
                      title: "Análise Avançada de Desempenho",
                      description:
                        "Visualize e compreenda seu progresso com métricas detalhadas",
                      progress: 100,
                      icon: <BarChart3 className="h-5 w-5 text-[#FF6B00]" />,
                    },
                    {
                      title: "Integração com Fontes de Conhecimento",
                      description:
                        "Conecte-se a bibliotecas digitais e bases de dados acadêmicas",
                      progress: 100,
                      icon: <Database className="h-5 w-5 text-[#FF6B00]" />,
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-[#29335C]/10 p-4 rounded-lg border border-[#E0E1DD] dark:border-white/10 flex items-center justify-between shadow-sm hover:border-[#FF6B00]/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#29335C] dark:text-white">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-[#64748B] dark:text-white/60">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        Disponível
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="mt-0 space-y-6">
              <div className="flex flex-col h-[calc(100vh-320px)]">
                <div className="flex-1 space-y-4 mb-4 border border-[#E0E1DD] dark:border-white/10 rounded-lg p-4 bg-[#f7f9fa] dark:bg-[#001427]/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-[#29335C]/50 rounded-lg p-3 max-w-[80%]">
                      <p className="text-[#29335C] dark:text-white">
                        Olá! Sou o Epictus IA, seu assistente de estudos
                        pessoal. Como posso ajudar você hoje?
                      </p>
                      <div className="text-xs text-[#64748B] dark:text-white/60 mt-1 flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" /> Agora
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#64748B] dark:text-white/60"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-[#E0E1DD]/20 dark:bg-[#29335C]/20 border-[#E0E1DD] dark:border-white/10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#64748B] dark:text-white/60"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-[#29335C] dark:text-white mb-2">
                    Sugestões:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#E0E1DD] dark:border-white/10 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] hover:border-[#FF6B00]/50"
                    >
                      Como resolver equações diferenciais?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#E0E1DD] dark:border-white/10 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] hover:border-[#FF6B00]/50"
                    >
                      Explique o princípio da incerteza de Heisenberg
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#E0E1DD] dark:border-white/10 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] hover:border-[#FF6B00]/50"
                    >
                      Crie um plano de estudos para o ENEM
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#29335C] dark:text-white">
                  Ferramentas
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 h-4 w-4" />
                    <Input
                      placeholder="Buscar ferramentas..."
                      className="pl-9 bg-[#E0E1DD]/20 dark:bg-[#29335C]/20 border-[#E0E1DD] dark:border-white/10 w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "Assistente de Escrita",
                    description: "Ajuda na redação de textos acadêmicos",
                    icon: <FileText className="h-6 w-6 text-[#FF6B00]" />,
                  },
                  {
                    name: "Gerador de Questões",
                    description: "Cria questões personalizadas para estudo",
                    icon: <MessageSquare className="h-6 w-6 text-[#FF6B00]" />,
                  },
                  {
                    name: "Resumidor de Textos",
                    description: "Cria resumos inteligentes de conteúdos",
                    icon: <FileText className="h-6 w-6 text-[#FF6B00]" />,
                  },
                  {
                    name: "Explorador de Conceitos",
                    description: "Visualize relações entre conceitos",
                    icon: <Globe className="h-6 w-6 text-[#FF6B00]" />,
                  },
                  {
                    name: "Analisador de Desempenho",
                    description: "Métricas detalhadas de aprendizado",
                    icon: <BarChart3 className="h-6 w-6 text-[#FF6B00]" />,
                  },
                  {
                    name: "Laboratório de Experimentos",
                    description: "Ambiente para testar conceitos",
                    icon: <Zap className="h-6 w-6 text-[#FF6B00]" />,
                  },
                ].map((tool, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#29335C] dark:text-white">
                          {tool.name}
                        </h3>
                        <Badge className="bg-green-500 text-white mt-1">
                          Disponível
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-[#64748B] dark:text-white/60 mb-3">
                      {tool.description}
                    </p>
                    <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                      Acessar Ferramenta
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#29335C] dark:text-white">
                  Base de Conhecimento
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 h-4 w-4" />
                    <Input
                      placeholder="Buscar conhecimento..."
                      className="pl-9 bg-[#E0E1DD]/20 dark:bg-[#29335C]/20 border-[#E0E1DD] dark:border-white/10 w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Matemática Avançada",
                    description: "Cálculo, Álgebra Linear, Estatística e mais",
                    count: "1.250 artigos",
                    icon: <Code className="h-6 w-6 text-[#FF6B00]" />,
                  },
                  {
                    title: "Física Quântica",
                    description: "Mecânica Quântica, Relatividade e Cosmologia",
                    count: "980 artigos",
                    icon: <Atom className="h-6 w-6 text-[#FF6B00]" />,
                  },
                  {
                    title: "Biologia Molecular",
                    description: "Genética, Bioquímica e Microbiologia",
                    count: "1.120 artigos",
                    icon: <Database className="h-6 w-6 text-[#FF6B00]" />,
                  },
                  {
                    title: "Literatura e Linguística",
                    description: "Análise Literária, Gramática e Redação",
                    count: "850 artigos",
                    icon: <BookOpen className="h-6 w-6 text-[#FF6B00]" />,
                  },
                ].map((category, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-[#29335C] dark:text-white">
                          {category.title}
                        </h3>
                        <p className="text-xs text-[#64748B] dark:text-white/60">
                          {category.count}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-[#64748B] dark:text-white/60 mb-3">
                      {category.description}
                    </p>
                    <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                      Explorar
                    </Button>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-[#29335C] to-[#001427] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">
                  Recomendado para você
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Cálculo Diferencial e Integral",
                      type: "Artigo",
                      relevance: "98% relevante",
                    },
                    {
                      title: "Introdução à Física Quântica",
                      type: "Curso",
                      relevance: "95% relevante",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge className="bg-[#FF6B00] text-white">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/70 mt-1">
                        {item.relevance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#29335C] dark:text-white">
                  Análises
                </h2>
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  Gerar Relatório
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 shadow-sm">
                  <h3 className="font-medium text-[#29335C] dark:text-white mb-3">
                    Uso do Epictus IA
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-[#64748B] dark:text-white/60">
                          Chat IA
                        </span>
                        <span className="text-sm text-[#64748B] dark:text-white/60">
                          65%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#E0E1DD] dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-[#64748B] dark:text-white/60">
                          Ferramentas
                        </span>
                        <span className="text-sm text-[#64748B] dark:text-white/60">
                          42%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#E0E1DD] dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full"
                          style={{ width: "42%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-[#64748B] dark:text-white/60">
                          Base de Conhecimento
                        </span>
                        <span className="text-sm text-[#64748B] dark:text-white/60">
                          28%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#E0E1DD] dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full"
                          style={{ width: "28%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 shadow-sm">
                  <h3 className="font-medium text-[#29335C] dark:text-white mb-3">
                    Tópicos Mais Acessados
                  </h3>
                  <div className="space-y-3">
                    {[
                      { topic: "Cálculo Diferencial", count: 28 },
                      { topic: "Física Quântica", count: 23 },
                      { topic: "Redação Dissertativa", count: 19 },
                      { topic: "Biologia Celular", count: 15 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <span className="text-[#29335C] dark:text-white">
                          {item.topic}
                        </span>
                        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20">
                          {item.count} acessos
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 shadow-sm">
                  <h3 className="font-medium text-[#29335C] dark:text-white mb-3">
                    Feedback das Respostas
                  </h3>
                  <div className="flex items-center justify-around mb-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-green-500">
                        <ThumbsUp className="h-5 w-5" />
                        <span className="text-xl font-bold">92%</span>
                      </div>
                      <span className="text-xs text-[#64748B] dark:text-white/60">
                        Positivo
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-red-500">
                        <ThumbsDown className="h-5 w-5" />
                        <span className="text-xl font-bold">8%</span>
                      </div>
                      <span className="text-xs text-[#64748B] dark:text-white/60">
                        Negativo
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] dark:text-white/60 text-center">
                    Baseado nas últimas 100 interações
                  </p>
                </div>

                <div className="bg-white dark:bg-[#29335C]/10 p-4 rounded-xl border border-[#E0E1DD] dark:border-white/10 shadow-sm">
                  <h3 className="font-medium text-[#29335C] dark:text-white mb-3">
                    Tempo de Uso
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#29335C] dark:text-white">
                        Esta semana
                      </span>
                      <span className="text-[#FF6B00] font-medium">
                        12h 30min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#29335C] dark:text-white">
                        Semana passada
                      </span>
                      <span className="text-[#64748B] dark:text-white/60">
                        10h 45min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#29335C] dark:text-white">
                        Este mês
                      </span>
                      <span className="text-[#64748B] dark:text-white/60">
                        42h 15min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#29335C] dark:text-white">
                        Total
                      </span>
                      <span className="text-[#64748B] dark:text-white/60">
                        156h 20min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

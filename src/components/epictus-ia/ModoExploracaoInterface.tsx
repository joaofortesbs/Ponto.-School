import React, { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "./ThemeToggle";
import {
  Brain,
  FileText,
  BookOpen,
  Lightbulb,
  Compass,
  Search,
  ChevronRight,
  Rocket,
  Star,
  Globe,
  Zap,
  ArrowRight,
  MessageSquare,
  Clock,
  Plus,
  Filter,
  Sparkles,
} from "lucide-react";

export default function ModoExploracaoInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const topics = [
    {
      id: "fisica-quantica",
      title: "Física Quântica",
      description:
        "Explore os princípios fundamentais da física quântica e suas aplicações",
      icon: <Zap className="h-6 w-6 text-[#FF6B00]" />,
      progress: 45,
      subtopics: [
        "Princípio da Incerteza de Heisenberg",
        "Dualidade Onda-Partícula",
        "Superposição Quântica",
        "Emaranhamento Quântico",
        "Interpretação de Copenhague",
      ],
    },
    {
      id: "calculo-diferencial",
      title: "Cálculo Diferencial",
      description:
        "Aprofunde-se nos conceitos e aplicações do cálculo diferencial",
      icon: <BookOpen className="h-6 w-6 text-[#FF6B00]" />,
      progress: 72,
      subtopics: [
        "Limites e Continuidade",
        "Derivadas e Regras de Derivação",
        "Aplicações da Derivada",
        "Otimização",
        "Teorema do Valor Médio",
      ],
    },
    {
      id: "literatura-brasileira",
      title: "Literatura Brasileira",
      description:
        "Conheça os principais movimentos e autores da literatura brasileira",
      icon: <FileText className="h-6 w-6 text-[#FF6B00]" />,
      progress: 28,
      subtopics: [
        "Modernismo Brasileiro",
        "Semana de Arte Moderna",
        "Machado de Assis e o Realismo",
        "Poesia Concreta",
        "Literatura Contemporânea",
      ],
    },
    {
      id: "biologia-molecular",
      title: "Biologia Molecular",
      description:
        "Entenda os mecanismos moleculares que regem os processos biológicos",
      icon: <Globe className="h-6 w-6 text-[#FF6B00]" />,
      progress: 15,
      subtopics: [
        "Estrutura do DNA e RNA",
        "Replicação do DNA",
        "Transcrição e Tradução",
        "Regulação Gênica",
        "Técnicas de Biologia Molecular",
      ],
    },
    {
      id: "historia-mundial",
      title: "História Mundial",
      description:
        "Viaje pelos principais eventos que moldaram o mundo contemporâneo",
      icon: <Globe className="h-6 w-6 text-[#FF6B00]" />,
      progress: 60,
      subtopics: [
        "Revolução Industrial",
        "Primeira e Segunda Guerras Mundiais",
        "Guerra Fria",
        "Descolonização da África e Ásia",
        "Globalização",
      ],
    },
    {
      id: "inteligencia-artificial",
      title: "Inteligência Artificial",
      description:
        "Descubra os fundamentos e aplicações da inteligência artificial",
      icon: <Brain className="h-6 w-6 text-[#FF6B00]" />,
      progress: 38,
      subtopics: [
        "Machine Learning",
        "Redes Neurais",
        "Processamento de Linguagem Natural",
        "Visão Computacional",
        "Ética na IA",
      ],
    },
  ];

  const filteredTopics = searchQuery
    ? topics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : topics;

  const selectedTopicData = topics.find((topic) => topic.id === selectedTopic);

  const { theme } = useTheme();

  return (
    <div
      className={`w-full h-full ${theme === "dark" ? "bg-[#001427] text-white" : "bg-[#f7f9fa] text-[#29335C]"} p-6 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <Compass className="h-6 w-6 text-[#FF6B00]" /> Modo Exploração
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar tópicos..."
                className="pl-10 border-gray-200 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20 w-60 bg-white dark:bg-[#29335C]/20 dark:border-gray-700 text-[#29335C] dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white shadow-sm"
              onClick={() => {}}
            >
              <Plus className="h-4 w-4 mr-2" /> Novo Tópico
            </Button>
            <div className="h-8 w-8">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {selectedTopic ? (
          <div className="space-y-6">
            <Button
              variant="outline"
              className="text-[#FF6B00] border-[#FF6B00]/20 hover:bg-[#FF6B00]/5"
              onClick={() => setSelectedTopic(null)}
            >
              ← Voltar para todos os tópicos
            </Button>

            {selectedTopicData && (
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                    {selectedTopicData.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-[#29335C] dark:text-white">
                        {selectedTopicData.title}
                      </h3>
                      <Badge className="bg-[#FF6B00] text-white">
                        Explorando
                      </Badge>
                    </div>
                    <p className="text-[#64748B] dark:text-white/80 mt-1">
                      {selectedTopicData.description}
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-[#29335C] dark:text-white">
                          Progresso
                        </span>
                        <span className="text-xs text-[#FF6B00] font-medium">
                          {selectedTopicData.progress}%
                        </span>
                      </div>
                      <Progress
                        value={selectedTopicData.progress}
                        className="h-2 bg-gray-200 dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 dark:bg-[#29335C]/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h4 className="font-bold text-[#29335C] dark:text-white mb-3 flex items-center gap-2">
                      <Compass className="h-5 w-5 text-[#FF6B00]" /> Mapa de
                      Aprendizado
                    </h4>
                    <div className="space-y-3">
                      {selectedTopicData.subtopics.map((subtopic, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white dark:bg-[#1E293B] rounded-lg border border-gray-100 dark:border-gray-800 hover:border-[#FF6B00]/20 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-xs font-medium text-[#FF6B00]">
                              {index + 1}
                            </div>
                            <span className="text-sm text-[#29335C] dark:text-white">
                              {subtopic}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#29335C]/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h4 className="font-bold text-[#29335C] dark:text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-[#FF6B00]" /> Recursos
                      Recomendados
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          type: "Artigo",
                          title: `Introdução a ${selectedTopicData.title}`,
                          time: "15 min",
                        },
                        {
                          type: "Vídeo",
                          title: `Conceitos Fundamentais de ${selectedTopicData.title}`,
                          time: "25 min",
                        },
                        {
                          type: "Quiz",
                          title: `Teste seus conhecimentos em ${selectedTopicData.title}`,
                          time: "10 min",
                        },
                        {
                          type: "Exercícios",
                          title: `Pratique ${selectedTopicData.title} com exemplos`,
                          time: "30 min",
                        },
                      ].map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white dark:bg-[#1E293B] rounded-lg border border-gray-100 dark:border-gray-800 hover:border-[#FF6B00]/20 transition-all cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`
                                ${
                                  resource.type === "Artigo"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    : resource.type === "Vídeo"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                      : resource.type === "Quiz"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                }
                              `}
                              >
                                {resource.type}
                              </Badge>
                              <span className="text-sm text-[#29335C] dark:text-white">
                                {resource.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 ml-14">
                              <Clock className="h-3 w-3 text-[#64748B] dark:text-white/60" />
                              <span className="text-xs text-[#64748B] dark:text-white/60">
                                {resource.time}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#FF6B00] hover:bg-[#FF6B00]/10"
                          >
                            Acessar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-5 rounded-xl text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">
                        Iniciar Sessão de Exploração Guiada
                      </h3>
                      <p className="text-white/80 mb-4">
                        Comece uma conversa com o Epictus IA para explorar{" "}
                        {selectedTopicData.title} de forma interativa e
                        personalizada.
                      </p>
                      <Button className="bg-white text-[#29335C] hover:bg-white/90 shadow-sm">
                        Iniciar Conversa <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-[#29335C] to-[#001427] p-6 rounded-xl text-white shadow-lg mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FF6B00]/20">
                  <Compass className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Modo Exploração</h2>
                  <p className="text-white/80 mt-1 mb-4">
                    Explore temas de forma guiada com o Epictus IA. Escolha um
                    tópico abaixo para começar uma jornada de aprendizado
                    personalizada.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 cursor-pointer">
                      Aprendizado Interativo
                    </Badge>
                    <Badge className="bg-white/20 text-white hover:bg-white/30 cursor-pointer">
                      Conteúdo Personalizado
                    </Badge>
                    <Badge className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 cursor-pointer">
                      Exploração Guiada
                    </Badge>
                    <Badge className="bg-white/20 text-white hover:bg-white/30 cursor-pointer">
                      Aprofundamento Temático
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#FF6B00]/50 cursor-pointer group"
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center group-hover:bg-[#FF6B00]/20 transition-colors">
                      {topic.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#29335C] dark:text-white text-lg">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-[#FF6B00]" />
                        <Star className="h-3 w-3 text-[#FF6B00]" />
                        <Star className="h-3 w-3 text-[#FF6B00]" />
                        <Star className="h-3 w-3 text-[#FF6B00]" />
                        <Star className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                        <span className="text-xs text-[#64748B] dark:text-white/60 ml-1">
                          4.0
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">
                    {topic.description}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#29335C] dark:text-white">
                        Progresso
                      </span>
                      <span className="text-xs text-[#FF6B00]">
                        {topic.progress}%
                      </span>
                    </div>
                    <Progress
                      value={topic.progress}
                      className="h-1.5 bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white shadow-sm">
                    Explorar Tópico
                  </Button>
                </div>
              ))}
            </div>

            {filteredTopics.length === 0 && (
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-2">
                  Nenhum tópico encontrado
                </h3>
                <p className="text-[#64748B] dark:text-white/60 mb-4">
                  Não encontramos nenhum tópico correspondente à sua busca.
                </p>
                <Button
                  variant="outline"
                  className="text-[#FF6B00] border-[#FF6B00]/20 hover:bg-[#FF6B00]/5"
                  onClick={() => setSearchQuery("")}
                >
                  Limpar busca
                </Button>
              </div>
            )}

            <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md mt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                  <Rocket className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-2">
                    Não encontrou o que procura?
                  </h3>
                  <p className="text-[#64748B] dark:text-white/60 mb-4">
                    O Epictus IA pode criar um plano de exploração personalizado
                    para qualquer tópico de seu interesse.
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Digite um tópico de seu interesse..."
                      className="border-gray-200 dark:border-gray-700 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20 bg-white dark:bg-[#29335C]/20 text-[#29335C] dark:text-white"
                    />
                    <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white shadow-sm whitespace-nowrap">
                      Criar Plano
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

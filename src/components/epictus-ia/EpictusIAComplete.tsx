import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import SectionCard from "@/components/epictus-ia/components/SectionCard";
import SectionContent from "@/components/epictus-ia/components/SectionContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInteligente, CriarConteudo, AprenderMaisRapido, AnalisarCorrigir, OrganizarOtimizar, FerramentasExtras } from "@/components/epictus-ia/sections";

import {
  Brain,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Moon,
  Sun,
  Languages,
  MessageSquare,
  BookOpen,
  PenTool,
  FileText,
  BarChart3,
  Calendar,
  Wrench, // Replacing Tool with Wrench
  PlusCircle,
  ArrowRight,
  Lightbulb,
  Zap,
  BrainCircuit,
} from "lucide-react";

// Definição das abas/seções
const sections = [
  {
    id: "chat-inteligente",
    name: "Chat Inteligente",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-400",
    component: ChatInteligente,
    badge: "Popular",
    description: "Converse com diferentes assistentes de IA especializados"
  },
  {
    id: "criar-conteudo",
    name: "Criar Conteúdo",
    icon: <PenTool className="h-6 w-6" />,
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-400",
    component: CriarConteudo,
    badge: "Novo",
    description: "Ferramentas para criar materiais e conteúdos didáticos"
  },
  {
    id: "aprender-mais-rapido",
    name: "Aprender Mais Rápido",
    icon: <Zap className="h-6 w-6" />,
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-400",
    component: AprenderMaisRapido,
    badge: null,
    description: "Resumos, mapas mentais e métodos para aprendizado eficiente"
  },
  {
    id: "analisar-corrigir",
    name: "Analisar e Corrigir",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "from-purple-500 to-violet-600",
    borderColor: "border-purple-400",
    component: AnalisarCorrigir,
    badge: "Beta",
    description: "Ferramentas para análise de desempenho e correções"
  },
  {
    id: "organizar-otimizar",
    name: "Organizar e Otimizar",
    icon: <Calendar className="h-6 w-6" />,
    color: "from-red-500 to-pink-600",
    borderColor: "border-red-400",
    component: OrganizarOtimizar,
    badge: null,
    description: "Planejadores, cronogramas e ferramentas de organização"
  },
  {
    id: "ferramentas-extras",
    name: "Ferramentas Extras",
    icon: <Wrench className="h-6 w-6" />, // Changed from Tool to Wrench
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-400",
    component: FerramentasExtras,
    badge: "Experimental",
    description: "Outras ferramentas especializadas para diversos fins"
  }
];

export default function EpictusIAComplete() {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("chat-inteligente");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSections, setFilteredSections] = useState(sections);

  const carouselRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Efeito para quando a busca é ativada, foca no input
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Atualiza o índice do carrossel quando a seção ativa muda
  useEffect(() => {
    const index = sections.findIndex(section => section.id === activeSection);
    if (index !== -1) {
      setCarouselIndex(index);
    }
  }, [activeSection]);

  // Filtra as seções com base na busca
  useEffect(() => {
    if (searchQuery) {
      const filtered = sections.filter(section => 
        section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections(sections);
    }
  }, [searchQuery]);

  // Avança no carrossel
  const nextSection = () => {
    if (carouselIndex < sections.length - 1) {
      setCarouselIndex(prev => prev + 1);
      setActiveSection(sections[carouselIndex + 1].id);
    } else {
      setCarouselIndex(0);
      setActiveSection(sections[0].id);
    }
  };

  // Volta no carrossel
  const prevSection = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(prev => prev - 1);
      setActiveSection(sections[carouselIndex - 1].id);
    } else {
      setCarouselIndex(sections.length - 1);
      setActiveSection(sections[sections.length - 1].id);
    }
  };

  // Seleciona uma seção específica
  const selectSection = (index: number) => {
    setCarouselIndex(index);
    setActiveSection(sections[index].id);
  };

  // Fecha o painel de busca ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`w-full h-full flex flex-col ${theme === "dark" ? "bg-[#001427]" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Header com título e informações da IA */}
      <div className={`px-6 py-4 flex items-center justify-between border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center gap-2`}>
              Epictus IA
              <Badge className="ml-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white hover:from-[#FF9B50] hover:to-[#FF6B00] transition-all duration-300">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Premium
              </Badge>
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Ferramenta com inteligência artificial para potencializar seus estudos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Buscar ferramenta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${showSettings ? "animate-spin" : ""}`} style={{ animationDuration: '3s' }} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Painel de busca (aparece quando showSearch é true) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`border-b ${theme === "dark" ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white"} backdrop-blur-lg`}
          >
            <div className="p-4 flex items-center gap-3">
              <Search className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <input
                ref={searchInputRef}
                className={`flex-1 bg-transparent border-none outline-none text-lg ${theme === "dark" ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"}`}
                placeholder="Buscar ferramentas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
              >
                <X className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              </Button>
            </div>

            {searchQuery && (
              <div className="px-4 pb-4">
                <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"}`}>
                  <h3 className={`text-sm font-medium mb-2 px-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Resultados ({filteredSections.length})
                  </h3>
                  <div className="space-y-1">
                    {filteredSections.map((section, index) => (
                      <div
                        key={section.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-200/70"} transition-colors`}
                        onClick={() => {
                          setActiveSection(section.id);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                          {section.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{section.name}</p>
                          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{section.description}</p>
                        </div>
                      </div>
                    ))}

                    {filteredSections.length === 0 && (
                      <div className={`p-3 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Nenhuma ferramenta encontrada com "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Painel de configurações (aparece quando showSettings é true) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 right-0 h-full w-80 z-50 border-l ${theme === "dark" ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"} shadow-2xl`}
          >
            <div className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Configurações</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowSettings(false)}
                >
                  <X className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                </Button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h3 className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Aparência</h3>
                  <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Tema</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`gap-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      >
                        {theme === "dark" ? (
                          <>
                            <Moon className="h-4 w-4" />
                            <span>Escuro</span>
                          </>
                        ) : (
                          <>
                            <Sun className="h-4 w-4" />
                            <span>Claro</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Idioma</h3>
                  <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Idioma da interface</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`gap-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                      >
                        <Languages className="h-4 w-4" />
                        <span>Português</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Acessibilidade</h3>
                  <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Reduzir animações</span>
                        <div className="flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-600 px-1">
                          <div className="h-4 w-4 rounded-full bg-white transition-all"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Alto contraste</span>
                        <div className="flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-600 px-1">
                          <div className="h-4 w-4 rounded-full bg-white transition-all"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Texto maior</span>
                        <div className="flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-600 px-1">
                          <div className="h-4 w-4 rounded-full bg-white transition-all"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t mt-auto">
                <Button
                  variant="default"
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00]"
                  onClick={() => setShowSettings(false)}
                >
                  Salvar alterações
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        {/* Carrossel 3D de seleção de seções */}
        <div className="relative py-10">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}
              onClick={prevSection}
            >
              <ChevronLeft className={`h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
            </Button>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50"}`}
              onClick={nextSection}
            >
              <ChevronRight className={`h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
            </Button>
          </div>

          <motion.div 
            ref={carouselRef}
            className="flex items-center justify-center h-[240px]"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x < -50 || velocity.x < -500) {
                nextSection();
              } else if (offset.x > 50 || velocity.x > 500) {
                prevSection();
              }
            }}
          >
            <div className="flex items-center justify-center relative">
              {sections.map((section, index) => {
                // Calcular a posição relativa ao item ativo
                const position = index - carouselIndex;

                return (
                  <motion.div
                    key={section.id}
                    className={`absolute select-none cursor-pointer`}
                    animate={{
                      scale: position === 0 ? 1 : 0.85 - Math.min(Math.abs(position) * 0.1, 0.3),
                      x: position * 200,
                      opacity: Math.abs(position) > 2 ? 0 : 1 - Math.abs(position) * 0.3,
                      zIndex: 10 - Math.abs(position),
                      rotateY: position * 10,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={() => selectSection(index)}
                  >
                    <div 
                      className={cn(
                        `w-64 rounded-xl overflow-hidden border-2 transform transition-all group`,
                        position === 0 ? `shadow-lg ${section.borderColor}` : 'border-transparent',
                        theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
                      )}
                      style={{
                        backdropFilter: "blur(8px)",
                        perspective: "1000px",
                        height: position === 0 ? "200px" : "180px",
                        minHeight: position === 0 ? "200px" : "180px"
                      }}
                    >
                      <div className={`h-full p-5 flex flex-col justify-between relative overflow-hidden`}>
                        {/* Efeito de brilho quando é o item ativo */}
                        {position === 0 && (
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -inset-[50px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 rotate-45 translate-x-[-120%] group-hover:translate-x-[120%] duration-1500 transition-all ease-in-out"></div>
                          </div>
                        )}

                        <div className="flex justify-between items-start">
                          <div 
                            className={`w-12 h-12 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center`}
                          >
                            {section.icon}
                          </div>

                          {section.badge && (
                            <Badge 
                              className={`bg-white/90 text-xs font-medium animate-pulse ${
                                section.badge === "Novo" 
                                  ? "text-emerald-600" 
                                  : section.badge === "Beta" 
                                  ? "text-purple-600" 
                                  : section.badge === "Popular" 
                                  ? "text-blue-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {section.badge}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className={`text-base font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {section.name}
                          </h3>
                          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} line-clamp-3`}>
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Indicadores (bolinhas) para o carrossel */}
          <div className="flex justify-center mt-6 gap-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === carouselIndex 
                    ? "w-6 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50]" 
                    : theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                }`}
                onClick={() => selectSection(index)}
              />
            ))}
          </div>
        </div>

        {/* Conteúdo da seção ativa */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <motion.div 
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Tabs value={activeSection} onValueChange={setActiveSection} className="h-full">
              <TabsContent value="chat-inteligente" className="mt-0 h-full">
                <ChatInteligente />
              </TabsContent>
              <TabsContent value="criar-conteudo" className="mt-0 h-full">
                <CriarConteudo />
              </TabsContent>
              <TabsContent value="aprender-mais-rapido" className="mt-0 h-full">
                <AprenderMaisRapido />
              </TabsContent>
              <TabsContent value="analisar-corrigir" className="mt-0 h-full">
                <AnalisarCorrigir />
              </TabsContent>
              <TabsContent value="organizar-otimizar" className="mt-0 h-full">
                <OrganizarOtimizar />
              </TabsContent>
              <TabsContent value="ferramentas-extras" className="mt-0 h-full">
                <FerramentasExtras />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
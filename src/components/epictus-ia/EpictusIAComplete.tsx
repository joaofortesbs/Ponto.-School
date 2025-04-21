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
import { TurboModeProvider } from "./context/TurboModeContext";
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
  Wrench,
  PlusCircle,
  ArrowRight,
  Lightbulb,
  Zap,
  BrainCircuit,
} from "lucide-react";
import EpictusIAHeader from "./EpictusIAHeader";

// Definição das abas/seções
const sections = [
  {
    id: "chat-inteligente",
    name: "Chat Inteligente",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Converse com assistentes especializados",
    content: <ChatInteligente />
  },
  {
    id: "criar-conteudo",
    name: "Criar Conteúdo",
    icon: <PenTool className="h-5 w-5" />,
    description: "Gere materiais didáticos e recursos",
    content: <CriarConteudo />
  },
  {
    id: "aprender-mais-rapido",
    name: "Aprender Mais Rápido",
    icon: <Zap className="h-5 w-5" />,
    description: "Ferr. para acelerar seu aprendizado",
    content: <AprenderMaisRapido />
  },
  {
    id: "analisar-corrigir",
    name: "Analisar e Corrigir",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Correção inteligente de conteúdos",
    content: <AnalisarCorrigir />
  },
  {
    id: "organizar-otimizar",
    name: "Organizar e Otimizar",
    icon: <Calendar className="h-5 w-5" />,
    description: "Técnicas para melhorar eficiência",
    content: <OrganizarOtimizar />
  },
  {
    id: "ferramentas-extras",
    name: "Ferramentas Extras",
    icon: <Wrench className="h-5 w-5" />,
    description: "Recursos adicionais para diversos fins"
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

  // Avança no carrossel com transição suave para loop infinito
  const nextSection = () => {
    const newIndex = carouselIndex < sections.length - 1 ? carouselIndex + 1 : 0;
    setCarouselIndex(newIndex);
    setActiveSection(sections[newIndex].id);
  };

  // Volta no carrossel com transição suave para loop infinito
  const prevSection = () => {
    const newIndex = carouselIndex > 0 ? carouselIndex - 1 : sections.length - 1;
    setCarouselIndex(newIndex);
    setActiveSection(sections[newIndex].id);
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
    <TurboModeProvider>
      <div className={`w-full flex flex-col ${theme === "dark" ? "bg-[#001427]" : "bg-gray-50"} transition-colors duration-300 overflow-y-auto min-h-screen`}>
        <div className="p-4">
          <EpictusIAHeader />
        </div>

        {/* Barra de controles (fixa) */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-[#1E293B] shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-between">
            {/* Título e navegação */}
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-[#FF6B00]" />
              <span className="font-medium text-[#29335C] dark:text-white">Epictus IA</span>
              <Badge
                variant="outline"
                className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20 px-1.5 py-0 text-[10px] font-medium"
              >
                Premium
              </Badge>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowSearch(!showSearch)}
                      className="h-8 w-8 rounded-full text-[#64748B] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E293B]"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Buscar</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="h-8 w-8 rounded-full text-[#64748B] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E293B]"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Alternar tema</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowSettings(!showSettings)}
                      className="h-8 w-8 rounded-full text-[#64748B] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E293B]"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configurações</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Barra de busca */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 dark:border-[#1E293B]"
              >
                <div className="max-w-[1400px] mx-auto px-4 py-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Buscar funcionalidade..."
                      className="pl-10 pr-10 h-10 bg-gray-50 dark:bg-[#1E293B] border-gray-200 dark:border-[#2D3A4F] focus-visible:ring-[#FF6B00]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                      </button>
                    )}
                  </div>

                  {/* Resultados da busca */}
                  {searchQuery && (
                    <div className="mt-2 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E293B] rounded-md shadow-lg">
                      {filteredSections.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto p-1">
                          {filteredSections.map((section, index) => (
                            <button
                              key={section.id}
                              className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-[#1E293B] rounded-md flex items-center space-x-2"
                              onClick={() => {
                                setActiveSection(section.id);
                                setShowSearch(false);
                                setSearchQuery("");
                              }}
                            >
                              <span className="text-[#FF6B00]">{section.icon}</span>
                              <div>
                                <div className="font-medium text-[#29335C] dark:text-white">
                                  {section.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {section.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Nenhum resultado encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navegação por abas */}
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="max-w-[1400px] mx-auto px-4">
              <Tabs
                value={activeSection}
                onValueChange={setActiveSection}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-[#64748B] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E293B] lg:hidden"
                    onClick={prevSection}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <TabsList className="bg-transparent h-auto p-0 flex space-x-1 overflow-x-auto">
                    {sections.map((section, index) => (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className={cn(
                          "py-2 px-3 whitespace-nowrap data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:shadow-none rounded-md text-[#64748B] dark:text-gray-400 font-medium",
                          "focus-visible:ring-1 focus-visible:ring-[#FF6B00] focus-visible:outline-none transition-colors"
                        )}
                        onClick={() => selectSection(index)}
                      >
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <span>{section.name}</span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-[#64748B] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E293B] lg:hidden"
                    onClick={nextSection}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 max-w-[1400px] mx-auto px-4 py-6 w-full">
          <Tabs value={activeSection} className="w-full">
            {sections.map((section) => (
              <TabsContent
                key={section.id}
                value={section.id}
                className="w-full mt-0 h-full"
              >
                {section.id === "ferramentas-extras" ? <FerramentasExtras /> : section.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </TurboModeProvider>
  );
}
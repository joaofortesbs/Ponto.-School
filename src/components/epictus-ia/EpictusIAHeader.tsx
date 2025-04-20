
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Search,
  Settings,
  Moon,
  Sun,
  Bell,
  MessageSquare,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

interface EpictusIAHeaderProps {
  theme: string;
  setShowSearch: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setTheme: (theme: string) => void;
}

const EpictusIAHeader: React.FC<EpictusIAHeaderProps> = ({ 
  theme, 
  setShowSearch, 
  setShowSettings, 
  setTheme 
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 epictus-header-blur ${
        scrolled
          ? theme === "dark"
            ? "bg-gray-900/90 border-b border-gray-800"
            : "bg-white/90 border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="w-full">
        {/* Barra de navegação principal */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 epictus-header-title">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] flex items-center justify-center epictus-header-icon epictus-logo-glow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <path d="M12 2a8 8 0 0 0-8 8c0 1.5.8 3 2 4s2.5 1.5 2.5 2.5.5 1.5 1.5 1.5h4c1 0 1.5-.5 1.5-1.5s1.3-1.5 2.5-2.5 2-2.5 2-4a8 8 0 0 0-8-8z"></path>
                <path d="M12 19v3"></path>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight dark:text-white text-gray-900">
                  Epictus IA
                </h1>
                <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white text-xs font-medium epictus-header-badge">
                  Premium
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 epictus-header-subtitle">
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
                    className={`${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"} rounded-full transition-all duration-200`}
                    onClick={() => setShowSearch(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Buscar ferramentas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"} rounded-full transition-all duration-200`}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Mensagens</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"} rounded-full transition-all duration-200`}
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Notificações</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"} rounded-full transition-all duration-200`}
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"} rounded-full transition-all duration-200`}
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Configurações</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"} rounded-full transition-all duration-200`}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Ajuda</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EpictusIAHeader;

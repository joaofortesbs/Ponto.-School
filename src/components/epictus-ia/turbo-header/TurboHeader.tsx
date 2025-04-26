
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LogoSection from "./LogoSection";
import PersonalitiesDropdown from "./PersonalitiesDropdown";
import { 
  History, 
  Settings, 
  Save, 
  FileText, 
  HelpCircle,
  Wrench, // Substituindo Tool por Wrench
  Moon, 
  Sun, 
  Search
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import HistoricoModal from "../modals/HistoricoModal";
import { ErrorBoundary } from "react-error-boundary";

interface TurboHeaderProps {
  className?: string;
}

// Componente de Fallback para tratamento de erros
const HeaderErrorFallback = ({ error, resetErrorBoundary }) => {
  console.error("Erro no TurboHeader:", error);
  return (
    <div className="w-full bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200 p-3 rounded-md flex items-center justify-between">
      <span className="text-sm">Erro ao carregar o cabeçalho</span>
      <Button variant="destructive" size="sm" onClick={resetErrorBoundary}>Recarregar</Button>
    </div>
  );
};

const TurboHeader: React.FC<TurboHeaderProps> = ({ className }) => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();
  const [isHistoricoModalOpen, setHistoricoModalOpen] = useState(false);

  // Log de diagnóstico ao montar o componente
  useEffect(() => {
    console.log("TurboHeader montado");
    setMounted(true);
    
    return () => {
      console.log("TurboHeader desmontado");
    };
  }, []);

  const toggleTheme = () => {
    try {
      setTheme(theme === "dark" ? "light" : "dark");
      console.log("Tema alternado para:", theme === "dark" ? "light" : "dark");
    } catch (error) {
      console.error("Erro ao alternar tema:", error);
    }
  };

  const handleHistoricoClick = () => {
    try {
      console.log("Botão de histórico clicado");
      setHistoricoModalOpen(true);
    } catch (error) {
      console.error("Erro ao abrir modal de histórico:", error);
    }
  };

  const handleCloseHistoricoModal = () => {
    try {
      console.log("Fechando modal de histórico");
      setHistoricoModalOpen(false);
    } catch (error) {
      console.error("Erro ao fechar modal de histórico:", error);
    }
  };

  // Verificar se o componente está montado para evitar problemas de renderização SSR
  if (!mounted) {
    console.log("TurboHeader aguardando montagem");
    return null;
  }

  try {
    return (
      <ErrorBoundary FallbackComponent={HeaderErrorFallback}>
        <header className={cn("w-full bg-background dark:bg-[#001427]/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between sticky top-0 z-50", className)}>
          {/* Logo e Título */}
          <LogoSection />

          {/* Ações do Cabeçalho */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Seletor de Personalidade */}
            <PersonalitiesDropdown />

            {/* Ícones de Ação */}
            <div className="flex items-center">
              <TooltipProvider>
                {/* Histórico */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={handleHistoricoClick}
                      aria-label="Ver histórico"
                    >
                      <History className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Histórico</p>
                  </TooltipContent>
                </Tooltip>

                {/* Salvar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      aria-label="Salvar conversa"
                    >
                      <Save className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Salvar</p>
                  </TooltipContent>
                </Tooltip>

                {/* Exportar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      aria-label="Exportar conversa"
                    >
                      <FileText className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar</p>
                  </TooltipContent>
                </Tooltip>

                {/* Buscar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      aria-label="Buscar na conversa"
                    >
                      <Search className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Buscar</p>
                  </TooltipContent>
                </Tooltip>

                {/* Configurações */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      aria-label="Configurações"
                    >
                      <Settings className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configurações</p>
                  </TooltipContent>
                </Tooltip>

                {/* Ferramentas */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      aria-label="Ferramentas"
                    >
                      <Wrench className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ferramentas</p>
                  </TooltipContent>
                </Tooltip>

                {/* Ajuda */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      aria-label="Ajuda"
                    >
                      <HelpCircle className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ajuda</p>
                  </TooltipContent>
                </Tooltip>

                {/* Alternar Tema */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={toggleTheme}
                      aria-label="Alternar tema"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                      ) : (
                        <Moon className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tema: {theme === "dark" ? "Claro" : "Escuro"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        {/* Modal de Histórico */}
        <HistoricoModal 
          isOpen={isHistoricoModalOpen} 
          onClose={handleCloseHistoricoModal} 
        />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Erro fatal ao renderizar TurboHeader:", error);
    return (
      <div className="w-full bg-red-100 dark:bg-red-900/20 p-3 text-center text-red-800 dark:text-red-200">
        Erro ao carregar o cabeçalho. Por favor, recarregue a página.
      </div>
    );
  }
};

export default TurboHeader;


import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  BrainCircuit, 
  Search, 
  Settings, 
  Sparkles,

  X,
  ChevronDown,
  Bell,
  User,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const EpictusIAHeader: React.FC = () => {
  const { theme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled 
          ? `${theme === "dark" ? "bg-[#001427]/90" : "bg-white/90"} shadow-md` 
          : `${theme === "dark" ? "bg-[#001427]" : "bg-white"}`
      } border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
    >
      <div className="max-w-screen-2xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo e título */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-lg">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] blur-sm opacity-40 group-hover:opacity-70 transition-opacity"></div>
                <BrainCircuit className="h-6 w-6 text-white relative z-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-[#001427] rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-800">
                <Zap className="h-3 w-3 text-[#FF6B00]" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center">
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] mr-2">
                  Epictus IA
                </h1>
                <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white hover:from-[#FF9B50] hover:to-[#FF6B00] transition-all duration-300 font-medium">
                  <Sparkles className="h-3 w-3 mr-1" /> Premium
                </Badge>
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"} max-w-[280px] sm:max-w-full`}>
                Ferramenta com inteligência artificial para potencializar seus estudos
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Campo de busca expansível */}
            <div className={`${isSearchOpen ? 'flex-1 sm:flex-auto' : 'hidden sm:block'} relative transition-all duration-300`}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar ferramentas, recursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    pl-9 pr-8 h-9 w-full sm:w-48 md:w-64 focus:w-full sm:focus:w-72 transition-all 
                    border-[#FF6B00]/20 focus:border-[#FF6B00] 
                    ${theme === "dark" ? "bg-gray-800/60 text-white" : "bg-gray-100/80 text-gray-900"}
                  `}
                />
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Botão de busca em dispositivos móveis */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden rounded-full p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            
            {/* Notificações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-72 overflow-y-auto">
                  {[1,2,3].map((i) => (
                    <DropdownMenuItem key={i} className="cursor-pointer flex items-start py-2">
                      <div className="flex-shrink-0 mr-3 mt-0.5">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Nova funcionalidade disponível</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Explore o Analisador de Desempenho aprimorado
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Ver todas</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Configurações */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Avatar do usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-800">
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuItem>Plano Premium</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Barra de navegação secundária */}
        <div className={`px-4 sm:px-6 lg:px-8 py-2 ${theme === "dark" ? "bg-gray-900/60" : "bg-gray-50/70"} border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"} overflow-x-auto`}>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 whitespace-nowrap">
            {["Visão Geral", "Chat IA", "Resumos", "Planos de Estudo", "Ferramentas", "Exploração"].map((item, index) => (
              <Button 
                key={index} 
                variant="ghost" 
                size="sm" 
                className={`h-8 rounded-md text-sm px-2.5 ${index === 0 
                  ? `bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 hover:text-[#FF6B00]` 
                  : `text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white`
                }`}
              >
                {item}
              </Button>
            ))}
            <Button variant="ghost" size="sm" className="h-8 rounded-md text-sm px-2.5 text-gray-600 dark:text-gray-300">
              Mais <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EpictusIAHeader;

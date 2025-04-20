import React, { useState, useEffect, useRef } from "react";
import { Zap, Sparkles, Search, Settings, User, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EpictusIAHeader() {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Trigger initial animation
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Quando a busca é aberta, foca no input imediatamente
    if (searchOpen && searchInputRef.current) {
      // Foco imediato sem atrasos
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Função para gerenciar cliques fora do componente de busca
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchOpen && 
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.search-icon-container')
      ) {
        // Fechar imediatamente
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  const isDark = theme === "dark";

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${isDark ? 'bg-gradient-to-r from-[#050e1d] to-[#0d1a30]' : 'bg-gradient-to-r from-[#0c2341] to-[#0f3562]'} backdrop-blur-lg z-10 py-4 px-5 flex items-center justify-between rounded-xl relative overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute inset-0 bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FF9D5C] ${isHovered ? 'opacity-60' : 'opacity-30'} transition-opacity duration-700`}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Glowing orbs */}
      <motion.div 
        className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-orange-500/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <motion.div 
        className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5,
        }}
      />

      {/* Logo and title section */}
      <div className="flex items-center gap-4 z-10 flex-1">
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 rounded-full ${isHovered ? 'blur-[6px]' : 'blur-[3px]'} opacity-80 group-hover:opacity-100 transition-all duration-300 scale-110`}></div>
          <motion.div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center relative z-10 border-2 border-white/10 shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <AnimatePresence>
              {animationComplete ? (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center justify-center"
                >
                  <span className="text-white font-bold text-lg">IA</span>
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center"
                >
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Epictus IA
            </h1>
            <motion.div
              className="flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-medium text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Zap className="h-3 w-3 mr-1" />
              Premium
            </motion.div>
          </div>
          <p className="text-white/70 text-sm mt-0.5 font-medium tracking-wide">
            Ferramenta com inteligência artificial para potencializar seus estudos
          </p>
        </div>
      </div>

      {/* Search and Settings components */}
      <div className="flex items-center justify-center z-10 relative gap-3">
        {/* Search component */}
        <div className="relative search-icon-container">
          <motion.div
            className="relative"
            initial={false}
          >
            {/* Search icon/button */}
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
              onClick={(e) => {
                // Prevenir qualquer propagação que possa causar recálculos
                e.stopPropagation();
                e.preventDefault();
                
                // Toggle search open/closed state
                setSearchOpen(prevState => !prevState);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={false}
              animate={searchOpen ? { rotate: [0, -10, 0] } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Search className="h-5 w-5 text-white" />
            </motion.div>
            
            {/* Expanding search input */}
            <AnimatePresence mode="wait">
              {searchOpen && (
                <motion.div
                  className="absolute left-0 top-0 z-50 flex items-center"
                  initial={{ width: 0, opacity: 0, scale: 0.9, x: "100%" }}
                  animate={{ width: "240px", opacity: 1, scale: 1, x: 0 }}
                  exit={{ width: 0, opacity: 0, scale: 0.9, x: "100%" }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    opacity: { duration: 0.2 }
                  }}
                  key="search-input"
                  style={{ transformOrigin: "right center" }}
                >
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Pesquisar..."
                    className="h-10 pl-4 pr-10 rounded-full border-2 border-orange-500/50 focus:border-orange-500 bg-gradient-to-r from-[#0c2341]/90 to-[#0f3562]/90 backdrop-blur-md text-white placeholder:text-white/70 shadow-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      boxShadow: '0 4px 12px rgba(255, 107, 0, 0.15)'
                    }}
                  />
                  <Search className="h-5 w-5 text-white absolute right-3 pointer-events-none" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Settings component */}
        <div className="relative settings-icon-container">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              
              // Abrir o modal de configurações
              setSettingsOpen(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={false}
            transition={{ duration: 0.3 }}
          >
            <Settings className="h-5 w-5 text-white" />
          </motion.div>
        </div>

        {/* Modal de Configurações */}
        <Dialog 
          open={settingsOpen} 
          onOpenChange={setSettingsOpen}
        >
          <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-lg">
            <div className="flex h-[500px]">
              {/* Menu lateral esquerdo */}
              <div className="w-[200px] bg-gradient-to-b from-[#0c2341] to-[#0f3562] p-4 text-white rounded-l-lg">
                <div className="text-xl font-bold mb-6 flex items-center gap-2 justify-center">
                  <Settings className="h-5 w-5" />
                  <span>Configurações</span>
                </div>
                
                <Tabs defaultValue="perfil" className="w-full" orientation="vertical">
                  <TabsList className="flex flex-col items-stretch h-auto bg-transparent gap-2">
                    <TabsTrigger 
                      value="perfil" 
                      className="flex items-center gap-2 justify-start text-white data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium p-3 rounded-md hover:bg-white/5 w-full"
                    >
                      <User className="h-5 w-5" />
                      <span>Perfil</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="configuracoes" 
                      className="flex items-center gap-2 justify-start text-white data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium p-3 rounded-md hover:bg-white/5 w-full"
                    >
                      <Sliders className="h-5 w-5" />
                      <span>Configurações</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-auto pt-4">
                    <div className="h-1 w-full bg-white/10 mb-4 rounded-full"></div>
                    <div className="text-xs text-white/50 text-center">
                      Epictus IA v2.0.1
                    </div>
                  </div>
                </Tabs>
              </div>
              
              {/* Conteúdo do painel direito */}
              <div className="flex-1 bg-white dark:bg-slate-950 p-6 rounded-r-lg overflow-y-auto">
                <Tabs defaultValue="perfil" className="w-full">
                  <TabsContent value="perfil" className="mt-0">
                    <h2 className="text-2xl font-bold mb-4">Perfil do Usuário</h2>
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-1.5">
                        <label className="font-medium">Nome de exibição</label>
                        <Input placeholder="Seu nome" />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="font-medium">Email</label>
                        <Input placeholder="seu.email@exemplo.com" type="email" />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="font-medium">Biografia</label>
                        <Input placeholder="Uma breve descrição sobre você" />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="font-medium">Preferências de notificação</label>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="email-notifications" className="rounded" />
                          <label htmlFor="email-notifications">Receber notificações por email</label>
                        </div>
                      </div>
                      <div className="pt-4">
                        <button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                          Salvar alterações
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="configuracoes" className="mt-0">
                    <h2 className="text-2xl font-bold mb-4">Configurações</h2>
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-3">
                        <h3 className="font-semibold text-lg">Aparência</h3>
                        <div className="flex items-center gap-2">
                          <input type="radio" id="theme-light" name="theme" className="rounded" />
                          <label htmlFor="theme-light">Tema Claro</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="radio" id="theme-dark" name="theme" className="rounded" />
                          <label htmlFor="theme-dark">Tema Escuro</label>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-3">
                        <h3 className="font-semibold text-lg">Idioma</h3>
                        <select className="p-2 border rounded-md">
                          <option value="pt-br">Português (Brasil)</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </select>
                      </div>
                      
                      <div className="flex flex-col space-y-3">
                        <h3 className="font-semibold text-lg">Privacidade</h3>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="data-collection" className="rounded" />
                          <label htmlFor="data-collection">Permitir coleta de dados para melhorar a experiência</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="share-progress" className="rounded" />
                          <label htmlFor="share-progress">Compartilhar meu progresso com professores</label>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                          Salvar configurações
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hidden until expansion - will appear when user interaction happens */}
      <div className="absolute bottom-0 left-0 w-full h-1">
        <div className="h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-30"></div>
      </div>
    </motion.header>
  );
}
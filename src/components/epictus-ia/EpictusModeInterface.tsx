
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Brain, Zap, Sparkles, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EpictusModeInterfaceProps {
  onExit?: () => void;
}

const EpictusModeInterface: React.FC<EpictusModeInterfaceProps> = ({ onExit }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDark = theme === "dark";

  React.useEffect(() => {
    // Trigger initial animation
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header - reproduzindo o mesmo estilo do EpictusIAHeader */}
      <div className="w-full p-4">
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
                      <Brain className="h-6 w-6 text-white" />
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
                {onExit && (
                  <motion.button
                    onClick={onExit}
                    className="ml-2 px-2 py-1 text-xs text-white/80 hover:text-white border border-white/20 rounded-md hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Voltar
                  </motion.button>
                )}
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
                    e.stopPropagation();
                    e.preventDefault();
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
                      className="absolute right-0 top-0 z-50 flex items-center"
                      initial={{ width: 0, opacity: 0, scale: 0.9 }}
                      animate={{ width: "240px", opacity: 1, scale: 1 }}
                      exit={{ width: 0, opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        opacity: { duration: 0.2 }
                      }}
                      key="search-input"
                    >
                      <Input
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
                          <span>Perfil</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="configuracoes" 
                          className="flex items-center gap-2 justify-start text-white data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium p-3 rounded-md hover:bg-white/5 w-full"
                        >
                          <span>Configurações</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {/* Conteúdo principal - simplificado para este exemplo */}
                  <div className="flex-1 bg-white dark:bg-slate-950 p-6 rounded-r-lg overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">Configurações do Epictus IA</h2>
                    <p>Personalize sua experiência com o assistente Epictus IA.</p>
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
      </div>

      {/* Content area */}
      <div className="w-full flex flex-col items-center justify-center mt-6 px-4">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Epictus IA</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Aqui você poderá experimentar como é receber uma aula de conteúdos personalizados especialmente para você.
            Comece a interagir com o assistente digitando sua pergunta ou selecionando um dos tópicos sugeridos abaixo.
          </p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg mb-2">Tópicos Sugeridos</h3>
              <ul className="space-y-2">
                <li className="cursor-pointer hover:text-orange-500 transition-colors">• Como funcionam as equações diferenciais?</li>
                <li className="cursor-pointer hover:text-orange-500 transition-colors">• Me ajude a entender o Modernismo brasileiro</li>
                <li className="cursor-pointer hover:text-orange-500 transition-colors">• Explique a Primeira Lei da Termodinâmica</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg mb-2">Recursos Disponíveis</h3>
              <ul className="space-y-2">
                <li className="cursor-pointer hover:text-blue-500 transition-colors">• Resumos personalizados</li>
                <li className="cursor-pointer hover:text-blue-500 transition-colors">• Geração de exercícios</li>
                <li className="cursor-pointer hover:text-blue-500 transition-colors">• Aprofundamento em tópicos</li>
              </ul>
            </div>
          </div>
          
          {/* Campo de entrada de mensagem */}
          <div className="mt-8 flex items-center">
            <Input
              type="text"
              placeholder="Digite sua pergunta aqui..."
              className="flex-1 mr-2 border-2 border-orange-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-400"
            />
            <motion.button
              className="px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white rounded-md font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enviar
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpictusModeInterface;

import React, { useState, useEffect, useRef } from "react";
import { Zap, Sparkles, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Input } from "@/components/ui/input";
import TypewriterEffect from "@/components/ui/typewriter-effect";
import { createPortal } from "react-dom";

export default function EpictusIAHeader() {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Garante que o portal só será renderizado após a montagem do componente
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // Trigger initial animation
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Quando a busca é aberta, foca no input com um pequeno atraso
    // para garantir que a animação comece primeiro
    if (searchOpen && searchInputRef.current) {
      const focusTimer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
      
      return () => clearTimeout(focusTimer);
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
        // Usar setTimeout para evitar conflitos de estado durante a animação
        setTimeout(() => {
          setSearchOpen(false);
        }, 50);
      }
    };

    // Recalcular posição em caso de redimensionamento
    const handleResize = () => {
      if (searchOpen && searchInputRef.current) {
        // Forçar recálculo de posicionamento ao redimensionar
        searchInputRef.current.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
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

      {/* Search component */}
      <div className="flex items-center justify-center z-10 relative search-icon-container">
        <motion.div
          className="relative"
          initial={false}
        >
          {/* Search icon/button */}
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => {
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
          
          {/* Typewriter suggestion modal */}
          {isMounted && searchOpen && createPortal(
            <AnimatePresence mode="wait">
              <motion.div
                className="fixed bg-white/10 backdrop-blur-md border border-orange-500/30 rounded-lg p-4 shadow-lg w-[240px] z-[9999]"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: 0.1,
                }}
                key="search-suggestions"
                style={{
                  position: "fixed",
                  top: searchInputRef.current ? 
                    searchInputRef.current.getBoundingClientRect().bottom + window.scrollY + 8 : 
                    '5rem',
                  left: searchInputRef.current ? 
                    searchInputRef.current.getBoundingClientRect().left + window.scrollX : 
                    'auto',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                  transformOrigin: "top center"
                }}
              >
                <div className="text-white font-medium">
                  <TypewriterEffect 
                    text="O que você precisa fazer hoje?" 
                    typingSpeed={30}
                    className="text-sm"
                  />
                </div>
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
        </motion.div>
      </div>

      {/* Hidden until expansion - will appear when user interaction happens */}
      <div className="absolute bottom-0 left-0 w-full h-1">
        <div className="h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-30"></div>
      </div>
    </motion.header>
  );
}
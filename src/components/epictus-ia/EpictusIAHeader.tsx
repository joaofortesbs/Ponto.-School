
import React, { useState, useEffect, useRef } from "react";
import { Search, Settings, Zap, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function EpictusIAHeader() {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Mock search results - in a real app, these would come from a search API
  const searchResults = searchValue.length > 0 ? [
    { id: 1, title: "Matemática Avançada", category: "Conteúdo" },
    { id: 2, title: "Química Orgânica", category: "Conteúdo" },
    { id: 3, title: "Resumos de História", category: "Ferramenta" },
    { id: 4, title: "Física Quântica", category: "Conteúdo" },
  ].filter(item => item.title.toLowerCase().includes(searchValue.toLowerCase())) : [];

  useEffect(() => {
    // Trigger initial animation
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

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
      <div className="flex items-center gap-4 z-10">
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

      {/* Right side controls */}
      <div className="flex items-center gap-4 z-10">
        <motion.div 
          className={`relative flex items-center ${searchFocused ? 'w-64' : 'w-40'} transition-all duration-300`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full"></div>
          <Search className="absolute left-3 h-4 w-4 text-white/70" />
          <input
            type="text"
            ref={searchInputRef}
            placeholder="Pesquisar..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              // Delay hiding search results to allow for clicking on them
              setTimeout(() => setSearchFocused(false), 200);
            }}
            className="bg-transparent w-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 outline-none rounded-full border border-white/10 focus:border-orange-500/50 transition-colors"
            autoComplete="off"
            spellCheck="false"
          />
          {searchValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 text-white/60 hover:text-white"
              onClick={() => {
                setSearchValue("");
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
            >
              ×
            </motion.button>
          )}
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchFocused && searchValue.length > 0 && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full mt-2 bg-white/10 backdrop-blur-xl rounded-lg shadow-lg z-50 border border-white/10 overflow-hidden"
              >
                <div className="p-2">
                  {searchResults.map((result) => (
                    <div 
                      key={result.id}
                      className="py-2 px-3 hover:bg-white/10 rounded-md cursor-pointer transition-colors flex items-center justify-between group"
                      onClick={() => {
                        // In a real app, this would navigate to the result
                        setSearchValue("");
                        setSearchFocused(false);
                      }}
                    >
                      <span className="text-white text-sm">{result.title}</span>
                      <span className="text-white/50 text-xs group-hover:text-orange-400 transition-colors">{result.category}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
        </motion.button>
      </div>
      
      {/* Hidden until expansion - will appear when user interaction happens */}
      <div className="absolute bottom-0 left-0 w-full h-1">
        <div className="h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-30"></div>
      </div>
    </motion.header>
  );
}

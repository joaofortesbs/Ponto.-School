
import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";

const EpictusTurboMode: React.FC = () => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  useEffect(() => {
    // Trigger initial animation
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);
  
  const isDark = theme === "dark";
  
  // New color scheme is now directly applied in the class names
  
  return (
    <div className="w-full flex flex-col items-center">
      {/* Header copied from EpictusIAHeader but with title changed to "Epictus Turbo" */}
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
            <div className={`absolute inset-0 bg-gradient-to-r from-[#0D23A0] via-[#1230CC] to-[#4A0D9F] ${isHovered ? 'opacity-60' : 'opacity-30'} transition-opacity duration-700`}></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          </div>

          {/* Glowing orbs */}
          <motion.div 
            className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-[#0D23A0]/10 blur-3xl"
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
            className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-[#4A0D9F]/10 blur-3xl"
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
              <div className={`absolute inset-0 bg-gradient-to-br from-[#0D23A0] via-[#1230CC] to-[#4A0D9F] rounded-full ${isHovered ? 'blur-[6px]' : 'blur-[3px]'} opacity-80 group-hover:opacity-100 transition-all duration-300 scale-110`}></div>
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center relative z-10 border-2 border-white/10 shadow-xl"
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
                  Epictus Turbo
                </h1>
                <motion.div
                  className="flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] text-xs font-medium text-white shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Premium
                </motion.div>
              </div>
              <p className="text-white/70 text-sm mt-0.5 font-medium tracking-wide">
                IA avançada com processamento ultra-rápido para suas necessidades
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
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
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
                        className="h-10 pl-4 pr-10 rounded-full border-2 border-[#1230CC]/50 focus:border-[#1230CC] bg-gradient-to-r from-[#0c2341]/90 to-[#0f3562]/90 backdrop-blur-md text-white placeholder:text-white/70 shadow-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          boxShadow: '0 4px 12px rgba(13, 35, 160, 0.15)'
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
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
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
          </div>

          {/* Hidden until expansion - will appear when user interaction happens */}
          <div className="absolute bottom-0 left-0 w-full h-1">
            <div className="h-full bg-gradient-to-r from-transparent via-[#1230CC] to-transparent opacity-30"></div>
          </div>
        </motion.header>
      </div>
      
      {/* Content area now below the header */}
      <div className="w-full h-[60vh] flex items-center justify-center mt-4">
        {/* Mini-section selector will go here in the future */}
      </div>
    </div>
  );
};

export default EpictusTurboMode;

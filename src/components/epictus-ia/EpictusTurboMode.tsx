
import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const EpictusTurboMode: React.FC = () => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  // States removed as icons are currently inactive
  
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

          {/* New header icons */}
          <div className="flex items-center justify-center z-10 relative gap-3">
            {/* Personalidades dropdown */}
            <div className="relative icon-container mr-5 group">
              <motion.div
                className="relative w-auto h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow px-3 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="text-white text-sm font-medium">Personalidades</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </motion.div>
              
              {/* Dropdown content - moved completely out of the button for proper z-index rendering */}
              <div className="fixed group-hover:opacity-100 group-hover:visible opacity-0 invisible transition-all duration-300 left-[inherit] z-[9999] top-[inherit] mt-[58px] ml-[-170px]">
                <div className="w-52 bg-gradient-to-r from-[#0c2341] to-[#0f3562] rounded-lg shadow-xl overflow-hidden border border-white/10">
                  <div className="py-1 border-b border-white/10">
                    <div className="px-3 py-2 text-white/70 text-xs font-medium">Escolha uma personalidade</div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {[
                      { icon: "📰", color: "#4A85C4", name: "Notícias mais recentes" },
                      { icon: "❤️", color: "#E5508F", name: "Companhia" },
                      { icon: "😄", color: "#F8AE1C", name: "Comediante sem limites" },
                      { icon: "👫", color: "#E47D57", name: "Amigo leal" },
                      { icon: "📚", color: "#57B481", name: "Professor particular" },
                      { icon: "🔬", color: "#9A73EF", name: "Não é um médico" },
                      { icon: "🧠", color: "#4FC4CA", name: "Não é um terapeuta" }
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors duration-150"
                      >
                        <div 
                          className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          {item.icon}
                        </div>
                        <span className="text-white text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* History icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </motion.div>
            </div>

            {/* Favorites icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </motion.div>
            </div>

            {/* Calendar icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </motion.div>
            </div>

            {/* Notifications icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </motion.div>
            </div>

            {/* Profile picture - a bit more spaced */}
            <div className="relative profile-icon-container ml-4">
              <motion.div
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] p-[2px] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full rounded-full bg-[#0f2a4e] flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-[#0c2341]/80 to-[#0f3562]/80 flex items-center justify-center text-white text-lg font-bold">
                    JF
                  </div>
                </div>
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

import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles, ArrowLeft } from "lucide-react";
import TurboMessageBox from "./TurboMessageBox";
import TurboHubConnected from "./TurboHubConnected";

const EpictusTurboMode: React.FC = () => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [profileName, setProfileName] = useState("Estudante");
  const [profileIcon, setProfileIcon] = useState(
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <path d="M12 10v-2a2 2 0 0 0-2-2V4"></path>
      <path d="M10 4H8a2 2 0 0 0-2 2v1a2 2 0 0 0-2 2v1"></path>
      <path d="M14 4h2a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v1"></path>
      <path d="M18 15v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2Z"></path>
    </svg>
  );

  useEffect(() => {
    // Trigger initial animation
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Ouvir o evento de seleção de perfil
  useEffect(() => {
    const handleProfileSelection = (event: any) => {
      setProfileIcon(event.detail.icon);
      setProfileName(event.detail.name);
    };

    window.addEventListener('profileSelected', handleProfileSelection);

    return () => {
      window.removeEventListener('profileSelected', handleProfileSelection);
    };
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
          className={`w-full hub-connected-width ${isDark ? 'bg-gradient-to-r from-[#050e1d] to-[#0d1a30]' : 'bg-gradient-to-r from-[#0c2341] to-[#0f3562]'} backdrop-blur-lg py-4 px-5 flex items-center justify-between rounded-xl relative`}
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
            <div className="relative group mr-3">
              <div className={`absolute inset-0 bg-gradient-to-br from-[#0D23A0] via-[#1230CC] to-[#4A0D9F] rounded-full ${isHovered ? 'blur-[6px]' : 'blur-[3px]'} opacity-80 group-hover:opacity-100 transition-all duration-300 scale-110`}></div>
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center relative z-10 border-2 border-white/10 shadow-xl"
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
                  className="flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] text-xs font-medium text-white shadow-lg dropdown-isolate personalidades-root"
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

          {/* Header icons */}
          <div className="flex items-center justify-center z-10 relative gap-3">
            {/* History icon */}
            <div className="relative icon-container">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#0055B8] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow" 
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
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#0055B8] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow" 
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
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#0055B8] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow" 
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
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#0055B8] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow" 
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
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#0055B8] p-[2px] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow overflow-hidden" 
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
      <div className="w-full flex flex-col items-center justify-center mt-0 mb-2">
        {/* Hub Conectado - novo componente entre o cabeçalho e a caixa de mensagens */}
        <div className="w-full">
          <TurboHubConnected />
        </div>

        {/* Mini-section selector */}
        <div className="w-full flex-grow flex items-center justify-center">
          {/* Aqui virá o conteúdo principal (histórico de conversas, resultados, etc.) */}
        </div>

        {/* Caixa de mensagens na parte inferior */}
        <div className="w-full bottom-0 left-0 right-0 z-30 mt-1">
          <TurboMessageBox />
        </div>
      </div>
    </div>
  );
};

export default EpictusTurboMode;
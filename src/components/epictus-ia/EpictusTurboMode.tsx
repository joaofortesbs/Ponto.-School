import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const EpictusTurboMode: React.FC = () => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [profileIcon, setProfileIcon] = useState(
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
  const [profileName, setProfileName] = useState("Default"); // Changed default name
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .personalidades-dropdown {
        z-index: 9999 !important; 
      }
      [data-radix-popper-content-wrapper],
      [role="dialog"],
      .radix-dropdown-content,
      .radix-dropdown-menu {
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Removed useEffect for profile selection

  const isDark = theme === "dark";


  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full p-4">
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full hub-connected-width ${isDark ? 'bg-gradient-to-r from-[#050e1d] to-[#0d1a30]' : 'bg-gradient-to-r from-[#0c2341] to-[#0f3562]'} backdrop-blur-lg py-4 px-5 flex items-center justify-between rounded-xl relative`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 opacity-20">
            <div className={`absolute inset-0 bg-gradient-to-r from-[#0D23A0] via-[#1230CC] to-[#4A0D9F] ${isHovered ? 'opacity-60' : 'opacity-30'} transition-opacity duration-700`}></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          </div>

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
                  className="flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] text-xs font-medium text-white shadow-lg dropdown-isolate"
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

          <div className="flex items-center justify-center z-10 relative gap-3">
            {/* Personalidades dropdown */}
            <div className="relative icon-container mr-2">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div className="absolute top-0 right-0 w-full h-0 overflow-hidden bg-[#0f2a4e]/90 backdrop-blur-md rounded-xl shadow-xl transform origin-top-right transition-all duration-300 z-50 group-hover:h-auto group-hover:min-w-[240px] personalidades-dropdown">
                  <div className="py-2 px-1">
                    <div className="pt-2 pb-1 px-3 text-white/80 text-xs font-medium">
                      Personalidades
                    </div>
                    <div className="personalidade-item px-3 py-2 flex items-center gap-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors mt-1">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 20H5V4H19V20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 8H8V10H16V8Z" fill="currentColor"/>
                          <path d="M16 12H8V14H16V12Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <span className="text-white text-sm">Notícias mais recentes</span>
                    </div>
                    <div className="personalidade-item px-3 py-2 flex items-center gap-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-pink-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <span className="text-white text-sm">Companhia</span>
                    </div>
                    <div className="personalidade-item px-3 py-2 flex items-center gap-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-amber-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" fill="currentColor" />
                          <path d="M8 14C8.55228 14 9 13.5523 9 13C9 12.4477 8.55228 12 8 12C7.44772 12 7 12.4477 7 13C7 13.5523 7.44772 14 8 14Z" fill="white" />
                          <path d="M16 14C16.5523 14 17 13.5523 17 13C17 12.4477 16.5523 12 16 12C15.4477 12 15 12.4477 15 13C15 13.5523 15.4477 14 16 14Z" fill="white" />
                          <path d="M15.5 17C14.5 18 13.5 18.5 12 18.5C10.5 18.5 9.5 18 8.5 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-white text-sm">Comediante sem limites</span>
                    </div>
                    <div className="personalidade-item px-3 py-2 flex items-center gap-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-orange-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.8 5C10.8 5.66274 10.2627 6.2 9.6 6.2C8.93726 6.2 8.4 5.66274 8.4 5C8.4 4.33726 8.93726 3.8 9.6 3.8C10.2627 3.8 10.8 4.33726 10.8 5Z" fill="currentColor"/>
                          <path d="M15.6 5C15.6 5.66274 15.0627 6.2 14.4 6.2C13.7373 6.2 13.2 5.66274 13.2 5C13.2 4.33726 13.7373 3.8 14.4 3.8C15.0627 3.8 15.6 4.33726 15.6 5Z" fill="currentColor"/>
                          <path d="M7.5 14.5C8.5 15.5 10 16.5 12 16.5C14 16.5 15.5 15.5 16.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <span className="text-white text-sm">Amigo leal</span>
                    </div>
                    <div className="personalidade-item px-3 py-2 flex items-center gap-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-green-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 3L21 7L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 7H7C5.93913 7 4.92172 7.42143 4.17157 8.17157C3.42143 8.92172 3 9.93913 3 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 21L3 17L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 17H17C18.0609 17 19.0783 16.5786 19.8284 15.8284C20.5786 15.0783 21 14.0609 21 13V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-white text-sm">Professor particular</span>
                    </div>
                    <div className="personalidade-item px-3 py-2 flex items-center gap-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-purple-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 4H8V20H16V4Z" fill="currentColor" opacity="0.5"/>
                          <path d="M3 6L5 7V17L3 18V6Z" fill="currentColor"/>
                          <path d="M21 6L19 7V17L21 18V6Z" fill="currentColor"/>
                          <path d="M8 4L12 2L16 4H8Z" fill="currentColor"/>
                          <path d="M8 20L12 22L16 20H8Z" fill="currentColor"/>
                          <path d="M19 17V7L16 4M5 17V7L8 4M8 20H16M8 4H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-white text-sm">Não é um médico</span>
                    </div>
                    <div className="personalidade-item px-3 py-2 flex items-center gap-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-cyan-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.5 14.5C9.5 15.5 10.5 16 12 16C13.5 16 14.5 15.5 15.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 10L8 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 10L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-white text-sm">Não é um terapeuta</span>
                    </div>
                  </div>
                </div>
              </motion.div>
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

          <div className="absolute bottom-0 left-0 w-full h-1">
            <div className="h-full bg-gradient-to-r from-transparent via-[#1230CC] to-transparent opacity-30"></div>
          </div>
        </motion.header>
      </div>

      <div className="w-full flex flex-col items-center justify-center mt-0 mb-2">
        <div className="w-full">
          <TurboHubConnected />
        </div>

        <div className="w-full flex-grow flex items-center justify-center">
        </div>

        <div className="w-full bottom-0 left-0 right-0 z-30 mt-1">
          <TurboMessageBox />
        </div>
      </div>
    </div>
  );
};

import TurboMessageBox from "./TurboMessageBox";
import TurboHubConnected from "./TurboHubConnected";
export default EpictusTurboMode;
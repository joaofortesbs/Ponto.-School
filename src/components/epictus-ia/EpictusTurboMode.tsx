
import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import TurboMessageBox from "./TurboMessageBox";
import TurboHubConnected from "./TurboHubConnected";

const EpictusTurboMode: React.FC = () => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  // Perfil selecionado no dropdown de personalidades
  const [profileIcon, setProfileIcon] = useState(
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
  const [profileName, setProfileName] = useState("Personalidades");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  // Adicionar estilos globais para garantir que o modal de personalidades fique por cima
  useEffect(() => {
    // Adicionar estilos CSS para os modais de personalidades
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

  // Opções de perfil para o dropdown
  const profileOptions = [
    { 
      id: "estudante",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0055B8]"><path d="M12 10v-2a2 2 0 0 0-2-2V4"></path><path d="M10 4H8a2 2 0 0 0-2 2v1a2 2 0 0 0-2 2v1"></path><path d="M14 4h2a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v1"></path><path d="M18 15v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2Z"></path></svg>, 
      color: "#0055B8", 
      name: "Estudante",
      onClick: () => {
        setSelectedProfile("Estudante");

        // Disparar um evento customizado para atualizar o texto do botão
        const event = new CustomEvent('profileSelected', { 
          detail: { 
            name: "Estudante", 
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 10v-2a2 2 0 0 0-2-2V4"></path><path d="M10 4H8a2 2 0 0 0-2 2v1a2 2 0 0 0-2 2v1"></path><path d="M14 4h2a2 2 0 0 1 2 2v1a2 2 0 0 1 2 2v1"></path><path d="M18 15v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2Z"></path></svg>
          } 
        });
        window.dispatchEvent(event);
      }
    },
    { 
      id: "professor",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0055B8]"><path d="M8 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.93a2 2 0 0 1-1.66-.9L15.12 4a2 2 0 0 0-1.66-.9H8.83A3 3 0 0 0 6 5.17V17"></path><path d="M2 14h7"></path><path d="M6 10 2 14l4 4"></path></svg>, 
      color: "#0055B8", 
      name: "Professor",
      onClick: () => {
        setSelectedProfile("Professor");

        // Disparar um evento customizado para atualizar o texto do botão
        const event = new CustomEvent('profileSelected', { 
          detail: { 
            name: "Professor", 
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M8 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.93a2 2 0 0 1-1.66-.9L15.12 4a2 2 0 0 0-1.66-.9H8.83A3 3 0 0 0 6 5.17V17"></path><path d="M2 14h7"></path><path d="M6 10 2 14l4 4"></path></svg>
          } 
        });
        window.dispatchEvent(event);
      }
    },
    { 
      id: "coordenador",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0055B8]"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path><path d="M15 2v5h5"></path></svg>, 
      color: "#0055B8", 
      name: "Coordenador",
      onClick: () => {
        setSelectedProfile("Coordenador");

        // Disparar um evento customizado para atualizar o texto do botão
        const event = new CustomEvent('profileSelected', { 
          detail: { 
            name: "Coordenador", 
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path><path d="M15 2v5h5"></path></svg>
          } 
        });
        window.dispatchEvent(event);
      }
    },
    { 
      id: "expert",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0055B8]"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>, 
      color: "#0055B8", 
      name: "Expert",
      onClick: () => {
        setSelectedProfile("Expert");

        // Disparar um evento customizado para atualizar o texto do botão
        const event = new CustomEvent('profileSelected', { 
          detail: { 
            name: "Expert", 
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>
          } 
        });
        window.dispatchEvent(event);
      }
    }
  ];

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

          {/* New header icons */}
          <div className="flex items-center justify-center z-10 relative gap-3">
            {/* Personalidades dropdown */}
            <div className="relative icon-container mr-5" style={{ zIndex: 99999, position: "relative" }}>
              {/* Adicionando estado para controlar o dropdown */}
              {useState && (() => {
                const [isDropdownOpen, setIsDropdownOpen] = useState(false);
                
                // Referência para detectar cliques fora do dropdown
                const dropdownRef = React.useRef<HTMLDivElement>(null);
                
                // Fechar o dropdown apenas quando clicar fora dele
                React.useEffect(() => {
                  const handleClickOutside = (event: MouseEvent) => {
                    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                      setIsDropdownOpen(false);
                    }
                  };
                  
                  // Adicionando o evento apenas se o dropdown estiver aberto
                  if (isDropdownOpen) {
                    document.addEventListener('mousedown', handleClickOutside);
                  }
                  
                  return () => {
                    document.removeEventListener('mousedown', handleClickOutside);
                  };
                }, [dropdownRef, isDropdownOpen]);
                
                return (
                  <div ref={dropdownRef}>
                    <motion.div
                      className="relative w-auto h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#0055B8] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow px-3" 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={false}
                      transition={{ duration: 0.3 }}
                      onClick={(e) => {
                        e.stopPropagation(); // Impede a propagação do clique
                        setIsDropdownOpen(true); // Sempre abre o dropdown ao clicar
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {profileIcon}
                        <span className="text-white text-sm font-medium">{profileName}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-white transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </motion.div>

                    {/* Dropdown content - absolute positioning relative to its container */}
                    <div 
                      className={`fixed ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300 z-[99999] left-auto mt-2 personalidades-dropdown`} 
                      style={{ top: "calc(100% + 10px)" }}
                      onClick={(e) => e.stopPropagation()} // Impede que cliques no dropdown fechem ele mesmo
                    >
                      <div className="w-52 bg-[#0f3562] rounded-lg shadow-xl overflow-hidden border border-white/10 backdrop-blur-md" style={{ position: "relative", zIndex: 99999 }}> 
                        <div className="max-h-60 overflow-y-auto py-2">
                          {profileOptions.map((item, index) => (
                            <motion.div 
                              key={index} 
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer mb-1 mx-2 rounded-lg hover:bg-white/10 transition-all"
                              whileHover={{ 
                                y: -2, 
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                                scale: 1.02
                              }}
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que o clique se propague
                                item.onClick();
                                setIsDropdownOpen(false);
                              }}
                            >
                              <div 
                                className="w-7 h-7 rounded-md flex items-center justify-center shadow-inner"
                                style={{ 
                                  background: `linear-gradient(135deg, #0055B830, #0055B850)`,
                                  boxShadow: `0 0 15px #0055B840` 
                                }}
                              >
                                {item.icon}
                              </div>
                              <span className="text-white text-sm">{item.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

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

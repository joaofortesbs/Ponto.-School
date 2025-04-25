
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Brain } from "lucide-react";
import GlowingBackground from "./GlowingBackground";
import LogoSection from "./LogoSection";
import PersonalitiesDropdown from "./PersonalitiesDropdown";
import HeaderIcons from "./HeaderIcons";

interface TurboHeaderProps {
  profileOptions: Array<{
    id: string;
    icon: React.ReactNode;
    color: string;
    name: string;
    onClick: () => void;
  }>;
  initialProfileIcon?: React.ReactNode;
  initialProfileName?: string;
}

const TurboHeader: React.FC<TurboHeaderProps> = ({ 
  profileOptions,
  initialProfileIcon,
  initialProfileName = "Personalidades" 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [profileIcon, setProfileIcon] = useState(initialProfileIcon || (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ));
  const [profileName, setProfileName] = useState(initialProfileName);

  // Configurar efeito de animação ao carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full p-4">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full hub-connected-width bg-gradient-to-r from-[#050e1d] to-[#0d1a30] backdrop-blur-lg py-4 px-5 flex items-center justify-between rounded-xl relative`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <GlowingBackground isHovered={isHovered} />
        
        <div className="flex items-center gap-3 z-10 relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg mr-3 shadow-lg">
              <Brain className="h-6 w-6 text-white" />
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
                  BETA
                </motion.div>
              </div>
              <p className="text-white/70 text-sm mt-0.5 font-medium tracking-wide">
                Ferramenta com inteligência artificial para potencializar seus estudos
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center z-10 relative gap-3">
          <PersonalitiesDropdown 
            profileIcon={profileIcon}
            profileName={profileName}
            profileOptions={profileOptions}
          />
          
          <HeaderIcons />
        </div>
      </motion.header>
    </div>
  );
};

export default TurboHeader;

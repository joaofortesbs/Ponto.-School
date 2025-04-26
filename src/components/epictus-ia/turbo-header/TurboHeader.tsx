import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlowingBackground from "./GlowingBackground";
import LogoSection from "./LogoSection";
import PersonalitiesDropdown from "./PersonalitiesDropdown";
import { HeaderIcons } from "../modoepictusiabeta/header/icons";

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
  onHistoricoClick?: () => void; // Added prop for opening the modal
}

const TurboHeader: React.FC<TurboHeaderProps> = ({ 
  profileOptions,
  initialProfileIcon,
  initialProfileName = "Personalidades",
  onHistoricoClick
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
        className={`w-full hub-connected-width bg-gradient-to-r from-[#001340] to-[#0055B8] backdrop-blur-lg py-4 px-5 flex items-center justify-between rounded-xl relative`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <GlowingBackground isHovered={isHovered} />

        <LogoSection isHovered={isHovered} animationComplete={animationComplete} description="IA para geração de conversas impecáveis para o público estudantil!" />

        <div className="flex items-center justify-center z-10 relative gap-3">
          <PersonalitiesDropdown 
            profileIcon={profileIcon}
            profileName={profileName}
            profileOptions={profileOptions}
          />

          <HeaderIcons onHistoricoClick={onHistoricoClick} /> {/* Pass the prop */}
        </div>
      </motion.header>
    </div>
  );
};

export default TurboHeader;
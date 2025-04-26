
import React, { useState, useEffect } from "react";
import { ChevronDown, Search, Bell, Settings } from "lucide-react";
import HeaderIcons from "../modoepictusiabeta/header/icons/HeaderIcons";

interface ProfileOption {
  id: string;
  icon: React.ReactNode;
  color: string;
  name: string;
  onClick: () => void;
}

interface TurboHeaderProps {
  profileOptions?: ProfileOption[];
  initialProfileIcon?: React.ReactNode;
  initialProfileName?: string;
  isBetaMode?: boolean;
}

const TurboHeader: React.FC<TurboHeaderProps> = ({
  profileOptions = [],
  initialProfileIcon,
  initialProfileName = "Personalidades",
  isBetaMode = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentProfileIcon, setCurrentProfileIcon] = useState(initialProfileIcon);
  const [currentProfileName, setCurrentProfileName] = useState(initialProfileName);
  const [activeIcon, setActiveIcon] = useState("");

  useEffect(() => {
    console.log("TurboHeader montado com sucesso");
    
    // Cleanup function
    return () => {
      console.log("TurboHeader desmontado");
    };
  }, []);

  const handleIconClick = (iconName: string) => {
    console.log(`Ícone ${iconName} clicado`);
    setActiveIcon(iconName);
    // Aqui você pode adicionar lógica adicional quando um ícone é clicado
  };

  return (
    <div className="w-full relative">
      <div className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-[#0A101F] to-[#131B30] border-b border-blue-900/30 shadow-md">
        {/* Lado esquerdo - Logo e título */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3A7BD5] to-[#4A90E2] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M12 2c5.5 2 8 5 8 10a16.5 16.5 0 0 1-2.2 8.2"></path>
                <path d="M12 2c-5.5 2-8 5-8 10a16.5 16.5 0 0 0 2.2 8.2"></path>
                <path d="M20 19a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4"></path>
                <path d="M9.3 10.7a3 3 0 0 1 5.4 0"></path>
                <path d="M12 16v4"></path>
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">Epictus IA</span>
            {isBetaMode && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md ml-1">
                BETA
              </span>
            )}
          </div>
        </div>

        {/* Centro - Ícones do Header (apenas no modo beta) */}
        {isBetaMode && <HeaderIcons activeIcon={activeIcon} onIconClick={handleIconClick} />}

        {/* Lado direito - Controles e perfil */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
            <Settings size={20} />
          </button>

          {/* Personalidades dropdown */}
          <div className="relative ml-2">
            <button
              className="flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 hover:bg-white/10 text-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center">
                {currentProfileIcon}
              </div>
              <span className="text-sm">{currentProfileName}</span>
              <ChevronDown size={16} />
            </button>

            {isDropdownOpen && profileOptions.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-60 bg-[#1a1d2d] border border-blue-900/30 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-2 border-b border-gray-700/30">
                  <h3 className="text-sm font-medium text-gray-300">Personalidades</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {profileOptions.map((option) => (
                    <button
                      key={option.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-white text-left transition-colors"
                      onClick={() => {
                        option.onClick();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: option.color + "20" }}
                      >
                        {option.icon}
                      </div>
                      <span>{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurboHeader;

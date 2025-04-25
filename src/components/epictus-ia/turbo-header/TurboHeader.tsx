import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowRight, Sparkles, Bell, User, ChevronDown, Clock, BookOpen, Image } from "lucide-react";

interface TurboHeaderProps {
  profileOptions: {
    id: string;
    icon: React.ReactNode;
    color: string;
    name: string;
    onClick: () => void;
  }[];
  initialProfileIcon: React.ReactNode;
  initialProfileName: string;
}

const TurboHeader: React.FC<TurboHeaderProps> = ({
  profileOptions,
  initialProfileIcon,
  initialProfileName,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProfileIcon, setSelectedProfileIcon] = useState(initialProfileIcon);
  const [selectedProfileName, setSelectedProfileName] = useState(initialProfileName);
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";

  useEffect(() => {
    const closeDropdownOnOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".personality-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", closeDropdownOnOutsideClick);
    return () => {
      document.removeEventListener("click", closeDropdownOnOutsideClick);
    };
  }, []);

  return (
    <div className="w-full bg-[#0a2555]">
      <div className="flex items-center justify-between py-2 px-4">
        {/* Left section - Logo and title */}
        <div className="flex items-center z-10">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#1E88E5] flex items-center justify-center mr-3">
              <span className="text-white font-bold">IA</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white flex items-center">
                Epictus IA
                <span className="ml-2 bg-[#1565c0] text-white text-[10px] py-0.5 px-1.5 rounded-md flex items-center">
                  <Sparkles size={10} className="mr-0.5" />
                  Avançado
                </span>
              </h1>
              <p className="text-[11px] text-blue-200/80">IA para geração de conversas impecáveis para o público estudantil</p>
            </div>
          </div>
        </div>

        {/* Right section - Personalities dropdown and icons */}
        <div className="flex items-center gap-2 z-10">
          {/* Personality Dropdown */}
          <div className="relative personality-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-1 py-1.5 pl-3 pr-2 rounded-lg bg-[#1565c0] text-white"
            >
              <div className="mr-1">
                <User size={18} className="text-white" />
              </div>
              <span className="text-sm text-white font-medium">Personalidades</span>
              <ChevronDown size={14} className={`text-white/70 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 py-2 w-56 bg-[#1A2634] rounded-xl shadow-xl border border-white/10 z-50"
              >
                <h4 className="px-3 pb-1 text-xs text-white/50 font-medium">Selecione uma personalidade</h4>
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1"></div>
                {profileOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={(e) => {
                      option.onClick();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: option.color }}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <p className="text-sm text-white">{option.name}</p>
                      <p className="text-[10px] text-white/50">Especialista em {option.name.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Time icon */}
          <button className="w-8 h-8 rounded-full bg-[#0a2555] flex items-center justify-center text-white">
            <Clock size={18} />
          </button>

          {/* Book icon */}
          <button className="w-8 h-8 rounded-full bg-[#0a2555] flex items-center justify-center text-white">
            <BookOpen size={18} />
          </button>

          {/* Bell icon */}
          <button className="w-8 h-8 rounded-full bg-[#0a2555] flex items-center justify-center text-white">
            <Bell size={18} />
          </button>

          {/* Image icon */}
          <button className="w-8 h-8 rounded-full bg-[#0a2555] flex items-center justify-center text-white">
            <Image size={18} />
          </button>

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-sm font-medium">
            JF
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurboHeader;
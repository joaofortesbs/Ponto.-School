
import React, { useState, useRef } from "react";
import { User, ChevronDown } from "lucide-react";
import PersonalidadesDropdown from "./PersonalidadesDropdown";

interface PersonalidadesIconProps {
  onClick?: () => void;
}

const PersonalidadesIcon: React.FC<PersonalidadesIconProps> = ({ onClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsDropdownOpen((prev) => !prev);
    if (onClick) onClick();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="flex items-center bg-[#0D23A0] px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#0A1C80] transition-colors"
        onClick={handleClick}
      >
        <User className="h-4 w-4 text-white mr-1.5" />
        <span className="text-white text-sm font-medium">Personalidades</span>
        <ChevronDown className="h-3.5 w-3.5 ml-1 text-white" />
      </div>
      
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <PersonalidadesDropdown 
          isOpen={isDropdownOpen} 
          onClose={() => setIsDropdownOpen(false)} 
        />
      </div>
    </div>
  );
};

export default PersonalidadesIcon;

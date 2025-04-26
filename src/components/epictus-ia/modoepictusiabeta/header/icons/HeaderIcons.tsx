
import React, { useState } from "react";
import { HistoricoIcon } from "./HistoricoIcon";
import { EspacoAprendizagemIcon } from "./EspacoAprendizagemIcon";
import { ApostilaInteligenteIcon } from "./ApostilaInteligenteIcon";
import { ModoFantasmaIcon } from "./ModoFantasmaIcon";
import { GaleriaIcon } from "./GaleriaIcon";
import { PerfilIcon } from "./PerfilIcon";

interface HeaderIconsProps {
  userInitials?: string;
}

const HeaderIcons: React.FC<HeaderIconsProps> = ({ userInitials = "JF" }) => {
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  
  const handleIconClick = (iconName: string) => {
    setActiveIcon(iconName === activeIcon ? null : iconName);
    
    // Implement specific functionality for each icon
    console.log(`${iconName} clicked`);
    
    // Example modal handlers or navigation logic can be added here
    switch(iconName) {
      case 'historico':
        // Open history modal or navigate to history page
        break;
      case 'espacoAprendizagem':
        // Open learning space
        break;
      case 'apostilaInteligente':
        // Open intelligent study material
        break;
      case 'modoFantasma':
        // Toggle ghost mode
        break;
      case 'galeria':
        // Open gallery
        break;
      case 'perfil':
        // Open profile settings
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <HistoricoIcon 
        isActive={activeIcon === 'historico'} 
        onClick={() => handleIconClick('historico')} 
      />
      <EspacoAprendizagemIcon 
        isActive={activeIcon === 'espacoAprendizagem'} 
        onClick={() => handleIconClick('espacoAprendizagem')} 
      />
      <ApostilaInteligenteIcon 
        isActive={activeIcon === 'apostilaInteligente'} 
        onClick={() => handleIconClick('apostilaInteligente')} 
      />
      <ModoFantasmaIcon 
        isActive={activeIcon === 'modoFantasma'} 
        onClick={() => handleIconClick('modoFantasma')} 
      />
      <GaleriaIcon 
        isActive={activeIcon === 'galeria'} 
        onClick={() => handleIconClick('galeria')} 
      />
      <PerfilIcon 
        isActive={activeIcon === 'perfil'} 
        onClick={() => handleIconClick('perfil')} 
        userInitials={userInitials}
      />
    </div>
  );
};

export { HeaderIcons };

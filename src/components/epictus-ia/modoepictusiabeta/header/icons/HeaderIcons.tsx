import React from "react";
import HistoricoIcon from "./HistoricoIcon";
import EspacoAprendizagemIcon from "./EspacoAprendizagemIcon";
import ApostilaInteligenteIcon from "./ApostilaInteligenteIcon";
import ModoFantasmaIcon from "./ModoFantasmaIcon";
import GaleriaIcon from "./GaleriaIcon";
import PerfilIcon from "./PerfilIcon";

interface HeaderIconsProps {
  activeIcon?: string;
  onIconClick?: (iconName: string) => void;
}

const HeaderIcons: React.FC<HeaderIconsProps> = ({ 
  activeIcon = "",
  onIconClick = () => {}
}) => {
  console.log("Renderizando HeaderIcons para o Modo Epictus IA BETA");

  return (
    <div className="flex items-center space-x-2 px-2">
      <HistoricoIcon 
        active={activeIcon === "historico"} 
        onClick={() => onIconClick("historico")} 
      />

      <EspacoAprendizagemIcon 
        active={activeIcon === "espacoAprendizagem"} 
        onClick={() => onIconClick("espacoAprendizagem")} 
      />

      <ApostilaInteligenteIcon 
        active={activeIcon === "apostilaInteligente"} 
        onClick={() => onIconClick("apostilaInteligente")} 
      />

      <ModoFantasmaIcon 
        active={activeIcon === "modoFantasma"} 
        onClick={() => onIconClick("modoFantasma")} 
      />

      <GaleriaIcon 
        active={activeIcon === "galeria"} 
        onClick={() => onIconClick("galeria")} 
      />

      <PerfilIcon 
        active={activeIcon === "perfil"} 
        onClick={() => onIconClick("perfil")} 
      />
    </div>
  );
};

export default HeaderIcons;
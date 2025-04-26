// modoepictusiabeta/header/icons/PerfilIcon.tsx
import React from "react";

interface PerfilIconProps {
  onClick?: () => void;
}

const PerfilIcon: React.FC<PerfilIconProps> = ({ onClick }) => {
  return (
    <div className="cursor-pointer" onClick={onClick}>
      <img
        src="/path/to/your/profile/image.jpg" // Replace with actual image path
        alt="Profile"
        className="rounded-full w-8 h-8"
      />
    </div>
  );
};

export default PerfilIcon;


// modoepictusiabeta/header/icons/index.tsx
import HistoricoIcon from "./HistoricoIcon";
import EspacoAprendizagemIcon from "./EspacoAprendizagemIcon";
import ApostilaInteligenteIcon from "./ApostilaInteligenteIcon";
import ModoFantasmaIcon from "./ModoFantasmaIcon";
import GaleriaIcon from "./GaleriaIcon";
import PerfilIcon from "./PerfilIcon";

export {
  HistoricoIcon,
  EspacoAprendizagemIcon,
  ApostilaInteligenteIcon,
  ModoFantasmaIcon,
  GaleriaIcon,
  PerfilIcon,
};


// modoepictusiabeta/header/HeaderIcons.tsx
import React, { useState } from "react";
import HistoricoIcon from "./icons/HistoricoIcon";
import EspacoAprendizagemIcon from "./icons/EspacoAprendizagemIcon";
import ApostilaInteligenteIcon from "./icons/ApostilaInteligenteIcon";
import ModoFantasmaIcon from "./icons/ModoFantasmaIcon";
import GaleriaIcon from "./icons/GaleriaIcon";
import PerfilIcon from "./icons/PerfilIcon";
import HistoricoConversasModal from "../../../modals/HistoricoConversasModal";

interface HeaderIconsProps {
  currentContext?: string;
  onHistoricoClick?: () => void;
  onEspacoAprendizagemClick?: () => void;
  onApostilaInteligenteClick?: () => void;
  onModoFantasmaClick?: () => void;
  onGaleriaClick?: () => void;
  onPerfilClick?: () => void; // Added prop for PerfilIcon
}

const HeaderIcons: React.FC<HeaderIconsProps> = ({
  currentContext = "estudos",
  onHistoricoClick,
  onEspacoAprendizagemClick,
  onApostilaInteligenteClick,
  onModoFantasmaClick,
  onGaleriaClick,
  onPerfilClick, // Added prop
}) => {
  const [modoFantasmaAtivo, setModoFantasmaAtivo] = useState(false);
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);

  const handleModoFantasmaClick = () => {
    setModoFantasmaAtivo(!modoFantasmaAtivo);
    if (onModoFantasmaClick) {
      onModoFantasmaClick();
    }
  };

  const handleHistoricoClick = () => {
    setIsHistoricoModalOpen(true);
  };

  return (
    <div className="flex items-center justify-center z-10 relative gap-3">
      <HistoricoIcon onClick={handleHistoricoClick} />
      <EspacoAprendizagemIcon onClick={onEspacoAprendizagemClick} />
      <ApostilaInteligenteIcon onClick={onApostilaInteligenteClick} />
      <ModoFantasmaIcon onClick={handleModoFantasmaClick} active={modoFantasmaAtivo} />
      <GaleriaIcon onClick={onGaleriaClick} />
      <PerfilIcon onClick={onPerfilClick} /> {/* Added PerfilIcon */}
      <HistoricoConversasModal open={isHistoricoModalOpen} onOpenChange={setIsHistoricoModalOpen} />
    </div>
  );
};

export default HeaderIcons;
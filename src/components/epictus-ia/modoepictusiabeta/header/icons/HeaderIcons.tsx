import React, { useState } from "react";
import HistoricoIcon from "./HistoricoIcon";
import EspacoAprendizagemIcon from "./EspacoAprendizagemIcon";
import ApostilaInteligenteIcon from "./ApostilaInteligenteIcon";
import ModoFantasmaIcon from "./ModoFantasmaIcon";
import GaleriaIcon from "./GaleriaIcon";
import PerfilIcon from "./PerfilIcon";
import HistoricoConversasModal from "../../../modals/HistoricoConversasModal";
import ApostilaInteligenteModal from "../../../modals/ApostilaInteligenteModal"; // Import the new modal component

interface HeaderIconsProps {
  currentContext?: string;
  onHistoricoClick?: () => void;
  onEspacoAprendizagemClick?: () => void;
  onApostilaInteligenteClick?: () => void;
  onModoFantasmaClick?: () => void;
  onGaleriaClick?: () => void;
  onPerfilClick?: () => void;
}

const HeaderIcons: React.FC<HeaderIconsProps> = ({
  currentContext = "estudos",
  onHistoricoClick,
  onEspacoAprendizagemClick,
  onApostilaInteligenteClick,
  onModoFantasmaClick,
  onGaleriaClick,
  onPerfilClick,
}) => {
  const [modoFantasmaAtivo, setModoFantasmaAtivo] = useState(false);
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
  const [isApostilaInteligenteModalOpen, setIsApostilaInteligenteModalOpen] = useState(false); // State for the new modal

  const handleModoFantasmaClick = () => {
    setModoFantasmaAtivo(!modoFantasmaAtivo);
    if (onModoFantasmaClick) {
      onModoFantasmaClick();
    }
  };

  const handleHistoricoClick = () => {
    setIsHistoricoModalOpen(true);
  };

  const handleApostilaInteligenteClick = () => {
    setIsApostilaInteligenteModalOpen(true); // Open the new modal
  };

  return (
    <div className="flex items-center justify-center z-10 relative gap-3">
      <HistoricoIcon onClick={handleHistoricoClick} />
      <EspacoAprendizagemIcon onClick={onEspacoAprendizagemClick} />
      <ApostilaInteligenteIcon onClick={handleApostilaInteligenteClick} /> {/* Updated onClick handler */}
      <ModoFantasmaIcon onClick={handleModoFantasmaClick} active={modoFantasmaAtivo} />
      <GaleriaIcon onClick={onGaleriaClick} />
      <PerfilIcon onClick={onPerfilClick} />
      <HistoricoConversasModal open={isHistoricoModalOpen} onOpenChange={setIsHistoricoModalOpen} />
      <ApostilaInteligenteModal open={isApostilaInteligenteModalOpen} onOpenChange={setIsApostilaInteligenteModalOpen} /> {/* Render the new modal */}
    </div>
  );
};

export default HeaderIcons;
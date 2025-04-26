
import React, { useState } from "react";
import HistoricoIcon from "./HistoricoIcon";
import EspacoAprendizagemIcon from "./EspacoAprendizagemIcon";
import ApostilaInteligenteIcon from "./ApostilaInteligenteIcon";
import ModoFantasmaIcon from "./ModoFantasmaIcon";
import GaleriaIcon from "./GaleriaIcon";
import HistoricoConversasModal from "../../../modals/HistoricoConversasModal";

interface HeaderIconsProps {
  currentContext?: string;
  onEspacoAprendizagemClick?: () => void;
  onApostilaInteligenteClick?: () => void;
  onModoFantasmaClick?: () => void;
  onGaleriaClick?: () => void;
}

const HeaderIcons: React.FC<HeaderIconsProps> = ({
  currentContext = "estudos",
  onEspacoAprendizagemClick,
  onApostilaInteligenteClick,
  onModoFantasmaClick,
  onGaleriaClick,
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
      
      <HistoricoConversasModal 
        open={isHistoricoModalOpen} 
        onOpenChange={setIsHistoricoModalOpen}
      />
    </div>
  );
};

export default HeaderIcons;

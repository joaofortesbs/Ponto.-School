
import React, { useState } from "react";
import HistoricoIcon from "./HistoricoIcon";
import EspacoAprendizagemIcon from "./EspacoAprendizagemIcon";
import ApostilaInteligenteIcon from "./ApostilaInteligenteIcon";
import ModoFantasmaIcon from "./ModoFantasmaIcon";
import GaleriaIcon from "./GaleriaIcon";

interface HeaderIconsProps {
  onHistoricoClick?: () => void;
  onEspacoAprendizagemClick?: () => void;
  onApostilaInteligenteClick?: () => void;
  onModoFantasmaClick?: () => void;
  onGaleriaClick?: () => void;
}

const HeaderIcons: React.FC<HeaderIconsProps> = ({
  onHistoricoClick,
  onEspacoAprendizagemClick,
  onApostilaInteligenteClick,
  onModoFantasmaClick,
  onGaleriaClick
}) => {
  const [modoFantasmaAtivo, setModoFantasmaAtivo] = useState(false);

  const handleModoFantasmaClick = () => {
    setModoFantasmaAtivo(!modoFantasmaAtivo);
    if (onModoFantasmaClick) {
      onModoFantasmaClick();
    }
  };

  return (
    <div className="flex items-center justify-center z-10 relative gap-3">
      <HistoricoIcon onClick={onHistoricoClick} />
      <EspacoAprendizagemIcon onClick={onEspacoAprendizagemClick} />
      <ApostilaInteligenteIcon onClick={onApostilaInteligenteClick} />
      <ModoFantasmaIcon onClick={handleModoFantasmaClick} active={modoFantasmaAtivo} />
      <GaleriaIcon onClick={onGaleriaClick} />
    </div>
  );
};

export default HeaderIcons;

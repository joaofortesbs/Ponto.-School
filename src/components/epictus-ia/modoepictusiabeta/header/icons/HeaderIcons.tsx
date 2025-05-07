import React, { useState } from "react";
import HistoricoIcon from "./HistoricoIcon";
import EspacoAprendizagemIcon from "./EspacoAprendizagemIcon";
import ApostilaInteligenteIcon from "./ApostilaInteligenteIcon";
import ModoFantasmaIcon from "./ModoFantasmaIcon";
import GaleriaIcon from "./GaleriaIcon";
import PerfilIcon from "./PerfilIcon";
import PersonalidadesIcon from "./personalidadescabeçalhomodoepictusbeta";
import HistoricoConversasModal from "../../../modals/HistoricoConversasModal";
import { ApostilaInteligenteModal } from "../../apostila-inteligente";;

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
  const [isApostilaInteligenteModalOpen, setIsApostilaInteligenteModalOpen] = useState(false);

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
    setIsApostilaInteligenteModalOpen(true);
  };

  const handlePersonalidadesClick = () => {
    console.log("Personalidades clicado");
    // Funcionalidade inativa conforme solicitado
  };

  return (
    <div className="flex items-center justify-center z-10 relative gap-3" style={{ backgroundColor: "#212529" }}> {/* Added dark background */}
      <PersonalidadesIcon onClick={handlePersonalidadesClick} style={{ filter: "brightness(0.8)" }} /> {/* Darker icon */}
      <HistoricoIcon onClick={handleHistoricoClick} style={{ filter: "brightness(0.8)" }} /> {/* Darker icon */}
      <EspacoAprendizagemIcon onClick={onEspacoAprendizagemClick} style={{ filter: "brightness(0.8)" }} /> {/* Darker icon */}
      <ApostilaInteligenteIcon onClick={handleApostilaInteligenteClick} style={{ filter: "brightness(0.8)" }} /> {/* Darker icon */}
      <ModoFantasmaIcon onClick={handleModoFantasmaClick} active={modoFantasmaAtivo} style={{ filter: "brightness(0.8)" }} /> {/* Darker icon */}
      <GaleriaIcon onClick={onGaleriaClick} style={{ filter: "brightness(0.8)" }} /> {/* Darker icon */}
      <PerfilIcon onClick={onPerfilClick} style={{ filter: "brightness(0.8)" }} /> {/* Darker icon */}
      <HistoricoConversasModal open={isHistoricoModalOpen} onOpenChange={setIsHistoricoModalOpen} />
      <ApostilaInteligenteModal open={isApostilaInteligenteModalOpen} onOpenChange={setIsApostilaInteligenteModalOpen} />
    </div>
  );
};

export default HeaderIcons;
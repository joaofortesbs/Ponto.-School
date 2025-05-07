import React, { useState } from "react";
import HistoricoIcon from "./HistoricoIcon";
import EspacoAprendizagemIcon from "./EspacoAprendizagemIcon";
import ApostilaInteligenteIcon from "./ApostilaInteligenteIcon";
import ModoFantasmaIcon from "./ModoFantasmaIcon";
import GaleriaIcon from "./GaleriaIcon";
import PerfilIcon from "./PerfilIcon";
import PersonalidadesIcon from "./personalidadescabeçalhomodoepictusbeta";
import HistoricoConversasModal from "../../../modals/HistoricoConversasModal";
import { ApostilaInteligenteModal } from "../../apostila-inteligente";
import PersonalidadesModal from "../../../modals/PersonalidadesModal";

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
  const [isPersonalidadesModalOpen, setIsPersonalidadesModalOpen] = useState(false);

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
    setIsPersonalidadesModalOpen(true);
  };

  const handlePersonalidadeSelect = (personalidadeId: string) => {
    // Aqui você pode implementar a lógica para ativar a personalidade selecionada
    console.log(`Personalidade selecionada: ${personalidadeId}`);
    setIsPersonalidadesModalOpen(false);
  };

  return (
    <div className="flex items-center justify-center z-10 relative gap-3">
      <PersonalidadesIcon onClick={handlePersonalidadesClick} />
      <HistoricoIcon onClick={handleHistoricoClick} />
      <EspacoAprendizagemIcon onClick={onEspacoAprendizagemClick} />
      <ApostilaInteligenteIcon onClick={handleApostilaInteligenteClick} />
      <ModoFantasmaIcon onClick={handleModoFantasmaClick} active={modoFantasmaAtivo} />
      <GaleriaIcon onClick={onGaleriaClick} />
      <PerfilIcon onClick={onPerfilClick} />
      <HistoricoConversasModal open={isHistoricoModalOpen} onOpenChange={setIsHistoricoModalOpen} />
      <ApostilaInteligenteModal open={isApostilaInteligenteModalOpen} onOpenChange={setIsApostilaInteligenteModalOpen} />
      <PersonalidadesModal 
        open={isPersonalidadesModalOpen} 
        onOpenChange={setIsPersonalidadesModalOpen}
        onPersonalidadeSelect={handlePersonalidadeSelect}
      />
    </div>
  );
};

export default HeaderIcons;
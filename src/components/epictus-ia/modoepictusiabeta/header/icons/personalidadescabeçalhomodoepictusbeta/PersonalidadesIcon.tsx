
import React, { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import PersonalidadesModal from "../../../../modals/PersonalidadesModal";

const PersonalidadesIcon: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSelectPersonalidade = (personalidadeId: string) => {
    console.log(`Personalidade selecionada: ${personalidadeId}`);
    // Aqui podemos adicionar a lógica para mudar a personalidade ativa
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className="flex items-center bg-[#0D23A0] px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#0A1C80] transition-colors personalidades-root"
        onClick={handleOpenModal}
        style={{ zIndex: 100000 }}
      >
        <User className="h-4 w-4 text-white mr-1.5" />
        <span className="text-white text-sm font-medium">Personalidades</span>
        <ChevronDown className="h-3.5 w-3.5 ml-1 text-white" />
      </div>

      <PersonalidadesModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onPersonalidadeSelect={handleSelectPersonalidade}
      />
    </>
  );
};

export default PersonalidadesIcon;

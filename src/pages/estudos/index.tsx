import React from "react";
import { useNavigate } from "react-router-dom";
import EstudosView from "@/components/estudos/EstudosView";

export default function EstudosPage() {
  const navigate = useNavigate();

  const handleSelectGrupo = (grupoId: string) => {
    navigate(`/turmas/grupos/${grupoId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#001427]">
      <div className="container mx-auto max-w-7xl">
        <EstudosView onSelectGrupo={handleSelectGrupo} />
      </div>
    </div>
  );
}

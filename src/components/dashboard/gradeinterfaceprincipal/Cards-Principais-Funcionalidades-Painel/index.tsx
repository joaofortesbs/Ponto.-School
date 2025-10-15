
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import ProximaAulaCard from "./Próxima-Aula";
import PulsoDaTurmaCard from "./Pulso-da-Turma";
import JogadaDoDiaCard from "./Jogada-do-Dia";

export default function CardsPrincipaisFuncionalidadesPainel() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  return (
    <div className="w-full max-w-[98%] sm:max-w-[1600px] mx-auto mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Próxima Aula */}
        <ProximaAulaCard />
        
        {/* Card 2: Pulso da Turma */}
        <PulsoDaTurmaCard />
        
        {/* Card 3: Jogada do Dia */}
        <JogadaDoDiaCard />
      </div>
    </div>
  );
}

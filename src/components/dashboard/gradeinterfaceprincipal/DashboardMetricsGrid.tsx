import React from "react";
import { Trophy } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import FocoDoDiaCard from "./FocoDoDiaCard";
import AtalhoSchoolCard from "./AtalhoSchoolCard";
import SequenciaEstudosCard from "./SequenciaEstudosCard";
import EpictusIACopilotoCard from "./EpictusIACopilotoCard";
import TempoEstudoCard from "./TempoEstudoCard";
import PosicaoRankingCard from './PosicaoRankingCard';
import SchoolPointsCard from './SchoolPointsCard';
import ConquistasCard from './ConquistasCard';

export default function DashboardMetricsGrid() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  return (
    <div className="space-y-6 mt-8">
      {/* Cards de métricas rápidas - 4 cards em linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tempo de estudo card */}
        <TempoEstudoCard theme={theme} />

        {/* Conquistas card */}
        <ConquistasCard />

        {/* Posição ranking card */}
        <PosicaoRankingCard theme={theme} />

        {/* School Points card */}
        <SchoolPointsCard />
      </div>

      {/* Cards maiores - Foco do Dia e Atalhos School */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Foco do Dia */}
        <FocoDoDiaCard />

        {/* Card de Atalhos School */}
        <AtalhoSchoolCard />
      </div>

      {/* Cards maiores adicionais - Sequência de Estudos e Epictus IA Copiloto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Sequência de Estudos */}
        <SequenciaEstudosCard />

        {/* Card de Epictus IA Copiloto */}
        <EpictusIACopilotoCard />
      </div>
    </div>
  );
}
import React from "react";
import TempoEstudoCard from "./TempoEstudoCard";
import ConquistasCard from "./ConquistasCard";
import SchoolPointsCard from "./SchoolPointsCard";
import PosicaoRankingCard from "./PosicaoRankingCard";
import EpictusIACopilotoCard from "./EpictusIACopilotoCard";
import SequenciaEstudosCard from "./SequenciaEstudosCard";
import AtalhoSchoolCard from "./AtalhoSchoolCard";
import FocoDoDiaCard from "./FocoDoDiaCard";
import { useTheme } from "@/components/ThemeProvider";

export default function DashboardMetricsGrid() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
      {/* Grid de métricas (3x2) */}
      <div className="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="shadow-xl">
          <TempoEstudoCard />
        </div>
        <div className="shadow-xl">
          <ConquistasCard />
        </div>
        <div className="shadow-xl">
          <PosicaoRankingCard />
        </div>
        <div className="shadow-xl">
          <SchoolPointsCard />
        </div>
        <div className="shadow-xl">
          <SequenciaEstudosCard />
        </div>
        <div className="shadow-xl">
          <AtalhoSchoolCard />
        </div>
      </div>

      {/* Coluna direita */}
      <div className="col-span-1 lg:col-span-4 grid grid-cols-1 gap-5">
        <div className="h-full">
          <FocoDoDiaCard />
        </div>
        <div className="h-full">
          <EpictusIACopilotoCard />
        </div>
      </div>
    </div>
  );
}
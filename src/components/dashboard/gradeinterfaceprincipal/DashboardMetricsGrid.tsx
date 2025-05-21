
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
      {/* Primeira coluna (4/12) */}
      <div className="col-span-1 lg:col-span-4 grid grid-cols-1 gap-5">
        <div className="shadow-xl">
          <TempoEstudoCard />
        </div>
      </div>

      {/* Segunda coluna (central, 4/12) */}
      <div className="col-span-1 lg:col-span-4 grid grid-cols-1 gap-5">
        <div className="h-full">
          <FocoDoDiaCard />
        </div>
      </div>

      {/* Terceira coluna (4/12) */}
      <div className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="shadow-xl">
          <ConquistasCard />
        </div>
        <div className="shadow-xl">
          <PosicaoRankingCard />
        </div>
      </div>

      {/* Cards adicionais */}
      <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="shadow-xl">
          <SchoolPointsCard />
        </div>
        <div className="shadow-xl">
          <SequenciaEstudosCard />
        </div>
        <div className="shadow-xl">
          <AtalhoSchoolCard />
        </div>
        <div className="shadow-xl">
          <EpictusIACopilotoCard />
        </div>
      </div>
    </div>
  );
}

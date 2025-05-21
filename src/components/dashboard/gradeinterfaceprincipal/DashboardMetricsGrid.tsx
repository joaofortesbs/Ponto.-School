import React from "react";
import TempoEstudoCard from "./TempoEstudoCard";
import ConquistasCard from "./ConquistasCard";
import FocoDoDiaCard from "./FocoDoDiaCard";
import PosicaoRankingCard from "./PosicaoRankingCard";

export default function DashboardMetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      <div className="col-span-1">
        <TempoEstudoCard />
      </div>
      <div className="col-span-1">
        <FocoDoDiaCard />
      </div>
      <div className="col-span-1">
        <ConquistasCard />
      </div>
      <div className="col-span-1">
        <PosicaoRankingCard />
      </div>
    </div>
  );
}

import React from "react";
import EventosDoDia from "./EventosDoDia";
import DesempenhoSemanal from "./DesempenhoSemanal";
import Ranking from "./Ranking";
import Pontos from "./Pontos";

interface MetricsGridProps {
  onAddEvent?: () => void;
  onViewPerformanceDetails?: () => void;
  onViewRanking?: () => void;
  onViewChallenges?: () => void;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({
  onAddEvent,
  onViewPerformanceDetails,
  onViewRanking,
  onViewChallenges
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="h-[260px]">
        <EventosDoDia onAddEvent={onAddEvent} />
      </div>
      <div className="h-[260px]">
        <DesempenhoSemanal onViewDetails={onViewPerformanceDetails} />
      </div>
      <div className="h-[260px]">
        <Ranking onViewRanking={onViewRanking} />
      </div>
      <div className="h-[260px]">
        <Pontos onViewChallenges={onViewChallenges} />
      </div>
    </div>
  );
};

export default MetricsGrid;

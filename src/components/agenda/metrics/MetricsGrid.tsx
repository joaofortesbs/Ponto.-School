
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
  onViewAllEvents?: () => void;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({
  onAddEvent,
  onViewPerformanceDetails,
  onViewRanking,
  onViewChallenges,
  onViewAllEvents
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="h-[260px] metrics-grid-card">
        <EventosDoDia 
          onAddEvent={onAddEvent} 
          onViewAllEvents={onViewAllEvents} 
        />
      </div>
      <div className="h-[260px] metrics-grid-card">
        <DesempenhoSemanal onViewDetails={onViewPerformanceDetails} />
      </div>
      <div className="h-[260px] metrics-grid-card">
        <Ranking onViewRanking={onViewRanking} />
      </div>
      <div className="h-[260px] metrics-grid-card">
        <Pontos onViewChallenges={onViewChallenges} />
      </div>
    </div>
  );
};

export default MetricsGrid;


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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 transition-all duration-500">
      <div className="h-[260px] transform transition-all duration-500 hover:scale-[1.01]">
        <EventosDoDia 
          onAddEvent={onAddEvent} 
          onViewAllEvents={onViewAllEvents} 
        />
      </div>
      <div className="h-[260px] transform transition-all duration-500 hover:scale-[1.01]">
        <DesempenhoSemanal onViewDetails={onViewPerformanceDetails} />
      </div>
      <div className="h-[260px] transform transition-all duration-500 hover:scale-[1.01]">
        <Ranking onViewRanking={onViewRanking} />
      </div>
      <div className="h-[260px] transform transition-all duration-500 hover:scale-[1.01]">
        <Pontos onViewChallenges={onViewChallenges} />
      </div>
    </div>
  );
};

export default MetricsGrid;

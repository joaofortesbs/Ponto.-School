import React, { useState } from "react";
import DesempenhoSemanal from "./DesempenhoSemanal";
import EventosDoDia from "./EventosDoDia";
import Ranking from "./Ranking";
import Pontos from "./Pontos";
import { useNavigate } from "react-router-dom";
import FlowPerformanceDetailsModal from "../flow/FlowPerformanceDetailsModal";

interface MetricsGridProps {
  onViewAllEvents?: () => void;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ onViewAllEvents }) => {
  const navigate = useNavigate();
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);

  const handleViewAllEvents = () => {
    if (onViewAllEvents) {
      onViewAllEvents();
    }
  };

  const handleViewPerformanceDetails = () => {
    setPerformanceModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EventosDoDia onViewAllEvents={handleViewAllEvents} />
        <DesempenhoSemanal onViewDetails={handleViewPerformanceDetails} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Ranking onViewDetails={() => {}} />
        <Pontos onViewDetails={() => {}} />
      </div>

      <FlowPerformanceDetailsModal 
        open={performanceModalOpen}
        onClose={() => setPerformanceModalOpen(false)}
      />
    </div>
  );
};

export default MetricsGrid;

import React from "react";
import { BarChart2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesempenhoSemanalProps {
  onViewDetails?: () => void;
}

const DesempenhoSemanal: React.FC<DesempenhoSemanalProps> = ({ onViewDetails }) => {
  return (
    <div className="metrics-card h-full flex flex-col">
      <div className="metrics-card-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart2 className="h-5 w-5 text-white" />
          <h3 className="text-white font-medium text-sm">Desempenho Semanal</h3>
        </div>
      </div>
      
      <div className="metrics-empty-state flex-1">
        <div className="metrics-empty-icon">
          <BarChart2 className="h-8 w-8 text-[#8393A0]" />
        </div>
        <p className="text-white text-sm font-medium mb-1">Sem dados de desempenho</p>
        <p className="text-[#8393A0] text-xs mb-4">
          Complete tarefas e atividades para visualizar seu progresso
        </p>
        <Button 
          onClick={onViewDetails}
          className="metrics-card-button w-full text-white rounded-md"
        >
          <ExternalLink className="h-4 w-4 mr-2" /> Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

export default DesempenhoSemanal;

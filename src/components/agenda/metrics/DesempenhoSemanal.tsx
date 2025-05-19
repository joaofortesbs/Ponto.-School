
import React from "react";
import { BarChart2Icon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesempenhoSemanalProps {
  onViewDetails?: () => void;
}

const DesempenhoSemanal: React.FC<DesempenhoSemanalProps> = ({ onViewDetails }) => {
  return (
    <div className="flex flex-col h-full bg-[#001427] rounded-lg overflow-hidden">
      <div className="bg-[#FF6B00] p-3 flex items-center justify-between">
        <div className="flex items-center">
          <BarChart2Icon className="h-5 w-5 text-white mr-2" />
          <h3 className="text-white font-medium text-sm">Desempenho Semanal</h3>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-[#0D2238] p-4 rounded-full mb-3">
          <BarChart2Icon className="h-8 w-8 text-[#8393A0]" />
        </div>
        <p className="text-white text-sm font-medium mb-1">Sem dados de desempenho</p>
        <p className="text-[#8393A0] text-xs mb-4">
          Complete tarefas e atividades para visualizar seu progresso
        </p>
        <Button 
          onClick={onViewDetails}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-md w-full"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" /> Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

export default DesempenhoSemanal;

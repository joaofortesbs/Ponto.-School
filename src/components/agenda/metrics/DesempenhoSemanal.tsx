
import React from "react";
import { BarChart2Icon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesempenhoSemanalProps {
  onViewDetails?: () => void;
}

const DesempenhoSemanal: React.FC<DesempenhoSemanalProps> = ({ onViewDetails }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#001427] to-[#001a2f] rounded-xl overflow-hidden shadow-md border border-[#0D2238]/50">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <BarChart2Icon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Desempenho Semanal</h3>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-gradient-to-br from-[#0D2238] to-[#0D2238]/70 p-4 rounded-full mb-3 shadow-inner">
          <BarChart2Icon className="h-8 w-8 text-[#8393A0]" />
        </div>
        <p className="text-white text-sm font-medium mb-1">Sem dados de desempenho</p>
        <p className="text-[#8393A0] text-xs mb-4">
          Complete tarefas e atividades para visualizar seu progresso
        </p>
        <Button 
          onClick={onViewDetails}
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md w-full shadow-md transition-all duration-300"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" /> Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

export default DesempenhoSemanal;

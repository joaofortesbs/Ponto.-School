
import React from "react";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventosDoDiaProps {
  onAddEvent?: () => void;
}

const EventosDoDia: React.FC<EventosDoDiaProps> = ({ onAddEvent }) => {
  return (
    <div className="flex flex-col h-full bg-[#001427] rounded-lg overflow-hidden">
      <div className="bg-[#FF6B00] p-3 flex items-center justify-between">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-white mr-2" />
          <h3 className="text-white font-medium text-sm">Eventos do Dia</h3>
        </div>
        <div className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs text-[#FF6B00] font-medium">
          0
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-[#0D2238] p-4 rounded-full mb-3">
          <CalendarIcon className="h-8 w-8 text-[#8393A0]" />
        </div>
        <p className="text-white text-sm font-medium mb-1">Nenhum evento programado para hoje</p>
        <p className="text-[#8393A0] text-xs mb-4">
          Adicione seus eventos para organizar sua rotina acadêmica
        </p>
        <Button 
          onClick={onAddEvent}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-md w-full"
        >
          <PlusIcon className="h-4 w-4 mr-2" /> Adicionar Evento
        </Button>
      </div>
    </div>
  );
};

export default EventosDoDia;

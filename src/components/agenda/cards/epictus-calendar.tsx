import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, CheckCircle, CheckSquare, Wand2 } from "lucide-react";

interface EpictusCalendarProps {
  onOpenCalendarModal: () => void;
}

const EpictusCalendar: React.FC<EpictusCalendarProps> = ({
  onOpenCalendarModal,
}) => {
  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-[#001427] to-[#29335C] text-white overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              Epictus Calendário
            </CardTitle>
            <CardDescription className="text-gray-300 text-xs">
              Integração inteligente com seu calendário
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="bg-[#29335C]/30 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-200">
            Deixe a IA organizar seu calendário:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-gray-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#FF6B00]" /> Criar eventos
              automaticamente
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#FF6B00]" /> Gerar
              checklists para suas tarefas
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#FF6B00]" /> Organizar seu
              dia de forma otimizada
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#FF6B00]" /> Sugerir
              horários ideais para estudo
            </li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white border-none"
            onClick={onOpenCalendarModal}
          >
            <Calendar className="h-4 w-4 mr-1" /> Organizar Calendário
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <CheckSquare className="h-4 w-4 mr-1" /> Criar Checklist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpictusCalendar;

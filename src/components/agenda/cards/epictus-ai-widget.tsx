import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Bot,
  Calendar,
  CheckSquare,
  Clock,
  List,
  Sparkles,
  Wand2,
} from "lucide-react";

interface EpictusAIWidgetProps {
  onOpenAssistant: () => void;
}

const EpictusAIWidget: React.FC<EpictusAIWidgetProps> = ({
  onOpenAssistant,
}) => {
  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-[#001427] to-[#29335C] text-white overflow-hidden">
      <CardHeader className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <h3 className="text-base font-bold text-white">Epictus IA</h3>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Sparkles className="h-4 w-4 text-[#FF6B00]" />
            <span>Assistente inteligente para sua agenda</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="justify-start border-[#29335C] text-white hover:bg-[#29335C]/30"
              onClick={onOpenAssistant}
            >
              <Calendar className="h-4 w-4 mr-1 text-[#FF6B00]" />
              <span>Organizar Agenda</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start border-[#29335C] text-white hover:bg-[#29335C]/30"
              onClick={onOpenAssistant}
            >
              <CheckSquare className="h-4 w-4 mr-1 text-[#FF6B00]" />
              <span>Criar Checklist</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start border-[#29335C] text-white hover:bg-[#29335C]/30"
              onClick={onOpenAssistant}
            >
              <Clock className="h-4 w-4 mr-1 text-[#FF6B00]" />
              <span>Otimizar Tempo</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start border-[#29335C] text-white hover:bg-[#29335C]/30"
              onClick={onOpenAssistant}
            >
              <List className="h-4 w-4 mr-1 text-[#FF6B00]" />
              <span>Listar Tarefas</span>
            </Button>
          </div>

          <Button
            className="w-full mt-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white border-none"
            onClick={onOpenAssistant}
          >
            <Wand2 className="h-4 w-4 mr-1" /> Iniciar Assistente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpictusAIWidget;

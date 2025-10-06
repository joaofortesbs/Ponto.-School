import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, CheckCircle, Lightbulb, Rocket, Settings } from "lucide-react";

interface EpictusAIProps {
  onOpenAssistant: () => void;
}

const EpictusAI: React.FC<EpictusAIProps> = ({ onOpenAssistant }) => {
  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-[#001427] to-[#29335C] text-white overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Epictus IA</CardTitle>
            <CardDescription className="text-gray-300 text-xs">
              Assistente inteligente para sua agenda
            </CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="bg-[#29335C]/30 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-200">
            O Epictus IA pode ajudar você a:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-gray-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#FF6B00]" /> Criar eventos e
              tarefas automaticamente
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#FF6B00]" /> Organizar seu
              calendário de forma inteligente
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#FF6B00]" /> Receber
              lembretes personalizados
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-[#FF6B00]" /> Otimizar seu
              tempo de estudo
            </li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white border-none"
            onClick={onOpenAssistant}
          >
            <Rocket className="h-4 w-4 mr-1" /> Iniciar Assistente
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <Lightbulb className="h-4 w-4 mr-1" /> Ver Sugestões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpictusAI;

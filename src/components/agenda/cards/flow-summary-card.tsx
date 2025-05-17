import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, LineChart, Play, Sparkles } from "lucide-react";

interface FlowSession {
  date: string;
  duration: string;
  subjects: string[];
  progress: number;
}

interface FlowSummaryCardProps {
  lastSession?: FlowSession;
}

const FlowSummaryCard: React.FC<FlowSummaryCardProps> = ({ lastSession }) => {
  const hasSessionData = lastSession !== undefined;

  return (
    <Card className="bg-[#001427] text-white rounded-lg overflow-hidden shadow-md border-none">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          <h3 className="text-base font-bold text-white">Flow Estudos</h3>
        </div>
      </div>

      {!hasSessionData ? (
        <div className="py-8 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#29335C]/30 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-[#FF6B00]" />
          </div>
          <h4 className="text-white font-medium text-lg mb-2">Descubra o Flow</h4>
          <p className="text-gray-400 text-sm text-center mb-6 max-w-[90%]">
            O Flow é um método de estudo focado que acompanha seu progresso e ajuda você a manter a concentração.
          </p>

          <div className="bg-[#29335C]/30 rounded-lg p-3 w-full mb-6">
            <div className="flex items-center mb-3">
              <Clock className="h-4 w-4 text-[#FF6B00] mr-2" />
              <span className="text-xs text-gray-300">Sessões cronometradas</span>
            </div>
            <div className="flex items-center mb-3">
              <BookOpen className="h-4 w-4 text-[#FF6B00] mr-2" />
              <span className="text-xs text-gray-300">Registro de matérias estudadas</span>
            </div>
            <div className="flex items-center">
              <LineChart className="h-4 w-4 text-[#FF6B00] mr-2" />
              <span className="text-xs text-gray-300">Análise de produtividade</span>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white border-none">
            <Play className="h-4 w-4 mr-1" /> Iniciar Primeira Sessão
          </Button>
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center mb-2">
              <Clock className="h-4 w-4 mr-1 text-[#FF6B00]" /> Última Sessão
            </h4>
            <div className="bg-[#29335C]/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{lastSession.date}</span>
                <span className="text-xs font-medium text-white bg-[#29335C] px-2 py-0.5 rounded">
                  {lastSession.duration}
                </span>
              </div>
              {/* Resto do código da sessão */}
            </div>
          </div>

          <Button className="w-full mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white border-none">
            <Play className="h-4 w-4 mr-1" /> Iniciar Nova Sessão
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FlowSummaryCard;
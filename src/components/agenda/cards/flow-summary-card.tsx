import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpenCheck, Clock, Play, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FlowSummaryCardProps {
  lastSession?: {
    date: string;
    duration: string;
    subjects: string[];
    progress: number;
  };
}

const FlowSummaryCard: React.FC<FlowSummaryCardProps> = ({ lastSession }) => {
  const navigate = useNavigate();

  const handleStartFlow = () => {
    navigate("/agenda?view=flow");
  };

  return (
    <div className="bg-[#001427] dark:bg-[#001427] rounded-xl overflow-hidden shadow-lg border border-[#FF6B00]/20">
      <div className="p-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5" />
          <h3 className="font-bold text-lg">Flow de Aprendizagem</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-white hover:bg-white/20"
          onClick={handleStartFlow}
        >
          <Play className="h-4 w-4 mr-1" /> Iniciar Flow
        </Button>
      </div>

      <div className="p-4">
        {lastSession ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-sm font-medium text-white">
                  Última sessão: {lastSession.date}
                </span>
              </div>
              <span className="text-sm font-medium text-[#FF6B00]">
                {lastSession.duration}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progresso</span>
                <span>{lastSession.progress}%</span>
              </div>
              <Progress
                value={lastSession.progress}
                className="h-2 bg-[#FF6B00]/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {lastSession.subjects.map((subject, index) => (
                <div
                  key={index}
                  className="px-2 py-1 bg-[#FF6B00]/10 text-[#FF6B00] text-xs rounded-full"
                >
                  {subject}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Target className="h-3 w-3 text-[#FF6B00]" />
                <span>Mantenha o ritmo para atingir suas metas!</span>
              </div>
              <Button
                variant="link"
                size="sm"
                className="text-[#FF6B00] p-0 h-auto"
                onClick={handleStartFlow}
              >
                Ver detalhes
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
              <BookOpenCheck className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                Nenhuma sessão recente
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Inicie uma sessão de estudo para acompanhar seu progresso e
                otimizar seu aprendizado.
              </p>
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                onClick={handleStartFlow}
              >
                <Play className="h-4 w-4 mr-1" /> Iniciar Flow
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowSummaryCard;


import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useFlowSessions from "@/hooks/useFlowSessions";

const TempoEstudoSimplificado = () => {
  const navigate = useNavigate();
  const { sessions, loading, getStats } = useFlowSessions();
  const [totalHoras, setTotalHoras] = useState<number>(0);
  const [percentualCrescimento, setPercentualCrescimento] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
      
      // Calcular total de horas de estudo
      const stats = getStats();
      const totalSegundos = stats.totalTimeInSeconds || 0;
      const horas = Math.floor(totalSegundos / 3600);
      setTotalHoras(horas);
      
      // Calcular percentual de crescimento
      const tendencia = stats.trends?.timeChangePct || 0;
      if (tendencia !== 0) {
        setPercentualCrescimento(tendencia);
      } else if (totalSegundos > 0) {
        // Se não há tendência mas há tempo registrado, mostrar +100%
        setPercentualCrescimento(100);
      } else {
        // Se não há tempo registrado, não mostrar percentual
        setPercentualCrescimento(null);
      }
    }
  }, [loading, sessions]);

  const handleNavigate = () => {
    navigate("/agenda?view=flow");
  };

  return (
    <Card 
      onClick={handleNavigate}
      className="cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-800 bg-[#001427] text-white"
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-[#FF6B00] mr-2" />
            <p className="text-sm font-medium">Tempo de estudo</p>
          </div>
          {percentualCrescimento !== null && (
            <div className="bg-[#FF6B00]/20 px-2 py-0.5 rounded text-xs font-medium text-[#FF6B00]">
              +{Math.abs(percentualCrescimento).toFixed(1)}%
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <h2 className="text-3xl font-bold mt-2">
            {isLoading ? "-" : totalHoras}
            <span className="text-base font-normal ml-1">horas</span>
          </h2>
        </div>
      </CardContent>
    </Card>
  );
};

export default TempoEstudoSimplificado;

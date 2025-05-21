import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import useFlowSessions from "@/hooks/useFlowSessions";
import { useTheme } from "@/components/ThemeProvider";

interface TempoEstudoCardProps {
  className?: string;
  theme?: string;
}

const TempoEstudoCard: React.FC<TempoEstudoCardProps> = ({ className, theme }) => {
  const { sessions, getStats, loading } = useFlowSessions();
  const [totalHoras, setTotalHoras] = useState(0);
  const [totalMinutos, setTotalMinutos] = useState(0);
  const [percentualMudanca, setPercentualMudanca] = useState(0);
  const [tendenciaPositiva, setTendenciaPositiva] = useState(true);
  const { theme: currentTheme } = useTheme();

  const isLightMode = (theme || currentTheme) === "light";

  useEffect(() => {
    // Obter estatísticas da semana atual
    const stats = getStats('semana');

    // Calcular horas e minutos de estudo
    const totalSeconds = stats.totalTimeInSeconds;
    const horasEstudo = Math.floor(totalSeconds / 3600);
    const minutosEstudo = Math.floor((totalSeconds % 3600) / 60);

    setTotalHoras(horasEstudo);
    setTotalMinutos(minutosEstudo);

    // Determinar tendência com base nos dados de comparação
    setPercentualMudanca(Math.abs(stats.trends.timeChangePct) || 0);
    setTendenciaPositiva(stats.trends.timeChangePct >= 0);

    console.log("Dados do card de Tempo de Estudos atualizados:", {
      totalHoras: horasEstudo,
      totalMinutos: minutosEstudo,
      totalSegundos: stats.totalTimeInSeconds,
      tendencia: stats.trends.timeChangePct,
      sessoes: sessions.length
    });
  }, [sessions, getStats]);

  return (
    <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px] ${className || ""}`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#FF6B00]/5' : 'bg-[#FF6B00]/5'} rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500`}></div>

      <div className="flex flex-col h-full justify-between relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 flex items-center justify-center rounded-full ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
            <Clock className={`h-5 w-5 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
          </div>
          <div>
            <h3 className={`font-medium text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>Tempo de estudo</h3>
            <p className="flex items-center mt-0.5">
              <span className={`text-xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                {totalHoras}h {totalMinutos}min
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempoEstudoCard;
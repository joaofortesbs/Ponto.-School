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
        <div className="flex justify-between items-start mb-1 relative z-10">
          <div className="flex items-center">
            <div className={`${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-2`}>
              <Clock className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
            </div>
            <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>Tempo de estudo</p>
          </div>
        </div>

        <div className="flex items-end mt-2">
          <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>{totalHoras}</h3>
          <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>h</span>
          <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'} ml-2`}>{totalMinutos}</h3>
          <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>min</span>
        </div>
      </div>
    </div>
  );
};

export default TempoEstudoCard;
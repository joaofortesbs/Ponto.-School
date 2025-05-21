import React, { useState, useEffect } from "react";
import { Clock, Zap, ArrowUp, ArrowDown } from "lucide-react";
import useFlowSessions from "@/hooks/useFlowSessions";
import { Link } from "react-router-dom";

interface TempoEstudoCardProps {
  className?: string;
}

const TempoEstudoCard: React.FC<TempoEstudoCardProps> = ({ className }) => {
  const { sessions, getStats, loading } = useFlowSessions();
  const [totalHoras, setTotalHoras] = useState(0);
  const [percentualMudanca, setPercentualMudanca] = useState(0);
  const [tendenciaPositiva, setTendenciaPositiva] = useState(true);

  const [totalMinutos, setTotalMinutos] = useState(0);
  
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
    <div className={`bg-gradient-to-br from-[#0a1c33] to-[#1e293b] rounded-xl shadow-md overflow-hidden border border-[#FF6B00]/30 ${className || ""}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <h3 className="text-lg font-semibold text-white">Tempo de estudo</h3>
          </div>
          {percentualMudanca > 0 && (
            <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${tendenciaPositiva ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {tendenciaPositiva ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {percentualMudanca}%
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{totalHoras}</span>
            <span className="text-lg text-[#FF6B00] mb-1">h</span>
            <span className="text-3xl font-bold text-white">{totalMinutos}</span>
            <span className="text-lg text-[#FF6B00] mb-1">min</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {loading ? "Carregando..." : sessions.length > 0 
              ? `Total acumulado em ${sessions.length} sessões de estudo`
              : "Nenhuma sessão registrada ainda"}
          </p>
        </div>

        <div className="mt-4">
          <Link
            to="/agenda?view=flow"
            className="inline-flex items-center justify-center w-full py-2 px-3 bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00] rounded-lg transition-colors text-sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            {sessions.length > 0 ? "Continuar estudando" : "Iniciar primeira sessão"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TempoEstudoCard;
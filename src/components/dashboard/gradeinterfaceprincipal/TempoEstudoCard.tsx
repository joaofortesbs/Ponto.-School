
import React, { useState, useEffect } from "react";
import { Clock, Zap, ArrowUp, ArrowDown } from "lucide-react";
import useFlowSessions from "@/hooks/useFlowSessions";
import { Link } from "react-router-dom";

interface TempoEstudoCardProps {
  theme: string;
}

const TempoEstudoCard: React.FC<TempoEstudoCardProps> = ({ theme }) => {
  const isLightMode = theme === "light";
  const [totalHours, setTotalHours] = useState<number>(0);
  const [hasData, setHasData] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  
  // Usar hook de sessões de Flow para obter dados reais
  const { sessions, loading, getStats, loadSessions } = useFlowSessions();

  useEffect(() => {
    // Carregar as sessões ao montar o componente
    loadSessions();
  }, []);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
      
      // Obter estatísticas das sessões de Flow
      const stats = getStats('mes'); // Pegar estatísticas do mês
      
      // Verificar se existem dados
      if (stats.sessionsCount > 0) {
        // Calcular total de horas
        const totalSeconds = stats.totalTimeInSeconds || 0;
        const hours = Math.floor(totalSeconds / 3600);
        setTotalHours(hours);
        setHasData(true);
        
        // Definir mudança percentual
        setPercentChange(stats.trends.timeChangePct || 0);
        
        // Calcular streak de dias de estudo
        if (stats.consistency && stats.consistency.studyDaysCount) {
          setStreak(Math.min(stats.consistency.studyDaysCount, 7)); // Limitar a 7 dias para exibição simplificada
        }
      } else {
        setHasData(false);
      }
    }
  }, [loading, sessions]);

  // Estado vazio para novos usuários
  const EmptyState = () => (
    <div className="mt-2">
      <div className="flex items-start">
        <div className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Ainda não há dados de estudo registrados.
        </div>
      </div>
      <div className="flex items-center mt-2">
        <div className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Use o Flow para registrar seu tempo de estudo
        </div>
      </div>
    </div>
  );

  // Estado de carregamento
  const LoadingState = () => (
    <div className="flex items-center justify-center h-12">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF6B00]"></div>
    </div>
  );

  // Estado com dados
  const DataState = () => (
    <div className="space-y-2 mt-2">
      <div className="flex items-end">
        <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>{totalHours}</h3>
        <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>horas</span>
        
        {percentChange !== 0 && (
          <div className={`ml-2 flex items-center text-xs ${percentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {percentChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span className="ml-0.5">{Math.abs(percentChange)}%</span>
          </div>
        )}
      </div>
      
      {streak > 0 && (
        <div className="flex items-center">
          <div className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            <span className="font-medium">{streak}</span> {streak === 1 ? 'dia' : 'dias'} consecutivos
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#FF6B00]/5' : 'bg-[#FF6B00]/5'} rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500`}></div>

      <div className="flex justify-between items-start mb-1 relative z-10">
        <div className="flex items-center">
          <div className={`${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-2`}>
            <Clock className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
          </div>
          <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>Tempo de estudo</p>
        </div>
        
        <Link 
          to="/agenda?view=flow"
          className={`text-xs font-medium ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'} ${isLightMode ? 'text-orange-700' : 'text-[#FF6B00]'} py-0.5 px-2 rounded-full flex items-center transition-colors hover:bg-[#FF6B00]/30`}
        >
          <Zap className="h-3 w-3 mr-1" /> Iniciar
        </Link>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : hasData ? (
        <DataState />
      ) : (
        <EmptyState />
      )}
      
    </div>
  );
};

export default TempoEstudoCard;

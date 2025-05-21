
import React, { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface PosicaoRankingCardProps {
  className?: string;
  theme?: "light" | "dark";
}

interface RankingData {
  posicao: number | null;
  totalParticipantes: number;
  tendencia: {
    direcao: "up" | "down" | "stable";
    valor: number;
  } | null;
  percentil: number | null;
}

const PosicaoRankingCard: React.FC<PosicaoRankingCardProps> = ({ 
  className, 
  theme 
}) => {
  const [rankingData, setRankingData] = useState<RankingData>({
    posicao: null,
    totalParticipantes: 0,
    tendencia: null,
    percentil: null
  });
  
  const { theme: currentTheme } = useTheme();
  const isLightMode = (theme || currentTheme) === "light";

  useEffect(() => {
    // Aqui, no futuro, buscaremos os dados reais do ranking do usuário
    // Por enquanto, deixamos os valores iniciais mostrando estado de novo usuário
    
    // Exemplo de simulação de dados futuros:
    // const fetchRankingData = async () => {
    //   try {
    //     // const response = await fetch ou lógica para obter dados
    //     // setRankingData(data)
    //   } catch (error) {
    //     console.error('Erro ao buscar dados de ranking:', error);
    //   }
    // };
    // 
    // fetchRankingData();
  }, []);

  // Renderizar indicador de tendência
  const renderTendencia = () => {
    if (!rankingData.tendencia) return null;
    
    const { direcao, valor } = rankingData.tendencia;
    
    if (direcao === "up") {
      return (
        <span className={`text-xs font-medium ${isLightMode ? 'bg-green-100' : 'bg-green-500/20'} ${isLightMode ? 'text-green-700' : 'text-green-400'} py-0.5 px-2 rounded-full`}>
          ↑ {valor} {valor === 1 ? 'posição' : 'posições'}
        </span>
      );
    } else if (direcao === "down") {
      return (
        <span className={`text-xs font-medium ${isLightMode ? 'bg-red-100' : 'bg-red-500/20'} ${isLightMode ? 'text-red-700' : 'text-red-400'} py-0.5 px-2 rounded-full`}>
          ↓ {valor} {valor === 1 ? 'posição' : 'posições'}
        </span>
      );
    } else {
      return (
        <span className={`text-xs font-medium ${isLightMode ? 'bg-gray-100' : 'bg-gray-500/20'} ${isLightMode ? 'text-gray-700' : 'text-gray-400'} py-0.5 px-2 rounded-full`}>
          = Manteve
        </span>
      );
    }
  };

  return (
    <div className={`${className} group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#FF6B00]/5' : 'bg-[#FF6B00]/5'} rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500`}></div>
      
      <div className="flex justify-between items-start mb-1 relative z-10">
        <div className="flex items-center">
          <div className={`${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-2`}>
            <Trophy className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
          </div>
          <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>Posição ranking</p>
        </div>
        {renderTendencia()}
      </div>

      <div className="flex items-end mt-2">
        {rankingData.posicao ? (
          <>
            <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>#{rankingData.posicao}</h3>
            <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>/ ranking</span>
          </>
        ) : (
          <>
            <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>--</h3>
            <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>/ ranking</span>
          </>
        )}
      </div>

      <p className={`text-[10px] ${isLightMode ? 'text-gray-500' : 'text-gray-500'} mt-0.5`}>
        {rankingData.percentil 
          ? `Top ${rankingData.percentil}%` 
          : "Participe para aparecer no ranking"}
      </p>
    </div>
  );
};

export default PosicaoRankingCard;

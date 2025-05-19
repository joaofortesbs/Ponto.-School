import React from "react";
import { TrophyIcon, ExternalLinkIcon, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RankingProps {
  onViewRanking?: () => void;
}

const Ranking: React.FC<RankingProps> = ({ onViewRanking }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#001427] to-[#00111f] rounded-lg overflow-hidden shadow-lg border border-[#0D2238]/30">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-md mr-2 backdrop-blur-sm">
            <TrophyIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm tracking-wide">Ranking</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center relative">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-[#FF6B00]"></div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-[#FF6B00]"></div>
        </div>

        <div className="bg-gradient-to-br from-[#0D2238] to-[#102A40] p-4 rounded-full mb-4 shadow-inner border border-[#0D2238]/80 relative">
          <TrophyIcon className="h-8 w-8 text-[#FFD700] drop-shadow-md" />
          <span className="absolute -top-1 -right-1 bg-[#FFD700] text-[#001427] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">3</span>
        </div>
        <p className="text-white text-sm font-medium mb-1 drop-shadow-sm">Sua posição: #-</p>
        <p className="text-[#8393A0] text-xs mb-5 max-w-[80%] mx-auto">
          Participe de atividades para subir no ranking
        </p>
        <Button 
          onClick={onViewRanking}
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF9D60] text-white rounded-md w-full font-medium transition-all duration-300 shadow-md"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" /> Ver Ranking
        </Button>
      </div>
    </div>
  );
};

export default Ranking;
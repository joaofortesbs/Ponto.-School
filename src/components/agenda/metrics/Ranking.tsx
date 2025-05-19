
import React from "react";
import { TrophyIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RankingProps {
  onViewRanking?: () => void;
}

const Ranking: React.FC<RankingProps> = ({ onViewRanking }) => {
  return (
    <div className="flex flex-col h-full bg-[#001427] rounded-lg overflow-hidden">
      <div className="bg-[#FF6B00] p-3 flex items-center justify-between">
        <div className="flex items-center">
          <TrophyIcon className="h-5 w-5 text-white mr-2" />
          <h3 className="text-white font-medium text-sm">Ranking</h3>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-[#0D2238] p-4 rounded-full mb-3">
          <TrophyIcon className="h-8 w-8 text-[#8393A0]" />
        </div>
        <p className="text-white text-sm font-medium mb-1">Posição no Ranking: 0</p>
        <p className="text-[#8393A0] text-xs mb-4">
          0 pontos - Participe das atividades para subir no ranking
        </p>
        <Button 
          onClick={onViewRanking}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-md w-full"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" /> Ver Ranking
        </Button>
      </div>
    </div>
  );
};

export default Ranking;

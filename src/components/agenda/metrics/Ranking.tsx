
import React from "react";
import { Trophy as TrophyIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RankingProps {
  onViewRanking?: () => void;
}

const Ranking: React.FC<RankingProps> = ({ onViewRanking }) => {
  return (
    <div className="metrics-card h-full flex flex-col">
      <div className="metrics-card-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrophyIcon className="h-5 w-5 text-white" />
          <h3 className="text-white font-medium text-sm">Ranking</h3>
        </div>
      </div>
      
      <div className="metrics-empty-state flex-1">
        <div className="metrics-empty-icon">
          <TrophyIcon className="h-8 w-8 text-[#8393A0]" />
        </div>
        <p className="text-white text-sm font-medium mb-1">Posição no Ranking: 0</p>
        <p className="text-[#8393A0] text-xs mb-4">
          0 pontos - Participe das atividades para subir no ranking
        </p>
        <Button 
          onClick={onViewRanking}
          className="metrics-card-button w-full text-white rounded-md"
        >
          <ExternalLink className="h-4 w-4 mr-2" /> Ver Ranking
        </Button>
      </div>
    </div>
  );
};

export default Ranking;

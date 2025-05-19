
import React from "react";
import { Coins as CoinsIcon, Trophy as TrophyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PontosProps {
  onViewChallenges?: () => void;
}

const Pontos: React.FC<PontosProps> = ({ onViewChallenges }) => {
  return (
    <div className="metrics-card h-full flex flex-col">
      <div className="metrics-card-header flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CoinsIcon className="h-5 w-5 text-white" />
          <h3 className="text-white font-medium text-sm">Pontos</h3>
        </div>
      </div>
      
      <div className="metrics-empty-state flex-1">
        <div className="metrics-empty-icon">
          <CoinsIcon className="h-8 w-8 text-[#8393A0]" />
        </div>
        <p className="text-white text-sm font-medium mb-1">0 pontos</p>
        <p className="text-[#8393A0] text-xs mb-4">
          Complete desafios e tarefas para ganhar pontos e recompensas!
        </p>
        <Button 
          onClick={onViewChallenges}
          className="metrics-card-button w-full text-white rounded-md"
        >
          <TrophyIcon className="h-4 w-4 mr-2" /> Conquistas
        </Button>
      </div>
    </div>
  );
};

export default Pontos;

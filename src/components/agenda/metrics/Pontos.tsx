
import React from "react";
import { CoinsIcon, TrophyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PontosProps {
  onViewChallenges?: () => void;
}

const Pontos: React.FC<PontosProps> = ({ onViewChallenges }) => {
  return (
    <div className="flex flex-col h-full bg-[#001427] rounded-lg overflow-hidden">
      <div className="bg-[#FF6B00] p-3 flex items-center justify-between">
        <div className="flex items-center">
          <CoinsIcon className="h-5 w-5 text-white mr-2" />
          <h3 className="text-white font-medium text-sm">Pontos</h3>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-[#0D2238] p-4 rounded-full mb-3">
          <CoinsIcon className="h-8 w-8 text-[#8393A0]" />
        </div>
        <p className="text-white text-sm font-medium mb-1">0 pontos</p>
        <p className="text-[#8393A0] text-xs mb-4">
          Complete desafios e tarefas para ganhar pontos e recompensas!
        </p>
        <Button 
          onClick={onViewChallenges}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-md w-full"
        >
          <TrophyIcon className="h-4 w-4 mr-2" /> Conquistas
        </Button>
      </div>
    </div>
  );
};

export default Pontos;

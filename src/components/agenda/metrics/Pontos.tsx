import React from "react";
import { AwardIcon, ExternalLinkIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PontosProps {
  onViewChallenges?: () => void;
}

const Pontos: React.FC<PontosProps> = ({ onViewChallenges }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#001427] to-[#00111f] rounded-lg overflow-hidden shadow-lg border border-[#0D2238]/30">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-md mr-2 backdrop-blur-sm">
            <AwardIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm tracking-wide">Pontos e Desafios</h3>
        </div>
        <div className="bg-white/90 rounded-full px-3 py-0.5 text-xs text-[#FF6B00] font-bold shadow-sm flex items-center">
          <Sparkles className="h-3 w-3 mr-1 text-[#FFD700]" />
          0 pts
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center relative">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF6B00]/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#FF6B00]/5 rounded-full blur-lg"></div>

        <div className="bg-gradient-to-br from-[#0D2238] to-[#102A40] p-4 rounded-full mb-4 shadow-inner border border-[#0D2238]/80 relative group">
          <AwardIcon className="h-8 w-8 text-[#8393A0] group-hover:text-[#FF6B00] transition-all duration-300" />
          <div className="absolute inset-0 bg-[#FF6B00]/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        </div>
        <p className="text-white text-sm font-medium mb-1 drop-shadow-sm">Nenhum desafio ativo</p>
        <p className="text-[#8393A0] text-xs mb-5 max-w-[80%] mx-auto">
          Participe de desafios para ganhar pontos e recompensas
        </p>
        <Button 
          onClick={onViewChallenges}
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF9D60] text-white rounded-md w-full font-medium transition-all duration-300 shadow-md"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" /> Ver Desafios
        </Button>
      </div>
    </div>
  );
};

export default Pontos;
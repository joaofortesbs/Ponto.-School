
import React from "react";
import { Gift, RefreshCw, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CardRecompensasDisponiveisProps {
  currentPrizes: Array<{
    name: string;
    color: string;
    angle: number;
    icon: React.ReactNode;
    chance: number;
  }>;
  onRegeneratePrizes: () => void;
  regenerationCount: number;
  userSPs: number;
}

const CardRecompensasDisponiveis: React.FC<CardRecompensasDisponiveisProps> = ({
  currentPrizes,
  onRegeneratePrizes,
  regenerationCount,
  userSPs,
}) => {
  const regenerationCosts = [25, 50, 99];
  const currentCost = regenerationCosts[regenerationCount] || 999;
  const canRegenerate = regenerationCount < 3 && userSPs >= currentCost;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="backdrop-blur-md border border-white/20 rounded-xl p-4"
      style={{ 
        width: "280px",
        backgroundColor: "rgba(0, 0, 0, 0.3)"
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Gift className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>Recompensas Disponíveis</h3>
      </div>

      <div className="space-y-2 mb-4">
        {currentPrizes.map((prize, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 flex items-center justify-center">
              {prize.icon}
            </div>
            <span className="flex-1" style={{ color: "#FFFFFF" }}>{prize.name}</span>
            <span style={{ color: "#FFFFFF" }}>{prize.chance}%</span>
          </div>
        ))}
      </div>

      {/* Regenerar Recompensas */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: "#FFFFFF" }}>Regenerar recompensas</span>
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-orange-500" />
            <span className="text-xs" style={{ color: "#FFFFFF" }}>{userSPs} SPs</span>
          </div>
        </div>
        
        <Button
          onClick={onRegeneratePrizes}
          disabled={!canRegenerate}
          variant="outline"
          size="sm"
          className={`w-full text-xs ${
            canRegenerate 
              ? "bg-white/10 border-white/20 text-white hover:bg-white/20" 
              : "bg-gray-500/20 border-gray-500/20 text-gray-400 cursor-not-allowed"
          }`}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          {canRegenerate ? `Regenerar (${currentCost} SPs)` : 'Indisponível'}
        </Button>
        
        {regenerationCount > 0 && (
          <p className="text-xs mt-1 text-center" style={{ color: "#FFFFFF" }}>
            Regenerações: {regenerationCount}/3
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default CardRecompensasDisponiveis;

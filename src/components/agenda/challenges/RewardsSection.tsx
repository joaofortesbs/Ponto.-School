import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Award,
  Coins,
  Gift,
  ChevronRight,
  ShoppingBag,
  Trophy,
  Star,
  Crown,
  Zap,
  BookOpen,
  Brain,
  Target,
  Rocket,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "badge" | "coins" | "item" | "certificate";
  unlocked: boolean;
  progress?: number;
  total?: number;
}

interface RewardsSectionProps {
  rewards: Reward[];
  totalCoins: number;
  onViewStore: () => void;
}

const RewardsSection: React.FC<RewardsSectionProps> = ({
  rewards,
  totalCoins,
  onViewStore,
}) => {
  const unlockedRewards = rewards.filter((reward) => reward.unlocked);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white font-montserrat flex items-center gap-2">
          <Gift className="h-5 w-5 text-[#FF6B00]" /> Suas Recompensas
        </h3>
        <Button
          variant="outline"
          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          onClick={onViewStore}
        >
          <ShoppingBag className="h-4 w-4 mr-2" /> Loja de Recompensas
        </Button>
      </div>

      <div className="bg-[#29335C]/30 p-4 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
              <Coins className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-white font-medium">Ponto Coins</h4>
              <p className="text-xs text-gray-400">
                Moedas para trocar por recompensas
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#FF6B00]">{totalCoins}</div>
        </div>
        <Button
          className="w-full mt-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          onClick={onViewStore}
        >
          Trocar por Recompensas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map((reward) => (
          <Card
            key={reward.id}
            className={`bg-white/5 border-[#FF6B00]/20 hover:border-[#FF6B00]/40 transition-all duration-300 p-4 ${!reward.unlocked ? "opacity-70" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full ${reward.unlocked ? "bg-[#FF6B00]/20" : "bg-gray-700/30"} flex items-center justify-center`}
              >
                {reward.unlocked ? (
                  <div className="text-[#FF6B00]">{reward.icon}</div>
                ) : (
                  <Lock className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-medium">{reward.title}</h4>
                  {reward.unlocked ? (
                    <Badge className="bg-green-500 text-white">
                      Desbloqueado
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-gray-600 text-gray-400"
                    >
                      Bloqueado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {reward.description}
                </p>

                {!reward.unlocked &&
                  reward.progress !== undefined &&
                  reward.total !== undefined && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00]"
                          style={{
                            width: `${(reward.progress / reward.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>
                          {reward.progress} / {reward.total}
                        </span>
                        <span>
                          {Math.round((reward.progress / reward.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
        >
          Ver Todas as Recompensas <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default RewardsSection;

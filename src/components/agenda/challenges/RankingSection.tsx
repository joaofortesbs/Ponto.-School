import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  position: number;
  trend: "up" | "down" | "stable";
  trendValue?: number;
  isCurrentUser: boolean;
}

interface RankingSectionProps {
  users: RankingUser[];
  currentUserRank: RankingUser;
  totalParticipants: number;
  showInRanking: boolean;
  onToggleVisibility: () => void;
}

const RankingSection: React.FC<RankingSectionProps> = ({
  users,
  currentUserRank,
  totalParticipants,
  showInRanking,
  onToggleVisibility,
}) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string, value?: number) => {
    switch (trend) {
      case "up":
        return (
          <div className="flex items-center text-green-500">
            <ArrowUp className="h-3 w-3 mr-1" />
            {value && <span>{value}</span>}
          </div>
        );
      case "down":
        return (
          <div className="flex items-center text-red-500">
            <ArrowDown className="h-3 w-3 mr-1" />
            {value && <span>{value}</span>}
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <Minus className="h-3 w-3 mr-1" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-white font-montserrat flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#FF6B00]" /> Ranking
          </h3>
          <Badge className="bg-[#FF6B00]/20 text-[#FF6B00]">
            {totalParticipants} participantes
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 text-xs"
          onClick={onToggleVisibility}
        >
          {showInRanking ? (
            <>
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Visível no Ranking
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Oculto no Ranking
            </>
          )}
        </Button>
      </div>

      {/* Current user card */}
      <div className="bg-[#29335C]/30 p-4 rounded-xl mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[#FF6B00]/20 flex items-center justify-center border-2 border-[#FF6B00]">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUserRank.avatar} />
                <AvatarFallback>
                  {currentUserRank.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-xs font-bold">
              {currentUserRank.position}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-medium">
                  {currentUserRank.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Nível {currentUserRank.level}</span>
                  <span>•</span>
                  <span>{currentUserRank.points} pontos</span>
                  <span>•</span>
                  <span className="flex items-center">
                    {getTrendIcon(
                      currentUserRank.trend,
                      currentUserRank.trendValue,
                    )}
                  </span>
                </div>
              </div>
              <Badge className="bg-[#FF6B00] text-white">
                #{currentUserRank.position} / {totalParticipants}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Próximo nível</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-1.5 bg-[#FF6B00]/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Top users */}
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-white/5 rounded-lg p-3 border border-[#FF6B00]/10 ${user.isCurrentUser ? "border-[#FF6B00]/50 bg-[#FF6B00]/5" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                {getPositionIcon(user.position) || (
                  <span className="text-gray-400 font-medium">
                    #{user.position}
                  </span>
                )}
              </div>
              <Avatar className="h-8 w-8 border border-[#FF6B00]/30">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">
                    {user.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      Nível {user.level}
                    </span>
                    <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] text-xs">
                      {user.points} pts
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-xs">
                {getTrendIcon(user.trend, user.trendValue)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
        >
          Ver Ranking Completo <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default RankingSection;

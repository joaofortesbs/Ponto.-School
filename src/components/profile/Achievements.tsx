import React from "react";
import { Trophy, Star, Zap, Award, Medal, Target } from "lucide-react";

interface AchievementsProps {
  userProfile?: {
    achievements_count?: number;
    achievements?: Array<{
      id: number;
      title: string;
      description: string;
      date: string;
      rarity: string;
      progress: number;
      icon_type: string;
    }>;
  } | null;
}

export default function Achievements({ userProfile }: AchievementsProps) {
  // Se o usuário não tem conquistas, mostrar estado vazio
  if (!userProfile?.achievements || userProfile.achievements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
            Nenhuma conquista ainda
          </h3>
          <p className="text-sm text-[#64748B] dark:text-white/60 max-w-xs mx-auto">
            Continue usando a plataforma para desbloquear suas primeiras conquistas e marcos especiais.
          </p>
        </div>

        {/* Conquistas futuras em preview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#29335C] dark:text-white mb-3">
            Conquistas Disponíveis
          </h4>

          {[
            {
              title: "Primeiro Login",
              description: "Faça seu primeiro login na plataforma",
              icon: <Star className="h-5 w-5" />,
              rarity: "common"
            },
            {
              title: "Explorador",
              description: "Visite todas as seções da plataforma",
              icon: <Zap className="h-5 w-5" />,
              rarity: "uncommon"
            },
            {
              title: "Estudante Dedicado",
              description: "Complete 7 dias consecutivos de estudo",
              icon: <Trophy className="h-5 w-5" />,
              rarity: "rare"
            }
          ].map((achievement, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-300">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[#29335C] dark:text-white text-sm">
                      {achievement.title}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                      Bloqueado
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600";
      case "uncommon":
        return "from-green-400 to-green-600";
      case "rare":
        return "from-blue-400 to-blue-600";
      case "epic":
        return "from-purple-400 to-purple-600";
      case "legendary":
        return "from-yellow-400 to-yellow-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "Comum";
      case "uncommon":
        return "Incomum";
      case "rare":
        return "Raro";
      case "epic":
        return "Épico";
      case "legendary":
        return "Lendário";
      default:
        return "Comum";
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "star":
        return <Star className="h-6 w-6" />;
      case "trophy":
        return <Trophy className="h-6 w-6" />;
      case "zap":
        return <Zap className="h-6 w-6" />;
      case "award":
        return <Award className="h-6 w-6" />;
      case "medal":
        return <Medal className="h-6 w-6" />;
      case "target":
        return <Target className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-3">
      {userProfile.achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-md ${
            achievement.progress === 100
              ? "bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10"
              : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg bg-gradient-to-br ${getRarityColor(
                achievement.rarity
              )} text-white shadow-lg`}
            >
              {getIcon(achievement.icon_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-[#29335C] dark:text-white text-sm">
                  {achievement.title}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(
                    achievement.rarity
                  )} text-white shadow-sm`}
                >
                  {getRarityName(achievement.rarity)}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                {achievement.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#64748B] dark:text-white/60">
                  {achievement.date}
                </span>
                {achievement.progress < 100 && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#64748B] dark:text-white/60">
                      {achievement.progress}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import React from "react";
import { Trophy, Star, Clock, Zap, BookOpen, Award } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ConquistasCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Mock data for achievements (in a real app, this would come from API/backend)
  const achievements = [
    {
      id: 1,
      name: "Primeiro Passo",
      icon: <Clock className="h-4 w-4" />,
      description: "1 hora de estudo",
      progress: 100,
      unlocked: true,
      category: "Tempo",
      points: 50
    },
    {
      id: 2,
      name: "Estudante Dedicado",
      icon: <Zap className="h-4 w-4" />,
      description: "5 dias consecutivos",
      progress: 80,
      unlocked: false,
      category: "Dedicação",
      points: 100
    },
    {
      id: 3,
      name: "Multidisciplinar",
      icon: <BookOpen className="h-4 w-4" />,
      description: "3 disciplinas estudadas",
      progress: 100,
      unlocked: true,
      category: "Aprendizado",
      points: 75
    },
    {
      id: 4,
      name: "Explorador",
      icon: <Star className="h-4 w-4" />,
      description: "Explorou todas as seções",
      progress: 30,
      unlocked: false,
      category: "Exploração",
      points: 60
    }
  ];

  // Calculate total achievements and unlocked achievements
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const progressPercentage = (unlockedAchievements / totalAchievements) * 100;

  return (
    <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#FF6B00]/5' : 'bg-[#FF6B00]/5'} rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500`}></div>

      <div className="flex justify-between items-start mb-1 relative z-10">
        <div className="flex items-center">
          <div className={`${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-2`}>
            <Trophy className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
          </div>
          <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>Conquistas</p>
        </div>
        <Badge variant={isLightMode ? "outline" : "secondary"} className={`text-xs font-medium ${isLightMode ? 'bg-orange-100 text-orange-700' : 'bg-[#FF6B00]/20 text-[#FF6B00]'} py-0.5 px-2 rounded-full`}>
          {unlockedAchievements}/{totalAchievements}
        </Badge>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Progresso</span>
          <span className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className={`h-1.5 ${isLightMode ? 'bg-orange-100' : 'bg-[#0A2540]'}`}
          indicatorClassName={`bg-[#FF6B00]`}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 mt-3">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`group/badge rounded-md p-1.5 border transition-all duration-200 ${
              achievement.unlocked 
                ? `${isLightMode ? 'bg-orange-50/50 border-orange-200' : 'bg-[#FF6B00]/10 border-[#FF6B00]/30'} hover:border-[#FF6B00]/50` 
                : `${isLightMode ? 'bg-gray-100/50 border-gray-200' : 'bg-gray-800/30 border-gray-700/50'}`
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div className={`min-w-[1.5rem] h-6 rounded-full flex items-center justify-center ${
                achievement.unlocked 
                  ? `${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'} text-[#FF6B00]` 
                  : `${isLightMode ? 'bg-gray-200' : 'bg-gray-700/50'} ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`
              }`}>
                {achievement.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium truncate ${
                  achievement.unlocked 
                    ? `${isLightMode ? 'text-gray-800' : 'text-white'}` 
                    : `${isLightMode ? 'text-gray-500' : 'text-gray-400'}`
                }`}>
                  {achievement.name}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className={`text-[10px] ${
                    achievement.unlocked 
                      ? `${isLightMode ? 'text-orange-700' : 'text-[#FF6B00]/80'}` 
                      : `${isLightMode ? 'text-gray-500' : 'text-gray-500'}`
                  }`}>
                    {achievement.unlocked ? (
                      <span className="flex items-center">
                        <Trophy className="h-2.5 w-2.5 mr-0.5 text-[#FFD700]" />
                        {achievement.points} pts
                      </span>
                    ) : (
                      `${achievement.progress}%`
                    )}
                  </span>
                  <Badge className={`px-1 py-0 text-[9px] ${
                    achievement.unlocked 
                      ? `bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30` 
                      : `bg-transparent text-gray-500 border border-gray-300 dark:border-gray-600`
                  }`}>
                    {achievement.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

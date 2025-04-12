import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Award, ChevronRight, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Achievements() {
  const navigate = useNavigate();

  const achievements = [
    {
      id: 1,
      name: "Mestre em Matemática",
      icon: <Trophy className="h-6 w-6" />,
      progress: 100,
      unlocked: true,
      date: "10/03/2024",
      category: "Acadêmico",
      points: 200
    },
    {
      id: 2,
      name: "Estudante Dedicado",
      icon: <Zap className="h-6 w-6" />,
      progress: 100,
      unlocked: true,
      date: "15/03/2024",
      category: "Dedicação",
      points: 150
    },
    {
      id: 3,
      name: "Velocista",
      icon: <Clock className="h-6 w-6" />,
      progress: 45,
      unlocked: false,
      category: "Tempo",
      points: 100
    },
    {
      id: 4,
      name: "Colaborador Premium",
      icon: <Star className="h-6 w-6" />,
      progress: 75,
      unlocked: false,
      category: "Social",
      points: 250
    }
  ];

  const handleViewAll = () => {
    navigate("/conquistas");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 shadow-sm w-full overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#FF6B00]" />
          Conquistas
        </h3>
        <Button
          variant="ghost"
          className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
          onClick={handleViewAll}
        >
          Ver Todas <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <motion.div 
        className="grid grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {achievements.map((achievement) => (
          <motion.div 
            key={achievement.id}
            className="relative overflow-hidden group"
            variants={item}
          >
            <div className={`bg-gradient-to-br rounded-lg p-3 border transition-all duration-300 ${
              achievement.unlocked 
                ? "from-[#FF6B00]/5 to-[#FF6B00]/10 border-[#FF6B00]/20 hover:border-[#FF6B00]/40" 
                : "from-gray-100 to-gray-200 border-gray-200 dark:from-gray-800/30 dark:to-gray-800/50 dark:border-gray-700"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  achievement.unlocked 
                    ? "bg-[#FF6B00]/20 text-[#FF6B00]" 
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                }`}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    achievement.unlocked 
                      ? "text-[#29335C] dark:text-white" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {achievement.name}
                  </p>
                  
                  <div className="mt-1">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <Badge variant={achievement.unlocked ? "default" : "outline"} className={`px-1 py-0 text-[10px] ${
                        achievement.unlocked ? "bg-[#FF6B00]" : "text-gray-400"
                      }`}>
                        {achievement.category}
                      </Badge>
                      <span className={`text-xs ${
                        achievement.unlocked 
                          ? "text-[#FF6B00]" 
                          : "text-gray-400"
                      }`}>
                        {achievement.unlocked ? "Concluído" : `${achievement.progress}%`}
                      </span>
                    </div>
                    <Progress 
                      value={achievement.progress} 
                      className={`h-1 ${
                        achievement.unlocked 
                          ? "bg-[#FF6B00]/20" 
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      indicatorClassName={achievement.unlocked ? "bg-[#FF6B00]" : "bg-gray-400"}
                    />
                  </div>
                  
                  {achievement.unlocked && (
                    <div className="mt-1.5 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-[#FFD700]" />
                        <span className="text-xs font-semibold text-[#29335C] dark:text-white/70">
                          {achievement.points} pts
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {achievement.date}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Efeito de brilho para conquistas desbloqueadas */}
            {achievement.unlocked && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000">
                <div className="absolute inset-0 bg-[#FF6B00]/5 animate-pulse"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-[#FF6B00]/20 to-transparent skew-x-15 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
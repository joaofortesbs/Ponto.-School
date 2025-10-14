
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Trophy, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function GradeCardsTopoPainel() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  const cardData = [
    {
      id: 1,
      title: "Alunos",
      value: "1.234",
      icon: Users,
      gradient: "from-orange-400/5 via-orange-500/10 to-transparent",
      glowColor: "orange-500/20",
    },
    {
      id: 2,
      title: "Trilhas",
      value: "42",
      icon: BookOpen,
      gradient: "from-orange-400/5 via-orange-500/10 to-transparent",
      glowColor: "orange-500/20",
    },
    {
      id: 3,
      title: "Engajamento",
      value: "87%",
      icon: TrendingUp,
      gradient: "from-orange-400/5 via-orange-500/10 to-transparent",
      glowColor: "orange-500/20",
    },
    {
      id: 4,
      title: "Ranking",
      value: "#3",
      icon: Trophy,
      gradient: "from-orange-400/5 via-orange-500/10 to-transparent",
      glowColor: "orange-500/20",
    },
    {
      id: 5,
      title: "Sugestão IA",
      description: "Recomendamos focar em atividades práticas de Matemática esta semana.",
      icon: Sparkles,
      gradient: "from-orange-400/5 via-orange-500/10 to-transparent",
      glowColor: "orange-500/20",
      isWide: true,
    },
  ];

  return (
    <div className="w-full max-w-[98%] sm:max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className={`
                ${card.isWide ? 'lg:col-span-2' : 'lg:col-span-1'}
                group relative overflow-hidden 
                ${isLightMode 
                  ? 'bg-white/80 backdrop-blur-xl border-orange-100/30' 
                  : 'bg-slate-900/40 backdrop-blur-xl border-orange-500/10'
                }
                transition-all duration-500 ease-out
                rounded-3xl
                ${!card.isWide ? 'h-[90px]' : 'h-[90px]'}
                hover:scale-[1.02]
                hover:shadow-2xl hover:shadow-orange-500/10
                border
              `}
            >
              {/* Animated gradient overlay on hover */}
              <div className={`
                absolute inset-0 
                bg-gradient-to-br ${card.gradient}
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
              `} />
              
              {/* Subtle glow effect */}
              <div className={`
                absolute -inset-[1px] 
                bg-gradient-to-r from-orange-400/0 via-orange-500/20 to-orange-400/0
                opacity-0 group-hover:opacity-100
                blur-xl
                transition-opacity duration-500
                -z-10
              `} />

              {/* Animated border accent */}
              <div className="absolute inset-0 rounded-3xl">
                <div className={`
                  absolute inset-x-0 top-0 h-[2px]
                  bg-gradient-to-r from-transparent via-orange-500/50 to-transparent
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-500
                `} />
              </div>

              {/* Subtle dots pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, ${isLightMode ? '#FF6B00' : '#FF8F40'} 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }} />

              <CardContent className={`relative p-4 h-full flex items-center ${card.isWide ? 'gap-4' : 'gap-3.5'} z-10`}>
                {!card.isWide ? (
                  <>
                    {/* Icon container with creative design */}
                    <div className="relative flex-shrink-0">
                      {/* Outer ring */}
                      <div className={`
                        w-12 h-12 rounded-2xl
                        ${isLightMode 
                          ? 'bg-gradient-to-br from-orange-50 to-orange-100/50' 
                          : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5'
                        }
                        flex items-center justify-center
                        transition-all duration-500
                        group-hover:scale-110 group-hover:rotate-6
                      `}>
                        {/* Inner glow */}
                        <div className={`
                          absolute inset-0 rounded-2xl
                          ${isLightMode ? 'bg-orange-400/0' : 'bg-orange-500/0'}
                          group-hover:bg-orange-500/10
                          transition-colors duration-500
                        `} />
                        
                        <Icon className={`
                          w-5 h-5 text-orange-500 relative z-10
                          transition-all duration-500
                          group-hover:scale-110
                        `} />
                      </div>
                      
                      {/* Decorative corner accent */}
                      <div className={`
                        absolute -top-1 -right-1 w-3 h-3 rounded-full
                        bg-gradient-to-br from-orange-400 to-orange-500
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-500
                      `} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`
                        text-[10px] font-semibold tracking-wider uppercase mb-1
                        ${isLightMode ? 'text-orange-600/70' : 'text-orange-400/70'}
                        transition-colors duration-300
                        group-hover:text-orange-500
                      `}>
                        {card.title}
                      </p>
                      <h3 className={`
                        text-2xl font-bold tracking-tight
                        ${isLightMode 
                          ? 'text-slate-800 group-hover:text-slate-900' 
                          : 'text-white group-hover:text-orange-50'
                        }
                        transition-colors duration-300
                      `}>
                        {card.value}
                      </h3>
                    </div>

                    {/* Subtle indicator line */}
                    <div className={`
                      w-1 h-8 rounded-full
                      bg-gradient-to-b from-orange-400/30 to-orange-500/50
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-500
                    `} />
                  </>
                ) : (
                  <>
                    {/* IA Icon with special treatment */}
                    <div className="relative flex-shrink-0">
                      <div className={`
                        w-12 h-12 rounded-2xl
                        ${isLightMode 
                          ? 'bg-gradient-to-br from-orange-50 to-orange-100/50' 
                          : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5'
                        }
                        flex items-center justify-center
                        transition-all duration-500
                        group-hover:scale-110
                      `}>
                        {/* Pulsing glow for IA */}
                        <div className="absolute inset-0 rounded-2xl bg-orange-500/20 animate-pulse" />
                        
                        <Icon className={`
                          w-5 h-5 text-orange-500 relative z-10
                          transition-all duration-500
                        `} />
                      </div>
                      
                      {/* AI badge indicator */}
                      <div className={`
                        absolute -bottom-1 -right-1 w-4 h-4 rounded-full
                        bg-gradient-to-br from-orange-400 to-orange-500
                        flex items-center justify-center
                        opacity-90
                      `}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>

                    {/* IA Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`
                          text-[10px] font-bold tracking-wider uppercase
                          ${isLightMode ? 'text-orange-600' : 'text-orange-400'}
                          transition-colors duration-300
                        `}>
                          {card.title}
                        </p>
                        <div className="flex gap-1">
                          <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
                          <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                      <p className={`
                        text-xs leading-relaxed line-clamp-2
                        ${isLightMode ? 'text-slate-600' : 'text-slate-300'}
                        transition-colors duration-300
                        group-hover:text-slate-700 dark:group-hover:text-slate-200
                      `}>
                        {card.description}
                      </p>
                    </div>

                    {/* Arrow indicator for IA */}
                    <div className={`
                      flex-shrink-0 w-6 h-6 rounded-lg
                      ${isLightMode ? 'bg-orange-50' : 'bg-orange-500/10'}
                      flex items-center justify-center
                      opacity-0 group-hover:opacity-100
                      transition-all duration-500
                      group-hover:translate-x-1
                    `}>
                      <svg 
                        className="w-3 h-3 text-orange-500" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

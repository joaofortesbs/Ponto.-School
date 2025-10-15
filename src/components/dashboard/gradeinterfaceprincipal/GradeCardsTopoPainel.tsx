import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Route, TrendingUp, Trophy, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function GradeCardsTopoPainel() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  const cardData = [
    {
      id: 1,
      title: "Alunos",
      value: "1.234",
      icon: "fas fa-users",
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
      gradientHover: "from-orange-500/15 to-orange-600/10",
      isFontAwesome: true,
    },
    {
      id: 2,
      title: "Trilhas",
      value: "42",
      icon: "fas fa-route",
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
      gradientHover: "from-orange-500/15 to-orange-600/10",
      isFontAwesome: true,
    },
    {
      id: 3,
      title: "Engajamento",
      value: "87%",
      icon: "fas fa-chart-line",
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
      gradientHover: "from-orange-500/15 to-orange-600/10",
      isFontAwesome: true,
    },
    {
      id: 4,
      title: "Ranking",
      value: "#3",
      icon: "fas fa-trophy",
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
      gradientHover: "from-orange-500/15 to-orange-600/10",
      isFontAwesome: true,
    },
    {
      id: 5,
      title: "Sugestão IA",
      description: "Recomendamos focar em atividades práticas de Matemática esta semana.",
      icon: "fas fa-sparkles",
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
      gradientHover: "from-orange-500/15 to-orange-600/10",
      isFontAwesome: true,
      isWide: true,
    },
  ];

  return (
    <div className="w-full max-w-[98%] sm:max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className={`
                ${card.isWide ? 'lg:col-span-2' : 'lg:col-span-1'}
                group relative overflow-hidden 
                ${isLightMode 
                  ? 'bg-white/95 border-2 border-orange-100/60 hover:border-orange-300/80' 
                  : 'bg-[#001F3F]/60 border-2 border-orange-500/15 hover:border-orange-500/35'
                }
                transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                rounded-[1.5rem]
                ${!card.isWide ? 'h-[90px]' : 'h-[90px]'}
                hover:shadow-2xl hover:shadow-orange-500/20
                hover:-translate-y-2 hover:scale-[1.02]
                backdrop-blur-xl
                cursor-pointer
              `}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out`} />
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-[cubic-bezier(0.4,0,0.2,1)] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Glow effect border */}
              <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 blur-xl" />

              <CardContent className={`relative p-4 h-full flex items-center ${card.isWide ? 'gap-3' : 'gap-3'} z-10`}>
                {!card.isWide ? (
                  <>
                    {/* Enhanced Icon Container */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isLightMode 
                        ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 group-hover:from-orange-100 group-hover:to-orange-200/60' 
                        : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 group-hover:from-orange-500/25 group-hover:to-orange-600/15'
                      }
                      transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      group-hover:scale-110 group-hover:rotate-3
                      border border-orange-500/20 group-hover:border-orange-500/40
                      shadow-sm group-hover:shadow-lg group-hover:shadow-orange-500/25
                    `}>
                      {card.isFontAwesome ? (
                        <i className={`${card.icon} ${card.iconColor} transition-all duration-500 ease-out group-hover:scale-110`} style={{ fontSize: '1.35rem' }}></i>
                      ) : (
                        <Icon className={`w-6 h-6 ${card.iconColor} transition-all duration-500 ease-out group-hover:scale-110`} />
                      )}
                    </div>

                    {/* Enhanced Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold mb-1 tracking-wide uppercase ${isLightMode ? 'text-gray-500 group-hover:text-orange-600' : 'text-gray-400 group-hover:text-orange-400'} transition-colors duration-500 ease-out`}>
                        {card.title}
                      </p>
                      <h3 className={`text-2xl font-bold tracking-tight ${isLightMode ? 'text-gray-900 group-hover:text-orange-600' : 'text-white group-hover:text-orange-400'} transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 origin-left`}>
                        {card.value}
                      </h3>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Enhanced IA Icon with pulse */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative
                      ${isLightMode 
                        ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 group-hover:from-orange-100 group-hover:to-orange-200/60' 
                        : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 group-hover:from-orange-500/25 group-hover:to-orange-600/15'
                      }
                      transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      group-hover:scale-110
                      border border-orange-500/20 group-hover:border-orange-500/40
                      shadow-sm group-hover:shadow-lg group-hover:shadow-orange-500/25
                    `}>
                      {/* Pulsing ring effect */}
                      <div className="absolute inset-0 rounded-xl border-2 border-orange-500/30 animate-ping opacity-0 group-hover:opacity-75" />
                      
                      {card.isFontAwesome ? (
                        <i className={`${card.icon} ${card.iconColor} animate-pulse transition-all duration-500 ease-out`} style={{ fontSize: '1.35rem' }}></i>
                      ) : (
                        <Icon className={`w-6 h-6 ${card.iconColor} animate-pulse transition-all duration-500 ease-out`} />
                      )}
                    </div>

                    {/* Enhanced IA Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold mb-1.5 tracking-wide ${isLightMode ? 'text-orange-600' : 'text-orange-400'} flex items-center gap-2 transition-all duration-500 ease-out`}>
                        {card.title}
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                      </p>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${isLightMode ? 'text-gray-600 group-hover:text-gray-800' : 'text-gray-400 group-hover:text-gray-200'} transition-colors duration-500 ease-out`}>
                        {card.description}
                      </p>
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
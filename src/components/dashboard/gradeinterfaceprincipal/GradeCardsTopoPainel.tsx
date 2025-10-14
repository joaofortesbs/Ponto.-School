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
      icon: Users,
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
    },
    {
      id: 2,
      title: "Trilhas",
      value: "42",
      icon: "fas fa-route", // Changed to Font Awesome class
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
      isFontAwesome: true, // Flag to indicate Font Awesome icon
    },
    {
      id: 3,
      title: "Engajamento",
      value: "87%",
      icon: TrendingUp,
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
    },
    {
      id: 4,
      title: "Ranking",
      value: "#3",
      icon: Trophy,
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
    },
    {
      id: 5,
      title: "Sugestão IA",
      description: "Recomendamos focar em atividades práticas de Matemática esta semana.",
      icon: Sparkles,
      iconColor: "text-orange-500",
      accentColor: "from-orange-500/10 to-orange-600/5",
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
                  ? 'bg-white border border-orange-100/50 hover:border-orange-200' 
                  : 'bg-[#001F3F]/50 border border-orange-500/10 hover:border-orange-500/20'
                }
                transition-all duration-300
                rounded-2xl
                ${!card.isWide ? 'h-[90px]' : 'h-[90px]'}
                hover:shadow-lg hover:shadow-orange-500/5
                backdrop-blur-sm
              `}
            >
              {/* Subtle gradient accent */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Border accent on hover */}
              <div className="absolute inset-0 rounded-2xl border border-orange-500/0 group-hover:border-orange-500/20 transition-all duration-300" />

              <CardContent className={`relative p-4 h-full flex items-center ${card.isWide ? 'gap-3' : 'gap-3'}`}>
                {!card.isWide ? (
                  <>
                    {/* Icon with subtle background */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isLightMode 
                        ? 'bg-orange-50 group-hover:bg-orange-100' 
                        : 'bg-orange-500/10 group-hover:bg-orange-500/20'
                      }
                      transition-colors duration-300
                    `}>
                      {card.isFontAwesome ? (
                        <i className={`${card.icon} ${card.iconColor}`} style={{ fontSize: '1.25rem' }}></i>
                      ) : (
                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                      )}
                      <div className="icon-glow"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium mb-0.5 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {card.title}
                      </p>
                      <h3 className={`text-2xl font-bold tracking-tight ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                        {card.value}
                      </h3>
                    </div>
                  </>
                ) : (
                  <>
                    {/* IA Icon with glow effect */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isLightMode 
                        ? 'bg-orange-50 group-hover:bg-orange-100' 
                        : 'bg-orange-500/10 group-hover:bg-orange-500/20'
                      }
                      transition-colors duration-300
                    `}>
                      <Icon className={`w-5 h-5 ${card.iconColor} animate-pulse`} />
                      <div className="icon-glow"></div>
                    </div>

                    {/* IA Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold mb-1 ${isLightMode ? 'text-orange-600' : 'text-orange-400'} flex items-center gap-1.5`}>
                        {card.title}
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                      </p>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
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
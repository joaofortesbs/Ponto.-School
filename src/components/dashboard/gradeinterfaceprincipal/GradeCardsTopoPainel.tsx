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
      iconColor: "text-blue-500",
    },
    {
      id: 2,
      title: "Trilhas",
      value: "42",
      icon: BookOpen,
      iconColor: "text-purple-500",
    },
    {
      id: 3,
      title: "Engajamento",
      value: "87%",
      icon: TrendingUp,
      iconColor: "text-emerald-500",
    },
    {
      id: 4,
      title: "Ranking",
      value: "#3",
      icon: Trophy,
      iconColor: "text-amber-500",
    },
    {
      id: 5,
      title: "Sugestão IA",
      description: "Recomendamos focar em atividades práticas de Matemática esta semana.",
      icon: Sparkles,
      iconColor: "text-orange-500",
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
                border
                ${isLightMode 
                  ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md' 
                  : 'bg-[#001F3F] border-white/10 hover:border-white/20 hover:shadow-lg'
                }
                transition-all duration-300
                rounded-2xl
                ${!card.isWide ? 'h-[90px]' : 'h-[90px]'}
              `}
            >
              <CardContent className={`p-4 h-full flex items-center ${card.isWide ? 'gap-3' : 'gap-2.5'}`}>
                {!card.isWide ? (
                  <>
                    {/* Ícone pequeno no topo esquerdo */}
                    <Icon className={`w-5 h-5 ${card.iconColor} flex-shrink-0`} />

                    {/* Nome e valor ao lado */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium mb-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {card.title}
                      </p>
                      <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                        {card.value}
                      </h3>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Ícone IA */}
                    <Icon className={`w-5 h-5 ${card.iconColor} flex-shrink-0`} />

                    {/* Conteúdo IA */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'} flex items-center gap-1`}>
                        {card.title}
                        <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" />
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
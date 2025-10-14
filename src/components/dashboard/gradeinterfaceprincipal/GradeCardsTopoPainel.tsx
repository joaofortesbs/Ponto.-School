
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
      title: "Total de Alunos",
      value: "1.234",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      bgDark: "bg-blue-950/20",
    },
    {
      id: 2,
      title: "Trilhas School",
      value: "42",
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      bgDark: "bg-purple-950/20",
    },
    {
      id: 3,
      title: "Engajamento",
      value: "87%",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      bgDark: "bg-emerald-950/20",
    },
    {
      id: 4,
      title: "Ranking Professores",
      value: "#3",
      icon: Trophy,
      color: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      bgDark: "bg-amber-950/20",
    },
  ];

  return (
    <div className="w-full max-w-[98%] sm:max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Cards principais - 4 primeiros */}
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className={`group relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 ${
                isLightMode
                  ? "bg-white hover:bg-gray-50"
                  : "bg-[#001F3F] hover:bg-[#002F4F]"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium mb-2 ${
                        isLightMode ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {card.title}
                    </p>
                    <h3
                      className={`text-3xl font-bold ${
                        isLightMode ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {card.value}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      isLightMode ? card.bgLight : card.bgDark
                    } group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-6 h-6 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`} style={{
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`
                    }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Card de Sugestão IA - Dobro da largura */}
        <Card
          className={`md:col-span-2 lg:col-span-2 group relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 ${
            isLightMode
              ? "bg-gradient-to-br from-orange-50 to-pink-50 hover:from-orange-100 hover:to-pink-100"
              : "bg-gradient-to-br from-orange-950/20 to-pink-950/20 hover:from-orange-950/30 hover:to-pink-950/30"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <p
                    className={`text-sm font-semibold ${
                      isLightMode ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Sugestão Personalizada da IA
                  </p>
                </div>
                <p
                  className={`text-base leading-relaxed ${
                    isLightMode ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  Com base no desempenho recente dos alunos, recomendamos focar em atividades práticas de Matemática esta semana.
                </p>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  isLightMode ? "bg-orange-100" : "bg-orange-950/40"
                } group-hover:scale-110 transition-transform duration-300`}
              >
                <Sparkles className="w-7 h-7 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

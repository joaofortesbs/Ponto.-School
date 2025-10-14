
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
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      bgLight: "bg-gradient-to-br from-blue-50 to-indigo-50",
      bgDark: "bg-gradient-to-br from-blue-950/30 to-indigo-950/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      glowColor: "shadow-blue-500/20",
    },
    {
      id: 2,
      title: "Trilhas School",
      value: "42",
      icon: BookOpen,
      gradient: "from-purple-500 via-purple-600 to-violet-600",
      bgLight: "bg-gradient-to-br from-purple-50 to-violet-50",
      bgDark: "bg-gradient-to-br from-purple-950/30 to-violet-950/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      glowColor: "shadow-purple-500/20",
    },
    {
      id: 3,
      title: "Engajamento",
      value: "87%",
      icon: TrendingUp,
      gradient: "from-emerald-500 via-emerald-600 to-teal-600",
      bgLight: "bg-gradient-to-br from-emerald-50 to-teal-50",
      bgDark: "bg-gradient-to-br from-emerald-950/30 to-teal-950/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      glowColor: "shadow-emerald-500/20",
    },
    {
      id: 4,
      title: "Ranking Professores",
      value: "#3",
      icon: Trophy,
      gradient: "from-amber-500 via-orange-500 to-yellow-600",
      bgLight: "bg-gradient-to-br from-amber-50 to-yellow-50",
      bgDark: "bg-gradient-to-br from-amber-950/30 to-yellow-950/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      glowColor: "shadow-amber-500/20",
    },
    {
      id: 5,
      title: "Sugestão IA",
      description: "Com base no desempenho recente, recomendamos focar em atividades práticas de Matemática esta semana.",
      icon: Sparkles,
      gradient: "from-orange-500 via-pink-500 to-rose-600",
      bgLight: "bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50",
      bgDark: "bg-gradient-to-br from-orange-950/30 via-pink-950/20 to-rose-950/20",
      iconBg: "bg-gradient-to-br from-orange-500/10 to-pink-500/10",
      iconColor: "text-orange-600",
      glowColor: "shadow-orange-500/20",
      isWide: true,
    },
  ];

  return (
    <div className="w-full max-w-[98%] sm:max-w-[1600px] mx-auto">
      {/* Grid responsivo - todos os cards na mesma linha em desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className={`
                ${card.isWide ? 'lg:col-span-2' : 'lg:col-span-1'}
                group relative overflow-hidden 
                border-none 
                ${isLightMode ? card.bgLight : card.bgDark}
                backdrop-blur-sm
                hover:scale-[1.02] 
                transition-all duration-500 ease-out
                ${isLightMode ? 'shadow-lg hover:shadow-xl' : 'shadow-xl hover:shadow-2xl'}
                ${card.glowColor}
                rounded-2xl
              `}
              style={{
                borderRadius: '1rem', // Mesmo tamanho de borda do banner
              }}
            >
              {/* Brilho de fundo animado */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 
                bg-gradient-to-r ${card.gradient}
                transition-opacity duration-500
              `} style={{ opacity: 0.05 }} />
              
              {/* Linha superior decorativa gradiente */}
              <div className={`
                absolute top-0 left-0 right-0 h-1 
                bg-gradient-to-r ${card.gradient}
                opacity-60 group-hover:opacity-100
                transition-opacity duration-300
              `} />

              <CardContent className={`p-5 ${card.isWide ? 'sm:p-6' : 'p-4'} relative z-10`}>
                {!card.isWide ? (
                  // Layout para cards pequenos (4 primeiros)
                  <div className="flex flex-col h-full">
                    {/* Ícone no topo */}
                    <div className="flex justify-center mb-4">
                      <div
                        className={`
                          ${card.iconBg}
                          p-4 rounded-2xl
                          group-hover:scale-110 group-hover:rotate-3
                          transition-all duration-500
                          ${isLightMode ? 'shadow-md' : 'shadow-lg'}
                        `}
                      >
                        <Icon className={`w-8 h-8 ${card.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                    </div>

                    {/* Título e valor centralizados */}
                    <div className="text-center space-y-2 flex-1 flex flex-col justify-center">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {card.title}
                      </p>
                      <h3 className={`text-4xl font-black bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                        {card.value}
                      </h3>
                    </div>
                  </div>
                ) : (
                  // Layout para card de Sugestão IA (dobro da largura)
                  <div className="flex items-center gap-4 h-full">
                    {/* Ícone à esquerda */}
                    <div
                      className={`
                        ${card.iconBg}
                        p-5 rounded-2xl flex-shrink-0
                        group-hover:scale-110 group-hover:rotate-6
                        transition-all duration-500
                        ${isLightMode ? 'shadow-lg' : 'shadow-xl'}
                      `}
                    >
                      <Icon className={`w-10 h-10 ${card.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                    </div>

                    {/* Conteúdo à direita */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className={`text-sm font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                          {card.title}
                        </p>
                        <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                      </div>
                      <p className={`text-sm leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                        {card.description}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Efeito de brilho no hover - canto inferior direito */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/20 dark:bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

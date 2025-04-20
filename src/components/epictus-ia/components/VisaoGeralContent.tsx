import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, BookOpen, BarChart3, Calendar, Wrench, MessageSquare, Lightbulb, Compass, ArrowRight, Brain, Sparkles, PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VisaoGeralContentProps {
  theme?: string;
}

const VisaoGeralContent: React.FC<VisaoGeralContentProps> = ({ theme }) => {
  const themeContext = useTheme();
  const currentTheme = theme || themeContext.theme;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="h-8 w-8 text-[#FF6B00]" />
        </div>
        <h2
          className={`text-xl font-bold ${currentTheme === "dark" ? "text-white" : "text-[#29335C]"} mb-2`}
        >
          Bem-vindo ao Epictus IA
        </h2>
        <p
          className={`${currentTheme === "dark" ? "text-white/60" : "text-[#64748B]"} max-w-md mx-auto mb-6`}
        >
          Explore todas as ferramentas inteligentes para potencializar seus estudos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className={`p-4 border ${currentTheme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3
                className={`font-medium ${currentTheme === "dark" ? "text-white" : "text-[#29335C]"}`}
              >
                Chat Inteligente
              </h3>
              <p
                className={`text-sm ${currentTheme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
              >
                Converse com diferentes assistentes especializados
              </p>
              <Button
                variant="link"
                className="text-[#FF6B00] p-0 h-auto font-normal flex items-center"
              >
                Explorar <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 border ${currentTheme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3
                className={`font-medium ${currentTheme === "dark" ? "text-white" : "text-[#29335C]"}`}
              >
                Aprender Mais Rápido
              </h3>
              <p
                className={`text-sm ${currentTheme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
              >
                Resumos e mapas mentais para aprendizado eficiente
              </p>
              <Button
                variant="link"
                className="text-[#FF6B00] p-0 h-auto font-normal flex items-center"
              >
                Explorar <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 border ${currentTheme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3
                className={`font-medium ${currentTheme === "dark" ? "text-white" : "text-[#29335C]"}`}
              >
                Analisar e Corrigir
              </h3>
              <p
                className={`text-sm ${currentTheme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
              >
                Ferramentas para análise de desempenho e correções
              </p>
              <Button
                variant="link"
                className="text-[#FF6B00] p-0 h-auto font-normal flex items-center"
              >
                Explorar <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 border ${currentTheme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3
                className={`font-medium ${currentTheme === "dark" ? "text-white" : "text-[#29335C]"}`}
              >
                Criar Conteúdo
              </h3>
              <p
                className={`text-sm ${currentTheme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
              >
                Ferramentas para criar materiais didáticos
              </p>
              <Button
                variant="link"
                className="text-[#FF6B00] p-0 h-auto font-normal flex items-center"
              >
                Explorar <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 border ${currentTheme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3
                className={`font-medium ${currentTheme === "dark" ? "text-white" : "text-[#29335C]"}`}
              >
                Organizar e Otimizar
              </h3>
              <p
                className={`text-sm ${currentTheme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
              >
                Planejadores e ferramentas de organização
              </p>
              <Button
                variant="link"
                className="text-[#FF6B00] p-0 h-auto font-normal flex items-center"
              >
                Explorar <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 border ${currentTheme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h3
                className={`font-medium ${currentTheme === "dark" ? "text-white" : "text-[#29335C]"}`}
              >
                Ferramentas Extras
              </h3>
              <p
                className={`text-sm ${currentTheme === "dark" ? "text-white/60" : "text-[#64748B]"} mb-3`}
              >
                Outras ferramentas especializadas para diversos fins
              </p>
              <Button
                variant="link"
                className="text-[#FF6B00] p-0 h-auto font-normal flex items-center"
              >
                Explorar <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
          Modo Exploração <Compass className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VisaoGeralContent;
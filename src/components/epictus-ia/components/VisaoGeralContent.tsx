import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Brain, 
  Sparkles, 
  MessageSquare, 
  PenTool, 
  Zap, 
  BarChart3, 
  Calendar, 
  Wrench,
  ArrowRight 
} from "lucide-react";

export default function VisaoGeralContent() {
  const { theme } = useTheme();

  const quickAccessTools = [
    {
      id: "assistente-chat",
      title: "Assistente de Chat",
      description: "Converse com a IA para obter ajuda rápida",
      icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500/10",
      section: "chat-inteligente"
    },
    {
      id: "planos-aula",
      title: "Planos de Aula",
      description: "Gere planos de aula personalizados",
      icon: <PenTool className="h-5 w-5 text-emerald-500" />,
      color: "bg-emerald-500/10",
      section: "criar-conteudo"
    },
    {
      id: "resumos",
      title: "Resumos Inteligentes",
      description: "Crie resumos concisos de qualquer conteúdo",
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-500/10",
      section: "aprender-mais-rapido"
    },
    {
      id: "analisar",
      title: "Corretor de Redação",
      description: "Analise e melhore suas redações",
      icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-500/10",
      section: "analisar-corrigir"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Visão Geral do Epictus IA
        </h2>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Acesse rapidamente as ferramentas mais populares ou explore por categoria
        </p>
      </div>

      <div className="mb-6">
        <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center">
                <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Bem-vindo ao Epictus IA
                </h3>
                <Badge className="ml-2 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Premium
                </Badge>
              </div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Uma plataforma completa de inteligência artificial criada para potencializar seus estudos. Explore as diferentes categorias para acessar ferramentas especializadas para cada necessidade.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" className={`text-xs ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                  <MessageSquare className="h-3.5 w-3.5 mr-1 text-blue-500" />
                  Chat Inteligente
                </Button>
                <Button variant="outline" className={`text-xs ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                  <PenTool className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  Criar Conteúdo
                </Button>
                <Button variant="outline" className={`text-xs ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                  <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  Aprender Rápido
                </Button>
                <Button variant="outline" className={`text-xs ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                  <BarChart3 className="h-3.5 w-3.5 mr-1 text-purple-500" />
                  Analisar
                </Button>
                <Button variant="outline" className={`text-xs ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                  <Calendar className="h-3.5 w-3.5 mr-1 text-red-500" />
                  Organizar
                </Button>
                <Button variant="outline" className={`text-xs ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                  <Wrench className="h-3.5 w-3.5 mr-1 text-cyan-500" />
                  Ferramentas
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <h3 className={`text-lg font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        Acesso Rápido
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {quickAccessTools.map(tool => (
          <Card 
            key={tool.id}
            className={`p-4 border hover:shadow-md transition-all cursor-pointer ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-800/80" : "bg-white border-gray-200 hover:bg-gray-50"}`}
          >
            <div className="flex flex-col h-full">
              <div className={`w-10 h-10 rounded-full ${tool.color} flex items-center justify-center mb-3`}>
                {tool.icon}
              </div>
              <h4 className={`text-base font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {tool.title}
              </h4>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-3`}>
                {tool.description}
              </p>
              <Button 
                size="sm"
                variant="ghost" 
                className={`mt-auto text-xs p-2 h-8 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                Acessar
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`p-4 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
          <h4 className={`text-base font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Estatísticas de Uso
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Chat Inteligente
                </span>
                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  65%
                </span>
              </div>
              <div className={`w-full h-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Criar Conteúdo
                </span>
                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  40%
                </span>
              </div>
              <div className={`w-full h-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Aprender Rápido
                </span>
                <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  25%
                </span>
              </div>
              <div className={`w-full h-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className={`p-4 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
          <h4 className={`text-base font-medium mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Recursos Recentes
          </h4>
          <div className="space-y-2">
            <div className={`p-2 rounded-md ${theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-100"} transition-colors cursor-pointer`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Conversou sobre "Revolução Industrial"</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>há 2 horas</p>
                </div>
              </div>
            </div>
            <div className={`p-2 rounded-md ${theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-100"} transition-colors cursor-pointer`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <PenTool className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Criou plano de aula "Ecossistemas"</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>ontem</p>
                </div>
              </div>
            </div>
            <div className={`p-2 rounded-md ${theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-100"} transition-colors cursor-pointer`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Gerou resumo "Equações Diferenciais"</p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>há 3 dias</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, BookOpen, BarChart3, Calendar, Wrench, MessageSquare, Lightbulb, Compass, ArrowRight } from "lucide-react";

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

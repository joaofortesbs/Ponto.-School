
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { 
  BarChart3, 
  FileCheck, 
  Eye, 
  Pen, 
  ListChecks,
  ArrowRight,
  BarChart2
} from "lucide-react";

export default function AnalisarCorrigir() {
  const { theme } = useTheme();

  const analyticTools = [
    {
      id: "corretor-redacao",
      title: "Corretor de Redação",
      description: "Analise sua redação com feedback por competências, correção gramatical e sugestões de melhoria.",
      icon: <Pen className="h-6 w-6 text-white" />,
      badge: "Popular",
      buttonText: "Analisar Redação"
    },
    {
      id: "revisor-textos",
      title: "Revisor de Textos Acadêmicos",
      description: "Verifique formatação ABNT, citações, referências e coesão em trabalhos acadêmicos.",
      icon: <FileCheck className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Revisar Trabalho"
    },
    {
      id: "detector-plágio",
      title: "Detector de Plágio",
      description: "Verifique originalidade de textos com detecção avançada de conteúdo similar.",
      icon: <Eye className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Verificar Plágio"
    },
    {
      id: "analise-desempenho",
      title: "Análise de Desempenho",
      description: "Visualize estatísticas e tendências de suas avaliações, identificando pontos fortes e fracos.",
      icon: <BarChart2 className="h-6 w-6 text-white" />,
      badge: "Beta",
      buttonText: "Ver Análise"
    },
    {
      id: "checklist-preparação",
      title: "Checklist de Preparação",
      description: "Lista personalizada de verificação para provas e trabalhos, com base em seu histórico.",
      icon: <ListChecks className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Gerar Checklist"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Analisar e Corrigir
          </h2>
        </div>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
          Ferramentas para análise, correção e melhoria de trabalhos acadêmicos e desempenho
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticTools.map(tool => (
          <Card 
            key={tool.id}
            className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/90 to-violet-600/90 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                {tool.icon}
              </div>

              {tool.badge && (
                <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white text-xs shadow-sm">
                  {tool.badge}
                </Badge>
              )}
            </div>

            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
              <span className="relative">
                {tool.title}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-violet-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </h3>

            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {tool.description}
            </p>

            <Button 
              className="mt-auto w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white flex items-center justify-center gap-2"
            >
              {tool.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex-1">
        <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} relative group-hover:text-purple-500 transition-colors duration-300`}>
                <span className="relative">
                  Seu progresso nas análises
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 to-violet-600"></span>
                </span>
              </span>
            </div>
            <Badge variant="outline" className={theme === "dark" ? "border-gray-700" : "border-gray-200"}>
              Últimos 30 dias
            </Badge>
          </div>

          <div className="mt-4">
            <div className="space-y-3">
              <div className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} group-hover:text-purple-500 transition-colors duration-300`}>
                    Redações analisadas
                  </span>
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} group-hover:text-purple-500 transition-colors duration-300`}>
                    5/10
                  </span>
                </div>
                <div className={`w-full h-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500" style={{ width: "50%" }}></div>
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} group-hover:text-purple-500 transition-colors duration-300`}>
                    Textos corrigidos
                  </span>
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} group-hover:text-purple-500 transition-colors duration-300`}>
                    8/10
                  </span>
                </div>
                <div className={`w-full h-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500" style={{ width: "80%" }}></div>
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} group-hover:text-purple-500 transition-colors duration-300`}>
                    Análises de desempenho
                  </span>
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} group-hover:text-purple-500 transition-colors duration-300`}>
                    2/10
                  </span>
                </div>
                <div className={`w-full h-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500" style={{ width: "20%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

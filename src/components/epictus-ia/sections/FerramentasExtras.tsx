import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Wrench, 
  Lightbulb, 
  Calculator, 
  FileText, 
  Sparkles, 
  Globe, 
  Share2,
  ArrowRight
} from "lucide-react";

export default function FerramentasExtras() {
  const { theme } = useTheme();

  const tools = [
    {
      id: "calculadora-formulas",
      title: "Calculadora de Fórmulas",
      description: "Calcule resultados de fórmulas complexas com explicações passo a passo",
      icon: <Calculator className="h-6 w-6 text-cyan-500" />,
      badge: null
    },
    {
      id: "extrator-texto",
      title: "Extrator de Texto",
      description: "Extraia texto de imagens, PDFs e arquivos escaneados com reconhecimento OCR",
      icon: <FileText className="h-6 w-6 text-cyan-500" />,
      badge: "Novo"
    },
    {
      id: "gerador-ideias",
      title: "Gerador de Ideias",
      description: "Receba sugestões de ideias inovadoras para projetos escolares e acadêmicos",
      icon: <Lightbulb className="h-6 w-6 text-cyan-500" />,
      badge: null
    },
    {
      id: "tradutor-avancado",
      title: "Tradutor Avançado",
      description: "Traduza textos com contexto acadêmico preservado entre múltiplos idiomas",
      icon: <Globe className="h-6 w-6 text-cyan-500" />,
      badge: null
    },
    {
      id: "visualizador-3d",
      title: "Visualizador 3D",
      description: "Visualize conceitos complexos em modelos tridimensionais interativos",
      icon: <Share2 className="h-6 w-6 text-cyan-500" />,
      badge: "Experimental"
    },
    {
      id: "conversor-unidades",
      title: "Conversor de Unidades",
      description: "Converta facilmente entre diferentes unidades de medida com explicações",
      icon: <Wrench className="h-6 w-6 text-cyan-500" />,
      badge: null
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Ferramentas Extras
        </h2>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Conjunto de ferramentas auxiliares para tornar seu aprendizado ainda mais completo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <Card 
            key={tool.id}
            className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-shadow duration-300`}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                {tool.icon}
              </div>

              {tool.badge && (
                <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs">
                  {tool.badge}
                </Badge>
              )}
            </div>

            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {tool.title}
            </h3>

            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {tool.description}
            </p>

            <Button 
              variant="outline" 
              className={`mt-auto w-full flex items-center justify-center gap-2 ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}
            >
              Abrir ferramenta
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-lg ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"} text-center`}>
        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} flex items-center justify-center gap-2`}>
          <Sparkles className="h-4 w-4 text-cyan-500" />
          Novas ferramentas são adicionadas regularmente à biblioteca
        </p>
      </div>
    </div>
  );
}
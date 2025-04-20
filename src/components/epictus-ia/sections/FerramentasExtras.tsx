
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
      icon: <Calculator className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Calcular"
    },
    {
      id: "extrator-texto",
      title: "Extrator de Texto",
      description: "Extraia texto de imagens, PDFs e arquivos escaneados com reconhecimento OCR",
      icon: <FileText className="h-6 w-6 text-white" />,
      badge: "Novo",
      buttonText: "Extrair Texto"
    },
    {
      id: "gerador-ideias",
      title: "Gerador de Ideias",
      description: "Receba sugestões de ideias inovadoras para projetos escolares e acadêmicos",
      icon: <Lightbulb className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Gerar Ideias"
    },
    {
      id: "tradutor-avancado",
      title: "Tradutor Avançado",
      description: "Traduza textos com contexto acadêmico preservado entre múltiplos idiomas",
      icon: <Globe className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Traduzir"
    },
    {
      id: "visualizador-3d",
      title: "Visualizador 3D",
      description: "Visualize conceitos complexos em modelos tridimensionais interativos",
      icon: <Share2 className="h-6 w-6 text-white" />,
      badge: "Experimental",
      buttonText: "Visualizar"
    },
    {
      id: "conversor-unidades",
      title: "Conversor de Unidades",
      description: "Converta facilmente entre diferentes unidades de medida com explicações",
      icon: <Wrench className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Converter"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Ferramentas Extras
          </h2>
        </div>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
          Conjunto de ferramentas auxiliares para tornar seu aprendizado ainda mais completo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <Card 
            key={tool.id}
            className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/90 to-blue-600/90 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                {tool.icon}
              </div>

              {tool.badge && (
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs shadow-sm">
                  {tool.badge}
                </Badge>
              )}
            </div>

            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
              <span className="relative">
                {tool.title}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </h3>

            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {tool.description}
            </p>

            <Button 
              className="mt-auto w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white flex items-center justify-center gap-2"
            >
              {tool.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex-1">
        <Card className={`p-5 border overflow-hidden relative ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"} group`}>
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
          
          <div className="flex items-center justify-center gap-2 text-center">
            <Sparkles className="h-5 w-5 text-cyan-500" />
            <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
              <span className="relative">
                Sugestão de Ferramentas
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-600"></span>
              </span>
            </h3>
          </div>
          
          <p className={`text-sm mt-4 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Tem uma sugestão de nova ferramenta? Compartilhe conosco e podemos desenvolvê-la para você!
          </p>
          
          <div className="mt-4 flex justify-center">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
              Enviar Sugestão
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import {
  Zap,
  FileText,
  Network,
  FileQuestion,
  Sparkles,
  Undo,
  ArrowRight,
  BookOpen,
  Map,
  ListChecks,
  Repeat,
  FlaskConical,
  Volume2,
  Lightbulb,
  LayoutCards,
  CheckSquare
} from "lucide-react";


export default function AprenderMaisRapido() {
  const { theme } = useTheme();

  const learningTools = [
    {
      id: "resumos-inteligentes",
      title: "Resumos Inteligentes",
      description: "Obtenha resumos concisos e diretos de textos, vídeos, imagens ou PDFs.",
      icon: <FileText className="h-6 w-6 text-amber-500" />,
      badge: null,
      buttonText: "Gerar Resumo"
    },
    {
      id: "mapas-mentais",
      title: "Mapas Mentais",
      description: "Transforme qualquer conteúdo em um mapa mental visual e navegável para facilitar a compreensão.",
      icon: <Network className="h-6 w-6 text-amber-500" />,
      badge: "Popular",
      buttonText: "Criar Mapa"
    },
    {
      id: "simulador-provas",
      title: "Simulador de Provas",
      description: "Faça quizzes e simulados com feedback instantâneo e análise de desempenho.",
      icon: <FileQuestion className="h-6 w-6 text-amber-500" />,
      badge: null,
      buttonText: "Simular Prova"
    },
    {
      id: "estudo-competencia",
      title: "Estudo por Competência (BNCC)",
      description: "Encontre atividades e materiais focados em competências específicas da BNCC.",
      icon: <BookOpen className="h-6 w-6 text-amber-500" />,
      badge: null,
      buttonText: "Estudar"
    },
    {
      id: "revisao-guiada",
      title: "Revisão Guiada",
      description: "Deixe a IA montar uma rota de revisão personalizada com base nos seus erros passados.",
      icon: <Undo className="h-6 w-6 text-amber-500" />,
      badge: "Novo",
      buttonText: "Revisar"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Aprender Mais Rápido
        </h2>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Acelere seu aprendizado com ferramentas que transformam conteúdos complexos em formatos fáceis de entender
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {learningTools.map(tool => (
          <Card
            key={tool.id}
            className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-shadow duration-300`}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                {tool.icon}
              </div>

              {tool.badge && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                  {tool.badge}
                </Badge>
              )}
            </div>

            <h3 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {tool.icon}
              <span>{tool.title}</span>
            </h3>

            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {tool.description}
            </p>

            <Button
              className="mt-auto w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white flex items-center justify-center gap-2"
            >
              {tool.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex-1">
        <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Método de Aprendizado Acelerado
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Combine as ferramentas desta seção em um fluxo de estudo otimizado: resumo do conteúdo → criação de mapa mental → teste de simulado → revisão guiada. Esta sequência aproveita técnicas comprovadas de aprendizado eficiente.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" className={`${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                  Ver detalhes
                </Button>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                  Ativar método <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
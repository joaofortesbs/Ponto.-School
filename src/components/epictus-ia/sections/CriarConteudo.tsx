
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { 
  PenTool, 
  FileSpreadsheet, 
  Presentation, 
  FileQuestion, 
  Gamepad2, 
  UsersRound, 
  Sparkles,
  ArrowRight,
  Crown
} from "lucide-react";

export default function CriarConteudo() {
  const { theme } = useTheme();

  const toolsForTeachers = [
    {
      id: "planos-aula",
      title: "Gerador de Planos de Aula",
      description: "Crie planos de aula completos em minutos, baseados no tema, ano escolar e BNCC.",
      icon: <PenTool className="h-6 w-6 text-emerald-500" />,
      badge: null,
      buttonText: "Gerar Plano"
    },
    {
      id: "slides-didaticos",
      title: "Gerador de Slides Didáticos",
      description: "Transforme seus tópicos em apresentações de slides visualmente atraentes e organizadas.",
      icon: <Presentation className="h-6 w-6 text-emerald-500" />,
      badge: "Novo",
      buttonText: "Criar Slides"
    },
    {
      id: "lista-exercicios",
      title: "Gerador de Lista de Exercícios",
      description: "Crie listas de exercícios personalizadas (alternativas, dissertativas, V/F) com gabarito.",
      icon: <FileQuestion className="h-6 w-6 text-emerald-500" />,
      badge: null,
      buttonText: "Gerar Exercícios"
    },
    {
      id: "jogos-didaticos",
      title: "Gerador de Jogos Didáticos",
      description: "Crie caça-palavras, forcas e outros jogos interativos baseados no seu conteúdo.",
      icon: <Gamepad2 className="h-6 w-6 text-emerald-500" />,
      badge: null,
      buttonText: "Criar Jogo"
    },
    {
      id: "atividades-interdisciplinares",
      title: "Gerador de Atividades Interdisciplinares",
      description: "Desenvolva propostas de atividades que conectam duas ou mais disciplinas.",
      icon: <UsersRound className="h-6 w-6 text-emerald-500" />,
      badge: null,
      buttonText: "Gerar Atividade"
    }
  ];

  const toolsForStudents = [
    {
      id: "assistente-apresentacao",
      title: "Assistente de Apresentação",
      description: "Estruture sua apresentação oral, receba sugestões de tópicos e visualize como apresentar.",
      icon: <Presentation className="h-6 w-6 text-emerald-500" />,
      badge: null,
      buttonText: "Criar Apresentação"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Criar Conteúdo
        </h2>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Ferramentas para professores e alunos criarem conteúdo educacional de forma rápida e eficiente
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Para Professores
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolsForTeachers.map(tool => (
            <Card 
              key={tool.id}
              className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-shadow duration-300`}
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  {tool.icon}
                </div>

                {tool.badge && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
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
                className="mt-auto w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center justify-center gap-2"
              >
                {tool.buttonText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
            <FileSpreadsheet className="h-5 w-5 text-white" />
          </div>
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Para Alunos
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolsForStudents.map(tool => (
            <Card 
              key={tool.id}
              className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-md transition-shadow duration-300`}
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  {tool.icon}
                </div>

                {tool.badge && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
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
                className="mt-auto w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex items-center justify-center gap-2"
              >
                {tool.buttonText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className={`mt-auto p-4 rounded-lg ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"} text-center`}>
        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} flex items-center justify-center gap-2`}>
          <Sparkles className="h-4 w-4 text-emerald-500" />
          Todo conteúdo gerado segue diretrizes pedagógicas e é 100% personalizável
        </p>
      </div>
    </div>
  );
}

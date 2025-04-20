import React from "react";
import { 
  PenTool, 
  FileSpreadsheet, 
  Presentation, 
  FileQuestion, 
  Gamepad2, 
  UsersRound, 
  Sparkles,
  Crown
} from "lucide-react";

import {
  SectionHeader,
  CategoryHeader,
  ToolsGrid
} from "./components/criar-conteudo";
import { ToolCardProps } from "./components/criar-conteudo/ToolCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowRight } from "lucide-react";


export default function CriarConteudo() {
  const { theme } = useTheme();

  const toolsForTeachers: ToolCardProps[] = [
    {
      id: "plano-aula",
      title: "Plano de Aula",
      description: "Crie planos de aula detalhados com objetivos, metodologia e avaliação em minutos.",
      icon: <FileSpreadsheet className="h-6 w-6 text-white" />,
      badge: "Popular",
      buttonText: "Criar Plano de Aula"
    },
    {
      id: "gerador-slides",
      title: "Gerador de Slides",
      description: "Transforme qualquer conteúdo em apresentações profissionais com slides formatados.",
      icon: <Presentation className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Criar Slides"
    },
    {
      id: "gerador-questoes",
      title: "Gerador de Questões",
      description: "Crie questões de múltipla escolha, dissertativas ou V/F com gabarito.",
      icon: <FileQuestion className="h-6 w-6 text-white" />,
      badge: "Novo",
      buttonText: "Criar Questões"
    },
    {
      id: "gamificacao",
      title: "Gamificação",
      description: "Transforme conteúdos em atividades gamificadas para maior engajamento dos alunos.",
      icon: <Gamepad2 className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Gamificar Conteúdo"
    },
    {
      id: "dinâmicas-grupo",
      title: "Dinâmicas de Grupo",
      description: "Gere ideias para trabalhos em grupo, debates e atividades colaborativas.",
      icon: <UsersRound className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Criar Dinâmica"
    },
    {
      id: "simplificador-conteudo",
      title: "Simplificador de Conteúdo",
      description: "Transforme textos complexos em explicações mais acessíveis para seus alunos.",
      icon: <Sparkles className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Simplificar Conteúdo"
    }
  ];

  const toolsForStudents: ToolCardProps[] = [
    {
      id: "assistente-apresentacao",
      title: "Assistente de Apresentação",
      description: "Estruture sua apresentação oral, receba sugestões de tópicos e visualize como apresentar.",
      icon: <Presentation className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Criar Apresentação"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="mb-6">
        <CategoryHeader 
          icon={<Crown className="h-5 w-5 text-white" />}
          title="Para Professores"
        />
        <ToolsGrid tools={toolsForTeachers} />
      </div>

      <div>
        <CategoryHeader 
          icon={<UsersRound className="h-5 w-5 text-white" />}
          title="Para Alunos"
        />
        <ToolsGrid tools={toolsForStudents} />
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
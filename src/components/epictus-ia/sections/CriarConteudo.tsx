
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  PenTool, 
  Presentation, 
  FileSpreadsheet, 
  Gamepad2, 
  Combine, 
  PenLine,
  Sparkles,
  Crown,
} from "lucide-react";
import { 
  SectionHeader, 
  CategoryHeader, 
  ToolCard, 
  ToolsGrid 
} from "./components/criar-conteudo";

export default function CriarConteudo() {
  const { theme } = useTheme();

  // Ferramentas para professores
  const teacherTools = [
    {
      id: "planos-aula",
      title: "Gerador de Planos de Aula",
      description: "Crie planos de aula completos em minutos, baseados no tema, ano escolar e BNCC.",
      icon: <PenTool className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Gerar Plano"
    },
    {
      id: "slides-didaticos",
      title: "Gerador de Slides Didáticos",
      description: "Transforme seus tópicos em apresentações de slides visualmente atraentes e organizadas.",
      icon: <Presentation className="h-6 w-6 text-white" />,
      badge: "Novo",
      buttonText: "Criar Slides"
    },
    {
      id: "lista-exercicios",
      title: "Gerador de Lista de Exercícios",
      description: "Crie listas de exercícios personalizadas com diferentes níveis de dificuldade.",
      icon: <FileSpreadsheet className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Gerar Lista"
    },
    {
      id: "jogos-didaticos",
      title: "Gerador de Jogos Didáticos",
      description: "Desenvolva jogos educativos que tornam o aprendizado divertido e interativo.",
      icon: <Gamepad2 className="h-6 w-6 text-white" />,
      badge: "Popular",
      buttonText: "Criar Jogo"
    },
    {
      id: "interdisciplinares",
      title: "Gerador de Atividades Interdisciplinares",
      description: "Crie atividades que integram múltiplas disciplinas em um só projeto.",
      icon: <Combine className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Gerar Atividade"
    }
  ];

  // Ferramentas para alunos
  const studentTools = [
    {
      id: "assistente-apresentacao",
      title: "Assistente de Apresentação",
      description: "Ajuda a estruturar e criar apresentações impactantes para trabalhos escolares.",
      icon: <PenLine className="h-6 w-6 text-white" />,
      badge: "Exclusivo",
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

        <ToolsGrid tools={teacherTools} />
      </div>

      <div className="mb-6">
        <CategoryHeader 
          icon={<FileSpreadsheet className="h-5 w-5 text-white" />}
          title="Para Alunos"
        />

        <ToolsGrid tools={studentTools} />
      </div>
    </div>
  );
}


import React from "react";
import { useTheme } from "@/components/ThemeProvider";
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
  ToolsGrid,
  PlanoAulaCard,
  SlidesDidaticosCard,
  ListaExerciciosCard,
  JogosDidaticosCard,
  AtividadesInterdisciplinaresCard,
  AssistenteApresentacaoCard
} from "./components/criar-conteudo";

export default function CriarConteudo() {
  const { theme } = useTheme();

  const toolsForTeachers = [
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
      description: "Crie listas de exercícios personalizadas (alternativas, dissertativas, V/F) com gabarito.",
      icon: <FileQuestion className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Gerar Exercícios"
    },
    {
      id: "jogos-didaticos",
      title: "Gerador de Jogos Didáticos",
      description: "Crie caça-palavras, forcas e outros jogos interativos baseados no seu conteúdo.",
      icon: <Gamepad2 className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Criar Jogo"
    },
    {
      id: "atividades-interdisciplinares",
      title: "Gerador de Atividades Interdisciplinares",
      description: "Desenvolva propostas de atividades que conectam duas ou mais disciplinas.",
      icon: <UsersRound className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Gerar Atividade"
    }
  ];

  const toolsForStudents = [
    {
      id: "assistente-apresentacao",
      title: "Assistente de Apresentação",
      description: "Estruture sua apresentação oral, receba sugestões de tópicos e visualize como apresentar.",
      icon: <Presentation className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Criar Apresentação"
    }
  ];

  const renderTeacherTools = () => (
    <>
      {toolsForTeachers.map((tool) => {
        switch (tool.id) {
          case "planos-aula":
            return <PlanoAulaCard key={tool.id} tool={tool} />;
          case "slides-didaticos":
            return <SlidesDidaticosCard key={tool.id} tool={tool} />;
          case "lista-exercicios":
            return <ListaExerciciosCard key={tool.id} tool={tool} />;
          case "jogos-didaticos":
            return <JogosDidaticosCard key={tool.id} tool={tool} />;
          case "atividades-interdisciplinares":
            return <AtividadesInterdisciplinaresCard key={tool.id} tool={tool} />;
          default:
            return null;
        }
      })}
    </>
  );

  const renderStudentTools = () => (
    <>
      {toolsForStudents.map((tool) => {
        if (tool.id === "assistente-apresentacao") {
          return <AssistenteApresentacaoCard key={tool.id} tool={tool} />;
        }
        return null;
      })}
    </>
  );

  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="mb-6">
        <CategoryHeader 
          icon={<Crown className="h-5 w-5 text-white" />}
          title="Para Professores"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderTeacherTools()}
        </div>
      </div>

      <div className="mb-6">
        <CategoryHeader 
          icon={<FileSpreadsheet className="h-5 w-5 text-white" />}
          title="Para Alunos"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderStudentTools()}
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

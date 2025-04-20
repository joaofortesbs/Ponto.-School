import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  FileText, 
  Network, 
  FileQuestion, 
  BookOpen, 
  Undo,
  Zap
} from "lucide-react";
import { 
  SectionHeader, 
  LearningToolCard, 
  MethodCard 
} from "./components/aprender-mais-rapido";

const learningTools = [
  {
    id: "resumos-inteligentes",
    title: "Resumos Inteligentes",
    description: "Obtenha resumos concisos e diretos de textos, vídeos, imagens ou PDFs.",
    icon: <FileText className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Resumo"
  },
  {
    id: "mapas-mentais",
    title: "Mapas Mentais",
    description: "Transforme qualquer conteúdo em um mapa mental visual e navegável para facilitar a compreensão.",
    icon: <Network className="h-6 w-6 text-white" />,
    badge: "Popular",
    buttonText: "Criar Mapa"
  },
  {
    id: "simulador-provas",
    title: "Simulador de Provas",
    description: "Faça quizzes e simulados com feedback instantâneo e análise de desempenho.",
    icon: <FileQuestion className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Simular Prova"
  },
  {
    id: "estudo-competencia",
    title: "Estudo por Competência (BNCC)",
    description: "Encontre atividades e materiais focados em competências específicas da BNCC.",
    icon: <BookOpen className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Estudar"
  },
  {
    id: "revisao-guiada",
    title: "Revisão Guiada",
    description: "Deixe a IA montar uma rota de revisão personalizada com base nos seus erros passados.",
    icon: <Undo className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Revisar"
  }
];

export default function AprenderMaisRapido() {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {learningTools.map(tool => (
          <LearningToolCard 
            key={tool.id}
            id={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            badge={tool.badge}
            buttonText={tool.buttonText}
          />
        ))}
      </div>

      <MethodCard />
    </div>
  );
}
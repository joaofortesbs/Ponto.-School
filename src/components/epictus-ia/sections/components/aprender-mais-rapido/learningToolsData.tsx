
import React from "react";
import { 
  FileText, 
  Network, 
  FileQuestion, 
  BookOpen,
  Undo
} from "lucide-react";

export type LearningTool = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string | null;
  buttonText: string;
}

export const learningTools: LearningTool[] = [
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

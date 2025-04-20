
import React from "react";
import { 
  Pen, 
  FileCheck, 
  Eye, 
  BarChart2, 
  ListChecks 
} from "lucide-react";

export type AnalyticTool = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string | null;
  buttonText: string;
}

export const analyticTools: AnalyticTool[] = [
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


import React from "react";
import { FileText } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import LearningToolCard from "./LearningToolCard";

const ResumosInteligentesCard = () => {
  const tool = {
    id: "resumos-inteligentes",
    title: "Resumos Inteligentes",
    description: "Obtenha resumos concisos e diretos de textos, vídeos, imagens ou PDFs.",
    icon: <FileText className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Gerar Resumo"
  };

  return <LearningToolCard {...tool} />;
};

export default ResumosInteligentesCard;

import React from "react";
import { FileText } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const ExtratorTextoCard = () => {
  const tool = {
    id: "extrator-texto",
    title: "Extrator de Texto",
    description: "Extraia automaticamente texto de PDFs, imagens e documentos escaneados com alta precisão.",
    icon: <FileText className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Extrair"
  };

  return <ToolCard tool={tool} />;
};

export default ExtratorTextoCard;
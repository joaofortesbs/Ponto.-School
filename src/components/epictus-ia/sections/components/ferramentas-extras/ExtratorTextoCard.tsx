
import React from "react";
import { FileText } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const ExtratorTextoCard = () => {
  const tool = {
    id: "extrator-texto",
    title: "Extrator de Texto",
    description: "Extraia texto de imagens, PDFs e arquivos escaneados com reconhecimento OCR",
    icon: <FileText className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Extrair Texto"
  };

  return <ToolCard tool={tool} />;
};

export default ExtratorTextoCard;

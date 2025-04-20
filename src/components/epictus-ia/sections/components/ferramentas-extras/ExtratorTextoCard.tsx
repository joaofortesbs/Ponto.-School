import React from "react";
import { FileText } from "lucide-react";
import { ToolCard } from ".";
import { useTheme } from "@/components/ThemeProvider";

const ExtratorTextoCard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ToolCard
      title="Extrator de Texto"
      description="Extraia texto de imagens, PDFs e outros documentos para facilitar seus estudos"
      icon={<FileText className="h-6 w-6 text-white" />}
      buttonText="Extrair conteúdo"
      onClick={() => console.log("Extrator de Texto clicked")}
    />
  );
};

export default ExtratorTextoCard;
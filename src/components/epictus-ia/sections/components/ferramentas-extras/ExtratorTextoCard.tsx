
import React from "react";
import { FileText } from "lucide-react";
import ToolCard from "./ToolCard";

export default function ExtratorTextoCard() {
  return (
    <ToolCard
      title="Extrator de Texto"
      description="Extraia texto de imagens, PDFs e outros documentos para facilitar seus estudos"
      icon={<FileText className="h-6 w-6 text-white" />}
      buttonText="Extrair conteúdo"
    />
  );
}

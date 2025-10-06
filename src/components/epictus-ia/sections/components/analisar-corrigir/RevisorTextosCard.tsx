import React from "react";
import { FileCheck } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import AnalyticToolCard from "./AnalyticToolCard";

const RevisorTextosCard = () => {
  const tool = {
    id: "revisor-textos",
    title: "Revisor de Textos Acadêmicos",
    description: "Verifique formatação ABNT, citações, referências e coesão em trabalhos acadêmicos.",
    icon: <FileCheck className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Revisar Trabalho"
  };

  return <AnalyticToolCard {...tool} />;
};

export default RevisorTextosCard;
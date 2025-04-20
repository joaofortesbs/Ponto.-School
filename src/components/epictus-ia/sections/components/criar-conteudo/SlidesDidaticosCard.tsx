
import React from "react";
import { Presentation } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ToolCard from "./ToolCard";

const SlidesDidaticosCard = () => {
  const { theme } = useTheme();

  const tool = {
    id: "slides-didaticos",
    title: "Gerador de Slides Didáticos",
    description: "Transforme seus tópicos em apresentações de slides visualmente atraentes e organizadas.",
    icon: <Presentation className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Criar Slides"
  };

  return <ToolCard tool={tool} />;
};

export default SlidesDidaticosCard;

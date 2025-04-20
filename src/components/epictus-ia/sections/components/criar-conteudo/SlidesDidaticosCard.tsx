
import React from "react";
import { PresentationScreen } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ToolCard } from ".";

const SlidesDidaticosCard = () => {
  const { theme } = useTheme();
  
  return (
    <ToolCard
      title="Gerador de Slides Didáticos"
      description="Crie apresentações didáticas com conteúdo formatado e design profissional"
      icon={<PresentationScreen className="h-6 w-6 text-white" />}
      iconBgColor="bg-emerald-500"
      href="/epictus-ia/slides-didaticos"
    />
  );
};

export default SlidesDidaticosCard;

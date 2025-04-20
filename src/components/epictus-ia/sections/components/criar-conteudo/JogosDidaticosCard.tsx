
import React from "react";
import { Gamepad2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ToolCard } from ".";

const JogosDidaticosCard = () => {
  const { theme } = useTheme();
  
  return (
    <ToolCard
      title="Gerador de Jogos Didáticos"
      description="Crie jogos educativos para engajar os alunos e tornar o aprendizado divertido"
      icon={<Gamepad2 className="h-6 w-6 text-white" />}
      iconBgColor="bg-emerald-500"
      href="/epictus-ia/jogos-didaticos"
    />
  );
};

export default JogosDidaticosCard;

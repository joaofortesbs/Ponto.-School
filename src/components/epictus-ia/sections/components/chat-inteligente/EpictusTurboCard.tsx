
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";

export const EpictusTurboCard: React.FC = () => {
  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Usar Turbo",
    highlight: true
  };

  return <ChatCard assistant={assistantData} />;
};

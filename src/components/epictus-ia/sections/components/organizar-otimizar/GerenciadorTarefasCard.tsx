
import React from "react";
import { ListTodo } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import OrganizationToolCard from "./OrganizationToolCard";

const GerenciadorTarefasCard = () => {
  const tool = {
    id: "gerenciador-tarefas",
    title: "Gerenciador de Tarefas Acadêmicas",
    description: "Organize provas, trabalhos e leituras com priorização automática baseada em prazos.",
    icon: <ListTodo className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Organizar Tarefas"
  };

  return <OrganizationToolCard tool={tool} />;
};

export default GerenciadorTarefasCard;

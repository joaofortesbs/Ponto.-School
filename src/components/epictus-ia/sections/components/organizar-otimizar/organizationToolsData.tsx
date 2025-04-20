
import React from "react";
import { 
  Calendar, 
  Clock, 
  ListTodo, 
  LineChart, 
  Hammer
} from "lucide-react";
import { OrganizationTool } from "./OrganizationToolCard";

export const organizationTools: OrganizationTool[] = [
  {
    id: "cronograma-estudos",
    title: "Cronograma de Estudos",
    description: "Crie um planejamento personalizado com base em sua rotina, prioridades e metas de aprendizado.",
    icon: <Calendar className="h-6 w-6 text-white" />,
    badge: "Popular",
    buttonText: "Planejar"
  },
  {
    id: "tecnica-pomodoro",
    title: "Timer Pomodoro Inteligente",
    description: "Otimize seu tempo de estudo com ciclos de foco e descanso ajustados ao seu perfil cognitivo.",
    icon: <Clock className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Iniciar Timer"
  },
  {
    id: "gerenciador-tarefas",
    title: "Gerenciador de Tarefas Acadêmicas",
    description: "Organize provas, trabalhos e leituras com priorização automática baseada em prazos.",
    icon: <ListTodo className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Organizar Tarefas"
  },
  {
    id: "rastreador-progresso",
    title: "Rastreador de Progresso",
    description: "Visualize e acompanhe seu avanço em matérias, habilidades e projetos ao longo do tempo.",
    icon: <LineChart className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Monitorar Progresso"
  },
  {
    id: "construtor-habitos",
    title: "Construtor de Hábitos de Estudo",
    description: "Desenvolva rotinas consistentes de estudo com estratégias comprovadas de formação de hábitos.",
    icon: <Hammer className="h-6 w-6 text-white" />,
    badge: "Novo",
    buttonText: "Criar Hábito"
  }
];

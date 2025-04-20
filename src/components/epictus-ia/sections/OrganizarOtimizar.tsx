import React from "react";
import { 
  Calendar, 
  Clock, 
  ListChecks, 
  LayoutGrid,
  Zap,
  Sparkles 
} from "lucide-react";

import SectionHeader from "./components/common/SectionHeader";
import FeatureCard from "./components/common/FeatureCard";
import InfoCard from "./components/common/InfoCard";

export default function OrganizarOtimizar() {
  const tools = [
    {
      id: "plano-estudos",
      title: "Plano de Estudos Personalizado",
      description: "Crie um cronograma de estudos adaptado às suas necessidades, com distribuição de temas e tempos ideais.",
      icon: <Calendar className="h-6 w-6 text-white" />,
      badge: "Popular",
      buttonText: "Criar Plano",
      highlight: true
    },
    {
      id: "pomodoro-inteligente",
      title: "Pomodoro Inteligente",
      description: "Otimize sua concentração com ciclos de estudo e descanso personalizados baseados no seu perfil de aprendizagem.",
      icon: <Clock className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Iniciar Pomodoro",
      highlight: false
    },
    {
      id: "gerenciador-tarefas",
      title: "Gerenciador de Tarefas",
      description: "Organize suas atividades acadêmicas com priorização inteligente e lembretes adaptativos.",
      icon: <ListChecks className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Organizar Tarefas",
      highlight: false
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        icon={<LayoutGrid className="h-6 w-6 text-white" />}
        title="Organizar e Otimizar"
        description="Ferramentas de IA para maximizar sua produtividade nos estudos"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <FeatureCard key={tool.id} feature={tool} />
        ))}
      </div>

      <div className="mt-6 flex-1">
        <InfoCard 
          icon={<Zap className="h-6 w-6 text-white" />}
          title="Novidade: Sugestões Adaptativas"
          description="Nossa IA agora analisa seu padrão de estudo e sugere ajustes em tempo real para maximizar sua produtividade com base nos seus melhores momentos."
          secondaryButtonText="Saiba mais"
          primaryButtonText="Experimentar"
          primaryButtonIcon={<Sparkles className="h-4 w-4 ml-2" />}
        />
      </div>
    </div>
  );
}
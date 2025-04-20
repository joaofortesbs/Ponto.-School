import React from "react";
import { 
  PuzzlePiece, 
  Languages, 
  Calculator,
  Tool,
  Award,
  Sparkles 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowRight } from "lucide-react";

import SectionHeader from "./components/common/SectionHeader";
import FeatureCard from "./components/common/FeatureCard";
import InfoCard from "./components/common/InfoCard";

export default function FerramentasExtras() {
  const { theme } = useTheme();

  const tools = [
    {
      id: "jogos-educativos",
      title: "Jogos Educativos",
      description: "Aprenda de forma divertida com jogos personalizados que reforçam conceitos importantes do seu material de estudo.",
      icon: <PuzzlePiece className="h-6 w-6 text-white" />,
      badge: "Novo",
      buttonText: "Jogar e Aprender",
      highlight: true
    },
    {
      id: "tradutor-avancado",
      title: "Tradutor Avançado",
      description: "Traduza textos acadêmicos mantendo terminologias técnicas e contexto específico da sua área de estudo.",
      icon: <Languages className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Traduzir",
      highlight: false
    },
    {
      id: "resolucao-problemas",
      title: "Resolução de Problemas",
      description: "Receba ajuda passo-a-passo para resolver problemas matemáticos, físicos, químicos e de outras disciplinas exatas.",
      icon: <Calculator className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Resolver Problema",
      highlight: false
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        icon={<Tool className="h-6 w-6 text-white" />}
        title="Ferramentas Extras"
        description="Recursos adicionais para complementar seus estudos"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <FeatureCard key={tool.id} feature={tool} />
        ))}
      </div>

      <div className="mt-6 flex-1">
        <InfoCard 
          icon={<Award className="h-6 w-6 text-white" />}
          title="Novidade: Sistema de Conquistas"
          description="Desbloqueie conquistas e ganhe reconhecimento conforme utiliza nossas ferramentas e atinge seus objetivos de estudo."
          secondaryButtonText="Ver Conquistas"
          primaryButtonText="Começar Agora"
          primaryButtonIcon={<Sparkles className="h-4 w-4 ml-2" />}
        />
      </div>
    </div>
  );
}
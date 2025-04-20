import React from "react";
import { 
  CheckCircle, 
  Search, 
  Target, 
  BarChart2,
  Lightbulb,
  Sparkles 
} from "lucide-react";

import SectionHeader from "./components/common/SectionHeader";
import FeatureCard from "./components/common/FeatureCard";
import InfoCard from "./components/common/InfoCard";

export default function AnalisarCorrigir() {
  const tools = [
    {
      id: "corretor-redacao",
      title: "Corretor de Redação",
      description: "Receba análises detalhadas e correções para suas redações, com sugestões de melhoria em cada competência.",
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      badge: "Recomendado",
      buttonText: "Corrigir Redação",
      highlight: true
    },
    {
      id: "revisor-textos",
      title: "Revisor de Textos",
      description: "Analise e corrija gramática, ortografia, coesão e coerência em qualquer texto acadêmico.",
      icon: <Search className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Revisar Texto",
      highlight: false
    },
    {
      id: "analisador-questoes",
      title: "Analisador de Questões",
      description: "Entenda onde você errou em exercícios e provas, com explicações detalhadas e dicas para não cometer os mesmos erros.",
      icon: <Target className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Analisar Questões",
      highlight: false
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        icon={<BarChart2 className="h-6 w-6 text-white" />}
        title="Analisar e Corrigir"
        description="Ferramentas de IA para revisar e aprimorar seu desempenho"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <FeatureCard key={tool.id} feature={tool} />
        ))}
      </div>

      <div className="mt-6 flex-1">
        <InfoCard 
          icon={<Lightbulb className="h-6 w-6 text-white" />}
          title="Novidade: Análise Comparativa de Desempenho"
          description="Compare seu desempenho com médias anteriores e receba insights personalizados para melhorar seus resultados ao longo do tempo."
          secondaryButtonText="Saiba mais"
          primaryButtonText="Experimentar"
          primaryButtonIcon={<Sparkles className="h-4 w-4 ml-2" />}
        />
      </div>
    </div>
  );
}
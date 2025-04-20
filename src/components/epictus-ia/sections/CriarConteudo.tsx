import React from "react";
import { 
  Pencil, 
  FileText, 
  Presentation, 
  PenTool,
  Star,
  Sparkles 
} from "lucide-react";

import SectionHeader from "./components/common/SectionHeader";
import FeatureCard from "./components/common/FeatureCard";
import InfoCard from "./components/common/InfoCard";

export default function CriarConteudo() {
  const tools = [
    {
      id: "gerador-textos",
      title: "Gerador de Textos",
      description: "Crie redações, resumos, artigos e conteúdos diversos com ajuda da IA, seguindo sua orientação e estilo.",
      icon: <Pencil className="h-6 w-6 text-white" />,
      badge: "Popular",
      buttonText: "Criar Texto",
      highlight: true
    },
    {
      id: "resumo-automatico",
      title: "Resumo Automático",
      description: "Transforme textos longos em resumos concisos com os pontos principais, mantendo a essência do conteúdo.",
      icon: <FileText className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Resumir",
      highlight: false
    },
    {
      id: "criador-slides",
      title: "Criador de Slides",
      description: "Gere apresentações completas a partir de um tema ou texto, com estrutura e pontos-chave organizados.",
      icon: <Presentation className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Criar Slides",
      highlight: false
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        icon={<PenTool className="h-6 w-6 text-white" />}
        title="Criar Conteúdo"
        description="Ferramentas de IA para gerar e aprimorar seu material de estudo"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <FeatureCard key={tool.id} feature={tool} />
        ))}
      </div>

      <div className="mt-6 flex-1">
        <InfoCard 
          icon={<Star className="h-6 w-6 text-white" />}
          title="Novidade: Editor Avançado com Sugestões"
          description="Experimente nosso novo editor inteligente que sugere melhorias e alternativas enquanto você escreve, aprimorando seu texto em tempo real."
          secondaryButtonText="Saiba mais"
          primaryButtonText="Experimentar"
          primaryButtonIcon={<Sparkles className="h-4 w-4 ml-2" />}
        />
      </div>
    </div>
  );
}
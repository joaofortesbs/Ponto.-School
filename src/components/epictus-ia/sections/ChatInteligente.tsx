import React from "react";
import { 
  MessageSquare, 
  Book, 
  Lightbulb,
  Brain,
  Sparkles
} from "lucide-react";

import SectionHeader from "./components/common/SectionHeader";
import FeatureCard from "./components/common/FeatureCard";
import InfoCard from "./components/common/InfoCard";

export default function ChatInteligente() {
  const assistants = [
    {
      id: "assistente-pessoal",
      title: "Chat com Epictus IA",
      description: "Tire dúvidas rápidas, peça sugestões, receba ajuda personalizada e execute ações rápidas com comandos de voz ou texto.",
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      badge: "Popular",
      buttonText: "Conversar",
      highlight: true
    },
    {
      id: "tutor-inteligente",
      title: "Tutor Inteligente",
      description: "Receba explicações detalhadas sobre qualquer assunto acadêmico, com exemplos e diferentes níveis de profundidade.",
      icon: <Book className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Aprender",
      highlight: false
    },
    {
      id: "brainstorm",
      title: "Tempestade de Ideias (Brainstorm)",
      description: "Gere ideias criativas, explore conceitos e estruture seus projetos com a ajuda da IA.",
      icon: <Lightbulb className="h-6 w-6 text-white" />,
      badge: null,
      buttonText: "Criar",
      highlight: false
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <SectionHeader 
        icon={<MessageSquare className="h-6 w-6 text-white" />}
        title="Chat Inteligente"
        description="Escolha o assistente ideal para suas necessidades de aprendizado"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assistants.map((assistant) => (
          <FeatureCard key={assistant.id} feature={assistant} />
        ))}
      </div>

      <div className="mt-6 flex-1">
        <InfoCard 
          icon={<Brain className="h-6 w-6 text-white" />}
          title="Novidade: Assistente com Memória Avançada"
          description="Agora nossos assistentes aprendem com suas interações anteriores, lembrando de suas preferências e adaptando respostas de acordo com seu histórico de conversas."
          secondaryButtonText="Saiba mais"
          primaryButtonText="Experimentar"
          primaryButtonIcon={<Sparkles className="h-4 w-4 ml-2" />}
        />
      </div>
    </div>
  );
}
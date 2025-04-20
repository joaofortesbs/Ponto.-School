import React from "react";
import { MessageSquare, Book, Lightbulb } from "lucide-react";
import AssistantCard from "./components/chat-inteligente/AssistantCard";
import MemoryFeatureCard from "./components/chat-inteligente/MemoryFeatureCard";
import SectionHeader from "./components/chat-inteligente/SectionHeader";

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
      <SectionHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assistants.map((assistant) => (
          <AssistantCard 
            key={assistant.id}
            id={assistant.id}
            title={assistant.title}
            description={assistant.description}
            icon={assistant.icon}
            badge={assistant.badge}
            buttonText={assistant.buttonText}
            highlight={assistant.highlight}
          />
        ))}
      </div>

      <div className="mt-6 flex-1">
        <MemoryFeatureCard />
      </div>
    </div>
  );
}
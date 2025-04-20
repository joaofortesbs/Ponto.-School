import React from "react";
import { Card } from "@/components/ui/card";

interface AssistantCardProps {
  title?: string;
  description?: string;
  className?: string;
}

const AssistantCard: React.FC<AssistantCardProps> = ({
  title = "Chat com Epictus IA",
  description = "Tire dúvidas rápidas, peça sugestões, receba ajuda personalizada e execute ações rápidas com comandos de voz ou texto.",
  className = "",
}) => {
  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 border-none shadow-lg ${className} epictus-chat-card glowing-card`}>
      <div className="absolute inset-0 chat-card-glow-effect"></div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-sm text-gray-200 mb-4">{description}</p>
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center">
          <span>Conversar</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14 5l7 7m0 0l-7 7m7-7H3" 
            />
          </svg>
        </button>
      </div>
    </Card>
  );
};

export default AssistantCard;
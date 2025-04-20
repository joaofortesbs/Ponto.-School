
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { MessageSquare, Book, Lightbulb, ArrowRight } from "lucide-react";

interface AssistantCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string | null;
  buttonText: string;
  highlight: boolean;
}

export default function AssistantCard({ 
  id, 
  title, 
  description, 
  icon, 
  badge, 
  buttonText, 
  highlight 
}: AssistantCardProps) {
  const { theme } = useTheme();

  return (
    <Card 
      key={id}
      className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] ${highlight ? "glow-effect" : ""}`}
      onMouseMove={(e) => {
        if (highlight) {
          // Capturar a posição do mouse em relação ao card
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 100;
          const y = (e.clientY - rect.top) / rect.height * 100;
          
          // Atualizar variáveis CSS para o efeito de luz interativo
          card.style.setProperty('--x', `${x}%`);
          card.style.setProperty('--y', `${y}%`);
        }
      }}
    >
      {highlight && (
        <>
          <div className="absolute inset-0 z-0 animate-pulse-slow rounded-lg border-2 border-blue-500/50 shadow-[0_0_15px_5px_rgba(59,130,246,0.3)]"></div>
          {/* Partículas brilhantes */}
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </>
      )}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/90 to-indigo-600/90 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {badge && (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs shadow-sm">
            {badge}
          </Badge>
        )}
      </div>

      <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
        <span className="relative">
          {title}
          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
        </span>
      </h3>

      <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {description}
      </p>

      <Button 
        className="mt-auto w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex items-center justify-center gap-2"
      >
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}

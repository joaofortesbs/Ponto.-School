import React from "react";

// Definir o tipo de evento como união de strings literais
export type EventType = 
  | "meeting" 
  | "deadline" 
  | "class" 
  | "exam" 
  | "challenge" 
  | "reminder"
  | "homework"
  | "project";

interface EventTypeIconProps {
  type: EventType;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

// Componente que renderiza o ícone apropriado com base no tipo do evento
export const EventTypeIcon: React.FC<EventTypeIconProps> = ({ 
  type, 
  className = "", 
  size = "md",
  color
}) => {
  // Implementação do componente aqui
  return (
    <div className={`event-icon event-icon-${type} ${className}`}>
      {/* Conteúdo do ícone */}
    </div>
  );
};

export default EventTypeIcon;

import React from "react";
import ToolCard from "./ToolCard";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string | null;
  buttonText: string;
}

interface ToolsGridProps {
  tools: Tool[];
}

const ToolsGrid: React.FC<ToolsGridProps> = ({ tools }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map(tool => (
        <ToolCard 
          key={tool.id}
          id={tool.id}
          title={tool.title}
          description={tool.description}
          icon={tool.icon}
          badge={tool.badge}
          buttonText={tool.buttonText}
        />
      ))}
    </div>
  );
};

export default ToolsGrid;

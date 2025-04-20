
import React from "react";
import { ToolCard, ToolCardProps } from "./ToolCard";

interface ToolsGridProps {
  tools: ToolCardProps[];
}

export const ToolsGrid = ({ tools }: ToolsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {tools.map((tool) => (
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


import React from "react";
import ToolCard from "./ToolCard";

interface ToolProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  badge?: string | null;
  buttonText: string;
}

interface ToolsGridProps {
  tools: ToolProps[];
}

const ToolsGrid = ({ tools }: ToolsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} {...tool} />
      ))}
    </div>
  );
};

export default ToolsGrid;

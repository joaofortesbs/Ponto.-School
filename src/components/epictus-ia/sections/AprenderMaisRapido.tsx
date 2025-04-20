import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Zap } from "lucide-react";
import { 
  SectionHeader, 
  LearningToolCard, 
  MethodCard
} from "./components/aprender-mais-rapido";
import { learningTools } from "./components/aprender-mais-rapido/learningToolsData.tsx";
export default function AprenderMaisRapido() {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {learningTools.map(tool => (
          <LearningToolCard 
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

      <MethodCard />
    </div>
  );
}
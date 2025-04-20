
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  badge?: string;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  badge,
  onClick,
}) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`rounded-xl border ${
        theme === "dark" 
          ? "bg-gray-900/60 border-gray-800 hover:border-blue-900/70" 
          : "bg-white border-gray-200 hover:border-blue-200"
      } p-5 transition-all hover:shadow-md`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            {icon}
          </div>
          {badge && (
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {badge}
            </Badge>
          )}
        </div>
        
        <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          {title}
        </h3>
        
        <p className={`text-sm mb-4 flex-grow ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          {description}
        </p>
        
        <Button 
          onClick={onClick}
          className="w-full justify-center mt-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default ToolCard;

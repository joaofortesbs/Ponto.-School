
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  title,
  description,
  onClick,
}) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`rounded-xl border ${
        theme === "dark" 
          ? "bg-gray-900/60 border-purple-900/30 hover:border-purple-700/50" 
          : "bg-white/90 border-purple-100 hover:border-purple-200"
      } p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        
        <div>
          <h3 className={`text-base font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
          
          <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {description}
          </p>
        </div>
      </div>
      
      <div className="ml-12">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClick}
          className={`text-xs ${
            theme === "dark" 
              ? "border-purple-800 hover:bg-purple-900/30 text-purple-300" 
              : "border-purple-200 hover:bg-purple-50 text-purple-700"
          }`}
        >
          Experimentar
        </Button>
      </div>
    </div>
  );
};

export default SuggestionCard;


import React from "react";
import { UsersRound, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ToolCardProps {
  tool: {
    id: string;
    title: string;
    description: string;
    badge: string | null;
    buttonText: string;
  };
}

export const AtividadesInterdisciplinaresCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { theme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
      <div className="p-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
            <UsersRound className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{tool.title}</h3>
              {tool.badge && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {tool.description}
            </p>
          </div>
        </div>

        <button 
          className={`mt-3 w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${
            theme === "dark" 
              ? "bg-gray-700 hover:bg-gray-600 text-white" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
          } transition-colors`}
        >
          {tool.buttonText}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

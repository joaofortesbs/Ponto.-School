import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";

interface AssistantData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  buttonText: string;
  highlight?: boolean;
  onButtonClick?: () => void;
}

interface ChatCardProps {
  assistant: AssistantData;
}

export const ChatCard: React.FC<ChatCardProps> = ({ assistant }) => {
  const { theme } = useTheme();

  return (
    <Card className={`w-full overflow-hidden transition-all duration-300 hover:shadow-lg ${
      assistant.highlight 
        ? "bg-gradient-to-br from-[#0A2540] to-[#1B3A5D] border-blue-400/20 hover:border-blue-400/30" 
        : theme === "dark" 
          ? "bg-[#0A2540] hover:bg-[#0F2D4A] border-gray-700" 
          : "bg-white hover:bg-gray-50 border-gray-200"
    }`}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            assistant.highlight 
              ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
              : "bg-blue-500"
          }`}>
            {assistant.icon}
          </div>
          <div>
            <div className="flex items-center">
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {assistant.title}
              </h3>
              {assistant.badge && (
                <Badge className="ml-2 bg-blue-500 text-white">
                  {assistant.badge}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          {assistant.description}
        </p>
        <Button 
          className={`w-full ${
            assistant.highlight 
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              : ""
          }`}
          onClick={assistant.onButtonClick}
        >
          {assistant.buttonText}
        </Button>
      </div>
    </Card>
  );
};
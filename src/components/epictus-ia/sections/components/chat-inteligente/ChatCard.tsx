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
      theme === "dark" ? "bg-[#0A2540] hover:bg-[#0F2D4A] border-gray-700" : "bg-white hover:bg-gray-50 border-gray-200"
    }`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
            {assistant.icon}
          </div>
          <div className="flex items-center">
            <h3 className={`text-base font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {assistant.title}
            </h3>
            {assistant.badge && (
              <Badge className="ml-2 bg-blue-500 text-white text-xs">
                {assistant.badge}
              </Badge>
            )}
          </div>
        </div>
        <p className={`text-sm mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          {assistant.description}
        </p>
        <Button 
          className="w-full text-sm"
          onClick={assistant.onButtonClick}
        >
          {assistant.buttonText}
        </Button>
      </div>
    </Card>
  );
};
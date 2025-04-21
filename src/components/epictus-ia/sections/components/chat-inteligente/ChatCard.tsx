import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";

interface ChatCardProps {
  assistant: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
    buttonText: string;
    highlight?: boolean;
    onButtonClick?: () => void;
  };
}

export const ChatCard: React.FC<ChatCardProps> = ({ assistant }) => {
  const { theme } = useTheme();
  const { id, title, description, icon, badge, buttonText, highlight, onButtonClick } = assistant;

  return (
    <Card className={`overflow-hidden border ${
      highlight
        ? theme === "dark"
          ? "bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-800/30"
          : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
        : theme === "dark"
          ? "bg-gray-900/50 border-gray-800/50"
          : "bg-white border-gray-200"
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-full ${
            highlight
              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
              : "bg-gradient-to-br from-gray-700 to-gray-900"
          } flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          {badge && (
            <Badge className={`${
              highlight
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-800"
            } text-white border-0`}>
              {badge}
            </Badge>
          )}
        </div>

        <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          {title}
        </h3>

        <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          {description}
        </p>

        <Button 
          className={`w-full ${
            highlight
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-700 hover:bg-gray-800"
          } text-white flex items-center justify-center gap-2`}
          onClick={onButtonClick}
        >
          {buttonText}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </Button>
      </div>
    </Card>
  );
};
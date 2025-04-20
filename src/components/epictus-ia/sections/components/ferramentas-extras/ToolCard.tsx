
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  badge?: string;
}

export default function ToolCard({ 
  title, 
  description, 
  icon, 
  buttonText, 
  badge 
}: ToolCardProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${
      theme === "dark" 
        ? "bg-[#1e293b]/70 border-gray-800" 
        : "bg-white border-gray-200"
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            {icon}
          </div>
          <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
        </div>
        
        {badge && (
          <Badge className="bg-[#FF6B00] hover:bg-[#FF6B00] text-white border-none">
            {badge}
          </Badge>
        )}
      </div>
      
      <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        {description}
      </p>
      
      <Button 
        className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00] text-white border-none"
      >
        {buttonText}
      </Button>
    </div>
  );
}

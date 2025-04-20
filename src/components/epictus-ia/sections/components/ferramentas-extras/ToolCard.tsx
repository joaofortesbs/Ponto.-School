
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ToolData } from "./toolsData.tsx";

interface ToolCardProps {
  tool: ToolData;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const { theme } = useTheme();

  return (
    <Card 
      key={tool.id}
      className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/90 to-blue-600/90 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
          {tool.icon}
        </div>

        {tool.badge && (
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs shadow-sm">
            {tool.badge}
          </Badge>
        )}
      </div>

      <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
        <span className="relative">
          {tool.title}
          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300"></span>
        </span>
      </h3>

      <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {tool.description}
      </p>

      <Button 
        className="mt-auto w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white flex items-center justify-center gap-2"
      >
        {tool.buttonText}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}

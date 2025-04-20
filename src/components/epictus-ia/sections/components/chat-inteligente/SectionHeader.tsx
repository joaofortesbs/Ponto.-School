
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { MessageSquare } from "lucide-react";

export default function SectionHeader() {
  const { theme } = useTheme();
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Chat Inteligente
        </h2>
      </div>
      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
        Escolha o assistente ideal para suas necessidades de aprendizado
      </p>
    </div>
  );
}

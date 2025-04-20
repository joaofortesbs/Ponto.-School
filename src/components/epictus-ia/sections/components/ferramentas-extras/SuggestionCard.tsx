
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { HelpCircle, Lightbulb } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SuggestionCard() {
  const { theme } = useTheme();
  
  return (
    <div className={`rounded-xl border p-6 shadow-sm ${
      theme === "dark" 
        ? "bg-[#1e293b]/70 border-gray-800" 
        : "bg-white border-gray-200"
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Sugestões para novas ferramentas
        </h3>
      </div>
      
      <p className={`text-sm mb-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        Tem alguma sugestão de ferramenta que gostaria de ver aqui? Conte para nós!
      </p>
      
      <Textarea 
        placeholder="Descreva sua ideia de ferramenta..."
        className="mb-4"
      />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
          <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            Suas sugestões são importantes
          </span>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00] text-white border-none"
          size="sm"
        >
          Enviar sugestão
        </Button>
      </div>
    </div>
  );
}

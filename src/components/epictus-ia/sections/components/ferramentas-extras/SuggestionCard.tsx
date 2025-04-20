
import React, { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SuggestionCard() {
  const { theme } = useTheme();
  const [suggestion, setSuggestion] = useState("");

  return (
    <div className={`w-full rounded-xl border p-4 shadow-sm ${
      theme === "dark" 
        ? "bg-[#1e293b]/70 border-gray-800" 
        : "bg-white border-gray-200"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-[#FF6B00]" />
        <h3 className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Sugerir nova ferramenta
        </h3>
      </div>
      
      <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
        Diga-nos qual ferramenta você gostaria de ver adicionada às Ferramentas Extras do Epictus IA
      </p>
      
      <Textarea
        value={suggestion}
        onChange={(e) => setSuggestion(e.target.value)}
        placeholder="Descreva a ferramenta que você gostaria de usar..."
        className={`min-h-24 mb-3 ${
          theme === "dark" 
            ? "bg-[#0f172a] border-gray-800 text-gray-300" 
            : "bg-gray-50 border-gray-200 text-gray-800"
        }`}
      />
      
      <Button 
        className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00] text-white border-none"
      >
        <Send className="h-4 w-4 mr-2" /> Enviar sugestão
      </Button>
    </div>
  );
}

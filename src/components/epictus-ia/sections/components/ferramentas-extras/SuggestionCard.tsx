
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SuggestionCard() {
  const { theme } = useTheme();

  return (
    <Card className={`p-5 border overflow-hidden relative ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"} group`}>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
      
      <div className="flex items-center justify-center gap-2 text-center">
        <Sparkles className="h-5 w-5 text-cyan-500" />
        <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
          <span className="relative">
            Sugestão de Ferramentas
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-600"></span>
          </span>
        </h3>
      </div>
      
      <p className={`text-sm mt-4 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        Tem uma sugestão de nova ferramenta? Compartilhe conosco e podemos desenvolvê-la para você!
      </p>
      
      <div className="mt-4 flex justify-center">
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
          Enviar Sugestão
        </Button>
      </div>
    </Card>
  );
}


import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function SuggestionCard() {
  const { theme } = useTheme();
  
  // Dados mockados - você pode conectar com dados reais depois
  const materiaisAdicionados = 12;
  const progressoAtual = 65;

  return (
    <Card className={`p-5 border overflow-hidden relative ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"} group`}>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-all duration-700"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
      
      <div className="relative flex items-center gap-4">
        {/* Avatar do usuário */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            U
          </AvatarFallback>
        </Avatar>

        {/* Barra de progresso e informações */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Progress 
              value={progressoAtual} 
              className="h-2 flex-1"
              indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-600"
            />
            <Button 
              size="icon" 
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-cyan-500/20 transition-colors"
            >
              <Plus className="h-4 w-4 text-cyan-500" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1.5">
            <FileText className={`h-3.5 w-3.5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              {materiaisAdicionados} materiais adicionados
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

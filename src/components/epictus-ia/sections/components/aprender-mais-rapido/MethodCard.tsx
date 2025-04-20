
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Zap, Sparkles } from "lucide-react";

export default function MethodCard() {
  const { theme } = useTheme();
  
  return (
    <div className="mt-6 flex-1">
      <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
              <span className="relative">
                Método de Aprendizado Acelerado
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-600"></span>
              </span>
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Combine as ferramentas desta seção em um fluxo de estudo otimizado: resumo do conteúdo → criação de mapa mental → teste de simulado → revisão guiada. Esta sequência aproveita técnicas comprovadas de aprendizado eficiente.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" className={`${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                Ver detalhes
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                Ativar método <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const JogosDidaticosCard: React.FC = () => {
  const { theme } = useTheme();

  const toolData = {
    id: "jogos-didaticos",
    title: "Gerador de Jogos Didáticos",
    description: "Crie caça-palavras, forcas e outros jogos interativos baseados no seu conteúdo.",
    icon: <Gamepad2 className="h-6 w-6 text-white" />,
    badge: null,
    buttonText: "Criar Jogo"
  };

  return (
    <Card className={`border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} rounded-lg overflow-hidden`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
              {toolData.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-medium text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {toolData.title}
                </h3>
                {toolData.badge && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                    {toolData.badge}
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {toolData.description}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Button 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            {toolData.buttonText}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JogosDidaticosCard;

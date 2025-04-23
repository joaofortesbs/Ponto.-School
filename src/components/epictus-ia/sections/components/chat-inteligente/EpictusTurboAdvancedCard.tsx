
import React from "react";
import { Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const EpictusTurboAdvancedCard: React.FC = () => {
  const handleTurboAdvancedActivation = () => {
    // Set a URL parameter to indicate Turbo Advanced mode is active
    window.history.pushState({}, "", "/epictus-ia?mode=turbo-advanced");
    
    // Dispatch a custom event that the parent component can listen for
    const event = new CustomEvent("activateTurboAdvancedMode", {
      detail: { mode: "turbo-advanced" }
    });
    window.dispatchEvent(event);
  };

  return (
    <Card className="w-full h-full overflow-hidden border shadow-sm">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF9B50]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Epictus IA</CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Seu assistente de estudos pessoal
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-2">
        <p className="text-sm">
          Experimente como é receber uma aula de conteúdos que nem as instituições mais renomadas do Brasil conseguiriam te entregar, personalizado para você!
        </p>
      </CardContent>
      
      <CardFooter className="px-4 py-3 flex justify-end">
        <Button 
          onClick={handleTurboAdvancedActivation}
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00] text-white"
        >
          Usar Epictus
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EpictusTurboAdvancedCard;

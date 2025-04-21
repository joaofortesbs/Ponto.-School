
import React from "react";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTurboMode } from "@/components/epictus-ia/context/TurboModeContext";

interface EpictusTurboCardProps {
  onUseTurbo: () => void;
}

export function EpictusTurboCard({ onUseTurbo }: EpictusTurboCardProps) {
  return (
    <div className="bg-[#0F172A] rounded-lg overflow-hidden h-[180px] flex flex-col transition-all duration-300 shadow-md border border-[#1E293B]">
      <div className="p-4 flex-1">
        <div className="flex items-center mb-2">
          <div className="mr-2 bg-blue-600 rounded-full p-1.5">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">Epictus Turbo</h3>
          <Badge className="ml-2 bg-blue-600 text-white text-[10px] font-medium py-0.5 h-4">Novo</Badge>
        </div>
        <p className="text-white/70 text-sm">
          O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando. A revolução da educação começa aqui!
        </p>
      </div>
      <div className="p-2 bg-gradient-to-r from-blue-700 to-blue-500">
        <Button 
          onClick={onUseTurbo}
          className="w-full bg-transparent hover:bg-white/10 text-white font-medium border-none"
        >
          Usar Turbo
        </Button>
      </div>
    </div>
  );
}

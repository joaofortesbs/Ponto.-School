
import React from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BrainstormCard() {
  return (
    <div className="bg-[#0F172A] rounded-lg overflow-hidden h-[180px] flex flex-col transition-all duration-300 shadow-md border border-[#1E293B]">
      <div className="p-4 flex-1">
        <div className="flex items-center mb-2">
          <div className="mr-2 bg-blue-600 rounded-full p-1.5">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">Tempestade de Ideias (Brainstorm)</h3>
        </div>
        <p className="text-white/70 text-sm">
          Gere ideias criativas, explore conceitos e estruture seus projetos com a ajuda da IA.
        </p>
      </div>
      <div className="p-2 bg-gradient-to-r from-blue-700 to-blue-500">
        <Button 
          className="w-full bg-transparent hover:bg-white/10 text-white font-medium border-none"
        >
          Criar
        </Button>
      </div>
    </div>
  );
}

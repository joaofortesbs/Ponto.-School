
import React from "react";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EpictusIACard() {
  return (
    <div className="bg-[#0F172A] rounded-lg overflow-hidden h-[180px] flex flex-col transition-all duration-300 shadow-md border border-[#1E293B]">
      <div className="p-4 flex-1">
        <div className="flex items-center mb-2">
          <div className="mr-2 bg-blue-600 rounded-full p-1.5">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">Chat com Epictus IA</h3>
          <Badge className="ml-2 bg-blue-600 text-white text-[10px] font-medium py-0.5 h-4">Popular</Badge>
        </div>
        <p className="text-white/70 text-sm">
          Tire dúvidas rápidas, peça sugestões, receba ajuda personalizada e execute ações rápidas com comandos de voz ou texto.
        </p>
      </div>
      <div className="p-2 bg-gradient-to-r from-blue-700 to-blue-500">
        <Button 
          className="w-full bg-transparent hover:bg-white/10 text-white font-medium border-none"
        >
          Começar
        </Button>
      </div>
    </div>
  );
}


import React from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TutorInteligenteCard() {
  return (
    <div className="bg-[#0F172A] rounded-lg overflow-hidden h-[180px] flex flex-col transition-all duration-300 shadow-md border border-[#1E293B]">
      <div className="p-4 flex-1">
        <div className="flex items-center mb-2">
          <div className="mr-2 bg-blue-600 rounded-full p-1.5">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">Tutor Inteligente</h3>
        </div>
        <p className="text-white/70 text-sm">
          Receba explicações detalhadas sobre qualquer assunto acadêmico, com exemplos e diferentes níveis de profundidade.
        </p>
      </div>
      <div className="p-2 bg-gradient-to-r from-blue-700 to-blue-500">
        <Button 
          className="w-full bg-transparent hover:bg-white/10 text-white font-medium border-none"
        >
          Aprender
        </Button>
      </div>
    </div>
  );
}

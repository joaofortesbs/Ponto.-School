import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Award, ChevronRight } from "lucide-react";

export default function Achievements() {
  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
          Conquistas
        </h3>
        <Button
          variant="ghost"
          className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
        >
          Ver Todas <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-2">
            <Trophy className="h-7 w-7 text-[#FF6B00]" />
          </div>
          <p className="text-xs text-center text-[#29335C] dark:text-white font-medium">
            Mestre em Matemática
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-2">
            <Zap className="h-7 w-7 text-[#FF6B00]" />
          </div>
          <p className="text-xs text-center text-[#29335C] dark:text-white font-medium">
            Estudante Dedicado
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-2">
            <Award className="h-7 w-7 text-[#FF6B00]" />
          </div>
          <p className="text-xs text-center text-[#29335C] dark:text-white font-medium">
            Colaborador Premium
          </p>
        </div>
      </div>
    </div>
  );
}
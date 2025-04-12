import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap, BookOpen } from "lucide-react";

export default function Education() {
  return (
    <div className="w-full max-w-full flex-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
          Educação
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-medium text-[#29335C] dark:text-white truncate">
              Universidade de São Paulo
            </h4>
            <p className="text-sm text-[#64748B] dark:text-white/60 truncate">
              Bacharelado em Engenharia de Software
            </p>
            <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
              2020 - Presente
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-6 w-6 text-[#FF6B00]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-medium text-[#29335C] dark:text-white truncate">
              Colégio Técnico de São Paulo
            </h4>
            <p className="text-sm text-[#64748B] dark:text-white/60 truncate">
              Técnico em Desenvolvimento de Sistemas
            </p>
            <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
              2017 - 2019
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
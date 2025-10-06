
import React from "react";
import { PenTool } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const SectionHeader = () => {
  const { theme } = useTheme();
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <PenTool className="h-6 w-6 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Criar Conteúdo
        </h2>
      </div>
      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
        Ferramentas para professores e alunos criarem conteúdo educacional de forma rápida e eficiente
      </p>
    </div>
  );
};

export default SectionHeader;

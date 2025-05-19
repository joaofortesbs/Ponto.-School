import React from "react";
import { BarChart3, ChevronRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ProgressoDisciplina = () => {
  // Dados de exemplo para o progresso por disciplina
  const disciplinas = [
    { nome: "Matemática", progresso: 85, meta: 90, cor: "#FF6B00" },
    { nome: "Física", progresso: 72, meta: 90, cor: "#4D78FF" },
    { nome: "Química", progresso: 65, meta: 75, cor: "#38B2AC" },
    { nome: "Biologia", progresso: 90, meta: 85, cor: "#68D391" },
    { nome: "História", progresso: 78, meta: 80, cor: "#F6AD55" }
  ];

  return (
    <div className="h-full bg-[#1E293B] border border-[#29335C]/20 rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#FF6B00]" />
          <h3 className="text-lg font-semibold text-white">Progresso por Disciplina</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Dados ilustrativos. Seu progresso real será calculado conforme você completa atividades em cada disciplina.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {disciplinas.map((disciplina, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: disciplina.cor }}></div>
                <span className="text-sm text-white">{disciplina.nome}</span>
              </div>
              <div className="text-xs text-gray-400">
                <span className="text-sm font-semibold" style={{ color: disciplina.cor }}>{disciplina.progresso}%</span>
                <span> • Meta: {disciplina.meta}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${disciplina.progresso}%`,
                  backgroundColor: disciplina.cor
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-400">Média geral:</span>
            <span className="text-lg font-bold text-white ml-2">78%</span>
          </div>
          <div className="flex items-center text-[#FF6B00] cursor-pointer">
            <span className="text-sm">Definir Metas</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressoDisciplina;
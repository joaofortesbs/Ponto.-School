
import React from "react";
import { BarChart2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ProgressoDisciplina = () => {
  const disciplinas = [
    {
      nome: "Matemática",
      progresso: 85,
      meta: 90,
      cor: "#FF6B00"
    },
    {
      nome: "Física",
      progresso: 72,
      meta: 80,
      cor: "#FF6B00"
    },
    {
      nome: "Química",
      progresso: 65,
      meta: 75,
      cor: "#FF6B00"
    },
    {
      nome: "Biologia",
      progresso: 90,
      meta: 85,
      cor: "#FF6B00"
    },
    {
      nome: "História",
      progresso: 76,
      meta: 80,
      cor: "#FF6B00"
    }
  ];

  return (
    <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg h-full border border-[#FF6B00]/10 overflow-hidden">
      <div className="bg-[#FF6B00] p-2 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-white" />
          <h3 className="text-white font-medium">Progresso por Disciplina</h3>
        </div>
        <div className="flex gap-2">
          <span className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-full">Semana</span>
          <span className="text-white text-xs">Mês</span>
          <span className="text-white text-xs">Ano</span>
        </div>
      </div>
      <div className="p-4">
      
      <div className="space-y-3">
        {disciplinas.map((disciplina, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#F8F9FA] dark:bg-[#29335C] flex items-center justify-center">
                  <span className="text-[#FF6B00] font-bold">
                    {disciplina.nome.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-[#29335C] dark:text-white">
                  {disciplina.nome}
                </span>
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-sm font-medium text-[#FF6B00]">
                  {disciplina.progresso}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  | Meta: {disciplina.meta}%
                </span>
              </div>
            </div>
            <Progress
              value={disciplina.progresso}
              className="h-1.5 bg-[#FF6B00]/10"
              indicatorClassName="bg-[#FF6B00]"
            />
          </div>
        ))}
      </div>

      {disciplinas.length === 0 && (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-[#F8F9FA] dark:bg-[#29335C]/50 flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="h-6 w-6 text-[#FF6B00]/60" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma disciplina registrada ainda
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/30 flex justify-between items-center">
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          Média geral: <span className="text-[#29335C] dark:text-white">77%</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 p-1 h-auto text-xs"
        >
          <span>Definir Metas</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
      </div>
    </div>
  );
};

export default ProgressoDisciplina;

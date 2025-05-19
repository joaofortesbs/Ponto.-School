
import React from "react";
import { BarChart2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="bg-[#001427] rounded-xl overflow-hidden h-full border border-[#0D2238]">
      <div className="bg-[#FF6B00] p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-white h-5 w-5" />
          <h3 className="text-white font-medium">Progresso por Disciplina</h3>
        </div>
      </div>

      <div className="p-4 flex flex-col h-[calc(100%-56px)]">
        <div className="space-y-4 flex-1">
          {disciplinas.map((disciplina, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#FF6B00] flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#001427]"></div>
                </div>
                <span className="text-white text-sm">{disciplina.nome}</span>
                <div className="flex-1 text-right">
                  <span className="text-white text-sm">{disciplina.progresso}%</span>
                  <span className="text-gray-400 text-xs ml-1">| Meta: {disciplina.meta}%</span>
                </div>
              </div>
              <div className="pl-6 pt-1">
                <div className="w-full bg-[#0D2238] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF6B00] h-full rounded-full"
                    style={{ width: `${disciplina.progresso}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#0D2238] flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            Média geral: <span className="text-white">73%</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#0D2238] p-1 h-auto text-xs"
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

import React from "react";
import { Clock, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TempoEstudo = () => {
  const diasDaSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="bg-[#001427] rounded-xl overflow-hidden h-full border border-[#0D2238]">
      <div className="bg-[#FF6B00] p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="text-white h-5 w-5" />
          <h3 className="text-white font-medium">Tempo de Estudo</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Dados de exemplo. Seu progresso real será exibido conforme você utiliza a plataforma.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-white h-6 px-2 text-xs bg-[#FF6B00]/50 hover:bg-[#FF6B00]/70"
          >
            Semana
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white h-6 px-2 text-xs hover:bg-[#FF6B00]/70"
          >
            Mês
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white h-6 px-2 text-xs hover:bg-[#FF6B00]/70"
          >
            Ano
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white h-6 w-6 p-0 hover:bg-[#FF6B00]/70"
          >
            <span className="sr-only">Opções</span>
            <i className="text-white text-xs">ⓘ</i>
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-col h-[calc(100%-56px)]">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">32h</span>
          <span className="text-gray-400 text-xs">Meta: 40h</span>
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
          <div className="w-full bg-[#0D2238] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#FF6B00] h-full rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
          <span className="whitespace-nowrap">80% da meta</span>
        </div>

        <div className="text-xs text-gray-400 mt-1 flex justify-end">
          <span>Progresso semanal</span>
        </div>

        <div className="mt-5 flex justify-between">
          {diasDaSemana.map((dia, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className="h-24 w-4 bg-[#0D2238] rounded-full overflow-hidden relative"
                style={{ opacity: index === 6 ? 0.5 : 1 }}
              >
                <div
                  className="bg-[#FF6B00] absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${
                      [60, 45, 80, 30, 50, 25, 15][index]
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-gray-400 text-xs">{dia}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Por Disciplina</span>
            <div className="flex items-center gap-2">
              <select className="bg-[#0D2238] text-white text-xs p-1 rounded border border-[#0D2238] outline-none">
                <option>Todas</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#0D2238] p-1 h-auto text-xs"
              >
                <span>Ver Detalhes</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF6B00]"></div>
              <span className="text-gray-300 text-sm flex-1">Matemática</span>
              <span className="text-gray-400 text-xs">10h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF6B00]"></div>
              <span className="text-gray-300 text-sm flex-1">Física</span>
              <span className="text-gray-400 text-xs">8h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF6B00]"></div>
              <span className="text-gray-300 text-sm flex-1">Química</span>
              <span className="text-gray-400 text-xs">6h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempoEstudo;
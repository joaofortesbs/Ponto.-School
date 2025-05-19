import React from "react";
import { ClipboardList, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TarefasPendentes = () => {
  return (
    <div className="h-full bg-[#1E293B] border border-[#29335C]/20 rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#FF6B00]" />
          <h3 className="text-lg font-semibold text-white">Tarefas Pendentes</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Exemplo de tarefas. Suas tarefas reais aparecerão quando você começar a criar e gerenciar suas atividades.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-1 rounded-full text-xs">
          3 tarefas
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div className="bg-[#29335C]/10 border border-[#29335C]/20 rounded-lg p-4">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-500" />
              <h4 className="text-sm font-medium text-white">Lista de Exercícios - Funções Trigonométricas</h4>
            </div>
            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">Alta</span>
          </div>
          <div className="flex items-center space-x-2 ml-6 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#FF6B00]"></div>
            <span className="text-xs text-gray-400">Matemática</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">Vence hoje, 18:00</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: "75%" }}></div>
          </div>
        </div>

        <div className="bg-[#29335C]/10 border border-[#29335C]/20 rounded-lg p-4">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-500" />
              <h4 className="text-sm font-medium text-white">Relatório de Experimento - Titulação</h4>
            </div>
            <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">Média</span>
          </div>
          <div className="flex items-center space-x-2 ml-6 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#38B2AC]"></div>
            <span className="text-xs text-gray-400">Química</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">Vence em 2 dias</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-[#38B2AC] h-1.5 rounded-full" style={{ width: "40%" }}></div>
          </div>
        </div>

        <div className="bg-[#29335C]/10 border border-[#29335C]/20 rounded-lg p-4">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-500" />
              <h4 className="text-sm font-medium text-white">Preparação para Prova - Mecânica Quântica</h4>
            </div>
            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">Alta</span>
          </div>
          <div className="flex items-center space-x-2 ml-6 mb-2">
            <div className="h-2 w-2 rounded-full bg-[#4D78FF]"></div>
            <span className="text-xs text-gray-400">Física</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">Vence em 1 dia</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-[#4D78FF] h-1.5 rounded-full" style={{ width: "20%" }}></div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">Ver tarefas concluídas</span>
        <Button 
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-lg flex items-center gap-1 px-3 py-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova Tarefa
        </Button>
      </div>
    </div>
  );
};

export default TarefasPendentes;
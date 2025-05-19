import React from "react";
import { Sparkles, ExternalLink, BookOpen, Activity, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const RecomendacoesEpictusIA = () => {
  return (
    <div className="h-full bg-[#1E293B] border border-[#29335C]/20 rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#FF6B00]" />
          <h3 className="text-lg font-semibold text-white">Recomendações do Epictus IA</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Recomendações de exemplo. A IA irá personalizar sugestões com base em seu uso da plataforma.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="bg-[#29335C]/10 border border-[#29335C]/20 rounded-lg p-4">
          <div className="flex items-start mb-3">
            <div className="h-8 w-8 bg-red-500/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Activity className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Prioridade Alta: Você tem uma prova de Física amanhã!</h4>
              <p className="text-xs text-gray-400">Recomendo revisar os conceitos de Mecânica Quântica hoje à noite.</p>
            </div>
          </div>
          <div className="flex space-x-2 ml-11">
            <Button className="bg-black/30 hover:bg-black/50 text-[#FF6B00] text-xs py-1 h-8 px-3 rounded-lg border border-[#FF6B00]/30">
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Ver Material
            </Button>
            <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs py-1 h-8 px-3 rounded-lg">
              Criar Resumo
            </Button>
          </div>
        </div>

        <div className="bg-[#29335C]/10 border border-[#29335C]/20 rounded-lg p-4">
          <div className="flex items-start mb-3">
            <div className="h-8 w-8 bg-yellow-500/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Activity className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Seu desempenho em Química caiu 15% na última semana</h4>
              <p className="text-xs text-gray-400">Que tal revisar os conceitos de titulação?</p>
            </div>
          </div>
          <div className="flex space-x-2 ml-11">
            <Button className="bg-black/30 hover:bg-black/50 text-[#FF6B00] text-xs py-1 h-8 px-3 rounded-lg border border-[#FF6B00]/30">
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Ver Desempenho
            </Button>
            <Button className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs py-1 h-8 px-3 rounded-lg">
              Praticar Exercícios
            </Button>
          </div>
        </div>

        <div className="bg-[#29335C]/10 border border-[#29335C]/20 rounded-lg p-4">
          <div className="flex items-start mb-3">
            <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Activity className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Você está com uma sequência de 7 dias de estudo!</h4>
              <p className="text-xs text-gray-400">Continue assim para ganhar mais pontos de experiência.</p>
            </div>
          </div>
          <div className="flex space-x-2 ml-11">
            <Button className="bg-black/30 hover:bg-black/50 text-[#FF6B00] text-xs py-1 h-8 px-3 rounded-lg border border-[#FF6B00]/30">
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Ver Conquistas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecomendacoesEpictusIA;
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "react-router-dom";
import {
  Brain,
  Sparkles,
  MessageSquare,
  ArrowRight,
  BookOpen,
  FileText,
  BarChart3,
  Compass,
  Lightbulb,
} from "lucide-react";

export default function EpictusIACard() {
  const router = useRouter();

  const navigateToEpictusIA = () => {
    router.navigate("/epictus-ia");
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="h-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"></div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h3 className="font-bold text-[#29335C] dark:text-white text-lg flex items-center gap-2">
                Epictus IA
                <Badge className="bg-[#FF6B00] text-white text-xs ml-2">
                  <Sparkles className="h-3 w-3 mr-1" /> IA
                </Badge>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Seu assistente de estudos pessoal
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Uso esta semana
            </span>
            <span className="text-xs font-medium text-[#FF6B00]">75%</span>
          </div>
          <Progress value={75} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div
            className="bg-gray-50 dark:bg-[#29335C]/20 p-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#29335C]/30 transition-colors"
            onClick={navigateToEpictusIA}
          >
            <BookOpen className="h-4 w-4 text-[#FF6B00]" />
            <span className="text-xs text-[#29335C] dark:text-white">
              Plano de Estudos
            </span>
          </div>
          <div
            className="bg-gray-50 dark:bg-[#29335C]/20 p-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#29335C]/30 transition-colors"
            onClick={navigateToEpictusIA}
          >
            <FileText className="h-4 w-4 text-[#FF6B00]" />
            <span className="text-xs text-[#29335C] dark:text-white">
              Resumos
            </span>
          </div>
          <div
            className="bg-gray-50 dark:bg-[#29335C]/20 p-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#29335C]/30 transition-colors"
            onClick={navigateToEpictusIA}
          >
            <BarChart3 className="h-4 w-4 text-[#FF6B00]" />
            <span className="text-xs text-[#29335C] dark:text-white">
              Desempenho
            </span>
          </div>
          <div
            className="bg-gray-50 dark:bg-[#29335C]/20 p-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#29335C]/30 transition-colors"
            onClick={navigateToEpictusIA}
          >
            <Compass className="h-4 w-4 text-[#FF6B00]" />
            <span className="text-xs text-[#29335C] dark:text-white">
              Exploração
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-3 rounded-lg text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/90 mb-2">
                Química precisa de atenção! Seu desempenho caiu 15% na última
                semana.
              </p>
              <Button
                size="sm"
                className="bg-white text-[#29335C] hover:bg-white/90 w-full text-xs h-7"
                onClick={navigateToEpictusIA}
              >
                Ver recomendações <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>12 interações hoje</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 text-xs h-7"
            onClick={navigateToEpictusIA}
          >
            Abrir Epictus IA <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

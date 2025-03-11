import React from "react";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  Lightbulb,
  BookOpen,
  FileText,
  Star,
  Rocket,
} from "lucide-react";

export default function SchoolIAPlaceholder() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#00FFFF]" /> School IA
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Seu assistente de estudos pessoal com inteligência artificial
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0 px-3 py-1 rounded-full flex items-center">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Avançado
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] space-y-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center animate-pulse">
          <Brain className="h-16 w-16 text-white" />
        </div>

        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#29335C] dark:text-white mb-4">
            Carregando School IA
          </h2>
          <p className="text-[#64748B] dark:text-white/60 mb-6">
            Estamos preparando seu assistente de estudos inteligente. Em breve
            você terá acesso a todas as funcionalidades.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              {
                icon: <Lightbulb className="h-5 w-5" />,
                label: "Mapas Mentais",
              },
              { icon: <FileText className="h-5 w-5" />, label: "Resumos" },
              { icon: <BookOpen className="h-5 w-5" />, label: "Exercícios" },
              { icon: <Star className="h-5 w-5" />, label: "Planos de Estudo" },
              { icon: <Rocket className="h-5 w-5" />, label: "Recomendações" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-white dark:bg-[#29335C]/20 px-3 py-1 rounded-full text-sm text-[#29335C] dark:text-white/80"
              >
                {feature.icon}
                {feature.label}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button className="bg-[#29335C] hover:bg-[#29335C]/90 text-white">
              Aguarde um momento...
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

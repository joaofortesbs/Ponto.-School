import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Settings } from "lucide-react";

export function PlanSelection() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[500px] mx-auto space-y-8 bg-white dark:bg-[#0A2540]/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-xl">
      <div className="text-center space-y-4">
        <div className="text-3xl font-bold text-brand-black dark:text-white text-glow tracking-wider text-center">
          Ponto<span className="text-[#0D00F5]">.</span>
          <span className="text-[#0D00F5]">School</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#0A2540] dark:text-white uppercase">
          Bem-vindo à Ponto.School
        </h1>
        <p className="text-base text-[#64748B] dark:text-white/60">
          Selecione o modelo que melhor se adapta às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lite Plan */}
        <div className="relative overflow-hidden rounded-2xl border border-[#4F46E5]/20 bg-white/80 dark:bg-[#0A2540]/80 backdrop-blur-sm p-6 min-h-[240px] w-full flex flex-col items-center justify-between hover:shadow-lg hover:shadow-[#4F46E5]/20 transition-all duration-300 hover:scale-105">
          <div className="w-16 h-16 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-[#4F46E5]" />
          </div>

          <div className="text-center space-y-2 mb-4">
            <h3 className="text-xl font-bold text-[#0A2540] dark:text-white">
              PONTO.SCHOOL LITE
            </h3>
            <p className="text-sm text-[#64748B] dark:text-white/60 mx-auto">
              Acesso para alunos e professores de instituições públicas.
            </p>
          </div>

          <Button
            onClick={() => navigate("/register?plan=lite")}
            className="w-full max-w-[200px] bg-white text-[#4F46E5] border-2 border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white transition-all duration-300 h-10 text-sm font-medium rounded-full"
          >
            Selecionar plano
          </Button>
        </div>

        {/* Full Plan */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C026D3]/20 bg-white/80 dark:bg-[#0A2540]/80 backdrop-blur-sm p-6 min-h-[240px] w-full flex flex-col items-center justify-between hover:shadow-lg hover:shadow-[#C026D3]/20 transition-all duration-300 hover:scale-105">
          <div className="w-16 h-16 rounded-full bg-[#FDF4FF] flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-[#C026D3]" />
          </div>

          <div className="text-center space-y-2 mb-4">
            <h3 className="text-xl font-bold text-[#0A2540] dark:text-white">
              PONTO.SCHOOL FULL
            </h3>
            <p className="text-sm text-[#64748B] dark:text-white/60 mx-auto">
              Acesso para alunos e professores de instituições particulares.
            </p>
          </div>

          <Button
            onClick={() => navigate("/register?plan=full")}
            className="w-full max-w-[200px] bg-white text-[#C026D3] border-2 border-[#C026D3] hover:bg-[#C026D3] hover:text-white transition-all duration-300 h-10 text-sm font-medium rounded-full"
          >
            Selecionar plano
          </Button>
        </div>
      </div>
    </div>
  );
}

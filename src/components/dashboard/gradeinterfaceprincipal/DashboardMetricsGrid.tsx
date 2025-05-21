import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Target, Users, BookOpen, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TempoEstudoSimplificado from "./TempoEstudoSimplificado";

const DashboardMetricsGrid = () => {
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-6 mt-6">
      {/* Tempo de Estudo Card */}
      <TempoEstudoSimplificado />

      {/* Epictus AI Copiloto Card */}
      <Card 
        onClick={() => handleNavigate("/epictus-ia")}
        className="cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#001427]"
      >
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400">Epictus IA</p>
            <h3 className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">
              Seu Copiloto
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Turmas Card */}
      <Card 
        onClick={() => handleNavigate("/turmas")}
        className="cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#001427]"
      >
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#0EA5E9]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400">Turmas</p>
            <h3 className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">
              Estudos em Grupo
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Portal Card */}
      <Card 
        onClick={() => handleNavigate("/portal")}
        className="cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#001427]"
      >
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400">Portal</p>
            <h3 className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">
              Materiais de Estudo
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetricsGrid;
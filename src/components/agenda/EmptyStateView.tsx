import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Book, Clock, Target, ArrowRight, Sparkles, BookOpen } from "lucide-react";

const EmptyStateView: React.FC = () => {
  return (
    <div className="w-full bg-[#001427]/50 rounded-xl p-8 text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#29335C]/30 flex items-center justify-center">
        <Calendar className="h-12 w-12 text-[#FF6B00]" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Bem-vindo à sua Agenda</h2>
      <p className="text-gray-400 mb-8 max-w-xl mx-auto">
        Este é seu espaço de organização pessoal. Adicione eventos, tarefas e acompanhe seu progresso à medida que você utiliza a plataforma.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
        <div className="bg-[#29335C]/20 rounded-lg p-5 text-left">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
            <Clock className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <h3 className="text-white font-medium mb-2">Organize seu tempo</h3>
          <p className="text-gray-400 text-sm">Crie eventos e gerencie sua rotina de estudos com eficiência</p>
        </div>

        <div className="bg-[#29335C]/20 rounded-lg p-5 text-left">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
            <BookOpen className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <h3 className="text-white font-medium mb-2">Acompanhe suas tarefas</h3>
          <p className="text-gray-400 text-sm">Gerencie suas atividades acadêmicas e marque seus progressos</p>
        </div>

        <div className="bg-[#29335C]/20 rounded-lg p-5 text-left">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
            <Target className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <h3 className="text-white font-medium mb-2">Defina seus objetivos</h3>
          <p className="text-gray-400 text-sm">Estabeleça metas e acompanhe seu desempenho acadêmico</p>
        </div>
      </div>

      <Button className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]">
        Começar
      </Button>
    </div>
  );
};

export default EmptyStateView;
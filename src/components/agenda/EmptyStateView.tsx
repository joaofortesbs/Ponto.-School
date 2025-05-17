
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Book, Clock, Target, ArrowRight, Sparkles } from "lucide-react";

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
            <Book className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <h3 className="text-white font-medium mb-2">Acompanhe suas tarefas</h3>
          <p className="text-gray-400 text-sm">Registre e monitore suas atividades e progresso em cada disciplina</p>
        </div>
        
        <div className="bg-[#29335C]/20 rounded-lg p-5 text-left">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
            <Target className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <h3 className="text-white font-medium mb-2">Alcance seus objetivos</h3>
          <p className="text-gray-400 text-sm">Defina metas e visualize seu progresso ao longo do tempo</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white border-none">
          <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
        </Button>
        <Button variant="outline" className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10">
          <Sparkles className="h-4 w-4 mr-2" /> Explorar Recursos <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default EmptyStateView;


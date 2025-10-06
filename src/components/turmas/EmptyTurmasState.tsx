import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Plus } from "lucide-react";

interface EmptyTurmasStateProps {
  onExplore: () => void;
  onCreateTurma?: () => void;
}

const EmptyTurmasState: React.FC<EmptyTurmasStateProps> = ({
  onExplore,
  onCreateTurma,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-6 animate-pulse-custom">
        <BookOpen className="h-12 w-12 text-[#FF6B00]" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-montserrat animate-highlight">
        Você ainda não está inscrito em nenhuma turma
      </h2>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 font-open-sans">
        Explore as turmas disponíveis ou crie sua própria turma para começar sua
        jornada de aprendizado. Você terá acesso a materiais, atividades, fóruns
        e muito mais!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-6 py-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] font-montserrat font-semibold text-lg animate-gradient-x"
          onClick={onExplore}
        >
          <Search className="h-5 w-5 mr-2" /> Explorar Turmas
        </Button>

        {onCreateTurma && (
          <Button
            className="bg-white dark:bg-[#1E293B] border-2 border-[#FF6B00] text-[#FF6B00] px-6 py-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] font-montserrat font-semibold text-lg hover:bg-[#FF6B00]/5"
            onClick={onCreateTurma}
          >
            <Plus className="h-5 w-5 mr-2" /> Criar Minha Turma
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyTurmasState;

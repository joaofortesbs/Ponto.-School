import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface Disciplina {
  id: string;
  name: string;
  materialsCount: number;
  image: string;
}

const DisciplinaCard = ({ disciplina }: { disciplina: Disciplina }) => {
  // Get color and progress based on discipline name
  const getColor = () => {
    const colorMap: Record<string, string> = {
      Física: "#4C6EF5",
      Matemática: "#FA5252",
      Português: "#40C057",
      História: "#FD7E14",
      Química: "#7950F2",
      Biologia: "#20C997",
    };

    return colorMap[disciplina.name] || "#6C757D";
  };

  const getProgress = () => {
    const progressMap: Record<string, number> = {
      Física: 70,
      Matemática: 45,
      Português: 60,
      História: 85,
      Química: 30,
      Biologia: 55,
    };

    return progressMap[disciplina.name] || 0;
  };

  const color = getColor();
  const progress = getProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#001427]/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
      <div className="h-40 overflow-hidden">
        <img
          src={disciplina.image}
          alt={disciplina.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF6B00] transition-colors">
          {disciplina.name}
        </h3>
        <div className="flex items-center mt-1 text-white/80 text-sm">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>{disciplina.materialsCount} materiais</span>
        </div>
      </div>
      <div className="absolute top-3 right-3 z-20">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 pt-0 mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Progresso geral
          </span>
          <span className="text-xs font-medium" style={{ color }}>
            {progress}%
          </span>
        </div>
        <Progress
          value={progress}
          className="h-1.5 bg-gray-200 dark:bg-gray-700"
          indicatorClassName={`bg-[${color}]`}
        />
        <div className="flex justify-between mt-4">
          <Button variant="outline" size="sm">
            Ver detalhes
          </Button>
          <Button
            size="sm"
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            Explorar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DisciplinaCard;

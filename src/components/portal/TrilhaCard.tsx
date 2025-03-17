import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight } from "lucide-react";

export interface Trilha {
  id: string;
  name: string;
  progress: number;
  nextStep: string;
  materialsCount: number;
  image: string;
}

const TrilhaCard = ({ trilha }: { trilha: Trilha }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-[#001427]/60 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
      <div className="h-32 overflow-hidden">
        <img
          src={trilha.image}
          alt={trilha.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF6B00] transition-colors">
          {trilha.name}
        </h3>
        <p className="text-sm text-gray-200 mb-1">Próximo: {trilha.nextStep}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-300">
            {trilha.materialsCount} materiais
          </span>
          <span className="text-xs font-medium text-[#FF6B00]">
            {trilha.progress}%
          </span>
        </div>
        <Progress value={trilha.progress} className="h-1 bg-gray-700" />
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
    </motion.div>
  );
};

export default TrilhaCard;

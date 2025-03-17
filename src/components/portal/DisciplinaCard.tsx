import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export interface Disciplina {
  id: string;
  name: string;
  materialsCount: number;
  image: string;
}

const DisciplinaCard = ({ disciplina }: { disciplina: Disciplina }) => {
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
          src={disciplina.image}
          alt={disciplina.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FF6B00] transition-colors">
          {disciplina.name}
        </h3>
        <p className="text-sm text-gray-200 mb-1">
          {disciplina.materialsCount} materiais
        </p>
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

export default DisciplinaCard;

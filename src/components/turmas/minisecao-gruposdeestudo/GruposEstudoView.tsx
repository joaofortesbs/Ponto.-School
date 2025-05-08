
import React from "react";
import { Users2 } from "lucide-react";
import { motion } from "framer-motion";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full ${className}`}>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="h-12 w-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-lg">
          <Users2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
            Grupos de Estudo
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Conecte-se e aprenda com seus colegas
          </p>
        </div>
      </motion.div>
      {/* Conteúdo removido conforme solicitado */}
    </div>
  );
};

export default GruposEstudoView;

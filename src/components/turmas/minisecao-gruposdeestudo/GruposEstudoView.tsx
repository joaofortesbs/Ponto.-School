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
        className="bg-gradient-to-r from-black/80 to-gray-900/80 rounded-t-xl p-5 border-b border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B00]/20">
              <Users2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Grupos de Estudo
              </h2>
              <p className="text-sm text-white/60">
                Descubra grupos alinhados aos seus interesses
              </p>
            </div>
          </div>
          {/* Button component is missing, assuming it's external */}
          {/*<Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white rounded-xl shadow-lg shadow-[#FF6B00]/20">
            <Plus className="h-4 w-4 mr-1" /> Criar Grupo
          </Button>*/}
        </div>
      </motion.div>
      {/* Conteúdo removido conforme solicitado */}
    </div>
  );
};

export default GruposEstudoView;
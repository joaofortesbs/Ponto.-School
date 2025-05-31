
import React from "react";
import { Calendar, Flame, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface CardDiasDeSequenciaProps {
  isSpinning: boolean;
  showResult: boolean;
}

const CardDiasDeSequencia: React.FC<CardDiasDeSequenciaProps> = ({
  isSpinning,
  showResult,
}) => {
  const diasSequencia = 7; // Exemplo de dados
  const recordePessoal = 15;
  const proximaMeta = 10;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-4"
      style={{ width: "280px" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-white font-semibold text-sm">Sequência de Giros</h3>
      </div>

      <div className="space-y-3">
        {/* Dias consecutivos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-white/80 text-sm">Dias consecutivos</span>
          </div>
          <span className="text-white font-bold">{diasSequencia}</span>
        </div>

        {/* Recorde pessoal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-white/80 text-sm">Recorde pessoal</span>
          </div>
          <span className="text-yellow-500 font-bold">{recordePessoal}</span>
        </div>

        {/* Próxima meta */}
        <div className="bg-white/5 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/70 text-xs">Próxima meta</span>
            <span className="text-white text-xs">{diasSequencia}/{proximaMeta}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(diasSequencia / proximaMeta) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CardDiasDeSequencia;

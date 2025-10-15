import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const PromotionalBanner = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative w-full overflow-hidden shadow-xl
          bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100
          border border-orange-200/50 backdrop-blur-sm
          transition-all duration-300 ease-in-out
          ${isHovered ? "scale-[1.01] shadow-orange-200/50" : ""}
          max-h-[160px] sm:max-h-[180px] md:max-h-[200px]
          rounded-2xl
        `}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/30 to-transparent" />
        </div>

        <div className="flex items-center relative z-10 h-full p-6 sm:p-8 md:p-10">
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900 mb-4 sm:mb-6 leading-tight"
            >
              Planeje, crie, e analise todas as atividades do próximo semestre em 2 minutos!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none shadow-lg shadow-orange-500/30 transition-all duration-300 rounded-full px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base font-semibold flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                Comece a criar
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PromotionalBanner;
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search } from 'lucide-react';

interface AtividadesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AtividadesHeader: React.FC<AtividadesHeaderProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex items-center gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center bg-[#1A2B3C] border border-[#FF6B00]/30 rounded-full px-2 py-1.5 hover:border-[#FF6B00] transition-colors cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FF6B00] flex-shrink-0">
          <img 
            src="/images/avatar2-sobreposto-pv.webp" 
            alt="Agente Felix"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-white/80 text-sm font-medium ml-2 mr-3 group-hover:text-[#FF6B00] transition-colors hidden sm:block">
          Agente Felix
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 relative"
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-white/40" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar atividades"
          className="w-full bg-[#1A2B3C] border border-[#FF6B00]/30 rounded-full py-2.5 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B00] transition-colors text-sm"
        />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-full border-2 border-[#FF6B00] bg-transparent flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors flex-shrink-0"
      >
        <Calendar className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default AtividadesHeader;

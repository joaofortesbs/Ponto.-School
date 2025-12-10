import React, { useEffect, useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const isDark = true; // Default to dark mode

  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* Agente Felix Card */}
      <div className="relative" style={{ width: 207, height: '57px' }}>
        {/* Animated Background Card - Figma: 207×57px, r:28.5px */}
        <motion.div
          initial={{ width: '57px', borderRadius: '28.5px' }}
          animate={isExpanded ? { width: '207px', borderRadius: '28.5px' } : { width: '57px', borderRadius: '28.5px' }}
          transition={{
            duration: 0.8,
            ease: [0.23, 1, 0.320, 1],
          }}
          className={`absolute left-0 top-0 h-full border-2 border-[#FF6B00]/30 hover:border-[#FF6B00] transition-colors cursor-pointer group ${
            isDark ? 'bg-[#1A2B3C]' : 'bg-white'
          }`}
          style={{ overflow: isExpanded ? 'visible' : 'hidden' }}
        >
          {/* Expanding Content Container */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className={`flex items-center gap-2 pl-12 pr-3 h-full ${isDark ? 'text-white/80' : 'text-gray-700'}`}
            >
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className={`text-sm font-medium whitespace-nowrap group-hover:text-[#FF6B00] transition-colors ${isDark ? 'text-white/80' : 'text-gray-600'}`}
              >
                Agente Felix
              </motion.span>
            </motion.div>
          )}
        </motion.div>

        {/* Avatar Circle - Always on top - Figma: 57×57px */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`absolute left-0 top-0 w-14 h-14 rounded-full overflow-hidden border-2 border-[#FF6B00] flex-shrink-0 z-10 ${isDark ? 'bg-[#1A2B3C]' : 'bg-gray-100'}`}
          style={{ 
            boxShadow: '0 0 12px rgba(255, 107, 0, 0.3)'
          }}
        >
          <img
            src="/images/avatar2-sobreposto-pv.webp"
            alt="Agente Felix"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 relative"
      >
        <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar atividades"
          className={`w-full border rounded-full py-4 pl-11 pr-4 focus:outline-none transition-colors text-sm ${
            isDark 
              ? 'bg-[#1A2B3C] border-[#FF6B00]/30 text-white placeholder-white/40 focus:border-[#FF6B00]'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#FF6B00]'
          }`}
          style={{ height: '57px' }}
        />
      </motion.div>

      {/* Calendar Card - Static - Figma: 207×57px, r:28.5px */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`flex items-center gap-2 px-4 rounded-full border-2 border-[#FF6B00] cursor-pointer group hover:border-[#FF6B00] transition-colors text-[#FF6B00] ${
          isDark ? 'bg-[#1A2B3C]' : 'bg-white'
        }`}
        style={{ width: '207px', height: '57px', borderRadius: '28.5px' }}
      >
        {/* Calendar Icon - Simple style like GridSelector */}
        <Calendar className="w-4 h-4 flex-shrink-0" />

        {/* Calendar Text */}
        <span className={`text-sm font-medium whitespace-nowrap group-hover:text-[#FF6B00] transition-colors flex-1 ${
          isDark ? 'text-white/80' : 'text-gray-600'
        }`}>
          Calendário
        </span>
      </motion.div>
    </div>
  );
};

export default AtividadesHeader;

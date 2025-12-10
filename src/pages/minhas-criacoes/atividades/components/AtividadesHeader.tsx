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
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const isDark = true; // Default to dark mode

  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsCalendarExpanded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* Agente Felix Card */}
      <div className="relative" style={{ width: 208, height: '40px' }}>
        {/* Animated Background Card */}
        <motion.div
          initial={{ width: '40px', borderRadius: '50%' }}
          animate={isExpanded ? { width: '208px', borderRadius: '50px' } : { width: '40px', borderRadius: '50%' }}
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

        {/* Avatar Circle - Always on top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`absolute left-0 top-0 w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF6B00] flex-shrink-0 z-10 ${isDark ? 'bg-[#1A2B3C]' : 'bg-gray-100'}`}
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
          className={`w-full border rounded-full py-2.5 pl-11 pr-4 focus:outline-none transition-colors text-sm ${
            isDark 
              ? 'bg-[#1A2B3C] border-[#FF6B00]/30 text-white placeholder-white/40 focus:border-[#FF6B00]'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#FF6B00]'
          }`}
        />
      </motion.div>

      {/* Calendar Card - Animated Expansion */}
      <div className="relative" style={{ width: 208, height: '40px' }}>
        <motion.div
          initial={{ width: '40px', borderRadius: '50%' }}
          animate={isCalendarExpanded ? { width: '208px', borderRadius: '50px' } : { width: '40px', borderRadius: '50%' }}
          transition={{
            duration: 0.8,
            ease: [0.23, 1, 0.320, 1],
          }}
          className={`absolute right-0 top-0 h-full border-2 border-[#FF6B00]/30 hover:border-[#FF6B00] transition-colors cursor-pointer group ${
            isDark ? 'bg-[#1A2B3C]' : 'bg-white'
          }`}
          style={{ overflow: isCalendarExpanded ? 'visible' : 'hidden' }}
        >
          {isCalendarExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center gap-2 pl-3 pr-3 h-full"
            >
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className={`text-sm font-medium whitespace-nowrap group-hover:text-[#FF6B00] transition-colors ${
                  isDark ? 'text-white/80' : 'text-gray-600'
                }`}
              >
                Calendário
              </motion.span>
            </motion.div>
          )}
        </motion.div>

        {/* Calendar Icon Circle - Always on top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`absolute right-0 top-0 w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF6B00] flex-shrink-0 z-10 flex items-center justify-center text-[#FF6B00] ${
            isDark ? 'bg-[#1A2B3C]' : 'bg-white'
          }`}
          style={{ 
            boxShadow: '0 0 12px rgba(255, 107, 0, 0.3)'
          }}
        >
          <Calendar className="w-5 h-5" />
        </motion.div>
      </div>
    </div>
  );
};

export default AtividadesHeader;

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

  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: 208, height: '40px' }}>
        {/* Animated Background Card */}
        <motion.div
          initial={{ width: '40px', borderRadius: '50%' }}
          animate={isExpanded ? { width: '208px', borderRadius: '50px' } : { width: '40px', borderRadius: '50%' }}
          transition={{
            duration: 0.8,
            ease: [0.23, 1, 0.320, 1], // Custom easing for smooth expansion
          }}
          className="absolute left-0 top-0 h-full bg-[#1A2B3C] border-2 border-[#FF6B00]/30 hover:border-[#FF6B00] transition-colors cursor-pointer group"
          style={{ overflow: isExpanded ? 'visible' : 'hidden' }}
        >
          {/* Expanding Content Container */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center gap-2 pl-12 pr-3 h-full"
            >
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="text-white/80 text-sm font-medium whitespace-nowrap group-hover:text-[#FF6B00] transition-colors"
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
          className="absolute left-0 top-0 w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF6B00] flex-shrink-0 z-10"
          style={{ 
            background: '#1A2B3C',
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

      {/* Calendar Card - Figma: 207×57px */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 px-4 cursor-pointer flex-shrink-0"
        style={{
          width: '207px',
          height: '57px',
          borderRadius: '47px',
          background: 'rgba(249, 115, 22, 0.09)',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Calendar Icon - Simple outline style like GridSelector */}
        <Calendar className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
        
        {/* Calendário Text - Gradient effect */}
        <span
          className="text-sm font-black whitespace-nowrap"
          style={{
            background: 'linear-gradient(199.96deg, rgba(255, 255, 255, 0.91) 29.65%, rgba(204, 204, 204, 0.91) 62.54%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Calendário
        </span>
      </motion.div>
    </div>
  );
};

export default AtividadesHeader;

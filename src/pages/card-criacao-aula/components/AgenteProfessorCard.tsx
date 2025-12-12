import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface AgenteProfessorCardProps {
  userAvatar: string | null;
  cardHeight: number;
  cardMaxWidth: number;
  animationDelay?: number;
}

const AgenteProfessorCard: React.FC<AgenteProfessorCardProps> = ({
  userAvatar,
  cardHeight,
  cardMaxWidth,
  animationDelay = 0.1
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className="relative w-fit"
      style={{ maxWidth: `${cardMaxWidth}px` }}
    >
      {/* Card Retangular com Círculo + Texto */}
      <div 
        className="flex items-center flex-1 relative"
        style={{
          height: `${cardHeight}px`,
          width: '100%',
          minWidth: '280px',
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
          borderRadius: `${cardHeight}px`,
          border: '1px solid rgba(255, 107, 0, 0.3)',
          paddingLeft: `calc(${cardHeight}px + 16px)`,
          paddingRight: '32px',
          overflow: 'visible'
        }}
      >
        {/* Componente Circular com Imagem de Perfil - Canto Extremo */}
        <div 
          className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 absolute left-0 top-1/2 -translate-y-1/2"
          style={{ 
            width: `${cardHeight}px`,
            height: `${cardHeight}px`,
            background: userAvatar ? 'transparent' : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
            border: '3px solid #FF6B00',
            boxShadow: '0 4px 12px rgba(255, 107, 0, 0.4)'
          }}
        >
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Avatar do Professor"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>

        <span className="text-white font-semibold text-base whitespace-nowrap">
          Agente Professor
        </span>
      </div>
    </motion.div>
  );
};

export default AgenteProfessorCard;

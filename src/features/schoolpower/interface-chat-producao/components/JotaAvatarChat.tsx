import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface JotaAvatarChatProps {
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export function JotaAvatarChat({ size = 'md', showAnimation = true }: JotaAvatarChatProps) {
  const [isHoverActive, setIsHoverActive] = useState(false);

  useEffect(() => {
    if (showAnimation) {
      const hoverTimer = setTimeout(() => {
        setIsHoverActive(true);
      }, 300);

      return () => clearTimeout(hoverTimer);
    } else {
      setIsHoverActive(true);
    }
  }, [showAnimation]);

  const sizeConfig = {
    sm: { container: 32, image: 28 },
    md: { container: 40, image: 36 },
    lg: { container: 48, image: 44 }
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      initial={showAnimation ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-shrink-0"
    >
      <div
        className={`
          relative rounded-full overflow-visible cursor-pointer
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isHoverActive 
            ? 'scale-105 shadow-lg shadow-orange-500/30' 
            : ''}
        `}
        style={{
          width: config.container,
          height: config.container,
          background: isHoverActive 
            ? 'linear-gradient(135deg, #FF6F32 0%, #FF8C5A 50%, #FFB088 100%)'
            : '#FF6F32',
          padding: '3px',
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isHoverActive ? { 
            opacity: [0, 0.6, 0],
            scale: [1, 1.3, 1.5],
          } : { opacity: 0 }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity,
            ease: 'easeOut'
          }}
          style={{
            background: 'linear-gradient(135deg, #FF6F32, #FF8C5A)',
            zIndex: -1,
          }}
        />
        
        <div 
          className="rounded-full overflow-hidden bg-[#000822]"
          style={{
            width: config.image,
            height: config.image,
          }}
        >
          <img
            src="/images/avatar11-sobreposto-pv.webp"
            alt="Jota"
            className="w-full h-full object-cover"
            style={{ 
              transform: 'translateY(1px)',
            }}
            loading="eager"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default JotaAvatarChat;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface JotaAvatarChatProps {
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export function JotaAvatarChat({ size = 'md', showAnimation = true }: JotaAvatarChatProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (showAnimation && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, hasAnimated]);

  const sizeConfig = {
    sm: { container: 32, image: 28 },
    md: { container: 40, image: 36 },
    lg: { container: 48, image: 44 }
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      initial={showAnimation ? { scale: 0, opacity: 0, rotate: -180 } : { scale: 1, opacity: 1, rotate: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: 0,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative rounded-full overflow-visible cursor-pointer flex items-center justify-center"
        initial={{ y: 0 }}
        animate={{ 
          y: hasAnimated ? -2 : 0,
          scale: isHovered ? 1.05 : 1
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          width: config.container,
          height: config.container,
          background: 'linear-gradient(135deg, #FF6F32 0%, #FF8C5A 50%, #FFB088 100%)',
          padding: '3px',
          boxShadow: hasAnimated 
            ? '0 8px 20px rgba(255, 111, 50, 0.4), 0 0 30px rgba(255, 111, 50, 0.2)' 
            : '0 4px 12px rgba(255, 111, 50, 0.3)',
        }}
      >
        <motion.div 
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{
            background: 'radial-gradient(circle, rgba(255, 111, 50, 0.4) 0%, transparent 70%)',
          }}
        />
        <div 
          className="rounded-full overflow-hidden bg-[#000822] relative z-10"
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
      </motion.div>
    </motion.div>
  );
}

export default JotaAvatarChat;

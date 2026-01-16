import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface JotaAvatarChatProps {
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export function JotaAvatarChat({ size = 'md', showAnimation = true }: JotaAvatarChatProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

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
      initial={showAnimation ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: 0,
        ease: [0.34, 1.56, 0.64, 1]
      }}
      className="flex-shrink-0"
    >
      <motion.div
        className="relative rounded-full overflow-visible cursor-pointer flex items-center justify-center"
        initial={{ y: 0 }}
        animate={hasAnimated ? { y: -4 } : { y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          width: config.container,
          height: config.container,
          background: hasAnimated 
            ? 'linear-gradient(135deg, #FF6F32 0%, #FF8C5A 50%, #FFB088 100%)'
            : '#FF6F32',
          padding: '3px',
          boxShadow: hasAnimated ? '0 8px 16px rgba(255, 111, 50, 0.3)' : 'none',
        }}
      >
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
      </motion.div>
    </motion.div>
  );
}

export default JotaAvatarChat;

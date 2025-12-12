import React from 'react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  steps?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps = 3 }) => {
  const stepHeight = 40; // Altura entre as bolinhas
  const ballSize = 24;

  return (
    <div className="flex flex-col items-center gap-0" style={{ minHeight: `${steps * stepHeight + ballSize}px` }}>
      {Array.from({ length: steps }).map((_, index) => (
        <React.Fragment key={index}>
          {/* Bolinha */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
            className="flex-shrink-0 rounded-full"
            style={{
              width: `${ballSize}px`,
              height: `${ballSize}px`,
              minWidth: `${ballSize}px`,
              minHeight: `${ballSize}px`,
              border: '2px solid #FF6B00',
              background: 'rgba(255, 107, 0, 0.1)',
              zIndex: 10,
              position: 'relative'
            }}
          />

          {/* Linha para a próxima bolinha */}
          {index < steps - 1 && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
              style={{
                width: '2px',
                height: `${stepHeight}px`,
                background: 'linear-gradient(180deg, rgba(255, 107, 0, 0.5) 0%, rgba(255, 107, 0, 0.3) 100%)',
                transformOrigin: 'top'
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;

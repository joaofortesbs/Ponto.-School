import React from 'react';
import { motion } from 'framer-motion';

interface TimelineStepsContainerProps {
  children: React.ReactNode;
}

const TimelineStepsContainer: React.FC<TimelineStepsContainerProps> = ({ children }) => {
  const steps = 3;

  return (
    <div className="relative w-full">
      {/* Timeline vertical com bolinhas e linhas */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center" style={{ width: '60px' }}>
        {/* Loop para criar as 3 bolinhas de baixo para cima */}
        {Array.from({ length: steps }).map((_, index) => {
          // Inverter ordem para que fique de baixo para cima
          const stepIndex = steps - 1 - index;
          const totalHeight = steps * 180; // Altura aproximada entre cada card
          const topPosition = stepIndex * 180;

          return (
            <div key={index} className="relative flex flex-col items-center" style={{ height: `${totalHeight}px` }}>
              {/* Bolinha */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + stepIndex * 0.1, duration: 0.3 }}
                className="absolute rounded-full flex-shrink-0 z-10"
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #FF6B00',
                  background: 'rgba(255, 107, 0, 0.1)',
                  top: `${topPosition}px`
                }}
              />

              {/* Linha tracejada (entre bolinhas, de baixo para cima) */}
              {stepIndex < steps - 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: 0.2 + stepIndex * 0.1, duration: 0.4 }}
                  className="absolute"
                  style={{
                    width: '2px',
                    height: '156px', // Altura entre as bolinhas
                    top: `${topPosition + 24}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundImage: 'repeating-linear-gradient(to bottom, #FF6B00 0px, #FF6B00 6px, transparent 6px, transparent 12px)',
                    opacity: 0.5
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Cards container com padding esquerdo para os bolinhas */}
      <div className="ml-20">
        {children}
      </div>
    </div>
  );
};

export default TimelineStepsContainer;

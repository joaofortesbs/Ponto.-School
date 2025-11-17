
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Agent {
  id: number;
  name: string;
  color: string;
  icon: string;
}

const agents: Agent[] = [
  { id: 1, name: "Agente Criativo", color: "#FF6B35", icon: "🎨" },
  { id: 2, name: "Agente Analista", color: "#FF8C42", icon: "📊" },
  { id: 3, name: "Agente Executor", color: "#F4A261", icon: "⚙️" },
  { id: 4, name: "Agente Estrategista", color: "#D84315", icon: "🎯" },
  { id: 5, name: "Agente Inovador", color: "#FF6B35", icon: "💡" },
  { id: 6, name: "Agente Comunicador", color: "#FF8C42", icon: "📢" },
  { id: 7, name: "Agente Técnico", color: "#BF360C", icon: "🔧" },
];

export const AgentCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dragStartX = useRef(0);
  const lastScrollTime = useRef(0);

  const getVisibleAgents = useCallback(() => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + agents.length) % agents.length;
      visible.push({ agent: agents[index], position: i, originalIndex: index });
    }
    return visible;
  }, [currentIndex]);

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 100) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev - 1 + agents.length) % agents.length);
      } else {
        setCurrentIndex((prev) => (prev + 1) % agents.length);
      }
      dragStartX.current = e.clientX;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 400) return;
    lastScrollTime.current = now;

    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      if (e.deltaY > 0) {
        setCurrentIndex((prev) => (prev + 1) % agents.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + agents.length) % agents.length);
      }
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setCurrentIndex((prev) => (prev - 1 + agents.length) % agents.length);
    } else if (e.key === 'ArrowRight') {
      setCurrentIndex((prev) => (prev + 1) % agents.length);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  const getCircleStyle = (position: number, isHovered: boolean) => {
    let scale = 1;
    let opacity = 1;
    let translateZ = 0;
    let rotateY = 0;
    let blur = 0;

    if (position === 0) {
      scale = isHovered ? 1.7 : 1.6;
      opacity = 1;
      translateZ = 0;
      rotateY = 0;
    } else if (Math.abs(position) === 1) {
      scale = isHovered ? 0.88 : 0.8;
      opacity = 0.8;
      translateZ = -65;
      rotateY = position > 0 ? 12 : -12;
    } else {
      scale = isHovered ? 0.6 : 0.55;
      opacity = 0.55;
      translateZ = -135;
      rotateY = position > 0 ? 23 : -23;
      blur = 1.5;
    }

    return {
      transform: `translateX(${position * 180}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
      zIndex: position === 0 ? 50 : 40 - Math.abs(position) * 10,
    };
  };

  return (
    <div
      role="listbox"
      aria-label="Carrossel de Agentes Autônomos"
      className="relative w-full h-[280px] flex items-center justify-center overflow-hidden"
      style={{ perspective: '1400px' }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transformStyle: 'preserve-3d',
        }}
      >
        {getVisibleAgents().map(({ agent, position, originalIndex }) => {
          const isHovered = hoveredIndex === originalIndex;
          const style = getCircleStyle(position, isHovered);

          return (
            <motion.div
              key={`${agent.id}-${position}`}
              className="absolute"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={style}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              onMouseEnter={() => setHoveredIndex(originalIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="relative w-32 h-32 rounded-full flex items-center justify-center text-5xl cursor-pointer"
                style={{
                  background: `radial-gradient(circle, ${agent.color}, ${agent.color}DD)`,
                  boxShadow: position === 0
                    ? `0 12px 32px rgba(255, 107, 53, 0.4), 0 0 60px rgba(255, 107, 53, 0.2)`
                    : `0 8px 24px rgba(255, 107, 53, 0.3)`,
                  border: position === 0 ? '2px solid rgba(255, 255, 255, 0.2)' : 'none',
                }}
              >
                {agent.icon}
              </div>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -15 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-lg"
                    style={{
                      background: '#D84315',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      pointerEvents: 'none',
                    }}
                  >
                    {agent.name}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

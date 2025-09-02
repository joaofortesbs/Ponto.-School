import React, { useEffect, useState, useRef } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface AnimatedBackgroundProps {
  className?: string;
  starCount?: number;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  className = '', 
  starCount = 100 
}) => {
  const [stars, setStars] = useState<Star[]>([]);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // Inicializar estrelas apenas uma vez
  useEffect(() => {
    if (isInitializedRef.current) return;

    const initializeStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1,
        });
      }
      setStars(newStars);
      isInitializedRef.current = true;
    };

    initializeStars();
  }, [starCount]);

  // Animação das estrelas
  useEffect(() => {
    if (stars.length === 0) return;

    const animate = () => {
      setStars(prevStars => 
        prevStars.map(star => ({
          ...star,
          y: star.y + star.speed > 100 ? -5 : star.y + star.speed,
        }))
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stars.length]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: -1
      }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;

import React, { useState, useEffect } from 'react';

interface QuadroSlide {
  id: number;
  title: string;
  content: string;
  visual: string;
  audio: string;
}

interface CarrosselQuadrosSalaAulaProps {
  slides: QuadroSlide[];
  onEdit?: (slideId: number) => void;
  onRegenerate?: (slideId: number) => void;
  onDelete?: (slideId: number) => void;
}

export const CarrosselQuadrosSalaAula: React.FC<CarrosselQuadrosSalaAulaProps> = ({
  slides,
  onEdit,
  onRegenerate,
  onDelete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [pauseCount, setPauseCount] = useState(0);

  // Auto-rotação a cada 3 segundos
  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  // Pausa automática por 5 segundos após clique
  useEffect(() => {
    if (pauseCount > 0) {
      setIsAutoPlay(false);
      const timeout = setTimeout(() => {
        setIsAutoPlay(true);
        setPauseCount(0);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [pauseCount]);

  const handleMiniCardClick = (index: number) => {
    setCurrentIndex(index);
    setPauseCount(prev => prev + 1);
  };

  const handleMainCardClick = (index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
      setPauseCount(prev => prev + 1);
    }
  };

  const getCardTransform = (index: number) => {
    const diff = index - currentIndex;
    
    if (diff === 0) {
      // Cartão Ativo (Centro)
      return {
        transform: `perspective(1000px) translateY(0px) translateZ(50px) scale(1.2)`,
        opacity: 1,
        zIndex: 30
      };
    } else if (diff === 1 || (diff === -(slides.length - 1))) {
      // Cartão Seguinte (Inferior)
      return {
        transform: `perspective(1000px) translateY(200px) translateZ(-20px) rotateX(15deg) scale(0.7)`,
        opacity: 0.5,
        zIndex: 20
      };
    } else if (diff === -1 || (diff === slides.length - 1)) {
      // Cartão Anterior (Superior)
      return {
        transform: `perspective(1000px) translateY(-200px) translateZ(-20px) rotateX(-15deg) scale(0.7)`,
        opacity: 0.5,
        zIndex: 20
      };
    } else {
      // Cards ocultos
      return {
        transform: `perspective(1000px) translateY(${diff > 0 ? 400 : -400}px) translateZ(-50px) rotateX(${diff > 0 ? 30 : -30}deg) scale(0.3)`,
        opacity: 0.3,
        zIndex: 1
      };
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500 text-lg">Nenhum quadro disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center p-5 overflow-hidden" style={{ perspective: '1000px' }}>
      <div className="max-w-6xl w-full h-full flex items-center gap-8">
        
        {/* Navegação lateral - Mini cards */}
        <div className="flex flex-col gap-4 items-center justify-center">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => handleMiniCardClick(index)}
              className={`
                w-16 h-12 rounded-lg cursor-pointer transition-all duration-700 ease-out border-2 hover:scale-110 transform
                ${index === currentIndex 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg shadow-blue-300/50 scale-105' 
                  : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 hover:shadow-md hover:bg-gradient-to-br hover:from-blue-50 hover:to-white'
                }
              `}
              title={`Quadro ${index + 1}`}
            >
              <div className={`
                w-full h-full rounded-md flex items-center justify-center relative overflow-hidden
                ${index === currentIndex ? 'animate-pulse' : ''}
              `}>
                <span className={`
                  text-xs font-bold z-10 relative
                  ${index === currentIndex ? 'text-blue-700' : 'text-gray-600'}
                `}>
                  {index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Carrossel principal */}
        <div className="flex-1 h-full flex items-center justify-center relative">
          <div className="relative w-80 h-48" style={{ transformStyle: 'preserve-3d' }}>
            {slides.map((slide, index) => {
              const style = getCardTransform(index);
              const isCenter = index === currentIndex;
              
              return (
                <div
                  key={slide.id}
                  className={`
                    absolute inset-0 w-80 h-48 rounded-xl transition-all duration-700 ease-out cursor-pointer transform-gpu
                    ${isCenter 
                      ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-400 shadow-2xl shadow-blue-300/60' 
                      : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg'
                    }
                  `}
                  style={style}
                  onClick={() => handleMainCardClick(index)}
                  title={`Quadro Interativo ${index + 1}`}
                >
                  {/* Card completamente limpo */}
                  <div className="w-full h-full relative overflow-hidden rounded-xl">
                    
                    {/* Gradiente de fundo sutil */}
                    <div className={`
                      absolute inset-0 rounded-xl transition-all duration-700 ease-out
                      ${isCenter 
                        ? 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent' 
                        : 'bg-gradient-to-br from-gray-500/5 to-transparent'
                      }
                    `}></div>

                    {/* Efeito de brilho para o card ativo */}
                    {isCenter && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-400/20 to-transparent opacity-70"></div>
                    )}

                    {/* Indicador visual sutil no centro para cards não ativos */}
                    {!isCenter && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-3 border-l-blue-600 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-0.5"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarrosselQuadrosSalaAula;

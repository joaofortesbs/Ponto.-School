
import React, { useState, useEffect } from 'react';
import { Edit3, RotateCcw, Trash2 } from 'lucide-react';

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
      // Card central com animação de entrada
      return {
        transform: `perspective(1000px) translateY(0px) translateZ(50px) scale(1.2) rotateY(0deg)`,
        opacity: 1,
        zIndex: 10,
        filter: 'brightness(1.1) saturate(1.2)'
      };
    } else if (diff === 1 || (diff === -(slides.length - 1))) {
      // Card superior com rotação suave
      return {
        transform: `perspective(1000px) translateY(-200px) translateZ(-20px) rotateX(15deg) rotateY(-5deg) scale(0.7)`,
        opacity: 0.5,
        zIndex: 5,
        filter: 'brightness(0.8) saturate(0.8)'
      };
    } else if (diff === -1 || (diff === slides.length - 1)) {
      // Card inferior com rotação suave
      return {
        transform: `perspective(1000px) translateY(200px) translateZ(-20px) rotateX(-15deg) rotateY(5deg) scale(0.7)`,
        opacity: 0.5,
        zIndex: 5,
        filter: 'brightness(0.8) saturate(0.8)'
      };
    } else {
      // Cards ocultos com transição suave
      return {
        transform: `perspective(1000px) translateY(${diff > 0 ? -400 : 400}px) translateZ(-50px) rotateX(${diff > 0 ? 30 : -30}deg) scale(0.3)`,
        opacity: 0,
        zIndex: 1,
        filter: 'brightness(0.5) blur(2px)'
      };
    }
  };

  const renderActionButtons = (slideId: number) => (
    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(slideId);
        }}
        className="w-10 h-10 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
        title="Editar"
      >
        <Edit3 size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRegenerate?.(slideId);
        }}
        className="w-10 h-10 rounded-full bg-green-500/80 hover:bg-green-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
        title="Regenerar"
      >
        <RotateCcw size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(slideId);
        }}
        className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
        title="Excluir"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500 text-lg">Nenhum quadro disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center p-5 overflow-hidden">
      <div className="max-w-6xl w-full h-full flex items-center gap-8">
        
        {/* Navegação lateral - Mini cards */}
        <div className="flex flex-col gap-4 items-center justify-center">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => handleMiniCardClick(index)}
              className={`
                w-16 h-12 rounded-lg cursor-pointer transition-all duration-500 border-2 hover:scale-110 transform
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
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
                )}
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
                    absolute inset-0 w-80 h-48 rounded-xl transition-all duration-1000 ease-in-out group cursor-pointer transform-gpu
                    ${isCenter 
                      ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-400 shadow-2xl shadow-blue-300/60' 
                      : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-2xl hover:border-blue-200'
                    }
                  `}
                  style={{
                    ...style,
                    transition: 'all 1000ms cubic-bezier(0.4, 0, 0.2, 1), filter 1000ms ease-out'
                  }}
                  onClick={() => handleMainCardClick(index)}
                  title={`Quadro Interativo ${index + 1}`}
                >
                  {/* Card completamente limpo */}
                  <div className="w-full h-full relative overflow-hidden">
                    
                    {/* Gradiente de fundo sutil */}
                    <div className={`
                      absolute inset-0 rounded-xl transition-all duration-700 ease-out
                      ${isCenter 
                        ? 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent animate-pulse' 
                        : 'bg-gradient-to-br from-gray-500/5 to-transparent'
                      }
                    `}></div>

                    {/* Efeito de brilho para o card ativo */}
                    {isCenter && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
                    )}

                    {/* Botões de ação (apenas no card central) */}
                    {isCenter && renderActionButtons(slide.id)}

                    {/* Efeito de hover para cards não centrais */}
                    {!isCenter && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-4 border-l-blue-600 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}

                    {/* Animação de partículas para card ativo */}
                    {isCenter && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="absolute top-8 right-6 w-1 h-1 bg-blue-300/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-4 right-4 w-1 h-1 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
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

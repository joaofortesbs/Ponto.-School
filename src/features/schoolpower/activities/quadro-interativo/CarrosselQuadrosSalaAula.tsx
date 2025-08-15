
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

  const getCardTransform = (index: number) => {
    const diff = index - currentIndex;
    
    if (diff === 0) {
      // Card central
      return {
        transform: `perspective(1000px) translateY(0px) translateZ(50px) scale(1.2)`,
        opacity: 1,
        zIndex: 10
      };
    } else if (diff === 1 || (diff === -(slides.length - 1))) {
      // Card superior
      return {
        transform: `perspective(1000px) translateY(-200px) translateZ(-20px) rotateX(15deg) scale(0.7)`,
        opacity: 0.6,
        zIndex: 5
      };
    } else if (diff === -1 || (diff === slides.length - 1)) {
      // Card inferior
      return {
        transform: `perspective(1000px) translateY(200px) translateZ(-20px) rotateX(-15deg) scale(0.7)`,
        opacity: 0.6,
        zIndex: 5
      };
    } else {
      // Cards ocultos
      return {
        transform: `perspective(1000px) translateY(${diff > 0 ? -400 : 400}px) translateZ(-50px) scale(0.5)`,
        opacity: 0,
        zIndex: 1
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
        className="w-10 h-10 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <Edit3 size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRegenerate?.(slideId);
        }}
        className="w-10 h-10 rounded-full bg-green-500/80 hover:bg-green-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <RotateCcw size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(slideId);
        }}
        className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
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
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center p-5 overflow-hidden">
      <div className="max-w-4xl w-full h-full flex items-center gap-8">
        
        {/* Navegação lateral - Mini cards */}
        <div className="flex flex-col gap-4 items-center justify-center">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => handleMiniCardClick(index)}
              className={`
                w-16 h-12 rounded-lg cursor-pointer transition-all duration-300 border-2
                ${index === currentIndex 
                  ? 'border-blue-500 bg-blue-100 shadow-lg shadow-blue-200' 
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                }
              `}
            >
              <div className="w-full h-full rounded-md bg-gradient-to-br from-white to-gray-100"></div>
            </div>
          ))}
        </div>

        {/* Carrossel principal */}
        <div className="flex-1 h-full flex items-center justify-center relative">
          <div className="relative w-80 h-48 preserve-3d">
            {slides.map((slide, index) => {
              const style = getCardTransform(index);
              const isCenter = index === currentIndex;
              
              return (
                <div
                  key={slide.id}
                  className={`
                    absolute inset-0 w-80 h-48 rounded-xl transition-all duration-700 ease-out group
                    ${isCenter 
                      ? 'bg-gradient-to-br from-blue-50 to-white border-2 border-blue-400 shadow-2xl shadow-blue-200' 
                      : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg'
                    }
                  `}
                  style={style}
                  onClick={() => handleMiniCardClick(index)}
                >
                  {/* Conteúdo do card */}
                  <div className="w-full h-full p-6 flex flex-col justify-center items-center relative overflow-hidden">
                    
                    {/* Gradiente de fundo sutil */}
                    <div className={`
                      absolute inset-0 rounded-xl 
                      ${isCenter 
                        ? 'bg-gradient-to-br from-blue-500/5 to-transparent' 
                        : 'bg-gradient-to-br from-gray-500/5 to-transparent'
                      }
                    `}></div>

                    {/* Placeholder visual limpo */}
                    <div className="relative z-10 w-full h-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner"></div>

                    {/* Botões de ação (apenas no card central) */}
                    {isCenter && renderActionButtons(slide.id)}
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

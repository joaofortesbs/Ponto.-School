
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
                w-16 h-12 rounded-lg cursor-pointer transition-all duration-300 border-2 hover:scale-105
                ${index === currentIndex 
                  ? 'border-blue-500 bg-blue-100 shadow-lg shadow-blue-200' 
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                }
              `}
              title={`Slide ${index + 1}: ${slide.title}`}
            >
              <div className="w-full h-full rounded-md bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">{index + 1}</span>
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
                    absolute inset-0 w-80 h-48 rounded-xl transition-all duration-700 ease-out group cursor-pointer
                    ${isCenter 
                      ? 'bg-gradient-to-br from-blue-50 to-white border-2 border-blue-400 shadow-2xl shadow-blue-200' 
                      : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl'
                    }
                  `}
                  style={style}
                  onClick={() => handleMainCardClick(index)}
                  title={slide.title}
                >
                  {/* Conteúdo do card */}
                  <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Gradiente de fundo sutil */}
                    <div className={`
                      absolute inset-0 rounded-xl 
                      ${isCenter 
                        ? 'bg-gradient-to-br from-blue-500/5 to-transparent' 
                        : 'bg-gradient-to-br from-gray-500/5 to-transparent'
                      }
                    `}></div>

                    {/* Número do slide */}
                    <div className="relative z-10 flex justify-between items-start">
                      <span className={`
                        text-xs font-bold px-2 py-1 rounded-full
                        ${isCenter 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {index + 1}
                      </span>
                      {isCenter && (
                        <div className="text-xs text-blue-600 font-medium">
                          ATIVO
                        </div>
                      )}
                    </div>

                    {/* Área de conteúdo visual */}
                    <div className="relative z-10 flex-1 mt-2 mb-4">
                      <div className={`
                        w-full h-full rounded-lg shadow-inner flex items-center justify-center
                        ${isCenter 
                          ? 'bg-gradient-to-br from-blue-100 to-blue-200' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                        }
                      `}>
                        <div className="text-center">
                          <div className={`
                            w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center
                            ${isCenter 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-400 text-white'
                            }
                          `}>
                            📊
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            Slide {index + 1}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de interatividade */}
                    <div className="relative z-10 text-center">
                      <div className={`
                        text-xs px-2 py-1 rounded-full inline-block
                        ${isCenter 
                          ? 'bg-blue-500/20 text-blue-700' 
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        Clique para visualizar
                      </div>
                    </div>

                    {/* Botões de ação (apenas no card central) */}
                    {isCenter && renderActionButtons(slide.id)}

                    {/* Efeito de hover para cards não centrais */}
                    {!isCenter && (
                      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">Clique para centralizar</span>
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

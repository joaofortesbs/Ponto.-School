
import React, { useState, useEffect } from 'react';
import { Edit2, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuadroContent {
  id: string;
  type: 'texto' | 'atividade';
  content: string;
  title?: string;
}

interface CarrosselQuadrosSalaAulaProps {
  quadros: QuadroContent[];
  onEditQuadro: (id: string) => void;
  onRegenerateQuadro: (id: string) => void;
  onDeleteQuadro: (id: string) => void;
  autoRotate?: boolean;
}

const CarrosselQuadrosSalaAula: React.FC<CarrosselQuadrosSalaAulaProps> = ({
  quadros = [],
  onEditQuadro,
  onRegenerateQuadro,
  onDeleteQuadro,
  autoRotate = true
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [pauseTimer, setPauseTimer] = useState<NodeJS.Timeout | null>(null);

  // Garantir que temos pelo menos 3 quadros
  const defaultQuadros: QuadroContent[] = [
    {
      id: 'quadro-1',
      type: 'texto',
      content: 'Conteúdo do primeiro quadro será gerado pela IA',
      title: 'Quadro Principal'
    },
    {
      id: 'quadro-2',
      type: 'atividade',
      content: 'Atividade interativa será inserida aqui',
      title: 'Atividade Prática'
    },
    {
      id: 'quadro-3',
      type: 'texto',
      content: 'Conteúdo do terceiro quadro será gerado pela IA',
      title: 'Quadro Complementar'
    }
  ];

  const quadrosData = quadros.length > 0 ? quadros : defaultQuadros;

  // Auto-rotação
  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % quadrosData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoRotating, quadrosData.length]);

  // Pausar auto-rotação temporariamente
  const pauseAutoRotation = () => {
    setIsAutoRotating(false);
    if (pauseTimer) clearTimeout(pauseTimer);
    
    const timer = setTimeout(() => {
      setIsAutoRotating(true);
    }, 5000);
    
    setPauseTimer(timer);
  };

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
    pauseAutoRotation();
  };

  const getCardStyle = (index: number) => {
    const isActive = index === activeIndex;
    const offset = index - activeIndex;
    
    if (isActive) {
      return {
        transform: 'scale(1.2) translateZ(50px) rotateX(0deg)',
        zIndex: 10,
        opacity: 1,
        filter: 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.3))'
      };
    }
    
    const translateY = offset * 200;
    const rotateX = Math.abs(offset) > 0 ? (offset > 0 ? 15 : -15) : 0;
    
    return {
      transform: `scale(0.7) translateY(${translateY}px) translateZ(-20px) rotateX(${rotateX}deg)`,
      zIndex: 5 - Math.abs(offset),
      opacity: 0.6,
      filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))'
    };
  };

  const getMiniCardStyle = (index: number) => {
    const isActive = index === activeIndex;
    return {
      opacity: isActive ? 1 : 0.6,
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
      borderColor: isActive ? '#3b82f6' : '#e5e7eb'
    };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-screen bg-gray-100 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        
        {/* Navegação lateral com mini-cartões */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 space-y-4">
          {quadrosData.map((quadro, index) => (
            <button
              key={quadro.id}
              onClick={() => handleCardClick(index)}
              className="block w-16 h-12 bg-white rounded-lg border-2 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={getMiniCardStyle(index)}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-md flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </button>
          ))}
        </div>

        {/* Carrossel principal */}
        <div className="relative" style={{ perspective: '1000px' }}>
          <div className="relative w-80 h-48">
            {quadrosData.map((quadro, index) => (
              <div
                key={quadro.id}
                className="absolute inset-0 cursor-pointer transition-all duration-700 ease-out"
                style={getCardStyle(index)}
                onClick={() => handleCardClick(index)}
              >
                {/* Card do quadro */}
                <div className="w-80 h-48 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {/* Gradiente sutil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-50"></div>
                  
                  {/* Conteúdo do quadro (sem texto, apenas visual) */}
                  <div className="relative w-full h-full p-4">
                    {quadro.type === 'texto' ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 flex items-center justify-center">
                        <div className="w-12 h-12 bg-blue-200 rounded-full opacity-30"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 flex items-center justify-center">
                        <div className="w-16 h-10 bg-green-200 rounded opacity-30"></div>
                      </div>
                    )}
                  </div>

                  {/* Botões de ação (apenas no card ativo) */}
                  {index === activeIndex && (
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-white/80 hover:bg-blue-100 rounded-full shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditQuadro(quadro.id);
                        }}
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-white/80 hover:bg-green-100 rounded-full shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegenerateQuadro(quadro.id);
                        }}
                      >
                        <RotateCcw className="w-4 h-4 text-green-600" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-white/80 hover:bg-red-100 rounded-full shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuadro(quadro.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}

                  {/* Borda ativa */}
                  {index === activeIndex && (
                    <div className="absolute inset-0 border-2 border-blue-400 rounded-xl pointer-events-none"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de status */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {quadrosData.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Auto-rotation indicator */}
      {isAutoRotating && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Auto</span>
        </div>
      )}
    </div>
  );
};

export default CarrosselQuadrosSalaAula;

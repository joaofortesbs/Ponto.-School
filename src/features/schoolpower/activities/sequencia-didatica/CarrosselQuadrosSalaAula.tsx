
import React, { useState, useEffect } from 'react';
import { Edit, RotateCw, Trash2 } from 'lucide-react';

interface QuadroSalaAula {
  id: string;
  imageUrl?: string;
  backgroundColor: string;
  isActive: boolean;
}

interface CarrosselQuadrosSalaAulaProps {
  quadros?: QuadroSalaAula[];
  onEdit?: (quadroId: string) => void;
  onRegenerate?: (quadroId: string) => void;
  onDelete?: (quadroId: string) => void;
  onQuadroSelect?: (quadroId: string) => void;
}

const CarrosselQuadrosSalaAula: React.FC<CarrosselQuadrosSalaAulaProps> = ({
  quadros = [],
  onEdit,
  onRegenerate,
  onDelete,
  onQuadroSelect
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [pauseAutoRotation, setPauseAutoRotation] = useState(false);

  // Dados padrão caso não sejam fornecidos quadros
  const defaultQuadros: QuadroSalaAula[] = [
    {
      id: '1',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      isActive: true
    },
    {
      id: '2', 
      backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      isActive: false
    },
    {
      id: '3',
      backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      isActive: false
    }
  ];

  const quadrosData = quadros.length > 0 ? quadros : defaultQuadros;

  // Auto-rotação a cada 3 segundos
  useEffect(() => {
    if (!isAutoRotating || pauseAutoRotation) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === quadrosData.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoRotating, pauseAutoRotation, quadrosData.length]);

  // Pausa automática ao clicar
  const handleCardClick = (index: number) => {
    setCurrentIndex(index);
    setPauseAutoRotation(true);
    onQuadroSelect?.(quadrosData[index].id);
    
    // Resume auto-rotation after 5 seconds
    setTimeout(() => {
      setPauseAutoRotation(false);
    }, 5000);
  };

  const handleMiniCardClick = (index: number) => {
    handleCardClick(index);
  };

  const getCardStyle = (index: number) => {
    const isCurrent = index === currentIndex;
    const distance = Math.abs(index - currentIndex);
    
    if (isCurrent) {
      return {
        transform: 'translateY(0px) translateZ(50px) rotateX(0deg) scale(1.2)',
        opacity: 1,
        zIndex: 10
      };
    } else if (distance === 1) {
      const direction = index > currentIndex ? 1 : -1;
      return {
        transform: `translateY(${direction * 200}px) translateZ(-20px) rotateX(${direction * 15}deg) scale(0.7)`,
        opacity: 0.6,
        zIndex: 5
      };
    } else {
      const direction = index > currentIndex ? 1 : -1;
      return {
        transform: `translateY(${direction * 400}px) translateZ(-40px) rotateX(${direction * 25}deg) scale(0.5)`,
        opacity: 0.3,
        zIndex: 1
      };
    }
  };

  const currentQuadro = quadrosData[currentIndex];

  return (
    <div className="relative w-full max-w-4xl h-screen bg-gray-100 overflow-hidden mx-auto">
      {/* Container principal com perspectiva */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        {/* Navegação lateral esquerda - Mini cards */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 space-y-4">
          {quadrosData.map((quadro, index) => (
            <div
              key={quadro.id}
              className={`w-16 h-12 rounded-lg cursor-pointer transition-all duration-300 shadow-lg ${
                index === currentIndex 
                  ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' 
                  : 'hover:scale-105'
              }`}
              style={{
                background: quadro.backgroundColor,
                opacity: index === currentIndex ? 1 : 0.7
              }}
              onClick={() => handleMiniCardClick(index)}
            />
          ))}
        </div>

        {/* Carrossel principal */}
        <div className="relative w-80 h-48 flex items-center justify-center">
          {quadrosData.map((quadro, index) => (
            <div
              key={quadro.id}
              className="absolute w-80 h-48 rounded-xl cursor-pointer transition-all duration-700 ease-out shadow-lg"
              style={{
                ...getCardStyle(index),
                background: quadro.backgroundColor,
                border: index === currentIndex ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                backgroundColor: index === currentIndex ? 'rgba(219, 234, 254, 0.3)' : 'white',
                backdropFilter: 'blur(10px)',
                boxShadow: index === currentIndex 
                  ? '0 25px 50px -12px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                  : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => handleCardClick(index)}
            >
              {/* Conteúdo do quadro */}
              <div className="w-full h-full rounded-xl relative overflow-hidden">
                {quadro.imageUrl ? (
                  <img 
                    src={quadro.imageUrl} 
                    alt={`Quadro ${quadro.id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{ background: quadro.backgroundColor }}
                  />
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Botões de ação no card central */}
        {currentQuadro && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 space-y-4">
            {/* Botão Editar */}
            <button
              onClick={() => onEdit?.(currentQuadro.id)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 
                         flex items-center justify-center text-blue-600 hover:bg-blue-100/30 
                         hover:text-blue-700 transition-all duration-300 hover:scale-110 
                         shadow-lg hover:shadow-xl"
              title="Editar quadro"
            >
              <Edit size={20} />
            </button>

            {/* Botão Regenerar */}
            <button
              onClick={() => onRegenerate?.(currentQuadro.id)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 
                         flex items-center justify-center text-green-600 hover:bg-green-100/30 
                         hover:text-green-700 transition-all duration-300 hover:scale-110 
                         shadow-lg hover:shadow-xl"
              title="Regenerar quadro"
            >
              <RotateCw size={20} />
            </button>

            {/* Botão Excluir */}
            <button
              onClick={() => onDelete?.(currentQuadro.id)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 
                         flex items-center justify-center text-red-600 hover:bg-red-100/30 
                         hover:text-red-700 transition-all duration-300 hover:scale-110 
                         shadow-lg hover:shadow-xl"
              title="Excluir quadro"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}

        {/* Indicador de posição */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {quadrosData.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Controles de auto-rotação */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
              isAutoRotating 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isAutoRotating ? 'Auto' : 'Manual'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarrosselQuadrosSalaAula;

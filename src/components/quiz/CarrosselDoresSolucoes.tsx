
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarrosselDoresSolucoesProps {
  className?: string;
}

export const CarrosselDoresSolucoes: React.FC<CarrosselDoresSolucoesProps> = ({ className = "" }) => {
  const doresSolucoes = [
    "Reduzir tempo de planejamento",
    "Aulas mais engajadoras",
    "Menos estresse docente",
    "Personalização de ensino",
    "Avaliações inteligentes",
    "Gestão eficiente de turmas",
    "Economia de recursos",
    "Maior produtividade pedagógica"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCards] = useState(4); // Número de cards visíveis

  // Auto-rotação a cada 3 segundos
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === doresSolucoes.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isPaused, doresSolucoes.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === doresSolucoes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? doresSolucoes.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % doresSolucoes.length;
      cards.push({
        content: doresSolucoes[index],
        index: index
      });
    }
    return cards;
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Container do Carrossel */}
      <div 
        className="relative bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl py-8 px-6 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Setas de Navegação */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 p-2 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 p-2 rounded-full transition-all duration-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Container dos Cards */}
        <div className="flex justify-center items-center gap-4 h-24">
          <AnimatePresence mode="wait">
            {getVisibleCards().map((card, i) => (
              <motion.div
                key={`${card.index}-${currentIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ 
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="flex-1 min-w-0 max-w-xs"
              >
                <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/30 backdrop-blur-sm border border-orange-400/30 rounded-xl p-4 h-full flex items-center justify-center">
                  <p className="text-white font-bold text-center text-sm lg:text-base leading-tight">
                    {card.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Efeito de brilho de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      </div>

      {/* Indicadores */}
      <div className="flex justify-center mt-4 space-x-2">
        {doresSolucoes.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-orange-400 w-6' 
                : 'bg-orange-400/30 hover:bg-orange-400/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarrosselDoresSolucoes;

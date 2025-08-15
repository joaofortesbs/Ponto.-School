import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface ContentData {
  card1?: {
    titulo: string;
    conteudo: string;
  };
  card2?: {
    titulo: string;
    conteudo: string;
  };
}

interface CarrosselQuadrosSalaAulaProps {
  contentData?: ContentData;
}

export function CarrosselQuadrosSalaAula({ contentData }: CarrosselQuadrosSalaAulaProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Criar array de cards baseado no contentData
  const cards = [];
  if (contentData?.card1) {
    cards.push(contentData.card1);
  }
  if (contentData?.card2) {
    cards.push(contentData.card2);
  }

  // Se não há cards, mostrar cards padrão
  if (cards.length === 0) {
    cards.push(
      { titulo: "Introdução", conteudo: "Conteúdo introdutório sobre o tema da aula." },
      { titulo: "Conceitos", conteudo: "Principais conceitos e informações importantes." }
    );
  }

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  const getCardStyles = (index: number) => {
    const isActive = index === activeIndex;
    const isPrevious = index < activeIndex;
    const isNext = index > activeIndex;

    let transform = '';
    let opacity = 0.3;
    let zIndex = 1;

    if (isActive) {
      transform = 'translateY(0px) translateZ(50px) scale(1.2)';
      opacity = 1.0;
      zIndex = 30;
    } else if (isPrevious) {
      transform = 'translateY(-200px) translateZ(-20px) rotateX(-15deg) scale(0.7)';
      opacity = 0.7;
      zIndex = 10;
    } else if (isNext) {
      transform = 'translateY(200px) translateZ(-20px) rotateX(15deg) scale(0.7)';
      opacity = 0.7;
      zIndex = 10;
    }

    return {
      transform,
      opacity,
      zIndex,
      transition: 'all 0.7s ease-out',
    };
  };

  return (
    <div 
      className="relative w-full h-[500px] flex items-center justify-center"
      style={{ perspective: '1000px' }}
    >
      {cards.map((card, index) => (
        <Card
          key={index}
          className="absolute w-80 h-60 cursor-pointer border-2 border-orange-200 dark:border-orange-700"
          style={getCardStyles(index)}
          onClick={() => handleCardClick(index)}
        >
          <div className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {card.titulo}
            </h3>
            <div className="flex-1 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {card.conteudo}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default CarrosselQuadrosSalaAula;

import React from 'react';

export default function StackedCardsLeft() {
  return (
    <div className="relative w-80 h-[450px] p-4">
      {/* Container for cards */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Top card - "Atividades para ENEM" */}
        <div 
          className="group absolute rounded-[40px] shadow-lg overflow-hidden transform rotate-12 z-10 hover:z-30 hover:scale-110 hover:rotate-6 cursor-pointer"
          style={{
            width: '240px',
            height: '180px',
            top: '0px',
            right: '17px',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FFD05A, #FF6800, #FF5100)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          <div className="relative w-full h-full">
            <img 
              src="/Atividades-ENEM.jpg" 
              alt="Atividades para ENEM" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              <h3 className="text-lg font-bold text-white text-center leading-tight drop-shadow-lg">
                Atividades para<br />ENEM
              </h3>
            </div>
          </div>
        </div>
        
        {/* Bottom card - "Planos de Aula" */}
        <div 
          className="group absolute rounded-[40px] shadow-lg overflow-hidden transform -rotate-12 z-20 hover:z-30 hover:scale-110 hover:-rotate-6 cursor-pointer"
          style={{
            width: '240px',
            height: '180px',
            bottom: '0px',
            left: '10px',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FFD05A, #FF6800, #FF5100)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          <div className="relative w-full h-full">
            <img 
              src="/card-plano-aula.webp" 
              alt="Planos de Aula" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              <h3 className="text-lg font-bold text-white text-center leading-tight drop-shadow-lg">
                Planos de<br />Aula
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

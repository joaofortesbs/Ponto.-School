
import React from 'react';

export default function StackedCardsLeft() {
  return (
    <div className="relative w-80 h-96 p-4">
      {/* Container for cards */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Top card - "Atividades para ENEM" */}
        <div 
          className="absolute bg-orange-50 border-4 border-orange-500 rounded-[40px] shadow-lg overflow-hidden transform rotate-12 z-10 hover:z-30 hover:scale-110 hover:rotate-6 cursor-pointer"
          style={{
            width: '240px',
            height: '180px',
            top: '10px',
            right: '10px',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div className="relative w-full h-full">
            <img 
              src="/Atividades-ENEM.jpg" 
              alt="Atividades para ENEM" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center p-4">
              <h3 className="text-lg font-bold text-white text-center leading-tight drop-shadow-lg">
                Atividades para<br />ENEM
              </h3>
            </div>
          </div>
        </div>
        
        {/* Bottom card - "Planos de Aula" */}
        <div 
          className="absolute bg-orange-50 border-4 border-orange-500 rounded-[40px] shadow-lg flex items-center justify-center p-6 transform -rotate-12 z-20 hover:z-30 hover:scale-110 hover:-rotate-6 cursor-pointer"
          style={{
            width: '240px',
            height: '180px',
            bottom: '10px',
            left: '10px',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <h3 className="text-lg font-bold text-gray-800 text-center leading-tight">
            Planos de<br />Aula
          </h3>
        </div>
      </div>
    </div>
  );
}

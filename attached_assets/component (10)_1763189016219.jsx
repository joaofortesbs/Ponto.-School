import React from 'react';

export default function OverlappingCards() {
  return (
    <div className="relative w-80 h-96 p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-300 to-orange-200 rounded-lg"></div>
      
      {/* Container for cards */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Top card - "Atividades para ENEM" */}
        <div 
          className="absolute bg-orange-50 border-4 border-orange-500 rounded-[40px] shadow-lg flex items-center justify-center p-6 transform rotate-12 z-10 hover:z-30 hover:scale-110 hover:rotate-6 transition-all duration-300 hover:shadow-xl cursor-pointer"
          style={{
            width: '240px',
            height: '180px',
            top: '10px',
            right: '10px'
          }}
        >
          <h3 className="text-lg font-bold text-gray-800 text-center leading-tight">
            Atividades para<br />ENEM
          </h3>
        </div>
        
        {/* Bottom card - "Planos de Aula" */}
        <div 
          className="absolute bg-orange-50 border-4 border-orange-500 rounded-[40px] shadow-lg flex items-center justify-center p-6 transform -rotate-12 z-20 hover:z-30 hover:scale-110 hover:-rotate-6 transition-all duration-300 hover:shadow-xl cursor-pointer"
          style={{
            width: '240px',
            height: '180px',
            bottom: '10px',
            left: '10px'
          }}
        >
          <h3 className="text-lg font-bold text-gray-800 text-center leading-tight">
            Planos de<br />Aula
          </h3>
        </div>
      </div>
      
      {/* Mobile responsive adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          .relative.w-80 {
            width: 280px;
            height: 320px;
          }
        }
        
        @media (max-width: 480px) {
          .relative.w-80 {
            width: 240px;
            height: 280px;
          }
        }
      `}</style>
    </div>
  );
}
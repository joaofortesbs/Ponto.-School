
import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const GraduationBadge = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div 
        className="relative w-32 h-32 rounded-full border-8 border-orange-500 bg-orange-600 bg-opacity-20 flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <RotateCcw 
          size={80} 
          className="text-orange-500"
          strokeWidth={2.5} 
        />
        
        {showTooltip && (
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl shadow-2xl text-lg font-medium whitespace-nowrap z-10 animate-fade-in border-2 border-orange-400">
            Trocar para administradores
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-orange-500"></div>
          </div>
        )}
        
        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px) translateX(-50%);
            }
            to {
              opacity: 1;
              transform: translateY(0) translateX(-50%);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default GraduationBadge;

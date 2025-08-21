import React, { useState, useEffect } from 'react';

export default function FloatingCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  useEffect(() => {
    // Animação de entrada do card
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
      {/* Checklist - Benefícios vs Problemas */}
      <div 
        className={`bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl transform transition-all duration-1000 ease-out ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-10 opacity-0 scale-95'
        }`}
        style={{
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'
        }}
      >
        {/* Logo centralizado */}
        <div className="flex justify-center mb-6">
          <img 
            src="Q-ClGT0pocfiQwR2UJLIo" 
            alt="Logo" 
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
        </div>
        
        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedPlan === 'monthly'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedPlan === 'yearly'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Anual
            </button>
          </div>
        </div>
        
        {/* Preço */}
        <div className="text-center mb-6">
          <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-1">
            R${selectedPlan === 'monthly' ? '37,90' : '397,90'}
          </div>
          <div className="text-gray-600 text-sm">
            {selectedPlan === 'monthly' ? 'Por mês' : 'Por ano'}
          </div>
        </div>
        {/* Checklist */}
        <div className="space-y-3 sm:space-y-4">
          {[
            { text: 'Criação de +130 atividades', type: 'positive' },
            { text: 'Personalização para seu perfil', type: 'positive' },
            { text: 'Personalização para sua escola', type: 'positive' },
            { text: 'Transforme suas atividades em trilhas', type: 'positive' },
            { text: 'Atividades gamificadas para seus alunos', type: 'positive' },
            { text: 'Exporte e apresente tudo', type: 'positive' }
          ].map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 transform transition-all duration-500 ease-out ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
              style={{ transitionDelay: `${800 + index * 200}ms` }}
            >
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${
                item.type === 'positive' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400' 
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}>
                {item.type === 'positive' ? (
                  <svg 
                    className="w-2 h-2 sm:w-3 sm:h-3 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                ) : (
                  <svg 
                    className="w-2 h-2 sm:w-3 sm:h-3 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
              </div>
              <span className={`font-medium text-sm sm:text-base ${
                item.type === 'positive' ? 'text-gray-700' : 'text-gray-600 line-through'
              }`}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
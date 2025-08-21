import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function FloatingCard() {
  const [data, setData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada do card
    setTimeout(() => setIsVisible(true), 100);

    // Dados iniciais
    const initialData = [
      { name: 'Jul', value: 18 },
      { name: 'Ago', value: 22 },
      { name: 'Set', value: 45 },
      { name: 'Out', value: 48 },
      { name: 'Nov', value: 68 },
      { name: 'Dez', value: 78 }
    ];

    // Animar crescimento dos dados
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < initialData.length) {
        setData(initialData.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
      <div 
        className={`bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl h-auto min-h-60 sm:min-h-80 transform transition-all duration-1000 ease-out ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-10 opacity-0 scale-95'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)'
        }}
      >
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 text-center sm:text-left">
            Seja 15x mais produtivo com IA!
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
            Transforme sua carreira em minutos!
          </p>
        </div>

        <div className="h-32 sm:h-40 lg:h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                className="text-xs text-gray-400"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                hide
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#gradient)"
                strokeWidth={3}
                dot={{
                  fill: '#F97316',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  stroke: '#F97316',
                  strokeWidth: 2,
                  fill: '#ffffff'
                }}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FB923C" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
          
          {data.length >= 2 && (
            <div 
              className="absolute text-xs sm:text-xs font-semibold text-gray-600 bg-white px-1 sm:px-2 py-1 rounded shadow-sm transform -translate-x-1/2 -translate-y-6 sm:-translate-y-8"
              style={{
                left: `${5 + (1 / 5) * 80}%`,  // Posição do ponto de Agosto (segundo ponto)
                top: `${100 - (22 / 78) * 70}%`     // Altura baseada no valor 22
              }}
            >
              Você
            </div>
          )}
          
          {data.length >= 6 && (
            <div 
              className="absolute text-xs sm:text-xs font-semibold text-gray-600 bg-white px-1 sm:px-2 py-1 rounded shadow-sm transform -translate-x-1/2 -translate-y-6 sm:-translate-y-8"
              style={{
                left: `${20 + (5 / 5) * 80}%`,      // Posição do ponto de Dezembro (último ponto)
                top: `${100 - (78 / 78) * 70}%`       // Altura baseada no valor 78
              }}
            >
              Ponto. School
            </div>
          )}

        </div>


      </div>
      
      {/* Checklist - Benefícios vs Problemas */}
      <div 
        className={`bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mt-4 sm:mt-6 transform transition-all duration-1000 ease-out delay-500 ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-10 opacity-0 scale-95'
        }`}
        style={{
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'
        }}
      >
        <div className="space-y-3 sm:space-y-4">
          {[
            { text: '+15 horas por semana', type: 'positive' },
            { text: 'Alunos engajados', type: 'positive' },
            { text: 'Mais reputação na profissão', type: 'positive' },
            { text: 'Materiais personalizados', type: 'positive' },
            { text: 'Dor de cabeça', type: 'negative' },
            { text: 'Alunos desmotivados', type: 'negative' },
            { text: 'Falta de criatividade', type: 'negative' }
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
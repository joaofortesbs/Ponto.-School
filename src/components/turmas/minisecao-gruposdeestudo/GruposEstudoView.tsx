
import React from "react";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full ${className}`} style={{ 
      contain: 'content',
      overflowY: 'auto',
      overflowX: 'hidden',
      minHeight: '200px'
    }}>
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-[#FF6B00]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Seção em Reconstrução
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Esta seção está sendo reformulada para oferecer uma experiência ainda melhor. 
            Em breve, novidades incríveis estarão disponíveis!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GruposEstudoView;

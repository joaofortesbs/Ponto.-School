
import React from "react";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full ${className} card-container`} style={{ 
      contain: 'content',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Seção em construção</h3>
          <p className="text-sm">Esta seção está sendo preparada para você</p>
        </div>
      </div>
    </div>
  );
};

export default GruposEstudoView;

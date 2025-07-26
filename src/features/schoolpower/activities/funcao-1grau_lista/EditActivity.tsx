
import React from 'react';

interface EditActivityProps {
  [key: string]: any;
}

const EditActivity: React.FC<EditActivityProps> = (props) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Editor - Lista de Exercícios Função 1º Grau
        </h3>
        <p className="text-gray-500">
          Este componente está em desenvolvimento
        </p>
      </div>
    </div>
  );
};

export default EditActivity;

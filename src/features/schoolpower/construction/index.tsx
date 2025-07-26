import React from 'react';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

interface ConstructionInterfaceProps {
  approvedActivities: ActionPlanItem[];
}

export const ConstructionInterface: React.FC<ConstructionInterfaceProps> = ({ 
  approvedActivities 
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🚧 Interface de Construção
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Esta seção está sendo desenvolvida para construir as atividades aprovadas.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {approvedActivities.length} atividade{approvedActivities.length !== 1 ? 's' : ''} aprovada{approvedActivities.length !== 1 ? 's' : ''} para construção
          </p>
        </div>
      </div>
    </div>
  );
};
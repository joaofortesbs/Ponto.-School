
import React from 'react';
import { isActivityEligibleForTrilhas, getTrilhasBadgeProps, trilhasActivitiesIds } from '../data/trilhasActivitiesConfig';

interface TrilhasDebugPanelProps {
  activities: Array<{ id: string; title: string }>;
  isVisible?: boolean;
}

export const TrilhasDebugPanel: React.FC<TrilhasDebugPanelProps> = ({ 
  activities, 
  isVisible = false 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 max-w-md max-h-96 overflow-y-auto">
      <h3 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">
        🔍 Debug: Sistema Trilhas
      </h3>
      
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        Total de IDs de Trilhas: {trilhasActivitiesIds.length}
      </div>

      <div className="space-y-2">
        {activities.map((activity) => {
          const isEligible = isActivityEligibleForTrilhas(activity.id);
          const badgeProps = getTrilhasBadgeProps(activity.id);
          
          return (
            <div 
              key={activity.id}
              className={`p-2 rounded border text-xs ${
                isEligible 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {activity.title}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                ID: {activity.id}
              </div>
              <div className={`font-medium ${
                isEligible 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                Trilhas: {isEligible ? '✅ Elegível' : '❌ Não elegível'}
              </div>
              {badgeProps.showBadge && (
                <div 
                  className="inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1"
                  style={{
                    backgroundColor: badgeProps.badgeColor,
                    color: badgeProps.badgeTextColor
                  }}
                >
                  {badgeProps.badgeText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

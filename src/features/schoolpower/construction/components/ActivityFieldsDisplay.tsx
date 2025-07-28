
import React from 'react';
import { formatActivityFieldsForDisplay, ActivityFieldData } from '../../services/activityFieldsService';
import { motion } from 'framer-motion';

interface ActivityFieldsDisplayProps {
  activityId: string;
  fields: ActivityFieldData;
  compact?: boolean;
  maxFields?: number;
}

export function ActivityFieldsDisplay({ 
  activityId, 
  fields, 
  compact = false, 
  maxFields = 6 
}: ActivityFieldsDisplayProps) {
  const formattedFields = formatActivityFieldsForDisplay(activityId, fields);
  const displayFields = formattedFields.slice(0, maxFields);
  const remainingCount = formattedFields.length - maxFields;

  if (formattedFields.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${compact ? 'space-y-1' : 'space-y-2'}`}
    >
      <div className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-[#FF6B00] mb-2 flex items-center gap-1`}>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        Campos Gerados pela IA
      </div>

      <div className={`space-y-1 ${compact ? 'max-h-32' : 'max-h-48'} overflow-y-auto scrollbar-thin scrollbar-thumb-[#FF6B00]/20 scrollbar-track-transparent`}>
        {displayFields.map((field, index) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={`${compact ? 'text-xs' : 'text-sm'} flex flex-col gap-1`}
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {field.label}:
            </span>
            <span className="text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-[#FF6B00]/20">
              {compact && field.value.length > 80 
                ? `${field.value.substring(0, 80)}...` 
                : field.value}
            </span>
          </motion.div>
        ))}

        {remainingCount > 0 && (
          <div className={`${compact ? 'text-xs' : 'text-sm'} text-[#FF6B00] font-medium pt-1`}>
            +{remainingCount} campos adicionais
          </div>
        )}
      </div>
    </motion.div>
  );
}

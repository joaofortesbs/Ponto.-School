import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Share2, Clock, CheckCircle2, PenTool } from 'lucide-react';
import { ProgressCircle } from './ProgressCircle';
import { ConstructionActivityProps } from './types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ConstructionCard({
  id,
  title,
  description,
  progress,
  type,
  status,
  onView,
  onShare,
  onEdit
}: ConstructionActivityProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
      case 'in_progress':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(id);
  };


  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-lg ${getStatusColor()}`}
      >
        {/* Preview Area (65%) */}
        <div className="relative mb-4 h-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          {/* Status Icon */}
          <div className="absolute top-2 right-2 z-10">
            {getStatusIcon()}
          </div>

          {/* Construction Preview Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-[#FF6B00]/20 to-[#D65A00]/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Pré-visualização
              </p>
            </div>
          </div>

          {/* Progress Circle Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20">
            <ProgressCircle progress={progress} size={50} />
          </div>

          {/* Shimmer Effect for Loading */}
          {progress < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
          )}
        </div>

        {/* Content Area (35%) */}
        <div className="space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEditClick}
                    className="h-7 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
                  >
                    <PenTool className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar materiais</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView?.(id)}
                    className="h-7 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visualizar atividade</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShare?.(id)}
                    className="h-7 px-2 text-xs text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartilhar atividade</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Progress Badge */}
            <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {progress === 0 ? 'Pendente' : progress === 100 ? 'Concluída' : 'Em andamento'}
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
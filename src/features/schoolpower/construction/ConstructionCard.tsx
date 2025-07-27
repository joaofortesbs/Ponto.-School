
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Share2, Clock, CheckCircle2, PenTool, Hash } from 'lucide-react';
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
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30',
          shadowColor: 'shadow-emerald-100/50 dark:shadow-emerald-900/20',
          textColor: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'in_progress':
        return {
          borderColor: 'border-amber-200 dark:border-amber-800',
          bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30',
          shadowColor: 'shadow-amber-100/50 dark:shadow-amber-900/20',
          textColor: 'text-amber-700 dark:text-amber-300'
        };
      default:
        return {
          borderColor: 'border-slate-200 dark:border-slate-700',
          bgGradient: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30',
          shadowColor: 'shadow-slate-100/50 dark:shadow-slate-900/20',
          textColor: 'text-slate-700 dark:text-slate-300'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔧 Clique no botão Editar Materiais detectado para atividade:', title);
    console.log('🔧 ID da atividade:', id);
    console.log('🔧 Função onEdit disponível:', typeof onEdit);
    if (onEdit) {
      onEdit();
      console.log('🔧 Função onEdit executada com sucesso!');
    } else {
      console.error('🔧 Função onEdit não disponível!');
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          relative rounded-2xl border-2 p-5 transition-all duration-300 
          hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]
          ${statusConfig.borderColor} ${statusConfig.bgGradient} ${statusConfig.shadowColor}
          backdrop-blur-sm
        `}
      >
        {/* Header com ID e Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-600/50">
              <Hash className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                {id}
              </span>
            </div>
          </div>
          
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-600/50`}>
            {getStatusIcon()}
            <span className={`text-xs font-medium ${statusConfig.textColor}`}>
              {status === 'completed' ? 'Concluída' : status === 'in_progress' ? 'Em andamento' : 'Pendente'}
            </span>
          </div>
        </div>

        {/* Preview Area Melhorada */}
        <div className="relative mb-4 h-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden border border-slate-200/50 dark:border-slate-600/50">
          {/* Preview Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-[#D65A00]/20 flex items-center justify-center shadow-lg">
                <Eye className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Pré-visualização
              </p>
            </div>
          </div>

          {/* Progress Overlay */}
          <div className="absolute top-2 right-2">
            <ProgressCircle progress={progress} size={36} />
          </div>

          {/* Shimmer Effect */}
          {progress < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse opacity-60" />
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-3">
          {/* Título e Descrição */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {description}
            </p>
          </div>

          {/* Action Buttons Section */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-600/50">
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEditClick}
                    className="h-8 px-3 text-xs font-medium bg-gradient-to-r from-[#FF6B00] to-[#D65A00] hover:from-[#E55A00] hover:to-[#B94A00] text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <PenTool className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar materiais da atividade</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView?.(id)}
                    className="h-8 px-3 text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Ver
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visualizar atividade completa</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShare?.(id)}
                    className="h-8 px-3 text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartilhar atividade</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Progress Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
      </motion.div>
    </TooltipProvider>
  );
}

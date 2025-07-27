import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Share2, Clock, CheckCircle2, PenTool, Hash, Settings } from 'lucide-react';
import { ProgressCircle } from './ProgressCircle';
import { ConstructionActivityProps } from './types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

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
        return 'border-green-400 bg-green-900/50 text-white';
      case 'in_progress':
        return 'border-yellow-400 bg-yellow-900/50 text-white';
      default:
        return 'border-gray-400 bg-gray-800/80 text-white';
    }
  };

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

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          text: 'Concluída',
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
          border: 'border-green-500',
          badge: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
          gradient: 'from-green-100/10 to-green-500/10',
          glow: 'shadow-green-500/30'
        };
      case 'in_progress':
        return {
          text: 'Em Andamento',
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
          border: 'border-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
          gradient: 'from-yellow-100/10 to-yellow-500/10',
          glow: 'shadow-yellow-500/30'
        };
      default:
        return {
          text: 'Pendente',
          icon: <Clock className="w-4 h-4 text-gray-400" />,
          border: 'border-gray-400',
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
          gradient: 'from-gray-100/10 to-gray-500/10',
          glow: 'shadow-gray-500/30'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TooltipProvider>
      <motion.div
        className={`relative overflow-hidden rounded-2xl border-2 ${statusConfig.border} bg-gradient-to-br ${statusConfig.gradient} backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${statusConfig.glow} cursor-pointer group`}
        style={{
          background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(51, 65, 85, 0.85) 100%)`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF6B00]/20 via-transparent to-[#FF6B00]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Header Section */}
        <div className="relative p-6 pb-4">
          {/* ID Badge */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30 text-xs font-mono">
              <Hash className="w-3 h-3 mr-1" />
              {id}
            </Badge>

            {/* Status Badge */}
            <Badge className={`${statusConfig.badge} border text-xs font-medium`}>
              {getStatusIcon()}
              <span className="ml-1">{statusConfig.text}</span>
            </Badge>
          </div>

          {/* Title & Type */}
          <div className="mb-3">
            <h3 className="font-bold text-lg mb-1 text-white leading-tight group-hover:text-[#FF6B00] transition-colors duration-300">
              {title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                <Settings className="w-3 h-3 mr-1" />
                {type}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 mb-4">
            {description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="relative px-6 pb-4">
          <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm border border-slate-700/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Progresso da Atividade
              </span>
              <span className="text-sm font-bold text-white">
                {progress}%
              </span>
            </div>

            {/* Progress visualization */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
              <ProgressCircle progress={progress} size={32} />
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="relative p-6 pt-2">
          <div className="grid grid-cols-3 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => onEdit(id)}
                  className="bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 border-[#FF6B00]/40 text-[#FF6B00] hover:text-white transition-all duration-300 text-xs font-medium backdrop-blur-sm"
                  variant="outline"
                >
                  <PenTool className="w-3 h-3 mr-1" />
                  Editar
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Editar materiais da atividade</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => onView(id)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-400 hover:text-white transition-all duration-300 text-xs font-medium backdrop-blur-sm"
                  variant="outline"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Visualizar atividade</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => onShare(id)}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-400 hover:text-white transition-all duration-300 text-xs font-medium backdrop-blur-sm"
                  variant="outline"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Compartilhar
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Compartilhar atividade</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#FF6B00]/10 to-transparent rounded-full -translate-y-10 translate-x-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-8 -translate-x-8 pointer-events-none" />
      </motion.div>
    </TooltipProvider>
  );
}
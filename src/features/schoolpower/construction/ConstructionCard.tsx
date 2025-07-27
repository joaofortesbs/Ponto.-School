
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Share2, Clock, CheckCircle2, PenTool, Sparkles, Zap, Activity, Star, Layers, ArrowUpRight, Play } from 'lucide-react';
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

  const getStatusStyle = () => {
    switch (status) {
      case 'completed':
        return {
          border: 'border-emerald-300/60 dark:border-emerald-700/60',
          bg: 'bg-gradient-to-br from-emerald-50/90 via-emerald-100/70 to-emerald-200/50 dark:from-emerald-950/60 dark:via-emerald-900/40 dark:to-emerald-800/30',
          shadow: 'shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/30',
          glow: 'hover:shadow-2xl hover:shadow-emerald-300/50 dark:hover:shadow-emerald-800/40',
          accent: 'emerald'
        };
      case 'in_progress':
        return {
          border: 'border-amber-300/60 dark:border-amber-700/60',
          bg: 'bg-gradient-to-br from-amber-50/90 via-amber-100/70 to-amber-200/50 dark:from-amber-950/60 dark:via-amber-900/40 dark:to-amber-800/30',
          shadow: 'shadow-xl shadow-amber-200/40 dark:shadow-amber-900/30',
          glow: 'hover:shadow-2xl hover:shadow-amber-300/50 dark:hover:shadow-amber-800/40',
          accent: 'amber'
        };
      default:
        return {
          border: 'border-slate-300/60 dark:border-slate-600/60',
          bg: 'bg-gradient-to-br from-slate-50/90 via-slate-100/70 to-slate-200/50 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-slate-700/30',
          shadow: 'shadow-xl shadow-slate-200/40 dark:shadow-slate-800/30',
          glow: 'hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-slate-700/40',
          accent: 'slate'
        };
    }
  };

  const statusStyle = getStatusStyle();

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
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.22, 1, 0.36, 1],
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ 
          y: -8, 
          scale: 1.03,
          rotateX: 2,
          transition: { 
            duration: 0.3, 
            ease: [0.22, 1, 0.36, 1],
            type: "spring",
            stiffness: 200
          }
        }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative rounded-3xl border-2 p-6 transition-all duration-500 
          ${statusStyle.border} ${statusStyle.bg} ${statusStyle.shadow} ${statusStyle.glow}
          hover:border-opacity-90 backdrop-blur-md overflow-hidden group cursor-pointer
          transform-gpu perspective-1000 before:absolute before:inset-0 
          before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent
          before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
          ring-1 ring-white/20 dark:ring-white/10
        `}
        style={{
          background: `linear-gradient(135deg, ${statusStyle.accent === 'emerald' ? 'rgba(16, 185, 129, 0.05)' : statusStyle.accent === 'amber' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(148, 163, 184, 0.05)'} 0%, transparent 50%, ${statusStyle.accent === 'emerald' ? 'rgba(5, 150, 105, 0.08)' : statusStyle.accent === 'amber' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(100, 116, 139, 0.08)'} 100%)`,
          boxShadow: `0 25px 50px -12px ${statusStyle.accent === 'emerald' ? 'rgba(16, 185, 129, 0.25)' : statusStyle.accent === 'amber' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(148, 163, 184, 0.25)'}`
        }}
      >
        {/* Dynamic Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/10 dark:from-white/8 dark:via-transparent dark:to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Floating Particles & Geometric Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main decorative elements */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-br from-[#FF6B00] to-[#FF8736] rounded-full opacity-70 animate-pulse shadow-lg shadow-orange-400/50" />
          <div className="absolute top-4 right-10 w-2 h-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-50 animate-bounce shadow-md shadow-blue-400/30" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-6 right-3 w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full opacity-60 animate-pulse shadow-md shadow-emerald-400/30" style={{ animationDelay: '1s' }} />
          
          {/* Geometric shapes */}
          <div className="absolute top-8 left-4 w-4 h-4 border border-white/30 dark:border-white/20 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          <div className="absolute bottom-8 left-6 w-3 h-3 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded transform rotate-45 opacity-40 group-hover:opacity-60 transition-all duration-300 group-hover:rotate-90" />
          
          {/* Animated lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
          
          {/* Sparkle effects */}
          <Star className="absolute top-6 left-8 w-3 h-3 text-yellow-400/50 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" style={{ animationDelay: '0.8s' }} />
          <Sparkles className="absolute bottom-10 right-8 w-4 h-4 text-white/30 dark:text-white/20 opacity-0 group-hover:opacity-60 transition-all duration-500 animate-pulse" style={{ animationDelay: '1.2s' }} />
        </div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Header Section with ID and Status */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B00]/25 via-[#FF8736]/20 to-[#D65A00]/25 border border-[#FF6B00]/40 dark:border-[#FF6B00]/30 backdrop-blur-sm shadow-lg shadow-orange-500/20">
              <span className="text-xs font-bold text-[#FF6B00] dark:text-[#FF8736] flex items-center gap-1.5">
                <div className="w-3 h-3 bg-gradient-to-br from-[#FF6B00] to-[#D65A00] rounded-full flex items-center justify-center">
                  <Activity className="w-1.5 h-1.5 text-white" />
                </div>
                ID: {id}
              </span>
            </div>
            
            {/* Activity type indicator */}
            <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 backdrop-blur-sm">
              <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          {/* Enhanced Status Badge */}
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg
            ${status === 'completed' 
              ? 'bg-gradient-to-r from-emerald-50/90 to-emerald-100/80 dark:from-emerald-900/60 dark:to-emerald-800/50 border-emerald-300/60 dark:border-emerald-700/60 shadow-emerald-200/30' 
              : status === 'in_progress' 
              ? 'bg-gradient-to-r from-amber-50/90 to-amber-100/80 dark:from-amber-900/60 dark:to-amber-800/50 border-amber-300/60 dark:border-amber-700/60 shadow-amber-200/30'
              : 'bg-gradient-to-r from-slate-50/90 to-slate-100/80 dark:from-slate-800/60 dark:to-slate-700/50 border-slate-300/60 dark:border-slate-600/60 shadow-slate-200/30'
            }
          `}>
            <div className="relative">
              {getStatusIcon()}
              {status === 'in_progress' && (
                <div className="absolute -inset-1 rounded-full bg-amber-400/20 animate-ping" />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {status === 'completed' ? 'Concluída' : status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
            </span>
            {status === 'completed' && (
              <Star className="w-3 h-3 text-emerald-500 animate-pulse" />
            )}
          </div>
        </div>

        {/* Preview Area - Premium Design */}
        <div className="relative mb-6 h-40 rounded-2xl bg-gradient-to-br from-slate-50/95 via-slate-100/80 to-slate-200/70 dark:from-slate-800/70 dark:via-slate-700/60 dark:to-slate-600/50 overflow-hidden border-2 border-slate-200/60 dark:border-slate-600/50 group-hover:shadow-2xl transition-all duration-500 backdrop-blur-lg">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20" />
          </div>
          
          {/* Preview Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center relative z-10">
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FF6B00]/40 via-[#FF8736]/30 to-[#D65A00]/25 flex items-center justify-center backdrop-blur-md border-2 border-[#FF6B00]/30 shadow-xl shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                whileHover={{ 
                  scale: 1.15,
                  rotate: 5,
                  boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.5)"
                }}
              >
                <Eye className="w-8 h-8 text-[#FF6B00] dark:text-[#FF8736] drop-shadow-lg" />
                <div className="absolute -inset-1 bg-gradient-to-br from-[#FF6B00]/20 to-transparent rounded-2xl blur opacity-50" />
              </motion.div>
              
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                  Pré-visualização
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/50 dark:border-slate-700/50">
                    <Play className="w-3 h-3 text-[#FF6B00]" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Interativa</span>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#FF6B00]/80 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Circle */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-2 border-white/60 dark:border-slate-700/60 shadow-lg flex items-center justify-center">
                <ProgressCircle progress={progress} size={40} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {progress}%
                  </span>
                </div>
              </div>
              {progress === 100 && (
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400/50 to-emerald-600/50 rounded-full blur animate-pulse" />
              )}
            </div>
          </div>

          {/* Dynamic Effects */}
          {progress < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
          )}

          {progress === 100 && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/30 via-emerald-100/20 to-transparent animate-pulse">
              <div className="absolute top-2 right-2 text-emerald-500">
                <CheckCircle2 className="w-5 h-5 animate-bounce" />
              </div>
            </div>
          )}

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#FF6B00]/20 to-transparent rounded-bl-3xl" />
        </div>

        {/* Content Section - Premium Typography */}
        <div className="space-y-5 relative z-10">
          {/* Title and Description */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <h3 className="font-black text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#FF6B00] dark:group-hover:text-[#FF8736] transition-all duration-300 tracking-tight leading-tight flex-1">
                {title}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 flex-shrink-0 mt-1" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
              {description}
            </p>
            
            {/* Decorative divider */}
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#FF6B00] to-transparent rounded-full opacity-60 group-hover:opacity-100 group-hover:w-16 transition-all duration-300" />
          </div>

          {/* Action Buttons Section - Premium Design */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-gradient-to-r from-slate-200/60 via-slate-300/40 to-slate-200/60 dark:from-slate-700/60 dark:via-slate-600/40 dark:to-slate-700/60">
            <div className="flex items-center gap-2.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={handleEditClick}
                      className="h-9 px-4 text-xs bg-gradient-to-r from-[#FF6B00] via-[#FF8736] to-[#D65A00] hover:from-[#FF8736] hover:via-[#FF6B00] hover:to-[#FF8736] text-white border-none shadow-xl hover:shadow-2xl transform transition-all duration-300 flex items-center gap-2 font-bold tracking-wide rounded-xl overflow-hidden relative group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <PenTool className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Editar</span>
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B00] to-[#D65A00] rounded-xl blur opacity-30 group-hover/btn:opacity-50 transition-opacity duration-300" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 text-white border-slate-700">
                  <p className="font-medium">Editar materiais da atividade</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView?.(id)}
                      className="h-9 px-4 text-xs bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white border-none shadow-xl hover:shadow-2xl transform transition-all duration-300 flex items-center gap-2 font-bold tracking-wide rounded-xl overflow-hidden relative group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <Eye className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Ver</span>
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-30 group-hover/btn:opacity-50 transition-opacity duration-300" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 text-white border-slate-700">
                  <p className="font-medium">Visualizar atividade completa</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onShare?.(id)}
                      className="h-9 px-4 text-xs bg-gradient-to-r from-slate-100 via-white to-slate-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 hover:from-slate-50 hover:via-slate-100 hover:to-white dark:hover:from-slate-600 dark:hover:via-slate-500 dark:hover:to-slate-600 text-slate-700 dark:text-slate-200 border-2 border-slate-300/60 dark:border-slate-500/60 hover:border-slate-400/80 dark:hover:border-slate-400/80 backdrop-blur-md shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center gap-2 font-bold tracking-wide rounded-xl overflow-hidden relative group/btn"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 text-white border-slate-700">
                  <p className="font-medium">Compartilhar atividade</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Premium Progress Badge */}
            <div className="flex items-center gap-2">
              <motion.div 
                className="px-4 py-2 rounded-full bg-gradient-to-r from-white/95 via-slate-50/90 to-white/85 dark:from-slate-800/95 dark:via-slate-700/90 dark:to-slate-800/85 border-2 border-slate-200/60 dark:border-slate-600/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Zap className="w-4 h-4 text-[#FF6B00] drop-shadow-sm" />
                    {progress > 0 && progress < 100 && (
                      <div className="absolute -inset-1 bg-[#FF6B00]/20 rounded-full animate-ping" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                    {progress === 0 ? 'Aguardando' : progress === 100 ? 'Finalizada' : 'Ativa'}
                  </span>
                  {progress === 100 && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 animate-pulse" />
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6B00]/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
    </TooltipProvider>
  );
}

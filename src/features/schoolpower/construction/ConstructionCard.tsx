import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Share2, Clock, CheckCircle2, PenTool, Sparkles, Zap, Activity } from 'lucide-react';
import { ProgressCircle } from './ProgressCircle';
import { ConstructionActivityProps } from './types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import schoolPowerActivitiesData from '../data/schoolPowerActivities.json';
import { useEffect } from 'react';

// Modal Component for Activity Preview
const ActivityPreviewModal = ({ isOpen, onClose, activityData }: { isOpen: boolean; onClose: () => void; activityData: any }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-[85%] h-[85%] bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl flex flex-col overflow-hidden"
        style={{
          borderImage: 'linear-gradient(to bottom right, #FF6B00, #D65A00) 1',
          borderImageSlice: 1,
          borderStyle: 'solid',
          borderWidth: '2px', /* Border width reduced */
          borderRadius: '10px', /* Rounded corners applied */
        }}
      >
        <div className="absolute top-2 right-2 z-20">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/3.0.0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>
        <div className="p-6 flex-grow overflow-auto">
          <h2 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">Visualização da Atividade</h2>
          <div className="border-t border-orange-500/30 pt-4">
            {activityData ? (
              <>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{activityData.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{activityData.description}</p>
                {/* Render other activity details here as needed */}
                {activityData.generatedContent && (
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/50 rounded-lg border border-orange-200 dark:border-orange-700/50">
                    <h4 className="text-base font-semibold mb-2 text-orange-700 dark:text-orange-300">Conteúdo Gerado:</h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400 leading-relaxed">{activityData.generatedContent}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Carregando detalhes da atividade...</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Função para obter o nome da atividade pelo ID
const getActivityNameById = (activityId: string): string => {
  const activity = schoolPowerActivitiesData.find(act => act.id === activityId);
  return activity ? activity.name : activityId;
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivityData, setSelectedActivityData] = useState<any>(null);

  const handleView = () => {
    console.log('Abrindo visualização para atividade:', title, 'ID:', id);
    // In a real scenario, you would fetch the full activity data here based on `id`
    // For now, we'll mock it with the card's data
    setSelectedActivityData({ id, title, description, progress, type, status });
    setIsModalOpen(true);
  };

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
          border: 'border-emerald-200 dark:border-emerald-800/50',
          bg: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/30',
          shadow: 'shadow-emerald-100/50 dark:shadow-emerald-900/20',
          glow: 'shadow-lg shadow-emerald-200/30 dark:shadow-emerald-800/20'
        };
      case 'in_progress':
        return {
          border: 'border-amber-200 dark:border-amber-800/50',
          bg: 'bg-gradient-to-br from-amber-50/80 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/30',
          shadow: 'shadow-amber-100/50 dark:shadow-amber-900/20',
          glow: 'shadow-lg shadow-amber-200/30 dark:shadow-amber-800/20'
        };
      default:
        return {
          border: 'border-slate-200 dark:border-slate-700/50',
          bg: 'bg-gradient-to-br from-slate-50/80 to-slate-100/60 dark:from-slate-900/40 dark:to-slate-800/30',
          shadow: 'shadow-slate-100/50 dark:shadow-slate-800/20',
          glow: 'shadow-lg shadow-slate-200/30 dark:shadow-slate-700/20'
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

  const getProgressColor = () => {
    if (progress >= 80) return 'text-emerald-500';
    if (progress >= 50) return 'text-amber-500';
    return 'text-slate-400';
  };

  const getActivityTypeIcon = () => {
    switch (type) {
      case 'lista-exercicios':
        return <PenTool className="w-4 h-4" />;
      case 'jogo-educativo':
        return <Sparkles className="w-4 h-4" />;
      case 'atividade-interativa':
        return <Zap className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Verifica se a atividade tem campos preenchidos e não foi construída ainda
  const canAutoBuild = status === 'draft' && title && description && progress < 100;

  const handleAutoBuild = () => {
    console.log('🤖 Iniciando construção automática para:', title);
    // Simula a abertura do modal e clique no botão construir
    onEdit(); // Abre o modal de edição

    // Pequeno delay para garantir que o modal foi aberto
    setTimeout(() => {
      // Procura pelo botão "Construir Atividade" no modal e simula o clique
      const buildButton = document.querySelector('[data-testid="build-activity-button"], button:contains("Construir Atividade"), .construir-atividade');
      if (buildButton) {
        console.log('🎯 Simulando clique no botão Construir Atividade');
        (buildButton as HTMLButtonElement).click();
      }
    }, 500);
  };

  // Simula a obtenção do conteúdo gerado para a pré-visualização
  const generatedContent = status === 'completed' ? "Este é um exemplo de conteúdo gerado para a atividade." : "";

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{
          y: -4,
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        className={`
          relative rounded-2xl border-2 p-5 transition-all duration-300
          ${statusStyle.border} ${statusStyle.bg} ${statusStyle.glow}
          hover:shadow-xl hover:border-opacity-80
          backdrop-blur-sm overflow-hidden group cursor-pointer
        `}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 dark:from-white/5 dark:via-transparent dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />



        {/* Header Section with ID and Status */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FF6B00]/20 to-[#D65A00]/20 border border-[#FF6B00]/30 dark:border-[#FF6B00]/20">
              <span className="text-xs font-semibold text-[#FF6B00] dark:text-[#FF8736] flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {getActivityNameById(id)}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            {getStatusIcon()}
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {status === 'completed' ? 'Concluída' : status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
            </span>
          </div>
        </div>

        {/* Preview Area - Enhanced */}
        <div className="relative mb-5 h-36 rounded-xl bg-gradient-to-br from-slate-100/80 to-slate-200/60 dark:from-slate-700/60 dark:to-slate-800/40 overflow-hidden border border-slate-200/50 dark:border-slate-700/30 group-hover:shadow-inner">
          {/* Preview Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center relative z-10">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#FF6B00]/30 to-[#D65A00]/20 flex items-center justify-center backdrop-blur-sm border border-[#FF6B00]/20 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-7 h-7 text-[#FF6B00] dark:text-[#FF8736]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pré-visualização
                </p>
                <div className="flex items-center gap-1 justify-center">
                  <Sparkles className="w-3 h-3 text-[#FF6B00]/70" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Interativa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Circle Overlay */}
          <div className="absolute top-3 right-3">
            <div className="relative">
              <ProgressCircle progress={progress} size={48} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Loading Shimmer Effect */}
          {progress < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse opacity-60" />
          )}

          {/* Completion Glow */}
          {progress === 100 && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-emerald-100/10 to-transparent animate-pulse" />
          )}
        </div>

        {/* Content Section - Enhanced */}
        <div className="space-y-4 relative z-10">
          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#FF6B00] dark:group-hover:text-[#FF8736] transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Buttons Section */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/30">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                disabled={!generatedContent && status !== 'draft'}
              >
                <Eye className="h-4 w-4 mr-1" />
                Visualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare?.(id)}
                className="flex-1"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleEditClick}
                    className="h-8 px-3 text-xs bg-gradient-to-r from-[#FF6B00] to-[#D65A00] hover:from-[#FF8736] hover:to-[#FF6B00] text-white border-none shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span className="font-medium">Editar</span>
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
                    onClick={() => onShare?.(id)}
                    className="h-8 px-3 text-xs bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="font-medium">Share</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compartilhar atividade</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Enhanced Progress Badge */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-700/90 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-[#FF6B00]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {progress === 100 ? 'Finalizada' : 'Ativa'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
                 {/* Botão Construir Automaticamente */}
                 {canAutoBuild && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={handleAutoBuild}
                  className="w-full text-xs bg-gradient-to-r from-[#FF6B00] to-[#D65A00] hover:from-[#E55A00] hover:to-[#B54A00] text-white border-0"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Construir Automaticamente
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Construir atividade automaticamente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6B00]/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>
      <ActivityPreviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} activityData={{ id, title, description, progress, type, status, generatedContent }} />
    </TooltipProvider>
  );
}
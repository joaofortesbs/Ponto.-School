import React from 'react';
import { motion } from 'framer-motion';
import { ConstructionActivity } from './useConstructionActivities';
import { ProgressCircle } from './ProgressCircle';
import { Eye, Settings, Play, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ConstructionGridProps {
  activities: ConstructionActivity[];
  onEdit: (activity: ConstructionActivity) => void;
  onPreview: (activity: ConstructionActivity) => void;
  isAutoBuilding?: boolean;
}

export function ConstructionGrid({ activities, onEdit, onPreview, isAutoBuilding }: ConstructionGridProps) {
  console.log('🎯 ConstructionGrid renderizado com atividades aprovadas:', activities);

  const getStatusIcon = (status: string, autoBuilt?: boolean) => {
    if (autoBuilt) {
      return <Bot className="w-4 h-4 text-purple-500" />;
    }

    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'building':
        return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string, autoBuilt?: boolean) => {
    if (autoBuilt && status === 'completed') {
      return 'Auto-construída';
    }

    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'building':
        return 'Construindo...';
      case 'error':
        return 'Erro';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: string, autoBuilt?: boolean) => {
    if (autoBuilt) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }

    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'building':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner de Auto-construção */}
      {isAutoBuilding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
            <div>
              <h4 className="text-sm font-medium text-purple-400">Auto-construção Ativa</h4>
              <p className="text-xs text-purple-300/70">
                O sistema está construindo automaticamente todas as atividades aprovadas...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid de Atividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-orange-500/50 transition-all duration-300 ${
              activity.status === 'building' ? 'ring-2 ring-blue-500/20 animate-pulse' : ''
            }`}
          >
            {/* Header da Atividade */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {activity.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3">
                  {activity.description}
                </p>
              </div>
              <ProgressCircle progress={activity.progress} size={40} />
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-4">
              {getStatusIcon(activity.status, activity.autoBuilt)}
              <Badge className={`${getStatusColor(activity.status, activity.autoBuilt)} border`}>
                {getStatusText(activity.status, activity.autoBuilt)}
              </Badge>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(activity)}
                disabled={activity.status === 'building'}
                className="flex-1 bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Settings className="w-4 h-4 mr-2" />
                Editar Materiais
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(activity)}
                disabled={activity.status === 'building'}
                className="flex-1 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </Button>
            </div>

            {/* Informações do Tipo */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ID: {activity.id}</span>
                <div className="flex items-center gap-2">
                  {activity.autoBuilt && <span className="text-purple-400">Auto</span>}
                  <span className="capitalize">{activity.type}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
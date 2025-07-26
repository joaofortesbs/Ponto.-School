import React from 'react';
import { motion } from 'framer-motion';
import { ConstructionCard } from './ConstructionCard';

interface Activity {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'in-progress' | 'completed';
}

interface ConstructionGridProps {
  activities: Activity[];
  onEdit: (activityId: string) => void;
  onView: (activityId: string) => void;
  onShare: (activityId: string) => void;
}

export function ConstructionGrid({ activities, onEdit, onView, onShare }: ConstructionGridProps) {
  console.log('🏗️ ConstructionGrid renderizado com atividades:', activities.length);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Nenhuma atividade para construção
        </h3>
        <p className="text-gray-400 max-w-md">
          Complete o fluxo de contextualização e plano de ação para ter atividades aprovadas para construção.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Atividades Aprovadas para Construção
        </h3>
        <p className="text-gray-400">
          {activities.length} atividade{activities.length !== 1 ? 's' : ''} disponível{activities.length !== 1 ? 'eis' : ''} para edição e personalização
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ConstructionCard
              id={activity.id}
              title={activity.title}
              description={activity.description}
              progress={activity.progress}
              type={activity.type}
              status={activity.status}
              onEdit={() => {
                console.log('🎯 ConstructionGrid: Botão Edit clicado para atividade:', activity.id);
                onEdit(activity.id);
              }}
              onView={() => {
                console.log('👁️ ConstructionGrid: Botão View clicado para atividade:', activity.id);
                onView(activity.id);
              }}
              onShare={() => {
                console.log('📤 ConstructionGrid: Botão Share clicado para atividade:', activity.id);
                onShare(activity.id);
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
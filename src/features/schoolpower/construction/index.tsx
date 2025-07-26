import React, { useState } from 'react';
import { ConstructionGrid } from './ConstructionGrid';
import { EditActivityContainer } from './EditActivityContainer';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

export interface ConstructionInterface {
  activities: ConstructionActivity[];
  onEdit: (activityId: string) => void;
  onView: (activityId: string) => void;
  onShare: (activityId: string) => void;
}

export interface ConstructionActivity {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'in_progress' | 'completed';
}

export function ConstructionInterface({ approvedActivities }: ConstructionInterfaceProps) {
  const [editingActivity, setEditingActivity] = useState<{id: string, data: any} | null>(null);
  const constructionActivities = convertToConstructionActivities(approvedActivities);

  const handleEdit = (id: string, data: any) => {
    console.log('🎯 Editing activity:', id, data);
    setEditingActivity({ id, data });
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
  };

  const handleSaveEdit = (activityData: any) => {
    console.log('💾 Saving activity:', editingActivity?.id, activityData);
    // Aqui você pode implementar a lógica de salvamento
    setEditingActivity(null);
  };

  if (editingActivity) {
    return (
      <EditActivityContainer
        activityId={editingActivity.id}
        activityData={editingActivity.data}
        onBack={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <ConstructionGrid 
        approvedActivities={constructionActivities}
        onEdit={handleEdit}
      />
    </div>
  );
}

const convertToConstructionActivities = (activities: ActionPlanItem[]): ConstructionActivity[] => {
  return activities.map(activity => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    status: 'pending' as const,
    progress: 0,
    type: activity.type || 'default',
    originalData: activity // Preserva os dados originais
  }));
};

export { ConstructionGrid } from './ConstructionGrid';
export { ConstructionCard } from './ConstructionCard';
export { ProgressCircle } from './ProgressCircle';
export { useConstructionActivities } from './useConstructionActivities';
export type { ConstructionActivity, ConstructionActivityProps } from './types';
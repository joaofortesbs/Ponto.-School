import React, { useState } from 'react';
import { ConstructionGrid } from './ConstructionGrid';
import { EditActivityContainer } from './EditActivityContainer';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

export interface ConstructionInterfaceProps {
  approvedActivities: any[];
}

export interface ConstructionActivity {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'in-progress' | 'completed' | 'pending';
  originalData?: any;
}

export function ConstructionInterface({ approvedActivities }: ConstructionInterfaceProps) {
  console.log('🏗️ ConstructionInterface renderizada com atividades:', approvedActivities);

  const [editingActivity, setEditingActivity] = useState<{id: string, data: any} | null>(null);

  const handleEdit = (id: string, data: any) => {
    console.log('🎯 ConstructionInterface: Editando atividade:', id, data);
    setEditingActivity({ id, data });
  };

  const handleCancelEdit = () => {
    console.log('❌ ConstructionInterface: Cancelando edição');
    setEditingActivity(null);
  };

  const handleSaveEdit = (activityData: any) => {
    console.log('💾 ConstructionInterface: Salvando atividade:', editingActivity?.id, activityData);
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
        onClose={handleCancelEdit}
      />
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <ConstructionGrid 
        approvedActivities={approvedActivities}
        onEdit={handleEdit}
      />
    </div>
  );
}

export { ConstructionGrid } from './ConstructionGrid';
export { ConstructionCard } from './ConstructionCard';
export { ProgressCircle } from './ProgressCircle';
export { useConstructionActivities } from './useConstructionActivities';
export type { ConstructionActivity, ConstructionInterfaceProps } from './index';
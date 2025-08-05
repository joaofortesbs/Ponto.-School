import React from 'react';
import { ConstructionGrid } from './ConstructionGrid';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

export interface ConstructionInterfaceProps {
  approvedActivities: any[];
  handleEditActivity?: (activity: any) => void;
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

export function ConstructionInterface({ approvedActivities, handleEditActivity }: ConstructionInterfaceProps) {
  console.log('🏗️ ConstructionInterface renderizada com atividades:', approvedActivities);

  return (
    <div className="w-full h-full overflow-y-auto" style={{ minHeight: '600px', height: 'auto', backgroundColor: 'transparent' }}>
      <ConstructionGrid 
        approvedActivities={approvedActivities}
        handleEditActivity={handleEditActivity}
      />
    </div>
  );
}

export { ConstructionGrid } from './ConstructionGrid';
export { ConstructionCard } from './ConstructionCard';
export { EditActivityModal } from './EditActivityModal';
export { ProgressCircle } from './ProgressCircle';
export { useConstructionActivities } from './useConstructionActivities';
export { useEditActivityModal } from './useEditActivityModal';
export type { ConstructionActivity, ConstructionInterfaceProps } from './index';
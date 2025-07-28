import React from 'react';
import { ConstructionGrid } from './ConstructionGrid';
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

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
      <div className="w-full max-w-2xl">
        <ConstructionGrid 
          approvedActividades={approvedActivities}
        />
      </div>
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
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
    <div className="w-full h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <ConstructionGrid 
        approvedActivities={approvedActivities}
      />
    </div>
  );
}

export { ConstructionGrid } from './ConstructionGrid';
export { ConstructionCard } from './ConstructionCard';
export { ProgressCircle } from './ProgressCircle';
export { useConstructionActivities } from './useConstructionActivities';
export type { ConstructionActivity, ConstructionInterfaceProps } from './index';
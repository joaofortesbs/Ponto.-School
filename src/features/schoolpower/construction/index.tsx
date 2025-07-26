import React from 'react';
import { ConstructionGrid } from './ConstructionGrid';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

export interface ConstructionInterfaceProps {
  approvedActivities: ActionPlanItem[];
}

export interface ConstructionActivity {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'pending' | 'in-progress' | 'completed';
  data?: any;
}

export default function ConstructionInterface({ approvedActivities }: ConstructionInterfaceProps) {
  const handleView = (id: string) => {
    console.log('Visualizando atividade:', id);
  };

  const handleShare = (id: string) => {
    console.log('Compartilhando atividade:', id);
  };

  return (
    <div className="w-full h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <ConstructionGrid 
        approvedActivities={approvedActivities}
        onView={handleView}
        onShare={handleShare}
      />
    </div>
  );
}

export { ConstructionGrid } from './ConstructionGrid';
export { ConstructionCard } from './ConstructionCard';
export { ProgressCircle } from './ProgressCircle';
export { useConstructionActivities } from './useConstructionActivities';
export type { ConstructionActivity, ConstructionInterfaceProps };
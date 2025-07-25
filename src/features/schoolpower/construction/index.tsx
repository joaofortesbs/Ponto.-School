
import React from 'react';
import { ConstructionGrid } from './ConstructionGrid';

interface ConstructionInterfaceProps {
  approvedActivities: any[];
}

export function ConstructionInterface({ approvedActivities }: ConstructionInterfaceProps) {
  return (
    <div className="w-full">
      <ConstructionGrid approvedActivities={approvedActivities} />
    </div>
  );
}

export { ConstructionGrid } from './ConstructionGrid';
export { ConstructionCard } from './ConstructionCard';
export { ProgressCircle } from './ProgressCircle';
export { useConstructionActivities } from './useConstructionActivities';
export type { ConstructionActivity, ConstructionActivityProps } from './types';

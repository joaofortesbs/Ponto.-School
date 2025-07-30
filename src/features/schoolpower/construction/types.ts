import React from 'react';

export interface ConstructionActivity {
  id: string;
  title: string;
  personalizedTitle?: string;
  description: string;
  personalizedDescription?: string;
  categoryId: string;
  categoryName: string;
  icon: string;
  tags: string[];
  difficulty: string;
  estimatedTime: string;
  customFields?: Record<string, any>;
  originalData?: any;
  preenchidoAutomaticamente?: boolean;
  isBuilt?: boolean;
  builtAt?: string;
}

export interface ConstructionActivityProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'pending' | 'in_progress' | 'completed';
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
  onEdit?: () => void;
}

export interface EditActivityModalState {
  isOpen: boolean;
  activityId: string | null;
  activityTitle: string;
}
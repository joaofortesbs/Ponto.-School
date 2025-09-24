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
  // Propriedades adicionais para controle de construção
  progress?: number;
  status?: 'draft' | 'in_progress' | 'completed' | 'pending' | 'error';
  type?: string;
}

export interface ConstructionActivityProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'in_progress' | 'completed' | 'pending';
  onView?: (activityData?: any) => void;
  onShare?: (id: string) => void;
  onEdit?: () => void;
}

export interface EditActivityModalState {
  isOpen: boolean;
  activityId: string | null;
  activityTitle: string;
}
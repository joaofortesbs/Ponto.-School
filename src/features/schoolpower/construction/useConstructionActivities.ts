import React, { useState, useEffect } from 'react';
import { ConstructionActivity } from './types';

export const useConstructionActivities = (approvedActivities?: any[]) => {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (approvedActivities && approvedActivities.length > 0) {
      console.log('🔄 Convertendo atividades aprovadas:', approvedActivities);

      const convertedActivities = approvedActivities.map((activity, index) => {
        // Garantir que o ID seja compatível com o registro de atividades
        let activityId = activity.id;

        // Mapear IDs genéricos para IDs específicos se necessário
        if (!activityId || activityId === 'generic') {
          if (activity.title?.toLowerCase().includes('prova') && activity.title?.toLowerCase().includes('função')) {
            activityId = 'prova-funcao-1grau';
          } else if (activity.title?.toLowerCase().includes('lista') && activity.title?.toLowerCase().includes('exercício')) {
            activityId = 'lista-exercicios-funcao-1grau';
          } else if (activity.title?.toLowerCase().includes('jogo') && activity.title?.toLowerCase().includes('função')) {
            activityId = 'jogo-educacional-funcao-1grau';
          } else {
            activityId = `activity-${index}`;
          }
        }

        return {
          id: activityId,
          title: activity.title || activity.personalizedTitle || 'Atividade sem título',
          description: activity.description || activity.personalizedDescription || 'Descrição não disponível',
          progress: 0,
          type: activity.type || 'Atividade',
          status: 'draft' as const,
          originalData: activity
        };
      });

      setActivities(convertedActivities);
      setLoading(false);
    } else {
      console.log('📝 Usando atividades mock padrão');

      // Buscar atividades do School Power que estão aprovadas
      const mockActivities: ConstructionActivity[] = [
        {
          id: 'prova-funcao-1grau',
          title: 'Prova - Funções do 1° Grau, Teorema de...',
          description: 'Prova abrangendo os temas de funções do primeiro grau. Teorema de Pitágoras e números racionais com...',
          progress: 0,
          type: 'Prova',
          status: 'draft'
        },
        {
          id: 'lista-exercicios-funcao-1grau',
          title: 'Lista de Exercícios - Funções do 1° Grau',
          description: 'Lista com exercícios variados sobre funções do primeiro grau, abordando desde a identificação até a resolução de...',
          progress: 0,
          type: 'Lista de Exercícios',
          status: 'draft'
        },
        {
          id: 'jogo-educacional-funcao-1grau',
          title: 'Jogo Educacional - Funções do 1° Grau',
          description: 'Jogo interativo para fixar os conceitos de funções do primeiro grau de forma lúdica.',
          progress: 0,
          type: 'Jogo',
          status: 'draft'
        },
        {
          id: 'funcoes-primeiro-grau',
          title: 'Funções do 1° Grau',
          description: 'Atividade completa sobre funções do primeiro grau com teoria e exercícios práticos.',
          progress: 0,
          type: 'Atividade',
          status: 'draft'
        },
        {
          id: 'atividade-contextualizada-funcao-1grau',
          title: 'Atividade Contextualizada - Funções do 1°...',
          description: 'Atividade contextualizada relacionando funções do primeiro grau com situações do cotidiano.',
          progress: 0,
          type: 'Atividade Contextualizada',
          status: 'draft'
        }
      ];

      console.log('✅ Atividades carregadas:', mockActivities);
      setActivities(mockActivities);
      setLoading(false);
    }
  }, [approvedActivities]);

  const updateActivity = (activityId: string, updates: Partial<ConstructionActivity>) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, ...updates }
          : activity
      )
    );
  };

  return { activities, loading, setActivities, updateActivity };
};
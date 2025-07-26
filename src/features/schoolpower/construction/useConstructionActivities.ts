import { useState, useEffect } from 'react';
import { ConstructionActivity } from './types';

export const useConstructionActivities = (approvedActivities?: any[]) => {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de atividades aprovadas
    const loadActivities = () => {
      console.log('📚 Carregando atividades para construção...');

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
    };

    loadActivities();
  }, []);

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
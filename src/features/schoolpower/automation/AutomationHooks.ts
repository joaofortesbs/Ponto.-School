
import { useState, useCallback, useRef } from 'react';
import { automationEngine } from './AutomationEngine';
import { ActivityTypeDetector } from './ActivityTypeDetector';
import { AIDataGenerator } from './AIDataGenerator';

export interface AutomationStatus {
  isRunning: boolean;
  currentActivity: number;
  totalActivities: number;
  progress: number;
  errors: string[];
  completed: boolean;
}

export function useSchoolPowerAutomation() {
  const [status, setStatus] = useState<AutomationStatus>({
    isRunning: false,
    currentActivity: 0,
    totalActivities: 0,
    progress: 0,
    errors: [],
    completed: false
  });

  const statusUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const startAutomation = useCallback(async (activities: any[]) => {
    if (status.isRunning) {
      console.warn('Automation already running');
      return;
    }

    // Reset status
    setStatus({
      isRunning: true,
      currentActivity: 0,
      totalActivities: activities.length,
      progress: 0,
      errors: [],
      completed: false
    });

    // Start progress monitoring
    statusUpdateInterval.current = setInterval(() => {
      if (automationEngine.isAutomationRunning()) {
        const progress = automationEngine.getProgress();
        setStatus(prev => ({
          ...prev,
          currentActivity: progress.current,
          progress: progress.percentage
        }));
      }
    }, 1000);

    try {
      // Process activities with type detection
      const processedActivities = activities.map((activity, index) => {
        const typeMapping = ActivityTypeDetector.detectActivityType(activity);
        
        return {
          ...activity,
          id: activity.id || `activity_${index}`,
          type: typeMapping?.id || 'lista-exercicios'
        };
      });

      // Execute automation
      const success = await automationEngine.executeAutomation(processedActivities);

      // Update final status
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        completed: success,
        progress: 100,
        errors: success ? [] : ['Automation failed']
      }));

    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        completed: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }));
    } finally {
      if (statusUpdateInterval.current) {
        clearInterval(statusUpdateInterval.current);
        statusUpdateInterval.current = null;
      }
    }
  }, [status.isRunning]);

  const stopAutomation = useCallback(() => {
    automationEngine.stopAutomation();
    
    if (statusUpdateInterval.current) {
      clearInterval(statusUpdateInterval.current);
      statusUpdateInterval.current = null;
    }

    setStatus(prev => ({
      ...prev,
      isRunning: false
    }));
  }, []);

  const resetStatus = useCallback(() => {
    setStatus({
      isRunning: false,
      currentActivity: 0,
      totalActivities: 0,
      progress: 0,
      errors: [],
      completed: false
    });
  }, []);

  return {
    status,
    startAutomation,
    stopAutomation,
    resetStatus
  };
}

export function useActivityGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const generateActivityData = useCallback(async (activityType: string, baseData: any) => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const typeMapping = ActivityTypeDetector.getTypeById(activityType);
      
      if (!typeMapping) {
        throw new Error(`Unknown activity type: ${activityType}`);
      }

      const result = await AIDataGenerator.generateActivityData(typeMapping, baseData);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.errors?.join(', ') || 'Generation failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGenerationError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateActivityData,
    isGenerating,
    generationError,
    clearError: () => setGenerationError(null)
  };
}

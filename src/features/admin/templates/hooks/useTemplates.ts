import { useState, useEffect } from 'react';
import { Template } from '../types';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carregamento de templates
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        // Aqui seria feita a chamada real para a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTemplates([]);
      } catch (err) {
        setError('Erro ao carregar templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    setTemplates
  };
};
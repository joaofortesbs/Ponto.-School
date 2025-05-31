
import { useState, useEffect } from 'react';
import SessionStorageService, { FlowSession } from '@/lib/sessionStorageService';

/**
 * Hook para gerenciar as sessões de Flow
 */
export const useFlowSessions = () => {
  const [sessions, setSessions] = useState<FlowSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar sessões
  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await SessionStorageService.getSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar sessões');
      console.error('Erro ao carregar sessões:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova sessão
  const addSession = async (session: FlowSession) => {
    try {
      const success = await SessionStorageService.saveSession(session);
      if (success) {
        setSessions(prev => [session, ...prev]);
      }
      return success;
    } catch (err) {
      console.error('Erro ao adicionar sessão:', err);
      return false;
    }
  };

  // Excluir sessão
  const deleteSession = async (sessionId: string | number) => {
    try {
      const success = await SessionStorageService.deleteSession(sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
      return success;
    } catch (err) {
      console.error('Erro ao excluir sessão:', err);
      return false;
    }
  };

  // Estatísticas relevantes
  const getStats = (periodFilter?: 'semana' | 'mes' | 'ano') => {
    // Definir data de início com base no filtro
    const startDate = new Date();
    if (periodFilter === 'semana' || !periodFilter) {
      startDate.setDate(startDate.getDate() - 7); // Últimos 7 dias
    } else if (periodFilter === 'mes') {
      startDate.setMonth(startDate.getMonth() - 1); // Último mês
    } else if (periodFilter === 'ano') {
      startDate.setFullYear(startDate.getFullYear() - 1); // Último ano
    } else {
      startDate.setDate(startDate.getDate() - 30); // Padrão: últimos 30 dias
    }
    
    // Filtrar sessões pelo período
    const filteredSessions = sessions.filter(session => {
      if (session.timestamp) {
        return new Date(session.timestamp) >= startDate;
      }
      
      // Fallback para formato BR
      try {
        const parts = session.date.split(/[\/,]/);
        if (parts.length >= 2) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parts.length > 2 ? parseInt(parts[2]) : new Date().getFullYear();
          const sessionDate = new Date(year, month, day);
          return sessionDate >= startDate;
        }
      } catch (e) {
        console.error("Erro ao processar data da sessão:", e);
      }
      
      return false;
    });
    
    // Calcular tempo total em segundos
    const totalTimeInSeconds = filteredSessions.reduce((total, session) => {
      return total + (session.elapsedTimeSeconds || 0);
    }, 0);
    
    // Calcular eficiência média
    const avgEfficiency = filteredSessions.length > 0
      ? Math.round(filteredSessions.reduce((sum, session) => sum + (session.progress || 0), 0) / filteredSessions.length)
      : 0;
    
    // Estatísticas por disciplina
    const subjectStats: {[key: string]: number} = {};
    filteredSessions.forEach(session => {
      if (session.subjects && session.subjects.length > 0) {
        session.subjects.forEach(subject => {
          const secondsPerSubject = (session.elapsedTimeSeconds || 0) / session.subjects.length;
          subjectStats[subject] = (subjectStats[subject] || 0) + secondsPerSubject;
        });
      }
    });
    
    // Definir período anterior para comparações
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(startDate);
    
    if (periodFilter === 'semana') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
    } else if (periodFilter === 'mes') {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    } else if (periodFilter === 'ano') {
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
    } else {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    }
    
    // Filtrar sessões do período anterior
    const previousPeriodSessions = sessions.filter(session => {
      if (session.timestamp) {
        const date = new Date(session.timestamp);
        return date >= previousPeriodStart && date < startDate;
      }
      return false;
    });
    
    // Estatísticas do período anterior
    const previousTotalTimeInSeconds = previousPeriodSessions.reduce((total, session) => {
      return total + (session.elapsedTimeSeconds || 0);
    }, 0);
    
    // Calcular tendências (% de mudança)
    let timeChangePct = 0;
    if (previousTotalTimeInSeconds > 0) {
      timeChangePct = ((totalTimeInSeconds - previousTotalTimeInSeconds) / previousTotalTimeInSeconds) * 100;
    } else if (totalTimeInSeconds > 0) {
      timeChangePct = 100; // Aumento de 100% se não havia tempo anterior
    }
    
    return {
      totalTimeInSeconds,
      sessionsCount: filteredSessions.length,
      avgEfficiency,
      subjectStats,
      trends: {
        timeChangePct: Math.round(timeChangePct),
        sessionsCountChangePct: previousPeriodSessions.length > 0
          ? Math.round(((filteredSessions.length - previousPeriodSessions.length) / previousPeriodSessions.length) * 100)
          : (filteredSessions.length > 0 ? 100 : 0)
      },
      recentSessions: filteredSessions.slice(0, 5) // 5 sessões mais recentes
    };
  };

  // Carregar sessões inicialmente
  useEffect(() => {
    loadSessions();
  }, []);

  // Escutar eventos de atualização de sessões
  useEffect(() => {
    const handleSessionUpdate = () => {
      loadSessions();
    };

    document.addEventListener('flow-session-updated', handleSessionUpdate);
    
    return () => {
      document.removeEventListener('flow-session-updated', handleSessionUpdate);
    };
  }, []);

  return {
    sessions,
    loading,
    error,
    loadSessions,
    addSession,
    deleteSession,
    getStats
  };
};

export default useFlowSessions;

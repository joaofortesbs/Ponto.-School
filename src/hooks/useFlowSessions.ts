
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
      await SessionStorageService.saveSession(session);
      setSessions(prev => [session, ...prev]);
      return true;
    } catch (err) {
      console.error('Erro ao adicionar sessão:', err);
      return false;
    }
  };

  // Estatísticas relevantes
  const getStats = () => {
    // Sessões dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = sessions.filter(session => {
      if (session.timestamp) {
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= thirtyDaysAgo;
      }
      
      // Fallback para formato BR
      try {
        const parts = session.date.split(/[\/,]/);
        if (parts.length >= 2) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          const sessionDate = new Date(year, month, day);
          return sessionDate >= thirtyDaysAgo;
        }
      } catch (e) {}
      
      return false;
    });
    
    // Calcular tempo total em segundos
    const totalTimeInSeconds = recentSessions.reduce((total, session) => {
      return total + (session.elapsedTimeSeconds || 0);
    }, 0);
    
    // Calcular eficiência média
    const avgEfficiency = recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum, session) => sum + session.progress, 0) / recentSessions.length)
      : 0;
    
    // Estatísticas por disciplina
    const subjectStats: {[key: string]: number} = {};
    recentSessions.forEach(session => {
      session.subjects.forEach(subject => {
        const secondsPerSubject = (session.elapsedTimeSeconds || 0) / session.subjects.length;
        subjectStats[subject] = (subjectStats[subject] || 0) + secondsPerSubject;
      });
    });
    
    return {
      totalTimeInSeconds,
      sessionsCount: recentSessions.length,
      avgEfficiency,
      subjectStats
    };
  };

  // Sincronizar na primeira vez
  useEffect(() => {
    loadSessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    loadSessions,
    addSession,
    getStats
  };
};

export default useFlowSessions;

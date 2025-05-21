
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
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= startDate;
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
    
    // Tendências de estudo (comparação com período anterior)
    let previousPeriodSessions: any[] = [];
    
    // Definir período anterior
    if (periodFilter === 'semana' || !periodFilter) {
      // Sessões da semana anterior
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      previousPeriodSessions = sessions.filter(session => {
        const sessionDate = new Date(session.timestamp || session.date);
        return sessionDate >= twoWeeksAgo && sessionDate < oneWeekAgo;
      });
    } else if (periodFilter === 'mes') {
      // Sessões do mês anterior
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      previousPeriodSessions = sessions.filter(session => {
        const sessionDate = new Date(session.timestamp || session.date);
        return sessionDate >= twoMonthsAgo && sessionDate < oneMonthAgo;
      });
    } else if (periodFilter === 'ano') {
      // Sessões do ano anterior
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      previousPeriodSessions = sessions.filter(session => {
        const sessionDate = new Date(session.timestamp || session.date);
        return sessionDate >= twoYearsAgo && sessionDate < oneYearAgo;
      });
    }
    
    // Estatísticas do período anterior
    const previousTotalTimeInSeconds = previousPeriodSessions.reduce((total, session) => {
      return total + (session.elapsedTimeSeconds || 0);
    }, 0);
    
    const previousAvgEfficiency = previousPeriodSessions.length > 0
      ? Math.round(previousPeriodSessions.reduce((sum, session) => sum + (session.progress || 0), 0) / previousPeriodSessions.length)
      : 0;
    
    // Calcular tendências (% de mudança)
    const timeChangePct = previousTotalTimeInSeconds > 0 
      ? ((totalTimeInSeconds - previousTotalTimeInSeconds) / previousTotalTimeInSeconds) * 100 
      : 0;
    
    const efficiencyChangePct = previousAvgEfficiency > 0 
      ? ((avgEfficiency - previousAvgEfficiency) / previousAvgEfficiency) * 100 
      : 0;
    
    const sessionsCountChangePct = previousPeriodSessions.length > 0
      ? ((filteredSessions.length - previousPeriodSessions.length) / previousPeriodSessions.length) * 100
      : 0;
      
    // Adicionar dados sobre frequência de estudo
    const studyDays = new Set();
    filteredSessions.forEach(session => {
      const date = new Date(session.timestamp || session.date);
      studyDays.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
    });
    
    // Estatísticas adicionais sobre consistência
    const consistencyScore = Math.min(100, Math.round((studyDays.size / (periodFilter === 'semana' ? 7 : periodFilter === 'mes' ? 30 : 90)) * 100));
    
    return {
      totalTimeInSeconds,
      sessionsCount: filteredSessions.length,
      avgEfficiency,
      subjectStats,
      trends: {
        timeChangePct: Math.round(timeChangePct),
        efficiencyChangePct: Math.round(efficiencyChangePct),
        sessionsCountChangePct: Math.round(sessionsCountChangePct)
      },
      consistency: {
        studyDaysCount: studyDays.size,
        consistencyScore
      },
      recentSessions: filteredSessions.slice(0, 5) // 5 sessões mais recentes
    };
  };

  // Sincronizar na primeira vez e sempre que for solicitado explicitamente
  useEffect(() => {
    // Verificar se já existem sessões no localStorage
    const localData = localStorage.getItem('flowSessions');
    
    // Se não existir, inicializar com array vazio
    if (!localData) {
      localStorage.setItem('flowSessions', JSON.stringify([]));
    }
    
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

import { supabase } from './supabase';

export interface FlowSession {
  id: string | number;
  timestamp: number;
  date: string;
  duration: string;
  elapsedTimeSeconds: number;
  subjects: string[];
  progress: number;
  notes?: string;
  xp?: number;
  session_title?: string;
}

const STORAGE_KEY = 'flowSessions';

const SessionStorageService = {
  // Obter sessões do localStorage com fallback para supabase
  getSessions: async (): Promise<FlowSession[]> => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // Primeiro tentar carregar do localStorage
      const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      let sessions: FlowSession[] = localSessions ? JSON.parse(localSessions) : [];

      // Se o usuário estiver autenticado, tentar sincronizar com Supabase
      if (user) {
        try {
          const { data, error } = await supabase
            .from('flow_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (data && !error) {
            // Converter dados do Supabase para formato de FlowSession
            const remoteSessions: FlowSession[] = data.map(session => ({
              id: session.id,
              timestamp: new Date(session.date).getTime(),
              date: new Date(session.date).toLocaleDateString('pt-BR'),
              duration: session.duration_formatted,
              elapsedTimeSeconds: session.duration_seconds,
              subjects: session.subjects || [],
              progress: session.progress,
              notes: session.notes,
              xp: Math.floor(session.duration_seconds / 60),
              session_title: session.session_title || 'Sessão de estudo'
            }));

            // Mesclar sessões remotas com locais, mantendo as mais recentes
            const mergedSessions = [...remoteSessions];

            // Adicionar sessões locais que ainda não estão no Supabase
            sessions.forEach(localSession => {
              if (!remoteSessions.some(rs => rs.id === localSession.id)) {
                mergedSessions.push(localSession);
              }
            });

            // Ordenar por data (mais recente primeiro)
            mergedSessions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            // Atualizar localStorage com dados mesclados
            localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(mergedSessions));

            return mergedSessions;
          }
        } catch (error) {
          console.error('Erro ao sincronizar sessões com Supabase:', error);
        }
      }

      return sessions;
    } catch (error) {
      console.error('Erro ao obter sessões:', error);
      return [];
    }
  },

  // Salvar uma nova sessão
  saveSession: async (session: FlowSession): Promise<boolean> => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // Obter sessões existentes
      const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      const sessions: FlowSession[] = localSessions ? JSON.parse(localSessions) : [];

      // Adicionar nova sessão
      const updatedSessions = [session, ...sessions];

      // Salvar localmente
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updatedSessions));

      // Disparar evento para atualizar componentes
      document.dispatchEvent(new CustomEvent('flow-session-updated', { 
        detail: { userId, session } 
      }));

      // Se o usuário estiver autenticado, salvar no Supabase
      if (user) {
        try {
          const { error } = await supabase
            .from('flow_sessions')
            .insert({
              user_id: user.id,
              date: new Date(session.timestamp).toISOString(),
              duration_seconds: session.elapsedTimeSeconds,
              duration_formatted: session.duration,
              subjects: session.subjects,
              progress: session.progress,
              notes: session.notes || null,
              session_title: session.session_title || 'Sessão de estudo',
              created_at: new Date().toISOString()
            });

          if (error) {
            console.error('Erro ao salvar sessão no Supabase:', error);
          }
        } catch (error) {
          console.error('Erro ao salvar sessão no Supabase:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      return false;
    }
  },

  // Excluir uma sessão
  deleteSession: async (sessionId: string | number): Promise<boolean> => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // Obter sessões existentes
      const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      const sessions: FlowSession[] = localSessions ? JSON.parse(localSessions) : [];

      // Remover a sessão
      const updatedSessions = sessions.filter(s => s.id !== sessionId);

      // Salvar localmente
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updatedSessions));

      // Se o usuário estiver autenticado, excluir do Supabase
      if (user) {
        try {
          const { error } = await supabase
            .from('flow_sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', user.id);

          if (error) {
            console.error('Erro ao excluir sessão do Supabase:', error);
          }
        } catch (error) {
          console.error('Erro ao excluir sessão do Supabase:', error);
        }
      }

      // Disparar evento para atualizar componentes
      document.dispatchEvent(new CustomEvent('flow-session-updated', { 
        detail: { userId } 
      }));

      return true;
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      return false;
    }
  }
};

export default SessionStorageService;
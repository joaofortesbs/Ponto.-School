
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

      // Se o usuário estiver autenticado, tentar carregar do Supabase primeiro
      if (user) {
        try {
          const { data, error } = await supabase
            .from('flow_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (data && !error) {
            // Converter dados do Supabase para formato de FlowSession
            const remoteSessions: FlowSession[] = data.map(session => ({
              id: session.id,
              timestamp: new Date(session.start_time).getTime(),
              date: new Date(session.start_time).toLocaleDateString('pt-BR'),
              duration: session.duration_formatted,
              elapsedTimeSeconds: session.duration_seconds,
              subjects: session.subjects || [],
              progress: session.progress,
              notes: session.notes,
              xp: session.xp_earned || Math.floor(session.duration_seconds / 60),
              session_title: session.session_title || 'Sessão de estudo'
            }));

            // Verificar se existem sessões locais para migrar
            const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
            if (localSessions) {
              const parsedLocalSessions: FlowSession[] = JSON.parse(localSessions);
              
              // Migrar sessões locais que não existem no Supabase
              for (const localSession of parsedLocalSessions) {
                const existsInRemote = remoteSessions.some(rs => rs.timestamp === localSession.timestamp);
                if (!existsInRemote) {
                  await SessionStorageService.saveSession(localSession);
                }
              }
              
              // Limpar localStorage após migração
              localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
            }

            return remoteSessions;
          }
        } catch (error) {
          console.error('Erro ao sincronizar sessões com Supabase:', error);
        }
      }

      // Fallback para localStorage
      const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      return localSessions ? JSON.parse(localSessions) : [];
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

      // Se o usuário estiver autenticado, salvar no Supabase
      if (user) {
        try {
          const { error } = await supabase
            .from('flow_sessions')
            .insert({
              user_id: user.id,
              session_title: session.session_title || 'Sessão de estudo',
              start_time: new Date(session.timestamp).toISOString(),
              end_time: new Date(session.timestamp + (session.elapsedTimeSeconds * 1000)).toISOString(),
              duration_seconds: session.elapsedTimeSeconds,
              duration_formatted: session.duration,
              subjects: session.subjects,
              progress: session.progress,
              notes: session.notes || null,
              xp_earned: session.xp || Math.floor(session.elapsedTimeSeconds / 60),
              status: 'completed'
            });

          if (!error) {
            // Disparar evento para atualizar componentes
            document.dispatchEvent(new CustomEvent('flow-session-updated', { 
              detail: { userId, session } 
            }));
            return true;
          } else {
            console.error('Erro ao salvar sessão no Supabase:', error);
          }
        } catch (error) {
          console.error('Erro ao salvar sessão no Supabase:', error);
        }
      }

      // Fallback para localStorage se não autenticado ou erro no Supabase
      const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      const sessions: FlowSession[] = localSessions ? JSON.parse(localSessions) : [];
      const updatedSessions = [session, ...sessions];
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updatedSessions));

      // Disparar evento para atualizar componentes
      document.dispatchEvent(new CustomEvent('flow-session-updated', { 
        detail: { userId, session } 
      }));

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

      // Se o usuário estiver autenticado, excluir do Supabase
      if (user) {
        try {
          const { error } = await supabase
            .from('flow_sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', user.id);

          if (!error) {
            // Disparar evento para atualizar componentes
            document.dispatchEvent(new CustomEvent('flow-session-updated', { 
              detail: { userId } 
            }));
            return true;
          } else {
            console.error('Erro ao excluir sessão do Supabase:', error);
          }
        } catch (error) {
          console.error('Erro ao excluir sessão do Supabase:', error);
        }
      }

      // Fallback para localStorage
      const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      const sessions: FlowSession[] = localSessions ? JSON.parse(localSessions) : [];
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updatedSessions));

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

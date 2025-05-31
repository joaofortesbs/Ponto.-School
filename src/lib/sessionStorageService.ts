
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
  // Obter sessões do Supabase com fallback para localStorage
  getSessions: async (): Promise<FlowSession[]> => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Se usuário autenticado, buscar do Supabase
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
            xp: session.xp_earned,
            session_title: session.session_title || 'Sessão de estudo'
          }));

          // Sincronizar com localStorage
          localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(remoteSessions));
          
          return remoteSessions;
        } else {
          console.error('Erro ao buscar sessões do Supabase:', error);
        }
      }

      // Fallback para localStorage se não autenticado ou erro
      const userId = user?.id || 'anonymous';
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

      // Salvar localmente primeiro
      const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      const sessions: FlowSession[] = localSessions ? JSON.parse(localSessions) : [];
      const updatedSessions = [session, ...sessions];
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updatedSessions));

      // Se usuário autenticado, salvar no Supabase
      if (user) {
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

        if (error) {
          console.error('Erro ao salvar sessão no Supabase:', error);
          // Mesmo com erro no Supabase, mantemos salvo localmente
        }
      }

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

      // Remover localmente
      const localSessions = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      const sessions: FlowSession[] = localSessions ? JSON.parse(localSessions) : [];
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updatedSessions));

      // Se usuário autenticado, excluir do Supabase
      if (user) {
        const { error } = await supabase
          .from('flow_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', user.id);

        if (error) {
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
